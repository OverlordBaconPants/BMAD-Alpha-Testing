<!-- Powered by BMAD-CORE™ -->

# RVTM: Link Story to Requirements

```xml
<task id="bmad/core/tasks/rvtm/link-story-requirements.md" name="Link Story Requirements">
  <objective>Link a story to the requirements it implements and update RVTM matrix</objective>

  <inputs critical="true">
    <input name="story_file" type="path" required="true" description="Path to story markdown file" />
    <input name="epic_num" type="number" required="true" description="Epic number" />
    <input name="story_num" type="number" required="true" description="Story number" />
    <input name="prd_file" type="path" required="false" description="Path to PRD (for requirement inference)" />
    <input name="project_root" type="path" default="." description="Project root directory" />
  </inputs>

  <outputs>
    <output name="story_id" type="string" />
    <output name="requirements_linked" type="number" />
    <output name="requirement_ids" type="array" />
  </outputs>

  <flow>

    <step n="1" goal="Validate RVTM is initialized">
      <action>Check if file exists: {{project_root}}/.rvtm/matrix.yaml</action>
      <check>If not exists → HALT with message: "RVTM not initialized. Run *init-rvtm first."</check>
      <check>If .rvtm/config.yaml exists → Load config and check if auto_update is true</check>
      <check>If auto_update is false → HALT with message: "RVTM auto-update disabled in config"</check>
    </step>

    <step n="2" goal="Read and parse story file">
      <action>Read complete file: {{story_file}}</action>
      <action>Store content in memory as {{story_content}}</action>
      <check>If file not found → HALT with error message</check>

      <action>Parse story metadata:</action>
      <action>  1. Extract title (first # heading or Story X.Y: Title pattern)</action>
      <action>  2. Extract story statement (## Story section content)</action>
      <action>  3. Extract acceptance criteria (## Acceptance Criteria section list items)</action>
      <action>  4. Extract status (## Status or **Status:** field)</action>

      <action>Store in {{story_data}} object:</action>
      <action>  - title: story title</action>
      <action>  - description: story statement</action>
      <action>  - acceptance_criteria: array of AC items</action>
      <action>  - status: story status or 'planned' as default</action>
    </step>

    <step n="3" goal="Extract explicit requirement references from story">
      <info>Look for requirement IDs mentioned anywhere in story</info>

      <pattern name="requirement_reference">
        Regex: \b(REQ-\d+|FR-\d+|NFR-\d+|UC-\d+)\b
        Matches: REQ-001, FR-123, NFR-045, UC-002
      </pattern>

      <action>Search {{story_content}} for all requirement ID patterns</action>
      <action>Common locations to check:</action>
      <action>  - Story header (Satisfies: REQ-001, REQ-002)</action>
      <action>  - Story statement section</action>
      <action>  - Acceptance criteria</action>
      <action>  - Dev notes</action>

      <action>For each match found:</action>
      <action>  1. Extract requirement ID</action>
      <action>  2. Add to {{referenced_requirements}} list (unique values only)</action>
    </step>

    <step n="4" goal="Infer requirements from PRD epic mapping" optional="true">
      <check>If {{referenced_requirements}} is not empty → Skip this step (already have explicit refs)</check>
      <check>If {{prd_file}} not provided or not exists → Skip this step</check>

      <action>Read complete file: {{prd_file}}</action>
      <action>Store content as {{prd_content}}</action>

      <action>Search for Epics section in {{prd_content}}</action>
      <action>Find subsection for Epic {{epic_num}} (look for "### Epic {{epic_num}}" or similar)</action>
      <check>If epic section not found → Skip this step</check>

      <action>Extract epic content from epic heading to next ### heading or end</action>
      <action>Search epic content for requirement ID patterns (REQ-*, FR-*, NFR-*)</action>
      <action>Add any found requirement IDs to {{referenced_requirements}}</action>

      <info>This provides fallback requirement linking when story doesn't have explicit refs</info>
    </step>

    <step n="5" goal="Validate requirements exist in RVTM">
      <action>Load YAML file: {{project_root}}/.rvtm/matrix.yaml</action>
      <action>Parse YAML into {{matrix}} object</action>

      <action>For each requirement ID in {{referenced_requirements}}:</action>
      <action>  1. Check if {{matrix}}.requirements contains this requirement ID</action>
      <action>  2. If NOT exists:</action>
      <action>     - Log warning: "Requirement {ID} not found in RVTM - may need to run extract-requirements"</action>
      <action>     - Remove from {{referenced_requirements}} list</action>
      <action>  3. If EXISTS:</action>
      <action>     - Keep in {{referenced_requirements}}</action>

      <check>If {{referenced_requirements}} is empty after validation:</check>
      <check>  - Log warning: "No valid requirements found for story"</check>
      <check>  - Check config: If require_links is true → HALT with error</check>
      <check>  - If require_links is false → Continue with warning</check>
    </step>

    <step n="6" goal="Create or update story in RVTM matrix">
      <action>Generate story ID: STORY-{{epic_num}}-{{story_num}}</action>
      <action>Store as {{story_id}}</action>

      <action>Create story object with:</action>
      <action>  - id: {{story_id}}</action>
      <action>  - title: {{story_data}}.title</action>
      <action>  - description: {{story_data}}.description (first 200 chars)</action>
      <action>  - epic_id: EPIC-{{epic_num}}</action>
      <action>  - story_number: {{story_num}}</action>
      <action>  - requirements: {{referenced_requirements}} (array of requirement IDs)</action>
      <action>  - acceptance_criteria: {{story_data}}.acceptance_criteria</action>
      <action>  - source_file: relative path from project root to {{story_file}}</action>
      <action>  - implementation_status: {{story_data}}.status or 'planned'</action>
      <action>  - created_date: current ISO timestamp</action>
      <action>  - modified_date: current ISO timestamp</action>

      <check>If {{matrix}}.stories[{{story_id}}] already exists:</check>
      <check>  - Update existing entry (keep created_date, update modified_date)</check>
      <check>Else:</check>
      <check>  - Add new entry to {{matrix}}.stories</check>
    </step>

    <step n="7" goal="Create traceability links">
      <action>For each requirement ID in {{referenced_requirements}}:</action>
      <action>  1. Check if link already exists in {{matrix}}.links:</action>
      <action>     - from_type: story</action>
      <action>     - from_id: {{story_id}}</action>
      <action>     - to_type: requirement</action>
      <action>     - to_id: requirement ID</action>
      <action>  2. If link NOT exists:</action>
      <action>     - Generate unique link ID: LINK-{timestamp}-{random}</action>
      <action>     - Create link object:</action>
      <action>       * id: generated link ID</action>
      <action>       * from_type: "story"</action>
      <action>       * from_id: {{story_id}}</action>
      <action>       * to_type: "requirement"</action>
      <action>       * to_id: requirement ID</action>
      <action>       * link_type: "implements"</action>
      <action>       * created_date: current ISO timestamp</action>
      <action>     - Add to {{matrix}}.links array</action>
      <action>  3. If link EXISTS:</action>
      <action>     - Skip (don't create duplicate)</action>

      <info>Bidirectional traceability: Story → Requirement (implements)</info>
    </step>

    <step n="8" goal="Update matrix and save">
      <action>Update {{matrix}}.lastModified to current ISO timestamp</action>
      <action>Write {{matrix}} back to {{project_root}}/.rvtm/matrix.yaml as formatted YAML</action>
      <action>Ensure proper indentation (2 spaces) and structure</action>
    </step>

    <step n="9" goal="Log change to audit trail">
      <action>Prepare log entry with:</action>
      <action>  - timestamp: current ISO timestamp</action>
      <action>  - operation: "Link Story to Requirements"</action>
      <action>  - story_id: {{story_id}}</action>
      <action>  - story_file: {{story_file}}</action>
      <action>  - requirements_linked: count of {{referenced_requirements}}</action>
      <action>  - requirement_ids: list of linked requirement IDs</action>

      <action>Append log entry to {{project_root}}/.rvtm/history/changes.log</action>
      <action>Format: [timestamp] Link Story {{story_id}}: Linked to N requirements (IDs: ...)</action>
    </step>

    <step n="10" goal="Report results">
      <action>Set {{story_id}} = generated story ID</action>
      <action>Set {{requirements_linked}} = count of {{referenced_requirements}}</action>
      <action>Set {{requirement_ids}} = {{referenced_requirements}} array</action>

      <action>Display to user:</action>
      <action>✓ Story created: {{story_file}}</action>
      <action>✓ RVTM: Linked {{story_id}} to {{requirements_linked}} requirements</action>
      <action>For each requirement in {{referenced_requirements}}:</action>
      <action>  - {{req_id}}: {{brief description from matrix}}</action>
    </step>

  </flow>

  <error-handling>
    <on-error step="1">Display warning and skip RVTM update (non-blocking)</on-error>
    <on-error step="2">HALT with error - cannot proceed without story file</on-error>
    <on-error step="5">If require_links=true → HALT; If false → Continue with warning</on-error>
    <on-error step="8">Display warning and skip RVTM update (non-blocking)</on-error>
  </error-handling>

  <examples>
    <example name="Explicit Requirements in Story">
      <input>
        Story content:
        # Story 1.1: User Registration

        Satisfies: REQ-001, FR-001, NFR-003

        ## Story
        As a new user, I want to register...
      </input>
      <output>
        Links:
        - STORY-1-1 → REQ-001 (implements)
        - STORY-1-1 → FR-001 (implements)
        - STORY-1-1 → NFR-003 (implements)
      </output>
    </example>

    <example name="Requirements in Acceptance Criteria">
      <input>
        Story content:
        # Story 1.1: User Registration

        ## Acceptance Criteria
        - [ ] REQ-001: Email registration working
        - [ ] FR-001: Form displays correctly
      </input>
      <output>
        Links:
        - STORY-1-1 → REQ-001 (implements)
        - STORY-1-1 → FR-001 (implements)
      </output>
    </example>

    <example name="Inferred from PRD Epic">
      <input>
        Story content:
        # Story 1.1: User Registration
        (no explicit requirement references)

        PRD content:
        ### Epic 1: User Authentication
        This epic implements REQ-001, REQ-002, FR-001
      </input>
      <output>
        Links (inferred from Epic 1):
        - STORY-1-1 → REQ-001 (implements)
        - STORY-1-1 → REQ-002 (implements)
        - STORY-1-1 → FR-001 (implements)
      </output>
    </example>

    <example name="No Requirements Found">
      <input>
        Story content:
        # Story 1.1: User Registration
        (no requirement references)

        PRD: No epic mapping available
        Config: require_links = false
      </input>
      <output>
        Warning: No requirements found for STORY-1-1
        Story created without requirement links
      </output>
    </example>
  </examples>

</task>
```