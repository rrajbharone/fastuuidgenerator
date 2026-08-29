---
title: "What Happens When UUIDs Collide? UUID Collision Explained"
description: "What happens when two UUIDs are identical? Discover how databases, APIs, and distributed systems handle UUID collisions, error codes, and recovery strategies."
publishDate: 2026-08-29
author: "FastUUID Engineering Team"
category: "Security & Architecture"
readingTime: "10 min read"
featured: true
---

If you are architecting a high-throughput database, designing microservices, or synchronizing offline mobile data, you have likely wondered: **What happens when UUIDs collide?**

Here is the direct, technical answer:

* **When two independently generated UUIDs have identical 128-bit values, a UUID collision has occurred.**
* **What happens next depends entirely on your database and application architecture:**
  * **If protected by a `PRIMARY KEY` or `UNIQUE` constraint:** The database immediately **rejects the duplicate insert** and throws a constraint violation error. Your existing data remains completely safe.
  * **If unprotected without constraints:** The database silently stores multiple records with the same ID, causing **ambiguous API lookups, broken foreign key relationships, and data corruption**.
  * **If using unsafe "Upsert" queries:** The new record may silently **overwrite existing user data**.
* **The Reality Check:** For properly implemented **UUID Version 4 (Random)** and **UUID Version 7 (Time-Ordered)** identifiers, an accidental collision in production is **astronomically unlikely** ($1 \text{ in } 5.3 \times 10^{36}$).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   THE PATHWAY OF A UUID COLLISION                      │
├────────────────────────────────────────────────────────────────────────┤
│ Generator 1 (Server US): 550e8400-e29b-41d4-a716-446655440000          │
│ Generator 2 (Server EU): 550e8400-e29b-41d4-a716-446655440000          │
│                                      ▼                                 │
│                      DATABASE ATTEMPTS INSERTION                       │
│                                      ▼                                 │
│ ┌────────────────────────────────────┬───────────────────────────────┐ │
│ │ WITH PRIMARY KEY / UNIQUE INDEX    │ WITHOUT CONSTRAINTS           │ │
│ ├────────────────────────────────────┼───────────────────────────────┤ │
│ │ • Transaction is REJECTED          │ • Duplicate row is INSERTED   │ │
│ │ • Error thrown to application      │ • Ambiguous REST API queries  │ │
│ │ • Existing data is PRESERVED       │ • Silent data corruption      │ │
│ └────────────────────────────────────┴───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

In this comprehensive guide, we will examine **what happens during a UUID collision across databases, APIs, URLs, and distributed systems, how collision errors look in code, and how to implement safe recovery strategies.**

---

## 1. What Is a UUID Collision?

A **UUID collision** occurs when two separate, independent generation events produce the exact same 128-bit identifier for two different entities:

```text
Resource A (Created in New York): 550e8400-e29b-41d4-a716-446655440000
Resource B (Created in Tokyo):    550e8400-e29b-41d4-a716-446655440000
```

### What Is NOT a UUID Collision:
* **Formatting Differences:** `550e8400...` (lowercase) and `550E8400...` (uppercase) are the exact same identifier, not a collision.
* **Deterministic Hashing:** In **UUID v3** and **UUID v5**, hashing the same name and namespace intentionally outputs the identical UUID.
* **Accidental ID Reuse:** A software bug where an application copies an existing ID to a new row is a programming bug, not a random collision.

If you need a fresh, cryptographically unpredictable identifier right now, use our free [UUID Generator](/uuid-generator/).

---

## 2. Why Can UUIDs Collide? (The Math)

Under **RFC 9562**, every UUID is stored in **128 binary bits** ($2^{128}$ total states).

In **UUID Version 4 (Random)**:
* **6 bits** are reserved for version and variant metadata.
* **122 bits** are generated from cryptographically secure random entropy.

$$\text{Total Random Possibilities} = 2^{122} = 5,316,911,983,139,663,491,615,158,242,462,453,760 \approx 5.3 \times 10^{36}$$

Because $2^{122}$ is a finite number, picking numbers at random means two generators could theoretically pick the exact same number. 

### How Likely Is a Collision? (The Birthday Paradox)
The probability of a collision among $n$ generated UUIDs is given by the birthday bound formula:

$$P(\text{collision}) \approx \frac{n^2}{2 \times 2^{122}} = \frac{n^2}{2^{123}}$$

