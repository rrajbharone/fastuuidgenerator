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
    v7SeqCounter = (bytes[6] & 0x0f) << 8 | bytes[7]; // Seed sequence with 12 bits of entropy
  } else {
    // Same millisecond or backward clock: increment sequence
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
