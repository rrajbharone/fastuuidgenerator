---
title: "What Is UUID v7 and Why Is It Useful for Databases?"
description: "Discover UUID v7 under RFC 9562: how Unix millisecond timestamps and time-ordered B-Tree indexing eliminate database page splits while maintaining distributed uniqueness."
publishDate: 2026-08-28
author: "FastUUID Engineering Team"
category: "Database & Performance"
readingTime: "10 min read"
featured: true
---

If you follow modern backend engineering discussions, database optimization blogs, or RFC standards, you have probably noticed a major buzz around a new identifier standard: **UUID Version 7 (UUID v7)**.

For over twenty years, software engineers defaulted to **UUID Version 4**—a 128-bit identifier built entirely from random numbers. While UUID v4 is great for privacy and unpredictability, its randomness creates serious performance bottlenecks when used as a primary key in relational databases like **PostgreSQL, MySQL, SQLite, and Microsoft SQL Server**.

To solve this dilemma, the Internet Engineering Task Force (IETF) officially published **RFC 9562 (May 2024)**, establishing **UUID v7** as the modern standard for time-ordered identifiers.

In this comprehensive guide, we will unpack everything you need to know: **what UUID v7 is, how its internal structure works, why it is revolutionizing database indexing, its privacy trade-offs, and when you should choose UUID v7 over UUID v4.**

---

## 1. Quick Summary: What Is UUID v7?

**UUID v7** is a 128-bit Universally Unique Identifier that begins with a **48-bit Unix millisecond timestamp**, followed by **74 bits of cryptographic randomness** (or an optional monotonic sequence counter):

```text
 018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d
[   48 bits   ] [16b] [16b] [  48 bits   ]
Unix Epoch (ms) Ver+R Var+R   Random Bits
```

* **The Core Benefit:** Because the timestamp is at the beginning, UUID v7 identifiers **naturally sort in chronological order**.
* **The Database Advantage:** When new rows are inserted into a database, they append smoothly to the end of the B-Tree index, avoiding expensive **page splits, fragmentation, and cache churn**.
* **The Distributed Power:** Like all UUIDs, any server, edge worker, or mobile app can generate a UUID v7 independently without coordinating with a central database.

If you need to generate a fresh UUID v7 right now, you can create one with our free browser-based [UUID Generator](/uuid-generator/).

---

## 2. Why Was UUID v7 Introduced?

To understand why UUID v7 is so important, we must look at the two identifier models developers had to choose between prior to RFC 9562:

```text
┌───────────────────────────────┬───────────────────────────────┐
│ Auto-Incrementing Integers    │ Traditional UUID v4           │
├───────────────────────────────┼───────────────────────────────┤
│ ✓ Fast B-Tree indexing        │ ❌ Random B-Tree fragmentation │
│ ❌ Centralized bottleneck     │ ✓ Fully decentralized         │
│ ❌ Guessable / Privacy risk   │ ✓ Completely unpredictable    │
│ ❌ Cannot generate offline    │ ✓ Generate offline anywhere   │
└───────────────────────────────┴───────────────────────────────┘
```

System architects were forced to make an uncomfortable trade-off:
1. **Choose Auto-Increment IDs (`BIGINT`):** Great database insert speed, but impossible to generate offline or merge across distributed databases without primary key collisions.
2. **Choose UUID v4:** Complete decentralization, but terrible database write performance on large tables due to random index inserts.

**UUID v7 was created to give developers the best of both worlds:** the distributed, collision-resistant properties of a 128-bit UUID, combined with the fast sequential write patterns of an auto-incrementing integer.

---

## 3. How UUID v7 Is Structured (RFC 9562 Deep Dive)

Under **RFC 9562**, the 128 bits of a UUID v7 are structured into four logical components:

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           unix_ts_ms                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          unix_ts_ms           |  ver  |       rand_a          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|var|                        rand_b                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                            rand_b                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### 1. `unix_ts_ms` (48 Bits)
The first 48 bits contain a standard Unix epoch timestamp measured in **milliseconds** (the count of milliseconds since midnight UTC on January 1, 1970). A 48-bit millisecond counter will not overflow until **10889 AD**.

