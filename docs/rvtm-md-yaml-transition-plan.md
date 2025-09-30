# RVTM Transition to MD/YAML-Driven Architecture

## Overview

Transition RVTM from JavaScript-based hooks to fully MD/YAML-driven workflows that align with BMAD Method philosophy.

## Current Architecture (JavaScript-Based)

```
JavaScript Hooks (bmad/core/lib/rvtm/rvtm-hooks/*.js)
├── extract-requirements.js (300+ lines)
├── link-story-requirements.js (250+ lines)
├── register-tests.js (280+ lines)
└── update-story-status.js (270+ lines)

Dependencies:
- Node.js execution
- rvtm-manager.js (core operations)
- Direct file I/O and parsing
```

## Proposed Architecture (MD/YAML-Driven)

```
RVTM Tasks (bmad/core/tasks/rvtm/*.md)
├── extract-requirements.md (LLM instructions)
├── link-story-requirements.md (LLM instructions)
├── register-tests.md (LLM instructions)
└── update-story-status.md (LLM instructions)

RVTM Data Structure (.rvtm/)
├── config.yaml (configuration)
├── matrix.yaml (traceability data - YAML instead of JSON)
├── requirements/ (individual YAML files)
├── stories/ (individual YAML files)
└── tests/ (individual YAML files)
```

## Key Design Principles

### 1. **LLM as the Execution Engine**
Instead of JavaScript parsing and manipulation, the LLM:
- Reads and understands markdown files
- Extracts requirements using pattern matching
- Updates YAML files directly
- Generates traceability links

### 2. **YAML for Data Storage**
Replace JSON with YAML for better human readability:
```yaml
# .rvtm/matrix.yaml
requirements:
  REQ-001:
    id: REQ-001
    text: "Users must be able to register with email and password"
    type: functional
    status: draft
    source_document: PRD.md
    source_section: Functional Requirements
    created_date: 2025-09-30T10:00:00Z

stories:
  STORY-1-1:
    id: STORY-1-1
    title: "User Registration"
    epic_id: EPIC-1
    story_number: 1
    requirements:
      - REQ-001
      - FR-001
    implementation_status: planned
    created_date: 2025-09-30T10:30:00Z

links:
  - from_type: story
    from_id: STORY-1-1
    to_type: requirement
    to_id: REQ-001
    link_type: implements
    created_date: 2025-09-30T10:30:00Z
```

### 3. **Markdown Instructions with XML Tags**
Replace JavaScript logic with LLM-executable instructions:

```markdown
# Extract Requirements Task

<task id="bmad/core/tasks/rvtm/extract-requirements.md">
  <objective>Extract requirements from PRD and register in RVTM matrix</objective>

  <flow>
    <step n="1" goal="Check if RVTM is initialized">
      <action>Check if .rvtm/matrix.yaml exists</action>
      <check>If not exists → HALT with message "Run *init-rvtm first"</check>
    </step>

    <step n="2" goal="Load PRD content">
      <action>Read the PRD file from {{prd_file}}</action>
      <action>Store content in memory for parsing</action>
    </step>

    <step n="3" goal="Extract explicit requirement IDs">
      <action>Search for patterns: REQ-\d+, FR-\d+, NFR-\d+</action>
      <action>For each match found:</action>
      <action>  - Extract requirement ID</action>
      <action>  - Extract requirement text (after ID)</action>
      <action>  - Determine section (Functional vs Non-Functional)</action>
      <action>  - Create requirement entry</action>
    </step>

    <step n="4" goal="Extract numbered requirements">
      <action>Find "## Functional Requirements" section</action>
      <action>Extract all numbered/bulleted items</action>
      <action>Generate IDs as FR-001, FR-002, etc.</action>
      <action>Repeat for "## Non-Functional Requirements" as NFR-001, etc.</action>
    </step>

    <step n="5" goal="Update RVTM matrix">
      <action>Load .rvtm/matrix.yaml</action>
      <action>For each extracted requirement:</action>
      <action>  - Add to requirements section if not exists</action>
      <action>  - Set created_date to current timestamp</action>
      <action>  - Set status to 'draft'</action>
      <action>  - Set source_document to PRD filename</action>
      <action>Save updated matrix to .rvtm/matrix.yaml</action>
    </step>

    <step n="6" goal="Report results">
      <action>Count total requirements extracted</action>
      <action>Display summary: "✓ RVTM: Extracted N requirements from PRD"</action>
      <action>  - X functional requirements</action>
      <action>  - Y non-functional requirements</action>
    </step>
  </flow>
</task>
```

## Transition Plan

### Phase 1: Convert Data Storage (Week 1)

**Tasks:**
1. Create YAML schema for RVTM data structures
2. Build conversion utility: JSON → YAML migration
3. Update all file operations to use YAML
4. Test data integrity after conversion

