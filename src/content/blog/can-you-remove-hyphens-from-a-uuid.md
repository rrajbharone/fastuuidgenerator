---
title: "Can You Remove Hyphens From a UUID? UUID Without Dashes Explained"
description: "Can you remove hyphens from a UUID? Learn how 32-character and 36-character UUIDs represent the same 128-bit value, how to strip dashes in code, and when to keep hyphens."
publishDate: 2026-08-29
author: "FastUUID Engineering Team"
category: "Basics & Fundamentals"
readingTime: "9 min read"
featured: true
---

If you are formatting data for a database, designing a REST API, or trying to make clean URLs, you have probably asked: **Can you remove hyphens from a UUID?**

Here is the direct, technical answer:

* **Yes, you can safely remove the hyphens from a UUID string.**
* **The underlying UUID value does NOT change.** A standard UUID with hyphens (`36 characters`) and a UUID without hyphens (`32 characters`) represent the exact same **128-bit binary number (16 bytes)**.
* **Compatibility Matters:** While the mathematical value is identical, some APIs, database column types, regular expressions, and third-party libraries strictly expect the canonical 36-character format with hyphens.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CANONICAL VS HYPHENLESS UUID STRINGS                 │
├────────────────────────────────────────────────────────────────────────┤
│ Canonical (With Hyphens):  550e8400-e29b-41d4-a716-446655440000 (36 ch)│
│ Compact (Without Hyphens): 550e8400e29b41d4a716446655440000   (32 ch)│
│                                                                        │
│ • Binary Hardware Size:    128 bits / 16 bytes (Identical)             │
│ • Hexadecimal Characters:  32 Hex Digits       (Identical)             │
│ • Hyphen Separators:       4 Hyphens vs 0 Hyphens                      │
└────────────────────────────────────────────────────────────────────────┘
```

In this comprehensive technical guide, we will explore **why UUIDs have hyphens in the first place, how to strip and restore hyphens in JavaScript, Python, and C#, database storage implications, and when you should keep or remove hyphens in your applications.**

---

## 1. Can You Remove Hyphens From a UUID? (The Complete Answer)

A **UUID** (**Universally Unique Identifier**) is a 128-bit binary number standardized by the Internet Engineering Task Force (IETF) in **RFC 9562** (and historically RFC 4122).

Computers represent this 128-bit number in human-readable text by converting it into **32 hexadecimal characters**. To make these 32 characters easier for humans to read, compare, and transcribe, the standard inserts **four hyphens** to break the string into five logical groups:

```text
With Hyphens:    550e8400 - e29b - 41d4 - a716 - 446655440000 (36 characters)
Without Hyphens: 550e8400e29b41d4a716446655440000             (32 characters)
```

Because the hyphens are purely visual formatting separators:
* **Removing hyphens does not delete any UUID bits.**
* **Removing hyphens does not alter the UUID version or variant.**
* **Removing hyphens does not reduce uniqueness or collision resistance.**

Both representations evaluate to the exact same 16-byte binary payload when converted by a computer.

If you need to generate a fresh identifier with or without hyphens right now, use our free [UUID Generator](/uuid-generator/).

---

## 2. Why Does a UUID Have Hyphens in the First Place?

Why did the original designers of the UUID specification (OSF DCE and IETF) include four hyphens?

The answer comes down to the **8-4-4-4-12 structural grouping**:

```text
  550e8400  -   e29b   -   41d4   -   a716   -   446655440000
 [ Group 1 ]  [Group 2]  [Group 3]  [Group 4]  [   Group 5   ]
 [ 8 chars ]  [4 chars]  [4 chars]  [4 chars]  [  12 chars   ]
 [ 32 bits ]  [16 bits]  [16 bits]  [16 bits]  [  48 bits    ]
