# Generate API Documentation - Workflow Instructions

```xml
<critical>The workflow execution engine is governed by: {project_root}/bmad/core/tasks/workflow.md</critical>
<critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
<critical>This workflow generates comprehensive API documentation using pure MD/YAML approach.</critical>

<workflow>

  <step n="1" goal="Analyze project and detect API framework">
    <action>Analyze project structure:

<invoke-task path="bmad/core/tasks/tech-writer/analyze-codebase.md">
  <param name="project_root">{{project_root}}</param>
  <param name="output_format">yaml</param>
  <param name="analysis_depth">deep</param>
</invoke-task>

Store results in {{project_analysis}}
</action>

    <validation>
Verify this is an API project:
- Project type should be: rest-api, graphql-api, or web-framework
- Framework detected (Express, Flask, FastAPI, Spring Boot, etc.)
</validation>

    <check>If not an API project → Warn user and ask to confirm continuation</check>
  </step>

  <step n="2" goal="Extract API endpoints">
    <action>Discover all API endpoints:

<invoke-task path="bmad/core/tasks/tech-writer/extract-api-endpoints.md">
  <param name="project_root">{{project_root}}</param>
  <param name="primary_language">{{project_analysis.primary_language}}</param>
  <param name="framework">{{project_analysis.framework}}</param>
</invoke-task>

Store results in {{api_endpoints}}
</action>

    <output>
✓ Discovered {{api_endpoints.endpoint_count}} API endpoints
{{#if api_endpoints.has_openapi_spec}}
  • Found OpenAPI specification
{{else}}
  • Extracted from source code
{{/if}}
</output>

    <check>If {{api_endpoints.endpoint_count}} == 0 → Ask user if endpoints exist</check>
  </step>

  <step n="3" goal="Elicit API metadata">
    <action>Gather API-specific information from user:</action>

    <action>Ask user:</action>
    <action>```</action>
    <action>I'm generating API documentation for {{project_analysis.project_name}}.</action>
    <action>Found {{api_endpoints.endpoint_count}} endpoints using {{project_analysis.framework}}.</action>
    <action></action>
    <action>Please provide (press Enter to use defaults):</action>
    <action>1. API Base URL: [http://localhost:PORT]</action>
    <action>2. API Version: [1.0.0]</action>
    <action>3. Authentication method: [None/JWT/OAuth2/API Key]</action>
    <action>4. Rate limit info: [None]</action>
    <action>```</action>

    <action>Store responses in {{api_metadata}}</action>
  </step>

  <step n="4" goal="Generate API Overview section">
    <action>Create API overview including:</action>
    <action>  - API purpose and description</action>
    <action>  - Base URL</action>
    <action>  - Version information</action>
    <action>  - Supported formats (JSON, XML, etc.)</action>
    <action>  - Protocol (REST, GraphQL, gRPC)</action>

    <action>Format as markdown:</action>
    <action>```markdown</action>
    <action>## API Overview</action>
    <action></action>
    <action>{{project_name}} provides a {{framework}} RESTful API for [purpose].</action>
    <action></action>
    <action>**Base URL:** `{{api_metadata.base_url}}`</action>
    <action>**Version:** `{{api_metadata.version}}`</action>
    <action>**Format:** JSON</action>
    <action>```</action>

    <action>Store in {{section_overview}}</action>
  </step>

  <step n="5" goal="Generate Authentication section">
    <action>Document authentication method based on {{api_metadata.auth_method}}</action>

    <action>For JWT authentication:</action>
    <action>```markdown</action>
    <action>## Authentication</action>
    <action></action>
    <action>This API uses JWT (JSON Web Token) authentication.</action>
    <action></action>
    <action>### Obtaining a Token</action>
    <action></action>
    <action>```bash</action>
    <action>POST /auth/login</action>
    <action>Content-Type: application/json</action>
    <action></action>
    <action>{</action>
    <action>  "email": "user@example.com",</action>
    <action>  "password": "your-password"</action>
    <action>}</action>
    <action>```</action>
    <action></action>
    <action>### Using the Token</action>
    <action></action>
    <action>Include the token in the Authorization header:</action>
    <action></action>
    <action>```bash</action>
    <action>Authorization: Bearer YOUR_JWT_TOKEN</action>
    <action>```</action>
    <action>```</action>

    <action>For other auth methods, generate appropriate documentation</action>
    <action>Store in {{section_authentication}}</action>

    <output>
✓ Generated Authentication section
</output>
  </step>

  <step n="6" goal="Generate Endpoints documentation">
    <action>Group endpoints by category/resource</action>

    <action>For each endpoint in {{api_endpoints}}:</action>
    <action>  Create endpoint documentation including:</action>
    <action>    - HTTP method and path</action>
    <action>    - Description</action>
    <action>    - Path parameters</action>
    <action>    - Query parameters</action>
    <action>    - Request body (if applicable)</action>
    <action>    - Response format</action>
    <action>    - Status codes</action>
    <action>    - Example request (curl)</action>
    <action>    - Example response</action>

    <action>Format for each endpoint:</action>
    <action>```markdown</action>
    <action>### {{method}} {{path}}</action>
    <action></action>
    <action>{{description}}</action>
    <action></action>
    <action>**Parameters:**</action>
    <action></action>
    <action>| Name | Type | In | Required | Description |</action>
    <action>|------|------|-----|----------|-------------|</action>
    <action>| {{param_name}} | {{type}} | {{location}} | {{required}} | {{desc}} |</action>
    <action></action>
    <action>**Request Body:**</action>
    <action></action>
    <action>```json</action>
    <action>{</action>
    <action>  "key": "value"</action>
    <action>}</action>
    <action>```</action>
    <action></action>
    <action>**Response:**</action>
    <action></action>
    <action>```json</action>
    <action>{</action>
    <action>  "success": true,</action>
    <action>  "data": {...}</action>
    <action>}</action>
    <action>```</action>
    <action></action>
    <action>**Example:**</action>
    <action></action>
    <action>```bash</action>
    <action>curl -X {{method}} \</action>
    <action>  {{base_url}}{{path}} \</action>
    <action>  -H "Authorization: Bearer TOKEN" \</action>
    <action>  -H "Content-Type: application/json"</action>
    <action>```</action>
    <action>```</action>

    <action>Group all endpoint documentation</action>
    <action>Store in {{section_endpoints}}</action>

    <output>
✓ Generated documentation for {{api_endpoints.endpoint_count}} endpoints
</output>
  </step>

  <step n="7" goal="Generate Error Codes section">
    <action>Document common HTTP status codes and error responses:</action>

    <action>```markdown</action>
    <action>## Error Codes</action>
    <action></action>
    <action>The API uses standard HTTP status codes:</action>
    <action></action>
    <action>| Code | Status | Description |</action>
    <action>|------|--------|-------------|</action>
    <action>| 200 | OK | Request succeeded |</action>
    <action>| 201 | Created | Resource created successfully |</action>
    <action>| 400 | Bad Request | Invalid request parameters |</action>
    <action>| 401 | Unauthorized | Authentication required |</action>
    <action>| 403 | Forbidden | Insufficient permissions |</action>
    <action>| 404 | Not Found | Resource not found |</action>
    <action>| 429 | Too Many Requests | Rate limit exceeded |</action>
    <action>| 500 | Internal Server Error | Server error |</action>
    <action></action>
    <action>### Error Response Format</action>
    <action></action>
    <action>```json</action>
    <action>{</action>
    <action>  "error": {</action>
    <action>    "code": "ERROR_CODE",</action>
    <action>    "message": "Human-readable error message",</action>
    <action>    "details": {...}</action>
    <action>  }</action>
    <action>}</action>
    <action>```</action>
    <action>```</action>

    <action>Store in {{section_errors}}</action>
  </step>

  <step n="8" goal="Generate Rate Limiting section (if applicable)">
    <check>If {{api_metadata.rate_limit}} is "None" or empty → Skip this section</check>

    <action>Document rate limiting policies:</action>
    <action>```markdown</action>
    <action>## Rate Limiting</action>
    <action></action>
    <action>{{rate_limit_info}}</action>
    <action></action>
    <action>Rate limit headers are included in responses:</action>
    <action></action>
    <action>```</action>
    <action>X-RateLimit-Limit: 1000</action>
    <action>X-RateLimit-Remaining: 999</action>
    <action>X-RateLimit-Reset: 1234567890</action>
    <action>```</action>
    <action>```</action>

    <action>Store in {{section_rate_limiting}}</action>

    <output>
✓ Generated Rate Limiting section
</output>
  </step>

  <step n="9" goal="Generate Code Examples section">
    <action>Create code examples in multiple languages:</action>
    <action>  - JavaScript/Node.js (axios or fetch)</action>
    <action>  - Python (requests)</action>
    <action>  - cURL</action>

    <action>Example format:</action>
    <action>```markdown</action>
    <action>## Code Examples</action>
    <action></action>
    <action>### JavaScript (Node.js)</action>
    <action></action>
    <action>```javascript</action>
    <action>const axios = require('axios');</action>
    <action></action>
    <action>const response = await axios.get('{{base_url}}/endpoint', {</action>
    <action>  headers: {</action>
    <action>    'Authorization': 'Bearer YOUR_TOKEN'</action>
    <action>  }</action>
    <action>});</action>
    <action></action>
    <action>console.log(response.data);</action>
    <action>```</action>
    <action></action>
    <action>### Python</action>
    <action></action>
    <action>```python</action>
    <action>import requests</action>
    <action></action>
    <action>headers = {'Authorization': 'Bearer YOUR_TOKEN'}</action>
    <action>response = requests.get('{{base_url}}/endpoint', headers=headers)</action>
    <action>print(response.json())</action>
    <action>```</action>
    <action>```</action>

    <action>Store in {{section_examples}}</action>

    <output>
✓ Generated code examples in 3 languages
</output>
  </step>

  <step n="10" goal="Generate API sequence diagram">
    <action>Create sequence diagram showing typical API interaction:

<invoke-task path="bmad/core/tasks/tech-writer/create-diagrams.md">
  <param name="diagram_type">sequence</param>
  <param name="project_root">{{project_root}}</param>
  <param name="focus">authentication and data flow</param>
</invoke-task>

Store in {{section_diagram}}
</action>

    <output>
✓ Generated API sequence diagram
</output>
  </step>

  <step n="11" goal="Assemble complete API documentation">
    <action>Combine all sections in order:</action>
    <action>  1. Title (# {{project_name}} API Documentation)</action>
    <action>  2. {{section_overview}}</action>
    <action>  3. {{section_authentication}}</action>
    <action>  4. {{section_endpoints}} (grouped by resource)</action>
    <action>  5. {{section_errors}}</action>
    <action>  6. {{section_rate_limiting}} (if exists)</action>
    <action>  7. {{section_examples}}</action>
    <action>  8. {{section_diagram}}</action>

    <action>Add table of contents at the beginning</action>
    <action>Format consistently</action>

    <action>Store complete documentation in {{api_docs_content}}</action>
  </step>

  <step n="12" goal="Validate API documentation">
    <action>Save temporary file for validation</action>
    <action>Validate generated documentation:

<invoke-task path="bmad/core/tasks/tech-writer/validate-documentation.md">
  <param name="doc_file">{{temp_api_docs_file}}</param>
  <param name="project_root">{{project_root}}</param>
  <param name="validation_level">standard</param>
  <param name="check_links">true</param>
</invoke-task>

Store validation results in {{validation_results}}
</action>

    <check>If {{validation_results.quality_score}} < 80 → Warn user about API docs quality</check>

    <output>
Validation Results:
  Quality Score: {{validation_results.quality_score}}/100
  Completeness: {{validation_results.completeness_percentage}}%
  Endpoints Documented: {{api_endpoints.endpoint_count}}
</output>
  </step>

  <step n="13" goal="Save API documentation">
    <action>Ask user: "Save API documentation to where?"</action>
    <action>  Options:</action>
    <action>    1. {{project_root}}/API.md</action>
    <action>    2. {{project_root}}/docs/API.md</action>
    <action>    3. Custom path</action>

    <action>Write {{api_docs_content}} to chosen location</action>

    <output>
✅ API Documentation saved to {{output_path}}
</output>
  </step>

  <step n="14" goal="Generate OpenAPI spec (optional)">
    <action>Ask user: "Generate OpenAPI 3.0 specification? (yes/no) [no]"</action>

    <check>If user says no → Skip to step 15</check>

    <action>Convert extracted endpoints to OpenAPI YAML format</action>
    <action>Include all discovered endpoints with schemas</action>
    <action>Save to {{project_root}}/openapi.yaml</action>

    <output>
✓ Generated OpenAPI specification: openapi.yaml
</output>
  </step>

  <step n="15" goal="Display completion summary">
    <output>
╔══════════════════════════════════════════════════════════════╗
║        API Documentation Generation Complete ✅              ║
╚══════════════════════════════════════════════════════════════╝

Project: {{project_name}}
Framework: {{project_analysis.framework}}
Language: {{project_analysis.primary_language}}

API Documentation:
  ✓ Overview & Base Information
  ✓ Authentication Guide
  ✓ {{api_endpoints.endpoint_count}} Endpoints Documented
  ✓ Error Codes & Handling
  {{#if section_rate_limiting}}✓ Rate Limiting{{/if}}
  ✓ Code Examples (3 languages)
  ✓ API Sequence Diagram

Statistics:
  Total Endpoints: {{api_endpoints.endpoint_count}}
  Total Words: {{total_word_count}}
  Code Examples: {{total_code_examples}}
  Quality Score: {{validation_results.quality_score}}/100

File Location: {{output_path}}
{{#if openapi_generated}}
OpenAPI Spec: {{project_root}}/openapi.yaml
{{/if}}

Next Steps:
  • Review and customize endpoint descriptions
  • Add more detailed request/response examples
  • Test all curl examples
  • Keep documentation updated with API changes
  {{#if not openapi_generated}}
  • Consider generating OpenAPI spec for tooling
  {{/if}}

🤖 Generated with BMAD Tech Writer
</output>
  </step>

</workflow>
```