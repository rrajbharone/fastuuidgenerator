/**
 * FastUUIDGenerator - Cryptographically secure client-side UUID & GUID engine.
 * Fully compliant with RFC 4122 (UUID v1, v4) and RFC 9562 (UUID v7).
 */

export type UuidVersion = 'v4' | 'v7';

export interface FormatOptions {
  casing?: 'lowercase' | 'uppercase';
  hyphens?: boolean;
  braces?: boolean;
  quotes?: boolean;
  csharp?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  version: number | null;
  versionName: string;
  variant: string;
  isNil: boolean;
  isMax: boolean;
  cleanCanonical: string;
  length: number;
  entropyEstimateBits: number;
  message: string;
}

export interface DecodedUUID {
  isValid: boolean;
  version: number | null;
  versionName: string;
  variant: string;
  rawHex: string;
  binary: string;
  timestampUtc: string | null;
  timestampLocal: string | null;
  timestampUnixMs: number | null;
  clockSequence: number | null;
  nodeOrEntropy: string;
  isTimeBased: boolean;
}

/**
 * Generates a standard RFC 4122 UUID v4 using crypto.getRandomValues
 */
export function generateUUIDv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  
  // Set version 4: bits 4-7 of time_hi_and_version to 0100
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant RFC 4122: bits 6-7 of clock_seq_hi_and_reserved to 10
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  return bytesToHex(bytes);
}

// Global monotonic clock state for UUID v7 to guarantee strict monotonicity
let lastV7Timestamp = -1;
let v7SeqCounter = 0;

/**
 * Generates an RFC 9562 UUID v7 (Time-Ordered Unix Epoch + Entropy)
 */
export function generateUUIDv7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  let now = Date.now();
  if (now > lastV7Timestamp) {
    lastV7Timestamp = now;
    v7SeqCounter = ((bytes[6] & 0x0f) << 8) | bytes[7]; // Seed sequence with 12 bits of entropy
  } else {
    // Same millisecond or backward clock: preserve monotonicity
    now = lastV7Timestamp;
    v7SeqCounter = (v7SeqCounter + 1) & 0x0fff;
    if (v7SeqCounter === 0) {
      // Counter overflowed within millisecond, step timestamp forward
      now = ++lastV7Timestamp;
    }
  }

  // 48-bit timestamp (ms)
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // 4-bit version 7 + 12-bit sequence counter
  bytes[6] = 0x70 | ((v7SeqCounter >> 8) & 0x0f);
  bytes[7] = v7SeqCounter & 0xff;

  // 2-bit RFC 4122/9562 variant + 62 bits random entropy
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return bytesToHex(bytes);
}

/**
 * Formats a raw canonical UUID according to formatting options
 */
export function formatUUID(uuid: string, options: FormatOptions = {}): string {
  let clean = uuid.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length !== 32) return uuid;

  let formatted = '';
  if (options.hyphens !== false) {
    formatted = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
  } else {
    formatted = clean;
  }

  if (options.casing === 'uppercase') {
    formatted = formatted.toUpperCase();
  } else {
    formatted = formatted.toLowerCase();
  }

  if (options.csharp) {
    return `Guid.Parse("${formatted}")`;
  }

  if (options.braces) {
    formatted = `{${formatted}}`;
  }

  if (options.quotes) {
    formatted = `"${formatted}"`;
  }

  return formatted;
}

/**
 * Generates bulk UUIDs efficiently
 */
export function generateBulkUUIDs(
  version: UuidVersion,
  count: number,
  options: FormatOptions = {}
): string[] {
  const safeCount = Math.min(Math.max(1, Math.floor(count)), 10000);
  const results: string[] = new Array(safeCount);
  const generator = version === 'v7' ? generateUUIDv7 : generateUUIDv4;

  for (let i = 0; i < safeCount; i++) {
    results[i] = formatUUID(generator(), options);
  }

  return results;
}

/**
 * Validates any given UUID string according to RFC 4122 / RFC 9562
 */