* If you generate **1 billion UUIDs ($10^9$)**: The collision chance is $\approx 9.4 \times 10^{-20}$ (less likely than being hit by a meteorite).
* To reach a **50% probability of a single collision**: You must generate **$2^{61} \approx 2.3 \times 10^{18}$ UUIDs** (generating 1 billion IDs per second continuously for **73 years**).

---

## 3. What Happens If a UUID Collision Occurs in a Database?

When a duplicate UUID reaches a database engine, the outcome depends on how your table schema is configured:

```sql
-- Scenario 1: UUID as Primary Key (Protected)
CREATE TABLE orders_secure (
    id UUID PRIMARY KEY,
    total DECIMAL(10, 2) NOT NULL
);

-- Scenario 2: UUID without Constraints (Dangerous)
CREATE TABLE orders_insecure (
    id UUID,
    total DECIMAL(10, 2) NOT NULL
);
```

### Scenario 1: The Column Has a `PRIMARY KEY` or `UNIQUE` Constraint
This is the recommended industry standard.
1. The database B-Tree index detects that the 128-bit key already exists.
2. The database **aborts the insert transaction** and rolls back any pending changes.
3. The database returns a **Unique Constraint Violation error** to your application.
4. **Result:** Zero data corruption. The original record remains safe.

### Scenario 2: The Column Has NO Constraints
If a developer forgets to add a `PRIMARY KEY` or `UNIQUE` constraint:
1. The database engine successfully writes the new record.
2. The table now contains **two completely different rows sharing the exact same ID**.
3. When an application queries `SELECT * FROM orders WHERE id = '550e8400...'`, the database returns multiple records or an arbitrary row.
4. **Result:** Critical data ambiguity, broken foreign keys, and application state corruption.

### Scenario 3: Unsafe "Upsert" Operations (`ON CONFLICT DO UPDATE`)
If your backend uses `INSERT ... ON CONFLICT (id) DO UPDATE`:
* The database treats the colliding insert as an intentional update to the existing record.
* The new incoming data **silently overwrites the existing user's data**.

---

## 4. What Does a UUID Collision Error Look Like?

When a database rejects a colliding UUID, it throws a standard SQL error code:

| Database Engine | Standard Error Message | SQLSTATE Error Code |
| :--- | :--- | :--- |
| **PostgreSQL** | `ERROR: duplicate key value violates unique constraint "users_pkey"` | `23505` (`unique_violation`) |
| **MySQL / MariaDB** | `ERROR 1062 (23000): Duplicate entry '550e8400...' for key 'PRIMARY'` | `23000` (`ER_DUP_ENTRY`) |
| **SQLite** | `RuntimeError: UNIQUE constraint failed: users.id` | `SQLITE_CONSTRAINT_PRIMARYKEY` |
| **SQL Server** | `Violation of PRIMARY KEY constraint 'PK_Users'. Cannot insert duplicate key` | `2627` / `2601` |

---

## 5. What Happens in APIs and Web Services?

When UUIDs are exposed as REST API endpoints (`/api/v1/documents/{uuid}`):

```text
GET /api/v1/documents/550e8400-e29b-41d4-a716-446655440000
```

If a duplicate UUID slipped into the database:
1. **Ambiguous Resource Routing:** The backend ORM (Prisma, Hibernate, Entity Framework) may throw a `MultipleRowsFound` exception and return an internal `500 Server Error`.
2. **Incorrect Data Exposure:** The API might return Document B (owned by User B) to User A.
3. **Destructive Operations:** A `DELETE /documents/{uuid}` request intended for one user could delete another user's document.
4. **Cache Poisoning:** Edge CDNs and Redis cache layers will overwrite cached data for one resource with another.

> **Takeaway:** Database `PRIMARY KEY` constraints prevent all of these API failures by ensuring invalid duplicates can never be saved.

---

## 6. What Happens in Distributed Systems & Microservices?

In modern microservice architectures, different services generate UUIDs independently without a central database coordinator:

```text
Service A (Billing in US):  Generates Order ID: 550e8400...
Service B (Shipping in EU): Generates Order ID: 550e8400...
```

When events are published to a central message broker (Kafka, RabbitMQ, AWS SQS) or synced into a centralized data warehouse:
* **Event Sourcing Conflicts:** The event bus or stream processor will encounter duplicate event IDs.
* **Cross-Region Replication Failures:** During active-active database replication between AWS regions, replication threads will halt on duplicate key collisions until manual conflict resolution occurs.

