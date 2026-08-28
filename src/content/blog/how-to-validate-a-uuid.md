---
title: "How to Validate a UUID: Format, Version, Variant & Common Errors"
description: "A complete guide to validating UUIDs and GUIDs. Learn how to verify 8-4-4-4-12 format, version, variant, regex patterns, programming checks, and fix common errors under RFC 9562."
publishDate: 2026-08-28
author: "FastUUID Engineering Team"
category: "Tutorials & Code"
readingTime: "10 min read"
featured: true
---

If you are developing a REST API, processing database queries, or importing CSV files into your application, you will eventually receive an identifier that claims to be a **UUID** (Universally Unique Identifier).

At first glance, it might look like a regular 36-character string. But what happens if:
* A client accidentally truncates the last two characters?
* An invalid non-hexadecimal character like `"Z"` slips into the string?
* A legacy system passes an identifier formatted with curly braces `{...}`?
* An API endpoint expects a time-ordered **UUID v7**, but receives a random **UUID v4**?

If your system attempts to insert a malformed UUID into a database column like PostgreSQL's `UUID` or SQL Server's `UNIQUEIDENTIFIER`, your application will immediately crash with a fatal type conversion error.

In this comprehensive guide, you will learn **how to validate UUIDs accurately**: what makes a UUID syntactically valid, how to inspect **version and variant bits under RFC 9562**, how to validate UUIDs in code (**JavaScript, Python, Java, C#, PHP**), how to use regular expressions properly, and how to troubleshoot common formatting errors.

---

## 1. Why Validate a UUID?

Validating UUIDs at the boundaries of your application is a fundamental software engineering best practice.

```text
┌───────────────────────────┐      Validation Check      ┌───────────────────────────┐
│   Incoming API Request    │ ─────────────────────────► │    PostgreSQL Database    │
│  "550e8400-e29b-41d4..."  │   ✓ Valid 36-char UUID    │     (Safe 16-byte write)  │
└───────────────────────────┘                            └───────────────────────────┘
                                           │
                                           ▼ Invalid String
                                 ┌───────────────────────────┐
                                 │ 400 Bad Request Response  │
                                 │  "Invalid UUID format"    │
                                 └───────────────────────────┘
```

Validating identifiers early protects your systems against:
1. **Database Runtime Exceptions:** Prevents database query crashes caused by invalid hexadecimal strings.
2. **API Input Injection & Bad Requests:** Rejects malformed URL parameters before executing expensive downstream business logic.
3. **Data Corruption:** Ensures foreign key relationships across microservices reference valid 128-bit identifiers.
4. **Security Vulnerabilities:** Prevents attackers from probing system endpoints with oversized string payloads.

If you have a UUID right now and want to check whether it is valid, paste it into our free online [UUID / GUID Validator](/uuid-validator/) for an instant breakdown.

---

## 2. What Is a UUID? (Quick Recap)

A **UUID** is a **128-bit (16-byte) number** formatted as a 36-character string consisting of 32 hexadecimal digits and 4 hyphens:

```text
550e8400-e29b-41d4-a716-446655440000
```

If you need to generate a fresh, standards-compliant identifier for testing, you can create one in seconds with our [UUID Generator](/uuid-generator/).

---

## 3. What Makes a UUID Valid? (The 3 Levels of Validation)

In software development, "valid" can mean three different things depending on how deeply you inspect the identifier:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Format Validation (Basic Syntax)                                    │
│    Is it 36 chars? Does it have 4 hyphens? Are all digits 0-9, a-f?   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Standards & Metadata Validation (RFC 9562)                          │
│    Is the Version (1–8) valid? Is the Variant (RFC standard) valid?    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Application-Specific Validation (Semantic Rules)                    │
│    Does the UUID exist in the database? Is it specifically UUID v7?    │
└────────────────────────────────────────────────────────────────────────┘
```

Let's break down each level step-by-step.

---

## 4. Level 1: UUID Format Validation (Syntax)

To pass basic format validation, a string must satisfy four strict rules:

1. **Total Length:** Must be exactly **36 characters** long.
2. **Hyphen Count and Placement:** Must contain exactly **4 hyphens** located at indices 8, 13, 18, and 23.
3. **Group Structure (8-4-4-4-12):** The characters must be partitioned into five groups containing 8, 4, 4, 4, and 12 hexadecimal characters respectively.
4. **Hexadecimal Character Set:** Every non-hyphen character must be a valid hexadecimal digit (`0–9`, `a–f`, or `A–F`).

```text
  550e8400  -   e29b   -   41d4   -   a716   -   446655440000
 [ 8 hex ]    [ 4 hex]   [ 4 hex]   [ 4 hex]     [  12 hex  ]
```

### Examples of Valid vs. Invalid Formats

| Example String | Status | Why It Fails |
| :--- | :--- | :--- |
| `550e8400-e29b-41d4-a716-446655440000` | ✅ **Valid** | Perfect 8-4-4-4-12 hexadecimal structure |
| `550E8400-E29B-41D4-A716-446655440000` | ✅ **Valid** | Uppercase letters are valid hexadecimal |
| `550e8400-e29b-41d4-a716-44665544000` | ❌ **Invalid** | Too short (35 chars; missing a character at the end) |
| `550e8400_e29b_41d4_a716_446655440000` | ❌ **Invalid** | Uses underscores `_` instead of hyphens `-` |
| `550e8400-e29b-41d4-a716-44665544000Z` | ❌ **Invalid** | Character `"Z"` is not a valid hexadecimal digit |
| `{550e8400-e29b-41d4-a716-446655440000}`| ⚠️ **Special** | Valid Windows GUID string, but requires stripping `{}` for standard UUID parsers |

---

## 5. Level 2: UUID Version Validation

Beyond basic character counts, the official Internet specification, **RFC 9562**, defines specific meaning for the **Version bits**.

The **Version digit** is located at **character position 15** (the first character of the 3rd group):

```text
xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
              ▲
              └────── Version Digit (Must be 1, 2, 3, 4, 5, 6, 7, or 8)
```

### How to Check the Version:
* `...-1xxx-...` $\rightarrow$ **UUID v1** (Gregorian Timestamp + MAC)
* `...-3xxx-...` $\rightarrow$ **UUID v3** (MD5 Name Hash)
* `...-4xxx-...` $\rightarrow$ **UUID v4** (Cryptographic Random)
* `...-5xxx-...` $\rightarrow$ **UUID v5** (SHA-1 Name Hash)
* `...-6xxx-...` $\rightarrow$ **UUID v6** (Reordered Timestamp)
* `...-7xxx-...` $\rightarrow$ **UUID v7** (Unix Epoch Millisecond Timestamp + Random)
* `...-8xxx-...` $\rightarrow$ **UUID v8** (Custom Domain Layout)

If an identifier has a version digit of `0`, `9`, `a`, `b`, `c`, `d`, `e`, or `f` (such as `550e8400-e29b-01d4-...`), it is **not a valid standard RFC UUID version** (with the exception of the special Nil UUID `00000000-0000-0000-0000-000000000000`).

---

## 6. Level 3: UUID Variant Validation

The **UUID Variant** defines the overall binary layout and bit interpretation of the 128-bit integer.

The **Variant digit** is located at **character position 20** (the first character of the 4th group):

```text
xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
                   ▲
                   └── Variant Digit (Must be 8, 9, a, or b for RFC 9562)
```

In binary, the standard RFC variant requires the two most-significant bits to be `10`:

$$\text{Hexadecimal '8'} = 1000_2 \quad\quad \text{Hexadecimal '9'} = 1001_2$$
$$\text{Hexadecimal 'a'} = 1010_2 \quad\quad \text{Hexadecimal 'b'} = 1011_2$$

Therefore, for any standard modern UUID, **the fourth group must always begin with `8`, `9`, `a`, `b`, `A`, or `B`**.

---

## 7. UUID Validation Summary Table

| Validation Type | What It Validates | Why It Matters | Example Check |
| :--- | :--- | :--- | :--- |
| **Format (Syntax)** | 36 characters, 4 hyphens, hex digits | Prevents parser crashes | String matches `8-4-4-4-12` |
| **Version (Semantics)** | 15th character is `1` through `8` | Identifies algorithm type | `...-4xxx-...` is random v4 |
| **Variant (Standard)** | 20th character is `8`, `9`, `a`, or `b` | Confirms IETF / RFC standard | `...-a716-...` is valid RFC |
| **Application Rules** | Database existence, UUID v7 sorting | Enforces business logic | ID exists in `users` table |

---

## 8. How to Validate a UUID Online

If you are debugging an API payload or checking a database log, the easiest method is to use our online validator:

1. Open the free [UUID / GUID Validator](/uuid-validator/).
2. Paste your identifier into the input box.
3. The validator instantly checks:
   * String length and character validity.
   * Version number and generation algorithm.
   * RFC variant compliance.
   * Timestamp extraction (if verifying a **UUID v1, v6, or v7**).
4. If invalid, the tool highlights the exact character index causing the error.

---

## 9. How to Validate a UUID with Regular Expressions (Regex)

Regular expressions are commonly used in web frameworks and API gateways for quick syntactic validation.

### 1. General RFC 9562 Canonical UUID Regex (Any Version 1–8)
This pattern validates standard 36-character UUIDs while strictly enforcing valid version digits (`1–8`) and RFC variant characters (`[89abAB]`):

```regex
^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$
```

### 2. Strict UUID Version 4 Regex
If your API specifically requires a random **UUID v4**:

```regex
^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$
```

### 3. Strict UUID Version 7 Regex
If your database requires a time-ordered **UUID v7**:

```regex
^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$
```

> **Limitations of Regex:** While regex quickly verifies that a string *looks* like a UUID, it cannot tell you if the UUID was generated using a cryptographically secure random source, nor whether the ID exists in your database.

---

## 10. How to Validate a UUID Programmatically

Here is how to perform robust UUID validation in the most popular backend languages:

### 1. JavaScript & TypeScript
```javascript
// Function to validate UUID using Web Crypto / Regex
function isValidUUID(str) {
  if (typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

console.log(isValidUUID("550e8400-e29b-41d4-a716-446655440000")); // true
console.log(isValidUUID("invalid-uuid-string")); // false
```

### 2. Python
In Python, use the standard library `uuid.UUID` class:

```python
import uuid

def is_valid_uuid(val):
    try:
        uuid_obj = uuid.UUID(str(val))
        return str(uuid_obj) == str(val).lower()
    except (ValueError, AttributeError, TypeError):
        return False

print(is_valid_uuid("550e8400-e29b-41d4-a716-446655440000")) # True
print(is_valid_uuid("550e8400-e29b-41d4-a716"))                # False
```

### 3. Java
In Java, use `UUID.fromString()` paired with a string comparison:

```java
import java.util.UUID;

public class Validator {
    public static boolean isValidUUID(String str) {
        if (str == null) return false;
        try {
            UUID uuid = UUID.fromString(str);
            return uuid.toString().equalsIgnoreCase(str);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 4. C# and .NET
In .NET, use the built-in `Guid.TryParse()` or `Guid.TryParseExact()`:

```csharp
using System;

class Program {
    static bool IsValidGuid(string input) {
        // "D" format ensures standard 36-char hyphenated format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        return Guid.TryParseExact(input, "D", out _);
    }
}
```

If you are working with Microsoft GUIDs that include curly braces `{...}`, you can validate them using our [GUID Generator](/guid-generator/) and validator suite.

### 5. PHP
```php
<?php
function isValidUUID(string $uuid): bool {
    return preg_match(
        '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
        $uuid
    ) === 1;
}

var_dump(isValidUUID("550e8400-e29b-41d4-a716-446655440000")); // bool(true)
?>
```

---

## 11. Common UUID Validation Errors and How to Fix Them

| Error | Example | Why It Happens | How to Fix It |
| :--- | :--- | :--- | :--- |
| **Trailing Whitespace** | `" 550e8400..."` | Copy-pasting extra spaces | Apply `.trim()` before validating |
| **Surrounding Braces** | `"{550e8400...}"` | Windows COM / Registry format | Strip leading `{` and trailing `}` |
| **Missing Hyphens** | `"550e8400e29b..."` | Hex raw string format (32 chars) | Re-insert hyphens at 8, 12, 16, 20 |
| **Invalid Characters** | `"...44000G"` | Typo or non-hex letter (`G–Z`) | Check data source; regenerate ID |
| **Truncated String** | `"550e8400-e29b..."`| Database column width too small | Expand column to `VARCHAR(36)` or `UUID` |
| **Wrong Version** | `"...-01d4-..."` | Non-standard generator library | Use RFC 9562 compliant generator |

---

## 12. Can a UUID Be Valid but Still Be a Security Risk?

**Yes.** A critical security rule is: **Syntactically valid $\neq$ Authenticated $\neq$ Safe.**

* **Valid UUIDs are not secret passwords:** If an API endpoint `/api/documents/{uuid}` only checks that the UUID is valid without verifying user permissions, any user can guess or iterate IDs.
* **Timestamp Leakage:** Valid **UUID v1, v6, and v7** identifiers reveal the exact date and millisecond of creation. If creation timing is sensitive, use **UUID v4**.
* **Database Collision Handling:** Even though UUID collisions are astronomically rare, applications must always handle database unique constraint conflicts gracefully.

If you need to generate multiple valid UUIDs for automated security testing or load fixtures, use our [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 13. Alternative Formats: Base64 UUID Validation

In high-performance web applications, developers often encode 128-bit UUIDs into **22-character URL-safe Base64 strings**:

```text
Canonical UUID (36 chars):  550e8400-e29b-41d4-a716-446655440000
Base64 UUID (22 chars):     VQ6EAOKbQdSnFkRmVUQAAA
```

To validate a Base64 UUID:
1. Ensure the string is exactly **22 characters** long.
2. Confirm it contains only URL-safe Base64 characters (`[A-Za-z0-9_-]`).
3. Decode the 22 characters into 16 raw bytes and verify the version and variant bits.

You can convert and test compact representations with our [Base64 UUID Generator](/base64-uuid-generator/).

---

## 14. Step-by-Step UUID Validation Checklist

Before saving an identifier to your database, verify this checklist:

* [ ] Is the string exactly **36 characters** long?
* [ ] Are there **4 hyphens** at positions 8, 13, 18, and 23?
* [ ] Are all other characters valid hexadecimal digits (`0–9`, `a–f`)?
* [ ] Is the **version digit** (15th character) between `1` and `8`?
* [ ] Is the **variant digit** (20th character) one of `8`, `9`, `a`, or `b`?
* [ ] Have leading/trailing spaces and curly braces been removed?
* [ ] Does the identifier satisfy your application's version requirements (e.g., v7 for sorted DB keys)?

---

## 15. Frequently Asked Questions (FAQ)

### How do I check if a UUID is valid?
You can validate a UUID instantly using our free [UUID / GUID Validator](/uuid-validator/) or by using standard regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`.

### Are uppercase UUIDs valid?
Yes. Hexadecimal characters are case-insensitive. While RFC 9562 specifies lowercase as the canonical representation for output, standard parsers accept both uppercase and lowercase letters.

### What is the Nil UUID?
The Nil UUID is a special-case identifier composed entirely of zeros: `00000000-0000-0000-0000-000000000000`. It is a valid RFC UUID representing an empty or uninitialized reference.

### Why does the 4th group in a UUID always start with 8, 9, a, or b?
The first digit of the fourth group represents the **UUID Variant**. Under RFC 9562 and RFC 4122, the two most-significant bits must be `10` in binary, which corresponds to the hexadecimal characters `8`, `9`, `a`, and `b`.

### Can a GUID be validated like a UUID?
Yes. GUID is Microsoft's terminology for the exact same 128-bit identifier format. The only difference is that Windows tools sometimes enclose GUIDs in curly braces `{...}`.

---

## 16. Conclusion & Developer Tools

Validating UUIDs at your API gateways and database layers prevents application crashes, blocks malformed input, and ensures data integrity across distributed cloud systems.

Whenever you need to inspect, validate, or generate identifiers, take advantage of our free browser-based tools:

* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version, variant, and extract embedded timestamps.
* [UUID Generator](/uuid-generator/) — Create instant, cryptographically secure UUID v4 and v7 identifiers.
* [GUID Generator](/guid-generator/) — Generate Microsoft & .NET ready GUIDs.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in batch.
* [Base64 UUID Generator](/base64-uuid-generator/) — Convert 128-bit UUIDs into compact 22-character strings.