export function validateUUID(input: string): ValidationResult {
  const trimmed = input.trim();
  const hexOnly = trimmed.replace(/[{}"'\s-]/g, '').toLowerCase();

  const isHex = /^[0-9a-f]{32}$/.test(hexOnly);
  if (!isHex) {
    return {
      isValid: false,
      version: null,
      versionName: 'Unknown',
      variant: 'Invalid',
      isNil: false,
      isMax: false,
      cleanCanonical: '',
      length: trimmed.length,
      entropyEstimateBits: 0,
      message: 'String is not 32 hexadecimal characters.',
    };
  }

  const canonical = `${hexOnly.slice(0, 8)}-${hexOnly.slice(8, 12)}-${hexOnly.slice(12, 16)}-${hexOnly.slice(16, 20)}-${hexOnly.slice(20, 32)}`;
  const isNil = hexOnly === '00000000000000000000000000000000';
  const isMax = hexOnly === 'ffffffffffffffffffffffffffffffff';

  if (isNil) {
    return {
      isValid: true,
      version: 0,
      versionName: 'Nil UUID (RFC 4122 / RFC 9562)',
      variant: 'NCS / Pre-RFC 4122',
      isNil: true,
      isMax: false,
      cleanCanonical: canonical,
      length: trimmed.length,
      entropyEstimateBits: 0,
      message: 'Valid Nil UUID (all zero bits).',
    };
  }

  if (isMax) {
    return {
      isValid: true,
      version: 0,
      versionName: 'Max UUID (RFC 9562)',
      variant: 'Reserved / Future',
      isNil: false,
      isMax: true,
      cleanCanonical: canonical,
      length: trimmed.length,
      entropyEstimateBits: 0,
      message: 'Valid Max UUID (all one bits).',
    };
  }

  const versionNibble = parseInt(hexOnly[12], 16);
  const variantByte = parseInt(hexOnly.slice(16, 18), 16);

  let variant = 'Unknown';
  if ((variantByte & 0x80) === 0x00) {
    variant = 'NCS backward compatible (0xxx)';
  } else if ((variantByte & 0xc0) === 0x80) {
    variant = 'RFC 4122 / RFC 9562 (IETF standard, 10xx)';
  } else if ((variantByte & 0xe0) === 0xc0) {
    variant = 'Microsoft Corporation backward compatible (110x)';
  } else {
    variant = 'Reserved for future definition (111x)';
  }

  const versionNames: Record<number, string> = {
    1: 'Version 1 (Date-Time & MAC Address)',
    2: 'Version 2 (DCE Security)',
    3: 'Version 3 (MD5 Namespace Hash)',
    4: 'Version 4 (Cryptographically Random)',
    5: 'Version 5 (SHA-1 Namespace Hash)',
    6: 'Version 6 (Reordered Date-Time)',
    7: 'Version 7 (Unix Epoch Milliseconds & Entropy)',
    8: 'Version 8 (Custom / Vendor-Specific)',
  };

  const versionName = versionNames[versionNibble] || `Version ${versionNibble} (Unknown)`;

  let entropyBits = 122;
  if (versionNibble === 7) entropyBits = 74;
  else if (versionNibble === 1) entropyBits = 48;

  return {
    isValid: true,
    version: versionNibble,
    versionName,
    variant,
    isNil: false,
    isMax: false,
    cleanCanonical: canonical,
    length: trimmed.length,
    entropyEstimateBits: entropyBits,
    message: 'Fully valid RFC standard UUID.',
  };
}

/**
 * Decodes detailed timestamp, clock sequence, and bitstream from UUID
 */
export function decodeUUID(input: string): DecodedUUID {
  const val = validateUUID(input);
  if (!val.isValid) {
    return {
      isValid: false,
      version: null,
      versionName: 'Invalid',
      variant: 'Invalid',
      rawHex: '',
      binary: '',
      timestampUtc: null,
      timestampLocal: null,
      timestampUnixMs: null,
      clockSequence: null,
      nodeOrEntropy: '',
      isTimeBased: false,
    };
  }

  const hex = val.cleanCanonical.replace(/-/g, '');
  let binary = '';
  for (let i = 0; i < hex.length; i++) {
    binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
  }

  let timestampUtc: string | null = null;
  let timestampLocal: string | null = null;
  let timestampUnixMs: number | null = null;
  let clockSeq: number | null = null;
  let nodeOrEntropy = hex.slice(20);
  let isTimeBased = false;

  if (val.version === 7) {
    // 48-bit Unix timestamp in ms
    const timeHex = hex.slice(0, 12);
    timestampUnixMs = parseInt(timeHex, 16);
    const date = new Date(timestampUnixMs);
    if (!isNaN(date.getTime())) {
      timestampUtc = date.toUTCString();
      timestampLocal = date.toLocaleString();
      isTimeBased = true;
    }
    clockSeq = parseInt(hex.slice(13, 16), 16);
  } else if (val.version === 1) {
    // 60-bit Gregorian timestamp (100-ns intervals since 1582-10-15)
    const timeLow = hex.slice(0, 8);
    const timeMid = hex.slice(8, 12);
    const timeHi = hex.slice(13, 16);
    const gregorianHex = `${timeHi}${timeMid}${timeLow}`;
    const gregorianIntervals = BigInt(`0x${gregorianHex}`);
    const unixMs = Number((gregorianIntervals - 122192928000000000n) / 10000n);
    timestampUnixMs = unixMs;
    const date = new Date(unixMs);
    if (!isNaN(date.getTime())) {
      timestampUtc = date.toUTCString();
      timestampLocal = date.toLocaleString();
      isTimeBased = true;
    }
    clockSeq = parseInt(hex.slice(16, 20), 16) & 0x3fff;
  }

  return {
    isValid: true,
    version: val.version,
    versionName: val.versionName,
    variant: val.variant,
    rawHex: hex,
    binary,
    timestampUtc,
    timestampLocal,
    timestampUnixMs,
    clockSequence: clockSeq,
    nodeOrEntropy,
    isTimeBased,
  };
}

function bytesToHex(bytes: Uint8Array): string {
  const hex: string[] = [];
  for (let i = 0; i < 16; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'));
  }
  return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}

/**
 * Converts a canonical or raw hex UUID into Base64 (standard and URL-safe).
 */
export function uuidToBase64(
  uuid: string,
  options: { urlSafe?: boolean; padding?: boolean } = {}
): string {
  const cleanHex = uuid.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length !== 32) return '';

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }

  let binString = '';
  for (let i = 0; i < 16; i++) {
    binString += String.fromCharCode(bytes[i]);
  }

  let base64 = typeof btoa !== 'undefined' ? btoa(binString) : Buffer.from(bytes).toString('base64');

  if (options.urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_');
  }

  if (options.padding === false) {
    base64 = base64.replace(/=+$/, '');
  }

  return base64;
}