### 2. `ver` (4 Bits)
The 4-bit version field is set to binary `0111` (decimal `7`), identifying this as a Version 7 UUID.

### 3. `rand_a` (12 Bits)
Contains 12 bits of cryptographically secure randomness, or optionally an incrementing sub-millisecond sequence counter.

### 4. `var` (2 Bits)
The 2-bit variant field is set to binary `10`, confirming compliance with standard IETF / RFC layout.

### 5. `rand_b` (62 Bits)
The remaining 62 bits provide additional cryptographic entropy, ensuring that identifiers generated in the exact same millisecond remain globally unique.

You can inspect and confirm these bits on any identifier with our [UUID / GUID Validator](/uuid-validator/).

---

## 4. UUID v4 vs UUID v7: Key Differences

| Feature | UUID v4 | UUID v7 |
| :--- | :--- | :--- |
| **Standard Specification** | RFC 4122 / RFC 9562 | RFC 9562 (Modern Standard) |
| **Primary Mechanism** | 122 bits of pure randomness | 48-bit Unix timestamp + 74 random bits |
| **Natural Sort Order** | ❌ None (Random distribution) | ✅ **Chronological (Time-ordered)** |
| **Database B-Tree Impact** | Severe page splits at scale | **Clean append writes** |
| **Creation Time Leakage** | None (Completely private) | Exposes approximate creation date/time |
| **Best Architectural Role**| Public tokens, session IDs | **Database primary keys, event logs** |

---

## 5. What Does "Time-Ordered" Actually Mean in Practice?

To see why time-ordering matters, consider three records created one millisecond apart:

```text
Record A (12:00:00.100 PM):  018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d
Record B (12:00:00.101 PM):  018d3b7d-3b7e-7c1a-8e22-114455667788
Record C (12:00:00.102 PM):  018d3b7d-3b7f-7a45-b001-998877665544
```

Notice the leading characters: `...7d-3b7d...`, `...7d-3b7e...`, `...7d-3b7f...`.

Because the most significant bits increment over time, **sorting UUID v7 strings alphabetically or numerically sorts them in exact chronological order**.

> **Important Technical Nuance:** UUID v7 provides *coarse-grained* millisecond time-ordering. If multiple servers generate UUIDs concurrently across the world, slight network clock skews mean IDs generated in the exact same millisecond might not interleave perfectly. However, for database indexing, this level of ordering is more than sufficient.

---

## 6. Why UUID v7 Revolutionizes Database B-Tree Indexing

To understand why databases love UUID v7, we must look at how storage engines like **PostgreSQL (btree)**, **MySQL (InnoDB)**, and **SQLite** index data on disk.

