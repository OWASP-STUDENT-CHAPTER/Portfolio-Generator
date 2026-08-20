'use server';

import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { APP_CONFIG } from '@/lib/config';
import { revalidatePath } from 'next/cache';
import { profileSchema, projectSchema, experienceSchema, educationSchema, aiImportSchema } from '@/lib/validations';
import { TEMPLATE_REGISTRY } from '@/templates/registry';
import { TemplateCategory } from '@/templates/types';
import {
  moderateWebsiteForPublish,
  validateDraftContentLocally,
  checkLocalProfanity,
} from '@/lib/moderation';

// Helper to get website with ownership check
async function getUserWebsite(userId: string) {
  let website = await prisma.website.findUnique({
    where: { userId },
  });
  if (!website) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const baseName = (user?.name || user?.email?.split('@')[0] || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20) || 'user';
    
    let username = baseName;
    let suffix = 1;
    while (await prisma.website.findUnique({ where: { username } })) {
      username = `${baseName}${suffix++}`;
    }

    website = await prisma.website.create({
      data: {
        userId,
        username,
        templateId: 'minimal',
        published: true,
        profile: {
          create: {
            headline: user?.name ? `${user.name} | Portfolio` : 'Software Developer',
            bio: 'Welcome to my personal portfolio website.',
            location: 'Patiala, Punjab, India',
          },
        },
      },
    });
  }
  return website;
}

/**
 * Updates Profile information (headline, bio, location, resumeUrl)
 * Profile photo is strictly derived from Google OAuth identity and cannot be manually overridden.
 */
export async function updateProfile(data: {
  headline?: string;
  bio?: string;
  location?: string;
  resumeUrl?: string;
}) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  const validated = profileSchema.parse(data);

  // Layer 1 Local Check during draft edit
  const localCheck = validateDraftContentLocally({
    headline: validated.headline,
    bio: validated.bio,
    location: validated.location,
    resumeUrl: validated.resumeUrl,
  });
  if (!localCheck.isSafe) {
    return {
      success: false,
      error: localCheck.error || 'Some content contains prohibited language.',
    };
  }

  // Derive initial avatar from user if profile does not exist yet
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const defaultAvatar = dbUser?.googlePhotoIsDefault ? dbUser.googlePhotoUrl : (dbUser?.lastApprovedPhotoUrl || null);

  await prisma.profile.upsert({
    where: { websiteId: website.id },
    create: {
      websiteId: website.id,
      headline: validated.headline || null,
      bio: validated.bio || null,
      location: validated.location || null,
      avatarUrl: defaultAvatar,
      resumeUrl: validated.resumeUrl || null,
    },
    update: {
      headline: validated.headline || null,
      bio: validated.bio || null,
      location: validated.location || null,
      resumeUrl: validated.resumeUrl || null,
    },
  });

  // If website is already live on the public domain, re-verify publish state
  if (website.published) {
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/profile');
      revalidatePath('/dashboard/settings');
      return {
        success: true,
        published: false,
        unpublishWarning: true,
        error: modResult.error || 'Your changes contain content that cannot be published. Profile saved as draft.',
      };
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/profile');
  return { success: true, published: website.published };
}

/**
 * On-demand sync of profile photo from the authenticated Google account
 * - Detects default vs custom photo
 * - If default -> set NOT_REQUIRED, updates active avatar immediately
 * - If real photo -> sets PENDING, preserves last approved photo
 */
