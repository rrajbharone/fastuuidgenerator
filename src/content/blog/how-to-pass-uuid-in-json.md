---
title: "How to Pass a UUID in JSON: Correct Format and Examples"
description: "Learn how to pass a UUID in JSON correctly. Practical guide with valid JSON examples, API request payloads, JavaScript fetch, Python json, validation, and common fixes."
publishDate: 2026-10-14
author: "FastUUID Engineering Team"
category: "Tutorials & Code"
readingTime: "8 min read"
featured: true
---

If you are developing an API, sending form submissions, or processing webhooks, you will regularly need to include unique identifiers in your data payloads. 

When working with unique identifiers, developers often ask:

**How do you pass a UUID in JSON correctly?**

The direct answer is simple:

* **A UUID must always be passed as a string enclosed in standard double quotation marks (`"..."`).**
* JSON has no dedicated "UUID" data type. 
* Because standard UUIDs contain hexadecimal letters (`a–f`) and hyphens (`-`), sending a UUID without quotation marks is invalid JSON syntax and will cause the parser to fail.

Here is the standard **JSON UUID example**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

In this payload, `"id"` is the object key, and `"550e8400-e29b-41d4-a716-446655440000"` is the string value. Enclosing the identifier in double quotes makes it valid JSON that any programming language or browser can read.

This guide explains **how to pass a UUID in JSON** across objects and arrays, API requests and responses, code examples in JavaScript and Python, format validation, and solutions to common mistakes.

---

## What Is a UUID?

A **UUID** (Universally Unique Identifier) is a standardized 128-bit label used to identify records across distributed systems without a central registry. Governed by [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html), UUIDs allow independent systems to generate identifiers without collision risk.

In readable text, a canonical UUID is represented as a **36-character string** containing 32 hexadecimal characters (numbers `0–9` and lowercase letters `a–f`) grouped by four hyphens:

```text
550e8400-e29b-41d4-a716-446655440000
```

This follows the **8-4-4-4-12 pattern**, dividing 128 bits across five distinct groups. Applications use UUIDs to identify users, orders, and database rows. Remember that a UUID is an **identifier specification**, not a built-in JSON type. In JSON, UUIDs are always treated as text.

If you need a fresh identifier for testing, you can create one with our free [UUID Generator](/uuid-generator/).

---

## What Is the Correct UUID Format in JSON?

The JSON specification ([RFC 8259](https://datatracker.ietf.org/doc/html/rfc8259)) supports only six data types: string, number, object, array, boolean, and null. Because JSON lacks a native UUID type, an identifier is stored using the **JSON string format**.

Here are the three standard ways to pass a **UUID in JSON**:

### 1. UUID as an Object Property

To identify a single resource, assign the UUID string to a property name:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. UUID as a Value in an Array

For batch operations or list filtering, place UUID strings inside a JSON array:

```json
{
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
  ]
}
```

### 3. UUID as Part of a Nested Object

In structured API payloads, UUIDs link related entities:

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alex"
  }
}
```

### JSON Syntax vs. UUID Validation

There is a vital difference between valid JSON syntax and valid UUID formatting:

```json
{
  "id": "sample-string-value"
}
```

To a JSON parser, this payload is valid because `"id"` has a string value. However, an API expecting a real 128-bit identifier will reject the value during **UUID validation**.

* The **JSON parser** confirms brackets, quotes, and commas are syntactically sound.
* The **application layer** confirms the characters inside those quotes form an authentic RFC-compliant UUID.

---

## How to Pass a UUID in a JSON API Request

When communicating with web services, developers frequently include a **UUID in request body** payloads using HTTP `POST`, `PUT`, or `PATCH` methods.

Here is an example HTTP request sending JSON data:

```http
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Alex"
}
```

### Key Rules for API Payloads:

1. **Quotation Marks:** The UUID is wrapped in double quotes so the server parses it as text.
2. **The Content-Type Header:** The `Content-Type: application/json` header informs the server that the request body contains JSON.
3. **Property Names:** The key name (`"userId"`) must match what the API expects. If the server expects `"id"`, mismatched keys cause validation errors.
4. **Server Processing:** When the server receives the payload, it parses the JSON string into a native language type.
5. **Validation Checks:** Sending a valid JSON body does not guarantee acceptance; the API verifies that the string has valid UUID syntax.

Depending on API design, a UUID might instead be passed in the URL path (`GET /api/users/{userId}`), in query parameters (`GET /api/orders?userId=...`), or in request headers (`X-Request-Id`).

---

## How to Pass a UUID in JSON Using JavaScript

In JavaScript environments, transmitting a **UUID in JavaScript JSON** is straightforward using native methods.

### 1. Serializing with `JSON.stringify()`

To convert a JavaScript object containing a UUID into valid JSON text, use `JSON.stringify()`:

```javascript
const userId = "550e8400-e29b-41d4-a716-446655440000";