**Files to Create:**
- `.rvtm/matrix.yaml` (replaces matrix.json)
- `.rvtm/requirements/*.yaml` (individual requirement files)
- `.rvtm/stories/*.yaml` (individual story files)
- `.rvtm/tests/*.yaml` (individual test files)

### Phase 2: Create MD Task Files (Week 1-2)

**Tasks:**
1. Extract logic from JS hooks into MD instructions
2. Create task files with XML flow definitions
3. Define clear input/output patterns
4. Add validation and error handling

**Files to Create:**
- `bmad/core/tasks/rvtm/extract-requirements.md`
- `bmad/core/tasks/rvtm/link-story-requirements.md`
- `bmad/core/tasks/rvtm/register-tests.md`
- `bmad/core/tasks/rvtm/update-story-status.md`

### Phase 3: Update Workflow Integration (Week 2)

**Tasks:**
1. Modify workflow instructions to invoke MD tasks
2. Remove Node.js script execution
3. Use `<invoke-task>` XML tags instead
4. Test each workflow integration point

**Workflows to Update:**
- `2-plan/prd/instructions-{med,lg}.md`
- `create-story/instructions.md`
- `dev-story/instructions.md`
- `testarch/atdd.md`

### Phase 4: Deprecate JavaScript Files (Week 3)

**Tasks:**
1. Archive JavaScript hooks to `_deprecated/`
2. Update all documentation
3. Remove Node.js dependencies from workflows
4. Final testing and validation

**Files to Archive:**
- `bmad/core/lib/rvtm/rvtm-hooks/*.js`
- `bmad/core/lib/rvtm/rvtm-manager.js` (if fully replaced)

## Example: Extract Requirements (MD-Driven)

### Current (JavaScript):
```javascript
// extract-requirements.js
class ExtractRequirementsHook {
  async extractFromPRD(prdFilePath) {
    const content = await fs.readFile(prdFilePath, 'utf-8');
    const requirements = this.parseRequirements(content);
    // ... 300+ lines of JavaScript
  }
}
```

### Proposed (Markdown):
```markdown
<!-- bmad/core/tasks/rvtm/extract-requirements.md -->

# Extract Requirements from PRD

<task id="bmad/core/tasks/rvtm/extract-requirements">
  <inputs>
    <input name="prd_file" type="path" required="true" />
    <input name="project_root" type="path" default="." />
  </inputs>

  <outputs>
    <output name="requirements_count" type="number" />
    <output name="functional_count" type="number" />
    <output name="non_functional_count" type="number" />
  </outputs>

  <flow>
    <step n="1" goal="Validate RVTM exists">
      <check>If .rvtm/matrix.yaml not exists → HALT</check>
    </step>

    <step n="2" goal="Read PRD">
      <action>Read {{prd_file}} content</action>
    </step>

    <step n="3" goal="Extract requirements using patterns">
      <pattern type="explicit">REQ-\d+:?\s*(.+)</pattern>
      <pattern type="functional">FR-\d+:?\s*(.+)</pattern>
      <pattern type="non-functional">NFR-\d+:?\s*(.+)</pattern>

      <action>Search PRD content for all patterns</action>
      <action>For each match:</action>
      <action>  - Extract ID and text</action>
      <action>  - Determine type from pattern</action>
      <action>  - Find containing section for source_section</action>
      <action>  - Create requirement object</action>
    </step>

    <step n="4" goal="Extract numbered requirements">
      <action>Find "## Functional Requirements" section</action>
      <action>Extract all list items (-, *, 1.)</action>
      <action>Generate FR-001, FR-002... for items without IDs</action>
      <action>Repeat for "## Non-Functional Requirements" as NFR-XXX</action>
    </step>

    <step n="5" goal="Update matrix">
      <action>Load .rvtm/matrix.yaml</action>
      <action>For each requirement:</action>
      <action>  - Add to requirements section if new</action>
      <action>  - Skip if ID already exists</action>
      <action>  - Set metadata (dates, status, source)</action>
      <action>Save .rvtm/matrix.yaml</action>
    </step>

    <step n="6" goal="Report results">
      <action>Count total, functional, non-functional</action>
      <action>Display: "✓ RVTM: Extracted {{requirements_count}} requirements"</action>
      <action>Display: "  - {{functional_count}} functional"</action>
      <action>Display: "  - {{non_functional_count}} non-functional"</action>
    </step>
  </flow>
</task>
```

## Workflow Integration Example

### Current (JavaScript hook):
```markdown
<step n="13" goal="Extract requirements to RVTM">
  <action>Invoke RVTM hook: node {project-root}/bmad/core/lib/rvtm/rvtm-hooks/extract-requirements.js --prd-file={{default_output_file}}</action>
</step>
```

