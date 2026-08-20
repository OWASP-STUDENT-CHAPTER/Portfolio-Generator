/**
 * =====================================================================
 * Publish-Time Moderation Pipeline (Defense-in-Depth Gate)
 * =====================================================================
 * Single authoritative publish gate combining Layer 1 (Veil Local) and
 * Layer 2 (Hive API) with deterministic cryptographic result caching.
 */

import { prisma } from '@/lib/prisma';
import { checkLocalProfanity } from './veil-local';
import { moderateTextWithHive, moderateImageWithHive } from './hive-client';
import { computeContentHash, getCachedModerationResult, saveModerationResult } from './cache';

export interface PublishModerationResult {
  allowed: boolean;
  error?: string;
  cached?: boolean;
}

export interface WebsitePublicContent {
  username: string;
  user?: {
    id: string;
    googlePhotoUrl?: string | null;
    googlePhotoIsDefault?: boolean;
    googlePhotoEtag?: string | null;
    photoModerationStatus?: string | null;
    lastApprovedPhotoUrl?: string | null;
  } | null;
  profile?: {
    headline?: string | null;
    bio?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
    resumeUrl?: string | null;
  } | null;
  projects?: Array<{
    title: string;
    description?: string | null;
    tags?: string | null;
    liveUrl?: string | null;
    sourceUrl?: string | null;
    imageUrl?: string | null;
  }>;
  experiences?: Array<{
    company: string;
    role: string;
    description?: string | null;
  }>;
  educations?: Array<{
    institution: string;
    degree?: string | null;
    field?: string | null;
  }>;
  skills?: Array<{
    name: string;
    category?: string | null;
  }>;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  customSections?: Array<{
    title: string;
    content: string;
  }>;
}

/**
 * Extracts and aggregates all public user-generated text and image URLs from a website
 */
export function aggregatePublicContent(content: WebsitePublicContent): {
  aggregatedText: string;
  imageUrls: string[];
  individualFields: Array<{ field: string; text: string }>;
} {
  const parts: string[] = [];
  const imageUrls: string[] = [];
  const individualFields: Array<{ field: string; text: string }> = [];

  const addField = (fieldName: string, value?: string | null, isUrl = false) => {
    if (value && typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      // Natural language descriptive text is aggregated for Hive NLP
      if (!isUrl && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        parts.push(trimmed);
      }
      // Every field (including URLs) is checked individually by Layer 1 Veil
      individualFields.push({ field: fieldName, text: trimmed });
    }
  };

  // Username
  addField('username', content.username);

  // Profile
  if (content.profile) {
    addField('profile.headline', content.profile.headline);
    addField('profile.bio', content.profile.bio);
    addField('profile.location', content.profile.location);
    addField('profile.resumeUrl', content.profile.resumeUrl, true);
  }

  // Projects
  if (content.projects) {
    for (let i = 0; i < content.projects.length; i++) {
      const p = content.projects[i];
      addField(`project[${i}].title`, p.title);
      addField(`project[${i}].description`, p.description);
      addField(`project[${i}].tags`, p.tags);
      addField(`project[${i}].liveUrl`, p.liveUrl, true);
      addField(`project[${i}].sourceUrl`, p.sourceUrl, true);

      if (p.imageUrl && p.imageUrl.startsWith('http')) {
        imageUrls.push(p.imageUrl);
      }
    }
  }

  // Experiences
  if (content.experiences) {
    for (let i = 0; i < content.experiences.length; i++) {
      const exp = content.experiences[i];
      addField(`experience[${i}].company`, exp.company);
      addField(`experience[${i}].role`, exp.role);
      addField(`experience[${i}].description`, exp.description);
    }
  }

  // Educations
  if (content.educations) {
    for (let i = 0; i < content.educations.length; i++) {
      const edu = content.educations[i];
      addField(`education[${i}].institution`, edu.institution);
      addField(`education[${i}].degree`, edu.degree);
      addField(`education[${i}].field`, edu.field);
    }
  }

  // Skills
  if (content.skills) {
    for (let i = 0; i < content.skills.length; i++) {
      const s = content.skills[i];
      addField(`skill[${i}].name`, s.name);
      addField(`skill[${i}].category`, s.category);
    }
  }

  // Social Links
  if (content.socialLinks) {
    for (let i = 0; i < content.socialLinks.length; i++) {
      const sl = content.socialLinks[i];
      addField(`socialLink[${i}].platform`, sl.platform);
      addField(`socialLink[${i}].url`, sl.url, true);
    }
  }

  // Custom Sections
  if (content.customSections) {
    for (let i = 0; i < content.customSections.length; i++) {
      const cs = content.customSections[i];
      addField(`customSection[${i}].title`, cs.title);
      addField(`customSection[${i}].content`, cs.content);
    }
  }

  return {
    aggregatedText: parts.join('\n\n'),
    imageUrls,
    individualFields,
  };
}