const data = {
  userId: userId
};

const json = JSON.stringify(data);

console.log(json);
// Output: {"userId":"550e8400-e29b-41d4-a716-446655440000"}
```

`JSON.stringify()` converts the object into a JSON string and preserves the double quotation marks around the UUID value.

### 2. Practical `fetch()` Example

Here is how to pass a UUID in an API request using the browser's `fetch()` API:

```javascript
const userId = "550e8400-e29b-41d4-a716-446655440000";

fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    userId: userId
  })
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

This code sets the HTTP method, sends the `Content-Type: application/json` header, converts the object to a JSON string using `JSON.stringify()`, and handles the response.

---

## How to Pass a UUID in JSON Using Python

In Python, serializing UUIDs requires attention to data types. Python's `uuid` module produces `uuid.UUID` objects, but Python's standard `json` module only serializes native types like strings, integers, and dictionaries.

### The Serialization Issue

Passing a raw `uuid.UUID` object directly into `json.dumps()` causes an error:

```python
import json
import uuid

user_id = uuid.uuid4()
# TypeError: Object of type UUID is not JSON serializable
json.dumps({"userId": user_id})
```

### The Solution: Convert to String

Convert the UUID to a string before serializing:

```python
import json
import uuid

user_id = uuid.UUID("550e8400-e29b-41d4-a716-446655440000")

data = {
    "userId": str(user_id)
}

json_data = json.dumps(data)

print(json_data)
# Output: {"userId": "550e8400-e29b-41d4-a716-446655440000"}
```

Converting the object with `str()` ensures the value becomes a standard Python string, which `json.dumps()` serializes cleanly. Alternatively, pass `default=str` to `json.dumps(data, default=str)` to handle nested UUID objects automatically.

---

## How to Validate a UUID in JSON

Validating UUID data in JSON involves two independent checks:
1. **JSON Syntax Check:** Is the overall payload valid, well-formed JSON?
2. **UUID Format Check:** Does the specific property contain a valid 36-character UUID string?

### Validating the Value in JavaScript

Once the JSON is parsed into an object, validate the identifier value using a regular expression:

```javascript
function isValidUUID(value) {
  if (typeof value !== "string") {
    return false;
  }
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isNil = value === "00000000-0000-0000-0000-000000000000";
  return isNil || pattern.test(value);
}

const payload = JSON.parse('{"userId": "550e8400-e29b-41d4-a716-446655440000"}');

if (isValidUUID(payload.userId)) {
  console.log("Valid UUID string format");
} else {
  console.log("Invalid UUID format");
}
```

Regular expressions verify character patterns, but they cannot verify whether an ID exists in your database. Avoid regexes that only check for version 4 if your application also handles UUID v7 or v5. Using dedicated parsing libraries or schema validators like Zod or Pydantic provides stronger safety.

You can verify identifiers and detect their version using our free [UUID / GUID Validator](/uuid-validator/) and [UUID Version Detector](/uuid-version-detector/).

---

## Common UUID-in-JSON Mistakes and How to Fix Them

Formatting mistakes can cause request rejections and syntax errors:

| Common Mistake | Why It Fails | Practical Fix |
| :--- | :--- | :--- |
| **Missing double quotes** (`{"id": 550e...}`) | Unquoted tokens violate JSON syntax. | Wrap the UUID in double quotes: `{"id": "550e8400-e29b-41d4-a716-446655440000"}`. |
| **Using single quotes** (`{'id': '550e...'}`) | JSON requires double quotation marks for all keys and strings. | Replace single quotes with standard double quotes (`"`). |
| **Incomplete UUID string** | Truncated strings fail 36-character validation checks. | Verify all 32 hex digits and 4 hyphens are present. |
| **Wrong property name** | Sending `id` when the API expects `userId` causes validation failure. | Review API documentation and match key names precisely. |
| **Sending raw JS object** | Passing `{ userId }` directly to `fetch()` body sends `[object Object]`. | Convert objects to text with `JSON.stringify()`. |
| **Missing Content-Type header** | The server may not invoke its JSON body parser without this header. | Include `"Content-Type": "application/json"` in request headers. |
| **Unserialized Python object** | Python's `json.dumps()` cannot serialize raw `uuid.UUID` objects. | Wrap with `str(user_id)` or pass `default=str` to `json.dumps()`. |
| **Sending null or empty string** | Required non-nullable database columns will reject empty inputs. | Ensure an identifier is assigned before building the payload. |

