import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

console.log('--- Verifying Built Static HTML Files with Localized Slugs in dist/ ---');

const expectedTools = [
  'uuid-generator',
  'uuid-v4-generator',
  'uuid-v7-generator',
  'bulk-uuid-generator',
  'guid-generator',
  'base64-uuid-generator',
  'uuid-validator',
  'uuid-decoder',
  'uuid-to-integer-converter',
  'uuid-to-hex-converter',
  'uuid-version-detector',
  'uuid-v5-generator',
  'uuid-v8-generator',
  'tools'
];

const nonEnglishLanguages = ['es', 'pt', 'fr', 'de', 'id', 'tr', 'it'];
const allLanguages = ['en', ...nonEnglishLanguages];

const toolSlugs = {
  en: {
    'uuid-generator': 'uuid-generator',
    'uuid-v4-generator': 'uuid-v4-generator',
    'uuid-v7-generator': 'uuid-v7-generator',
    'bulk-uuid-generator': 'bulk-uuid-generator',
    'guid-generator': 'guid-generator',
    'base64-uuid-generator': 'base64-uuid-generator',
    'uuid-validator': 'uuid-validator',
    'uuid-decoder': 'uuid-decoder',
    'uuid-to-integer-converter': 'uuid-to-integer-converter',
    'uuid-to-hex-converter': 'uuid-to-hex-converter',
    'uuid-version-detector': 'uuid-version-detector',
    'uuid-v5-generator': 'uuid-v5-generator',
    'uuid-v8-generator': 'uuid-v8-generator',
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
    'uuid-to-integer-converter': 'convertidor-uuid-a-entero',
    'uuid-to-hex-converter': 'convertidor-uuid-a-hex',
    'uuid-version-detector': 'detector-de-version-uuid',
    'uuid-v5-generator': 'generador-uuid-v5',
    'uuid-v8-generator': 'generador-uuid-v8',
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
    'uuid-to-integer-converter': 'conversor-uuid-para-inteiro',
    'uuid-to-hex-converter': 'conversor-uuid-para-hex',
    'uuid-version-detector': 'detector-de-versao-uuid',
    'uuid-v5-generator': 'gerador-uuid-v5',
    'uuid-v8-generator': 'gerador-uuid-v8',
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
    'uuid-to-integer-converter': 'convertisseur-uuid-en-entier',
    'uuid-to-hex-converter': 'convertisseur-uuid-en-hex',
    'uuid-version-detector': 'detecteur-de-version-uuid',
    'uuid-v5-generator': 'generateur-uuid-v5',
    'uuid-v8-generator': 'generateur-uuid-v8',
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
    'uuid-to-integer-converter': 'uuid-in-integer-konverter',
    'uuid-to-hex-converter': 'uuid-in-hex-konverter',
    'uuid-version-detector': 'uuid-versions-detektor',
    'uuid-v5-generator': 'uuid-v5-generator',
    'uuid-v8-generator': 'uuid-v8-generator',
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
    'uuid-to-integer-converter': 'konverter-uuid-ke-integer',
    'uuid-to-hex-converter': 'konverter-uuid-ke-hex',
    'uuid-version-detector': 'detektor-versi-uuid',
    'uuid-v5-generator': 'pembuat-uuid-v5',
    'uuid-v8-generator': 'pembuat-uuid-v8',
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
    'uuid-to-integer-converter': 'uuid-integer-donusturucu',
    'uuid-to-hex-converter': 'uuid-hex-donusturucu',
    'uuid-version-detector': 'uuid-versiyon-tespit-edici',
    'uuid-v5-generator': 'uuid-v5-olusturucu',
    'uuid-v8-generator': 'uuid-v8-olusturucu',
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
    'uuid-to-integer-converter': 'convertitore-uuid-in-intero',
    'uuid-to-hex-converter': 'convertitore-uuid-in-hex',
    'uuid-version-detector': 'rilevatore-versione-uuid',
    'uuid-v5-generator': 'generatore-uuid-v5',
    'uuid-v8-generator': 'generatore-uuid-v8',
    'tools': 'strumenti',
  },
};

const uuidV5Headings = {
  en: 'What Is a UUID v5?',
  es: '¿Qué es un UUID v5?',
  pt: 'O Que É um UUID v5?',
  fr: 'Qu’est-ce qu’un UUID v5 ?',
  de: 'Was ist eine UUID v5?',
  id: 'Apa Itu UUID v5?',
  tr: 'UUID v5 Nedir?',
  it: 'Che Cos’è un UUID v5?',
};

