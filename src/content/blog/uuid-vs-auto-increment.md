---
title: "UUIDs in Databases: UUID vs Auto-Increment IDs for Primary Keys"
description: "Should you use UUIDs or auto-increment integer IDs as database primary keys? Compare storage size, B-Tree index performance, UUID v7, security, and scalability."
publishDate: 2026-08-28
author: "FastUUID Engineering Team"
category: "Database & Architecture"
readingTime: "10 min read"
featured: true
---

When designing a new database schema, one of the most critical architectural decisions you will make is choosing your **primary key strategy**:

Should your records use a simple sequential number like `1042`, or a 128-bit string like `550e8400-e29b-41d4-a716-446655440000`?

```sql
-- Option A: Auto-Increment Integer
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);

-- Option B: Universally Unique Identifier (UUID)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL
);
```

For years, developers have engaged in heated debates over this topic. Some argue that auto-increment IDs are the only way to maintain fast database indexes. Others insist that modern cloud microservices make UUIDs mandatory.

The truth is nuanced: **neither option is universally superior.**

In this comprehensive, developer-focused guide, we will compare **UUIDs vs Auto-Increment IDs** across every dimension that matters: **storage overhead, B-Tree index fragmentation, query performance, API security, distributed scalability, and how the new UUID v7 standard (RFC 9562) changes the equation.**

---

## 1. What Is a Primary Key?

A **Primary Key** is a unique identifier assigned to every row in a database table. It ensures that every record can be retrieved, updated, and referenced by other tables via **Foreign Keys**.

To perform well, a primary key should satisfy three criteria:
1. **Uniqueness:** No two rows in the same table can share the same value.
2. **Immutability:** Once assigned, the key should never change.
3. **Index Efficiency:** The database must be able to search and sort keys with minimal memory overhead.

If you need to generate test keys right now, try our browser-based [UUID Generator](/uuid-generator/).

---

## 2. What Is an Auto-Increment ID?

An **Auto-Increment ID** (often called `IDENTITY` in SQL Server and PostgreSQL, or `AUTO_INCREMENT` in MySQL) is a sequential integer generated centrally by the database engine:

$$\text{Row 1} \rightarrow 1, \quad \text{Row 2} \rightarrow 2, \quad \text{Row 3} \rightarrow 3 \dots$$

```sql
-- Standard SQL Auto-Increment Table
CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    total_amount NUMERIC(10, 2) NOT NULL
);
```

### Why Developers Love Auto-Increment IDs:
* **Extremely Compact:** An 8-byte `BIGINT` provides over 9 quintillion IDs in just half the memory of a native UUID.
* **Naturally Sequential:** New rows are always appended to the right edge of database index pages, maximizing write throughput.
* **Human-Friendly:** An ID like `order #4821` is easy to read, remember, and communicate verbally to customer support.

---

## 3. What Is a UUID Primary Key?

A **UUID** (**Universally Unique Identifier**) is a 128-bit (16-byte) number standardized under **RFC 9562**. It is formatted as a 36-character hexadecimal string:

```text
550e8400-e29b-41d4-a716-446655440000
```

### Why Developers Choose UUIDs:
* **Fully Decentralized Generation:** Any backend server, background worker, or offline mobile app can generate a valid, collision-resistant primary key locally without contacting a central database.
* **Effortless Merging:** Data from multiple regional databases can be merged into a single data lake without primary key collisions.
* **Opaque to External Observers:** Unlike sequential IDs, random UUIDs do not reveal business metrics (such as daily signups or total sales volume) in public URLs.

---

## 4. UUID vs Auto-Increment: Quick Comparison Table