export interface Base64DecodeResult {
  isValid: boolean;
  canonicalUuid: string;
  rawHex: string;
  urlSafeBase64: string;
  standardBase64: string;
  error?: string;
}

/**
 * Decodes standard or URL-safe Base64 UUID into canonical UUID format.
 */
export function base64ToUuid(input: string): Base64DecodeResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      canonicalUuid: '',
      rawHex: '',
      urlSafeBase64: '',
      standardBase64: '',
      error: 'Input string is empty.',
    };
  }

  if (!/^[A-Za-z0-9+/_-]+=*$/.test(trimmed)) {
    return {
      isValid: false,
      canonicalUuid: '',
      rawHex: '',
      urlSafeBase64: '',
      standardBase64: '',
      error: 'Invalid characters in Base64 string. Only [A-Za-z0-9+/_-] and padding = are allowed.',
    };
  }

  let standardB64 = trimmed.replace(/-/g, '+').replace(/_/g, '/');

  while (standardB64.length % 4 !== 0) {
    standardB64 += '=';
  }

  try {
    let binString = '';
    if (typeof atob !== 'undefined') {
      binString = atob(standardB64);
    } else {
      const buf = Buffer.from(standardB64, 'base64');
      binString = buf.toString('binary');
    }

    if (binString.length !== 16) {
      return {
        isValid: false,
        canonicalUuid: '',
        rawHex: '',
        urlSafeBase64: '',
        standardBase64: '',
        error: `Decoded payload is ${binString.length} bytes (expected exactly 16 bytes / 128 bits for a standard UUID).`,
      };
    }

    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      bytes[i] = binString.charCodeAt(i);
    }

    const canonicalUuid = bytesToHex(bytes);
    const rawHex = canonicalUuid.replace(/-/g, '');
    const urlSafeBase64 = standardB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return {
      isValid: true,
      canonicalUuid,
      rawHex,
      urlSafeBase64,
      standardBase64: standardB64,
    };
  } catch (e: any) {
    return {
      isValid: false,
      canonicalUuid: '',
      rawHex: '',
      urlSafeBase64: '',
      standardBase64: '',
      error: 'Malformed Base64 string: failed to decode.',
    };
  }
}

