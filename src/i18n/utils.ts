import { en } from './locales/en';
import { es } from './locales/es';
import { pt } from './locales/pt';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { id } from './locales/id';
import { tr } from './locales/tr';
import { it } from './locales/it';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type LanguageCode } from './languages';
import { TOOL_SLUGS, getToolKeyFromPath, type ToolKey } from './routes';
import type { TranslationDictionary } from './schema';

export const DICTIONARIES: Record<LanguageCode, TranslationDictionary> = {
  en,
  es,
  pt,
  fr,
  de,
  id,
  tr,
  it,
};

export function getTranslations(lang: LanguageCode | string): TranslationDictionary {
  if (lang in DICTIONARIES) {
    return DICTIONARIES[lang as LanguageCode];
  }
  return DICTIONARIES[DEFAULT_LANGUAGE];
}

export function isValidLanguage(lang: string): lang is LanguageCode {
  return lang in SUPPORTED_LANGUAGES;
}

/**
 * Returns the exact localized URL for any tool key or path in the specified target language.
 * Always formats as /<tool-slug>/ for English and /<lang>/<localized-slug>/ for other languages.
 */
export function getLocalizedPath(pathOrToolKey: string, lang: LanguageCode): string {
  if (!pathOrToolKey || pathOrToolKey === '/' || pathOrToolKey === `/${lang}/`) {
    return lang === 'en' ? '/' : `/${lang}/`;
  }

  // 1. Resolve canonical ToolKey
  const toolKey = getToolKeyFromPath(pathOrToolKey);

  if (toolKey) {
    const slug = TOOL_SLUGS[lang][toolKey];
    if (lang === 'en') {
      return `/${slug}/`;
    }
    return `/${lang}/${slug}/`;
  }

  // 2. Fallback for static non-tool paths (e.g. blog, about, contact, etc.)
  const cleanPath = pathOrToolKey.replace(/^\/+|\/+$/g, '');
  const parts = cleanPath.split('/').filter(Boolean);
  if (parts.length > 0 && isValidLanguage(parts[0])) {
    parts.shift();
  }
  const subpath = parts.join('/');
  
  if (!subpath) {
    return lang === 'en' ? '/' : `/${lang}/`;
  }

  if (lang === 'en') {
    return `/${subpath}/`;
  }
  return `/${lang}/${subpath}/`;
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return key in values ? String(values[key]) : `{${key}}`;
  });
}