---

## 7. What Happens in Offline-First Mobile & Desktop Apps?

Offline-first applications (like Notion, Apple Notes, or mobile inventory scanners) generate UUIDs on local SQLite/IndexedDB databases while disconnected from the internet.

When the device reconnects and syncs with the central cloud server:
* If a local UUID matches an existing cloud UUID, the cloud API returns a `409 Conflict` status code.
* **Sync Conflict Resolution:** The client must catch the 409 error, generate a new UUID for the local record, update local foreign key relationships, and re-sync.

---

## 8. What Should You Do If a UUID Collision Occurs? (Recovery Strategy)

If your application catches a database unique constraint violation on a UUID column, follow this battle-tested 5-step recovery workflow:

```javascript
// SECURE RETRY PATTERN IN NODE.JS / JAVASCRIPT
async function createOrderWithRetry(orderData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const newId = crypto.randomUUID(); // Generate fresh cryptographically secure UUID
    
    try {
      return await db.orders.create({
        data: { id: newId, ...orderData }
      });
    } catch (error) {
      // Check for Database Unique Constraint Violation (e.g. Postgres code 23505)
      if (error.code === '23505' && attempt < maxRetries) {
        console.warn(`[WARNING] UUID Collision detected on ID ${newId}. Retrying attempt ${attempt}...`);
        continue; // Retry with a fresh UUID
      }
      throw error; // Re-throw other database errors
    }
  }
}
```

### The 5-Step Recovery Rule:
1. **Catch Unique Violations Specifically:** Only retry if the error is specifically a unique constraint violation on the UUID column.
2. **Generate a Fresh UUID:** Call your platform's CSPRNG (`crypto.randomUUID()`) to generate a new identifier.
3. **Limit Retries (Max 3):** Never write an infinite `while (true)` loop.
4. **Log the Event with High Severity:** Because an accidental collision in UUID v4 is statistically improbable, a collision is almost always a symptom of a **broken random number generator or VM snapshot cloning flaw**.
5. **Investigate the Root Cause:** If collisions happen more than once in a decade, audit your RNG implementation immediately.

---

## 9. Can UUID Version 7 (UUID v7) Collide?

**UUID Version 7** (RFC 9562) combines a 48-bit Unix millisecond timestamp with 74 bits of random entropy:

```text
018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d
```

### UUID v7 Collision Behavior:
* **Different Milliseconds:** Collisions are mathematically impossible across different milliseconds because the leading timestamp bits differ.
* **Same Millisecond:** Within the exact same millisecond, UUID v7 relies on 74 bits of random entropy (or sub-millisecond sequence counters), allowing thousands of unique IDs per millisecond per node before collision risks appear.

Generate time-ordered identifiers with our free [UUID v7 Generator](/uuid-v7-generator/).

---

## 10. Intentional Duplicate UUIDs vs. Accidental Collisions

| Scenario | Nature | Root Cause | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **UUID v4 Collision** | **Accidental** | Random probability ($1 \text{ in } 5.3 \times 10^{36}$) | Database rejects insert; application retries. |
| **UUID v5 Hash** | **Intentional** | Same namespace + string name | Produces identical UUID deterministically. |
| **Idempotency Key** | **Intentional** | Client retrying a dropped HTTP request | Server recognizes duplicate and returns cached response. |
| **Database Migration Bug** | **Error** | Script mistakenly running twice | Database unique constraint halts duplicate migration. |

---

## 11. How to Prevent UUID Collision Problems (Best Practices)

1. **Always Set `PRIMARY KEY` or `UNIQUE`:** Never store UUIDs in unindexed, non-unique database columns.
2. **Use Built-in Cryptographic APIs:** Always use native APIs (`crypto.randomUUID()`, `uuid.uuid4()`, `Guid.NewGuid()`).
3. **Never Use `Math.random()`:** Non-cryptographic PRNGs have tiny seed spaces and will collide frequently under concurrency.
4. **Use UUID v7 for Time-Series Databases:** Eliminate cross-millisecond collisions while boosting B-Tree write speeds.
5. **Implement Bounded Retry Logic:** Catch constraint violations and retry with a new UUID.
6. **Beware of Virtual Machine Cloning:** Ensure cloned cloud VM instances re-seed their entropy pools on boot.