const uuidV8Headings = {
  en: 'What Is a UUID v8?',
  es: '¿Qué es un UUID v8?',
  pt: 'O Que É um UUID v8?',
  fr: 'Qu’est-ce qu’un UUID v8 ?',
  de: 'Was ist eine UUID v8?',
  id: 'Apa Itu UUID v8?',
  tr: 'UUID v8 Nedir?',
  it: 'Cos’è un UUID v8?',
};

const expectedHeadings = {
  en: 'Everything You Need to Know About UUIDs &amp; GUIDs',
  es: 'Todo lo que Necesita Saber sobre UUIDs y GUIDs',
  pt: 'Tudo o que Você Precisa Saber Sobre UUIDs e GUIDs',
  fr: 'Tout ce que Vous Devez Savoir sur les UUID et GUID',
  de: 'Alles, was Sie über UUIDs und GUIDs wissen müssen',
  id: 'Semua yang Perlu Anda Ketahui Tentang UUID &amp; GUID',
  tr: 'UUID ve GUID Hakkında Bilmeniz Gereken Her Şey',
  it: 'Tutto Quello che Devi Sapere su UUID e GUID',
};

const base64Headings = {
  en: 'What is a Base64 UUID?',
  es: '¿Qué es un UUID Base64?',
  pt: 'O que é um UUID Base64?',
  fr: 'Qu’est-ce qu’un UUID Base64 ?',
  de: 'Was ist eine Base64-UUID?',
  id: 'Apa itu UUID Base64?',
  tr: 'Base64 UUID Nedir?',
  it: 'Cos’è un UUID Base64?',
};

const uuidToIntHeadings = {
  en: 'What Is a UUID?',
  es: '¿Qué es un UUID?',
  pt: 'O que é um UUID?',
  fr: 'Qu’est-ce qu’un UUID ?',
  de: 'Was ist eine UUID?',
  id: 'Apa itu UUID?',
  tr: 'UUID Nedir?',
  it: 'Cos’è un UUID?',
};

const uuidToHexHeadings = {
  en: 'What Is a UUID?',
  es: '¿Qué es un UUID?',
  pt: 'O que é um UUID?',
  fr: 'Qu’est-ce qu’un UUID ?',
  de: 'Was ist eine UUID?',
  id: 'Apa itu UUID?',
  tr: 'UUID Nedir?',
  it: 'Cos’è un UUID?',
};

const uuidVersionDetectorHeadings = {
  en: 'What Is a UUID Version?',
  es: '¿Qué es una Versión de UUID?',
  pt: 'O que é uma Versão de UUID?',
  fr: 'Qu’est-ce qu’une Version d’UUID ?',
  de: 'Was ist eine UUID-Version?',
  id: 'Apa Itu Versi UUID?',
  tr: 'UUID Sürümü Nedir?',
  it: 'Cos’è una Versione di UUID?',
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
  } else {
    testsFailed++;
    console.error(`❌ FAIL: ${message}`);
  }
}

function getExpectedUrl(tool, lang) {
  const slug = toolSlugs[lang][tool];
  if (lang === 'en') {
    return `https://fastuuidgenerator.com/${slug}/`;
  }
  return `https://fastuuidgenerator.com/${lang}/${slug}/`;
}