/**
 * Standard NIL and MAX UUID constants (RFC 4122 / RFC 9562).
 */
export const NIL_UUID = '00000000-0000-0000-0000-000000000000';
export const MAX_UUID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

/**
 * Maximum possible value for an unsigned 128-bit integer (2^128 - 1).
 */
export const MAX_UUID_BIGINT = 340282366920938463463374607431768211455n; // (1n << 128n) - 1n

/**
 * Formats a decimal integer string with comma thousand separators.
 */
export function formatIntegerWithCommas(intStr: string): string {
  if (!intStr || typeof intStr !== 'string') return '';
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export interface UuidToIntegerResult {
  isValid: boolean;
  rawInteger: string;
  formattedInteger: string;
  rawHex: string;
  canonicalUuid: string;
  error?: string;
}

/**
 * Converts a 128-bit UUID into its exact unsigned decimal integer representation.
 */
export function uuidToInteger(input: string): UuidToIntegerResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawInteger: '',
      formattedInteger: '',
      rawHex: '',
      canonicalUuid: '',
      error: 'Please enter a UUID to convert.',
    };
  }

  const hexOnly = trimmed.replace(/[{}"'\s-]/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hexOnly)) {
    return {
      isValid: false,
      rawInteger: '',
      formattedInteger: '',
      rawHex: '',
      canonicalUuid: '',
      error: 'Please enter a valid UUID.',
    };
  }

  try {
    const bigIntVal = BigInt('0x' + hexOnly);
    const rawInteger = bigIntVal.toString(10);
    const canonical = `${hexOnly.slice(0, 8)}-${hexOnly.slice(8, 12)}-${hexOnly.slice(12, 16)}-${hexOnly.slice(16, 20)}-${hexOnly.slice(20, 32)}`;

    return {
      isValid: true,
      rawInteger,
      formattedInteger: formatIntegerWithCommas(rawInteger),
      rawHex: hexOnly,
      canonicalUuid: canonical,
    };
  } catch {
    return {
      isValid: false,
      rawInteger: '',
      formattedInteger: '',
      rawHex: '',
      canonicalUuid: '',
      error: 'Failed to convert UUID to integer.',
    };
  }
}

export interface IntegerToUuidResult {
  isValid: boolean;
  canonicalUuid: string;
  uppercaseUuid: string;
  rawHex: string;
  rawInteger: string;
  error?: string;
}

/**
 * Converts an unsigned 128-bit decimal integer into its canonical UUID representation.
 */
