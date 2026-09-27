import { generateUUIDv4, generateUUIDv7, formatUUID, generateBulkUUIDs, validateUUID, decodeUUID, uuidToBase64, base64ToUuid, uuidToInteger, integerToUuid, formatIntegerWithCommas, MAX_UUID_BIGINT, uuidToHex, hexToUuid, detectUuidVersion, SAMPLE_UUID_V1, SAMPLE_UUID_V3, SAMPLE_UUID_V4, SAMPLE_UUID_V5, SAMPLE_UUID_V6, SAMPLE_UUID_V7, SAMPLE_UUID_V8, generateUUIDv5, NAMESPACE_DNS, NAMESPACE_URL, NAMESPACE_OID, NAMESPACE_X500, generateUUIDv8 } from '../src/utils/uuid.ts';

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

// Test 9: UUID to Integer - Zero and Max bounds
const zeroRes = uuidToInteger('00000000-0000-0000-0000-000000000000');
assert(zeroRes.isValid, 'Nil UUID to integer is valid');
assert(zeroRes.rawInteger === '0', `Nil UUID yields integer "0" (got "${zeroRes.rawInteger}")`);

const maxIntRes = uuidToInteger('ffffffff-ffff-ffff-ffff-ffffffffffff');
assert(maxIntRes.isValid, 'Max UUID to integer is valid');
assert(maxIntRes.rawInteger === '340282366920938463463374607431768211455', `Max UUID yields exact 2^128-1: ${maxIntRes.rawInteger}`);

// Test 10: Known RFC Sample conversion
const rfcSample = '550e8400-e29b-41d4-a716-446655440000';
const rfcIntRes = uuidToInteger(rfcSample);
assert(rfcIntRes.isValid, 'RFC sample UUID to integer is valid');
assert(rfcIntRes.rawInteger === '113059749145936325402354257176981405696', `RFC sample yields expected integer (got ${rfcIntRes.rawInteger})`);
assert(rfcIntRes.formattedInteger === '113,059,749,145,936,325,402,354,257,176,981,405,696', `Formatted integer includes commas`);

// Test 11: Case-insensitivity, braces, and hyphens in UUID to integer
const upperRes = uuidToInteger('550E8400-E29B-41D4-A716-446655440000');
assert(upperRes.isValid && upperRes.rawInteger === rfcIntRes.rawInteger, 'Uppercase UUID yields identical integer');

const bracedRes = uuidToInteger('{550e8400-e29b-41d4-a716-446655440000}');
assert(bracedRes.isValid && bracedRes.rawInteger === rfcIntRes.rawInteger, 'Braced UUID yields identical integer');

const noHyphenRes = uuidToInteger('550e8400e29b41d4a716446655440000');
assert(noHyphenRes.isValid && noHyphenRes.rawInteger === rfcIntRes.rawInteger, 'Unhyphenated UUID yields identical integer');

// Test 12: Invalid UUID inputs
assert(!uuidToInteger('').isValid, 'Empty string is rejected');
assert(!uuidToInteger('not-a-uuid').isValid, 'Non-UUID text is rejected');
assert(!uuidToInteger('550e8400-e29b-41d4-a716-44665544000g').isValid, 'Invalid hex char "g" is rejected');
assert(!uuidToInteger('550e8400-e29b-41d4-a716-4466554400').isValid, 'Too short UUID is rejected');
assert(!uuidToInteger('550e8400-e29b-41d4-a716-446655440000ff').isValid, 'Too long UUID is rejected');

// Test 13: Integer to UUID conversions
const intZeroRes = integerToUuid('0');
assert(intZeroRes.isValid && intZeroRes.canonicalUuid === '00000000-0000-0000-0000-000000000000', 'Integer 0 converts to Nil UUID');