```

### The Purpose of the Five Groups:
1. **Historical Field Alignment:** In legacy **UUID Version 1**, each group mapped directly to internal binary fields (`time_low`, `time_mid`, `time_hi_and_version`, `clock_seq`, and `node_id`). The hyphens visually demarcated these fields.
2. **Visual Readability & Verification:** Scanning a continuous string of 32 characters (`550e8400e29b41d4a716446655440000`) is visually exhausting and prone to transcription errors. Splitting it into chunks of 8, 4, 4, 4, and 12 makes it much easier to inspect.
3. **Version & Variant Identification:** Hyphens make it easy to spot the **Version Digit** (the first character of Group 3) and the **Variant Digit** (the first character of Group 4).

---

## 3. Is a UUID Without Hyphens Still a Valid UUID?

The answer depends on whether you are talking about the **underlying mathematical identifier** or the **textual string parser**:

* **Mathematically:** **Yes.** A 32-character hexadecimal string contains 100% of the 128 binary bits needed to represent the UUID.
* **In Software Specifications:** **It depends on the parser.** 
  * The official IETF RFC 9562 defines the **canonical representation** as the 36-character hyphenated form.
  * Modern programming libraries (e.g., Python's `uuid.UUID` or C#'s `Guid.Parse`) can automatically parse both 32-character and 36-character strings.
  * However, strict API schemas (like OpenAPI/JSON Schema regex patterns) or database parsers may reject a 32-character string if they enforce the canonical 36-character regex.

---

## 4. Canonical UUID Format vs. Hyphenless Format

| Feature | Canonical UUID Format | Hyphenless (Compact) UUID |
| :--- | :--- | :--- |
| **String Length** | **36 characters** | **32 characters** |
| **Hexadecimal Digits** | 32 digits (`0–9`, `a–f`) | 32 digits (`0–9`, `a–f`) |
| **Hyphen Count** | 4 hyphens | 0 hyphens |
| **Underlying Binary Size** | **128 bits (16 bytes)** | **128 bits (16 bytes)** |
| **IETF RFC Standard** | **Official Canonical Format** | Alternative Text Representation |
| **Human Readability** | **High** (Structured chunks) | Moderate (Continuous string) |
| **Common Use Cases** | PostgreSQL, REST APIs, JSON | MongoDB `_id`, compact file paths |

---

## 5. How to Remove UUID Hyphens in Code

Stripping hyphens from a UUID string is a simple operation across all modern programming languages:

### 1. JavaScript / TypeScript

```javascript
const canonicalUuid = "550e8400-e29b-41d4-a716-446655440000";

// Simple global regex replacement
const hyphenlessUuid = canonicalUuid.replace(/-/g, "");

console.log(hyphenlessUuid);
// Output: "550e8400e29b41d4a716446655440000"
console.log(hyphenlessUuid.length); // 32
```

### 2. Python

In Python, you can use the standard string `.replace()` method or access the `.hex` property of a `uuid.UUID` object:

```python
import uuid

# Approach A: Plain String Replacement
raw_uuid_str = "550e8400-e29b-41d4-a716-446655440000"
no_hyphens = raw_uuid_str.replace("-", "")
print(no_hyphens)  # "550e8400e29b41d4a716446655440000"

# Approach B: Native Python UUID Object (.hex property)
my_uuid = uuid.uuid4()
print(my_uuid.hex) # Automatically returns the 32-character hyphenless string
```

### 3. C# / .NET

In C#, the standard `Guid` struct has a built-in format specifier (`"N"`) that outputs the hyphenless 32-character format:

```csharp
using System;

Guid myGuid = Guid.NewGuid();

// "D" = Standard 36-char hyphenated (Default)
Console.WriteLine(myGuid.ToString("D")); // "550e8400-e29b-41d4-a716-446655440000"

// "N" = Compact 32-char hyphenless
Console.WriteLine(myGuid.ToString("N")); // "550e8400e29b41d4a716446655440000"
```

### 4. PHP

```php
<?php
$canonical = "550e8400-e29b-41d4-a716-446655440000";
$hyphenless = str_replace('-', '', $canonical);