export function integerToUuid(input: string): IntegerToUuidResult {
  const trimmed = input.trim().replace(/,/g, '');
  if (!trimmed) {
    return {
      isValid: false,
      canonicalUuid: '',
      uppercaseUuid: '',
      rawHex: '',
      rawInteger: '',
      error: 'Please enter an integer to convert.',
    };
  }

  if (!/^\d+$/.test(trimmed)) {
    return {
      isValid: false,
      canonicalUuid: '',
      uppercaseUuid: '',
      rawHex: '',
      rawInteger: '',
      error: 'Please enter a valid non-negative integer.',
    };
  }

  try {
    const bigIntVal = BigInt(trimmed);
    if (bigIntVal < 0n || bigIntVal > MAX_UUID_BIGINT) {
      return {
        isValid: false,
        canonicalUuid: '',
        uppercaseUuid: '',
        rawHex: '',
        rawInteger: '',
        error: 'The value must be within the 128-bit unsigned integer range (0 to 340282366920938463463374607431768211455).',
      };
    }

    const hex = bigIntVal.toString(16).padStart(32, '0').toLowerCase();
    const canonical = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;

    return {
      isValid: true,
      canonicalUuid: canonical,
      uppercaseUuid: canonical.toUpperCase(),
      rawHex: hex,
      rawInteger: bigIntVal.toString(10),
    };
  } catch {
    return {
      isValid: false,
      canonicalUuid: '',
      uppercaseUuid: '',
      rawHex: '',
      rawInteger: '',
      error: 'Failed to convert integer to UUID.',
    };
  }
}

export interface UuidToHexResult {
  isValid: boolean;
  rawHex: string;
  uppercaseHex: string;
  prefixedHex: string;
  spacedHex: string;
  canonicalUuid: string;
  uppercaseUuid: string;
  version: number | null;
  error?: string;
}

export interface HexToUuidResult {
  isValid: boolean;
  canonicalUuid: string;
  uppercaseUuid: string;
  rawHex: string;
  uppercaseHex: string;
  prefixedHex: string;
  spacedHex: string;
  error?: string;
}

/**
 * Converts a UUID into multiple hexadecimal representations.
 */
export function uuidToHex(input: string): UuidToHexResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawHex: '',
      uppercaseHex: '',
      prefixedHex: '',
      spacedHex: '',
      canonicalUuid: '',
      uppercaseUuid: '',
      version: null,
      error: 'Please enter a UUID to convert.',
    };
  }

  // Strip URN prefix, braces, hyphens, and whitespace
  let clean = trimmed
    .replace(/^urn:uuid:/i, '')
    .replace(/[{}]/g, '')
    .replace(/[-\s]/g, '');

  if (!/^[0-9a-fA-F]{32}$/.test(clean)) {
    return {
      isValid: false,
      rawHex: '',
      uppercaseHex: '',
      prefixedHex: '',
      spacedHex: '',
      canonicalUuid: '',
      uppercaseUuid: '',
      version: null,
      error: 'Please enter a valid UUID (32 hexadecimal characters).',
    };
  }

  const rawHex = clean.toLowerCase();
  const uppercaseHex = clean.toUpperCase();
  const canonicalUuid = `${rawHex.slice(0, 8)}-${rawHex.slice(8, 12)}-${rawHex.slice(12, 16)}-${rawHex.slice(16, 20)}-${rawHex.slice(20, 32)}`;
  const uppercaseUuid = canonicalUuid.toUpperCase();
  const prefixedHex = `0x${rawHex}`;
  const spacedHex = rawHex.match(/.{2}/g)?.join(' ') || rawHex;
  const version = parseInt(rawHex[12], 16);

  return {
    isValid: true,
    rawHex,
    uppercaseHex,
    prefixedHex,
    spacedHex,
    canonicalUuid,
    uppercaseUuid,
    version,
  };
}

/**
 * Converts a 32-character hexadecimal string back into a canonical 8-4-4-4-12 UUID.
 */