// 1. Verify English root tool pages
for (const tool of expectedTools) {
  const slug = toolSlugs.en[tool];
  const filePath = path.join(distDir, slug, 'index.html');
  assert(fs.existsSync(filePath), `English root tool page exists: ${slug}/index.html`);
  
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf-8');
    
    // Check html lang
    assert(html.includes('<html lang="en"'), `English ${tool} has <html lang="en">`);
    
    // Check self-referencing canonical (must be /${slug}/ without /en/)
    const expectedCanonical = getExpectedUrl(tool, 'en');
    assert(html.includes(`rel="canonical" href="${expectedCanonical}"`), `English ${tool} has canonical ${expectedCanonical}`);
    
    // Check hreflangs for all 8 languages (must point to localized URLs!)
    for (const lang of allLanguages) {
      const expectedHref = getExpectedUrl(tool, lang);
      assert(html.includes(`hreflang="${lang}" href="${expectedHref}"`), `English ${tool} has hreflang="${lang}" pointing to ${expectedHref}`);
    }
    assert(html.includes(`hreflang="x-default" href="${expectedCanonical}"`), `English ${tool} has x-default pointing to English canonical`);
    
    // Check content isolation for Base64 UUID Generator
    if (tool === 'base64-uuid-generator') {
      assert(html.includes(base64Headings.en), `English Base64 tool contains dedicated heading "${base64Headings.en}"`);
      assert(html.includes('id="article-base64-uuid"'), 'English Base64 tool contains technical article');
      assert(!html.includes('id="card-what-is-base64-uuid"'), 'English Base64 tool does NOT put technical content inside cards');
      assert(!html.includes('base64-guide-container'), 'English Base64 tool does NOT contain separate guide section');
      assert(!html.includes('id="tools-showcase-heading"'), 'English Base64 tool does NOT contain generic popular tools showcase');
      assert(!html.includes(expectedHeadings.en), 'English Base64 tool does NOT contain generic "Everything You Need to Know" section');
      assert(!html.includes('UUID vs GUID: Standards and Interoperability'), 'English Base64 tool does NOT contain generic UUID vs GUID section');
    } else if (tool === 'uuid-to-integer-converter') {
      assert(html.includes(uuidToIntHeadings.en), `English UUID to Integer tool contains dedicated heading "${uuidToIntHeadings.en}"`);
      assert(html.includes('id="article-uuid-to-integer"'), 'English UUID to Integer tool contains technical article');
      assert(!html.includes('id="card-what-is-uuid-to-integer"'), 'English UUID to Integer tool does NOT put technical content inside cards');
      assert(!html.includes(expectedHeadings.en), 'English UUID to Integer tool does NOT contain generic "Everything You Need to Know" section');
    } else if (tool === 'uuid-to-hex-converter') {
      assert(html.includes(uuidToHexHeadings.en), `English UUID to Hex tool contains dedicated heading "${uuidToHexHeadings.en}"`);
      assert(html.includes('id="article-uuid-to-hex"'), 'English UUID to Hex tool contains technical article');
      assert(!html.includes('id="card-what-is-uuid"'), 'English UUID to Hex tool does NOT put technical content inside cards');
      assert(!html.includes(expectedHeadings.en), 'English UUID to Hex tool does NOT contain generic "Everything You Need to Know" section');
    } else if (tool === 'uuid-version-detector') {
      assert(html.includes(uuidVersionDetectorHeadings.en), `English UUID Version Detector tool contains dedicated heading "${uuidVersionDetectorHeadings.en}"`);
      assert(html.includes('id="article-uuid-version-detector"'), 'English UUID Version Detector tool contains technical article');
      assert(!html.includes('id="card-what-is-detector"'), 'English UUID Version Detector tool does NOT put technical content inside cards');
      assert(!html.includes(expectedHeadings.en), 'English UUID Version Detector tool does NOT contain generic "Everything You Need to Know" section');
    } else if (tool === 'uuid-v5-generator') {
      assert(html.includes(uuidV5Headings.en), `English UUID v5 Generator tool contains dedicated heading "${uuidV5Headings.en}"`);
      assert(html.includes('id="article-uuid-v5"'), 'English UUID v5 Generator tool contains technical article');
      assert(!html.includes('id="card-what-is-v5"'), 'English UUID v5 Generator tool does NOT put technical content inside cards');
      assert(!html.includes(expectedHeadings.en), 'English UUID v5 Generator tool does NOT contain generic "Everything You Need to Know" section');
    } else if (tool === 'uuid-v8-generator') {
      assert(html.includes(uuidV8Headings.en), `English UUID v8 Generator tool contains dedicated heading "${uuidV8Headings.en}"`);
      assert(html.includes('id="uuid-v8-generator-tool"'), 'English UUID v8 Generator tool contains interactive tool card');
      assert(html.includes('id="article-uuid-v8"'), 'English UUID v8 Generator tool contains technical article');
      assert(!html.includes('id="card-what-is-v8"'), 'English UUID v8 Generator tool does NOT put technical content inside cards');
      assert(!html.includes(expectedHeadings.en), 'English UUID v8 Generator tool does NOT contain generic "Everything You Need to Know" section');
    } else if (tool === 'tools') {
      assert(html.includes('id="tools-showcase-heading"'), 'English Tools page contains tools showcase');
      assert(!html.includes(expectedHeadings.en), 'English Tools page does NOT contain generic "Everything You Need to Know" section');
      assert(html.includes('id="lang-dropdown-btn"'), 'English Tools page contains language dropdown button');
    } else {
      assert(html.includes(expectedHeadings.en), `English ${tool} contains translated heading "${expectedHeadings.en}"`);
    }
    
    // Check footer logo and brand
    assert(html.includes('class="footer-brand"'), `English ${tool} contains footer brand element`);
    assert(html.includes('class="footer-logo-icon"'), `English ${tool} contains footer logo icon`);
    assert(html.includes('FastUUIDGenerator'), `English ${tool} displays FastUUIDGenerator brand name in footer`);
    
    // Check centered footer copyright
    assert(html.includes('class="footer-copyright"'), `English ${tool} contains footer-copyright element`);
    assert(html.includes('All rights reserved.'), `English ${tool} contains copyright text`);
    
    // Check performance optimized font stack and charset
    assert(html.includes('charset="utf-8"'), `English ${tool} contains charset`);
    assert(html.includes('viewport'), `English ${tool} contains responsive viewport`);
  }
}