echo $hyphenless; // "550e8400e29b41d4a716446655440000"
?>
```

---

## 6. Can You Add the Hyphens Back to a 32-Character UUID?

**Yes.** Because the hyphen positions in a UUID are fixed at characters **8, 12, 16, and 20**, you can reconstruct the canonical 36-character format from any valid 32-character hexadecimal string:

### JavaScript Helper Function:
```javascript
function addHyphensToUuid(str) {
  // Validate that the input is exactly 32 hexadecimal characters
  if (!/^[0-9a-fA-F]{32}$/.test(str)) {
    throw new Error("Invalid 32-character UUID string");
  }
  
  return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20)}`;
}

const compact = "550e8400e29b41d4a716446655440000";
console.log(addHyphensToUuid(compact));
// Output: "550e8400-e29b-41d4-a716-446655440000"
```

You can also validate and inspect the components of any identifier with our free [UUID / GUID Validator](/uuid-validator/).

---

## 7. UUID v4 Without Hyphens

In **UUID Version 4 (Random)**, removing hyphens is completely safe:

```text
Canonical v4:  550e8400-e29b-41d4-a716-446655440000 (36 chars | 122 random bits)
Compact v4:    550e8400e29b41d4a716446655440000     (32 chars | 122 random bits)
```

The version digit (`4`) is still located at character position 13 (in 0-indexed strings), and the variant digit (`a`) is at position 17. The 122 bits of cryptographic random entropy remain intact.

---

## 8. UUID Hyphens in Databases

How you handle hyphens in database storage depends on whether you are using **native binary types** or **text strings**:

```sql
-- Option A: Native Binary Type (Recommended)
CREATE TABLE users_native (
    id UUID PRIMARY KEY -- PostgreSQL native type: Stores 16 raw binary bytes
);

-- Option B: Text with Hyphens
CREATE TABLE users_canonical (
    id CHAR(36) PRIMARY KEY -- Stores 36 ASCII bytes
);

-- Option C: Text without Hyphens
CREATE TABLE users_compact (
    id CHAR(32) PRIMARY KEY -- Stores 32 ASCII bytes (Saves 4 bytes per row)
);
```

### Database Takeaways:
1. **Native Types (PostgreSQL `UUID`, MySQL `BINARY(16)`, SQL Server `UNIQUEIDENTIFIER`):** Storing UUIDs as raw 16-byte binary ignores hyphens entirely. PostgreSQL automatically formats output with hyphens on query.
2. **Text Columns (`CHAR(36)` vs `CHAR(32)`):** If your database lacks a native UUID type and you must store text, `CHAR(32)` saves 4 bytes per row. However, ensure that all microservices agree on using the 32-character convention to prevent string comparison mismatches.

---

## 9. UUID Hyphens in REST APIs and URLs

When transmitting UUIDs over the web, developers often debate whether to include hyphens:

```text
URL Option A (Canonical): https://api.example.com/v1/orders/550e8400-e29b-41d4-a716-446655440000
URL Option B (Hyphenless): https://api.example.com/v1/orders/550e8400e29b41d4a716446655440000
```

### API Best Practices:
* **Follow RFC Standards by Default:** Unless you have a specific requirement, keep the standard 36-character format with hyphens. Most third-party API clients, OpenAPI generators, and logging tools expect canonical UUIDs.
* **Be Permissive on Input:** Design your API endpoints to accept both 32-character and 36-character inputs by stripping hyphens or parsing them into UUID objects in your controller middleware.

---

## 10. Does Removing Hyphens Make a UUID More Secure?