* **JSON Parsing Errors:** Syntax issues (like missing quotes) return HTTP `400 Bad Request`.
* **UUID Validation Errors:** The JSON parses, but the value is an **invalid UUID format**, returning HTTP `422 Unprocessable Entity`.
* **Business Logic Errors:** The UUID is formatted correctly, but the record is not found in the database, returning HTTP `404 Not Found`.

---

## Can a UUID Be a JSON Number?

A standard textual UUID should **never** be treated as a JSON number:

1. **Character Constraints:** A canonical UUID contains hexadecimal letters (`a–f`) and hyphens (`-`). In JSON, numbers can only contain decimal digits (`0–9`), a decimal point, and an optional minus sign. Tokens like `550e8400-...` trigger immediate syntax errors.
2. **Numeric Precision Limits:** While a 128-bit UUID can mathematically be converted into an integer, JSON numbers follow IEEE 754 floating-point rules. In JavaScript and JSON, the maximum safe integer is $2^{53} - 1$ (`9,007,199,254,740,991`). A 128-bit integer reaches up to $3.4 \times 10^{38}$. Sending a 128-bit number unquoted causes precision loss, permanently corrupting the identifier.

For API communication, always transmit the UUID as a string.

---

## How to Pass a UUID in a JSON API Response

APIs commonly return UUIDs in JSON response bodies to provide identifiers for created or retrieved resources:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alex"
  }
}
```

When client applications receive this response, they parse the JSON and use the identifier in subsequent API requests:

```javascript
fetch("/api/users/me")
  .then(res => res.json())
  .then(response => {
    if (response.success) {
      const userId = response.data.id;
      return fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
    }
  })
  .then(res => res?.json())
  .then(orders => console.log("Orders:", orders))
  .catch(err => console.error("Error:", err));
```

The response layout depends on API architecture, but the UUID value is consistently formatted as a string.

---

## Frequently Asked Questions

### 1. Can you pass a UUID as a string in JSON?
Yes. Passing a UUID as a string enclosed in double quotes is the universal standard across modern web applications and databases.

### 2. Should a UUID have quotes in JSON?
Yes. Because UUIDs contain hyphens and letters, JSON requires them to be enclosed in double quotation marks (`"..."`).

### 3. Is a UUID a valid JSON data type?
No. JSON has no native UUID type; it defines only strings, numbers, booleans, null, objects, and arrays. UUIDs use the JSON string type.

### 4. Can a UUID contain uppercase letters?
RFC 9562 specifies that UUIDs are case-insensitive. However, lowercase (`a–f`) is canonical and prevents issues with strict backend validators.

### 5. Are hyphens required in a UUID?
The standard format requires 4 hyphens in the 8-4-4-4-12 pattern. While some backend systems accept 32-character strings, standard APIs expect hyphens.

### 6. Why does my API reject a UUID even though the JSON is valid?
Your JSON may be syntactically valid while the string value fails UUID validation due to trailing spaces, missing hyphens, or a record not in the database.

### 7. How do I pass a UUID in a JavaScript fetch request?
Place the UUID string inside an object property, serialize with `JSON.stringify()`, and assign to `body` with `"Content-Type": "application/json"`.

### 8. How do I convert a UUID object into JSON in Python?
Convert the `uuid.UUID` object to a string with `str(user_id)` before calling `json.dumps()`, or supply `default=str` to `json.dumps()`.

### 9. Can I send multiple UUIDs in a JSON array?
Yes. Enclose each UUID in double quotation marks and separate them with commas inside array brackets: `["550e8400-...", "6ba7b810-..."]`.

### 10. How can I check whether a UUID is valid?
You can validate a UUID using standard regular expressions, language-specific parsing libraries, or our free [UUID / GUID Validator](/uuid-validator/).

---

## Conclusion

Passing a UUID in JSON follows one essential principle: **represent the UUID as a string enclosed in double quotation marks.**

To avoid errors when working with JSON UUID payloads:
* Enclose the 36-character identifier in double quotes.
* Always include the `Content-Type: application/json` header in API requests.
* Use `JSON.stringify()` in JavaScript before transmitting data.
* Convert `uuid.UUID` objects to strings in Python before calling `json.dumps()`.
* Verify that your property names match the expected API schema.

To test, analyze, and inspect your identifiers, explore our developer tools on FastUUIDGenerator.com:
* [UUID / GUID Validator](/uuid-validator/) — Validate syntax, inspect version bits, and check RFC compliance.
* [UUID Generator](/uuid-generator/) — Create cryptographically secure UUID v4 and time-ordered UUID v7 identifiers.
* [UUID Version Detector](/uuid-version-detector/) — Identify the version and variant of any UUID string.
