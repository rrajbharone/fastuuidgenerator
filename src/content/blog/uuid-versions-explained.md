---
title: "UUID Versions Explained: v1, v3, v4, v5, v6, v7 & v8"
description: "A complete beginner-friendly guide to all UUID versions (v1 to v8). Learn how each version works under RFC 9562, how they differ, and which one to choose for your project."
publishDate: 2026-08-28
author: "FastUUID Engineering Team"
category: "Architecture & Standards"
readingTime: "10 min read"
featured: true
---

If you have ever inspected a database record, an API payload, or a system log, you have almost certainly seen a **UUID** (Universally Unique Identifier). It usually looks like a string of 32 hexadecimal characters separated by four hyphens:

`f47ac10b-58cc-4372-a567-0e02b2c3d479`

At first glance, all UUIDs might look like random strings of letters and numbers. But behind the scenes, different UUIDs are created in completely different ways. 

Some are generated using **cryptographic randomness**, some are built from **timestamps and network hardware addresses**, some are calculated from **text names and hashes**, and the newest versions are engineered specifically to optimize **database index performance**.

These different generation methods are known as **UUID versions**.

In this guide, we will break down all seven major UUID versions recognized by the modern standard, **RFC 9562**: **UUID v1, v3, v4, v5, v6, v7, and v8**. You will learn how each version works, what makes them unique, their trade-offs, and how to choose the right version for your application.

---

## 1. What Is a UUID Version?

Every standard UUID is a **128-bit (16-byte) number**, typically displayed as a 36-character string in an `8-4-4-4-12` format.

Within those 128 bits, the standard reserves specific bits to identify two critical pieces of metadata:

1. **The UUID Variant:** Specifies the overall layout and interpretation of the bits. Modern UUIDs almost universally use the **RFC 9562 / RFC 4122 variant** (indicated by the first digit of the 4th group being `8`, `9`, `a`, or `b`).
2. **The UUID Version:** A 4-bit integer (values `1` through `8`) that defines the exact algorithm used to generate the identifier.

You can easily spot the version of any UUID by looking at the **first digit of the third group**:

```text
xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
              ▲    ▲
              │    └── Variant (8, 9, a, or b)
              └─────── Version (1, 3, 4, 5, 6, 7, or 8)
```

For example, in the UUID `f47ac10b-58cc-4372-a567-0e02b2c3d479`, the `4` in `4372` indicates that this is a **UUID Version 4**.

If you have an existing identifier and want to inspect its version and variant instantly, you can test it with our free [UUID / GUID Validator](/uuid-validator/).

---

## 2. UUID Version Comparison Table

Here is an overview of all major UUID versions specified in RFC 9562:

| Version | Main Generation Method | Deterministic? | Time-Based? | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **UUID v1** | System Time + MAC Address | No | Yes (60-bit 100ns intervals) | Legacy distributed systems |
| **UUID v3** | MD5 Hash of Namespace + Name | Yes | No | Legacy deterministic ID mapping |
| **UUID v4** | Cryptographic Pseudo-Randomness | No | No | General-purpose web apps, APIs, microservices |
| **UUID v5** | SHA-1 Hash of Namespace + Name | Yes | No | Modern deterministic ID mapping |
| **UUID v6** | Reordered v1 Timestamp + Node | No | Yes (Sorted high-to-low) | Modernizing legacy v1 systems for B-Trees |
| **UUID v7** | 48-bit Unix Epoch (ms) + Random | No | Yes (Naturally sortable) | Modern database primary keys (Postgres, MySQL) |
| **UUID v8** | Custom / Application-Specific | Varies | Optional | Domain-specific or experimental layouts |

---

## 3. UUID v1 Explained (Timestamp + MAC Address)

**UUID Version 1** is the original time-based UUID specification. It was introduced in the 1980s for the Distributed Computing Environment (DCE).

```text
 2a88a0e0-c081-11ee-8e4a-001a2b3c4d5e
                ▲
            Version 1
```