// 1b. Check English main homepage H1 is "UUID Generator" and 14 FAQs
const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
assert(indexHtml.includes('<h1>UUID Generator</h1>'), 'Homepage H1 is "UUID Generator"');
assert(!indexHtml.includes('<h1>Fast UUID Generator</h1>'), 'Homepage H1 does NOT contain "Fast UUID Generator"');
assert(!indexHtml.includes('<h1>Fast UUID &amp; GUID Generator</h1>') && !indexHtml.includes('<h1>Fast UUID & GUID Generator</h1>'), 'Homepage H1 does NOT contain "& GUID"');

// Header Navigation checks: GUID, Decoder, Blog, Tools (Validator removed, Tools immediately after Blog)
assert(indexHtml.includes('class="nav-links desktop-nav"'), 'Desktop nav exists');
const desktopNavChunk = indexHtml.split('class="nav-links desktop-nav"')[1].split('</ul>')[0];
assert(desktopNavChunk.includes('href="/guid-generator/"'), 'Desktop nav contains GUID Generator link');
assert(!desktopNavChunk.includes('href="/uuid-validator/"'), 'Desktop nav does NOT contain Validator link');
assert(desktopNavChunk.includes('href="/uuid-decoder/"'), 'Desktop nav contains UUID Decoder link');
assert(desktopNavChunk.includes('href="/blog/"'), 'Desktop nav contains Blog link');
assert(desktopNavChunk.includes('href="/tools/"'), 'Desktop nav contains Tools link');
assert(desktopNavChunk.indexOf('href="/blog/"') < desktopNavChunk.indexOf('href="/tools/"'), 'Tools link is immediately after Blog link in desktop nav');

// Homepage Popular Tools: Exactly 3 tools (Base64, Bulk, Validator) + More Tools button
assert(indexHtml.includes('href="/base64-uuid-generator/"'), 'Homepage contains Base64 UUID Generator card');
assert(indexHtml.includes('href="/bulk-uuid-generator/"'), 'Homepage contains Bulk UUID Generator card');
assert(indexHtml.includes('href="/uuid-validator/"'), 'Homepage contains UUID Validator card');
assert(indexHtml.includes('more-tools-btn') && indexHtml.includes('href="/tools/"'), 'Homepage contains More Tools button linking to /tools/');

