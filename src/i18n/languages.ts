export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  id: { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
export const NON_ENGLISH_LANGUAGES = ['es', 'pt', 'fr', 'de', 'id', 'tr', 'it'] as const;
export type NonEnglishLanguageCode = typeof NON_ENGLISH_LANGUAGES[number];

export interface ToolRouteConfig {
  slug: string;
}

export const TOOL_ROUTES = [
  { slug: 'uuid-generator' },
  { slug: 'uuid-v4-generator' },
  { slug: 'uuid-v7-generator' },
  { slug: 'bulk-uuid-generator' },
  { slug: 'guid-generator' },
  { slug: 'uuid-validator' },
  { slug: 'uuid-decoder' },
] as const;

export type ToolSlug = typeof TOOL_ROUTES[number]['slug'];
