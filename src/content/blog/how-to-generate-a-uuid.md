---
title: "How to Generate a UUID: Online, Programming Languages & Command Line"
description: "Learn how to generate UUIDs online, in JavaScript, Python, Java, C#, PHP, databases, and via command line. Complete beginner-friendly guide based on RFC 9562."
publishDate: 2026-08-28
author: "FastUUID Engineering Team"
category: "Tutorials & Code"
readingTime: "9 min read"
featured: true
---

Whether you are spinning up a new database table, creating an API endpoint, mocking test data, or configuring a cloud microservice, one of the most frequent tasks you will encounter as a developer is **generating a UUID** (Universally Unique Identifier).

A UUID provides a standardized, collision-resistant 128-bit identifier that can be generated anywhere—offline on a client device, inside a high-throughput backend service, or directly within your database.

Depending on what you are doing, the easiest way to generate a UUID changes:
* Need one or two identifiers right now for testing? **An online tool is fastest.**
* Building an automated application? **Your programming language's standard library is the way to go.**
* Working inside a terminal or build script? **A quick command-line utility does the job.**

In this practical, step-by-step tutorial, you will learn **how to generate UUIDs using every major method**: directly in your browser, across five popular programming languages (**JavaScript, Python, Java, C#, PHP**), in the command line (**Linux, macOS, PowerShell**), and directly inside SQL databases under the latest **RFC 9562** specification.

---

## 1. What Is a UUID? (Quick Recap)

A **UUID** (**Universally Unique Identifier**) is a 128-bit (16-byte) number standardized to provide global uniqueness across distributed systems without relying on a central database lock or coordinator.

In software, a UUID is written as a 36-character hexadecimal string divided by hyphens into five groups:

```text
550e8400-e29b-41d4-a716-446655440000
```

If you need a fresh identifier right this second, you can generate one instantly with our free browser-based [UUID Generator](/uuid-generator/).

---

## 2. What UUID Version Should You Generate?

Under **RFC 9562**, UUIDs are generated using different algorithms depending on the **UUID version**:

* **UUID v4 (Random):** Generated using cryptographically secure random bits. Best for general-purpose identifiers, API tokens, session IDs, and public URLs where creation time must remain secret.
* **UUID v7 (Unix Epoch Time + Random):** Begins with a 48-bit millisecond Unix timestamp, followed by random bits. **Best for database primary keys** because its natural time-ordering prevents B-Tree index fragmentation.
* **UUID v5 (Name-Based with SHA-1):** Deterministic identifier created by hashing a namespace and a string (e.g., generating an identical UUID from an email address across isolated services).
* **UUID v1 / v6 (Time-Based):** Legacy time-based specifications (Gregorian calendar epoch).

> **Rule of Thumb:** For general application development, choose **UUID v4** for pure randomness or **UUID v7** for database primary keys.

---

## 3. How to Generate a UUID Online (Fastest Method)

If you need one or more UUIDs for configuration files, database seeds, manual testing, or debugging, using an online web tool is the fastest method because it requires zero software installation or coding.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Open FastUUIDGenerator.com ──► 2. Select Version (v4 or v7)         │
│                                           │                            │
│ 4. Paste into your App/DB   ◄──── 3. Click Generate & Copy             │
└────────────────────────────────────────────────────────────────────────┘
```

### Steps to Generate Online:
1. Open the free [UUID Generator](/uuid-generator/).
2. Choose your preferred version (such as **UUID v4** for random IDs or **UUID v7** for time-sorted IDs).
3. Choose your formatting options (lowercase, uppercase, or with/without hyphens).
4. Click **Generate** and click **Copy**.

### Is In-Browser Generation Safe?
On **FastUUIDGenerator.com**, all identifiers are generated **100% client-side** directly inside your web browser using the browser's native Web Crypto API (`crypto.getRandomValues()`). Your generated UUIDs are never sent to a remote web server or logged over a network.

---

## 4. How to Generate Multiple UUIDs in Bulk

If you are writing migration scripts, populating a database with millions of test rows, or generating mock fixtures, creating UUIDs one-by-one is tedious.

You can generate hundreds or thousands of UUIDs simultaneously using our [Bulk UUID Generator](/bulk-uuid-generator/).

1. Open the [Bulk UUID Generator](/bulk-uuid-generator/).
2. Enter the quantity you need (e.g., 50, 500, or 10,000).
3. Select your output format (Plain List, JSON Array, SQL `INSERT` statements, or CSV).
4. Download the generated file or copy the list directly into your clipboard.

---

## 5. How to Generate a UUID in JavaScript & TypeScript

Modern JavaScript (both in web browsers and in Node.js 19+) includes a built-in, native method to generate cryptographically secure **UUID Version 4** identifiers without installing any third-party npm packages.

### Native JavaScript (Browser & Node.js 19+)
```javascript
// Native Web Crypto API (Standard in all modern browsers & Node 19+)
const id = crypto.randomUUID();

console.log(id);
// Output: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
```

### Generating UUID v7 in JavaScript / TypeScript
For time-ordered **UUID v7**, install the standard `uuid` package:

```bash
npm install uuid
```

```javascript
import { v7 as uuidv7, v4 as uuidv4 } from 'uuid';

// Generate UUID v7 (Time-Ordered for Databases)
const dbPrimaryKey = uuidv7();
console.log(dbPrimaryKey);
// Output: "018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d"

// Generate UUID v4 (Random)
const apiToken = uuidv4();
console.log(apiToken);
```

---

## 6. How to Generate a UUID in Python

Python provides complete, built-in UUID generation inside its standard library via the `uuid` module. No `pip install` is required.

### Generating UUID v4 (Random)
```python
import uuid

# Generate a cryptographically secure UUID v4
unique_id = uuid.uuid4()

print(unique_id)          # UUID object: 550e8400-e29b-41d4-a716-446655440000
print(str(unique_id))     # String: "550e8400-e29b-41d4-a716-446655440000"
print(unique_id.hex)      # Without hyphens: "550e8400e29b41d4a716446655440000"
```

### Generating UUID v5 (Deterministic / Name-Based)
```python
# Generate a consistent UUID based on a namespace and string
namespace = uuid.NAMESPACE_DNS
name_id = uuid.uuid5(namespace, "fastuuidgenerator.com")

print(name_id)
# Always produces the exact same UUID for this domain
```

### Generating UUID v7 in Python
In Python (or using the popular `uuid6` package):
```bash
pip install uuid6
```

```python
import uuid6

# Generate time-ordered UUID v7
order_id = uuid6.uuid7()
print(order_id)
# Output: 018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d
```

---

## 7. How to Generate a UUID in Java

Java has supported native UUID generation since Java 5 via the `java.util.UUID` class.

### Generating UUID v4 in Java
```java
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        // Generate random UUID (Version 4)
        UUID id = UUID.randomUUID();
        
        System.out.println("Generated UUID: " + id.toString());
        // Output: "d8e3b74e-6e21-4f9a-8c9e-5f12e8b0a3c2"
    }
}
```

Under the hood, `UUID.randomUUID()` uses Java's `SecureRandom` to guarantee cryptographic security.

---

## 8. How to Generate a UUID in C# and .NET

In the Microsoft .NET ecosystem, UUIDs are referred to as **GUIDs** (Globally Unique Identifiers). Both terms describe the exact same 128-bit identifier format.

### Generating UUID v4 in C#
```csharp
using System;