export function hexToUuid(input: string): HexToUuidResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      canonicalUuid: '',
      uppercaseUuid: '',
      rawHex: '',
      uppercaseHex: '',
      prefixedHex: '',
      spacedHex: '',
      error: 'Please enter a hexadecimal string to convert.',
    };
  }

  // Remove optional 0x/0X prefix, whitespace, colons, or dashes
  let clean = trimmed
    .replace(/^0[xX]/, '')
    .replace(/[\s:-]/g, '');

  if (clean.length !== 32) {
    return {
      isValid: false,
      canonicalUuid: '',
      uppercaseUuid: '',
      rawHex: '',
      uppercaseHex: '',
      prefixedHex: '',
      spacedHex: '',
      error: `Expected 32 hexadecimal characters (16 bytes), but got ${clean.length}.`,
    };
  }

  if (!/^[0-9a-fA-F]{32}$/.test(clean)) {
    return {
      isValid: false,
      canonicalUuid: '',
      uppercaseUuid: '',
      rawHex: '',
      uppercaseHex: '',
      prefixedHex: '',
      spacedHex: '',
      error: 'Hexadecimal string contains invalid characters (only 0-9 and a-f are allowed).',
    };
  }

  const rawHex = clean.toLowerCase();
  const uppercaseHex = clean.toUpperCase();
  const canonicalUuid = `${rawHex.slice(0, 8)}-${rawHex.slice(8, 12)}-${rawHex.slice(12, 16)}-${rawHex.slice(16, 20)}-${rawHex.slice(20, 32)}`;
  const uppercaseUuid = canonicalUuid.toUpperCase();
  const prefixedHex = `0x${rawHex}`;
  const spacedHex = rawHex.match(/.{2}/g)?.join(' ') || rawHex;

  return {
    isValid: true,
    canonicalUuid,
    uppercaseUuid,
    rawHex,
    uppercaseHex,
    prefixedHex,
    spacedHex,
  };
}

export interface UuidVersionDetectionResult {
  isValid: boolean;
  version: number | null;
  versionName: string;
  versionType: string;
  versionDescription: string;
  variant: string;
  variantCode: 'rfc4122' | 'ncs' | 'microsoft' | 'reserved' | 'invalid';
  variantDescription: string;
  versionNibbleHex: string;
  versionNibbleBits: string;
  variantNibbleHex: string;
  variantBits: string;
  cleanCanonical: string;
  isNil: boolean;
  isMax: boolean;
  rfcStandard: string;
  error?: string;
}

export const SAMPLE_UUID_V1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
export const SAMPLE_UUID_V3 = '6ba7b811-9dad-31d1-80b4-00c04fd430c8';
export const SAMPLE_UUID_V4 = '550e8400-e29b-41d4-a716-446655440000';
export const SAMPLE_UUID_V5 = '886313e1-3b8a-5372-9b90-0c9aee199e5d';
export const SAMPLE_UUID_V6 = '1ecb61c0-7f28-6000-8b90-00c04fd430c8';
export const SAMPLE_UUID_V7 = '018f6c38-8c50-7dc8-9366-4f4c2c51eb67';
export const SAMPLE_UUID_V8 = '018f6c38-8c50-8dc8-9366-4f4c2c51eb67';

/**
 * Accurately detects and inspects the UUID version and variant from the exact 128-bit bit pattern
 */