const intMaxRes = integerToUuid('340282366920938463463374607431768211455');
assert(intMaxRes.isValid && intMaxRes.canonicalUuid === 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Max integer converts to Max UUID');

const intSampleRes = integerToUuid('113059749145936325402354257176981405696');
assert(intSampleRes.isValid && intSampleRes.canonicalUuid === rfcSample, 'Integer converts to RFC sample UUID');

const intWithCommas = integerToUuid('113,059,749,145,936,325,402,354,257,176,981,405,696');
assert(intWithCommas.isValid && intWithCommas.canonicalUuid === rfcSample, 'Integer with commas converts properly');

// Test 14: Integer to UUID validation & bounds
assert(!integerToUuid('').isValid, 'Empty integer input is rejected');
assert(!integerToUuid('-1').isValid, 'Negative integer is rejected');
assert(!integerToUuid('abc123').isValid, 'Non-numeric string is rejected');
assert(!integerToUuid('340282366920938463463374607431768211456').isValid, 'Integer > 2^128-1 is rejected');

// Test 15: Round-trip consistency for v4 and v7
const randV4 = generateUUIDv4();
const v4ToInt = uuidToInteger(randV4);
assert(v4ToInt.isValid, 'Random v4 to integer succeeds');
const intToV4 = integerToUuid(v4ToInt.rawInteger);
assert(intToV4.isValid && intToV4.canonicalUuid === randV4.toLowerCase(), 'Random v4 roundtrip preserves exact UUID');

const randV7 = generateUUIDv7();
const v7ToInt = uuidToInteger(randV7);
assert(v7ToInt.isValid, 'Random v7 to integer succeeds');
const intToV7 = integerToUuid(v7ToInt.rawInteger);
assert(intToV7.isValid && intToV7.canonicalUuid === randV7.toLowerCase(), 'Random v7 roundtrip preserves exact UUID');

// Test 16: UUID to Hex conversions
const hexRfcRes = uuidToHex(rfcSample);
assert(hexRfcRes.isValid, 'RFC sample to hex succeeds');
assert(hexRfcRes.rawHex === '550e8400e29b41d4a716446655440000', 'RFC sample produces exact 32 lowercase hex');
assert(hexRfcRes.uppercaseHex === '550E8400E29B41D4A716446655440000', 'RFC sample produces uppercase hex');
assert(hexRfcRes.prefixedHex === '0x550e8400e29b41d4a716446655440000', 'RFC sample produces 0x prefixed hex');
assert(hexRfcRes.spacedHex === '55 0e 84 00 e2 9b 41 d4 a7 16 44 66 55 44 00 00', 'RFC sample produces spaced hex');
assert(hexRfcRes.version === 4, 'RFC sample detects version 4');

const hexNilRes = uuidToHex('00000000-0000-0000-0000-000000000000');
assert(hexNilRes.isValid && hexNilRes.rawHex === '00000000000000000000000000000000', 'Nil UUID converts to 32 zeros hex');

const hexMaxRes = uuidToHex('ffffffff-ffff-ffff-ffff-ffffffffffff');
assert(hexMaxRes.isValid && hexMaxRes.rawHex === 'ffffffffffffffffffffffffffffffff', 'Max UUID converts to 32 fs hex');

// Braced GUID and URN support in uuidToHex
const hexBracedRes = uuidToHex('{550e8400-e29b-41d4-a716-446655440000}');
assert(hexBracedRes.isValid && hexBracedRes.rawHex === '550e8400e29b41d4a716446655440000', 'Braced GUID converts to hex');

const hexUrnRes = uuidToHex('urn:uuid:550e8400-e29b-41d4-a716-446655440000');
assert(hexUrnRes.isValid && hexUrnRes.rawHex === '550e8400e29b41d4a716446655440000', 'URN UUID converts to hex');

// Test 17: Invalid inputs to uuidToHex
assert(!uuidToHex('').isValid, 'Empty UUID input is rejected');
assert(!uuidToHex('invalid-hex-string').isValid, 'Invalid UUID string is rejected');
assert(!uuidToHex('550e8400-e29b-41d4-a716-44665544000g').isValid, 'UUID with non-hex char is rejected');
assert(!uuidToHex('550e8400-e29b-41d4-a716-4466554400').isValid, 'Short UUID is rejected');

// Test 18: Hex to UUID conversions
const toUuidRfcRes = hexToUuid('550e8400e29b41d4a716446655440000');
assert(toUuidRfcRes.isValid, '32 hex to UUID succeeds');
assert(toUuidRfcRes.canonicalUuid === rfcSample, '32 hex produces canonical RFC UUID');
assert(toUuidRfcRes.uppercaseUuid === rfcSample.toUpperCase(), '32 hex produces uppercase RFC UUID');

const toUuidPrefixedRes = hexToUuid('0x550e8400e29b41d4a716446655440000');
assert(toUuidPrefixedRes.isValid && toUuidPrefixedRes.canonicalUuid === rfcSample, '0x-prefixed hex converts to UUID');

const toUuidSpacedRes = hexToUuid('55 0e 84 00 e2 9b 41 d4 a7 16 44 66 55 44 00 00');
assert(toUuidSpacedRes.isValid && toUuidSpacedRes.canonicalUuid === rfcSample, 'Byte-spaced hex converts to UUID');

const toUuidUpperRes = hexToUuid('550E8400E29B41D4A716446655440000');
assert(toUuidUpperRes.isValid && toUuidUpperRes.canonicalUuid === rfcSample, 'Uppercase hex converts to lowercase UUID');

// Test 19: Invalid inputs to hexToUuid
assert(!hexToUuid('').isValid, 'Empty hex is rejected');
assert(!hexToUuid('12345').isValid, 'Short hex (5 chars) is rejected');
assert(!hexToUuid('550e8400e29b41d4a716446655440000ff').isValid, 'Long hex (34 chars) is rejected');
assert(!hexToUuid('550e8400e29b41d4a71644665544000g').isValid, 'Hex with "g" character is rejected');

// Test 20: Round-trip consistency for v4 and v7 in hex
const randV4Hex = uuidToHex(randV4);
assert(randV4Hex.isValid, 'Random v4 to hex succeeds');
const hexBackToV4 = hexToUuid(randV4Hex.rawHex);
assert(hexBackToV4.isValid && hexBackToV4.canonicalUuid === randV4.toLowerCase(), 'Random v4 hex roundtrip preserves exact UUID');

const randV7Hex = uuidToHex(randV7);
assert(randV7Hex.isValid, 'Random v7 to hex succeeds');
const hexBackToV7 = hexToUuid(randV7Hex.rawHex);
assert(hexBackToV7.isValid && hexBackToV7.canonicalUuid === randV7.toLowerCase(), 'Random v7 hex roundtrip preserves exact UUID');

// Test 21: UUID Version Detection for standard versions 1 through 8
const detV1 = detectUuidVersion(SAMPLE_UUID_V1);
assert(detV1.isValid && detV1.version === 1 && detV1.versionNibbleHex === '1' && detV1.variantCode === 'rfc4122', 'detectUuidVersion identifies UUID v1');

const dceSampleV2 = '000003e8-9dad-21d1-80b4-00c04fd430c8';
const detV2 = detectUuidVersion(dceSampleV2);
assert(detV2.isValid && detV2.version === 2 && detV2.versionNibbleHex === '2' && detV2.variantCode === 'rfc4122', 'detectUuidVersion identifies UUID v2');

const detV3 = detectUuidVersion(SAMPLE_UUID_V3);
assert(detV3.isValid && detV3.version === 3 && detV3.versionNibbleHex === '3' && detV3.variantCode === 'rfc4122', 'detectUuidVersion identifies UUID v3');

const detV4 = detectUuidVersion(SAMPLE_UUID_V4);
assert(detV4.isValid && detV4.version === 4 && detV4.versionNibbleHex === '4' && detV4.variantCode === 'rfc4122', 'detectUuidVersion identifies UUID v4');

const detV5 = detectUuidVersion(SAMPLE_UUID_V5);
assert(detV5.isValid && detV5.version === 5 && detV5.versionNibbleHex === '5' && detV5.variantCode === 'rfc4122', 'detectUuidVersion identifies UUID v5');

const detV6 = detectUuidVersion(SAMPLE_UUID_V6);
assert(detV6.isValid && detV6.version === 6 && detV6.versionNibbleHex === '6' && detV6.variantCode === 'rfc4122', 'detectUuidVersion identifies UUID v6');

const detV7 = detectUuidVersion(SAMPLE_UUID_V7);
assert(detV7.isValid && detV7.version === 7 && detV7.versionNibbleHex === '7' && detV7.variantCode === 'rfc4122', 'detectUuidVersion identifies UUID v7');

const detV8 = detectUuidVersion(SAMPLE_UUID_V8);
assert(detV8.isValid && detV8.version === 8 && detV8.versionNibbleHex === '8' && detV8.variantCode === 'rfc4122', 'detectUuidVersion identifies UUID v8');

// Test 22: Special Nil and Max UUID Detection
const detNil = detectUuidVersion('00000000-0000-0000-0000-000000000000');
assert(detNil.isValid && detNil.isNil && detNil.version === 0, 'detectUuidVersion identifies Nil UUID');

const detMax = detectUuidVersion('ffffffff-ffff-ffff-ffff-ffffffffffff');
assert(detMax.isValid && detMax.isMax && detMax.variantCode === 'reserved', 'detectUuidVersion identifies Max UUID');

// Test 23: Variant Detection (NCS, RFC 4122, Microsoft COM, Reserved)
const ncsUuid = '550e8400-e29b-41d4-7716-446655440000'; // 0x77 has high bit 0 -> NCS
const detNcs = detectUuidVersion(ncsUuid);
assert(detNcs.isValid && detNcs.variantCode === 'ncs', 'detectUuidVersion identifies NCS variant 0');

const rfcUuid = '550e8400-e29b-41d4-9716-446655440000'; // 0x97 has high bits 10 -> RFC 4122
const detRfc = detectUuidVersion(rfcUuid);
assert(detRfc.isValid && detRfc.variantCode === 'rfc4122', 'detectUuidVersion identifies RFC 4122 variant 1');

const msUuid = '550e8400-e29b-41d4-c716-446655440000'; // 0xc7 has high bits 110 -> Microsoft COM
const detMs = detectUuidVersion(msUuid);
assert(detMs.isValid && detMs.variantCode === 'microsoft', 'detectUuidVersion identifies Microsoft COM variant 2');

const resUuid = '550e8400-e29b-41d4-e716-446655440000'; // 0xe7 has high bits 111 -> Reserved
const detRes = detectUuidVersion(resUuid);
assert(detRes.isValid && detRes.variantCode === 'reserved', 'detectUuidVersion identifies Reserved variant 3');

// Test 24: Formats (braces, URN, uppercase, spaces)
const detBraced = detectUuidVersion('{550e8400-e29b-41d4-a716-446655440000}');
assert(detBraced.isValid && detBraced.version === 4, 'detectUuidVersion parses braced GUID');

const detUrn = detectUuidVersion('urn:uuid:018f6c38-8c50-7dc8-9366-4f4c2c51eb67');
assert(detUrn.isValid && detUrn.version === 7, 'detectUuidVersion parses URN UUID');

const detUpper = detectUuidVersion('550E8400-E29B-41D4-A716-446655440000');
assert(detUpper.isValid && detUpper.version === 4, 'detectUuidVersion handles uppercase UUID');

// Test 25: Error Handling
assert(!detectUuidVersion('').isValid, 'Empty input returns isValid: false');
assert(!detectUuidVersion('abc').isValid, 'Short string returns isValid: false');
assert(!detectUuidVersion('550e8400-e29b-41d4-a716-44665544000g').isValid, 'Non-hex char returns isValid: false');
assert(!detectUuidVersion('550e8400-e29b-41d4-a716-4466554400000').isValid, '33-char string returns isValid: false');

// Test 26: UUID v5 RFC 4122 Appendix B Test Vectors
const v5DnsPython = generateUUIDv5(NAMESPACE_DNS, 'python.org');
assert(v5DnsPython.isValid, 'UUID v5 DNS python.org is valid');
assert(v5DnsPython.uuid === '886313e1-3b8a-5372-9b90-0c9aee199e5d', `UUID v5 DNS python.org matches RFC 4122 test vector (got ${v5DnsPython.uuid})`);
assert(v5DnsPython.namespaceName === 'DNS', 'UUID v5 identifies DNS namespace');

const v5DnsWidgets = generateUUIDv5(NAMESPACE_DNS, 'www.widgets.com');
assert(v5DnsWidgets.isValid, 'UUID v5 DNS www.widgets.com is valid');
assert(v5DnsWidgets.uuid === '21f7f8de-8051-5b89-8680-0195ef798b6a', `UUID v5 DNS www.widgets.com matches RFC 4122 test vector (got ${v5DnsWidgets.uuid})`);

// Test 27: UUID v5 Standard Namespaces (URL, OID, X.500)
const v5Url = generateUUIDv5(NAMESPACE_URL, 'https://example.com/api/v1');
assert(v5Url.isValid && v5Url.namespaceName === 'URL', 'UUID v5 URL namespace is recognized');
assert(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v5Url.uuid), 'UUID v5 URL output conforms to v5 structure');

