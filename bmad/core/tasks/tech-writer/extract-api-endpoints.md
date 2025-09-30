<!-- Powered by BMAD-CORE™ -->

# Tech Writer: Extract API Endpoints

```xml
<task id="bmad/core/tasks/tech-writer/extract-api-endpoints.md" name="Extract API Endpoints">
  <objective>Discover and document API endpoints from codebase</objective>

  <inputs critical="true">
    <input name="project_root" type="path" required="true" description="Path to project root directory" />
    <input name="primary_language" type="string" default="" description="Primary programming language" />
    <input name="framework" type="string" default="" description="Web framework (Express, Flask, FastAPI, etc.)" />
  </inputs>

  <outputs>
    <output name="endpoints" type="array" />
    <output name="endpoint_count" type="number" />
    <output name="has_openapi_spec" type="boolean" />
  </outputs>

  <flow>

    <step n="1" goal="Check for OpenAPI/Swagger specification">
      <action>Search for OpenAPI specification files:</action>
      <action>  - openapi.yaml, openapi.yml, openapi.json</action>
      <action>  - swagger.yaml, swagger.yml, swagger.json</action>
      <action>  - api-spec.yaml, api.yaml</action>

      <action>If found:</action>
      <action>  - Set {{has_openapi_spec}} = true</action>
      <action>  - Parse specification file</action>
      <action>  - Extract all paths and operations</action>
      <action>  - Jump to step 7 (skip code scanning)</action>

      <action>If not found:</action>
      <action>  - Set {{has_openapi_spec}} = false</action>
      <action>  - Continue to code scanning</action>
    </step>

    <step n="2" goal="Scan Express.js routes (if framework=Express)">
      <check>If {{framework}} != "Express" and {{primary_language}} != "JavaScript" → Skip to step 3</check>

      <action>Search for route definition patterns in .js, .ts files:</action>

      <action>Pattern 1: app.METHOD(path, handler)</action>
      <action>  Regex: (app|router)\.(get|post|put|patch|delete|all)\(['"`]([^'"`]+)['"`]</action>
      <action>  Example: app.get('/users/:id', getUserHandler)</action>

      <action>Pattern 2: Express Router</action>
      <action>  Look for Router() definitions and mounted paths</action>
      <action>  Track base paths from app.use('/base', router)</action>

      <action>For each match:</action>
      <action>  - Extract HTTP method (GET, POST, PUT, DELETE, etc.)</action>
      <action>  - Extract path pattern (including parameters like :id)</action>
      <action>  - Identify handler function name</action>
      <action>  - Store in {{endpoints}} array</action>
    </step>

    <step n="3" goal="Scan Flask routes (if framework=Flask)">
      <check>If {{framework}} != "Flask" and {{primary_language}} != "Python" → Skip to step 4</check>

      <action>Search for route decorators in .py files:</action>

      <action>Pattern 1: @app.route() decorator</action>
      <action>  Regex: @app\.route\(['"`]([^'"`]+)['"`](?:,\s*methods=\[([^\]]+)\])?\)</action>
      <action>  Example: @app.route('/users/<int:id>', methods=['GET', 'POST'])</action>

      <action>Pattern 2: Blueprint routes</action>
      <action>  Regex: @blueprint\.route\(['"`]([^'"`]+)['"`]</action>
      <action>  Track blueprint registration for base paths</action>

      <action>Pattern 3: Method-specific decorators</action>
      <action>  @app.get(), @app.post(), etc.</action>

      <action>For each match:</action>
      <action>  - Extract HTTP methods (default to GET if not specified)</action>
      <action>  - Extract path pattern (including parameters like <id>)</action>
      <action>  - Identify handler function name</action>
      <action>  - Store in {{endpoints}} array</action>
    </step>

    <step n="4" goal="Scan FastAPI routes (if framework=FastAPI)">
      <check>If {{framework}} != "FastAPI" and {{primary_language}} != "Python" → Skip to step 5</check>

      <action>Search for FastAPI route decorators in .py files:</action>

      <action>Pattern: @app.METHOD() or @router.METHOD()</action>
      <action>  Regex: @(app|router)\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]</action>
      <action>  Example: @app.get("/users/{user_id}")</action>

      <action>For each match:</action>
      <action>  - Extract HTTP method from decorator</action>
      <action>  - Extract path pattern (including path parameters {id})</action>
      <action>  - Identify async function name</action>
      <action>  - Look for response_model and status_code parameters</action>
      <action>  - Store in {{endpoints}} array</action>
    </step>

    <step n="5" goal="Scan Spring Boot endpoints (if Java)">
      <check>If {{primary_language}} != "Java" → Skip to step 6</check>

      <action>Search for Spring annotations in .java files:</action>

      <action>Controller annotations:</action>
      <action>  - @RestController + @RequestMapping</action>
      <action>  - @Controller + @RequestMapping</action>

      <action>Method annotations:</action>
      <action>  - @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping</action>
      <action>  - @RequestMapping with method parameter</action>

      <action>For each controller:</action>
      <action>  - Extract base path from @RequestMapping on class</action>
      <action>  - For each method with mapping annotation:</action>
      <action>    • Extract HTTP method</action>
      <action>    • Extract path (combine class and method paths)</action>
      <action>    • Identify method name</action>
      <action>    • Store in {{endpoints}} array</action>
    </step>

    <step n="6" goal="Scan generic patterns (other frameworks)">
      <action>Search for common HTTP routing patterns:</action>

      <action>Generic patterns to look for:</action>
      <action>  - HTTP method keywords: GET, POST, PUT, DELETE, PATCH</action>
      <action>  - Route/path keywords: route, path, endpoint</action>
      <action>  - URL patterns with parameters: /api/, /v1/, etc.</action>

      <action>Search in likely locations:</action>
      <action>  - routes/, controllers/, api/, handlers/ directories</action>
      <action>  - Files with "route", "controller", "api" in name</action>

      <action>Best-effort extraction:</action>
      <action>  - Look for string literals that look like URL paths</action>
      <action>  - Identify HTTP method references nearby</action>
      <action>  - Store potential endpoints in {{endpoints}} array</action>
      <action>  - Mark confidence as "low" for these</action>
    </step>

    <step n="7" goal="Enrich endpoint data">
      <action>For each endpoint in {{endpoints}}:</action>

      <action>1. Normalize path format:</action>
      <action>  - Ensure paths start with /</action>
      <action>  - Combine base paths and route paths</action>
      <action>  - Normalize parameter syntax (e.g., :id → {id})</action>

      <action>2. Extract parameters:</action>
      <action>  - Path parameters: {id}, :id, <id></action>
      <action>  - Query parameters (if documented in code)</action>
      <action>  - Store in endpoint.parameters array</action>

      <action>3. Categorize by path prefix:</action>
      <action>  - /api/v1/users → category: "Users API"</action>
      <action>  - /admin/ → category: "Admin"</action>
      <action>  - Group related endpoints</action>

      <action>4. Add endpoint structure:</action>
      <action>  {</action>
      <action>    method: "GET",</action>
      <action>    path: "/api/users/{id}",</action>
      <action>    handler: "getUserById",</action>
      <action>    parameters: [{name: "id", location: "path", type: "string"}],</action>
      <action>    category: "Users API",</action>
      <action>    file: "routes/users.js",</action>
      <action>    line: 42</action>
      <action>  }</action>
    </step>

    <step n="8" goal="Deduplicate and sort">
      <action>Remove duplicate endpoints (same method + path)</action>
      <action>Sort endpoints by:</action>
      <action>  1. Category (alphabetically)</action>
      <action>  2. Path (alphabetically)</action>
      <action>  3. HTTP method (GET, POST, PUT, PATCH, DELETE)</action>
    </step>

    <step n="9" goal="Calculate statistics">
      <action>Count total endpoints</action>
      <action>Store in {{endpoint_count}}</action>

      <action>Calculate breakdown by method:</action>
      <action>  - GET count</action>
      <action>  - POST count</action>
      <action>  - PUT/PATCH count</action>
      <action>  - DELETE count</action>
    </step>

    <step n="10" goal="Return results">
      <output>
API Endpoint Extraction Complete

{{#if has_openapi_spec}}
✓ Found OpenAPI specification
{{else}}
⚠ No OpenAPI spec found - extracted from code
{{/if}}

Discovered {{endpoint_count}} endpoints

Breakdown by method:
  GET: {{get_count}}
  POST: {{post_count}}
  PUT/PATCH: {{put_count}}
  DELETE: {{delete_count}}

{{#if categories}}
Categories:
{{#each categories}}
  - {{this}}: {{count}} endpoints
{{/each}}
{{/if}}
</output>
    </step>

  </flow>

  <error-handling>
    <on-error step="1-6">Log warning and continue with next extraction method</on-error>
    <on-error step="7-10">Log warning and return partial results</on-error>
  </error-handling>

  <examples>
    <example name="Express.js API">
      <input>
        project_root: /projects/my-api
        primary_language: JavaScript
        framework: Express
      </input>
      <output>
        endpoints: [
          {method: "GET", path: "/api/users", handler: "getUsers"},
          {method: "POST", path: "/api/users", handler: "createUser"},
          {method: "GET", path: "/api/users/:id", handler: "getUserById"}
        ]
        endpoint_count: 3
        has_openapi_spec: false
      </output>
    </example>

    <example name="FastAPI with OpenAPI">
      <input>
        project_root: /projects/fastapi-service
        primary_language: Python
        framework: FastAPI
      </input>
      <output>
        endpoints: [extracted from openapi.json]
        endpoint_count: 12
        has_openapi_spec: true
      </output>
    </example>
  </examples>

</task>
```