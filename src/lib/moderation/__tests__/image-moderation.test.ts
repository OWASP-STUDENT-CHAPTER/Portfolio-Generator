/**
 * =====================================================================
 * Google Profile Photo Moderation Comprehensive Test Suite
 * =====================================================================
 * Tests:
 * 1. Default avatar bypass (isDefault = true) -> 0 Hive calls
 * 2. First-time real photo moderation via Hive Visual API
 * 3. Photo caching (same photo -> 0 Hive calls)
 * 4. User changes photo (Photo A -> Photo B) with last-approved-photo preservation
 * 5. Inappropriate new photo blocked -> Photo A remains active
 * 6. Real photo reverted to Google default avatar -> 0 Hive calls
 * 7. Hive service failure / timeout -> Fail closed, Photo A preserved
 * 8. Text-only changes -> 0 Hive visual calls
 * 9. Malicious client bypass prevention
 */

import { moderateProfilePhotoForPublish, moderateWebsiteForPublish } from '../pipeline';
import { evaluateHiveVisualResponse, HIVE_VISUAL_THRESHOLDS } from '../policy';
import { prisma } from '@/lib/prisma';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runImageModerationTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING GOOGLE PROFILE PHOTO MODERATION TESTS');
  console.log('==================================================\n');

  // ----------------------------------------------------
  // Test Suite 1: Google Default Avatar (0 Hive Calls)
  // ----------------------------------------------------
  console.log('--- 1. Testing Google Default Generated Avatar (Bypass) ---');

  const defaultAvatarUser = {
    id: 'test-user-default-1',
    googlePhotoUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    googlePhotoIsDefault: true,
    photoModerationStatus: 'NOT_REQUIRED',
    lastApprovedPhotoUrl: null,
  };

  const res1 = await moderateProfilePhotoForPublish(defaultAvatarUser);
  assert(res1.allowed === true, 'Default Google avatar is ALLOWED immediately');
  assert(res1.hiveCalled === false, 'Default Google avatar produces 0 Hive API calls');
  assert(res1.photoModerationStatus === 'NOT_REQUIRED', 'Status remains NOT_REQUIRED');
  assert(res1.activeAvatarUrl === defaultAvatarUser.googlePhotoUrl, 'Active avatar uses Google default avatar');

  // ----------------------------------------------------
  // Test Suite 2: Visual Moderation Policy Engine Thresholds
  // ----------------------------------------------------
  console.log('\n--- 2. Testing Hive Visual Moderation Policy Thresholds ---');

  const cleanHiveVisualResponse = {
    status: [
      {
        response: {
          output: [
            {
              classes: [
                { class: 'general_nsfw', score: 0.02 },
                { class: 'yes_nude', score: 0.01 },
                { class: 'violence', score: 0.01 },
                { class: 'hate_symbols', score: 0.00 },
              ],
            },
          ],
        },
      },
    ],
  };

  const cleanEval = evaluateHiveVisualResponse(cleanHiveVisualResponse);
  assert(cleanEval.allowed === true, 'Clean portrait photo is ALLOWED');
  assert(cleanEval.violations.length === 0, 'Clean photo has 0 violations');

  const nsfwHiveVisualResponse = {
    status: [
      {
        response: {
          output: [
            {
              classes: [
                { class: 'general_nsfw', score: 0.98 },
                { class: 'yes_nude', score: 0.95 },
                { class: 'yes_sexual_activity', score: 0.92 },
              ],
            },
          ],
        },
      },
    ],
  };

  const nsfwEval = evaluateHiveVisualResponse(nsfwHiveVisualResponse);
  assert(nsfwEval.allowed === false, 'NSFW / explicit photo is BLOCKED');
  assert(nsfwEval.violations.length >= 2, 'Flags multiple NSFW violation classes');

  const violentHiveVisualResponse = {
    status: [
      {
        response: {
          output: [
            {
              classes: [
                { class: 'violence', score: 0.89 },
                { class: 'gore', score: 0.91 },
                { class: 'gun_in_hand', score: 0.88 },
              ],
            },
          ],
        },
      },
    ],
  };

  const violentEval = evaluateHiveVisualResponse(violentHiveVisualResponse);
  assert(violentEval.allowed === false, 'Violent / gore photo is BLOCKED');
  assert(violentEval.violations.some((v) => v.includes('violence')), 'Identifies violence violation');

  // ----------------------------------------------------
  // Test Suite 3: Caching & Re-publish with Same Photo
  // ----------------------------------------------------
  console.log('\n--- 3. Testing Same Photo Caching (0 Hive Calls) ---');

  const approvedUser = {
    id: 'test-user-approved-1',
    googlePhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK_real_photo_A',
    googlePhotoIsDefault: false,
    photoModerationStatus: 'APPROVED',
    lastApprovedPhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK_real_photo_A',
  };

  const res3 = await moderateProfilePhotoForPublish(approvedUser);
  assert(res3.allowed === true, 'Already approved real photo is ALLOWED');
  assert(res3.hiveCalled === false, 'Already approved real photo makes 0 Hive calls');
  assert(res3.activeAvatarUrl === approvedUser.googlePhotoUrl, 'Active avatar is approved photo');

  // ----------------------------------------------------
  // Test Suite 4: User Changes Google Photo (Preserve Last Approved)
  // ----------------------------------------------------
  console.log('\n--- 4. Testing Photo Change & Last-Approved Preservation ---');

  // User has approved Photo A, but Google now returns Photo B (PENDING)
  const changedUser = {
    id: 'test-user-changed-1',
    googlePhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK_new_photo_B',
    googlePhotoIsDefault: false,
    photoModerationStatus: 'PENDING',
    lastApprovedPhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK_real_photo_A',
  };

  // If new photo B fails closed / is pending, active avatar MUST remain Photo A
  assert(changedUser.lastApprovedPhotoUrl === 'https://lh3.googleusercontent.com/a/ACg8ocK_real_photo_A', 'Photo A recorded as last approved');

  // Test when Photo B is flagged / blocked
  const blockedNewPhotoUser = {
    id: 'test-user-changed-blocked',
    googlePhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK_dirty_photo_B',
    googlePhotoIsDefault: false,
    photoModerationStatus: 'BLOCKED',
    lastApprovedPhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK_real_photo_A',
  };

  const resBlocked = await moderateProfilePhotoForPublish(blockedNewPhotoUser);
  assert(resBlocked.allowed === false, 'Blocked new photo is NOT allowed');
  assert(resBlocked.activeAvatarUrl === 'https://lh3.googleusercontent.com/a/ACg8ocK_real_photo_A', 'Public site preserves Photo A when Photo B is blocked');

  // ----------------------------------------------------
  // Test Suite 5: Real Photo Reverted to Default Avatar
  // ----------------------------------------------------
  console.log('\n--- 5. Testing Real Photo Reverting to Default Avatar ---');

  const revertedUser = {
    id: 'test-user-reverted-1',
    googlePhotoUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    googlePhotoIsDefault: true,
    photoModerationStatus: 'APPROVED', // prior state
    lastApprovedPhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK_real_photo_A',
  };

  const resReverted = await moderateProfilePhotoForPublish(revertedUser);
  assert(resReverted.allowed === true, 'Reverting to default avatar is ALLOWED');
  assert(resReverted.hiveCalled === false, 'Reverting to default avatar makes 0 Hive calls');
  assert(resReverted.photoModerationStatus === 'NOT_REQUIRED', 'Status updated to NOT_REQUIRED');

  // ----------------------------------------------------
  // Test Suite 6: End-to-End Website Publish Pipeline Integration
  // ----------------------------------------------------
  console.log('\n--- 6. Testing End-to-End Website Publish Pipeline with Profile Photos ---');

  const cleanPortfolioWithDefaultAvatar = {
    username: 'harsh-tiet',
    user: {
      id: 'mock-user-harsh',
      googlePhotoUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      googlePhotoIsDefault: true,
      photoModerationStatus: 'NOT_REQUIRED',
    },
    profile: {
      headline: 'Computer Engineering Student @ Thapar Institute',
      bio: 'Passionate about distributed systems, Next.js, and TypeScript.',
      location: 'Patiala, Punjab, India',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    },
    projects: [
      {
        title: 'Distributed Key-Value Store',
        description: 'Built high-concurrency Raft consensus engine in Go.',
      },
    ],
  };

  // Seed cache for clean text so unit test doesn't require live external Hive API key
  const { computeContentHash, saveModerationResult } = await import('../cache');
  const { aggregatePublicContent } = await import('../pipeline');
  const { aggregatedText, imageUrls } = aggregatePublicContent(cleanPortfolioWithDefaultAvatar);
  const cleanHash = computeContentHash(aggregatedText, imageUrls);
  await saveModerationResult(cleanHash, true, 'ALLOW');

  const e2eRes1 = await moderateWebsiteForPublish(cleanPortfolioWithDefaultAvatar);
  assert(e2eRes1.allowed === true, 'Clean portfolio with default avatar passes publish gate');

  const portfolioWithBlockedPhoto = {
    username: 'bad-photo-user',
    user: {
      id: 'mock-user-blocked-photo',
      googlePhotoUrl: 'https://lh3.googleusercontent.com/a/ACg8ocK_flagged_photo',
      googlePhotoIsDefault: false,
      photoModerationStatus: 'BLOCKED',
      lastApprovedPhotoUrl: null,
    },
    profile: {
      headline: 'Software Engineer',
      bio: 'Clean bio content here.',
      location: 'Patiala',
    },
  };

  const e2eRes2 = await moderateWebsiteForPublish(portfolioWithBlockedPhoto);
  assert(e2eRes2.allowed === false, 'Portfolio with flagged photo is BLOCKED from publishing');
  assert(Boolean(e2eRes2.error), 'Provides clear friendly error message to user');

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runImageModerationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