/**
 * Validates individual fields locally during draft editing (Tier 1 only, no Hive call)
 */
export function validateDraftContentLocally(
  fields: Record<string, string | null | undefined>
): { isSafe: boolean; error?: string } {
  for (const [, val] of Object.entries(fields)) {
    if (val && typeof val === 'string') {
      const res = checkLocalProfanity(val);
      if (!res.isSafe) {
        return {
          isSafe: false,
          error: 'Some of your content contains inappropriate or prohibited language. Please review and correct it.',
        };
      }
    }
  }
  return { isSafe: true };
}

export interface ProfilePhotoModerationResult {
  allowed: boolean;
  error?: string;
  photoModerationStatus: string;
  activeAvatarUrl: string | null;
  hiveCalled: boolean;
  isServiceError?: boolean;
}

/**
 * Authoritative moderation gate specifically for Google profile photos.
 * - Default Google avatar (isDefault = true) -> NOT_REQUIRED, 0 Hive calls.
 * - Unchanged approved photo -> APPROVED (cached), 0 Hive calls.
 * - New / changed real photo -> Calls Hive Visual API.
 * - If Hive blocks or fails closed -> Preserves lastApprovedPhotoUrl for public site.
 */
export async function moderateProfilePhotoForPublish(user: {
  id: string;
  googlePhotoUrl?: string | null;
  googlePhotoIsDefault?: boolean;
  googlePhotoEtag?: string | null;
  photoModerationStatus?: string | null;
  lastApprovedPhotoUrl?: string | null;
}): Promise<ProfilePhotoModerationResult> {
  const photoUrl = user.googlePhotoUrl;
  const isDefault = user.googlePhotoIsDefault ?? true;
  const status = user.photoModerationStatus || 'NOT_REQUIRED';
  const lastApproved = user.lastApprovedPhotoUrl || null;

  // 1. Google Default generated avatar (or null) -> Bypass Hive Vision entirely
  if (!photoUrl || isDefault) {
    if (user.id && status !== 'NOT_REQUIRED') {
      await prisma.user.updateMany({
        where: { id: user.id },
        data: { photoModerationStatus: 'NOT_REQUIRED' },
      }).catch(() => null);
    }
    return {
      allowed: true,
      photoModerationStatus: 'NOT_REQUIRED',
      activeAvatarUrl: photoUrl || null,
      hiveCalled: false,
    };
  }

  // 2. Real photo that is already APPROVED and has not changed
  if (status === 'APPROVED' && photoUrl === lastApproved) {
    return {
      allowed: true,
      photoModerationStatus: 'APPROVED',
      activeAvatarUrl: photoUrl,
      hiveCalled: false,
    };
  }

  // 3. Real photo that was previously BLOCKED and has not changed
  if (status === 'BLOCKED' && photoUrl !== lastApproved) {
    return {
      allowed: false,
      error: 'Your Google profile photo was previously flagged for safety. Please update your Google profile picture and try again.',
      photoModerationStatus: 'BLOCKED',
      activeAvatarUrl: lastApproved,
      hiveCalled: false,
    };
  }

  // 4. Real photo that is new / changed / PENDING -> Call Hive Visual Moderation
  console.log(`[Photo Moderation] Invoking Hive Visual Moderation for photo: ${photoUrl.slice(0, 45)}...`);
  const hiveResult = await moderateImageWithHive(photoUrl);

  // Hive Service Failure / Timeout -> Fail Closed (preserve last approved photo)
  if (!hiveResult.allowed && hiveResult.violations.includes('HIVE_SERVICE_ERROR')) {
    console.warn(`[Photo Moderation] Hive service error: ${hiveResult.reason}`);
    return {
      allowed: false,
      error: 'Your profile photo could not be verified right now. Please try again later.',
      photoModerationStatus: 'PENDING',
      activeAvatarUrl: lastApproved,
      hiveCalled: true,
      isServiceError: true,
    };
  }

  // Hive Policy Violation -> Block new photo
  if (!hiveResult.allowed) {
    console.warn('[Photo Moderation] Hive Visual blocked photo:', hiveResult.violations);
    if (user.id) {
      await prisma.user.updateMany({
        where: { id: user.id },
        data: {
          photoModerationStatus: 'BLOCKED',
          photoModeratedAt: new Date(),
        },
      }).catch(() => null);
    }

    return {
      allowed: false,
      error: 'Your Google profile photo contains content that violates platform safety guidelines. Please update your Google profile picture and try again.',
      photoModerationStatus: 'BLOCKED',
      activeAvatarUrl: lastApproved,
      hiveCalled: true,
    };
  }

  // Hive Approved!
  console.log(`[Photo Moderation] Hive Visual approved photo for user: ${user.id || 'in-memory'}`);
  if (user.id) {
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        photoModerationStatus: 'APPROVED',
        lastApprovedPhotoUrl: photoUrl,
        photoModeratedAt: new Date(),
      },
    }).catch(() => null);
  }

  return {
    allowed: true,
    photoModerationStatus: 'APPROVED',
    activeAvatarUrl: photoUrl,
    hiveCalled: true,
  };
}