const v5Oid = generateUUIDv5(NAMESPACE_OID, '1.3.6.1.4.1.343');
assert(v5Oid.isValid && v5Oid.namespaceName === 'OID', 'UUID v5 OID namespace is recognized');

const v5X500 = generateUUIDv5(NAMESPACE_X500, 'CN=John Doe, OU=Engineering');
assert(v5X500.isValid && v5X500.namespaceName === 'X.500', 'UUID v5 X.500 namespace is recognized');

// Test 28: UUID v5 Determinism & Unicode Handling
const v5Unicode1 = generateUUIDv5(NAMESPACE_DNS, '🚀 FastUUID 128-bit 日本語 Café!');
const v5Unicode2 = generateUUIDv5(NAMESPACE_DNS, '🚀 FastUUID 128-bit 日本語 Café!');
assert(v5Unicode1.uuid === v5Unicode2.uuid, 'UUID v5 is 100% deterministic with multibyte UTF-8 Unicode');
assert(v5Unicode1.uuid.charAt(14) === '5', 'UUID v5 octet 6 high nibble is 5');
assert(['8', '9', 'a', 'b'].includes(v5Unicode1.uuid.charAt(19)), 'UUID v5 octet 8 high bits are RFC variant (8, 9, a, b)');

// Test 29: UUID v5 Custom Namespace, Braced, URN, & Uppercase
const customNs = '{550e8400-e29b-41d4-a716-446655440000}';
const v5Custom = generateUUIDv5(customNs, 'user_record_99214');
assert(v5Custom.isValid && v5Custom.namespaceName === 'Custom', 'UUID v5 custom namespace with braces is parsed');

