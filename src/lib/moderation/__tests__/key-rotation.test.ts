/**
 * =====================================================================
 * Hive API Key Cycler & Rotation Test Suite
 * =====================================================================
 */

import { getLoadedHiveKeys, getNextHiveKey, executeWithHiveRotation } from '../key-manager';

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

async function runKeyRotationTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING HIVE API KEY CYCLER & ROTATION TESTS');
  console.log('==================================================\n');

  // Backup original env
  const origEnv = { ...process.env };

  try {
    // ----------------------------------------------------
    // Test 1: Scan & Load Indexed Key Slots 1-6
    // ----------------------------------------------------
    console.log('--- 1. Testing Multi-Slot Key Discovery ---');
    process.env.HIVE_ACCESS_KEY_1 = 'key-id-1';
    process.env.HIVE_SECRET_KEY_1 = 'secret-1';

    process.env.HIVE_ACCESS_KEY_2 = 'key-id-2';
    process.env.HIVE_SECRET_KEY_2 = 'secret-2';

    process.env.HIVE_ACCESS_KEY_3 = 'key-id-3';
    process.env.HIVE_SECRET_KEY_3 = 'secret-3';

    // Clear others
    delete process.env.HIVE_ACCESS_KEY_4;
    delete process.env.HIVE_SECRET_KEY_4;
    delete process.env.HIVE_ACCESS_KEY_5;
    delete process.env.HIVE_SECRET_KEY_5;
    delete process.env.HIVE_ACCESS_KEY_6;
    delete process.env.HIVE_SECRET_KEY_6;
    delete process.env.HIVE_API_KEY;

    const loadedKeys = getLoadedHiveKeys();
    assert(loadedKeys.length === 3, 'Discovers exactly 3 configured key slots');
    assert(loadedKeys[0].token === 'secret-1' && loadedKeys[0].index === 1, 'Slot 1 token mapped to secret-1');
    assert(loadedKeys[1].token === 'secret-2' && loadedKeys[1].index === 2, 'Slot 2 token mapped to secret-2');
    assert(loadedKeys[2].token === 'secret-3' && loadedKeys[2].index === 3, 'Slot 3 token mapped to secret-3');

    // ----------------------------------------------------
    // Test 2: Round-Robin Sequential Cycling (1 -> 2 -> 3 -> 1)
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Round-Robin Sequential Cycling ---');

    const k1 = getNextHiveKey();
    const k2 = getNextHiveKey();
    const k3 = getNextHiveKey();

    assert(k1?.index === 1, '1st call returns Key Slot #1');
    assert(k2?.index === 2, '2nd call returns Key Slot #2');
    assert(k3?.index === 3, '3rd call returns Key Slot #3');

    // ----------------------------------------------------
    // Test 3: Automatic Failover on Single Key Failure
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Automatic Key Failover ---');

    // Pointer is now at Slot 1. Make Slot 1 fail and verify automatic failover to Slot 2.
    const attemptedKeys: number[] = [];
    const result = await executeWithHiveRotation(async (key) => {
      attemptedKeys.push(key.index);
      if (key.index === 1) {
        throw new Error('429 Rate Limit on slot 1');
      }
      return `Success on slot ${key.index}`;
    });

    assert(result.includes('Success on slot 2'), 'Operation succeeded after failing over from slot 1');
    assert(attemptedKeys[0] === 1 && attemptedKeys[1] === 2, 'Exercised slot 1 then failed over to slot 2');

    // ----------------------------------------------------
    // Test 4: Full Pool Exhaustion
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Pool Exhaustion Fail-Closed ---');

    let allFailed = false;
    try {
      await executeWithHiveRotation(async (key) => {
        throw new Error(`Slot ${key.index} exhausted`);
      });
    } catch (err: any) {
      allFailed = true;
      assert(err.message.includes('exhausted'), 'Fails closed with descriptive error when all keys fail');
    }
    assert(allFailed, 'Threw error on complete pool failure');

    // ----------------------------------------------------
    // Summary
    // ----------------------------------------------------
    console.log('\n==================================================');
    console.log(`🏁 KEY ROTATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('==================================================\n');

  } finally {
    // Restore env
    process.env = origEnv;
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runKeyRotationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