| Feature | Auto-Increment ID (`BIGINT`) | Native UUID (`UUID` / `BINARY(16)`) | Text UUID (`VARCHAR(36)`) |
| :--- | :--- | :--- | :--- |
| **Storage Size** | **8 bytes** | 16 bytes | 36 bytes |
| **Generation Origin** | Database Engine Only | **Any Client, Server, or Device** | **Any Client, Server, or Device** |
| **Distributed Scaling** | Difficult (Requires Central Locks) | **Seamless (Zero Coordination)** | **Seamless (Zero Coordination)** |
| **Index Locality** | Naturally Sequential | **Sequential (v7)** / Random (v4)| **Sequential (v7)** / Random (v4)|
| **B-Tree Fragmentation**| Very Low | Low with v7 / High with v4 | High |
| **Guessability / Enumeration**| Trivial to Guess (`id+1`) | **Practically Impossible to Guess**| **Practically Impossible to Guess**|
| **Human Readability** | High (`1048`) | Low (`550e8400-...`) | Low (`550e8400-...`) |
| **Foreign Key Footprint** | Small (8 bytes per FK) | Medium (16 bytes per FK) | Large (36 bytes per FK) |

---

## 5. Storage Size & Memory Overhead: The Hidden Ripple Effect

One of the biggest differences between integers and UUIDs is their **storage footprint on disk and RAM**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Comparative Primary Key Storage Size:                                  │
│ BIGINT (8 Bytes):          [████████]                                  │
│ Native UUID (16 Bytes):    [████████████████]                          │
│ Text UUID (36 Bytes):      [████████████████████████████████████]      │
└────────────────────────────────────────────────────────────────────────┘
```

* An 8-byte `BIGINT` takes **8 bytes**.
* A native 16-byte `UUID` (PostgreSQL `UUID` or MySQL `BINARY(16)`) takes **16 bytes** (2x larger).
* Storing UUIDs as raw strings (`VARCHAR(36)`) takes **36 bytes** (4.5x larger).

### The Foreign Key Multiplier
The storage overhead does not just apply to the primary table. If a `users` table has 10 child tables (`orders`, `invoices`, `user_sessions`, `audit_logs`), every child table must store the 16-byte foreign key:

$$\text{10 Foreign Key Tables} \times \text{16 bytes} = \mathbf{160 \text{ bytes per user relationship}}$$

In large enterprise systems with billions of relational records, this extra storage increases disk requirements and reduces the number of index pages that can fit into the database's RAM cache.

---

## 6. Index Performance & B-Tree Page Splits

Relational databases like **PostgreSQL, MySQL (InnoDB), and SQLite** store indexes in tree structures called **B-Trees**.

A B-Tree stores rows in fixed-size blocks of memory called **pages** (usually 8 KB or 16 KB each):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Database B-Tree Index Insertion                      │
├────────────────────────────────────┬───────────────────────────────────┤
│ Auto-Increment / UUID v7 Insert    │ Random UUID v4 Insert             │
│ (Sequential Append Pattern)        │ (Random Insertion Pattern)        │
│                                    │                                   │
│ [ Page 1 ] [ Page 2 ] [ Page 3 ]   │ [ Page 1 ] [ Page 2 ] [ Page 3 ]  │
│   Full       Full     ► Append ◄   │   Split!     Split!     Split!    │
└────────────────────────────────────┴───────────────────────────────────┘
```

* **When using Auto-Increment IDs:** Every new row has an ID larger than the last. New rows are always appended to the **right-most page**. When a page fills up, the database allocates a new page. Pages stay 90–99% packed, and writes are extremely fast.
* **When using Random UUID v4:** Every new row lands in an arbitrary page scattered across disk. When a page fills up, the database must halt, split the 16 KB page into two 8 KB pages, and rewrite tree pointers (**a B-Tree page split**). Over time, indexes become 50% empty and fragmented, causing heavy disk I/O.

---

## 7. Enter UUID v7: The Best of Both Worlds

In May 2024, the IETF standardized **UUID Version 7** in **RFC 9562**.

UUID v7 solves the B-Tree fragmentation problem by embedding a **48-bit Unix millisecond timestamp** at the beginning of the identifier, followed by 74 bits of randomness:

```text
 018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d
[  48-bit Unix ms  ] [16b] [16b] [  48 bits  ]
 Timestamp Section   Ver+R Var+R  Random Bits
```

Because UUID v7 values increase monotonically over time, **they append sequentially to database B-Tree index pages just like auto-increment integers**, while still providing all the decentralized benefits of a 128-bit UUID.

---

## 8. Distributed Systems & Microservices: Where Auto-Increment Fails

Auto-increment IDs work well in a single, monolithic database. But in modern distributed architectures, sequential counters create massive bottlenecks:

```text
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Microservice A   │     │ Microservice B   │     │ Mobile Client    │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                Single Database Lock Bottleneck (Auto-Increment)
```

### 1. Coordination Locks
If multiple services need to create records, every service must wait on the central database to assign the next ID.

### 2. Multi-Region Merging
If your application runs in `us-east` and `eu-west`, both databases will create `user_id = 1`. Merging these tables in an analytics warehouse causes catastrophic primary key collisions.

### 3. Offline Mobile Clients
A mobile app operating offline cannot assign an auto-increment ID to a local draft. With UUIDs, the device assigns a permanent ID immediately; when internet connectivity returns, the record syncs seamlessly.

---

## 9. Security & Privacy: Why Sequential IDs Expose Business Metrics

Sequential IDs present a major security flaw known as the **Insecure Direct Object Reference (IDOR) / Enumeration Vulnerability**:

```text
https://example.com/api/v1/invoices/1001  <-- Attacker simply changes to 1002, 1003...
https://example.com/api/v1/invoices/550e8400-e29b-41d4-a716-446655440000  <-- Cannot be guessed
```

* **Competitor Espionage:** A competitor can place an order on day 1 (Order #1000) and another on day 30 (Order #4000), immediately knowing you process exactly 3,000 orders per month.
* **Web Scraping:** Automated scrapers can iterate through `user/1` to `user/1000000` to harvest your entire customer directory.

> **Important Security Rule:** UUIDs make URLs unguessable, but **obscurity is not authorization**. Your application must still verify that the authenticated user has permission to view the requested record.

---

## 10. Database Engine Specifics: Postgres, MySQL & SQL Server

### 1. PostgreSQL
PostgreSQL features native support for the 16-byte `UUID` data type:

```sql
-- PostgreSQL with Native UUID
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);
```
In PostgreSQL, native `UUID` columns index cleanly and consume only 16 bytes. For time-ordered indexing, application-generated **UUID v7** works seamlessly with PostgreSQL's standard B-Tree indexes.

### 2. MySQL (InnoDB)
MySQL does not have a dedicated `UUID` type. Developers typically choose between:
* `VARCHAR(36)`: Easy to read, but slow and takes 36 bytes.
* `BINARY(16)`: **Recommended for MySQL.** Stores the raw 16 bytes compactly.

Because InnoDB organizes tables as **clustered indexes**, using sequential **UUID v7 stored as `BINARY(16)`** prevents severe disk fragmentation compared to random UUID v4.

### 3. Microsoft SQL Server
In SQL Server, 128-bit identifiers use the `UNIQUEIDENTIFIER` type. In the Microsoft ecosystem, UUIDs are commonly called **GUIDs**. 

Using standard `NEWID()` (random UUID v4) as a clustered primary key in SQL Server causes severe index page splits. SQL Server developers historically used `NEWSEQUENTIALID()` or modern **.NET 9 `Guid.CreateVersion7()`** to ensure sequential clustered indexing. You can format Windows-compatible GUIDs with our [GUID Generator](/guid-generator/).

---

## 11. The Hybrid Architecture: Best of Both Worlds

Many high-scale companies (including Stripe, GitHub, and Shopify) adopt a **hybrid identifier architecture**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ HYBRID IDENTIFIER PATTERN:                                             │
│                                                                        │
│ • Internal Database Primary Key:  BIGINT (8 bytes)                     │
│   (Used for high-speed foreign key joins and compact internal indexes) │
│                                                                        │
│ • Public External Resource ID:   UUID (16 bytes)                       │
│   (Exposed in REST APIs, GraphQL, and public URLs)                     │
└────────────────────────────────────────────────────────────────────────┘
```

```sql
CREATE TABLE accounts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Internal joins
    public_id UUID UNIQUE DEFAULT gen_random_uuid(),    -- External API URLs
    email VARCHAR(255) NOT NULL
);
```

### Trade-Offs of the Hybrid Approach:
* **Pros:** Fast, compact 8-byte internal joins + safe, unguessable public URLs.
* **Cons:** Requires managing two ID columns per table and slightly increases schema complexity.

---

## 12. Alternative Encodings: Base64 UUIDs

When exposing UUIDs in URLs or mobile API payloads, 36-character strings can look unnecessarily long.

By encoding the raw 128 bits into URL-safe Base64, you can compress the string down to **22 characters**:

```text
Canonical UUID:  550e8400-e29b-41d4-a716-446655440000  (36 chars)
Base64 UUID:     VQ6EAOKbQdSnFkRmVUQAAA                  (22 chars)
```

Test compact encodings with our free [Base64 UUID Generator](/base64-uuid-generator/).

---

## 13. When to Choose Auto-Increment vs UUID

```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ CHOOSE AUTO-INCREMENT (BIGINT) IF:   │ CHOOSE UUID (v7 or v4) IF:           │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Centralized monolithic database    │ • Distributed or microservices stack │
│ • Internal admin / reporting tables  │ • Client/offline ID generation       │
│ • Maximum storage & index density    │ • Public APIs and secure URLs        │
│ • High-volume relational joins       │ • Multi-region data merging          │
│ • Simple CRUD applications           │ • Event-driven & message architectures│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

