---
title: "Are UUIDs Case Sensitive? UUID Uppercase vs Lowercase Explained"
description: "Are UUIDs case sensitive? Discover why hexadecimal UUIDs are mathematically case-insensitive, but why string comparisons in code and databases can fail without normalization."
publishDate: 2026-08-29
author: "FastUUID Engineering Team"
category: "Basics & Fundamentals"
readingTime: "9 min read"
featured: true
---

If you are developing an API, writing database queries, or debugging a failed string comparison, you have probably asked yourself: **Are UUIDs case sensitive?**

Here is the direct, technical answer:

* **In terms of UUID value and mathematics:** **No, UUIDs are NOT case sensitive.** Hexadecimal characters `a–f` and `A–F` represent the exact same numeric values ($10$ through $15$).
* **In terms of software and string comparisons:** **Yes, UUID strings CAN BE case sensitive.** If your application compares two UUID strings using standard binary equality (such as `===` in JavaScript or `==` in Python), the comparison will fail if one is uppercase and the other is lowercase.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      THE CORE CASE-SENSITIVITY TRUTH                   │
├────────────────────────────────────────────────────────────────────────┤
│ Lowercase: 550e8400-e29b-41d4-a716-446655440000                        │
│ Uppercase: 550E8400-E29B-41D4-A716-446655440000                        │
│                                                                        │
│ • Mathematical UUID Value:  IDENTICAL (Same 128-bit binary number)     │
│ • Raw String Comparison:    DIFFERENT (ASCII "e" (101) != "E" (69))    │
└────────────────────────────────────────────────────────────────────────┘
```

Understanding the vital difference between a **UUID value (the 128-bit identifier)** and a **UUID string (the textual representation)** will save you hours of debugging across databases, API routers, cache keys, and validation schemas.

In this comprehensive guide, we will break down **why hexadecimal case does not alter a UUID, how programming languages and databases handle case, canonical RFC 9562 standards, and best practices for comparing and storing UUIDs.**

---

## 1. Are UUIDs Case Sensitive? (The Complete Answer)

A **UUID** (**Universally Unique Identifier**) is fundamentally a **128-bit binary number**. 

To make this binary number readable to humans, computers write it in **hexadecimal (Base-16) notation**, which uses the digits `0–9` and the letters `A–F`:

```text
Lowercase UUID: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
Uppercase UUID: 6BA7B810-9DAD-11D1-80B4-00C04FD430C8
```

Because hexadecimal is mathematically case-insensitive:
* Lowercase `a` equals Uppercase `A` (value $10$).
* Lowercase `b` equals Uppercase `B` (value $11$).
* Lowercase `c` equals Uppercase `C` (value $12$).
* Lowercase `d` equals Uppercase `D` (value $13$).
* Lowercase `e` equals Uppercase `E` (value $14$).
* Lowercase `f` equals Uppercase `F` (value $15$).

Therefore, changing the letter casing in a UUID string **does not create a new identifier**. Both strings point to the exact same record, resource, or entity.

If you need to generate a fresh, canonically formatted identifier right now, use our free [UUID Generator](/uuid-generator/).

---

## 2. Why Can Uppercase and Lowercase Represent the Same UUID?

To understand why letter case has zero impact on a UUID's numerical value, consider standard base-10 decimal numbers:

```text
Decimal:     42 is always 42.
Hexadecimal: 0x2A and 0x2a both equal 42 in decimal.
```

In Base-16 mathematics, letters are simply single-digit symbols representing numbers from 10 to 15:

| Hex Character (Lowercase) | Hex Character (Uppercase) | Binary (4 Bits) | Decimal Value |
| :---: | :---: | :---: | :---: |
| `a` | `A` | `1010` | 10 |
| `b` | `B` | `1011` | 11 |
| `c` | `C` | `1100` | 12 |
| `d` | `D` | `1101` | 13 |
| `e` | `E` | `1110` | 14 |
| `f` | `F` | `1111` | 15 |

When a computer parser converts a UUID text string into raw binary bytes, `0xa7` and `0xA7` both evaluate to the exact byte `10100111`.

---

## 3. UUID Value vs. UUID String Representation

One of the most common sources of software bugs is confusing an **identifier's semantic value** with its **serialized string format**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   UUID VALUE vs STRING REPRESENTATION                  │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. THE UNDERLYING UUID VALUE      │ 2. THE TEXTUAL STRING              │
│ • Fixed 128-bit binary number     │ • 36-character human string        │
│ • No concept of uppercase/lower   │ • Stored as ASCII / UTF-8 chars    │
│ • Always case-insensitive         │ • Compared byte-by-byte in strings │
└───────────────────────────────────┴────────────────────────────────────┘
```

