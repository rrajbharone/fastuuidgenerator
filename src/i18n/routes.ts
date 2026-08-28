import { type LanguageCode, LANGUAGE_CODES } from './languages';

export type ToolKey =
  | 'uuid-generator'
  | 'uuid-v4-generator'
  | 'uuid-v7-generator'
  | 'bulk-uuid-generator'
  | 'guid-generator'
  | 'base64-uuid-generator'
  | 'uuid-validator'
  | 'uuid-decoder'
  | 'tools';

export const TOOL_KEYS: ToolKey[] = [
  'uuid-generator',
  'uuid-v4-generator',
  'uuid-v7-generator',
  'bulk-uuid-generator',
  'guid-generator',
  'base64-uuid-generator',
  'uuid-validator',
  'uuid-decoder',
  'tools',
];

/**
 * Natural, SEO-friendly localized URL slugs for every tool across all 8 supported languages.
 */
export const TOOL_SLUGS: Record<LanguageCode, Record<ToolKey, string>> = {
  en: {
    'uuid-generator': 'uuid-generator',
    'uuid-v4-generator': 'uuid-v4-generator',
    'uuid-v7-generator': 'uuid-v7-generator',
    'bulk-uuid-generator': 'bulk-uuid-generator',
    'guid-generator': 'guid-generator',
    'base64-uuid-generator': 'base64-uuid-generator',
    'uuid-validator': 'uuid-validator',
    'uuid-decoder': 'uuid-decoder',
    'tools': 'tools',
  },
  es: {
    'uuid-generator': 'generador-de-uuid',
    'uuid-v4-generator': 'generador-uuid-v4',
    'uuid-v7-generator': 'generador-uuid-v7',
    'bulk-uuid-generator': 'generador-uuid-masivo',
    'guid-generator': 'generador-guid',
    'base64-uuid-generator': 'generador-uuid-base64',
    'uuid-validator': 'validador-uuid',
    'uuid-decoder': 'decodificador-uuid',
    'tools': 'herramientas',
  },
  pt: {
    'uuid-generator': 'gerador-de-uuid',
    'uuid-v4-generator': 'gerador-uuid-v4',
    'uuid-v7-generator': 'gerador-uuid-v7',
    'bulk-uuid-generator': 'gerador-uuid-em-massa',
    'guid-generator': 'gerador-guid',
    'base64-uuid-generator': 'gerador-uuid-base64',
    'uuid-validator': 'validador-uuid',
    'uuid-decoder': 'decodificador-uuid',
    'tools': 'ferramentas',
  },
  fr: {
    'uuid-generator': 'generateur-uuid',
    'uuid-v4-generator': 'generateur-uuid-v4',
    'uuid-v7-generator': 'generateur-uuid-v7',
    'bulk-uuid-generator': 'generateur-uuid-en-masse',
    'guid-generator': 'generateur-guid',
    'base64-uuid-generator': 'generateur-uuid-base64',
    'uuid-validator': 'validateur-uuid',
    'uuid-decoder': 'decodeur-uuid',
    'tools': 'outils',
  },
  de: {
    'uuid-generator': 'uuid-generator',
    'uuid-v4-generator': 'uuid-v4-generator',
    'uuid-v7-generator': 'uuid-v7-generator',
    'bulk-uuid-generator': 'bulk-uuid-generator',
    'guid-generator': 'guid-generator',
    'base64-uuid-generator': 'base64-uuid-generator',
    'uuid-validator': 'uuid-validator',
    'uuid-decoder': 'uuid-decoder',
    'tools': 'tools',
  },
  id: {
    'uuid-generator': 'pembuat-uuid',
    'uuid-v4-generator': 'pembuat-uuid-v4',
    'uuid-v7-generator': 'pembuat-uuid-v7',
    'bulk-uuid-generator': 'pembuat-uuid-massal',
    'guid-generator': 'pembuat-guid',
    'base64-uuid-generator': 'pembuat-uuid-base64',
    'uuid-validator': 'validator-uuid',
    'uuid-decoder': 'dekoder-uuid',
    'tools': 'alat',
  },
  tr: {
    'uuid-generator': 'uuid-olusturucu',
    'uuid-v4-generator': 'uuid-v4-olusturucu',
    'uuid-v7-generator': 'uuid-v7-olusturucu',
    'bulk-uuid-generator': 'toplu-uuid-olusturucu',
    'guid-generator': 'guid-olusturucu',
    'base64-uuid-generator': 'base64-uuid-olusturucu',
    'uuid-validator': 'uuid-dogrulayici',
    'uuid-decoder': 'uuid-kod-cozucu',
    'tools': 'araclar',
  },
  it: {
    'uuid-generator': 'generatore-di-uuid',
    'uuid-v4-generator': 'generatore-uuid-v4',
    'uuid-v7-generator': 'generatore-uuid-v7',
    'bulk-uuid-generator': 'generatore-uuid-massivo',
    'guid-generator': 'generatore-guid',
    'base64-uuid-generator': 'generatore-uuid-base64',
    'uuid-validator': 'validatore-uuid',
    'uuid-decoder': 'decodificatore-uuid',
    'tools': 'strumenti',
  },
};

/**
 * Reverse mapping from a localized slug to its canonical ToolKey.
 */
const REVERSE_SLUG_MAP = new Map<string, ToolKey>();

for (const lang of LANGUAGE_CODES) {
  const toolMap = TOOL_SLUGS[lang];
  for (const [toolKey, slug] of Object.entries(toolMap) as [ToolKey, string][]) {
    // Store localized slug mapping per language (e.g. "es:generador-uuid-base64" -> "base64-uuid-generator")
    REVERSE_SLUG_MAP.set(`${lang}:${slug}`, toolKey);
    // Also store generic slug fallback
    if (!REVERSE_SLUG_MAP.has(slug)) {
      REVERSE_SLUG_MAP.set(slug, toolKey);
    }
  }
}

/**
 * Extract canonical ToolKey from any path or slug (English, localized, or raw key).
 */
export function getToolKeyFromPath(pathOrSlug: string): ToolKey | null {
  if (!pathOrSlug) return null;

  // Clean path
  const clean = pathOrSlug.replace(/^\/+|\/+$/g, '');
  if (!clean) return null;

  const parts = clean.split('/').filter(Boolean);
  
  if (parts.length === 1) {
    const segment = parts[0];
    if (segment in TOOL_SLUGS.en) {
      return segment as ToolKey;
    }
    return REVERSE_SLUG_MAP.get(segment) || null;
  }

  if (parts.length >= 2) {
    const lang = parts[0] as LanguageCode;
    const slug = parts[1];
    return REVERSE_SLUG_MAP.get(`${lang}:${slug}`) || REVERSE_SLUG_MAP.get(slug) || null;
  }

  return null;
}