### Proposed (MD task):
```markdown
<step n="13" goal="Extract requirements to RVTM">
  <invoke-task path="{project-root}/bmad/core/tasks/rvtm/extract-requirements.md">
    <param name="prd_file">{{default_output_file}}</param>
    <param name="project_root">{{project_root}}</param>
  </invoke-task>
  <check>If task fails, log warning but continue (non-blocking)</check>
</step>
```

## Benefits of MD/YAML Approach

### 1. **Alignment with BMAD Philosophy** ✅
- Pure MD/YAML, no external scripts
- LLM-native execution
- Human-readable throughout

### 2. **Easier to Understand** 📚
- Clear step-by-step instructions
- XML tags show intent
- No JavaScript syntax to learn

### 3. **More Maintainable** 🔧
- Edit markdown files directly
- No compilation or transpilation
- Version control friendly

### 4. **Better Transparency** 🔍
- See exactly what LLM will do
- Easier to debug
- Clear data flow

### 5. **Portable** 🚀
- No Node.js dependency
- Works with any LLM that reads markdown
- Platform independent

### 6. **Extensible** 🎯
- Users can customize MD instructions
- Add new patterns easily
- Override behavior per project

## Data Structure Comparison

### Current (JSON):
```json
{
  "requirements": {
    "REQ-001": {
      "id": "REQ-001",
      "text": "...",
      "type": "functional"
    }
  }
}
```

### Proposed (YAML):
```yaml
requirements:
  REQ-001:
    id: REQ-001
    text: "..."
    type: functional
    created_date: 2025-09-30
    tags:
      - authentication
      - critical
```

**YAML Benefits:**
- Comments allowed (`# This is a comment`)
- Better readability
- Multi-line strings without escaping
- Native date/time support

## Migration Path for Users

### Step 1: Run Migration Utility
```bash
*migrate-rvtm-to-yaml
```

Converts existing `.rvtm/matrix.json` → `.rvtm/matrix.yaml`

### Step 2: Update Workflows
No action needed - workflows updated automatically in new version

### Step 3: Verify
```bash
*rvtm-report
```

Should work identically with YAML backend

## Implementation Checklist

### Core Infrastructure
- [ ] Create YAML schema definitions
- [ ] Build JSON → YAML migration utility
- [ ] Update matrix operations to use YAML
- [ ] Create YAML validation functions
- [ ] Test data integrity

### Task Files
- [ ] Create `extract-requirements.md`
- [ ] Create `link-story-requirements.md`
- [ ] Create `register-tests.md`
- [ ] Create `update-story-status.md`
- [ ] Create `generate-report.md`
- [ ] Add validation and error handling

### Workflow Integration
- [ ] Update planning workflow instructions
- [ ] Update story creation instructions
- [ ] Update dev-story instructions
- [ ] Update ATDD instructions
- [ ] Test all integration points

### Documentation
- [ ] Update RVTM README
- [ ] Update Quick Reference
- [ ] Update Example walkthrough
- [ ] Create migration guide
- [ ] Update Discord announcement

### Testing
- [ ] Test requirement extraction
- [ ] Test story linking
- [ ] Test test registration
- [ ] Test status updates
- [ ] Test report generation
- [ ] End-to-end workflow tests

### Deprecation
- [ ] Archive JavaScript files
- [ ] Remove Node.js dependencies
- [ ] Update package.json
- [ ] Clean up old documentation

## Timeline

**Total Estimated Time: 2-3 weeks**

- **Week 1:** Data structure conversion + core MD tasks
- **Week 2:** Workflow integration + testing
- **Week 3:** Documentation + migration tools + deprecation

## Risks & Mitigations

### Risk 1: LLM Parsing Accuracy
**Mitigation:** Provide clear patterns and examples in MD instructions

### Risk 2: Performance
**Mitigation:** YAML read/write is actually faster than JS parsing for LLMs

### Risk 3: Complex Logic
**Mitigation:** Break complex operations into smaller, clear steps

### Risk 4: Backward Compatibility
**Mitigation:** Provide migration utility and support both formats during transition

## Next Steps

1. **Get approval** for transition approach
2. **Create YAML schema** for RVTM data
3. **Build first MD task** (extract-requirements.md) as proof of concept
4. **Test integration** with planning workflow
5. **Iterate** based on results
6. **Roll out** remaining tasks

## Questions to Resolve

1. Should we support both JSON and YAML during transition?
2. How to handle complex regex patterns in MD format?
3. Should individual requirements be separate YAML files or all in matrix.yaml?
4. Do we need a "RVTM engine" markdown task as a coordinator?
5. How to handle concurrent updates to matrix.yaml?

---

**This transition will make RVTM truly BMAD-native and much easier for users to understand, customize, and maintain!** 🎉