// Check English homepage has exactly 14 FAQ items in HTML and FAQPage Schema
const enFaqCount = (indexHtml.match(/class="faq-item"/g) || []).length;
assert(enFaqCount === 14, `English homepage has exactly 14 FAQ items (found ${enFaqCount})`);
assert(indexHtml.includes('What is the format of UUID?'), 'English homepage contains FAQ 1: What is the format of UUID?');
assert(indexHtml.includes('What is a UUID generator?'), 'English homepage contains FAQ 2: What is a UUID generator?');
assert(indexHtml.includes('Where can I find my UUID?'), 'English homepage contains FAQ 3: Where can I find my UUID?');
assert(indexHtml.includes('How can I create a UUID?'), 'English homepage contains FAQ 4: How can I create a UUID?');
assert(indexHtml.includes('How to identify a UUID?'), 'English homepage contains FAQ 5: How to identify a UUID?');
assert(indexHtml.includes('Can UUID be duplicate?'), 'English homepage contains FAQ 6: Can UUID be duplicate?');
assert(indexHtml.includes('What is a UUID vs ID?'), 'English homepage contains FAQ 7: What is a UUID vs ID?');
assert(!indexHtml.includes('Is a UUID valid?'), 'English homepage does NOT contain removed FAQ "Is a UUID valid?"');
assert(indexHtml.includes('What does UUID mean?'), 'English homepage contains FAQ 8: What does UUID mean?');
assert(indexHtml.includes('Why do we need UUID?'), 'English homepage contains FAQ 9: Why do we need UUID?');
assert(!indexHtml.includes('Can we decode UUID?'), 'English homepage does NOT contain removed FAQ "Can we decode UUID?"');
assert(indexHtml.includes('Is using UUID safe?'), 'English homepage contains FAQ 10: Is using UUID safe?');
assert(indexHtml.includes('How do I use UUID?'), 'English homepage contains FAQ 11: How do I use UUID?');
assert(indexHtml.includes('Can I decode UUID?'), 'English homepage contains FAQ 12: Can I decode UUID?');
assert(indexHtml.includes('Is it safe to generate UUIDs online?'), 'English homepage contains FAQ 13: Is it safe to generate UUIDs online?');
assert(indexHtml.includes('How do I convert a UUID to an integer?'), 'English homepage contains FAQ 14: How do I convert a UUID to an integer?');

// Check FAQPage schema on English homepage
const enSchemaBlocks = indexHtml.split('<script type="application/ld+json">').slice(1).map(s => s.split('</script>')[0]);
const enFaqSchemaText = enSchemaBlocks.find(s => s.includes('"@type":"FAQPage"'));
assert(Boolean(enFaqSchemaText), 'English homepage contains FAQPage JSON-LD schema');
if (enFaqSchemaText) {
  const parsedFaq = JSON.parse(enFaqSchemaText);
  assert(parsedFaq.mainEntity && parsedFaq.mainEntity.length === 14, `English FAQPage schema has exactly 14 entities (found ${parsedFaq.mainEntity?.length})`);
  assert(parsedFaq.mainEntity[0].name === 'What is the format of UUID?', 'English FAQPage schema entity 0 is "What is the format of UUID?"');
  assert(parsedFaq.mainEntity[13].name === 'How do I convert a UUID to an integer?', 'English FAQPage schema entity 13 is "How do I convert a UUID to an integer?"');
}