**No.** Removing hyphens has **zero impact on security**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SECURITY REALITY CHECK                          │
├────────────────────────────────────────────────────────────────────────┤
│ • Canonical UUID v4:  122 bits of random entropy ($5.3 \times 10^{36}$) │
│ • Hyphenless UUID v4: 122 bits of random entropy ($5.3 \times 10^{36}$) │
│                                                                        │
│ Hyphens are non-functional display characters. Removing them does not  │
│ increase search space or make brute-force attacks harder.              │
└────────────────────────────────────────────────────────────────────────┘
```

Never assume that a hyphenless UUID provides confidentiality. A UUID is an identifier, not an authentication secret—always enforce server-side access control.

---

## 11. Even More Compact: Base64 UUIDs (22 Characters)

If your goal in removing hyphens is to make identifiers as short and compact as possible for URLs or QR codes, consider **Base64 UUID encoding**:

```text
Canonical UUID (36 chars):  550e8400-e29b-41d4-a716-446655440000
Hyphenless UUID (32 chars): 550e8400e29b41d4a716446655440000
Base64 UUID (22 chars):     VQ6EAOKbQdSnFkRmVUQAAA
```

By encoding the raw 16-byte binary payload into URL-safe Base64, you reduce the string length down to **22 characters** while preserving 100% of the 128-bit identifier. Try our free [Base64 UUID Generator](/base64-uuid-generator/).

---

## 12. Common Mistakes When Removing UUID Hyphens

1. **Assuming Every Third-Party API Accepts 32 Characters:** Many external webhooks and partner APIs enforce strict 36-character regex validation. Always check external API contracts.
2. **Mixing Formats in the Same Database:** Storing some rows as 36-character strings and others as 32-character strings breaks SQL `WHERE` queries and unique index constraints.
3. **Stripping Characters Without Validating First:** Always ensure a string is a valid UUID before stripping hyphens; otherwise, you may accidentally corrupt malformed inputs.
4. **Expecting Security Improvements:** Removing dashes does not make an identifier harder to guess.

---

## 13. When to Keep vs. When to Remove Hyphens

```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ KEEP HYPHENS (36 Characters) IF:     │ REMOVE HYPHENS (32 Characters) IF:   │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Public REST APIs & OpenAPI specs   │ • Legacy systems requiring 32-char ID│
│ • Standard database types (Postgres) │ • MongoDB / NoSQL string keys        │
│ • Human-readable logs & dashboards   │ • File names & compact storage keys  │
│ • Interoperating with 3rd-party apps │ • Specific SDKs (e.g. Python .hex)   │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

If you need to batch-generate test data formatted with or without dashes, check out our [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 14. Frequently Asked Questions (FAQ)

### Can you remove hyphens from a UUID?
Yes. A 32-character string without hyphens represents the exact same 128-bit binary value as a standard 36-character UUID with hyphens.

### Is a UUID without hyphens valid?
Yes, it is a valid compact hexadecimal representation of a UUID. However, some strict API parsers specifically require the canonical 36-character format with hyphens.

### How many characters is a UUID without hyphens?
A UUID without hyphens is exactly **32 hexadecimal characters long**.

### Does removing hyphens change the UUID?
No. Hyphens are purely visual separators. Removing them does not alter any of the 128 binary bits that make up the identifier.

### Can I remove hyphens in JavaScript?
Yes, use `uuid.replace(/-/g, '')` to remove all hyphens from a UUID string.

### Can you add hyphens back to a 32-character UUID?
Yes. Because the hyphen positions are fixed (8-4-4-4-12), you can reconstruct the standard 36-character format using simple string slicing or regular expressions.

### Should I store UUIDs in my database with or without hyphens?
Whenever possible, store UUIDs using your database's native 16-byte binary type (such as `UUID` in PostgreSQL or `BINARY(16)` in MySQL). If storing as plain text, stick to one consistent format across all tables.

---

## 15. Conclusion & Developer Tools

In summary: **Removing hyphens changes the visual text string (from 36 characters to 32 characters), but the underlying 128-bit UUID remains identical.** 

For maximum compatibility, use the canonical 36-character hyphenated format in public APIs and logs, and feel free to use compact 32-character strings for internal keys or compact storage.

Explore our full suite of free developer tools:

* [UUID Generator](/uuid-generator/) — Create instant, cryptographically secure UUID v4 and v7 identifiers with custom hyphen options.
* [GUID Generator](/guid-generator/) — Generate Microsoft & .NET ready GUIDs.
* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version & extract timestamps.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in batch.
* [Base64 UUID Generator](/base64-uuid-generator/) — Convert 128-bit UUIDs into compact 22-character strings.
