# RVTM MD/YAML Integration Example

## How It Works: Before vs After

### BEFORE (JavaScript-based):

**Planning Workflow Instructions** (`instructions-lg.md`):
```markdown
<step n="13" goal="Extract requirements to RVTM">
  <action>Invoke RVTM hook to extract and register requirements from PRD:
    node {project-root}/bmad/core/lib/rvtm/rvtm-hooks/extract-requirements.js
    --prd-file={{default_output_file}}
    --project-root={project-root}
  </action>
  <check>If RVTM is not initialized or hook execution fails, log warning but do not halt workflow</check>
</step>
```

**Problems:**
- ❌ Requires Node.js to execute JavaScript
- ❌ Black box - can't see what the JS code does
- ❌ Not BMAD-native (external script execution)
- ❌ Harder to customize or debug

---

### AFTER (MD/YAML-based):

**Planning Workflow Instructions** (`instructions-lg.md`):
```markdown
<step n="13" goal="Extract requirements to RVTM">
  <invoke-task path="{project-root}/bmad/core/tasks/rvtm/extract-requirements.md">
    <param name="prd_file">{{default_output_file}}</param>
    <param name="project_root">{{project_root}}</param>
  </invoke-task>
  <check>If task fails, log warning but continue (RVTM updates are non-blocking)</check>
</step>
```

**Benefits:**
- ✅ Pure MD/YAML - no external scripts
- ✅ LLM reads instructions and executes them
- ✅ Fully transparent - see exactly what happens
- ✅ Easy to customize per project
- ✅ BMAD-native philosophy

---

## Complete Example: Extract Requirements Flow

### User Action:
```bash
*plan
```

### What Happens:

#### 1. Planning Workflow Executes

The LLM loads `bmad/bmm/workflows/2-plan/workflow.yaml` and processes `instructions-lg.md`.

#### 2. PRD Generated

Step 1-12 create the PRD document at `docs/PRD.md`:

```markdown
# Authentication System PRD

## Functional Requirements

- REQ-001: Users must be able to register with email and password
- REQ-002: Users must be able to log in with credentials
- User profile management
- Password reset functionality

## Non-Functional Requirements

- NFR-001: Login response time must be under 200ms
- NFR-002: System must support 1000 concurrent users
```

#### 3. Step 13 Invokes RVTM Task

```xml
<invoke-task path="{project-root}/bmad/core/tasks/rvtm/extract-requirements.md">
  <param name="prd_file">docs/PRD.md</param>
  <param name="project_root">.</param>
</invoke-task>
```

The workflow engine:
1. Loads `bmad/core/tasks/rvtm/extract-requirements.md`
2. Passes parameters: `prd_file=docs/PRD.md`, `project_root=.`
3. Tells LLM to execute the task flow

#### 4. LLM Executes RVTM Task

**Step 1: Validate RVTM**
```
LLM checks if .rvtm/matrix.yaml exists
✓ File exists - continue
✓ auto_update is true - continue
```

**Step 2: Read PRD**
```
LLM reads docs/PRD.md
Stores content in memory
```

**Step 3: Extract Explicit IDs**
```
LLM searches for patterns: REQ-\d+, FR-\d+, NFR-\d+
Finds:
- REQ-001: Users must be able to register with email and password
- REQ-002: Users must be able to log in with credentials
- NFR-001: Login response time must be under 200ms
- NFR-002: System must support 1000 concurrent users

Extracts:
  REQ-001:
    text: "Users must be able to register with email and password"
    type: functional
    section: "Functional Requirements"
  REQ-002:
    text: "Users must be able to log in with credentials"
    type: functional
    section: "Functional Requirements"
  NFR-001:
    text: "Login response time must be under 200ms"
    type: non-functional
    section: "Non-Functional Requirements"
  NFR-002:
    text: "System must support 1000 concurrent users"
    type: non-functional
    section: "Non-Functional Requirements"
```

**Step 4: Extract Numbered Requirements**
```
LLM finds "## Functional Requirements" section
Finds list items without IDs:
- "User profile management"
- "Password reset functionality"

Generates:
  FR-001:
    text: "User profile management"
    type: functional
    section: "Functional Requirements"
  FR-002:
    text: "Password reset functionality"
    type: functional
    section: "Functional Requirements"
```

**Step 6: Update Matrix**

LLM reads `.rvtm/matrix.yaml`:
```yaml
requirements: {}
stories: {}
tests: {}
links: []
lastModified: "2025-09-30T10:00:00Z"
```

