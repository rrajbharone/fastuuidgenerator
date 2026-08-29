---
title: "How to Identify UUID v4 vs v7: A Simple Guide"
description: "Learn how to easily identify UUID v4 vs UUID v7. Discover the version character position, 8-4-4-4-12 structure, code examples in JavaScript & Python, and common mistakes."
publishDate: 2026-08-29
author: "FastUUID Engineering Team"
category: "Tutorials & Code"
readingTime: "9 min read"
featured: true
---

Whether you are debugging a database, inspecting API logs, or building data pipelines, you will frequently need to know: **Is this identifier a UUID v4 or a UUID v7?**

Here is the direct, simple answer:

To identify whether a UUID is Version 4 or Version 7, **look at the first character of the third group** in the standard hyphenated format (`xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`):

* **If the third group begins with `4`:** It is a **UUID Version 4** (Random).
* **If the third group begins with `7`:** It is a **UUID Version 7** (Time-Ordered).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   HOW TO SPOT UUID v4 vs UUID v7                       │
├────────────────────────────────────────────────────────────────────────┤
│ UUID v4: 550e8400 - e29b - 41d4 - a716 - 446655440000                  │
│                            ▲                                           │
│                 Starts with 4 = Version 4 (Random)                     │
│                                                                        │
│ UUID v7: 01912345 - 6789 - 7abc - 8def - 0123456789ab                  │
│                            ▲                                           │
│                 Starts with 7 = Version 7 (Time-Ordered)               │
└────────────────────────────────────────────────────────────────────────┘
```

In this practical technical guide, we will break down **the exact bit positions of the version field, how to count characters with and without hyphens, how to extract version metadata in JavaScript and Python, and common identification mistakes.**

---

## 1. The Standard UUID Structure Explained

Every canonical UUID under **RFC 9562** consists of **32 hexadecimal characters and 4 hyphens** arranged in the classic **8-4-4-4-12** format:

```text
  xxxxxxxx  -   xxxx   -   Mxxx   -   Nxxx   -   xxxxxxxxxxxx
 [ Group 1 ]  [Group 2]  [Group 3]  [Group 4]  [   Group 5   ]
 [ 8 chars ]  [4 chars]  [4 chars]  [4 chars]  [  12 chars   ]
```

### The Two Most Important Characters in a UUID:
1. **The Version Digit (`M`):** The **first character of Group 3**. This 4-bit nibble indicates the UUID version (`1` through `8`).
2. **The Variant Digit (`N`):** The **first character of Group 4**. For standard RFC 9562 UUIDs, this character is always **`8`**, **`9`**, **`a`**, or **`b`** (representing binary `10xx`).

---

## 2. How to Identify UUID Version 4 (UUID v4)

**UUID Version 4** is the industry's default random identifier.

### Step-by-Step Identification:
1. Find the **third hyphen-separated group**.
2. Check the **first character** of that group.
3. If that character is **`4`**, the identifier is a UUID v4.

```text
Example UUID v4:
550e8400 - e29b - 41d4 - a716 - 446655440000
                  ▲
               Group 3 begins with "4"  ==>  UUID v4
```

### What UUID v4 Means Architecturally:
* **Generation Method:** Generated entirely from **cryptographically secure random numbers**.
* **Entropy:** Contains **122 bits of random entropy** ($5.3 \times 10^{36}$ states).
* **Timestamps:** Contains **zero timestamp information** (cannot be sorted chronologically).

If you need to generate a pure random identifier right now, use our free [UUID v4 Generator](/uuid-v4-generator/).

---

## 3. How to Identify UUID Version 7 (UUID v7)

**UUID Version 7** is the modern IETF standard introduced to solve database B-Tree index fragmentation.

### Step-by-Step Identification:
1. Find the **third hyphen-separated group**.
2. Check the **first character** of that group.
3. If that character is **`7`**, the identifier is a UUID v7.

```text
Example UUID v7:
01912345 - 6789 - 7abc - 8def - 0123456789ab
                  ▲
               Group 3 begins with "7"  ==>  UUID v7
