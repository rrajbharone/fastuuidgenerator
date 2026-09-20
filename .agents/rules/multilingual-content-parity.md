# FastUUIDGenerator.com - Permanent Project Rules & Guidelines

## 1. Strict Multilingual Full Content Parity Rule (MANDATORY)

Whenever creating, modifying, or updating content for any tool, page, guide, or educational section on FastUUIDGenerator.com:

1. **English is the Master/Source Content**:
   - The English (`en`) version is always the authoritative source of truth.
2. **100% Complete Equivalent in All Other 7 Languages**:
   - The 7 other supported languages are:
     - Spanish (`es`)
     - Portuguese (`pt`)
     - French (`fr`)
     - German (`de`)
     - Indonesian (`id`)
     - Turkish (`tr`)
     - Italian (`it`)
   - All 7 languages must contain the **complete, full equivalent** of the English content.
3. **Strict Prohibition Against Summarization or Omissions**:
   - **NEVER** shorten, summarize, or condense the English content.
   - **NEVER** remove, merge, or combine paragraphs.
   - **NEVER** skip explanations, technical concepts, or background context.
   - **NEVER** remove mathematical examples, code snippets, or sample values.
   - **NEVER** reduce the number of words merely because of language differences.
   - **NEVER** omit, reduce, or simplify FAQs (all FAQ questions and answers must be translated in full detail).
4. **Equal Informational Value**:
   - While natural word counts vary across languages due to grammatical syntax, the **information, coverage, sections, depth, examples, and FAQs must remain 100% complete and equivalent**.
   - Translations must be fluent, natural, and use native developer terminology in each locale.
5. **Mandatory Verification Before Task Completion**:
   - Always verify all 8 language versions before considering any task complete.
   - Run the full verification pipeline:
     - `npm test`
     - `npm run verify-i18n`
     - `npm run build`
     - `npm run verify-dist`
     - `npm run verify-perf`

---

## 2. Core Architectural & Quality Standards

- **Zero Server-Side Telemetry / 100% Client-Side Privacy**: All UUID generation, decoding, conversion, and validation algorithms must run 100% locally in the user's web browser. Identifiers and inputs must never be logged or transmitted over any network.
- **Mathematical Fidelity**: Always use arbitrary-precision native `BigInt` for 128-bit operations to prevent IEEE 754 floating-point rounding errors (which corrupt bits beyond $2^{53}-1$).
- **Responsive Layout & Text Wrapping**: All cards, text containers, long numbers, code blocks, and headings must enforce `overflow-wrap: anywhere; word-break: break-word; min-width: 0;` to prevent layout overflow across all screen widths.
- **Design System Consistency**: Preserve existing design tokens, typography, button styles, cards, spacing, and dark/light theme behaviors.
