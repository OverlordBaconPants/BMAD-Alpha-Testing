# {{project_name}} API Documentation

> **Version:** {{api_version}}
> **Base URL:** `{{base_url}}`
> **Format:** JSON

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Code Examples](#code-examples)

---

## Overview

{{project_description}}

### Base Information

- **Protocol:** REST
- **Data Format:** JSON
- **Authentication:** {{auth_method}}
- **Content-Type:** `application/json`

### Getting Started

To get started with the {{project_name}} API:

1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

---

## Authentication

{{auth_description}}

### {{auth_method}} Authentication

{{auth_details}}

**Example:**

```bash
# Authentication request
curl -X POST {{base_url}}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "your-password"}'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### Using Your Token

Include the token in all API requests:

```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Endpoints

### {{category_name}}

#### `{{method}} {{endpoint_path}}`

{{endpoint_description}}

**Parameters:**

| Name | Type | In | Required | Description |
|------|------|-----|----------|-------------|
| {{param_name}} | {{param_type}} | {{param_in}} | {{required}} | {{param_description}} |

**Request Body:**

```json
{{request_body_example}}
```

**Response:**

**Status:** `200 OK`

```json
{{response_example}}
```

**Example:**

```bash
curl -X {{method}} {{base_url}}{{endpoint_path}} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  {{#if has_body}}-d '{{request_body}}'{{/if}}
```

---

## Error Codes

The API uses standard HTTP status codes to indicate the success or failure of requests.

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request succeeded with no content to return |
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Authentication required or token invalid |
| 403 | Forbidden | Insufficient permissions for this resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate entry) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Response Format

All errors return a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context if applicable"
    }
  }
}
```

---

## Rate Limiting

{{rate_limit_description}}

**Rate Limits:**
- **Authenticated requests:** {{auth_rate_limit}}
- **Unauthenticated requests:** {{unauth_rate_limit}}

**Rate Limit Headers:**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1635724800
```

---

## Code Examples

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: '{{base_url}}',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});

// Example request
async function getResource(id) {
  try {
    const response = await client.get(`/resource/${id}`);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Python

```python
import requests

BASE_URL = '{{base_url}}'
TOKEN = 'YOUR_TOKEN'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# Example request
def get_resource(resource_id):
    response = requests.get(
        f'{BASE_URL}/resource/{resource_id}',
        headers=headers
    )

    if response.ok:
        return response.json()
    else:
        print(f'Error: {response.status_code}')
        print(response.json())
```

### cURL

```bash
# GET request
curl -X GET {{base_url}}/resource/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# POST request
curl -X POST {{base_url}}/resource \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Resource", "value": "data"}'
```

---

## Support

For questions or issues:

- **Documentation:** {{docs_url}}
- **GitHub Issues:** {{github_url}}/issues
- **Email:** {{support_email}}

---

*Generated with BMAD Tech Writer*