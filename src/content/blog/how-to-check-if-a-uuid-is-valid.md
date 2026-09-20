---
title: "How to Check if a UUID Is Valid: Format, Version & Variant Explained"
description: "How to check if a UUID is valid: learn the 8-4-4-4-12 syntax rules, RFC 9562 version and variant bits, regex checks, NIL UUIDs, and code examples in JS, Python, Java, and C#."
publishDate: 2026-09-20
author: "FastUUID Engineering Team"
category: "Tutorials & Code"
readingTime: "11 min read"
featured: true
---

Whether you are debugging an API failure, validating user input, importing a database dump, or verifying record IDs across microservices, you will frequently need to answer one critical question:

**"Is this UUID valid?"**

At first glance, a UUID looks like any random string with a few hyphens. But not all 36-character strings are valid UUIDs, and a string can look like a UUID while violating the official specification.

Here is the quick, direct answer on **how to check if a UUID is valid**:

* **Rule 1 (Length & Hyphens):** Exactly **36 characters**, divided into 5 hyphen-separated groups following the **8-4-4-4-12 pattern** (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).
* **Rule 2 (Character Set):** Must contain only **32 hexadecimal digits** (`0–9`, `a–f`, case-insensitive) and **4 hyphens**.
* **Rule 3 (Version Bit):** The first character of the 3rd group (character 15) indicates the **UUID version** and must be between **`1` and `8`** under RFC 9562 (or `0` for the NIL UUID).
* **Rule 4 (Variant Bits):** The first character of the 4th group (character 20) indicates the **RFC variant** and must be **`8`, `9`, `a`, or `b`** (case-insensitive).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ANATOMY OF A VALID UUID                         │
├────────────────────────────────────────────────────────────────────────┤
│                       Version (M: 1-8)                                 │
│                              │                                         │
│            550e8400 - e29b - 41d4 - a716 - 446655440000                │
│            └───────┘  └───┘   │     │      └──────────┘                │
│             Group 1  Group 2  │     │        Group 5                   │
│             (8 hex)  (4 hex)  │     │        (12 hex)                  │
│                               ▼     ▼                                  │
│                      Group 3 (4 hex) Group 4 (4 hex)                   │
│                                     │                                  │
│                         Variant (N: 8, 9, a, b)                        │
└────────────────────────────────────────────────────────────────────────┘
```

In this comprehensive engineering guide, we will break down **what makes a UUID valid, the difference between basic format validation and strict RFC validation, whether regex alone is enough, how to handle the special NIL UUID, and practical validation code in JavaScript, Python, Java, and C#.**

If you have a UUID right now and want to check whether it is valid, paste it into our free online [UUID / GUID Validator](/uuid-validator/) for an instant breakdown.

---

## 1. What Makes a UUID Valid? (Format vs. Strict RFC 9562 Rules)

In software development, "validation" means two different things depending on how deeply you inspect the identifier:

```text
┌────────────────────────────────────────────────────────────────────────┐
│               SYNTACTIC VALIDATION VS STRICT RFC VALIDATION            │
├───────────────────┬────────────────────────────────────────────────────┤
│ 1. Syntactic /    │ Verifies the string shape: 36 characters, correct  │
│    Format Check   │ hyphens, and valid hexadecimal characters.         │
│                   │ Example: Passes if 8-4-4-4-12 hex string.          │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. Strict RFC     │ Verifies that the string satisfies RFC 9562:       │
│    Validation     │ • Valid version digit (1 through 8)                │
│                   │ • Valid variant bits (10xx in binary = 8, 9, a, b) │
│                   │ Rejects random hex strings that masquerade as UUIDs│
└───────────────────┴────────────────────────────────────────────────────┘
```

A string can pass basic format validation but still fail strict RFC validation. 

For example, consider this string:
```text
12345678-1234-9234-c234-123456789abc
```
* **Format Check:** Passed! It has 36 characters, 4 hyphens, and only hex digits.
* **Strict RFC Check:** **FAILED!** 
  * The version digit is `9` (RFC 9562 only defines versions 1 through 8).
  * The variant digit is `c` (binary `1100`, which belongs to legacy Microsoft Reserved GUIDs, not standard IETF UUIDs).

If your system expects a standard IETF UUID, this string is **invalid**.

---

## 2. The 8-4-4-4-12 Structure Explained

A UUID is fundamentally a **128-bit integer (16 bytes)**. When displayed as text, it is written as 32 hexadecimal characters broken into five groups separated by hyphens:

| Group | Field Name (RFC 9562) | Hex Length | Byte Size | Bit Count | Example |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | `time_low` | 8 chars | 4 bytes | 32 bits | `550e8400` |
| **2** | `time_mid` | 4 chars | 2 bytes | 16 bits | `e29b` |
| **3** | `time_hi_and_version` | 4 chars | 2 bytes | 16 bits | `41d4` (Starts with Version) |
| **4** | `clock_seq_and_variant`| 4 chars | 2 bytes | 16 bits | `a716` (Starts with Variant) |
| **5** | `node` | 12 chars | 6 bytes | 48 bits | `446655440000` |
| **Total**| **Canonical UUID** | **36 chars** | **16 bytes** | **128 bits** | **32 hex + 4 hyphens** |

If you need to generate a valid, standards-compliant UUID for testing, create one instantly using our [UUID Generator](/uuid-generator/).

---

## 3. The Version Digit (`M`) and Variant Digit (`N`)

The two most critical characters for strict UUID validation are the **Version** and **Variant** indicators.

### The Version Character (`M`)
The version character is located at **index 14 (character 15)** of the standard 36-character string. It is always the **very first character of the third group**:

$$\text{xxxxxxxx-xxxx-}{\mathbf M}\text{xxx-Nxxx-xxxxxxxxxxxx}$$

Under the official **RFC 9562 standard** (which obsoleted RFC 4122 in May 2024), only the following versions are valid:

* **`1` (UUID v1):** Timestamp + MAC address.
* **`2` (UUID v2):** DCE Security / POSIX UID identifier.
* **`3` (UUID v3):** MD5 name-based hash.
* **`4` (UUID v4):** 122-bit cryptographically secure random entropy.
* **`5` (UUID v5):** SHA-1 name-based hash.
* **`6` (UUID v6):** Reordered timestamp (field-compatible with v1).
* **`7` (UUID v7):** Unix millisecond timestamp + random entropy (modern database primary keys).
* **`8` (UUID v8):** Custom application-specific format.

If the first digit of Group 3 is `0` (except in NIL UUID), `9`, or letters `a–f`, the string is **not a valid RFC-standard UUID**.

### The Variant Character (`N`)
The variant character is located at **index 19 (character 20)** of the standard string. It is always the **very first character of the fourth group**:

$$\text{xxxxxxxx-xxxx-Mxxx-}{\mathbf N}\text{xxx-xxxxxxxxxxxx}$$

The variant indicates the internal binary layout of the UUID. RFC 9562 mandates that the two most significant bits of this byte must be `1` and `0` (`10xx` in binary).

When converted to hexadecimal, `10xx` corresponds to only **four possible characters**:

$$\mathbf{8} \ (1000_2), \quad \mathbf{9} \ (1001_2), \quad \mathbf{a} \text{ or } \mathbf{A} \ (1010_2), \quad \mathbf{b} \text{ or } \mathbf{B} \ (1011_2)$$

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   RFC 9562 VARIANT BIT VALUES                          │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Binary Prefix     │ Hex Characters    │ Variant Meaning                │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ `10xx`            │ `8`, `9`, `a`, `b`│ Standard RFC 9562 / RFC 4122  │
│                   │                   │ (IETF Standard - VALID)        │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ `0xxx`            │ `0` through `7`   │ Reserved for Apollo Network    │
│                   │                   │ Computing System (NCS legacy)  │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ `110x`            │ `c`, `d`          │ Reserved for Microsoft COM     │
│                   │                   │ GUID backward compatibility    │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ `111x`            │ `e`, `f`          │ Reserved for future definition │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

If the fourth group starts with `0–7` or `c–f`, the identifier does not adhere to the standard IETF UUID specification.

---

## 4. Special Case: Is the NIL UUID Valid? What About MAX UUID?

Developers often ask: *"Is `00000000-0000-0000-0000-000000000000` a valid UUID?"*

**Yes! The NIL UUID is an officially valid, standardized UUID.**

RFC 9562 explicitly defines two special-purpose boundary UUIDs:

### 1. The NIL UUID (RFC 9562 §5.9)
```text
00000000-0000-0000-0000-000000000000
```
* Contains all 128 bits set to zero.
* Used to denote an uninitialized, empty, or null identifier in databases and APIs.
* Although its version and variant bits are `0`, the RFC specification defines it as a **fully valid special UUID**.

### 2. The MAX UUID (RFC 9562 §5.10)
```text
ffffffff-ffff-ffff-ffff-ffffffffffff
```
* Contains all 128 bits set to one (`0xFF`).
* Used as a sentinel or high-value boundary marker in distributed sorting algorithms and database B-tree indexes.
* Like NIL, it is an **officially valid special UUID**.

---

## 5. Real-World Comparison: Valid vs. Invalid UUIDs

| UUID String | Valid? | Version | Variant | Explanation / Failure Reason |
| :--- | :---: | :---: | :---: | :--- |
| `550e8400-e29b-41d4-a716-446655440000` | ✅ **Valid** | `4` (v4) | `a` (Valid) | Standard random UUID v4. |
| `018f3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d` | ✅ **Valid** | `7` (v7) | `9` (Valid) | Modern time-ordered database UUID v7. |
| `00000000-0000-0000-0000-000000000000` | ✅ **Valid** | `0` (NIL)| `0` (NIL) | Valid RFC 9562 NIL UUID. |
| `ffffffff-ffff-ffff-ffff-ffffffffffff` | ✅ **Valid** | `f` (MAX)| `f` (MAX) | Valid RFC 9562 MAX UUID. |
| `550e8400-e29b-41d4-a716-44665544000`  | ❌ **Invalid**| - | - | **Length error:** 35 chars instead of 36. |
| `550e8400-e29b-41d4-a716-44665544000g` | ❌ **Invalid**| - | - | **Character error:** `'g'` is not hexadecimal. |
| `550e8400-e29b-91d4-a716-446655440000` | ❌ **Invalid**| `9` | `a` | **Version error:** Version 9 does not exist. |
| `550e8400-e29b-41d4-c716-446655440000` | ❌ **Invalid**| `4` | `c` | **Variant error:** Starts with `'c'`, not `8, 9, a, b`. |
| `{550e8400-e29b-41d4-a716-446655440000}` | ⚠️ **GUID** | `4` | `a` | Valid Windows GUID, but invalid canonical UUID. |

If you need to analyze the timestamp or metadata in an identifier, try our free [UUID Decoder & Analyzer](/uuid-decoder/).

---

## 6. How to Validate a UUID with Regular Expressions (Regex)

Regular expressions are the most common way to validate UUIDs in web forms, routing middleware, and schema validators.

### 1. General Format Regex (Syntactic Check)
This regex checks whether a string is a 36-character hexadecimal string formatted with 8-4-4-4-12 hyphens:

```regex
^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$
```

* Matches: Any 32-digit hex string with hyphens in the right places (including NIL).
* Limitation: Does not check version or variant bits.

### 2. Strict RFC 9562 Regex (Versions 1–8 + Variant Check)
This regex ensures that the string has a valid version digit (`1` to `8`) and a valid variant character (`8`, `9`, `a`, `b`):

```regex
^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$
```

### 3. Strict UUID v4 Regex
If your application specifically requires random **UUID v4**:

```regex
^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$
```

### 4. Strict UUID v7 Regex
If your database schema specifically requires time-ordered **UUID v7**:

```regex
^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$
```

If you need to generate high volumes of v4 or v7 identifiers for testing, check out our [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 7. How to Check if a UUID Is Valid in Code

While regex works well, using native language parsers is often faster, more reliable, and less error-prone:

### 1. JavaScript / TypeScript

```javascript
// Native Web Crypto check or strict regex
function isValidUUID(uuidStr) {
  if (typeof uuidStr !== 'string' || uuidStr.length !== 36) {
    return false;
  }
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isNil = uuidStr === '00000000-0000-0000-0000-000000000000';
  return isNil || regex.test(uuidStr);
}

