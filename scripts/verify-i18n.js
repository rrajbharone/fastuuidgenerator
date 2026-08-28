import { en } from '../src/i18n/locales/en.ts';
import { es } from '../src/i18n/locales/es.ts';
import { pt } from '../src/i18n/locales/pt.ts';
import { fr } from '../src/i18n/locales/fr.ts';
import { de } from '../src/i18n/locales/de.ts';
import { id } from '../src/i18n/locales/id.ts';
import { tr } from '../src/i18n/locales/tr.ts';
import { it } from '../src/i18n/locales/it.ts';

const locales = { en, es, pt, fr, de, id, tr, it };
const baseKeys = extractKeys(en);

function extractKeys(obj, prefix = '') {
  let keys = [];
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      keys = keys.concat(extractKeys(val, fullKey));
    } else {
      keys.push({ key: fullKey, value: val });
    }
  }
  return keys;
}

let totalErrors = 0;

console.log('--- Verifying i18n Translation Completeness across all 8 locales ---');
console.log(`Base English keys count: ${baseKeys.length}`);

for (const [localeName, localeObj] of Object.entries(locales)) {
  const currentKeys = extractKeys(localeObj);
  const currentKeyMap = new Map(currentKeys.map(k => [k.key, k.value]));
  
  let localeErrors = 0;
  
  for (const { key, value: enVal } of baseKeys) {
    if (!currentKeyMap.has(key)) {
      console.error(`[${localeName}] Missing key: ${key}`);
      localeErrors++;
    } else {
      const val = currentKeyMap.get(key);
      if (typeof val === 'string' && val.trim().length === 0) {
        console.error(`[${localeName}] Empty string value for key: ${key}`);
        localeErrors++;
      } else if (Array.isArray(val) && val.length === 0) {
        console.error(`[${localeName}] Empty array for key: ${key}`);
        localeErrors++;
      }
    }
  }

  if (localeErrors === 0) {
    console.log(`[PASS] ${localeName.toUpperCase()} has 100% complete keys (${currentKeys.length} items).`);
  } else {
    console.error(`[FAIL] ${localeName.toUpperCase()} has ${localeErrors} issues.`);
    totalErrors += localeErrors;
  }
}

if (totalErrors > 0) {
  console.error(`\n❌ i18n Verification Failed with ${totalErrors} total error(s).`);
  process.exit(1);
} else {
  console.log('\n✅ All 8 languages passed strict zero-tolerance verification!');
  process.exit(0);
}