### How UUID v1 Is Generated
UUID v1 combines three pieces of information:
1. **A 60-bit timestamp:** The count of 100-nanosecond intervals since October 15, 1582 (the date of Gregorian calendar reform).
2. **A 14-bit clock sequence:** A counter that increments if the system clock rolls backward or changes, preventing duplicate IDs.
3. **A 48-bit node ID:** The physical **MAC address** of the computer's network interface card (NIC).

### Advantages
* **Guaranteed uniqueness across machines:** Because every network card has a globally unique hardware MAC address, two different computers will never generate the same v1 UUID at the same instant.

### Disadvantages & Privacy Risks
* **Exposes Hardware Identity:** The last 12 hexadecimal characters expose the creator's physical MAC address, allowing network eavesdroppers to track which machine generated which record.
* **Exposes Exact Creation Time:** The timestamp is embedded directly in the identifier, which can reveal sensitive business creation patterns.
* **Poor Database Indexing:** Because the least-significant timestamp bits come first (`time_low`), consecutive v1 IDs jump around randomly in memory, causing severe index fragmentation in databases.

---

## 4. UUID v3 Explained (Name-Based with MD5)

**UUID Version 3** is a **deterministic (name-based)** identifier. Instead of generating a random number or recording the current time, UUID v3 generates an ID by hashing a text string within a given namespace.

```text
 c9273c50-3882-3580-b26a-360be1b6c006
                ▲
            Version 3
```

### How It Works: The Namespace + Name Concept
To generate a UUID v3, you provide two inputs:
1. **A Namespace UUID:** A pre-existing UUID representing a category (such as a DNS domain namespace, a URL namespace, or a custom application namespace).
2. **A Name String:** A text string (such as `"alice@example.com"` or `"user_4829"`).

The algorithm concatenates the namespace bytes with the name string, computes an **MD5 cryptographic hash**, and formats the resulting 128-bit digest as a UUID.

### Advantages & Key Characteristics
* **Deterministic:** Given the exact same namespace and name, UUID v3 will always produce the exact same UUID output, anywhere in the world, on any programming language.
* **No Database Lookup Needed:** If two independent microservices know the user's email, they can independently derive the identical UUID without querying a shared database.

### Limitations
* **Uses MD5:** The MD5 hashing algorithm has known cryptographic vulnerabilities. While collisions in UUID generation are rare, newer applications should use **UUID v5** instead.

---

## 5. UUID v4 Explained (Random / Pseudo-Random)

**UUID Version 4** is by far the most widely used UUID version in the world today.

```text
 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
                ▲
            Version 4
```

### How UUID v4 Is Generated
Unlike time-based or name-based identifiers, UUID v4 relies almost entirely on **cryptographic randomness**:

* Out of the 128 total bits, **6 bits** are reserved for the version (`0100` = 4) and variant (`10` = RFC standard).
* The remaining **122 bits** are filled with cryptographically secure pseudorandom numbers.

### Why UUID v4 Is So Popular
* **Simplicity:** It requires no timestamps, clock synchronization, hardware MAC addresses, or pre-configured namespaces.
* **Privacy:** It exposes zero information about your server hardware, network, IP address, or creation time.
* **Decentralized:** Any client, mobile device, or background worker can generate a fresh UUID v4 instantly with zero network communication.

### Can Two UUID v4 Identifiers Collide?
A 122-bit random space contains $2^{122}$ (approx. $5.3 \times 10^{36}$) possible values. The probability of generating two identical UUID v4 values is so astronomically low that for all practical software engineering purposes, collisions are considered impossible under properly seeded cryptographic random number generators.

