/**
 * =====================================================================
 * Pipeline & Caching Integration Test
 * =====================================================================
 */

import { aggregatePublicContent, moderateWebsiteForPublish } from '../pipeline';
import { getCachedModerationResult, saveModerationResult, computeContentHash } from '../cache';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, extra?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${extra ? `(${extra})` : ''}`);
    failed++;
  }
}

async function runPipelineTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING PIPELINE & CACHING INTEGRATION TESTS');
  console.log('==================================================\n');

  // 1. Aggregation Test
  console.log('--- 1. Testing Portfolio Content Aggregation ---');
  const samplePortfolio = {
    username: 'harshmittal',
    profile: {
      headline: 'Software Engineer & Distributed Systems Enthusiast',
      bio: 'Undergraduate student at TIET Patiala. GSoC contributor.',
      location: 'Patiala, Punjab',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      resumeUrl: 'https://example.com/resume.pdf',
    },
    projects: [
      {
        title: 'DistKV',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        description: 'High-performance distributed key-value store in Go with Raft consensus.',
        tags: 'Go, Raft, gRPC',
        liveUrl: 'https://distkv.dev',
        sourceUrl: 'https://github.com/harshm/distkv',
      },
    ],
    experiences: [
      {
        company: 'Razorpay',
        role: 'Software Engineering Intern',
        description: 'Engineered high-throughput webhook pipelines processing 50M+ events.',
      },
    ],
    educations: [
      {
        institution: 'Thapar Institute of Engineering and Technology',
        degree: 'B.E.',
        field: 'Computer Science',
      },
    ],
    skills: [
      { name: 'Go', category: 'Languages' },
      { name: 'TypeScript', category: 'Languages' },
      { name: 'PostgreSQL', category: 'Backend' },
    ],
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/harshm' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/harshm' },
    ],
  };

  const { aggregatedText, imageUrls } = aggregatePublicContent(samplePortfolio);
  assert(aggregatedText.includes('DistKV'), 'Aggregated text includes project title');
  assert(aggregatedText.includes('Razorpay'), 'Aggregated text includes experience');
  assert(aggregatedText.includes('Thapar Institute'), 'Aggregated text includes education');
  assert(imageUrls.length === 1, 'Extracted image URLs correctly');

  // 2. Layer 1 Immediate Rejection on Dirty Portfolio (0 Hive Calls)
  console.log('\n--- 2. Testing Layer 1 Immediate Rejection (0 Hive Calls) ---');
  const dirtyPortfolio = JSON.parse(JSON.stringify(samplePortfolio));
  dirtyPortfolio.profile.bio = 'I hate everyone, you are all bhenchods.';

  const rejectRes = await moderateWebsiteForPublish(dirtyPortfolio);
  assert(!rejectRes.allowed, 'Dirty portfolio REJECTED by publish gate');
  assert(
    (rejectRes.error?.includes('Prohibited language detected') || rejectRes.error?.includes('inappropriate or prohibited language')) ?? false,
    'Returns clear user-facing Veil error'
  );

  // 3. Database Caching & Verification
  console.log('\n--- 3. Testing Database Moderation Caching ---');
  const cleanHash = computeContentHash(aggregatedText, imageUrls);

  // Save approved result to DB cache
  await saveModerationResult(cleanHash, true, 'ALLOW');

  // Lookup cached result
  const cachedLookup = await getCachedModerationResult(cleanHash);
  assert(cachedLookup.found && cachedLookup.isApproved, 'Cached approved result found in DB');

  // Test publish gate with cache hit
  const cacheHitRes = await moderateWebsiteForPublish(samplePortfolio);
  assert(cacheHitRes.allowed && cacheHitRes.cached === true, 'Publish gate approves via CACHE HIT (0 Hive API calls)');

  // 4. Modifying content invalidates cache
  console.log('\n--- 4. Testing Cache Invalidation on Content Modification ---');
  const modifiedPortfolio = {
    ...samplePortfolio,
    profile: {
      ...samplePortfolio.profile,
      headline: 'Principal Distributed Systems Architect & Researcher',
    },
  };
  const { aggregatedText: modText, imageUrls: modImg } = aggregatePublicContent(modifiedPortfolio);
  const modHash = computeContentHash(modText, modImg);
  assert(modHash !== cleanHash, 'Modified portfolio produces new hash');

  const modCacheLookup = await getCachedModerationResult(modHash);
  assert(!modCacheLookup.found, 'Modified hash is a cache MISS (correctly requires re-moderation)');

  console.log('\n==================================================');
  console.log(`🏁 INTEGRATION TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runPipelineTests().catch((err) => {
  console.error('Integration test failed with error:', err);
  process.exit(1);
});