console.log(isValidUUID("550e8400-e29b-41d4-a716-446655440000")); // true
console.log(isValidUUID("550e8400-e29b-91d4-a716-446655440000")); // false (Invalid v9)
```

### 2. Python

In Python, you can use the built-in `uuid.UUID` class:

```python
import uuid

def is_valid_uuid(val: str) -> bool:
    try:
        uuid_obj = uuid.UUID(str(val))
        # Ensure input strictly matched canonical format (preventing auto-healing of missing hyphens)
        return str(uuid_obj) == val.lower()
    except (ValueError, AttributeError, TypeError):
        return False

print(is_valid_uuid("550e8400-e29b-41d4-a716-446655440000")) # True
print(is_valid_uuid("invalid-uuid-string"))                  # False
```

### 3. Java

```java
import java.util.UUID;

public class UuidValidator {
    public static boolean isValid(String uuidStr) {
        if (uuidStr == null || uuidStr.length() != 36) {
            return false;
        }
        try {
            UUID uuid = UUID.fromString(uuidStr);
            // Confirm the parsed UUID matches the input string
            return uuid.toString().equalsIgnoreCase(uuidStr);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 4. C# (.NET)

In C#, `Guid.TryParseExact()` provides high-performance validation without allocating memory:

```csharp
using System;

public static class Validator
{
    public static bool IsValidUuid(string input)
    {
        // "D" format specifier strictly enforces the 8-4-4-4-12 hyphenated layout
        return Guid.TryParseExact(input, "D", out _);
    }
}
```

If you frequently work with Microsoft .NET systems, you can format and generate identifiers using our [GUID Generator](/guid-generator/).

---

## 8. Top 7 Reasons a UUID Fails Validation

When tracking down why an identifier is being rejected by a validator, check for these seven common errors:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   TOP 7 UUID VALIDATION FAILURE CAUSES                 │
├───────────────────┬────────────────────────────────────────────────────┤
│ 1. Whitespace     │ Hidden leading/trailing spaces or newline `\n`     │
│                   │ characters from form submissions or CSV imports.   │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. Character      │ Copy-paste accidents resulting in 35 characters    │
│    Truncation     │ instead of 36.                                     │
├───────────────────┼────────────────────────────────────────────────────┤
│ 3. Non-Hex Chars  │ Letters outside `a–f` (e.g., `'g'`, `'o'`, `'z'`). │
├───────────────────┼────────────────────────────────────────────────────┤
│ 4. Misplaced      │ Hyphens positioned at wrong character indices      │
│    Hyphens        │ (e.g. `9-3-4-4-12` instead of `8-4-4-4-12`).       │
├───────────────────┼────────────────────────────────────────────────────┤
│ 5. Windows Format │ Wrapped in curly braces `{...}` or prefixed with   │
│    Artifacts      │ `urn:uuid:`, which fail strict canonical parsers.  │
├───────────────────┼────────────────────────────────────────────────────┤
│ 6. Invalid        │ Group 4 starts with `c`, `d`, `e`, or `f` instead  │
│    Variant        │ of RFC-compliant `8`, `9`, `a`, or `b`.            │
├───────────────────┼────────────────────────────────────────────────────┤
│ 7. Invalid        │ Group 3 starts with `0` (on non-NIL) or `9`.       │
│    Version        │ RFC 9562 only defines versions 1 through 8.        │
└───────────────────┴────────────────────────────────────────────────────┘
```

If you need to compress valid UUIDs into compact URL-safe strings, explore our [Base64 UUID Generator](/base64-uuid-generator/).

---

## 9. When to Use an Online UUID Validator Tool

While programmatic checks in code protect your production APIs, an interactive online UUID validator is invaluable during development and debugging:

* **Instant Syntax Diagnosis:** Highlights the exact character that caused validation to fail (e.g., non-hex character or missing hyphen).
* **Metadata Extraction:** Automatically extracts the UUID version (v1, v4, v7), variant name, and RFC standard compliance.
* **Timestamp Inspection:** If the UUID is a time-ordered **UUID v1, v6, or v7**, a validator extracts the embedded UTC timestamp down to the exact millisecond.
* **Batch Validation:** Tests hundreds of identifiers from log files or database queries at once.

Test your identifiers now using our free [UUID / GUID Validator](/uuid-validator/).

---

## 10. Frequently Asked Questions (FAQ)

### How can I tell if a UUID is valid?
Check that the string is exactly 36 characters long, contains 4 hyphens in the 8-4-4-4-12 pattern, contains only hexadecimal characters (`0–9`, `a–f`), has a version digit between `1` and `8`, and has a variant character of `8`, `9`, `a`, or `b`.

### Are UUIDs case-sensitive during validation?
Under RFC 9562, UUIDs are case-insensitive. While lowercase is the canonical standard for output, validators should accept both uppercase (`A–F`) and lowercase (`a–f`) characters.

### Is `00000000-0000-0000-0000-000000000000` a valid UUID?
Yes. It is the officially standardized **NIL UUID** defined in RFC 9562 §5.9. It represents an empty or uninitialized identifier.

### Can a UUID have 32 characters without hyphens?
A 32-character hexadecimal string is a valid raw representation of a UUID, but it is not in the official canonical format. Most databases and APIs require converting it to the hyphenated 36-character format before validation.

### What is the difference between UUID validation and GUID validation?
UUIDs and GUIDs represent the same 128-bit structure. However, GUID validation often allows Windows-specific formats, such as enclosing curly braces `{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}` or Microsoft-specific variant bits (`c` and `d`).

### Why did my UUID fail validation with a valid 36-character length?
Common reasons include an invalid version digit (such as `9`), an invalid variant character (such as `c`), or a non-hexadecimal letter (such as `'g'`) that looks similar to a hex digit.

---

## 11. Conclusion & Developer Tools

Validating a UUID is about more than just counting 36 characters—it is about verifying that the identifier contains valid hexadecimal characters, correct hyphen placement, and legitimate RFC 9562 version and variant bits.

Explore our full suite of free developer tools on FastUUIDGenerator.com:

* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version & extract timestamps.
* [UUID Generator](/uuid-generator/) — Create instant, cryptographically secure UUID v4 and v7 identifiers.
* [UUID Decoder](/uuid-decoder/) — Decode timestamps and metadata from UUID v1, v6, and v7.
* [GUID Generator](/guid-generator/) — Generate Microsoft & .NET ready GUIDs.
* [Base64 UUID Generator](/base64-uuid-generator/) — Convert 128-bit UUIDs into compact 22-character Base64 and Base64URL strings.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in batch.