const customNsUrn = 'urn:uuid:550e8400-e29b-41d4-a716-446655440000';
const v5CustomUrn = generateUUIDv5(customNsUrn, 'user_record_99214');
assert(v5Custom.uuid === v5CustomUrn.uuid, 'UUID v5 produces identical result regardless of braces or URN prefix in namespace');

// Test 30: UUID v5 Error Handling & Empty Inputs
const v5EmptyName = generateUUIDv5(NAMESPACE_DNS, '');
assert(v5EmptyName.isValid, 'UUID v5 allows empty name string per RFC specification');

const v5InvalidNs = generateUUIDv5('invalid-not-a-uuid', 'my_name');
assert(!v5InvalidNs.isValid && v5InvalidNs.error !== undefined, 'UUID v5 rejects invalid namespace with helpful error message');

const v5ShortNs = generateUUIDv5('6ba7b810-9dad-11d1-80b4', 'test');
assert(!v5ShortNs.isValid, 'UUID v5 rejects truncated namespace');

// Test 31: UUID v8 Random Mode (122-bit CSPRNG) Structure & Field Validation
const v8Rand1 = generateUUIDv8();
assert(v8Rand1.isValid, 'UUID v8 random generation produces valid result');
assert(/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v8Rand1.uuid), 'UUID v8 matches canonical RFC 9562 v8 regex');
assert(v8Rand1.versionNibble === '8', 'UUID v8 version nibble is strictly 8');
assert(['8', '9', 'a', 'b'].includes(v8Rand1.variantNibble), 'UUID v8 variant nibble conforms to RFC 9562 (8, 9, a, b)');
assert(v8Rand1.binary.length === 128, 'UUID v8 binary representation is exactly 128 bits');
assert(v8Rand1.customA.length === 13, 'UUID v8 customA is 8 chars + hyphen + 4 chars (13 chars)');
assert(v8Rand1.customB.length === 3, 'UUID v8 customB is 3 chars');
assert(v8Rand1.customC.length === 16, 'UUID v8 customC is 3 chars + hyphen + 12 chars');