When two systems exchange a UUID:
1. **If they parse the UUID into native objects** (e.g., `UUID` in Java, `Guid` in C#, or native `UUID` in PostgreSQL), the comparison is **case-insensitive** and will evaluate as equal.
2. **If they treat the UUID as a plain string** (e.g., standard JavaScript `===` or a case-sensitive database collation), the comparison will **fail** because ASCII `"e"` (byte 101) does not equal ASCII `"E"` (byte 69).

---

## 4. Are UUID Strings Case Sensitive in Programming Languages?

Let's look at how popular programming languages handle UUID comparisons in practice:

### 1. JavaScript / TypeScript
In JavaScript, string comparison uses strict byte-level equality:

```javascript
const lowerUuid = "550e8400-e29b-41d4-a716-446655440000";
const upperUuid = "550E8400-E29B-41D4-A716-446655440000";

// Raw string comparison fails!
console.log(lowerUuid === upperUuid); 
// Output: false

// Correct approach: Normalize strings before comparing
console.log(lowerUuid.toLowerCase() === upperUuid.toLowerCase()); 
// Output: true
```

### 2. Python
In Python, comparing raw strings fails, but parsing them into native `uuid.UUID` objects evaluates equality correctly:

```python
import uuid

str_a = "550e8400-e29b-41d4-a716-446655440000"
str_b = "550E8400-E29B-41D4-A716-446655440000"

# Raw string comparison fails
print(str_a == str_b)  # False

# Native UUID object comparison succeeds!
id_a = uuid.UUID(str_a)
id_b = uuid.UUID(str_b)
print(id_a == id_b)    # True
```

### 3. C# / .NET
In C#, the standard `Guid` struct parses both uppercase and lowercase strings automatically:

```csharp
using System;

Guid guidA = Guid.Parse("550e8400-e29b-41d4-a716-446655440000");
Guid guidB = Guid.Parse("550E8400-E29B-41D4-A716-446655440000");

Console.WriteLine(guidA == guidB); 
// Output: True
```

---

## 5. Should UUIDs Be Stored in Uppercase or Lowercase?

### The Official Standard: RFC 9562 Specifies Lowercase
Under the official IETF standard (**RFC 9562**, Section 4):

> *"The hexadecimal values 'a' through 'f' are output as lower case characters and are case-insensitive on input."*

### Historical Conventions:
* **Linux, PostgreSQL, Python, Java, JavaScript, Modern Web:** Standardize on **lowercase** (`550e8400-e29b-41d4-a716-446655440000`).
* **Microsoft Windows, COM, Registry, Legacy .NET:** Historically defaulted to **uppercase wrapped in curly braces** (`{550E8400-E29B-41D4-A716-446655440000}`).

> **Best Practice Recommendation:** Standardize on **lowercase** across your APIs, database text fields, and JSON payloads. However, ensure your backend parsers accept both uppercase and lowercase on input.

---

## 6. UUID Case Sensitivity in Databases

How a database handles UUID case depends on the **column data type** and **collation**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                  DATABASE UUID COMPARISON BEHAVIOR                     │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Database Engine   │ Column Data Type  │ Comparison Behavior            │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ PostgreSQL        │ UUID              │ Case-Insensitive (Native 16-B) │
│ MySQL 8.0+        │ BINARY(16)        │ Case-Insensitive (Binary Byte) │
│ MySQL (String)    │ VARCHAR (utf8mb4) │ Depends on Collation (_ci/_bin)│
│ SQL Server        │ UNIQUEIDENTIFIER  │ Case-Insensitive (Native GUID) │
│ SQLite            │ TEXT              │ Case-Sensitive (Default ASCII) │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### 1. PostgreSQL Native `UUID`
PostgreSQL stores UUIDs as native 16-byte binary structures. When you query:

```sql
SELECT * FROM users WHERE id = '550E8400-E29B-41D4-A716-446655440000';
```
PostgreSQL automatically parses the string into binary, matching rows regardless of whether you pass uppercase or lowercase.

### 2. MySQL `VARCHAR` vs `BINARY(16)`
* If stored as `VARCHAR(36)` with a case-sensitive binary collation (`utf8mb4_bin`), searching for uppercase will **not** match lowercase rows.
* If stored as `BINARY(16)` using `UUID_TO_BIN('550E8400...')`, MySQL converts the hex to raw bytes, ensuring perfect case-insensitivity.

---

## 7. Are UUIDs Case Sensitive in URLs and REST APIs?

When exposing UUIDs in public URLs, casing can introduce subtle routing issues:

```text
Endpoint A: https://api.example.com/v1/orders/550e8400-e29b-41d4-a716-446655440000
Endpoint B: https://api.example.com/v1/orders/550E8400-E29B-41D4-A716-446655440000
```

### Where URL Case-Sensitivity Causes Bugs:
1. **Web Server & CDN Caching:** Edge CDNs (Cloudflare, CloudFront) treat URLs as case-sensitive strings. A request for uppercase will trigger a separate cache miss from lowercase.
2. **Strict Routing Frameworks:** Some API routers or microservice gateways treat route parameters case-sensitively.
3. **Redis & In-Memory Cache Keys:** If your backend caches user records under the key `user:550e8400...`, querying `user:550E8400...` will result in a cache miss.

**Solution:** Always normalize incoming URL parameters with `.toLowerCase()` in your API middleware before querying databases or cache stores.

---

## 8. UUID Validation and Regular Expressions

When validating UUIDs in form inputs, API gateways, or backend validators, **your regex must always support both uppercase and lowercase characters**:

```javascript
// ✅ CORRECT: Case-insensitive UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

console.log(uuidRegex.test("550e8400-e29b-41d4-a716-446655440000")); // true
console.log(uuidRegex.test("550E8400-E29B-41D4-A716-446655440000")); // true
```

You can test and validate any UUID string format using our free [UUID / GUID Validator](/uuid-validator/).

---

## 9. Does UUID Version 4 (UUID v4) Care About Case?

**No.** In **UUID Version 4**, the version digit (`4`) is a fixed number (`0–9`), while the remaining random payload consists of hexadecimal characters.

```text
550e8400-e29b-41d4-a716-446655440000 (Lowercase v4)
550E8400-E29B-41D4-A716-446655440000 (Uppercase v4)
```

Both strings represent a 100% valid UUID Version 4 identifier under RFC 9562.

---

## 10. UUID vs. GUID Case Sensitivity

In the Microsoft ecosystem, UUIDs are commonly called **GUIDs** (**Globally Unique Identifiers**).

* In .NET and C#, GUIDs are historically rendered in **uppercase**: `System.Guid.NewGuid().ToString()` produces `f47ac10b-...` in modern .NET, while `ToString("B").ToUpper()` produces `{F47AC10B-...}`.
* Both UUID and GUID share the exact same 128-bit structure and are mathematically case-insensitive.

Generate and format Windows-style GUIDs using our [GUID Generator](/guid-generator/).

---

## 11. Best Practices for Developers

1. **Emit Lowercase by Default:** Always output UUIDs in lowercase string format across APIs, JSON responses, and logs in accordance with RFC 9562.
2. **Be Liberal on Input (Accept Both):** Never reject user-submitted UUIDs simply because they contain uppercase characters.
3. **Normalize at API Boundaries:** Convert incoming UUID strings to lowercase (`req.params.id.toLowerCase()`) as early as possible in your request pipeline.
4. **Use Native Database Types:** Store identifiers using native types (`UUID` in PostgreSQL, `BINARY(16)` in MySQL, `UNIQUEIDENTIFIER` in SQL Server) to bypass text collation quirks.
5. **Parse Into Objects for Comparison:** In languages like Python, Java, or C#, parse strings into `UUID` objects before checking equality.
6. **Normalize Cache Keys:** When constructing Redis or Memcached keys (`user:${uuid}`), ensure the UUID string is lowercase to prevent duplicate cache entries.
7. **Make Regex Validators Case-Insensitive:** Always append the `/i` flag to UUID validation regular expressions.
8. **Never Assume String Equality:** Remember that `===` in JavaScript tests ASCII characters, not mathematical UUID equivalence.

If you need to batch-generate test datasets in lowercase or uppercase format, try our [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 12. Quick Reference Summary Table

| Question | Answer | Notes |
| :--- | :---: | :--- |
| **Is a UUID value case sensitive?** | **No** | Hexadecimal digits represent the same numeric values. |
| **Can UUIDs be written in uppercase?** | **Yes** | Fully valid in RFC 9562. |
| **Can UUIDs be written in lowercase?** | **Yes** | Recommended standard output format. |
| **Do uppercase and lowercase UUIDs match?** | **Yes** | They point to the exact same 128-bit value. |
| **Are raw string comparisons case-sensitive?** | **Yes** | `"a" !== "A"` in JavaScript, Python, and C#. |
| **Should I store UUIDs in lowercase?** | **Yes** | Lowercase is the canonical convention. |
| **Does case affect UUID uniqueness?** | **No** | Uniqueness is governed by the 128 binary bits. |

---

## 13. Frequently Asked Questions (FAQ)

### Are UUIDs case sensitive?
No, UUID values are not case sensitive. The hexadecimal letters `a–f` and `A–F` represent identical numerical values. However, raw string comparisons in programming languages can fail if casing differs.

### Can a UUID be uppercase?
Yes. A UUID written in uppercase (e.g., `550E8400-E29B-41D4-A716-446655440000`) is completely valid and represents the exact same identifier as its lowercase equivalent.

### Should I convert UUIDs to lowercase?
Yes. RFC 9562 recommends that software output UUIDs in lowercase. Normalizing all incoming UUID strings to lowercase prevents bugs in string comparisons, routing, and caching.

### Are UUIDs case sensitive in PostgreSQL?
No. PostgreSQL's native `UUID` column type stores identifiers as 16-byte binary data, making SQL queries completely case-insensitive.

### Are UUIDs case sensitive in URLs?
The identifier itself is not case sensitive, but web routers, CDN caches, and web servers may treat URL strings case-sensitively. Always normalize UUIDs in URLs to lowercase.

### How should I compare two UUIDs in JavaScript?
Normalize both strings before comparing: `uuidA.toLowerCase() === uuidB.toLowerCase()`.

### Does changing the case of a UUID change its value?
No. Changing `550e8400...` to `550E8400...` does not alter any of the 128 binary bits that define the UUID.

---

## 14. Conclusion & Developer Tools

In summary: **UUIDs are mathematically case-insensitive, but software treats raw strings case-sensitively.** By normalizing UUID strings to lowercase and utilizing native database types, you ensure clean, bug-free identifier handling across your entire tech stack.

Explore our full suite of free developer utilities:

* [UUID Generator](/uuid-generator/) — Create instant, cryptographically secure UUID v4 and v7 identifiers in uppercase or lowercase.
* [GUID Generator](/guid-generator/) — Generate Microsoft & .NET ready GUIDs.
* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version & extract timestamps.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in batch.
* [Base64 UUID Generator](/base64-uuid-generator/) — Convert 128-bit UUIDs into compact 22-character strings.