Databases store indexes in balanced tree blocks called **pages** (typically 8 KB to 16 KB in size):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Database B-Tree Storage Page                         │
├────────────────────────────────────┬───────────────────────────────────┤
│ Sequential Insert (UUID v7)        │ Random Insert (UUID v4)           │
│                                    │                                   │
│ [ 018d3b71 ]                       │ [ 3a4f8921 ]                      │
│ [ 018d3b72 ]                       │ [ 8f2b1a04 ]                      │
│ [ 018d3b73 ]                       │ [ d4e891c2 ]                      │
│ [ 018d3b74 ] ──► Appends to end    │ [ 1b7c3d44 ] ──► FORCED PAGE SPLIT│
│                  (95%+ Page Fill)  │                  (50% Fragmented) │
└────────────────────────────────────┴───────────────────────────────────┘
```

### The Problem with Random UUID v4
When you insert a random UUID v4, the database must write the record into an arbitrary page somewhere in the middle of the B-Tree index. If that page is already full:
1. The database must pause the write.
2. It allocates a new page on disk.
3. It moves half the rows from the old page to the new page (**a B-Tree page split**).
4. It updates parent index pointers and flushes dirty pages to storage.

This process causes **high write amplification, index fragmentation, and constant cache evictions**.

### The Solution with UUID v7
Because UUID v7 values increase steadily over time, **new rows always append to the right edge of the newest index page**. 
* Pages fill up completely (achieving 90–99% storage density).
* Old pages remain undisturbed in memory and on disk.
* Database write latency remains flat and predictable, even as tables grow to hundreds of millions of rows.

---

## 7. UUID v7 in Real-World Database Engines

Here is how UUID v7 behaves across the most popular database systems:

### 1. PostgreSQL
PostgreSQL features a native 16-byte `UUID` data type. While PostgreSQL does not yet have a built-in `gen_random_uuidv7()` in older versions, modern extensions (like `pg_uuidv7`) or generating UUID v7 in your application code allows PostgreSQL to index primary keys with maximum efficiency:

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY, -- Stores UUID v7 in compact 16-byte binary
    customer_id UUID NOT NULL,
    total_cents BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. MySQL (InnoDB)
InnoDB stores tables as **clustered indexes** keyed by the primary key. Using random UUID v4 strings as primary keys in MySQL is notoriously slow because random inserts require reorganizing table data on disk. Using **UUID v7 stored as `BINARY(16)`** solves this bottleneck completely.

### 3. Microsoft SQL Server
In SQL Server, 128-bit identifiers use the `UNIQUEIDENTIFIER` type. In the Microsoft ecosystem, UUIDs are commonly called GUIDs. Starting with **.NET 9**, C# includes native support for generating UUID v7 via `Guid.CreateVersion7()`. You can also format GUIDs with our [GUID Generator](/guid-generator/).

---

## 8. UUID v7 in Distributed Cloud Architectures

In modern cloud environments, applications are rarely hosted on a single database server:

```text
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│ Server A (US-East)│    │ Server B (EU-West)│    │ Mobile Client     │
└─────────┬─────────┘    └─────────┬─────────┘    └─────────┬─────────┘
          │                        │                        │
          └────────────────────────┼────────────────────────┘
                                   ▼
                Global Distributed Database (No Lock Contention)
```

UUID v7 provides distinct advantages for distributed systems:
1. **Zero Coordination Overhead:** Nodes generate globally unique, time-sorted IDs locally without network roundtrips.
2. **Distributed Telemetry & Tracing:** Event pipelines (Kafka, RabbitMQ, OpenTelemetry) can sort distributed messages chronologically by identifier.
3. **Effortless Offline Sync:** Mobile apps can generate UUID v7 keys offline; when internet connectivity returns, records merge seamlessly in chronological order.

If you need to batch-generate thousands of test identifiers for distributed testing, use our [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 9. Privacy and Security Considerations

While UUID v7 provides exceptional database performance, system designers must evaluate its privacy trade-offs:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Information Embedded in UUID v7:                                       │
│ • Exact Date of Creation                                               │
│ • Exact Millisecond Timestamp                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### When Timestamp Exposure Is NOT a Problem:
* Internal database primary keys (`users.id`, `invoices.id`).
* Backend microservice transaction IDs.
* Audit logs, error traces, and telemetry events.

### When Timestamp Exposure MAY Be a Problem:
* **Public URL Resource Slugs:** If an e-commerce platform exposes `/orders/018d3b7d...`, competitors could inspect timestamps to estimate total order volumes.
* **Security Tokens:** UUID v7 should **never** be used as a password reset token, session key, or API secret. Use cryptographically random tokens for security credentials.

---

## 10. UUID v7 vs Auto-Increment Integer IDs

| Architectural Dimension | Auto-Increment `BIGINT` (64-bit) | UUID v7 (128-bit) |
| :--- | :--- | :--- |
| **Storage Footprint** | 8 bytes | 16 bytes |
| **Generation Location** | Centralized Database Only | Anywhere (Frontend, Backend, Edge) |
| **Offline Capability** | ❌ No | ✅ **Yes** |
| **Multi-Region Merging** | ❌ Severe Key Conflicts | ✅ **Conflict-Free** |
| **B-Tree Index Locality** | Sequential Append | **Sequential Append** |
| **Enumeration Attack Risk**| High (Guessable `id+1`) | Low (74 bits of entropy) |

---

## 11. Which One Should You Choose: UUID v7 or UUID v4?

```text
┌────────────────────────────────────────┬────────────────────────────────────────┐
│ CHOOSE UUID v7 IF:                     │ CHOOSE UUID v4 IF:                     │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ • Primary key in SQL / NoSQL databases │ • Creation timestamp must stay private │
│ • High-throughput insert workloads     │ • Public API endpoints & URLs          │
│ • Time-ordered event streams & logs    │ • Ephemeral session tokens / CSRF IDs  │
│ • New greenfield application design    │ • Existing legacy system using v4      │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

