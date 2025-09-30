<!-- Powered by BMAD-CORE™ -->

# RVTM: Extract Requirements from PRD

```xml
<task id="bmad/core/tasks/rvtm/extract-requirements.md" name="Extract Requirements">
  <objective>Extract requirements from PRD markdown file and register them in RVTM matrix</objective>

  <inputs critical="true">
    <input name="prd_file" type="path" required="true" description="Path to PRD markdown file" />
    <input name="project_root" type="path" default="." description="Project root directory" />
  </inputs>

  <outputs>
    <output name="requirements_extracted" type="number" />
    <output name="functional_count" type="number" />
    <output name="non_functional_count" type="number" />
  </outputs>

  <flow>

    <step n="1" goal="Validate RVTM is initialized">
      <action>Check if file exists: {{project_root}}/.rvtm/matrix.yaml</action>
      <check>If not exists → HALT with message: "RVTM not initialized. Run *init-rvtm first."</check>
      <check>If .rvtm/config.yaml exists → Load config and check if auto_update is true</check>
      <check>If auto_update is false → HALT with message: "RVTM auto-update disabled in config"</check>
    </step>

    <step n="2" goal="Read PRD content">
      <action>Read complete file: {{prd_file}}</action>
      <action>Store content in memory as {{prd_content}}</action>
      <check>If file not found → HALT with error message</check>
    </step>

    <step n="3" goal="Extract explicit requirement IDs">
      <info>Search for patterns: REQ-\d+, FR-\d+, NFR-\d+</info>

      <pattern name="requirement_id">
        Regex: \b(REQ-\d+|FR-\d+|NFR-\d+):?\s*(.+?)(?=\n|$)
        Capture Group 1: Requirement ID (e.g., REQ-001)
        Capture Group 2: Requirement text
      </pattern>

      <action>Search {{prd_content}} for all matches of requirement_id pattern</action>
      <action>For each match found:</action>
      <action>  1. Extract requirement ID (e.g., "REQ-001")</action>
      <action>  2. Extract requirement text (everything after ID and optional colon)</action>
      <action>  3. Determine type based on prefix:</action>
      <action>     - REQ-* → type: functional</action>
      <action>     - FR-* → type: functional</action>
      <action>     - NFR-* → type: non-functional</action>
      <action>  4. Find the section containing this requirement (scan backwards to nearest ## heading)</action>
      <action>  5. Store in {{extracted_requirements}} list with:</action>
      <action>     - id: requirement ID</action>
      <action>     - text: requirement text (trimmed)</action>
      <action>     - type: functional or non-functional</action>
      <action>     - source_section: containing section name</action>
      <action>     - source_document: basename of {{prd_file}}</action>
    </step>

    <step n="4" goal="Extract numbered requirements from Functional Requirements section">
      <action>Find section in {{prd_content}} with heading "## Functional Requirements"</action>
      <check>If section not found → Skip to step 5</check>

      <action>Extract content from "## Functional Requirements" until next ## heading</action>
      <action>Find all list items (lines starting with -, *, or digit.)</action>
      <action>For each list item that does NOT already have an ID (REQ-*, FR-*):</action>
      <action>  1. Generate ID as FR-001, FR-002, FR-003... (increment for each)</action>
      <action>  2. Extract text of the list item</action>
      <action>  3. Store in {{extracted_requirements}} list with:</action>
      <action>     - id: generated ID (e.g., FR-001)</action>
      <action>     - text: list item text</action>
      <action>     - type: functional</action>
      <action>     - source_section: "Functional Requirements"</action>
      <action>     - source_document: basename of {{prd_file}}</action>
    </step>

    <step n="5" goal="Extract numbered requirements from Non-Functional Requirements section">
      <action>Find section in {{prd_content}} with heading "## Non-Functional Requirements"</action>
      <check>If section not found → Skip to step 6</check>

      <action>Extract content from "## Non-Functional Requirements" until next ## heading</action>
      <action>Find all list items (lines starting with -, *, or digit.)</action>
      <action>For each list item that does NOT already have an ID (REQ-*, NFR-*):</action>
      <action>  1. Generate ID as NFR-001, NFR-002, NFR-003... (increment for each)</action>
      <action>  2. Extract text of the list item</action>
      <action>  3. Store in {{extracted_requirements}} list with:</action>
      <action>     - id: generated ID (e.g., NFR-001)</action>
      <action>     - text: list item text</action>
      <action>     - type: non-functional</action>
      <action>     - source_section: "Non-Functional Requirements"</action>
      <action>     - source_document: basename of {{prd_file}}</action>
    </step>

    <step n="6" goal="Update RVTM matrix">
      <action>Read YAML file: {{project_root}}/.rvtm/matrix.yaml</action>
      <action>Parse YAML into {{matrix}} object</action>

      <action>For each requirement in {{extracted_requirements}}:</action>
      <action>  1. Check if {{matrix}}.requirements already contains this requirement ID</action>
      <action>  2. If NOT exists:</action>
      <action>     - Add to {{matrix}}.requirements with key = requirement ID</action>
      <action>     - Set: id, text, type, source_document, source_section</action>
      <action>     - Set created_date: current ISO timestamp</action>
      <action>     - Set modified_date: current ISO timestamp</action>
      <action>     - Set status: 'draft'</action>
      <action>     - Set priority: 'medium' (default)</action>
      <action>     - Set tags: [] (empty array)</action>
      <action>  3. If EXISTS:</action>
      <action>     - Skip (don't overwrite existing requirements)</action>

      <action>Update {{matrix}}.lastModified to current ISO timestamp</action>
      <action>Write {{matrix}} back to {{project_root}}/.rvtm/matrix.yaml as formatted YAML</action>
    </step>

    <step n="7" goal="Log change to audit trail">
      <action>Prepare log entry with:</action>
      <action>  - timestamp: current ISO timestamp</action>
      <action>  - operation: "Extract Requirements from PRD"</action>
      <action>  - prd_file: {{prd_file}}</action>
      <action>  - requirements_added: count of new requirements added</action>
      <action>Append log entry to {{project_root}}/.rvtm/history/changes.log</action>
      <action>Format: [timestamp] Extract Requirements: Added N requirements from {{prd_file}}</action>
    </step>

    <step n="8" goal="Report results">
      <action>Count total requirements in {{extracted_requirements}}</action>
      <action>Count functional requirements (type = functional)</action>
      <action>Count non-functional requirements (type = non-functional)</action>

      <action>Set {{requirements_extracted}} = total count</action>
      <action>Set {{functional_count}} = functional count</action>
      <action>Set {{non_functional_count}} = non-functional count</action>

      <action>Display to user:</action>
      <action>✓ RVTM: Extracted {{requirements_extracted}} requirements from PRD</action>
      <action>  - {{functional_count}} functional requirements</action>
      <action>  - {{non_functional_count}} non-functional requirements</action>
    </step>

  </flow>

  <error-handling>
    <on-error step="1">Display warning and skip RVTM update (non-blocking)</on-error>
    <on-error step="2">HALT with error - cannot proceed without PRD</on-error>
    <on-error step="6">Display warning and skip RVTM update (non-blocking)</on-error>
  </error-handling>

  <examples>
    <example name="Explicit IDs">
      <input>
        PRD content:
        ## Functional Requirements
        - REQ-001: Users must be able to register with email
        - REQ-002: System must validate email format
      </input>
      <output>
        Extracts:
        - REQ-001 (functional)
        - REQ-002 (functional)
      </output>
    </example>

    <example name="Generated IDs">
      <input>
        PRD content:
        ## Functional Requirements
        - User registration capability
        - Email validation

        ## Non-Functional Requirements
        - Response time under 200ms
      </input>
      <output>
        Generates:
        - FR-001: User registration capability (functional)
        - FR-002: Email validation (functional)
        - NFR-001: Response time under 200ms (non-functional)
      </output>
    </example>

    <example name="Mixed Format">
      <input>
        PRD content:
        ## Functional Requirements
        - REQ-001: Explicit requirement with ID
        - Implicit requirement without ID
        - FR-001: Another explicit with FR prefix
      </input>
      <output>
        Extracts/Generates:
        - REQ-001 (keeps original)
        - FR-002: Implicit requirement without ID (generated, skips FR-001)
        - FR-001 (keeps original)
      </output>
    </example>
  </examples>

</task>
```