import { generateUUIDv4, generateUUIDv7, formatUUID, generateBulkUUIDs, validateUUID, decodeUUID, uuidToBase64, base64ToUuid } from '../src/utils/uuid.ts';

console.log('--- Running Cryptographic & Algorithmic Unit Tests ---');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`❌ FAIL: ${message}`);
  }
}

// Test 1: UUID v4 generation and validation
const v4 = generateUUIDv4();
const valV4 = validateUUID(v4);
assert(valV4.isValid, `UUID v4 (${v4}) is valid`);
assert(valV4.version === 4, `UUID v4 version is 4 (got ${valV4.version})`);
assert(valV4.variant.includes('RFC 4122'), `UUID v4 variant is RFC 4122`);

// Test 2: UUID v7 generation, validation, and decoding
const nowBefore = Date.now();
const v7 = generateUUIDv7();
const nowAfter = Date.now();
const valV7 = validateUUID(v7);
const decV7 = decodeUUID(v7);

assert(valV7.isValid, `UUID v7 (${v7}) is valid`);
assert(valV7.version === 7, `UUID v7 version is 7 (got ${valV7.version})`);
assert(decV7.isTimeBased, `UUID v7 is detected as time-based`);
assert(decV7.timestampUnixMs !== null && decV7.timestampUnixMs >= nowBefore && decV7.timestampUnixMs <= nowAfter, `UUID v7 timestamp (${decV7.timestampUnixMs}) matches current time (${nowBefore}-${nowAfter})`);

// Test 3: Nil and Max UUIDs
const nilRes = validateUUID('00000000-0000-0000-0000-000000000000');
assert(nilRes.isValid && nilRes.isNil, `Nil UUID is recognized`);

const maxRes = validateUUID('ffffffff-ffff-ffff-ffff-ffffffffffff');
assert(maxRes.isValid && maxRes.isMax, `Max UUID is recognized`);

// Test 4: Bulk Generation
const bulk = generateBulkUUIDs('v7', 500, { casing: 'uppercase', hyphens: true });
assert(bulk.length === 500, `Generated exactly 500 bulk items`);
assert(bulk.every(id => /^[0-9A-F]{8}-[0-9A-F]{4}-7[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(id)), `All 500 bulk items are uppercase v7 format`);

// Test 5: Monotonicity of UUID v7 in rapid succession
let monotonic = true;
let prevTime = 0;
for (let i = 0; i < 100; i++) {
  const cur = generateUUIDv7();
  const hex = cur.replace(/-/g, '').slice(0, 12);
  const time = parseInt(hex, 16);
  if (time < prevTime) monotonic = false;
  prevTime = time;
}
assert(monotonic, `UUID v7 sequence is strictly non-decreasing over 100 rapid generations`);

// Test 6: Formatting options
const sample = '550e8400-e29b-41d4-a716-446655440000';
assert(formatUUID(sample, { casing: 'uppercase' }) === '550E8400-E29B-41D4-A716-446655440000', 'Uppercase formatting');
assert(formatUUID(sample, { hyphens: false }) === '550e8400e29b41d4a716446655440000', 'No hyphens formatting');
assert(formatUUID(sample, { braces: true }) === '{550e8400-e29b-41d4-a716-446655440000}', 'Braces formatting');
assert(formatUUID(sample, { quotes: true }) === '"550e8400-e29b-41d4-a716-446655440000"', 'Quotes formatting');
// Test 7: Base64 UUID Encoding and Decoding
const sampleUuid = '550e8400-e29b-41d4-a716-446655440000';
const standardB64 = uuidToBase64(sampleUuid);
const urlSafeB64 = uuidToBase64(sampleUuid, { urlSafe: true, padding: false });

assert(standardB64 === 'VQ6EAOKbQdSnFkRmVUQAAA==', `Standard Base64 encoding matches expected (${standardB64})`);
assert(urlSafeB64 === 'VQ6EAOKbQdSnFkRmVUQAAA', `URL-safe Base64 encoding without padding matches expected (${urlSafeB64})`);

const decodeStandard = base64ToUuid(standardB64);
assert(decodeStandard.isValid, 'Decode standard Base64 is valid');
assert(decodeStandard.canonicalUuid === sampleUuid, `Decoded UUID (${decodeStandard.canonicalUuid}) matches original (${sampleUuid})`);

const decodeUrlSafe = base64ToUuid(urlSafeB64);
assert(decodeUrlSafe.isValid, 'Decode URL-safe Base64 is valid');
assert(decodeUrlSafe.canonicalUuid === sampleUuid, `Decoded URL-safe UUID matches original`);

// Test 8: Invalid Base64 strings
const invalidB64 = base64ToUuid('short');
assert(!invalidB64.isValid, 'Short invalid Base64 is flagged as invalid');

console.log(`\nUnit Test Results: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ All cryptographic & formatting unit tests passed!');
  process.exit(0);
}