// Test 32: UUID v8 Uniqueness and Randomness
const v8Rand2 = generateUUIDv8();
assert(v8Rand1.uuid !== v8Rand2.uuid, 'Subsequent UUID v8 random generations produce distinct values');

// Test 33: UUID v8 Custom Hex Mode - Strict Preservation of Version 8 & Variant Bits
// Even if custom input attempts to set version to '4' or 'f' and variant to '0', RFC 9562 bits MUST be enforced
const customInputAllF = 'ffffffffffffffffffffffffffffffff';
const v8Forced = generateUUIDv8({ customHex: customInputAllF });
assert(v8Forced.isValid, 'UUID v8 with 32 hex chars succeeds');
assert(v8Forced.uuid.charAt(14) === '8', 'UUID v8 forces version nibble 8 even if input had f');
assert(['8', '9', 'a', 'b'].includes(v8Forced.uuid.charAt(19)), 'UUID v8 forces RFC variant even if input had f');
assert(v8Forced.customA === 'ffffffff-ffff', 'UUID v8 preserves custom_a bits');
assert(v8Forced.customB === 'fff', 'UUID v8 preserves custom_b bits');

// Test 34: UUID v8 Custom Hex Padding (Zero and Random)
const shortPayload = '018f6c388c50'; // 12 hex chars
const v8ZeroPad = generateUUIDv8({ customHex: shortPayload, padding: 'zero' });
assert(v8ZeroPad.isValid, 'Short custom hex with zero padding succeeds');
assert(v8ZeroPad.rawHex.startsWith('018f6c388c50'), 'Custom payload placed at start of UUID v8');
assert(v8ZeroPad.rawHex.slice(12, 13) === '8', 'Version nibble 8 is enforced');
assert(v8ZeroPad.rawHex.endsWith('000000000000'), 'Trailing custom bits are zero-padded');

