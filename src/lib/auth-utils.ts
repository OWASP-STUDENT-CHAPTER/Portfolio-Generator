import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { isAdminEmail, generateSuggestedUsername } from '@/lib/config';
import { getRandomTemplate } from '@/templates/registry-helper';

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.email) return null;

  const email = session.user.email.toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email },
    include: {
      website: {
        include: {
          profile: true,
          projects: { orderBy: { order: 'asc' } },
          experiences: { orderBy: { order: 'asc' } },
          educations: { orderBy: { order: 'asc' } },
          skills: { orderBy: { order: 'asc' } },
          socialLinks: { orderBy: { order: 'asc' } },
          customSections: { orderBy: { order: 'asc' } },
        },
      },
    },
  });

  // If user does not exist in database, create user and initial website
  if (!user) {
    const role = isAdminEmail(email) ? 'ADMIN' : 'USER';
    const name = session.user.name || email.split('@')[0];
    const profileImage = session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    const suggestedUsername = generateSuggestedUsername(name, email);
    let username = suggestedUsername;
    let counter = 1;
    while (await prisma.website.findUnique({ where: { username } })) {
      username = `${suggestedUsername}-${counter++}`;
    }

    const initialTemplate = getRandomTemplate();

    try {
      user = await prisma.user.create({
        data: {
          email,
          name,
          profileImage,
          role,
          lastLoginAt: new Date(),
          website: {
            create: {
              username,
              templateId: initialTemplate.id,
              published: true,
              profile: {
                create: {
                  headline: `${name} | Portfolio`,
                  bio: 'Welcome to my personal website.',
                  location: 'Patiala, Punjab, India',
                  avatarUrl: profileImage,
                },
              },
              skills: {
                create: [
                  { name: 'Computer Science', category: 'Domains', order: 0 },
                  { name: 'Python', category: 'Languages', order: 1 },
                  { name: 'Problem Solving', category: 'Skills', order: 2 },
                ],
              },
              educations: {
                create: [
                  {
                    institution: 'Thapar Institute of Engineering and Technology (TIET)',
                    degree: 'Bachelor of Engineering (B.E.)',
                    field: 'Computer Engineering',
                    startDate: '2022',
                    endDate: '2026',
                    current: true,
                    order: 0,
                  },
                ],
              },
            },
          },
        },
        include: {
          website: {
            include: {
              profile: true,
              projects: { orderBy: { order: 'asc' } },
              experiences: { orderBy: { order: 'asc' } },
              educations: { orderBy: { order: 'asc' } },
              skills: { orderBy: { order: 'asc' } },
              socialLinks: { orderBy: { order: 'asc' } },
              customSections: { orderBy: { order: 'asc' } },
            },
          },
        },
      });
    } catch {
      // If user was created in parallel
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          website: {
            include: {
              profile: true,
              projects: { orderBy: { order: 'asc' } },
              experiences: { orderBy: { order: 'asc' } },
              educations: { orderBy: { order: 'asc' } },
              skills: { orderBy: { order: 'asc' } },
              socialLinks: { orderBy: { order: 'asc' } },
              customSections: { orderBy: { order: 'asc' } },
            },
          },
        },
      });
    }
  } else if (user && !user.website) {
    // If user exists but website does not
    const name = user.name || session.user.name || email.split('@')[0];
    const suggestedUsername = generateSuggestedUsername(name, email);
    let username = suggestedUsername;
    let counter = 1;
    while (await prisma.website.findUnique({ where: { username } })) {
      username = `${suggestedUsername}-${counter++}`;
    }
    const initialTemplate = getRandomTemplate();

    try {
      await prisma.website.create({
        data: {
          userId: user.id,
          username,
          templateId: initialTemplate.id,
          published: true,
          profile: {
            create: {
              headline: `${name} | Portfolio`,
              bio: 'Welcome to my personal portfolio website.',
              location: 'Patiala, Punjab, India',
              avatarUrl: user.profileImage || user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            },
          },
          skills: {
            create: [
              { name: 'Computer Science', category: 'Domains', order: 0 },
              { name: 'Python', category: 'Languages', order: 1 },
            ],
          },
        },
      });

      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          website: {
            include: {
              profile: true,
              projects: { orderBy: { order: 'asc' } },
              experiences: { orderBy: { order: 'asc' } },
              educations: { orderBy: { order: 'asc' } },
              skills: { orderBy: { order: 'asc' } },
              socialLinks: { orderBy: { order: 'asc' } },
              customSections: { orderBy: { order: 'asc' } },
            },
          },
        },
      });
    } catch (e) {
      console.error('Error creating missing website for user:', e);
    }
  }

  return user;
});

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  return user;
}