If you need to batch-generate test data to benchmark integer vs UUID performance in your database, use our [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 14. Frequently Asked Questions (FAQ)

### Are UUIDs slower than auto-increment integers?
In pure integer comparison, an 8-byte `BIGINT` is slightly faster and takes half the storage of a 16-byte UUID. However, with modern **UUID v7**, the database insert performance of UUIDs is nearly identical to integers because sequential B-Tree writes eliminate page splits.

### Should I use UUID v4 or UUID v7 for database primary keys?
Use **UUID v7**. Because UUID v7 embeds a millisecond timestamp, records sort chronologically, preventing the severe B-Tree index fragmentation caused by random UUID v4 values.

### Can UUIDs be used as foreign keys?
Yes. However, remember that foreign key columns and secondary indexes will also store 16 bytes instead of 8 bytes, which increases overall memory usage.

### Does using a UUID make my API completely secure?
No. While UUIDs prevent attackers from guessing the next sequential ID, your API must still authenticate users and verify authorization on every request.

### How do I check if a database UUID is valid?
You can validate syntax, version, and variant metadata using our free [UUID / GUID Validator](/uuid-validator/).

---

## 15. Conclusion

Choosing between auto-increment IDs and UUIDs is not about finding the "better" technology—it is about picking the right tool for your system's architecture:

* **Auto-Increment (`BIGINT`):** Best for single-node monolithic databases, compact relational schemas, and maximum memory efficiency.
* **UUID v7 (RFC 9562):** The modern default for cloud-native microservices, distributed data, and high-performance database primary keys.
* **Hybrid Model:** Ideal for large systems wanting fast internal integer joins paired with safe, unguessable public UUIDs.

Explore our full suite of free developer tools:

* [UUID Generator](/uuid-generator/) — Create instant, cryptographically secure UUID v4 and v7 identifiers.
* [GUID Generator](/guid-generator/) — Generate Microsoft & .NET ready GUIDs.
* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version & extract timestamps.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in batch.
* [Base64 UUID Generator](/base64-uuid-generator/) — Convert 128-bit UUIDs into compact 22-character strings.