export async function syncGoogleProfilePhoto() {
  const user = await requireAuth();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      accounts: true,
      website: { include: { profile: true } },
    },
  });

  if (!dbUser) {
    return { success: false, error: 'User not found' };
  }

  const googleAccount = dbUser.accounts.find((a) => a.provider === 'google');
  let photoUrl = dbUser.profileImage || dbUser.googlePhotoUrl || null;
  let isDefault = dbUser.googlePhotoIsDefault;
  let etag = dbUser.googlePhotoEtag;

  if (googleAccount?.access_token) {
    try {
      const peopleRes = await fetch('https://people.googleapis.com/v1/people/me?personFields=photos', {
        headers: {
          Authorization: `Bearer ${googleAccount.access_token}`,
        },
      });
      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        etag = peopleData.etag || etag;
        const primaryPhoto = peopleData.photos?.find((p: any) => p.metadata?.primary) || peopleData.photos?.[0];
        if (primaryPhoto) {
          photoUrl = primaryPhoto.url || photoUrl;
          isDefault = primaryPhoto.default === true || primaryPhoto.metadata?.source?.type === 'DEFAULT';
        }
      }
    } catch (err) {
      console.warn('[Sync] Error querying Google People API:', err);
    }
  }

  if (photoUrl && (photoUrl.includes('default-user') || photoUrl.includes('dicebear'))) {
    isDefault = true;
  }

  const photoChanged = photoUrl !== dbUser.googlePhotoUrl;
  let newStatus = dbUser.photoModerationStatus;
  let activeAvatarUrl = dbUser.website?.profile?.avatarUrl || null;

  if (isDefault) {
    newStatus = 'NOT_REQUIRED';
    activeAvatarUrl = photoUrl;
  } else if (photoChanged) {
    if (photoUrl === dbUser.lastApprovedPhotoUrl) {
      newStatus = 'APPROVED';
      activeAvatarUrl = photoUrl;
    } else {
      newStatus = 'PENDING';
      // Preserve last approved photo for public website
      activeAvatarUrl = dbUser.lastApprovedPhotoUrl || null;
    }
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      googlePhotoUrl: photoUrl,
      googlePhotoIsDefault: isDefault,
      googlePhotoEtag: etag,
      photoModerationStatus: newStatus,
      profileImage: photoUrl || dbUser.profileImage,
    },
  });

  if (dbUser.website?.profile && activeAvatarUrl !== undefined && dbUser.website.profile.avatarUrl !== activeAvatarUrl) {
    await prisma.profile.update({
      where: { id: dbUser.website.profile.id },
      data: { avatarUrl: activeAvatarUrl },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/profile');

  return {
    success: true,
    photoUrl,
    isDefault,
    moderationStatus: newStatus,
    activeAvatarUrl,
  };
}

/**
 * Creates or updates a Project
 */
export async function saveProject(data: {
  id?: string;
  title: string;
  description?: string;
  tags?: string;
  liveUrl?: string;
  sourceUrl?: string;
  order?: number;
}) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);
  const validated = projectSchema.parse(data);

  // Layer 1 Local Check
  const localCheck = validateDraftContentLocally({
    title: validated.title,
    description: validated.description,
    tags: validated.tags,
  });
  if (!localCheck.isSafe) {
    return {
      success: false,
      error: localCheck.error || 'Some project content contains prohibited language.',
    };
  }

  if (validated.id) {
    // Ownership check
    const existing = await prisma.project.findFirst({
      where: { id: validated.id, websiteId: website.id },
    });
    if (!existing) return { success: false, error: 'Project not found or unauthorized' };

    await prisma.project.update({
      where: { id: validated.id },
      data: {
        title: validated.title,
        description: validated.description || null,
        tags: validated.tags || '',
        liveUrl: validated.liveUrl || null,
        sourceUrl: validated.sourceUrl || null,
        order: validated.order,
      },
    });
  } else {
    await prisma.project.create({
      data: {
        websiteId: website.id,
        title: validated.title,
        description: validated.description || null,
        tags: validated.tags || '',
        liveUrl: validated.liveUrl || null,
        sourceUrl: validated.sourceUrl || null,
        order: validated.order,
      },
    });
  }

  // If website is live, run publish gate
  if (website.published) {
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/projects');
      revalidatePath('/dashboard/settings');
      return {
        success: true,
        published: false,
        unpublishWarning: true,
        error: modResult.error || 'Your project contains content that cannot be published. Saved as draft.',
      };
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/projects');
  return { success: true, published: website.published };
}

/**
 * Deletes a Project
 */
export async function deleteProject(projectId: string) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  await prisma.project.deleteMany({
    where: { id: projectId, websiteId: website.id },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/projects');
  return { success: true };
}

/**
 * Creates or updates an Experience
 */
export async function saveExperience(data: {
  id?: string;
  company: string;
  role: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  order?: number;
}) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);
  const validated = experienceSchema.parse(data);

  // Layer 1 Local Check
  const localCheck = validateDraftContentLocally({
    company: validated.company,
    role: validated.role,
    description: validated.description,
  });
  if (!localCheck.isSafe) {
    return {
      success: false,
      error: localCheck.error || 'Some experience content contains prohibited language.',
    };
  }

  if (validated.id) {
    const existing = await prisma.experience.findFirst({
      where: { id: validated.id, websiteId: website.id },
    });
    if (!existing) return { success: false, error: 'Experience not found or unauthorized' };

    await prisma.experience.update({
      where: { id: validated.id },
      data: {
        company: validated.company,
        role: validated.role,
        description: validated.description || null,
        startDate: validated.startDate || null,
        endDate: validated.endDate || null,
        current: validated.current,
        order: validated.order,
      },
    });
  } else {
    await prisma.experience.create({
      data: {
        websiteId: website.id,
        company: validated.company,
        role: validated.role,
        description: validated.description || null,
        startDate: validated.startDate || null,
        endDate: validated.endDate || null,
        current: validated.current,
        order: validated.order,
      },
    });
  }

  // If website is live, run publish gate
  if (website.published) {
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/experience');
      revalidatePath('/dashboard/settings');
      return {
        success: true,
        published: false,
        unpublishWarning: true,
        error: modResult.error || 'Your experience contains content that cannot be published. Saved as draft.',
      };
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/experience');
  return { success: true, published: website.published };
}

/**
 * Deletes an Experience
 */
export async function deleteExperience(expId: string) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  await prisma.experience.deleteMany({
    where: { id: expId, websiteId: website.id },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/experience');
  return { success: true };
}

/**
 * Creates or updates an Education entry
 */
export async function saveEducation(data: {
  id?: string;
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  order?: number;
}) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);
  const validated = educationSchema.parse(data);

  // Layer 1 Local Check
  const localCheck = validateDraftContentLocally({
    institution: validated.institution,
    degree: validated.degree,
    field: validated.field,
  });
  if (!localCheck.isSafe) {
    return {
      success: false,
      error: localCheck.error || 'Some education content contains prohibited language.',
    };
  }

  if (validated.id) {
    const existing = await prisma.education.findFirst({
      where: { id: validated.id, websiteId: website.id },
    });
    if (!existing) return { success: false, error: 'Education not found or unauthorized' };

    await prisma.education.update({
      where: { id: validated.id },
      data: {
        institution: validated.institution,
        degree: validated.degree || null,
        field: validated.field || null,
        startDate: validated.startDate || null,
        endDate: validated.endDate || null,
        current: validated.current,
        gpa: validated.gpa || null,
        order: validated.order,
      },
    });
  } else {
    await prisma.education.create({
      data: {
        websiteId: website.id,
        institution: validated.institution,
        degree: validated.degree || null,
        field: validated.field || null,
        startDate: validated.startDate || null,
        endDate: validated.endDate || null,
        current: validated.current,
        gpa: validated.gpa || null,
        order: validated.order,
      },
    });
  }

  // If website is live, run publish gate
  if (website.published) {
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/education');
      revalidatePath('/dashboard/settings');
      return {
        success: true,
        published: false,
        unpublishWarning: true,
        error: modResult.error || 'Your education entry contains content that cannot be published. Saved as draft.',
      };
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/education');
  return { success: true, published: website.published };
}

/**
 * Deletes an Education entry
 */
export async function deleteEducation(eduId: string) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  await prisma.education.deleteMany({
    where: { id: eduId, websiteId: website.id },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/education');
  return { success: true };
}

/**
 * Replaces all skills
 */
export async function updateSkills(skillsList: Array<{ name: string; category?: string }>) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  // Layer 1 Local Check on skills
  for (const s of skillsList) {
    const localCheck = validateDraftContentLocally({
      name: s.name,
      category: s.category,
    });
    if (!localCheck.isSafe) {
      return {
        success: false,
        error: localCheck.error || 'Some skill names contain prohibited language.',
      };
    }
  }

  await prisma.skill.deleteMany({
    where: { websiteId: website.id },
  });

  if (skillsList.length > 0) {
    await prisma.skill.createMany({
      data: skillsList.map((s, idx) => ({
        websiteId: website.id,
        name: s.name.trim(),
        category: s.category?.trim() || null,
        order: idx,
      })),
    });
  }

  // If website is live, run publish gate
  if (website.published) {
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/skills');
      revalidatePath('/dashboard/settings');
      return {
        success: true,
        published: false,
        unpublishWarning: true,
        error: modResult.error || 'Your skills contain content that cannot be published. Saved as draft.',
      };
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/skills');
  return { success: true, published: website.published };
}

/**
 * Replaces all social links
 */
export async function updateSocialLinks(links: Array<{ platform: string; url: string }>) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  // Layer 1 Local Check on links
  for (const l of links) {
    const localCheck = validateDraftContentLocally({
      platform: l.platform,
      url: l.url,
    });
    if (!localCheck.isSafe) {
      return {
        success: false,
        error: localCheck.error || 'Some social links contain prohibited text.',
      };
    }
  }

  await prisma.socialLink.deleteMany({
    where: { websiteId: website.id },
  });

  if (links.length > 0) {
    await prisma.socialLink.createMany({
      data: links.map((l, idx) => ({
        websiteId: website.id,
        platform: l.platform.trim(),
        url: l.url.trim(),
        order: idx,
      })),
    });
  }

  // If website is live, run publish gate
  if (website.published) {
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/social');
      revalidatePath('/dashboard/settings');
      return {
        success: true,
        published: false,
        unpublishWarning: true,
        error: modResult.error || 'Your links contain content that cannot be published. Saved as draft.',
      };
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/social');
  return { success: true, published: website.published };
}

/**
 * Changes the active template
 */
export async function changeTemplate(templateId: string) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  if (!(templateId in TEMPLATE_REGISTRY)) {
    return { success: false, error: 'Invalid template identifier' };
  }

  await prisma.website.update({
    where: { id: website.id },
    data: { templateId: templateId as TemplateCategory },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/templates');
  return { success: true };
}

export async function updateTemplate(templateId: string) {
  return changeTemplate(templateId);
}

/**
 * Changes username / subdomain with guaranteed collision prevention and local profanity check
 */
export async function changeUsername(newUsername: string) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  const sanitized = newUsername.trim().toLowerCase();
  
  if (!APP_CONFIG.username.regex.test(sanitized)) {
    return {
      success: false,
      error: 'Username can only contain lowercase letters, numbers, and hyphens (min 3, max 30 chars).',
    };
  }

  // Local profanity check on chosen username
  const profanityCheck = checkLocalProfanity(sanitized);
  if (!profanityCheck.isSafe) {
    return {
      success: false,
      error: 'The chosen username is not permitted.',
    };
  }

  // Check reserved platform keywords
  if (APP_CONFIG.reservedUsernames.includes(sanitized)) {
    return {
      success: false,
      error: `The username "${sanitized}" is reserved for platform use.`,
    };
  }

  const reservedInDb = await prisma.reservedUsername.findUnique({
    where: { username: sanitized },
  });
  if (reservedInDb) {
    return {
      success: false,
      error: `The username "${sanitized}" is reserved.`,
    };
  }

  // Strict collision check in database
  const existing = await prisma.website.findFirst({
    where: {
      username: { equals: sanitized, mode: 'insensitive' },
    },
    select: { id: true, userId: true },
  });

  if (existing && existing.id !== website.id) {
    return {
      success: false,
      error: `"${sanitized}" is already claimed by another user.`,
    };
  }

  try {
    await prisma.website.update({
      where: { id: website.id },
      data: { username: sanitized },
    });
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
      return {
        success: false,
        error: `"${sanitized}" was just claimed by another user. Please choose another identifier.`,
      };
    }
    return {
      success: false,
      error: 'Failed to update username.',
    };
  }

  // If website is live, re-verify with new username
  if (website.published) {
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/settings');
      return {
        success: true,
        username: sanitized,
        published: false,
        unpublishWarning: true,
        error: modResult.error || 'Username update caused publication rejection. Saved as draft.',
      };
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
  return { success: true, username: sanitized, published: website.published };
}

/**
 * Toggles published status through the Authoritative Publish Moderation Gate
 */
export async function togglePublish(published: boolean) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  if (published) {
    // 1. Publish Gate: Run complete Layer 1 (Veil) -> Cache -> Layer 2 (Hive)
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      revalidatePath('/dashboard/settings');
      return {
        success: false,
        published: false,
        error:
          modResult.error || 'Your website contains content that cannot be published. Please review your content and try again.',
      };
    }

    await prisma.website.update({
      where: { id: website.id },
      data: { published: true },
    });
  } else {
    // Unpublish
    await prisma.website.update({
      where: { id: website.id },
      data: { published: false },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
  return { success: true, published };
}

/**
 * Imports structured AI content into the website
 */
export async function importAIContent(rawJson: string) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return {
      success: false,
      error: 'Invalid JSON format. Please paste valid JSON output from the AI model.',
    };
  }

  const validated = aiImportSchema.parse(parsed);

  // Local moderation on all imported strings
  const localCheck = validateDraftContentLocally({
    headline: validated.headline,
    bio: validated.bio,
    location: validated.location,
  });
  if (!localCheck.isSafe) {
    return {
      success: false,
      error: localCheck.error || 'Imported content contains prohibited language.',
    };
  }

  // Update profile
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const defaultAvatar = dbUser?.googlePhotoIsDefault ? dbUser.googlePhotoUrl : (dbUser?.lastApprovedPhotoUrl || null);

  await prisma.profile.upsert({
    where: { websiteId: website.id },
    create: {
      websiteId: website.id,
      headline: validated.headline || null,
      bio: validated.bio || null,
      location: validated.location || null,
      avatarUrl: defaultAvatar,
    },
    update: {
      headline: validated.headline || null,
      bio: validated.bio || null,
      location: validated.location || null,
    },
  });

  // Projects
  if (validated.projects && validated.projects.length > 0) {
    await prisma.project.deleteMany({ where: { websiteId: website.id } });
    await prisma.project.createMany({
      data: validated.projects.map((p, idx) => ({
        websiteId: website.id,
        title: p.title,
        description: p.description || null,
        tags: p.tags || '',
        liveUrl: p.liveUrl || null,
        sourceUrl: p.sourceUrl || null,
        order: idx,
      })),
    });
  }

  // Experiences
  if (validated.experiences && validated.experiences.length > 0) {
    await prisma.experience.deleteMany({ where: { websiteId: website.id } });
    await prisma.experience.createMany({
      data: validated.experiences.map((exp, idx) => ({
        websiteId: website.id,
        company: exp.company,
        role: exp.role,
        description: exp.description || null,
        startDate: exp.startDate || null,
        endDate: exp.endDate || null,
        current: exp.current || false,
        order: idx,
      })),
    });
  }

  // Educations
  if (validated.educations && validated.educations.length > 0) {
    await prisma.education.deleteMany({ where: { websiteId: website.id } });
    await prisma.education.createMany({
      data: validated.educations.map((edu, idx) => ({
        websiteId: website.id,
        institution: edu.institution,
        degree: edu.degree || null,
        field: edu.field || null,
        startDate: edu.startDate || null,
        endDate: edu.endDate || null,
        gpa: edu.gpa || null,
        order: idx,
      })),
    });
  }

  // Skills
  if (validated.skills && validated.skills.length > 0) {
    await prisma.skill.deleteMany({ where: { websiteId: website.id } });
    await prisma.skill.createMany({
      data: validated.skills.map((s, idx) => {
        if (typeof s === 'string') {
          return {
            websiteId: website.id,
            name: s.trim(),
            category: null,
            order: idx,
          };
        }
        return {
          websiteId: website.id,
          name: s.name.trim(),
          category: s.category || null,
          order: idx,
        };
      }),
    });
  }

  // Social Links
  if (validated.socialLinks && validated.socialLinks.length > 0) {
    await prisma.socialLink.deleteMany({ where: { websiteId: website.id } });
    await prisma.socialLink.createMany({
      data: validated.socialLinks.map((l, idx) => ({
        websiteId: website.id,
        platform: l.platform,
        url: l.url,
        order: idx,
      })),
    });
  }

  // If website is live, re-verify publish gate
  if (website.published) {
    const modResult = await moderateWebsiteForPublish(website.id);
    if (!modResult.allowed) {
      await prisma.website.update({
        where: { id: website.id },
        data: { published: false },
      });
      revalidatePath('/dashboard');
      return {
        success: true,
        published: false,
        unpublishWarning: true,
        error: modResult.error || 'Imported content cannot be published. Saved as draft.',
      };
    }
  }

  revalidatePath('/dashboard');
  return { success: true, published: website.published };
}

/**
 * Saves all walkthrough Q&A inputs in an atomic batch operation
 * and passes them through the Publish Moderation Gate
 */
export async function saveWalkthroughData(data: {
  headline?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  project?: {
    title: string;
    tags?: string;
    description?: string;
    liveUrl?: string;
    sourceUrl?: string;
  } | null;
  experience?: {
    role: string;
    company: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  } | null;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  } | null;
  templateId?: string;
}) {
  const user = await requireAuth();
  const website = await getUserWebsite(user.id);

  // 1. Profile information
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const defaultAvatar = dbUser?.googlePhotoIsDefault ? dbUser.googlePhotoUrl : (dbUser?.lastApprovedPhotoUrl || null);

  await prisma.profile.upsert({
    where: { websiteId: website.id },
    create: {
      websiteId: website.id,
      headline: data.headline?.trim() || null,
      location: data.location?.trim() || null,
      bio: data.bio?.trim() || null,
      avatarUrl: defaultAvatar,
    },
    update: {
      headline: data.headline?.trim() || null,
      location: data.location?.trim() || null,
      bio: data.bio?.trim() || null,
    },
  });

  // 2. Skills
  if (data.skills && data.skills.length > 0) {
    const cleanedSkills = data.skills
      .map((s) => s.trim())
      .filter(Boolean);

    if (cleanedSkills.length > 0) {
      await prisma.skill.deleteMany({ where: { websiteId: website.id } });
      await prisma.skill.createMany({
        data: cleanedSkills.map((name, idx) => ({
          websiteId: website.id,
          name,
          category: 'Core Stack',
          order: idx,
        })),
      });
    }
  }

  // 3. Featured Project (if provided)
  if (data.project && data.project.title.trim()) {
    const existingProjects = await prisma.project.findMany({
      where: { websiteId: website.id },
    });

    if (existingProjects.length > 0) {
      await prisma.project.update({
        where: { id: existingProjects[0].id },
        data: {
          title: data.project.title.trim(),
          tags: data.project.tags?.trim() || '',
          description: data.project.description?.trim() || null,
          liveUrl: data.project.liveUrl?.trim() || null,
          sourceUrl: data.project.sourceUrl?.trim() || null,
        },
      });
    } else {
      await prisma.project.create({
        data: {
          websiteId: website.id,
          title: data.project.title.trim(),
          tags: data.project.tags?.trim() || '',
          description: data.project.description?.trim() || null,
          liveUrl: data.project.liveUrl?.trim() || null,
          sourceUrl: data.project.sourceUrl?.trim() || null,
          order: 0,
        },
      });
    }
  }

  // 4. Experience (if provided)
  if (data.experience && (data.experience.role.trim() || data.experience.company.trim())) {
    const existingExp = await prisma.experience.findMany({
      where: { websiteId: website.id },
    });

    if (existingExp.length > 0) {
      await prisma.experience.update({
        where: { id: existingExp[0].id },
        data: {
          role: data.experience.role.trim() || 'Software Engineer',
          company: data.experience.company.trim() || 'Organization',
          startDate: data.experience.startDate?.trim() || null,
          endDate: data.experience.endDate?.trim() || null,
          current: data.experience.current ?? false,
          description: data.experience.description?.trim() || null,
        },
      });
    } else {
      await prisma.experience.create({
        data: {
          websiteId: website.id,
          role: data.experience.role.trim() || 'Software Engineer',
          company: data.experience.company.trim() || 'Organization',
          startDate: data.experience.startDate?.trim() || null,
          endDate: data.experience.endDate?.trim() || null,
          current: data.experience.current ?? false,
          description: data.experience.description?.trim() || null,
          order: 0,
        },
      });
    }
  }

  // 5. Social Links
  if (data.socialLinks) {
    const socialEntries: { platform: string; url: string }[] = [];
    if (data.socialLinks.github?.trim()) {
      const gh = data.socialLinks.github.trim();
      socialEntries.push({
        platform: 'GitHub',
        url: gh.startsWith('http') ? gh : `https://github.com/${gh.replace(/^@/, '')}`,
      });
    }
    if (data.socialLinks.linkedin?.trim()) {
      const li = data.socialLinks.linkedin.trim();
      socialEntries.push({
        platform: 'LinkedIn',
        url: li.startsWith('http') ? li : `https://linkedin.com/in/${li.replace(/^@/, '')}`,
      });
    }
    if (data.socialLinks.twitter?.trim()) {
      const tw = data.socialLinks.twitter.trim();
      socialEntries.push({
        platform: 'Twitter',
        url: tw.startsWith('http') ? tw : `https://x.com/${tw.replace(/^@/, '')}`,
      });
    }
    if (data.socialLinks.email?.trim()) {
      const em = data.socialLinks.email.trim();
      socialEntries.push({
        platform: 'Mail',
        url: em.startsWith('mailto:') ? em : `mailto:${em}`,
      });
    }

    if (socialEntries.length > 0) {
      await prisma.socialLink.deleteMany({ where: { websiteId: website.id } });
      await prisma.socialLink.createMany({
        data: socialEntries.map((item, idx) => ({
          websiteId: website.id,
          platform: item.platform,
          url: item.url,
          order: idx,
        })),
      });
    }
  }

  // 6. Template Selection & Publish Gate Execution
  const updateData: { templateId?: TemplateCategory; published?: boolean } = {};
  if (data.templateId && data.templateId in TEMPLATE_REGISTRY) {
    updateData.templateId = data.templateId as TemplateCategory;
  }

  // Run Publish Gate
  const modResult = await moderateWebsiteForPublish(website.id);
  updateData.published = modResult.allowed;

  await prisma.website.update({
    where: { id: website.id },
    data: updateData,
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard/projects');
  revalidatePath('/dashboard/experience');
  revalidatePath('/dashboard/skills');
  revalidatePath('/dashboard/social');
  revalidatePath('/dashboard/templates');
  revalidatePath('/dashboard/settings');

  if (!modResult.allowed) {
    return {
      success: true,
      published: false,
      error: modResult.error || 'Your portfolio was saved as draft due to moderation review.',
      username: website.username,
    };
  }

  return { success: true, published: true, username: website.username };
}