const v8RandPad = generateUUIDv8({ customHex: shortPayload, padding: 'random' });
assert(v8RandPad.isValid, 'Short custom hex with random padding succeeds');
assert(v8RandPad.rawHex.startsWith('018f6c388c50'), 'Custom payload placed at start with random padding');
assert(v8RandPad.rawHex.slice(12, 13) === '8', 'Version nibble 8 is enforced with random padding');

// Test 35: UUID v8 Custom Input Validation & Error Handling
const v8Empty = generateUUIDv8({ customHex: '' });
assert(!v8Empty.isValid && v8Empty.error !== undefined, 'UUID v8 rejects empty custom hex string');

const v8InvalidChars = generateUUIDv8({ customHex: '018f6c38-8c50-8dc8-9366-4f4c2c51eb6g' });
assert(!v8InvalidChars.isValid && v8InvalidChars.error !== undefined, 'UUID v8 rejects invalid hex character "g"');

const v8TooLong = generateUUIDv8({ customHex: '0123456789abcdef0123456789abcdef01' }); // 34 chars
assert(!v8TooLong.isValid && v8TooLong.error !== undefined, 'UUID v8 rejects custom hex longer than 32 characters');

// Verification with detectUuidVersion
const detGenV8 = detectUuidVersion(v8Rand1.uuid);
assert(detGenV8.isValid && detGenV8.version === 8 && detGenV8.variantCode === 'rfc4122', 'detectUuidVersion recognizes newly generated UUID v8');

console.log(`\nUnit Test Results: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ All cryptographic & formatting unit tests passed!');
  process.exit(0);
}