/**
 * Authoritative publish-time moderation gate.
 * 1. Collects and validates all public text with Layer 1 (Veil Local).
 * 2. Moderates Google profile photo (distinguishing default vs real photos).
 * 3. Checks DB cache for public text hash.
 * 4. Calls Hive Text API for un-cached text.
 * 5. Returns final publish decision and safely updates public avatar.
 */
export async function moderateWebsiteForPublish(
  websiteIdOrData: string | WebsitePublicContent
): Promise<PublishModerationResult> {
  let contentData: WebsitePublicContent;
  let websiteRecord: any = null;

  if (typeof websiteIdOrData === 'string') {
    websiteRecord = await prisma.website.findUnique({
      where: { id: websiteIdOrData },
      include: {
        user: true,
        profile: true,
        projects: { orderBy: { order: 'asc' } },
        experiences: { orderBy: { order: 'asc' } },
        educations: { orderBy: { order: 'asc' } },
        skills: { orderBy: { order: 'asc' } },
        socialLinks: { orderBy: { order: 'asc' } },
        customSections: { orderBy: { order: 'asc' } },
      },
    });

    if (!websiteRecord) {
      return { allowed: false, error: 'Website not found' };
    }

    contentData = {
      username: websiteRecord.username,
      user: websiteRecord.user,
      profile: websiteRecord.profile,
      projects: websiteRecord.projects,
      experiences: websiteRecord.experiences,
      educations: websiteRecord.educations,
      skills: websiteRecord.skills,
      socialLinks: websiteRecord.socialLinks,
      customSections: websiteRecord.customSections,
    };
  } else {
    contentData = websiteIdOrData;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🚀 [PUBLISH GATE] Initiating publish check for: "${contentData.username || 'unknown'}"`);
  console.log('='.repeat(60));

  // 1. Aggregate public text content
  const { aggregatedText, imageUrls, individualFields } = aggregatePublicContent(contentData);
  console.log(`[Publish Gate] 📝 Aggregated fields: ${individualFields.length} | Project images: ${imageUrls.length}`);

  // 2. LAYER 1: Run Veil Local Moderation on all fields
  console.log(`[Publish Gate] 🛡️ Layer 1 (Veil Local) scanning ${individualFields.length} fields...`);
  for (const item of individualFields) {
    const localCheck = checkLocalProfanity(item.text);
    if (!localCheck.isSafe) {
      console.warn(`[Publish Gate] ❌ REJECTED by Layer 1 (Veil Local) on field "${item.field}":`, localCheck.reason);
      console.warn(`[Publish Gate] Matched Token: "${localCheck.matchedToken || 'unknown'}"`);
      return {
        allowed: false,
        error: `Prohibited language detected in ${item.field}: "${localCheck.matchedToken || item.text.slice(0, 20)}". Please review and correct it before publishing.`,
      };
    }
  }

  if (aggregatedText.trim()) {
    const aggregatedLocalCheck = checkLocalProfanity(aggregatedText);
    if (!aggregatedLocalCheck.isSafe) {
      console.warn('[Publish Gate] ❌ REJECTED by Layer 1 (Veil Local) on aggregated text stream:', aggregatedLocalCheck.reason);
      return {
        allowed: false,
        error: 'Some of your content contains inappropriate or prohibited language. Please review and correct it before publishing.',
      };
    }
  }
  console.log(`[Publish Gate] ✅ Layer 1 (Veil Local) PASSED: All ${individualFields.length} text fields are clean.`);

  // 3. PROFILE PHOTO MODERATION
  if (contentData.user) {
    console.log(`[Publish Gate] 📸 Profile Photo Moderation: User=${contentData.user.id || 'in-memory'} | DefaultAvatar=${contentData.user.googlePhotoIsDefault ?? true} | Status=${contentData.user.photoModerationStatus || 'NOT_REQUIRED'}`);
    const photoResult = await moderateProfilePhotoForPublish(contentData.user);
    console.log(`[Publish Gate] 📸 Profile Photo Result: allowed=${photoResult.allowed} | status=${photoResult.photoModerationStatus} | hiveCalled=${photoResult.hiveCalled}`);
    
    if (!photoResult.allowed) {
      console.warn(`[Publish Gate] ❌ Photo moderation blocked publish:`, photoResult.error);
      return {
        allowed: false,
        error: photoResult.error || 'Your profile photo could not be verified for publication.',
      };
    }

    // Synchronize approved avatar URL to Profile in database if needed
    if (websiteRecord?.profile && websiteRecord.profile.avatarUrl !== photoResult.activeAvatarUrl) {
      await prisma.profile.update({
        where: { id: websiteRecord.profile.id },
        data: { avatarUrl: photoResult.activeAvatarUrl },
      }).catch(() => null);
    }
  }

  // If no public text exists yet, it's safe
  if (!aggregatedText.trim()) {
    console.log('[Publish Gate] ✅ No public text to moderate. Publish APPROVED.');
    return { allowed: true };
  }

  // 4. Compute deterministic hash of public text
  const contentHash = computeContentHash(aggregatedText, imageUrls);
  console.log(`[Publish Gate] 🔑 Content SHA-256 Hash: ${contentHash.slice(0, 16)}...`);

  // 5. CACHE LOOKUP: Check if exact text content was already approved
  const cached = await getCachedModerationResult(contentHash);
  if (cached.found) {
    if (cached.isApproved) {
      console.log(`[Publish Gate] ⚡ Cache HIT (Approved): ${contentHash.slice(0, 12)}... (0 Hive calls burned)`);
      return { allowed: true, cached: true };
    } else {
      console.warn(`[Publish Gate] ⚡ Cache HIT (Blocked): ${contentHash.slice(0, 12)}... | Reason: ${cached.reason || 'None'}`);
      const specificReason = cached.reason ? `: ${cached.reason}` : '';
      return {
        allowed: false,
        error: `Your website contains content that was flagged during safety review${specificReason}. Please review and update your content.`,
        cached: true,
      };
    }
  }

  // 6. LAYER 2: Text Moderation Mode Check
  const textModMode = (process.env.TEXT_MODERATION_MODE || 'LOCAL_FIRST').toUpperCase();
  console.log(`[Publish Gate] ⚙️ TEXT_MODERATION_MODE is set to: "${textModMode}"`);

  if (textModMode === 'HYBRID') {
    console.log(`[Publish Gate] 🌐 [HYBRID MODE] Calling Hive Text API for hash: ${contentHash.slice(0, 12)}...`);
    const textHiveResult = await moderateTextWithHive(aggregatedText);
    console.log(`[Publish Gate] 🌐 Hive Text API Result: allowed=${textHiveResult.allowed} | violations=${JSON.stringify(textHiveResult.violations)}`);
    
    if (!textHiveResult.allowed) {
      console.warn('[Publish Gate] ❌ Blocked by Hive Text Moderation:', textHiveResult.violations, textHiveResult.reason);
      
      // Only cache actual policy violations, NEVER temporary service/network errors
      const isServiceError = textHiveResult.violations.includes('HIVE_SERVICE_ERROR') || textHiveResult.violations.includes('MISSING_HIVE_API_KEY');
      if (!isServiceError) {
        await saveModerationResult(
          contentHash,
          false,
          'BLOCK',
          textHiveResult.violations.join(', ')
        );
      }

      return {
        allowed: false,
        error: `Your website could not be published (${textHiveResult.reason || 'content flagged during safety review'}). Please review your content and try again.`,
      };
    }
  } else {
    console.log(`[Publish Gate] ⚡ [${textModMode} MODE] Layer 1 Veil approved -> Skipping Hive Text API (0 Hive API calls burned)`);
  }

  // 7. Moderating Project Images (if any external image URLs exist)
  if (imageUrls.length > 0) {
    console.log(`[Publish Gate] 🖼️ Moderating ${imageUrls.length} project image(s)...`);
    for (const imgUrl of imageUrls) {
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        console.log(`[Publish Gate] Calling Hive Visual for project image: ${imgUrl.slice(0, 50)}...`);
        const visualHiveResult = await moderateImageWithHive(imgUrl);
        console.log(`[Publish Gate] Project Image Result: allowed=${visualHiveResult.allowed} | violations=${JSON.stringify(visualHiveResult.violations)}`);
        
        if (!visualHiveResult.allowed) {
          console.warn('[Publish Gate] ❌ Blocked by Hive Visual Moderation on project image:', visualHiveResult.violations, visualHiveResult.reason);
          
          const isServiceError = visualHiveResult.violations.includes('HIVE_SERVICE_ERROR') || visualHiveResult.violations.includes('MISSING_HIVE_API_KEY');
          if (!isServiceError) {
            await saveModerationResult(
              contentHash,
              false,
              'BLOCK',
              visualHiveResult.violations.join(', ')
            );
          }

          return {
            allowed: false,
            error: `Your project photo could not be published (${visualHiveResult.reason || 'flagged by image safety review'}). Please remove or replace external photos.`,
          };
        }
      }
    }
  }

  // 8. Approved -> Cache decision and Allow Publish
  console.log(`[Publish Gate] 🎉 ALL CHECKS PASSED! Caching approval for hash: ${contentHash.slice(0, 12)}...`);
  console.log('='.repeat(60) + '\n');
  await saveModerationResult(contentHash, true, 'ALLOW');

  return { allowed: true };
}
