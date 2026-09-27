const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

console.log('--- Verifying Plain-White Theme & Performance Optimizations in dist/ ---');

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

// 1. Check root index.html
const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');

// Assert no backdrop-filter or heavy glassmorphism
assert(!indexHtml.includes('backdrop-filter'), 'index.html contains NO backdrop-filter');
assert(!indexHtml.includes('-webkit-backdrop-filter'), 'index.html contains NO -webkit-backdrop-filter');
assert(!indexHtml.includes('radial-gradient'), 'index.html contains NO radial-gradient');
assert(!indexHtml.includes('background-attachment: fixed'), 'index.html contains NO background-attachment: fixed');
assert(!indexHtml.includes('fonts.googleapis.com'), 'index.html contains NO external fonts.googleapis.com');
assert(!indexHtml.includes('fonts.gstatic.com'), 'index.html contains NO external fonts.gstatic.com');

// Assert self-hosted Inter font preload for 0 CLS
assert(indexHtml.includes('rel="preload" href="/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin'), 'index.html preloads local Inter 400 woff2 font');

// Assert self-hosted font files exist in dist/fonts
const fontsDir = path.join(distDir, 'fonts');
assert(fs.existsSync(path.join(fontsDir, 'inter-latin-400-normal.woff2')), 'dist/fonts contains inter-latin-400-normal.woff2');
assert(fs.existsSync(path.join(fontsDir, 'inter-latin-500-normal.woff2')), 'dist/fonts contains inter-latin-500-normal.woff2');
assert(fs.existsSync(path.join(fontsDir, 'inter-latin-600-normal.woff2')), 'dist/fonts contains inter-latin-600-normal.woff2');

// Assert functional integrity of UUID Generator
assert(indexHtml.includes('id="btn-generate"'), 'UUID Generator has Generate button');
assert(indexHtml.includes('id="btn-copy-all"'), 'UUID Generator has Copy All button');
assert(indexHtml.includes('id="single-uuid-text"'), 'UUID Generator has single UUID output container');
assert(indexHtml.includes('id="uuid-version-select"'), 'UUID Generator has version selector');
assert(indexHtml.includes('id="uuid-quantity-input"'), 'UUID Generator has quantity input');
assert(indexHtml.includes('id="uuid-format-select"'), 'UUID Generator has format selector');
assert(indexHtml.includes('id="btn-download-txt"'), 'UUID Generator has download txt button');
assert(indexHtml.includes('id="btn-download-json"'), 'UUID Generator has download json button');
assert(indexHtml.includes('id="btn-download-csv"'), 'UUID Generator has download csv button');

// Assert popular tools section intact
assert(indexHtml.includes('Base64 UUID Generator'), 'Popular tools contains Base64 UUID Generator');
assert(indexHtml.includes('Bulk UUID Generator'), 'Popular tools contains Bulk UUID Generator');
assert(indexHtml.includes('UUID Validator'), 'Popular tools contains UUID Validator');
assert(indexHtml.includes('More Tools'), 'Popular tools contains More Tools button');

// 2. Check other key tools
const pagesToCheck = [
  'guid-generator/index.html',
  'bulk-uuid-generator/index.html',
  'base64-uuid-generator/index.html',
  'uuid-validator/index.html',
  'uuid-decoder/index.html',
  'tools/index.html',
  'blog/index.html',
  'about/index.html',
  'privacy-policy/index.html',
  'terms-of-service/index.html',
  'contact/index.html',
];

for (const p of pagesToCheck) {
  const filePath = path.join(distDir, p);
  assert(fs.existsSync(filePath), `Page exists: ${p}`);
  const html = fs.readFileSync(filePath, 'utf-8');
  assert(!html.includes('backdrop-filter'), `${p} contains NO backdrop-filter`);
  assert(!html.includes('fonts.googleapis.com'), `${p} contains NO fonts.googleapis.com`);
}

// 3. Check mobile smooth scroll in generator client bundles
const astroDir = path.join(distDir, '_astro');
const bundleFiles = fs.readdirSync(astroDir);
const genBundles = bundleFiles.filter(f => (f.includes('UuidGenerator') || f.includes('GuidGenerator') || f.includes('Base64UuidGenerator')) && f.endsWith('.js'));
assert(genBundles.length >= 3, 'All 3 generator client bundles found in dist/_astro');
for (const b of genBundles) {
  const code = fs.readFileSync(path.join(astroDir, b), 'utf-8');
  assert(code.includes('smooth') && code.includes('max-width: 768px'), `${b} contains mobile-only smooth scroll logic`);
}

console.log(`\nPerformance Verification Results: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ 100% of performance & clean theme checks passed!');
  process.exit(0);
}