```

### What UUID v7 Means Architecturally:
* **Generation Method:** Combines a **48-bit Unix millisecond timestamp** (in Groups 1 and 2) with **74 bits of random/sequence entropy** (in Groups 3, 4, and 5).
* **Database Friendly:** Naturally sortable in chronological order, making it ideal for primary keys in PostgreSQL, MySQL, and SQLite.

Generate time-ordered identifiers with our free [UUID v7 Generator](/uuid-v7-generator/).

---

## 4. UUID v4 vs. UUID v7 at a Glance

| Feature | UUID Version 4 | UUID Version 7 |
| :--- | :--- | :--- |
| **Version Character Position** | Group 3, First Char = **`4`** | Group 3, First Char = **`7`** |
| **Primary Design** | Pure Random Entropy | Time-Ordered Unix Timestamp |
| **Embedded Timestamp** | ❌ No | ✅ Yes (48-bit Unix Milliseconds) |
| **B-Tree Index Friendly** | ❌ Causes random page splits | ✅ Sequential writes optimize B-Trees |
| **Random Bits** | **122 bits** | **74 bits** |
| **Chronologically Sortable**| ❌ No | ✅ Yes |
| **IETF Specification** | RFC 4122 / RFC 9562 | RFC 9562 (Published 2024) |

---

## 5. Is the Version Digit Always the 13th Character? (Character Counting Explained)

When writing code or explaining UUID positions, developers often confuse **string index positions** with **hexadecimal digit counts**:

```text
Canonical String:  5 5 0 e 8 4 0 0 - e 2 9 b - 4 1 d 4 - a 7 1 6 - 4 4 6 6 5 5 4 4 0 0 0 0
Hex Digit Count:   1 2 3 4 5 6 7 8   9 10 11 12  [13]
String Position:   1 2 3 4 5 6 7 8 9 10 11 12 13 14 [15]
0-Based Index:     0 1 2 3 4 5 6 7 8 9 10 11 12 13 [14]
```

### Summary of Coordinates:
* **Excluding Hyphens (Raw Hex Digits):** The version is the **13th hexadecimal digit**.
* **Including Hyphens (1-Based Character Count):** The version is the **15th character**.
* **Including Hyphens (0-Based String Index in JS/Python):** The version is at **index 14** (`uuid[14]`).

---

## 6. How to Check UUID Version in Code

### 1. JavaScript / TypeScript

```javascript
function getUuidVersion(uuidStr) {
  // Regex captures the version character at Group 3
  const match = uuidStr.match(/^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  
  if (!match) {
    return null; // Invalid UUID format
  }
  
  return parseInt(match[1], 10);
}

console.log(getUuidVersion("550e8400-e29b-41d4-a716-446655440000")); // Output: 4
console.log(getUuidVersion("01912345-6789-7abc-8def-0123456789ab")); // Output: 7
```

### 2. Python

In Python, the built-in `uuid` module automatically parses and exposes the version property:

```python
import uuid

# Check UUID v4
id_v4 = uuid.UUID("550e8400-e29b-41d4-a716-446655440000")
print(f"Version: {id_v4.version}")  # Output: Version: 4

# Check UUID v7
id_v7 = uuid.UUID("01912345-6789-7abc-8def-0123456789ab")
print(f"Version: {id_v7.version}")  # Output: Version: 7
```

### 3. C# / .NET 9+

Modern .NET 9 includes native UUID v7 support:

```csharp
using System;

Guid guid = Guid.Parse("01912345-6789-7abc-8def-0123456789ab");
Console.WriteLine($"Version: {guid.Version}"); // Output: Version: 7
```

---

## 7. Version Detection vs. Complete UUID Validation

A critical distinction for software engineers: **Identifying a version character is NOT the same as validating a UUID.**

Consider this malformed string:
`zzzzzzzz-zzzz-7zzz-8zzz-zzzzzzzzzzzz`

While Group 3 begins with `7`, the string contains invalid hexadecimal characters (`z`) and is **not a valid UUID**. 

Always run full structural validation before trusting user-submitted strings. You can test and inspect any identifier using our free [UUID / GUID Validator](/uuid-validator/).

---

## 8. Can You Convert a UUID v4 to UUID v7 by Changing the `4` to `7`?

**No. You should never manually change the version digit.**

```text
❌ WRONG (Corrupted ID):
Original v4: 550e8400-e29b-41d4-a716-446655440000
Changed:     550e8400-e29b-71d4-a716-446655440000
```

### Why This Fails:
* In a real UUID v7, the first 48 bits (`550e8400-e29b`) **must be a valid Unix millisecond timestamp**.
* If you take the random bits of a UUID v4 and label it Version 7, the timestamp field will decode to a nonsense date (such as the year 1973 or 2942), breaking all database B-Tree sorting.
* If you need a UUID v7, **generate a genuine UUID v7 from scratch**.

---

## 9. How to Decode the Embedded Timestamp in a UUID v7

Because UUID v7 stores the Unix timestamp in the first 48 bits, you can extract the exact creation date and time:

```javascript
function extractUuidV7Timestamp(uuidStr) {
  // Extract the first 48 bits (first 8 hex chars + first 4 hex chars)
  const hexTime = uuidStr.slice(0, 8) + uuidStr.slice(9, 13);
  const unixMilliseconds = parseInt(hexTime, 16);
  
  return new Date(unixMilliseconds);
}

const v7 = "018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d";
console.log(extractUuidV7Timestamp(v7).toISOString());
// Example Output: 2024-01-24T14:32:15.123Z
```

You can automatically extract timestamps, versions, and variants without code using our free [UUID Decoder](/uuid-decoder/).

---

## 10. Common Mistakes When Identifying UUID Versions

1. **Looking for `4` or `7` anywhere in the string:** A UUID v4 string like `750e8400-e29b-41d4...` starts with `7`, but it is a Version 4 UUID because Group 3 begins with `4`.
2. **Checking the wrong group:** The version is always in **Group 3**, never Group 1, 2, 4, or 5.
3. **Confusing Variant with Version:** Group 4 indicates the Variant (`8`, `9`, `a`, `b`), not the version.
4. **Assuming all UUIDs are v4:** Many databases and legacy systems use UUID v1, v6, or v7.
5. **Counting string characters without hyphens:** Remember that the version digit is character 15 with hyphens, but digit 13 without hyphens.

---

## 11. All UUID Versions Quick Reference Guide (RFC 9562)

| Version | Identifier Digit | Core Algorithm | Typical Use Case |
| :---: | :---: | :--- | :--- |
| **v1** | `1` | 60-bit Gregorian Timestamp + MAC Address | Legacy distributed systems |
| **v2** | `2` | DCE Security / POSIX UID | Kerberos & DCE RPC |
| **v3** | `3` | MD5 Name-Based Deterministic Hash | Namespace-based deterministic IDs |
| **v4** | `4` | 122-Bit Cryptographic Random Entropy | General-purpose unique IDs |
| **v5** | `5` | SHA-1 Name-Based Deterministic Hash | Namespace-based deterministic IDs |
| **v6** | `6` | Reordered Gregorian Timestamp | DB sorting for legacy v1 formats |
| **v7** | `7` | 48-Bit Unix Millisecond Timestamp + Entropy | **Modern Database Primary Keys** |
| **v8** | `8` | Custom Application-Specific Format | Enterprise custom requirements |

If you need to batch-generate test data containing multiple UUID versions, explore our [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 12. Frequently Asked Questions (FAQ)

### How can I tell if a UUID is v4 or v7?
Look at the first character of the third hyphenated group. If it is `4`, the UUID is Version 4. If it is `7`, the UUID is Version 7.

### Where is the UUID version located in a UUID string?
The version character is located at the start of the third segment: `xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx`, where `M` is the version digit.

### Is the version character the 13th digit?
Yes, when counting only hexadecimal digits (ignoring hyphens), the version is the 13th digit. When counting characters in a standard 36-character string including hyphens, it is at index position 14 (character 15).

### Can a UUID start with `7` and still be a UUID v4?
Yes. Group 1 contains random data in UUID v4, so it can randomly start with any hexadecimal character (`0–f`), including `7`. Only Group 3 determines the version.

### Does identifying the version also validate the UUID?
No. An invalid string can contain a `4` or `7` in the version position. You must still validate that the string contains 32 valid hexadecimal characters, correct hyphens, and a valid variant (`8`, `9`, `a`, `b`).

### Can I convert a UUID v4 into a UUID v7?
No. UUID v7 requires a valid 48-bit timestamp encoded into its first two segments. Changing the version character of a UUID v4 corrupts the timestamp data.

---

## 13. Conclusion & Developer Tools

Identifying UUID v4 vs v7 is quick and straightforward once you know where to look: **always inspect the first character of the third group.**

* **`4` = UUID v4 (Pure Randomness)**
* **`7` = UUID v7 (Time-Ordered Database Primary Key)**

Explore our full suite of free developer tools on FastUUIDGenerator.com:

* [UUID Generator](/uuid-generator/) — Create instant, cryptographically secure UUID v4 and v7 identifiers.
* [UUID v4 Generator](/uuid-v4-generator/) — Generate pure 122-bit random UUIDs.
* [UUID v7 Generator](/uuid-v7-generator/) — Generate modern time-ordered database UUIDs.
* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version & extract timestamps.
* [UUID Decoder](/uuid-decoder/) — Decode timestamps and metadata from UUID v1, v6, and v7.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in batch.

---

## SEO Metadata

### SEO Title
How to Identify UUID v4 vs v7: A Simple Guide

### Meta Description
Learn how to easily identify UUID v4 vs UUID v7. Discover the version character position, 8-4-4-4-12 structure, code examples in JavaScript & Python, and common mistakes.

### Suggested URL Slug
`/blog/how-to-identify-uuid-v4-vs-v7/`

### Suggested Featured Image
* **Image Concept:** Split technical visual contrasting a UUID v4 string with a UUID v7 string, with magnifying arrows pointing directly to the `4` and `7` in the third group labeled "Version Field".
* **Image Headline/Text:** How to Identify UUID v4 vs v7: Version Field Explained
* **SEO-Friendly Alt Text:** Visual diagram showing how to identify UUID v4 vs UUID v7 by checking the first character of the third group

---

## Internal Linking Opportunities

1. **UUID Generator (`/uuid-generator/`)**
   * *Anchor Text:* [UUID Generator](/uuid-generator/)
   * *Location:* Introduction & Conclusion.
2. **UUID v4 Generator (`/uuid-v4-generator/`)**
   * *Anchor Text:* [UUID v4 Generator](/uuid-v4-generator/)
   * *Location:* Section 2 & Conclusion.
3. **UUID v7 Generator (`/uuid-v7-generator/`)**
   * *Anchor Text:* [UUID v7 Generator](/uuid-v7-generator/)
   * *Location:* Section 3 & Conclusion.
4. **UUID / GUID Validator (`/uuid-validator/`)**
   * *Anchor Text:* [UUID / GUID Validator](/uuid-validator/)
   * *Location:* Section 7 & Conclusion.
5. **UUID Decoder (`/uuid-decoder/`)**
   * *Anchor Text:* [UUID Decoder](/uuid-decoder/)
   * *Location:* Section 9 & Conclusion.
6. **Bulk UUID Generator (`/bulk-uuid-generator/`)**
   * *Anchor Text:* [Bulk UUID Generator](/bulk-uuid-generator/)
   * *Location:* Section 11 & Conclusion.