---

## 12. Alternative Compact Encodings (Base64 UUIDs)

While standard 36-character UUID strings are easy to read, they take up 36 bytes in JSON payloads.

By converting the raw 128-bit binary representation into URL-safe Base64, you can compress the identifier into just **22 characters** while preserving 100% of its time-ordering and uniqueness:

```text
Standard UUID v7:  018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d  (36 chars)
Base64 UUID v7:    AY07fTt9e62b3SsNe73LbQ                  (22 chars)
```

Explore our free [Base64 UUID Generator](/base64-uuid-generator/) to test compact representations.

---

## 13. Common UUID v7 Misconceptions

1. **"UUID v7 makes every database 10x faster."** — False. On small tables or read-heavy applications, the performance difference is negligible. The massive benefits appear on high-volume write workloads and multi-million row tables.
2. **"UUID v7 guarantees perfect global chronological ordering."** — False. Because distributed server clocks have slight variations, IDs generated within the same millisecond across different servers may not interleave perfectly.
3. **"UUID v7 is just UUID v4 with a timestamp."** — False. RFC 9562 precisely defines the bit positions for timestamp, version, variant, and sequence counters.

---

## 14. Frequently Asked Questions (FAQ)

### What is UUID v7?
UUID v7 is a 128-bit identifier standardized in RFC 9562 that combines a 48-bit Unix millisecond timestamp with 74 bits of randomness, providing naturally time-ordered identifiers for modern applications.

### Why is UUID v7 better for databases than UUID v4?
UUID v7 eliminates B-Tree index fragmentation. Because IDs increase monotonically over time, new records append sequentially to index pages instead of triggering expensive random page splits.

### Does UUID v7 expose when it was created?
Yes. The first 48 bits contain the Unix timestamp in milliseconds. Anyone can extract the exact creation date and time from the identifier.

### Is UUID v7 supported in PostgreSQL and MySQL?
Yes. Both databases store UUID v7 natively as 16-byte binary fields (`UUID` in PostgreSQL, `BINARY(16)` in MySQL).

### Should I migrate my existing database from UUID v4 to UUID v7?
If your current database performance is healthy, a migration is usually unnecessary. However, for new tables or high-write architectures, UUID v7 is the recommended modern default.

---

## 15. Conclusion & Developer Tools

UUID v7 represents the biggest evolution in identifier design in two decades. By bridging the gap between distributed generation and database indexing efficiency, RFC 9562 provides software engineers with an optimal foundation for modern architectures.

Explore our full suite of free developer tools:

* [UUID Generator](/uuid-generator/) — Create instant, cryptographically secure UUID v4 and v7 identifiers.
* [GUID Generator](/guid-generator/) — Generate Microsoft & .NET ready GUIDs.
* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version & extract timestamps.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in batch.
* [Base64 UUID Generator](/base64-uuid-generator/) — Compress UUIDs into compact 22-character strings.