// 2. Verify non-English localized tool pages
for (const lang of nonEnglishLanguages) {
  for (const tool of expectedTools) {
    const slug = toolSlugs[lang][tool];
    const filePath = path.join(distDir, lang, slug, 'index.html');
    assert(fs.existsSync(filePath), `Localized tool page exists: ${lang}/${slug}/index.html`);
    
    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, 'utf-8');
      
      // Check html lang
      assert(html.includes(`<html lang="${lang}"`), `${lang}/${slug} has <html lang="${lang}">`);
      
      // Check self-referencing canonical with localized slug
      const expectedCanonical = getExpectedUrl(tool, lang);
      assert(html.includes(`rel="canonical" href="${expectedCanonical}"`), `${lang}/${slug} has canonical ${expectedCanonical}`);
      
      // Check reciprocal hreflang tags for all 8 languages
      for (const targetLang of allLanguages) {
        const expectedHref = getExpectedUrl(tool, targetLang);
        assert(html.includes(`hreflang="${targetLang}" href="${expectedHref}"`), `${lang}/${slug} has hreflang="${targetLang}" pointing to ${expectedHref}`);
      }
      
      // Check x-default points to default English URL
      const englishCanonical = getExpectedUrl(tool, 'en');
      assert(html.includes(`hreflang="x-default" href="${englishCanonical}"`), `${lang}/${slug} has x-default pointing to ${englishCanonical}`);
      
      // Check content isolation for Base64 UUID Generator
      if (tool === 'base64-uuid-generator') {
        assert(html.includes(base64Headings[lang]), `${lang}/${slug} contains dedicated heading "${base64Headings[lang]}"`);
        assert(html.includes('id="article-base64-uuid"'), `${lang}/${slug} contains technical article`);
        assert(!html.includes('id="card-what-is-base64-uuid"'), `${lang}/${slug} does NOT put technical content inside cards`);
        assert(!html.includes('base64-guide-container'), `${lang}/${slug} does NOT contain separate guide section`);
        assert(!html.includes('id="tools-showcase-heading"'), `${lang}/${slug} does NOT contain generic popular tools showcase`);
        assert(!html.includes(expectedHeadings[lang]), `${lang}/${slug} does NOT contain generic "Everything You Need to Know" section`);
      } else if (tool === 'uuid-to-integer-converter') {
        assert(html.includes(uuidToIntHeadings[lang]), `${lang}/${slug} contains dedicated heading "${uuidToIntHeadings[lang]}"`);
        assert(html.includes('id="article-uuid-to-integer"'), `${lang}/${slug} contains technical article`);
        assert(!html.includes('id="card-what-is-uuid-to-integer"'), `${lang}/${slug} does NOT put technical content inside cards`);
        assert(!html.includes(expectedHeadings[lang]), `${lang}/${slug} does NOT contain generic "Everything You Need to Know" section`);
      } else if (tool === 'uuid-to-hex-converter') {
        assert(html.includes(uuidToHexHeadings[lang]), `${lang}/${slug} contains dedicated heading "${uuidToHexHeadings[lang]}"`);
        assert(html.includes('id="article-uuid-to-hex"'), `${lang}/${slug} contains technical article`);
        assert(!html.includes('id="card-what-is-uuid"'), `${lang}/${slug} does NOT put technical content inside cards`);
        assert(!html.includes(expectedHeadings[lang]), `${lang}/${slug} does NOT contain generic "Everything You Need to Know" section`);
      } else if (tool === 'uuid-version-detector') {
        assert(html.includes(uuidVersionDetectorHeadings[lang]), `${lang}/${slug} contains dedicated heading "${uuidVersionDetectorHeadings[lang]}"`);
        assert(html.includes('id="article-uuid-version-detector"'), `${lang}/${slug} contains technical article`);
        assert(!html.includes('id="card-what-is-detector"'), `${lang}/${slug} does NOT put technical content inside cards`);
        assert(!html.includes(expectedHeadings[lang]), `${lang}/${slug} does NOT contain generic "Everything You Need to Know" section`);
      } else if (tool === 'uuid-v5-generator') {
        assert(html.includes(uuidV5Headings[lang]), `${lang}/${slug} contains dedicated heading "${uuidV5Headings[lang]}"`);
        assert(html.includes('id="article-uuid-v5"'), `${lang}/${slug} contains technical article`);
        assert(!html.includes('id="card-what-is-v5"'), `${lang}/${slug} does NOT put technical content inside cards`);
        assert(!html.includes(expectedHeadings[lang]), `${lang}/${slug} does NOT contain generic "Everything You Need to Know" section`);
      } else if (tool === 'uuid-v8-generator') {
        assert(html.includes(uuidV8Headings[lang]), `${lang}/${slug} contains dedicated heading "${uuidV8Headings[lang]}"`);
        assert(html.includes('id="uuid-v8-generator-tool"'), `${lang}/${slug} contains interactive tool card`);
        assert(html.includes('id="article-uuid-v8"'), `${lang}/${slug} contains technical article`);
        assert(!html.includes('id="card-what-is-v8"'), `${lang}/${slug} does NOT put technical content inside cards`);
        assert(!html.includes(expectedHeadings[lang]), `${lang}/${slug} does NOT contain generic "Everything You Need to Know" section`);
      } else if (tool === 'tools') {
        assert(html.includes('id="tools-showcase-heading"'), `${lang}/${slug} contains tools showcase`);
        assert(!html.includes(expectedHeadings[lang]), `${lang}/${slug} does NOT contain generic "Everything You Need to Know" section`);
        assert(html.includes('id="lang-dropdown-btn"'), `${lang}/${slug} contains language dropdown button`);
        // Check that all 8 tools on localized tools page link to localized URLs
        for (const subTool of expectedTools.filter(t => t !== 'tools')) {
          const subSlug = toolSlugs[lang][subTool];
          assert(html.includes(`href="/${lang}/${subSlug}/"`), `${lang}/${slug} contains localized link to /${lang}/${subSlug}/`);
        }
      } else {
        assert(html.includes(expectedHeadings[lang]), `${lang}/${slug} contains translated heading "${expectedHeadings[lang]}"`);
        assert(!html.includes(expectedHeadings.en), `${lang}/${slug} does NOT contain untranslated English heading`);
      }
      
      // Check footer logo and brand
      assert(html.includes('class="footer-brand"'), `${lang}/${slug} contains footer brand element`);
      assert(html.includes('class="footer-copyright"'), `${lang}/${slug} contains footer copyright`);
    }

    // 2b. Check legacy redirect page if English slug differs from localized slug
    if (tool !== slug) {
      const legacyPath = path.join(distDir, lang, tool, 'index.html');
      assert(fs.existsSync(legacyPath), `Legacy redirect page exists: ${lang}/${tool}/index.html`);
      if (fs.existsSync(legacyPath)) {
        const legacyHtml = fs.readFileSync(legacyPath, 'utf-8');
        const targetUrl = `/${lang}/${slug}/`;
        assert(legacyHtml.includes(`http-equiv="refresh" content="0;url=${targetUrl}"`), `Legacy ${lang}/${tool} has refresh tag to ${targetUrl}`);
        assert(legacyHtml.includes('name="robots" content="noindex, follow"'), `Legacy ${lang}/${tool} has noindex tag`);
      }
    }
  }

  // 2c. Check non-English localized homepage index.html
  const langIndexPath = path.join(distDir, lang, 'index.html');
  assert(fs.existsSync(langIndexPath), `Localized homepage exists: ${lang}/index.html`);
  if (fs.existsSync(langIndexPath)) {
    const langIndexHtml = fs.readFileSync(langIndexPath, 'utf-8');
    const langFaqCount = (langIndexHtml.match(/class="faq-item"/g) || []).length;
    assert(langFaqCount === 14, `${lang}/index.html has exactly 14 FAQ items (found ${langFaqCount})`);
    
    // Check FAQPage schema
    const schemaBlocks = langIndexHtml.split('<script type="application/ld+json">').slice(1).map(s => s.split('</script>')[0]);
    const langFaqSchemaText = schemaBlocks.find(s => s.includes('"@type":"FAQPage"'));
    assert(Boolean(langFaqSchemaText), `${lang}/index.html contains FAQPage JSON-LD schema`);
    if (langFaqSchemaText) {
      const parsed = JSON.parse(langFaqSchemaText);
      assert(parsed.mainEntity && parsed.mainEntity.length === 14, `${lang}/index.html FAQPage schema has 14 entities (found ${parsed.mainEntity?.length})`);
    }
  }
}

