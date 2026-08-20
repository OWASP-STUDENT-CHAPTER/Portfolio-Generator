import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { APP_CONFIG, isEmailDomainAllowed, isAdminEmail, generateSuggestedUsername } from '@/lib/config';
import { getRandomTemplate } from '@/templates/registry-helper';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login/error',
  },
  providers: [
    // 1. Production Google OAuth Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || '',
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
      async profile(profile, tokens) {
        let photoUrl = profile.picture || null;
        let isDefault = false;
        let etag: string | null = null;

        // Fetch official photo metadata from Google People API with access token
        if (tokens?.access_token) {
          try {
            const peopleRes = await fetch('https://people.googleapis.com/v1/people/me?personFields=photos', {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            });
            if (peopleRes.ok) {
              const peopleData = await peopleRes.json();
              etag = peopleData.etag || null;
              const primaryPhoto = peopleData.photos?.find((p: any) => p.metadata?.primary) || peopleData.photos?.[0];
              if (primaryPhoto) {
                photoUrl = primaryPhoto.url || photoUrl;
                // Google People API explicitly returns default: true for generated placeholder/letter avatar
                isDefault = primaryPhoto.default === true || primaryPhoto.metadata?.source?.type === 'DEFAULT';
              }
            }
          } catch (err) {
            console.warn('[Auth] Error fetching Google People API photos:', err);
          }
        }

        // Fallback pattern detection for default generated avatars
        if (!isDefault && photoUrl) {
          if (photoUrl.includes('default-user') || photoUrl.includes('api.dicebear.com')) {
            isDefault = true;
          }
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: photoUrl,
          googlePhotoUrl: photoUrl,
          googlePhotoIsDefault: isDefault,
          googlePhotoEtag: etag,
        } as any;
      },
    }),

    // 2. Dev / Testing Provider
    Credentials({
      id: 'credentials',
      name: 'Dev Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        name: { label: 'Display Name', type: 'text', placeholder: 'Alex Rivers' },
        profileImage: { label: 'Avatar URL', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = String(credentials.email).trim().toLowerCase();
        
        // Strict domain verification
        if (!isEmailDomainAllowed(email)) {
          console.warn(`[Auth Rejection] Non-allowed domain attempted sign in: ${email}`);
          return null;
        }

        const name = credentials.name ? String(credentials.name) : email.split('@')[0];
        const profileImage = credentials.profileImage
          ? String(credentials.profileImage)
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
        const isDefault = !credentials.profileImage || profileImage.includes('dicebear') || profileImage.includes('default-user');

        // Upsert user in database
        let user = await prisma.user.findUnique({
          where: { email },
          include: { website: true },
        });

        const role = isAdminEmail(email) ? 'ADMIN' : 'USER';
        const photoStatus = isDefault ? 'NOT_REQUIRED' : 'PENDING';

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name,
              profileImage,
              role,
              googlePhotoUrl: profileImage,
              googlePhotoIsDefault: isDefault,
              photoModerationStatus: photoStatus,
              lastLoginAt: new Date(),
            },
            include: { website: true },
          });

          // Auto-create initial website with a randomly assigned template
          const { checkLocalProfanity } = await import('@/lib/moderation');
          let suggestedUsername = generateSuggestedUsername(name, email);
          if (!checkLocalProfanity(suggestedUsername).isSafe || APP_CONFIG.reservedUsernames.includes(suggestedUsername)) {
            suggestedUsername = `user-${Math.floor(1000 + Math.random() * 9000)}`;
          }

          let uniqueUsername = suggestedUsername;
          let counter = 1;
          
          while (await prisma.website.findUnique({ where: { username: uniqueUsername } })) {
            uniqueUsername = `${suggestedUsername}-${counter++}`;
          }

          const initialTemplate = getRandomTemplate();

          await prisma.website.create({
            data: {
              username: uniqueUsername,
              templateId: initialTemplate.id,
              published: true,
              userId: user.id,
              profile: {
                create: {
                  headline: `Software Developer & Creator`,
                  bio: `Welcome to my personal portfolio website!`,
                  location: '',
                  avatarUrl: isDefault ? profileImage : null,
                },
              },
              skills: {
                create: [
                  { name: 'TypeScript', category: 'Languages', order: 0 },
                  { name: 'React / Next.js', category: 'Frameworks', order: 1 },
                  { name: 'Problem Solving', category: 'Skills', order: 2 },
                ],
              },
              educations: {
                create: [
                  {
                    institution: 'University / Institute',
                    degree: 'Bachelor of Science (B.S.)',
                    field: 'Computer Science',
                    startDate: '2022',
                    endDate: '2026',
                    current: true,
                    order: 0,
                  },
                ],
              },
            },
          });
        } else {
          // Update lastLoginAt
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.profileImage,
          googlePhotoUrl: user.googlePhotoUrl || profileImage,
          googlePhotoIsDefault: user.googlePhotoIsDefault,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    // 3. User verification and setup in OAuth callback
    async signIn({ user, profile }) {
      const email = user.email || profile?.email;
      
      if (!email) {
        return false;
      }

      // Ensure user record in DB has updated lastLoginAt, Google photo metadata, and status
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { website: { include: { profile: true } } },
        });

        const customUser = user as any;
        const incomingPhotoUrl = customUser.googlePhotoUrl || user.image || null;
        const incomingIsDefault = customUser.googlePhotoIsDefault ?? (incomingPhotoUrl?.includes('default-user') || incomingPhotoUrl?.includes('dicebear'));
        const incomingEtag = customUser.googlePhotoEtag || null;

        if (existingUser) {
          const photoChanged = incomingPhotoUrl && incomingPhotoUrl !== existingUser.googlePhotoUrl;
          let newStatus = existingUser.photoModerationStatus;
          let profileAvatarUrl = existingUser.website?.profile?.avatarUrl;

          if (incomingIsDefault) {
            newStatus = 'NOT_REQUIRED';
            profileAvatarUrl = incomingPhotoUrl;
          } else if (photoChanged) {
            if (incomingPhotoUrl === existingUser.lastApprovedPhotoUrl) {
              newStatus = 'APPROVED';
              profileAvatarUrl = incomingPhotoUrl;
            } else {
              // New/changed real photo -> PENDING moderation
              // CRITICAL: Preserve previous approved photo for public website
              newStatus = 'PENDING';
              profileAvatarUrl = existingUser.lastApprovedPhotoUrl || null;
            }
          }

          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              lastLoginAt: new Date(),
              name: user.name || existingUser.name,
              profileImage: incomingPhotoUrl || existingUser.profileImage,
              googlePhotoUrl: incomingPhotoUrl,
              googlePhotoIsDefault: incomingIsDefault,
              googlePhotoEtag: incomingEtag || existingUser.googlePhotoEtag,
              photoModerationStatus: newStatus,
            },
          });

          if (existingUser.website?.profile && profileAvatarUrl !== undefined && existingUser.website.profile.avatarUrl !== profileAvatarUrl) {
            await prisma.profile.update({
              where: { id: existingUser.website.profile.id },
              data: { avatarUrl: profileAvatarUrl },
            });
          }
        }
      } catch (err) {
        console.error('Error updating user login status:', err);
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const customUser = user as { role?: string; email?: string };
        token.role = customUser.role || (isAdminEmail(user.email) ? 'ADMIN' : 'USER');
      }

      // Allow trigger update
      if (trigger === 'update' && session) {
        token.name = session.name || token.name;
        token.image = session.image || token.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        const customSession = session.user as { id: string; role?: string };
        customSession.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-assign random template and create initial website when user is created via OAuth
      try {
        const email = user.email?.toLowerCase();
        const userId = user.id;
        if (!email || !userId) return;

        const role = isAdminEmail(email) ? 'ADMIN' : 'USER';
        const customUser = user as any;
        const incomingPhotoUrl = customUser.googlePhotoUrl || user.image || null;
        const isDefault = customUser.googlePhotoIsDefault ?? (incomingPhotoUrl?.includes('default-user') || incomingPhotoUrl?.includes('dicebear'));
        const photoStatus = isDefault ? 'NOT_REQUIRED' : 'PENDING';
        const initialAvatarUrl = isDefault ? incomingPhotoUrl : null;

        const { checkLocalProfanity } = await import('@/lib/moderation');
        let suggestedUsername = generateSuggestedUsername(user.name, email);
        if (!checkLocalProfanity(suggestedUsername).isSafe || APP_CONFIG.reservedUsernames.includes(suggestedUsername)) {
          suggestedUsername = `user-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        
        let uniqueUsername = suggestedUsername;
        let counter = 1;
        while (await prisma.website.findUnique({ where: { username: uniqueUsername } })) {
          uniqueUsername = `${suggestedUsername}-${counter++}`;
        }

        const initialTemplate = getRandomTemplate();

        await prisma.user.update({
          where: { id: userId },
          data: {
            role,
            googlePhotoUrl: incomingPhotoUrl,
            googlePhotoIsDefault: isDefault,
            photoModerationStatus: photoStatus,
          },
        });

        await prisma.website.create({
          data: {
            username: uniqueUsername,
            templateId: initialTemplate.id,
            published: true,
            userId: userId,
            profile: {
              create: {
                headline: `Software Developer & Creator`,
                bio: `Welcome to my personal portfolio website!`,
                location: '',
                avatarUrl: initialAvatarUrl,
              },
            },
            skills: {
              create: [
                { name: 'TypeScript', category: 'Languages', order: 0 },
                { name: 'Problem Solving', category: 'Skills', order: 1 },
              ],
            },
            educations: {
              create: [
                {
                  institution: 'University / Institute',
                  degree: 'Bachelor of Science (B.S.)',
                  field: 'Computer Science',
                  startDate: '2022',
                  endDate: '2026',
                  current: true,
                  order: 0,
                },
              ],
            },
          },
        });
      } catch (err) {
        console.error('Error creating default website for user:', err);
      }
    },
  },
});