You can generate cryptographically secure v4 identifiers directly in your browser using our [UUID Generator](/uuid-generator/) or generate thousands at once with the [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 6. UUID v5 Explained (Name-Based with SHA-1)

**UUID Version 5** works on the exact same principles as UUID v3, but replaces the older MD5 hash with **SHA-1**.

```text
 886313e1-3b8a-5372-9b90-0c9aee199e5d
                ▲
            Version 5
```

### How It Works
Just like v3, you supply a **Namespace UUID** and a **Name string**:

$$\text{UUID v5} = \text{Truncate}_{128}\Big(\text{SHA-1}\big(\text{Namespace Bytes} + \text{Name String}\big)\Big)$$

The SHA-1 algorithm produces a 160-bit digest. The specification takes the first 128 bits, sets the version nibble to `5`, sets the variant bits, and outputs the final UUID.

### When to Use UUID v5
Use UUID v5 whenever you need **deterministic, reproducible identifiers** from strings:
* Converting legacy system IDs (like integer customer numbers) into consistent UUIDs across distributed environments.
* Deduplicating resources across multiple microservices without centralized locks.

---

## 7. UUID v6 Explained (Reordered Time-Based)

**UUID Version 6** was introduced in **RFC 9562** to fix the single biggest flaw of UUID v1: **bad database index sorting**.

```text
 1ee-c081-2a88a0e0-8e4a-001a2b3c4d5e  (Conceptual reordering)
```

### Why UUID v6 Was Created
In UUID v1, the 60-bit timestamp was stored with its lowest bits first (`time_low` $\rightarrow$ `time_mid` $\rightarrow$ `time_hi`). When inserting millions of records into a B-Tree database index, each new record landed in a random page in storage, causing severe performance degradation known as *index fragmentation*.

UUID v6 takes the **exact same 60-bit Gregorian timestamp** as UUID v1, but flips the byte order so the most significant bits come first:

$$\text{UUID v1:} \quad \text{time\_low} \longrightarrow \text{time\_mid} \longrightarrow \text{time\_hi}$$
$$\text{UUID v6:} \quad \text{time\_hi} \longrightarrow \text{time\_mid} \longrightarrow \text{time\_low}$$

### When Should You Use UUID v6?
UUID v6 is primarily a **backward-compatibility bridge** for legacy enterprise systems that already rely on the UUID v1 Gregorian calendar epoch and MAC address structure. For brand-new greenfield applications, **UUID v7** is generally preferred.

---

## 8. UUID v7 Explained (Unix Timestamp + Random)

**UUID Version 7** is the modern flagship specification introduced in **RFC 9562 (May 2024)**. It was designed from the ground up for modern web applications and cloud databases.

```text
 018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d
                ▲
            Version 7
```

### How UUID v7 Is Structured
UUID v7 combines a **millisecond-precision Unix timestamp** with **cryptographic randomness**:

```text
 018d3b7d-3b7d - 7bad - 9bdd - 2b0d7b3dcb6d
[  48 bits    ]  [16 b] [16 b] [  48 bits  ]
 Unix Epoch (ms)  Ver+Rand Var+Rand  Random Bits
```

1. **48-Bit Timestamp (Bits 0–47):** Contains the standard Unix epoch timestamp in milliseconds (the number of milliseconds since January 1, 1970). This 48-bit counter will not overflow until the year **10889 AD**.
2. **Version (4 Bits):** Fixed binary value `0111` (7).
3. **Random Payload (74 Bits):** Filled with cryptographically secure random numbers or sub-millisecond sequence counters.

### Why UUID v7 Is Revolutionizing Databases
Because the timestamp sits at the very beginning of the 128-bit integer, **UUID v7 values are naturally monotonic (time-ordered)**. 

When you insert records into databases like **PostgreSQL, MySQL, SQLite, or MongoDB**:
* New rows are always appended to the right edge of the database's B-Tree index.
* You avoid expensive index page splits and cache churn.
* You get the fast insert speed of an auto-incrementing integer with all the decentralized benefits of a UUID.

---

## 9. UUID v8 Explained (Custom / Application-Specific)

**UUID Version 8** provides a formal standard for applications that need **custom, domain-specific 128-bit identifier layouts**.

```text
 xxxxxxxx-xxxx-8xxx-Nxxx-xxxxxxxxxxxx
                ▲
            Version 8
```

### Why UUID v8 Exists
Before RFC 9562, developers who wanted to embed custom data (such as tenant IDs, geographic shard codes, or nanosecond timestamps) inside a 128-bit identifier had to create non-standard hacks that broke standard UUID parsers.

UUID v8 standardizes custom identifiers by requiring only two rules:
1. The **4-bit Version** field must be set to `8` (`1000`).
2. The **2-bit Variant** field must be set to the RFC standard (`10`).

The remaining **122 bits** can be customized with any proprietary data layout your architecture requires.

> **Important Note:** UUID v8 is not a license to create arbitrary random strings; implementations must still adhere to standard 128-bit binary constraints and RFC 9562 parsing rules.

---

## 10. Time-Based UUID Comparison: v1 vs v6 vs v7

To understand how time-based UUIDs have evolved over the decades, compare their internal designs:

| Feature | UUID v1 (1988) | UUID v6 (2024) | UUID v7 (2024) |
| :--- | :--- | :--- | :--- |
| **Epoch Standard** | Gregorian (Oct 15, 1582) | Gregorian (Oct 15, 1582) | **Unix Epoch (Jan 1, 1970)** |
| **Timestamp Resolution** | 100 nanoseconds | 100 nanoseconds | **1 millisecond** (with sub-ms options) |
| **Natural Sort Order?** | ❌ No (Least-significant first) | ✅ Yes (Most-significant first) | ✅ **Yes (Naturally time-ordered)** |
| **Privacy Protection** | ❌ Leaks MAC address | ⚠️ Leaks MAC (unless randomized)| ✅ **Zero hardware leakage** |
| **Database Performance** | 🔴 Poor (Severe fragmentation) | 🟢 Good | 🟢 **Optimal (Modern standard)** |
| **Primary Target** | Legacy DCE systems | Legacy v1 upgrade migrations | **Modern cloud applications** |

---

## 11. UUID v4 vs UUID v7: The Ultimate Developer Decision

For 95% of modern software projects, the real choice comes down to **UUID v4 vs UUID v7**.

```text
┌─────────────────────────┬────────────────────────────────────────────────────────┐
│ Requirement             │ Recommended Version                                    │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ Database Primary Key    │ UUID v7 (Reduces B-Tree index fragmentation)           │
│ Public-Facing API Token │ UUID v4 (Zero timestamp leakage, purely unpredictable) │
│ Distributed Tracing ID  │ UUID v7 or v4                                          │
│ High-Frequency Logging  │ UUID v7 (Chronological ordering simplifies queries)   │
│ Client-Side Generation  │ UUID v4 or v7                                          │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

### Comparison Summary: v4 vs v7

| Property | UUID v4 | UUID v7 |
| :--- | :--- | :--- |
| **Time Ordering** | Completely random (Unsorted) | Monotonically increasing (Time-sorted) |
| **Timestamp Embedded?** | No (No temporal data) | Yes (48-bit millisecond Unix timestamp) |
| **Random Bits** | 122 bits of randomness | 74 bits of randomness |
| **Database B-Tree Impact**| High fragmentation at scale | Smooth sequential index writes |
| **Information Leakage** | None | Reveals approximate creation time |

If your system uses Microsoft .NET or Windows APIs, you may also see these referred to as GUIDs. You can generate both formats instantly using our dedicated [GUID Generator](/guid-generator/).

---

## 12. Which UUID Version Should You Choose?

Follow this simple decision tree for your next software build:

1. **Use UUID v7 if:** You are creating **primary keys in SQL or NoSQL databases** (PostgreSQL, MySQL, MongoDB, DynamoDB) and want high insert performance with time-sorted records.
2. **Use UUID v4 if:** You need a **general-purpose unique ID** where creation time must remain secret, or for short-lived session IDs, CSRF tokens, and public transaction identifiers.
3. **Use UUID v5 if:** You need **deterministic IDs** generated consistently from text inputs (e.g., generating identical UUIDs from email addresses or URLs across independent microservices).
4. **Use UUID v6 if:** You are maintaining an existing enterprise system that requires UUID v1 compatibility but needs sorted database performance.
5. **Use UUID v8 if:** You are designing a specialized internal framework that requires custom bit-packing (such as hardware cluster tags or tenant routing prefixes).

---

## 13. Alternative Encodings (Base64 UUIDs)

While canonical 36-character hyphenated UUID strings are human-readable, they consume 36 bytes in JSON payloads and database strings.

By converting the underlying 128 bits into URL-safe Base64, you can reduce the string length from **36 characters down to just 22 characters**:

```text
Canonical UUID:  018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d  (36 chars)
Base64 UUID:     AY07fTt9e62b3SsNe73LbQ                  (22 chars)
```

If you are optimizing mobile network payloads, clean URL routes, or cache keys, try our [Base64 UUID Generator](/base64-uuid-generator/).

---

## 14. Common UUID Mistakes to Avoid

1. **Assuming UUIDs are completely collision-proof:** While the probability of collision is near zero, applications must still handle database unique constraint violations gracefully.
2. **Confusing UUID Version with UUID Variant:** The *variant* defines the byte layout (usually RFC 9562), while the *version* defines the generation algorithm (v1 through v8).
3. **Using UUID v1 in public systems:** Embedding hardware MAC addresses leaks physical machine identities and location data.
4. **Treating UUIDs as secret passwords:** UUIDs guarantee uniqueness, not cryptographic secrecy. Time-ordered UUIDs (v1, v6, v7) reveal when records were created.
5. **Storing UUIDs as 36-character text in databases:** Always store UUIDs in native 16-byte binary column types (`UUID` in PostgreSQL, `BINARY(16)` in MySQL) to halve storage and double indexing speed.

---

## 15. Frequently Asked Questions (FAQ)

### What is the most commonly used UUID version?
UUID Version 4 (random) is historically the most widely used version across web development, APIs, and cloud services. However, UUID Version 7 is rapidly becoming the standard for database primary keys.

### Is UUID v7 better than UUID v4?
Neither is universally "better"—they serve different needs. UUID v7 is far superior for database primary keys due to its sequential time-ordering. UUID v4 is better when you want total unpredictability and do not want to reveal when an ID was created.

### Why was UUID v7 introduced in RFC 9562?
UUID v7 was introduced to solve database index fragmentation caused by random UUID v4 values, while replacing the outdated Gregorian epoch and MAC address privacy flaws of UUID v1.

### Are UUID v3 and UUID v5 deterministic?
Yes. Both v3 and v5 always produce the exact same 128-bit identifier when provided with the identical namespace and input string.

### What is UUID v8 used for?
UUID v8 is reserved for custom, application-specific data layouts that need to remain compliant with standard 128-bit RFC 9562 parsers.

---

## 16. Conclusion

Understanding the differences between UUID versions ensures that your systems remain fast, scalable, and secure:

* **UUID v4** remains the gold standard for general-purpose, unpredictable random IDs.
* **UUID v7** is the modern standard for database primary keys and time-ordered data.
* **UUID v5** is ideal for deterministic, reproducible identifiers.
* **UUID v1, v3, v6, and v8** provide targeted solutions for legacy, migration, and custom architectures.

Ready to generate and test identifiers for your application? Explore our free browser tools:

* [UUID Generator](/uuid-generator/) — Create cryptographically secure UUIDs.
* [GUID Generator](/guid-generator/) — Generate Microsoft and .NET compatible GUIDs.
* [UUID / GUID Validator](/uuid-validator/) — Inspect versions, variants, and timestamps.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in seconds.
* [Base64 UUID Generator](/base64-uuid-generator/) — Encode UUIDs into compact 22-character strings.