// 3. Verify English-only pages
const englishOnlyPages = [
  'blog/index.html',
  'about/index.html',
  'contact/index.html',
  'privacy-policy/index.html',
  'terms-of-service/index.html',
];

for (const page of englishOnlyPages) {
  const filePath = path.join(distDir, page);
  assert(fs.existsSync(filePath), `English-only page exists: ${page}`);
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf-8');
    assert(html.includes('<html lang="en"'), `${page} has <html lang="en">`);
    assert(!html.includes('hreflang="es"'), `${page} does NOT have hreflang="es"`);
  }
}

// 3a. Verify /tools/ dedicated page displays all 11 tools
const toolsHtml = fs.readFileSync(path.join(distDir, 'tools', 'index.html'), 'utf-8');
assert(toolsHtml.includes('href="/base64-uuid-generator/"'), '/tools page contains Base64 UUID Generator');
assert(toolsHtml.includes('href="/bulk-uuid-generator/"'), '/tools page contains Bulk UUID Generator');
assert(toolsHtml.includes('href="/uuid-validator/"'), '/tools page contains UUID Validator');
assert(toolsHtml.includes('href="/uuid-v4-generator/"'), '/tools page contains UUID v4 Generator');
assert(toolsHtml.includes('href="/uuid-v7-generator/"'), '/tools page contains UUID v7 Generator');
assert(toolsHtml.includes('href="/guid-generator/"'), '/tools page contains GUID Generator');
assert(toolsHtml.includes('href="/uuid-decoder/"'), '/tools page contains UUID Decoder');
assert(toolsHtml.includes('href="/uuid-to-integer-converter/"'), '/tools page contains UUID to Integer Converter');
assert(toolsHtml.includes('href="/uuid-to-hex-converter/"'), '/tools page contains UUID to Hex Converter');
assert(toolsHtml.includes('href="/uuid-version-detector/"'), '/tools page contains UUID Version Detector');
assert(toolsHtml.includes('href="/uuid-v5-generator/"'), '/tools page contains UUID v5 Generator');
assert(toolsHtml.includes('href="/uuid-v8-generator/"'), '/tools page contains UUID v8 Generator');
assert(!toolsHtml.includes('class="more-tools-btn"'), '/tools page does not have More Tools button (already shows all 12)');

