<!-- Powered by BMAD-CORE™ -->

# RVTM: Update Story Status and Test Results

```xml
<task id="bmad/core/tasks/rvtm/update-story-status.md" name="Update Story Status">
  <objective>Update story completion status and test results in RVTM matrix</objective>

  <inputs critical="true">
    <input name="story_file" type="path" required="false" description="Path to story file" />
    <input name="epic_num" type="number" required="true" description="Epic number" />
    <input name="story_num" type="number" required="true" description="Story number" />
    <input name="status" type="string" required="false" description="New story status" />
    <input name="test_output" type="string" required="false" description="Test runner output text" />
    <input name="project_root" type="path" default="." description="Project root directory" />
  </inputs>

  <outputs>
    <output name="story_id" type="string" />
    <output name="story_status" type="string" />
    <output name="tests_updated" type="number" />
    <output name="requirements_verified" type="array" />
  </outputs>

  <flow>

    <step n="1" goal="Validate RVTM is initialized">
      <action>Check if file exists: {{project_root}}/.rvtm/matrix.yaml</action>
      <check>If not exists → HALT with message: "RVTM not initialized. Run *init-rvtm first."</check>
      <check>If .rvtm/config.yaml exists → Load config and check if auto_update is true</check>
      <check>If auto_update is false → HALT with message: "RVTM auto-update disabled in config"</check>
    </step>

    <step n="2" goal="Load RVTM matrix">
      <action>Load YAML file: {{project_root}}/.rvtm/matrix.yaml</action>
      <action>Parse YAML into {{matrix}} object</action>

      <action>Generate story ID: STORY-{{epic_num}}-{{story_num}}</action>
      <action>Store as {{story_id}}</action>

      <action>Check if {{matrix}}.stories[{{story_id}}] exists</action>
      <check>If not exists → HALT with message: "Story {{story_id}} not found in RVTM"</check>
    </step>

    <step n="3" goal="Update story status if provided">
      <check>If {{status}} not provided → Skip this step</check>

      <action>Map status to RVTM format:</action>
      <action>  - "planned" → status: planned</action>
      <action>  - "in-progress" or "in progress" → status: in_progress</action>
      <action>  - "ready for review" → status: completed</action>
      <action>  - "completed" or "done" → status: completed</action>
      <action>  - "approved" → status: completed</action>
      <action>  - Other → Use as-is (lowercase, spaces to underscores)</action>

      <action>Update {{matrix}}.stories[{{story_id}}].implementation_status = mapped status</action>
      <action>Update {{matrix}}.stories[{{story_id}}].modified_date = current ISO timestamp</action>

      <check>If {{story_file}} provided and exists:</check>
      <check>  - Read {{story_file}} content</check>
      <check>  - Extract Dev Agent Record → Completion Notes section</check>
      <check>  - Store first 500 chars as completion_notes in story object</check>
    </step>

    <step n="4" goal="Parse test results if provided">
      <check>If {{test_output}} not provided → Skip to step 7</check>

      <action>Parse {{test_output}} to extract test results</action>
      <action>Initialize {{parsed_tests}} as empty array</action>

      <substep n="4a" title="Try Jest/Mocha format">
        <pattern>(?:✓|✗|×)\s+(.+?)\s+\((\d+)\s*ms\)</pattern>
        <action>Search {{test_output}} for pattern matches</action>
        <action>For each match:</action>
        <action>  - Test name: capture group 1</action>
        <action>  - Status: ✓ → passed, ✗/× → failed</action>
        <action>  - Duration: capture group 2 (milliseconds)</action>
        <action>  - Add to {{parsed_tests}}</action>
      </substep>

      <substep n="4b" title="Try pytest format" if="{{parsed_tests}} is empty">
        <pattern>(\w+\.py)::\s*(\w+)\s+(PASSED|FAILED)</pattern>
        <action>Search {{test_output}} for pattern matches</action>
        <action>For each match:</action>
        <action>  - Test name: capture group 1 + "::" + capture group 2</action>
        <action>  - Status: PASSED → passed, FAILED → failed</action>
        <action>  - Add to {{parsed_tests}}</action>
      </substep>

      <substep n="4c" title="Try generic format" if="{{parsed_tests}} is empty">
        <action>Look for lines with: pass, fail, ok, error keywords</action>
        <action>Extract test identifiers and pass/fail status best-effort</action>
        <action>Add to {{parsed_tests}}</action>
      </substep>

      <check>If {{parsed_tests}} is empty:</check>
      <check>  - Log warning: "Could not parse test results from output"</check>
      <check>  - Skip to step 7</check>
    </step>

    <step n="5" goal="Match parsed tests to RVTM tests">
      <action>Get all test IDs linked to {{story_id}} from {{matrix}}.links</action>
      <action>Filter links where: from_type = "test" and to_id includes story or story's requirements</action>
      <action>Store test IDs in {{story_tests}}</action>

      <action>Initialize {{matched_tests}} as empty array</action>

      <action>For each parsed test in {{parsed_tests}}:</action>
      <action>  1. Try exact name match:</action>
      <action>     - For each test ID in {{story_tests}}</action>
      <action>     - Get test object from {{matrix}}.tests[test ID]</action>
      <action>     - If test.name equals parsed test name → Match found</action>

      <action>  2. If no exact match, try fuzzy match:</action>
      <action>     - Normalize both names: lowercase, remove non-alphanumeric</action>
      <action>     - If normalized names match or one contains the other → Match found</action>

      <action>  3. If match found:</action>
      <action>     - Add to {{matched_tests}} with:</action>
      <action>       * test_id: matched RVTM test ID</action>
      <action>       * status: parsed test status</action>
      <action>       * duration: parsed duration (if available)</action>
      <action>       * error: parsed error message (if available)</action>

      <action>  4. If no match found:</action>
      <action>     - Log info: "Test '{{name}}' not found in RVTM"</action>
      <action>     - Skip this test</action>
    </step>

    <step n="6" goal="Update test results in RVTM">
      <action>For each matched test in {{matched_tests}}:</action>
      <action>  1. Update {{matrix}}.tests[test_id]:</action>
      <action>     - status: matched test status (passed/failed)</action>
      <action>     - last_run: current ISO timestamp</action>
      <action>     - duration: matched test duration (if available)</action>
      <action>     - error_message: matched error (if status is failed)</action>
      <action>     - modified_date: current ISO timestamp</action>

      <action>  2. Clear error_message if status is passed</action>
    </step>

    <step n="7" goal="Check for requirement verification">
      <action>Get requirements linked to {{story_id}}</action>
      <action>From {{matrix}}.stories[{{story_id}}].requirements array</action>
      <action>Store in {{story_requirements}}</action>

      <action>Initialize {{verified_requirements}} as empty array</action>

      <action>For each requirement ID in {{story_requirements}}:</action>
      <action>  1. Find all tests that verify this requirement:</action>
      <action>     - Filter {{matrix}}.links where:</action>
      <action>       * from_type = "test"</action>
      <action>       * to_id = requirement ID</action>
      <action>       * link_type = "verifies"</action>
      <action>     - Get test IDs from filtered links</action>

      <action>  2. Check if ALL tests for this requirement passed:</action>
      <action>     - For each test ID:</action>
      <action>       * Get test object from {{matrix}}.tests</action>
      <action>       * Check if test.status = "passed"</action>
      <action>     - If ALL tests passed AND at least one test exists:</action>
      <action>       * Requirement is VERIFIED</action>

      <action>  3. If requirement verified:</action>
      <action>     - Update {{matrix}}.requirements[requirement ID].status = "verified"</action>
      <action>     - Update {{matrix}}.requirements[requirement ID].verified_date = current ISO timestamp</action>
      <action>     - Add requirement ID to {{verified_requirements}}</action>

      <action>  4. If requirement NOT verified (some tests failed or no tests):</action>
      <action>     - Keep status as-is (don't downgrade if already verified)</action>
    </step>

    <step n="8" goal="Update matrix and save">
      <action>Update {{matrix}}.lastModified = current ISO timestamp</action>
      <action>Write {{matrix}} back to {{project_root}}/.rvtm/matrix.yaml as formatted YAML</action>
    </step>

    <step n="9" goal="Log change to audit trail">
      <action>Prepare log entry with:</action>
      <action>  - timestamp: current ISO timestamp</action>
      <action>  - operation: "Update Story Status"</action>
      <action>  - story_id: {{story_id}}</action>
      <action>  - new_status: updated status (if changed)</action>
      <action>  - tests_updated: count of {{matched_tests}}</action>
      <action>  - requirements_verified: {{verified_requirements}}</action>

      <action>Append log entry to {{project_root}}/.rvtm/history/changes.log</action>
      <action>Format: [timestamp] Update Story {{story_id}}: Status={{status}}, Tests={{count}}, Verified={{req_count}}</action>
    </step>

    <step n="10" goal="Report results">
      <action>Set {{story_id}} = story ID</action>
      <action>Set {{story_status}} = current story status</action>
      <action>Set {{tests_updated}} = count of {{matched_tests}}</action>
      <action>Set {{requirements_verified}} = {{verified_requirements}} array</action>

      <action>Display to user:</action>

      <check>If {{status}} was provided:</check>
      <check>  - Display: "✓ RVTM: Story {{story_id}} marked as {{story_status}}"</check>

      <check>If {{test_output}} was provided:</check>
      <check>  - Display: "✓ RVTM: Updated test results"</check>
      <check>  - Display: "  - {{tests_updated}} tests updated"</check>
      <check>  - Count passed: count where status = passed</check>
      <check>  - Count failed: count where status = failed</check>
      <check>  - Display: "  - {{passed_count}} passed, {{failed_count}} failed"</check>

      <check>If {{verified_requirements}} not empty:</check>
      <check>  - Display: "✓ RVTM: Requirements verified"</check>
      <check>  - For each requirement in {{verified_requirements}}:</check>
      <check>    * Display: "  - {{req_id}} status: verified ✅"</check>
    </step>

  </flow>

  <error-handling>
    <on-error step="1">Display warning and skip RVTM update (non-blocking)</on-error>
    <on-error step="2">Display warning - story not in RVTM yet</on-error>
    <on-error step="8">Display warning and skip RVTM update (non-blocking)</on-error>
  </error-handling>

  <examples>
    <example name="Update Story Status">
      <input>
        story_id: STORY-1-1
        status: "Ready for Review"
      </input>
      <output>
        ✓ RVTM: Story STORY-1-1 marked as completed
      </output>
    </example>

    <example name="Update Test Results">
      <input>
        epic_num: 1
        story_num: 1
        test_output:
        "✓ should display email field (45ms)
         ✓ should validate email format (32ms)
         ✗ should show error message (28ms)"
      </input>
      <output>
        ✓ RVTM: Updated test results
          - 3 tests updated
          - 2 passed, 1 failed
      </output>
    </example>

    <example name="Requirements Verified">
      <input>
        epic_num: 1
        story_num: 1
        test_output: "All 5 tests passed"
      </input>
      <output>
        ✓ RVTM: Updated test results
          - 5 tests updated
          - 5 passed, 0 failed
        ✓ RVTM: Requirements verified
          - REQ-001 status: verified ✅
          - FR-001 status: verified ✅
          - NFR-003 status: verified ✅
      </output>
    </example>

    <example name="Combined Update">
      <input>
        story_file: stories/story-1.1.md
        epic_num: 1
        story_num: 1
        status: "completed"
        test_output: "11/11 tests passed"
      </input>
      <output>
        ✓ RVTM: Story STORY-1-1 marked as completed
        ✓ RVTM: Updated test results
          - 11 tests updated
          - 11 passed, 0 failed
        ✓ RVTM: Requirements verified
          - REQ-001 status: verified ✅
          - FR-001 status: verified ✅
          - NFR-003 status: verified ✅
      </output>
    </example>
  </examples>

</task>
```