If you need to batch-generate and test thousands of unique identifiers for load testing, explore our [Bulk UUID Generator](/bulk-uuid-generator/).

---

## 12. Frequently Asked Questions (FAQ)

### What happens when two UUIDs collide in a database?
If the column has a `PRIMARY KEY` or `UNIQUE` constraint, the database aborts the transaction and throws a unique constraint error. If there are no constraints, the duplicate row is saved, causing data ambiguity.

### Can a UUID collision cause data loss?
A collision alone does not cause data loss if primary keys are used. However, if an application uses unsafe `UPSERT` queries (`ON CONFLICT DO UPDATE`), colliding records can overwrite existing data.

### How do I fix a UUID collision in my code?
Catch the database unique constraint violation error, generate a fresh UUID using a cryptographic random generator, and retry the insertion.

### Has a real UUID v4 collision ever been recorded?
With properly implemented CSPRNGs, no accidental UUID v4 collision has ever been documented in normal computing history due to the $5.3 \times 10^{36}$ combination space.

### What is the SQL error code for a duplicate UUID?
PostgreSQL returns error code `23505` (`unique_violation`), MySQL returns `1062` (`ER_DUP_ENTRY`), and SQL Server returns `2627`.

### Are UUID v7 identifiers collision-proof?
No identifier is 100% collision-proof. However, UUID v7 guarantees zero collisions across different milliseconds and provides 74 bits of entropy within the same millisecond.

### Why do I keep getting duplicate UUIDs in my app?
If you see frequent duplicate UUIDs, you are likely using a weak PRNG like `Math.random()`, reusing a static variable, or cloning virtual machine snapshots without re-seeding the OS random pool.

---

## 13. Conclusion & Developer Tools

In summary: **When UUIDs collide, your database constraints protect your data by rejecting the duplicate.** With standard RFC 9562 cryptographic generators, collisions are practically non-existent—but enforcing database integrity ensures your systems remain 100% bulletproof.

Explore our full suite of free developer tools:

* [UUID Generator](/uuid-generator/) — Create instant, cryptographically secure UUID v4 and v7 identifiers.
* [UUID v4 Generator](/uuid-v4-generator/) — Generate pure random 122-bit UUIDs.
* [UUID v7 Generator](/uuid-v7-generator/) — Generate modern time-ordered database UUIDs.
* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version & extract timestamps.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Generate up to 10,000 identifiers in batch.
* [Base64 UUID Generator](/base64-uuid-generator/) — Convert 128-bit UUIDs into compact 22-character strings.

---

## SEO Metadata

### SEO Title
What Happens When UUIDs Collide? UUID Collision Explained

### Meta Description
What happens when two UUIDs are identical? Discover how databases, APIs, and distributed systems handle UUID collisions, error codes, and recovery strategies.

### Suggested URL Slug
`/blog/what-happens-when-uuids-collide/`

### Suggested Featured Image
* **Image Concept:** Modern architectural diagram showing two identical UUID strings hitting a database shield where a "PRIMARY KEY Constraint Violation" cleanly blocks the duplicate while keeping data secure.
* **Image Headline/Text:** What Happens When UUIDs Collide? Database • Errors • Recovery
* **SEO-Friendly Alt Text:** Visual diagram explaining what happens when UUIDs collide in databases, APIs, and distributed systems

---

## Internal Linking Opportunities

1. **UUID Generator (`/uuid-generator/`)**
   * *Anchor Text:* [UUID Generator](/uuid-generator/)
   * *Location:* Section 1 & Conclusion.
2. **UUID v7 Generator (`/uuid-v7-generator/`)**
   * *Anchor Text:* [UUID v7 Generator](/uuid-v7-generator/)
   * *Location:* Section 9 (Can UUID Version 7 Collide?) & Conclusion.
3. **UUID / GUID Validator (`/uuid-validator/`)**
   * *Anchor Text:* [UUID / GUID Validator](/uuid-validator/)
   * *Location:* Conclusion.
4. **Bulk UUID Generator (`/bulk-uuid-generator/`)**
   * *Anchor Text:* [Bulk UUID Generator](/bulk-uuid-generator/)
   * *Location:* Section 11 (How to Prevent UUID Collision Problems) & Conclusion.
5. **UUID v4 Generator (`/uuid-v4-generator/`)**
   * *Anchor Text:* [UUID v4 Generator](/uuid-v4-generator/)
   * *Location:* Conclusion.