export function detectUuidVersion(input: string): UuidVersionDetectionResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      version: null,
      versionName: 'Unknown',
      versionType: 'Unknown',
      versionDescription: '',
      variant: 'Invalid',
      variantCode: 'invalid',
      variantDescription: '',
      versionNibbleHex: '',
      versionNibbleBits: '',
      variantNibbleHex: '',
      variantBits: '',
      cleanCanonical: '',
      isNil: false,
      isMax: false,
      rfcStandard: '',
      error: 'Please enter a UUID to detect its version.',
    };
  }

  // Strip URN prefix, braces, quotes, spaces, hyphens
  const clean = trimmed
    .replace(/^urn:uuid:/i, '')
    .replace(/[{}"'\s-]/g, '')
    .toLowerCase();

  if (clean.length !== 32) {
    return {
      isValid: false,
      version: null,
      versionName: 'Unknown',
      versionType: 'Unknown',
      versionDescription: '',
      variant: 'Invalid',
      variantCode: 'invalid',
      variantDescription: '',
      versionNibbleHex: '',
      versionNibbleBits: '',
      variantNibbleHex: '',
      variantBits: '',
      cleanCanonical: '',
      isNil: false,
      isMax: false,
      rfcStandard: '',
      error: `Invalid UUID — Expected 32 hexadecimal characters, but got ${clean.length}.`,
    };
  }

  if (!/^[0-9a-f]{32}$/.test(clean)) {
    return {
      isValid: false,
      version: null,
      versionName: 'Unknown',
      versionType: 'Unknown',
      versionDescription: '',
      variant: 'Invalid',
      variantCode: 'invalid',
      variantDescription: '',
      versionNibbleHex: '',
      versionNibbleBits: '',
      variantNibbleHex: '',
      variantBits: '',
      cleanCanonical: '',
      isNil: false,
      isMax: false,
      rfcStandard: '',
      error: 'Invalid UUID — Input contains non-hexadecimal characters.',
    };
  }

  const canonical = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
  const isNil = clean === '00000000000000000000000000000000';
  const isMax = clean === 'ffffffffffffffffffffffffffffffff';

  if (isNil) {
    return {
      isValid: true,
      version: 0,
      versionName: 'Nil UUID (All Zeros)',
      versionType: 'Special / Nil',
      versionDescription: 'A special-case UUID where all 128 bits are set to 0. It serves as an empty, default, or uninitialized placeholder in software systems.',
      variant: 'NCS / Pre-RFC 4122 (0xxx)',
      variantCode: 'ncs',
      variantDescription: 'High bit is 0, conforming to historical NCS backward compatibility.',
      versionNibbleHex: '0',
      versionNibbleBits: '0000',
      variantNibbleHex: '0',
      variantBits: '0000',
      cleanCanonical: canonical,
      isNil: true,
      isMax: false,
      rfcStandard: 'RFC 4122 / RFC 9562 §5.9',
    };
  }

  if (isMax) {
    return {
      isValid: true,
      version: null,
      versionName: 'Max UUID (All Ones)',
      versionType: 'Special / Sentinel',
      versionDescription: 'A special-case UUID standardized in RFC 9562 where all 128 bits are set to 1. Typically utilized as a sentinel or upper-bound value.',
      variant: 'Reserved for Future Definition (111x)',
      variantCode: 'reserved',
      variantDescription: 'High bits are 111, reserved for future protocol revisions.',
      versionNibbleHex: 'f',
      versionNibbleBits: '1111',
      variantNibbleHex: 'f',
      variantBits: '1111',
      cleanCanonical: canonical,
      isNil: false,
      isMax: true,
      rfcStandard: 'RFC 9562 §5.10',
    };
  }

  // Version nibble is character at index 12 (0-indexed in 32-char hex, or 14th char in canonical 8-4-4-4-12)
  const versionNibble = parseInt(clean[12], 16);
  const versionNibbleHex = clean[12];
  const versionNibbleBits = versionNibble.toString(2).padStart(4, '0');

  // Variant is encoded in the highest bits of character 16
  const variantByte = parseInt(clean.slice(16, 18), 16);
  const variantNibbleHex = clean[16];
  const variantNibbleVal = parseInt(clean[16], 16);
  const variantBits = variantNibbleVal.toString(2).padStart(4, '0');

  let variant = 'Unknown';
  let variantCode: 'rfc4122' | 'ncs' | 'microsoft' | 'reserved' = 'reserved';
  let variantDescription = '';

  if ((variantByte & 0x80) === 0x00) {
    variant = 'NCS Backward Compatible (0xxx)';
    variantCode = 'ncs';
    variantDescription = 'Variant 0: High bit 0 (0xxx). Preserves backward compatibility with early Apollo Network Computing System UUIDs.';
  } else if ((variantByte & 0xc0) === 0x80) {
    variant = 'RFC 4122 / RFC 9562 (IETF Standard, 10xx)';
    variantCode = 'rfc4122';
    variantDescription = 'Variant 1: High bits 10 (10xx). The standard universal Leach-Salz / IETF format utilized across modern software and web APIs.';
  } else if ((variantByte & 0xe0) === 0xc0) {
    variant = 'Microsoft Corporation COM GUID (110x)';
    variantCode = 'microsoft';
    variantDescription = 'Variant 2: High bits 110 (110x). Reserved for backward compatibility with early Microsoft Component Object Model (COM/DCOM) GUIDs.';
  } else {
    variant = 'Reserved for Future Definition (111x)';
    variantCode = 'reserved';
    variantDescription = 'Variant 3: High bits 111 (111x). Reserved by RFC 4122/9562 for future protocol extensions.';
  }

  const versionDetails: Record<number, { name: string; type: string; desc: string; rfc: string }> = {
    1: {
      name: 'Version 1 (Time-Based & MAC Address)',
      type: 'Gregorian Timestamp + Node',
      desc: 'Combines a 60-bit Gregorian timestamp (100-nanosecond intervals since October 15, 1582) with the generating machine’s 48-bit IEEE 802 MAC address.',
      rfc: 'RFC 4122 / RFC 9562 §5.1',
    },
    2: {
      name: 'Version 2 (DCE Security)',
      type: 'POSIX Security Identifier',
      desc: 'Distributed Computing Environment (DCE) Security version that embeds a local POSIX User ID (UID) or Group ID (GID) into the lower time field.',
      rfc: 'RFC 4122 / RFC 9562 §5.2',
    },
    3: {
      name: 'Version 3 (MD5 Namespace Hash)',
      type: 'Deterministic MD5 Hash',
      desc: 'Generates a deterministic 128-bit identifier by hashing a namespace UUID and a string name using the MD5 cryptographic digest algorithm.',
      rfc: 'RFC 4122 / RFC 9562 §5.3',
    },
    4: {
      name: 'Version 4 (Cryptographically Random)',
      type: 'Pseudo-Random (CSPRNG)',
      desc: 'Constructed using 122 bits of cryptographically secure random entropy (CSPRNG), offering virtually collision-free uniqueness across distributed nodes.',
      rfc: 'RFC 4122 / RFC 9562 §5.4',
    },
    5: {
      name: 'Version 5 (SHA-1 Namespace Hash)',
      type: 'Deterministic SHA-1 Hash',
      desc: 'Generates a deterministic identifier by hashing a namespace UUID and string name using SHA-1. Preferred over MD5-based UUID v3.',
      rfc: 'RFC 4122 / RFC 9562 §5.5',
    },
    6: {
      name: 'Version 6 (Reordered Date-Time)',
      type: 'Time-Ordered Gregorian',
      desc: 'A field-compatible reordering of UUID v1 with most-significant time bits placed first to provide database B-tree index locality.',
      rfc: 'RFC 9562 §5.6',
    },
    7: {
      name: 'Version 7 (Unix Epoch Time & Random Entropy)',
      type: 'Time-Ordered Unix Milliseconds',
      desc: 'The modern RFC 9562 standard embedding a 48-bit Unix Epoch millisecond timestamp followed by 74 bits of sub-millisecond sequence counter and entropy.',
      rfc: 'RFC 9562 §5.7',
    },
    8: {
      name: 'Version 8 (Custom / Vendor-Specific)',
      type: 'Custom Experimental Format',
      desc: 'Reserved by RFC 9562 for vendor-specific or experimental UUID structures that require custom internal layouts outside versions 1 through 7.',
      rfc: 'RFC 9562 §5.8',
    },
  };

  const matched = versionDetails[versionNibble];

  return {
    isValid: true,
    version: versionNibble,
    versionName: matched ? matched.name : `Version ${versionNibble} (Unknown / Non-Standard)`,
    versionType: matched ? matched.type : 'Non-Standard',
    versionDescription: matched ? matched.desc : 'The version nibble does not match standard RFC 4122 or RFC 9562 registered versions (1 through 8).',
    variant,
    variantCode,
    variantDescription,
    versionNibbleHex,
    versionNibbleBits,
    variantNibbleHex,
    variantBits,
    cleanCanonical: canonical,
    isNil: false,
    isMax: false,
    rfcStandard: matched ? matched.rfc : 'Non-Standard',
  };
}