// 3b. Verify blog posts exist and are ordered Newest to Oldest on /blog/
const blogDir = path.join(distDir, 'blog');
assert(fs.existsSync(path.join(blogDir, 'index.html')), 'Blog index page exists in dist');

const blogPosts = fs.readdirSync(path.resolve('src/content/blog')).filter(f => f.endsWith('.md'));
for (const file of blogPosts) {
  const slug = file.replace(/\.md$/, '');
  const postDistPath = path.join(blogDir, slug, 'index.html');
  assert(fs.existsSync(postDistPath), `Blog post page exists in dist: blog/${slug}/index.html`);
}

// Verify ordering in /blog/index.html (datetime attributes must be sorted Newest to Oldest)
const blogIndexHtml = fs.readFileSync(path.join(blogDir, 'index.html'), 'utf-8');
const timeMatches = [...blogIndexHtml.matchAll(/<time datetime="([^"]+)"/g)].map(m => new Date(m[1]).getTime());
assert(timeMatches.length === blogPosts.length, `All ${blogPosts.length} blog posts are listed on /blog/ (found ${timeMatches.length})`);
for (let i = 0; i < timeMatches.length - 1; i++) {
  assert(timeMatches[i] >= timeMatches[i + 1], `Blog post ${i} date (${timeMatches[i]}) is >= post ${i + 1} date (${timeMatches[i + 1]})`);
}

// 4. Verify /en/ redirect page exists and points to root
const enRedirectPath = path.join(distDir, 'en', 'uuid-generator', 'index.html');
assert(fs.existsSync(enRedirectPath), 'Legacy /en/uuid-generator redirect page exists');
if (fs.existsSync(enRedirectPath)) {
  const html = fs.readFileSync(enRedirectPath, 'utf-8');
  assert(html.includes('http-equiv="refresh" content="0;url=/uuid-generator/"'), '/en/ redirect has refresh tag pointing to /uuid-generator/');
}

const enBase64RedirectPath = path.join(distDir, 'en', 'base64-uuid-generator', 'index.html');
assert(fs.existsSync(enBase64RedirectPath), 'Legacy /en/base64-uuid-generator redirect page exists');

const enUuidToIntRedirectPath = path.join(distDir, 'en', 'uuid-to-integer-converter', 'index.html');
assert(fs.existsSync(enUuidToIntRedirectPath), 'Legacy /en/uuid-to-integer-converter redirect page exists');

const enUuidToHexRedirectPath = path.join(distDir, 'en', 'uuid-to-hex-converter', 'index.html');
assert(fs.existsSync(enUuidToHexRedirectPath), 'Legacy /en/uuid-to-hex-converter redirect page exists');

const enUuidVersionDetectorRedirectPath = path.join(distDir, 'en', 'uuid-version-detector', 'index.html');
assert(fs.existsSync(enUuidVersionDetectorRedirectPath), 'Legacy /en/uuid-version-detector redirect page exists');

const enUuidV5RedirectPath = path.join(distDir, 'en', 'uuid-v5-generator', 'index.html');
assert(fs.existsSync(enUuidV5RedirectPath), 'Legacy /en/uuid-v5-generator redirect page exists');

const enUuidV8RedirectPath = path.join(distDir, 'en', 'uuid-v8-generator', 'index.html');
assert(fs.existsSync(enUuidV8RedirectPath), 'Legacy /en/uuid-v8-generator redirect page exists');

// 5. Verify sitemap and robots.txt
assert(fs.existsSync(path.join(distDir, 'robots.txt')), 'robots.txt exists in dist');
assert(fs.existsSync(path.join(distDir, 'sitemap-index.xml')), 'sitemap-index.xml exists in dist');

console.log(`\nQA Test Results: ${testsPassed} passed, ${testsFailed} failed.`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 100% of Localized Slugs, Canonical, Hreflang, and SEO verification tests passed!');
  process.exit(0);
}