class Program {
    static void Main() {
        // Generate a new GUID (UUID Version 4)
        Guid newId = Guid.NewGuid();
        
        Console.WriteLine(newId.ToString());
        // Output: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
        
        // Output formatted with curly braces for Windows COM/Registry
        Console.WriteLine(newId.ToString("B"));
        // Output: "{f47ac10b-58cc-4372-a567-0e02b2c3d479}"
    }
}
```

### Generating UUID v7 in .NET 9+
Starting with **.NET 9**, Microsoft added native support for RFC 9562 UUID v7:

```csharp
// Native .NET 9+ UUID v7 Generation
Guid timeOrderedId = Guid.CreateVersion7();
Console.WriteLine(timeOrderedId);
```

If you are developing for Windows or COM applications, test our specialized [GUID Generator](/guid-generator/) to format IDs with custom brackets and uppercase options.

---

## 9. How to Generate a UUID in PHP

Modern PHP applications should always use secure, standardized UUID libraries rather than legacy hacks like `uniqid()`.

### Recommended Method: Symfony UID or Ramsey UUID
```bash
composer require symfony/uid
```

```php
<?php
use Symfony\Component\Uid\Uuid;

// Generate UUID v4 (Random)
$uuidV4 = Uuid::v4();
echo $uuidV4; // "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// Generate UUID v7 (Time-Ordered for Databases)
$uuidV7 = Uuid::v7();
echo $uuidV7; // "018d3b7d-3b7d-7bad-9bdd-2b0d7b3dcb6d"
?>
```

### Native PHP (No Composer)
If you cannot install Composer packages, you can construct an RFC-compliant UUID v4 using PHP's cryptographically secure `random_bytes()`:

```php
<?php
function generateUuidV4(): string {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // Set version to 0100 (v4)
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // Set variant to 10 (RFC 4122/9562)
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

echo generateUuidV4();
?>
```

---

## 10. How to Generate a UUID from the Command Line

If you are working inside a terminal, writing a shell deployment script, or configuring a remote Linux server, you can generate UUIDs without opening a browser or writing application code.

### 1. Linux (Bash)
Most Linux distributions include the `uuidgen` utility:

```bash
# Generate a random UUID (v4)
uuidgen

# Generate a time-based UUID (v1)
uuidgen -t
```

Alternatively, read directly from the Linux kernel entropy pool without any installed tools:

```bash
cat /proc/sys/kernel/random/uuid
```

### 2. macOS (Terminal)
macOS comes with `uuidgen` pre-installed:

```bash
uuidgen
# Output: 550E8400-E29B-41D4-A716-446655440000
```

To convert macOS uppercase output to standard lowercase:

```bash
uuidgen | tr '[:upper:]' '[:lower:]'
```

### 3. Windows (PowerShell)
In Windows PowerShell, call the .NET `[guid]` type directly:

```powershell
[guid]::NewGuid().ToString()
# Output: d8e3b74e-6e21-4f9a-8c9e-5f12e8b0a3c2
```

---

## 11. How to Generate a UUID Directly Inside Databases

Many relational and NoSQL databases can generate UUIDs directly inside SQL queries or as default column values:

```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ Database Engine                      │ SQL Command / Function               │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ PostgreSQL                           │ SELECT gen_random_uuid();            │
│ MySQL 8.0+                           │ SELECT UUID();                       │
│ Microsoft SQL Server                 │ SELECT NEWID();                      │
│ SQLite (with Extension)              │ SELECT lower(hex(randomblob(16)));   │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Example: PostgreSQL Table Default
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 12. UUID Generation Methods: Comparison Table

| Generation Method | Best For | Software Needed | Speed | Automation Friendly |
| :--- | :--- | :--- | :--- | :--- |
| **[UUID Generator](/uuid-generator/)** | Quick testing & debugging | Web Browser | Instant | Manual Copy/Paste |
| **[Bulk UUID Generator](/bulk-uuid-generator/)** | Mock fixtures, seed data | Web Browser | Instant | Batch Export |
| **JavaScript (`crypto`)** | Frontend apps, Node.js APIs| None (Built-in) | Nanoseconds | 100% Automated |
| **Python (`uuid`)** | Data science, backend APIs | None (Built-in) | Nanoseconds | 100% Automated |
| **Java (`UUID`)** | Enterprise services, Android| None (Built-in) | Nanoseconds | 100% Automated |
| **C# / .NET (`Guid`)** | Windows apps, ASP.NET Core | None (Built-in) | Nanoseconds | 100% Automated |
| **Command Line (`uuidgen`)** | Shell scripts, CI/CD pipelines| Terminal | Milliseconds | Scriptable |
| **Database (`DEFAULT`)** | Server-side record creation | SQL Database | Microseconds | Automated on INSERT |

---

## 13. How to Validate a Generated UUID

After receiving a UUID from user input, an API payload, or a file import, you should always validate that it conforms to standard RFC formatting before storing it in your database.

A valid canonical UUID must:
1. Contain exactly **36 characters** (32 hexadecimal digits + 4 hyphens).
2. Follow the **8-4-4-4-12** format.
3. Contain only valid hexadecimal characters (`0–9`, `a–f`, case-insensitive).
4. Have a valid **version digit** (`1–8`) at character position 15.
5. Have a valid **variant digit** (`8`, `9`, `a`, or `b`) at character position 20.

You can inspect, validate, and extract metadata from any identifier using our free [UUID / GUID Validator](/uuid-validator/).

---

## 14. Alternative Encodings: Base64 UUIDs

While standard 36-character UUID strings are easy to read, they take up 36 bytes in JSON payloads and database strings.

By converting the raw 128-bit binary representation into URL-safe Base64, you can compress the identifier into just **22 characters**:

```text
Canonical UUID:  550e8400-e29b-41d4-a716-446655440000  (36 chars)
Base64 UUID:     VQ6EAOKbQdSnFkRmVUQAAA                  (22 chars)
```

If you are optimizing mobile network bandwidth, clean URL routes, or cache keys, check out our [Base64 UUID Generator](/base64-uuid-generator/).

---

## 15. Common Mistakes to Avoid When Generating UUIDs

1. **Using Insecure Homemade Random Strings:** Never use `Math.random()` in JavaScript or `rand()` in PHP to generate identifiers. Homemade random strings lack cryptographic entropy and suffer high collision rates.
2. **Using UUID v4 as a High-Volume Database Key:** Inserting millions of random UUID v4 values causes severe B-Tree index fragmentation. Use **UUID v7** for database primary keys.
3. **Treating UUIDs as Secret Passwords:** UUIDs guarantee uniqueness, not confidentiality. Never use a UUID as an authentication password without dedicated cryptographic signatures or tokens.
4. **Storing UUIDs as 36-Character Text in Databases:** Whenever possible, store UUIDs in native 16-byte binary column types (`UUID` in Postgres, `BINARY(16)` in MySQL) to reduce disk space by over 50%.

---

## 16. Frequently Asked Questions (FAQ)

### What is the easiest way to generate a UUID?
The easiest way is to use an online [UUID Generator](/uuid-generator/) directly in your web browser. It requires no code or installation and gives you instant, copy-ready identifiers.

### How do I generate a UUID in JavaScript without libraries?
In modern browsers and Node.js 19+, use `crypto.randomUUID()`. It is built into the runtime and requires no npm dependencies.

### How do I generate a UUID in Python?
Use Python's built-in standard library: `import uuid; id = uuid.uuid4()`.

### How do I generate a UUID in C#?
Use `Guid.NewGuid()` in C# and .NET to generate a standard 128-bit UUID v4 identifier.

### Can I generate multiple UUIDs at once?
Yes. You can use our [Bulk UUID Generator](/bulk-uuid-generator/) to create thousands of unique UUIDs simultaneously in plain text, CSV, JSON, or SQL format.

### Are online UUID generators safe?
Yes, provided they run client-side. On FastUUIDGenerator.com, all identifiers are generated locally in your browser using the native Web Crypto API and are never transmitted to our servers.

---

## 17. Conclusion: Choose the Right Method for Your Needs

Generating UUIDs is a core skill for modern software engineers. The best method depends entirely on your workflow:

* **For quick manual tasks & testing:** Use our browser-based [UUID Generator](/uuid-generator/).
* **For database fixtures & load tests:** Use our [Bulk UUID Generator](/bulk-uuid-generator/).
* **For production applications:** Use native runtime methods like `crypto.randomUUID()` in JavaScript, `uuid.uuid4()` in Python, or `Guid.NewGuid()` in C#.
* **For database primary keys:** Choose **UUID v7** to keep your B-Tree indexes fast and unfragmented.

Explore our full suite of free developer tools:

* [UUID Generator](/uuid-generator/) — Fast, secure online UUID generation.
* [GUID Generator](/guid-generator/) — Generate Microsoft & .NET ready GUIDs.
* [UUID / GUID Validator](/uuid-validator/) — Verify syntax, extract version and variant metadata.
* [Bulk UUID Generator](/bulk-uuid-generator/) — Create up to 10,000 identifiers at once.
* [Base64 UUID Generator](/base64-uuid-generator/) — Convert 128-bit UUIDs into compact 22-character strings.
