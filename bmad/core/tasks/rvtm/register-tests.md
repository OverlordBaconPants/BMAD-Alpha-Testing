<!-- Powered by BMAD-CORE™ -->

# RVTM: Register Tests with Requirements

```xml
<task id="bmad/core/tasks/rvtm/register-tests.md" name="Register Tests">
  <objective>Register test cases with requirement traceability in RVTM matrix</objective>

  <inputs critical="true">
    <input name="test_file" type="path" required="true" description="Path to test file" />
    <input name="story_file" type="path" required="false" description="Path to story file (for requirement inheritance)" />
    <input name="epic_num" type="number" required="false" description="Epic number" />
    <input name="story_num" type="number" required="false" description="Story number" />
    <input name="project_root" type="path" default="." description="Project root directory" />
  </inputs>

  <outputs>
    <output name="tests_registered" type="number" />
    <output name="test_ids" type="array" />
    <output name="requirements_linked" type="array" />
  </outputs>

  <flow>

    <step n="1" goal="Validate RVTM is initialized">
      <action>Check if file exists: {{project_root}}/.rvtm/matrix.yaml</action>
      <check>If not exists → HALT with message: "RVTM not initialized. Run *init-rvtm first."</check>
      <check>If .rvtm/config.yaml exists → Load config and check if auto_update is true</check>
      <check>If auto_update is false → HALT with message: "RVTM auto-update disabled in config"</check>
    </step>

    <step n="2" goal="Read and analyze test file">
      <action>Read complete file: {{test_file}}</action>
      <action>Store content in memory as {{test_content}}</action>
      <check>If file not found → HALT with error message</check>

      <action>Detect test framework from content patterns:</action>
      <action>  - If contains "describe(" and "it(" or "test(" → Framework: jest/mocha</action>
      <action>  - If contains "Feature:" and "Scenario:" → Framework: gherkin/cucumber</action>
      <action>  - If contains "def test_" or "@pytest" → Framework: pytest</action>
      <action>  - Otherwise → Framework: generic</action>
      <action>Store detected framework in {{test_framework}}</action>
    </step>

    <step n="3" goal="Extract test cases based on framework">

      <substep n="3a" title="Jest/Mocha Tests" if="{{test_framework}} == jest/mocha">
        <action>Find all describe() blocks for context</action>
        <pattern>describe\(['"`]([^'"`]+)['"`]</pattern>
        <action>Store describe block names in {{describe_contexts}}</action>

        <action>Find all it() or test() calls</action>
        <pattern>(?:it|test)\(['"`]([^'"`]+)['"`]</pattern>

        <action>For each test found:</action>
        <action>  1. Extract test name (capture group 1)</action>
        <action>  2. Build full name: {{describe_contexts}} + test name</action>
        <action>  3. Determine type from name:</action>
        <action>     - Contains "integration" or "integrates" → type: integration</action>
        <action>     - Contains "e2e", "end-to-end", "acceptance" → type: acceptance</action>
        <action>     - Contains "performance", "load" → type: performance</action>
        <action>     - Default → type: unit</action>
        <action>  4. Add to {{test_cases}} array</action>
      </substep>

      <substep n="3b" title="Gherkin/BDD Tests" if="{{test_framework}} == gherkin/cucumber">
        <action>Find all Scenario: or Scenario Outline: blocks</action>
        <pattern>Scenario(?:\s+Outline)?:\s*(.+?)(?=\n|$)</pattern>

        <action>For each scenario found:</action>
        <action>  1. Extract scenario name</action>
        <action>  2. Type is always: acceptance</action>
        <action>  3. Add to {{test_cases}} array</action>
      </substep>

      <substep n="3c" title="Pytest Tests" if="{{test_framework}} == pytest">
        <action>Find all test functions</action>
        <pattern>def\s+(test_\w+)</pattern>

        <action>For each test function found:</action>
        <action>  1. Extract function name</action>
        <action>  2. Convert snake_case to readable: test_user_login → "User login"</action>
        <action>  3. Type: unit (default)</action>
        <action>  4. Add to {{test_cases}} array</action>
      </substep>

      <substep n="3d" title="Generic Tests" if="{{test_framework}} == generic">
        <action>Search for common test patterns:</action>
        <action>  - function test[A-Z]\w+</action>
        <action>  - class Test\w+</action>
        <action>  - Lines containing "test" or "should"</action>
        <action>Extract best-guess test names and add to {{test_cases}}</action>
      </substep>

    </step>

    <step n="4" goal="Extract requirement references from test file">
      <pattern name="requirement_comment">
        Regex: (?://|#|\*)\s*(REQ-\d+|FR-\d+|NFR-\d+):?
        Matches comments with requirement IDs
      </pattern>

      <action>Search {{test_content}} for requirement ID patterns</action>
      <action>Store unique requirement IDs in {{test_requirements}}</action>
    </step>

    <step n="5" goal="Inherit requirements from story if provided">
      <check>If {{story_file}} not provided or not exists → Skip this step</check>

      <action>Read complete file: {{story_file}}</action>
      <action>Store content as {{story_content}}</action>

      <action>Search {{story_content}} for requirement ID patterns</action>
      <action>Add any found requirement IDs to {{test_requirements}} (unique)</action>

      <info>Tests inherit requirements from their story</info>
    </step>

    <step n="6" goal="Lookup story requirements from RVTM">
      <check>If {{epic_num}} and {{story_num}} not provided → Skip this step</check>

      <action>Load YAML file: {{project_root}}/.rvtm/matrix.yaml</action>
      <action>Parse YAML into {{matrix}} object</action>

      <action>Generate story ID: STORY-{{epic_num}}-{{story_num}}</action>
      <action>Check if {{matrix}}.stories contains this story ID</action>

      <check>If story exists in matrix:</check>
      <check>  - Get story.requirements array</check>
      <check>  - Add to {{test_requirements}} (unique)</check>
      <check>Else:</check>
      <check>  - Log info: "Story not yet in RVTM, using explicit requirements only"</check>
    </step>

    <step n="7" goal="Validate requirements exist in RVTM">
      <action>If {{matrix}} not already loaded → Load it now</action>

      <action>For each requirement ID in {{test_requirements}}:</action>
      <action>  1. Check if {{matrix}}.requirements contains this requirement ID</action>
      <action>  2. If NOT exists:</action>
      <action>     - Log warning: "Requirement {ID} not found in RVTM"</action>
      <action>     - Remove from {{test_requirements}}</action>
      <action>  3. If EXISTS:</action>
      <action>     - Keep in {{test_requirements}}</action>

      <check>If {{test_requirements}} is empty:</check>
      <check>  - Check config: If require_links is true → HALT with error</check>
      <check>  - If require_links is false → Continue with warning</check>
    </step>

    <step n="8" goal="Register test cases in RVTM">
      <action>Initialize {{registered_tests}} as empty array</action>

      <action>For each test case in {{test_cases}}:</action>
      <action>  1. Generate test ID:</action>
      <action>     - Base: filename without extension (e.g., "registration" from registration.test.js)</action>
      <action>     - Sanitize test name: remove non-alphanumeric, convert to uppercase</action>
      <action>     - Format: TEST-{base}-{sanitized-name}</action>
      <action>     - Example: TEST-REGISTRATION-SHOULD-DISPLAY-EMAIL-FIELD</action>
      <action>     - Limit to 80 characters total</action>

      <action>  2. Create test object:</action>
      <action>     - id: generated test ID</action>
      <action>     - name: original test name</action>
      <action>     - description: test name with context</action>
      <action>     - type: determined type (unit/integration/acceptance/performance)</action>
      <action>     - test_file: relative path from project root to {{test_file}}</action>
      <action>     - test_framework: {{test_framework}}</action>
      <action>     - story_id: STORY-{{epic_num}}-{{story_num}} (if provided)</action>
      <action>     - requirements: {{test_requirements}} array</action>
      <action>     - status: 'pending'</action>
      <action>     - created_date: current ISO timestamp</action>
      <action>     - modified_date: current ISO timestamp</action>

      <action>  3. Check if {{matrix}}.tests[test ID] already exists:</action>
      <action>     - If exists → Skip (don't overwrite existing test)</action>
      <action>     - If not exists → Add to {{matrix}}.tests</action>

      <action>  4. Add test ID to {{registered_tests}} array</action>
    </step>

    <step n="9" goal="Create traceability links">
      <action>For each test ID in {{registered_tests}}:</action>
      <action>  For each requirement ID in {{test_requirements}}:</action>
      <action>    1. Check if link already exists in {{matrix}}.links:</action>
      <action>       - from_type: test</action>
      <action>       - from_id: test ID</action>
      <action>       - to_type: requirement</action>
      <action>       - to_id: requirement ID</action>

      <action>    2. If link NOT exists:</action>
      <action>       - Generate unique link ID: LINK-{timestamp}-{random}</action>
      <action>       - Create link object:</action>
      <action>         * id: generated link ID</action>
      <action>         * from_type: "test"</action>
      <action>         * from_id: test ID</action>
      <action>         * to_type: "requirement"</action>
      <action>         * to_id: requirement ID</action>
      <action>         * link_type: "verifies"</action>
      <action>         * created_date: current ISO timestamp</action>
      <action>       - Add to {{matrix}}.links array</action>

      <action>    3. If link EXISTS → Skip</action>

      <info>Bidirectional traceability: Test → Requirement (verifies)</info>
    </step>

    <step n="10" goal="Update matrix and save">
      <action>Update {{matrix}}.lastModified to current ISO timestamp</action>
      <action>Write {{matrix}} back to {{project_root}}/.rvtm/matrix.yaml as formatted YAML</action>
    </step>

    <step n="11" goal="Log change to audit trail">
      <action>Prepare log entry with:</action>
      <action>  - timestamp: current ISO timestamp</action>
      <action>  - operation: "Register Tests"</action>
      <action>  - test_file: {{test_file}}</action>
      <action>  - tests_registered: count of {{registered_tests}}</action>
      <action>  - requirements_linked: {{test_requirements}}</action>

      <action>Append log entry to {{project_root}}/.rvtm/history/changes.log</action>
      <action>Format: [timestamp] Register Tests: Added N tests from {{test_file}}</action>
    </step>

    <step n="12" goal="Report results">
      <action>Set {{tests_registered}} = count of {{registered_tests}}</action>
      <action>Set {{test_ids}} = {{registered_tests}} array</action>
      <action>Set {{requirements_linked}} = {{test_requirements}} array</action>

      <action>Display to user:</action>
      <action>✓ ATDD tests created: {{test_file}}</action>
      <action>✓ RVTM: Registered {{tests_registered}} tests</action>
      <action>  - Linked to {{requirements_linked.length}} requirements</action>
      <action>  - Status: pending (tests not yet run)</action>
    </step>

  </flow>

  <error-handling>
    <on-error step="1">Display warning and skip RVTM update (non-blocking)</on-error>
    <on-error step="2">HALT with error - cannot proceed without test file</on-error>
    <on-error step="7">If require_links=true → HALT; If false → Continue with warning</on-error>
    <on-error step="10">Display warning and skip RVTM update (non-blocking)</on-error>
  </error-handling>

  <examples>
    <example name="Jest Tests with Comments">
      <input>
        Test file (registration.test.js):
        describe('User Registration', () => {
          // REQ-001: User authentication
          it('should display email input field', () => {});

          // FR-001: Registration form
          it('should validate email format', () => {});
        });
      </input>
      <output>
        Registers:
        - TEST-REGISTRATION-SHOULD-DISPLAY-EMAIL-INPUT-FIELD
          → REQ-001, FR-001 (verifies)
        - TEST-REGISTRATION-SHOULD-VALIDATE-EMAIL-FORMAT
          → REQ-001, FR-001 (verifies)
      </output>
    </example>

    <example name="Gherkin BDD Tests">
      <input>
        Test file (login.feature):
        Feature: User Login
          # REQ-002
          Scenario: Valid user credentials
            Given I am on the login page
            When I enter valid credentials
            Then I should be logged in
      </input>
      <output>
        Registers:
        - TEST-LOGIN-VALID-USER-CREDENTIALS
          → REQ-002 (verifies)
          Type: acceptance
      </output>
    </example>

    <example name="Tests Inherit from Story">
      <input>
        Test file: No explicit requirement comments
        Story file: Satisfies REQ-001, FR-001
      </input>
      <output>
        Tests inherit:
        - All tests linked to REQ-001, FR-001
      </output>
    </example>
  </examples>

</task>
```