LLM adds requirements:
```yaml
requirements:
  REQ-001:
    id: REQ-001
    text: "Users must be able to register with email and password"
    type: functional
    status: draft
    priority: medium
    source_document: PRD.md
    source_section: Functional Requirements
    created_date: "2025-09-30T14:30:00Z"
    modified_date: "2025-09-30T14:30:00Z"
    tags: []

  REQ-002:
    id: REQ-002
    text: "Users must be able to log in with credentials"
    type: functional
    status: draft
    priority: medium
    source_document: PRD.md
    source_section: Functional Requirements
    created_date: "2025-09-30T14:30:00Z"
    modified_date: "2025-09-30T14:30:00Z"
    tags: []

  FR-001:
    id: FR-001
    text: "User profile management"
    type: functional
    status: draft
    priority: medium
    source_document: PRD.md
    source_section: Functional Requirements
    created_date: "2025-09-30T14:30:00Z"
    modified_date: "2025-09-30T14:30:00Z"
    tags: []

  FR-002:
    id: FR-002
    text: "Password reset functionality"
    type: functional
    status: draft
    priority: medium
    source_document: PRD.md
    source_section: Functional Requirements
    created_date: "2025-09-30T14:30:00Z"
    modified_date: "2025-09-30T14:30:00Z"
    tags: []

  NFR-001:
    id: NFR-001
    text: "Login response time must be under 200ms"
    type: non-functional
    status: draft
    priority: medium
    source_document: PRD.md
    source_section: Non-Functional Requirements
    created_date: "2025-09-30T14:30:00Z"
    modified_date: "2025-09-30T14:30:00Z"
    tags: []

  NFR-002:
    id: NFR-002
    text: "System must support 1000 concurrent users"
    type: non-functional
    status: draft
    priority: medium
    source_document: PRD.md
    source_section: Non-Functional Requirements
    created_date: "2025-09-30T14:30:00Z"
    modified_date: "2025-09-30T14:30:00Z"
    tags: []

stories: {}
tests: {}
links: []
lastModified: "2025-09-30T14:30:00Z"
```

LLM writes updated matrix to `.rvtm/matrix.yaml`

**Step 7: Log Change**
```
LLM appends to .rvtm/history/changes.log:
[2025-09-30T14:30:00Z] Extract Requirements: Added 6 requirements from docs/PRD.md
```

**Step 8: Report Results**
```
LLM displays:
✓ RVTM: Extracted 6 requirements from PRD
  - 4 functional requirements
  - 2 non-functional requirements
```

#### 5. Planning Workflow Continues

Step 14+ continue as normal. RVTM is now updated!

---

## Key Advantages of MD/YAML Approach

### 1. **Transparent Execution**
You can literally read the markdown file and understand exactly what will happen:
- Step 1: Check if RVTM exists
- Step 2: Read PRD
- Step 3: Extract patterns
- Step 4-5: Generate IDs
- Step 6: Update YAML
- Step 7: Log
- Step 8: Report

### 2. **Customizable Per Project**

Users can override the task in their project:
```
my-project/
  bmad/
    _cfg/
      tasks/
        rvtm/
          extract-requirements.md  ← Custom version!
```

Add custom patterns:
```xml
<step n="3.5" goal="Extract company-specific requirements">
  <pattern name="epic_requirement">
    Regex: \b(EPIC-\d+-REQ-\d+):?\s*(.+?)
  </pattern>
  <action>Search for EPIC-X-REQ-Y format</action>
</step>
```

### 3. **No External Dependencies**

Before:
- ❌ Requires Node.js installed
- ❌ Requires `fs-extra`, `js-yaml` npm packages
- ❌ JavaScript runtime

After:
- ✅ LLM reads markdown
- ✅ LLM follows instructions
- ✅ Pure MD/YAML

### 4. **Easy Debugging**

If something goes wrong, you can:
1. Read the exact instruction that failed
2. See what pattern it was trying to match
3. Modify the pattern in the MD file
4. Try again immediately

No need to debug JavaScript code!

### 5. **Version Control Friendly**

```diff
# .rvtm/matrix.yaml
requirements:
  REQ-001:
+   priority: high  # Changed from medium
    text: "Users must be able to register..."
```

YAML diffs are human-readable!

---

## Migration Path

### Phase 1: Parallel Support

Support both JavaScript hooks AND MD tasks:

```markdown
<step n="13" goal="Extract requirements to RVTM">
  <check>If {project-root}/bmad/core/tasks/rvtm/extract-requirements.md exists:</check>
  <invoke-task path="{project-root}/bmad/core/tasks/rvtm/extract-requirements.md">
    <param name="prd_file">{{default_output_file}}</param>
  </invoke-task>
  <check>Else (legacy JavaScript hook):</check>
  <action>node {project-root}/bmad/core/lib/rvtm/rvtm-hooks/extract-requirements.js --prd-file={{default_output_file}}</action>
</step>
```

### Phase 2: Full MD/YAML

Remove JavaScript hooks, use only MD tasks:

```markdown
<step n="13" goal="Extract requirements to RVTM">
  <invoke-task path="{project-root}/bmad/core/tasks/rvtm/extract-requirements.md">
    <param name="prd_file">{{default_output_file}}</param>
  </invoke-task>
</step>
```

Clean and simple!

---

## Summary

**MD/YAML-driven RVTM is:**
- ✅ **BMAD-native** - No external scripts
- ✅ **Transparent** - Read instructions in plain English
- ✅ **Customizable** - Override per project
- ✅ **Debuggable** - Modify MD files directly
- ✅ **Portable** - No dependencies
- ✅ **Maintainable** - Version control friendly

**This is the BMAD way!** 🎉