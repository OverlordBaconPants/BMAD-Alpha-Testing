# Epic: Tech Writer Transition to MD/YAML Architecture

**Status:** Planning
**Priority:** High
**Epic Owner:** Overlord BaconPants
**Created:** 2025-09-30
**Target Completion:** 3 weeks

---

## Executive Summary

Transition the Tech Writer functionality from shell script wrappers and JavaScript utilities to a pure MD and YAML-driven architecture following BMAD conventions. This aligns with the successful RVTM transition and enables Claude to generate documentation artifacts without executing external JavaScript or shell scripts.

## Business Value

### Current Pain Points
1. **External Dependencies**: Tech Writer relies on shell scripts (`.commands/*.sh`) that wrap Python/YAML workflows
2. **JavaScript Requirements**: Some functionality may depend on Node.js utilities
3. **Inconsistent Architecture**: Tech Writer doesn't follow the same MD/YAML patterns as PRD and Story generation
4. **Limited Portability**: Shell script dependencies make it less portable across environments

### Expected Benefits
1. **Pure AI Execution**: Claude can execute documentation workflows using only MD instructions and YAML data
2. **Architectural Consistency**: All BMAD agents follow the same MD/YAML pattern
3. **Improved Maintainability**: No shell script or JavaScript files to maintain
4. **Better Version Control**: All logic in readable MD/YAML files
5. **Faster Iteration**: Changes to workflows don't require testing shell scripts

## Current State Analysis

### Existing Components

#### Shell Script Wrappers
- `/bmad/bmm/tech-writer` - Main CLI entry point (bash)
- `/bmad/bmm/.commands/generate-readme.sh` - Wrapper for README workflow
- `/bmad/bmm/.commands/generate-api-docs.sh` - Wrapper for API docs workflow
- `/bmad/bmm/.commands/analyze-project.sh` - Wrapper for code analysis
- `/bmad/bmm/.commands/validate-docs.sh` - Wrapper for validation

#### Workflow Definitions (Already YAML!)
- `/bmad/bmm/workflows/generate-readme/workflow.yaml` ✅ Already exists
- `/bmad/bmm/workflows/generate-api-docs/workflow.yaml` ✅ Already exists

#### Agent Definition
- `/bmad/bmm/agents/tech-writer.md` ✅ Already MD format
- Commands currently reference "todo" or shell scripts

#### Templates
- `/bmad/bmm/templates/readme-template.md` ✅ Already exists

### What Needs to Change

1. **Agent Commands**: Update `tech-writer.md` to reference MD instruction files instead of shell scripts
2. **Create Instruction Files**: Convert workflow execution logic to MD instructions
3. **Create Task Definitions**: Break down workflows into reusable MD task files
4. **Remove Shell Scripts**: Eliminate `.commands/*.sh` and bash wrapper files
5. **Update Workflow Integration**: Ensure workflows use `invoke-task` pattern

## Target Architecture

### Directory Structure
```
bmad/bmm/
├── agents/
│   └── tech-writer.md              # Agent definition (update commands)
├── workflows/
│   ├── generate-readme/
│   │   ├── workflow.yaml           # Exists - may need updates
│   │   └── instructions.md         # NEW - execution instructions
│   ├── generate-api-docs/
│   │   ├── workflow.yaml           # Exists - may need updates
│   │   └── instructions.md         # NEW - execution instructions
│   ├── generate-user-guide/
│   │   ├── workflow.yaml           # NEW
│   │   └── instructions.md         # NEW
│   └── generate-architecture/
│       ├── workflow.yaml           # NEW
│       └── instructions.md         # NEW
├── templates/
│   ├── readme-template.md          # Exists - may enhance
│   ├── api-docs-template.md        # NEW
│   ├── user-guide-template.md      # NEW
│   └── architecture-template.md    # NEW
└── tech-writer                      # REMOVE after transition

bmad/core/
├── lib/
│   └── tech-writer/
│       └── schema/
│           ├── doc-metadata-schema.yaml      # NEW
│           └── validation-rules-schema.yaml  # NEW
└── tasks/
    └── tech-writer/
        ├── analyze-codebase.md              # NEW
        ├── generate-section.md              # NEW
        ├── validate-documentation.md        # NEW
        ├── detect-project-type.md           # NEW
        ├── extract-api-endpoints.md         # NEW
        └── create-diagrams.md               # NEW
```

## Epic Stories

### Story 1: Create Core Task Definitions
**Priority:** Critical
**Estimate:** 3 days

Create reusable MD task files for common documentation operations.

**Tasks:**
- [ ] Create `analyze-codebase.md` task for project analysis
- [ ] Create `detect-project-type.md` task for project classification
- [ ] Create `generate-section.md` task for content generation
- [ ] Create `validate-documentation.md` task for quality checks
- [ ] Create `extract-api-endpoints.md` task for API discovery
- [ ] Create `create-diagrams.md` task for Mermaid diagram generation

**Acceptance Criteria:**
- Each task is self-contained MD file with clear instructions
- Tasks follow BMAD task conventions (similar to RVTM tasks)
- Tasks accept parameters and produce structured output
- Tasks include error handling and validation steps

**Reference Implementation:**
Look at `/bmad/core/tasks/rvtm/*.md` for patterns to follow.

---

### Story 2: Create README Generation Instructions
**Priority:** Critical
**Estimate:** 2 days

Create instructions.md for README generation workflow.

**Tasks:**
- [ ] Create `/bmad/bmm/workflows/generate-readme/instructions.md`
- [ ] Define step-by-step process using `<step>` tags
- [ ] Integrate with core tasks using `<invoke-task>`
- [ ] Add validation and error handling
- [ ] Include progress reporting
- [ ] Add RVTM integration for documentation tracking

**Acceptance Criteria:**
- Instructions file follows PRD/Story workflow patterns
- Can generate README without shell scripts
- Includes user elicitation for missing information
- Produces validation checklist
- Reports completion status

**Template Structure:**
```xml
<instructions>
  <context>README generation for any project</context>

  <step n="1" goal="Analyze project structure">
    <action>Invoke analyze-codebase task</action>
    <validation>Verify analysis complete</validation>
  </step>

  <step n="2" goal="Detect project type">
    <action>Invoke detect-project-type task</action>
    <output>Project type: {type}</output>
  </step>

  <step n="3" goal="Generate content sections">
    <action>For each section, invoke generate-section task</action>
  </step>

  <!-- Additional steps -->
</instructions>
```

---

### Story 3: Create API Documentation Instructions
**Priority:** High
**Estimate:** 3 days

Create instructions.md for API documentation workflow.

**Tasks:**
- [ ] Create `/bmad/bmm/workflows/generate-api-docs/instructions.md`
- [ ] Integrate API endpoint extraction task
- [ ] Add OpenAPI/Swagger detection and parsing
- [ ] Include authentication documentation
- [ ] Add request/response example generation
- [ ] Create SDK example generation logic

**Acceptance Criteria:**
- Can document REST APIs automatically
- Detects and uses existing OpenAPI specs
- Generates examples for multiple languages
- Creates Postman collection data
- Validates API documentation completeness

---

### Story 4: Update Tech Writer Agent Definition
**Priority:** High
**Estimate:** 1 day

Update agent definition to reference new MD-based workflows.

**Tasks:**
- [ ] Update commands in `/bmad/bmm/agents/tech-writer.md`
- [ ] Change `run-workflow` references to instruction files
- [ ] Remove references to shell scripts
- [ ] Add new commands for user guide and architecture docs
- [ ] Update agent context and critical actions

**Current:**
```xml
<c cmd="*generate-readme" run-workflow="todo">
  Generate comprehensive project README
</c>
```

**New:**
```xml
<c cmd="*generate-readme"
   run-workflow="{project-root}/bmad/bmm/workflows/generate-readme/instructions.md">
  Generate comprehensive project README
</c>
```

---

### Story 5: Create User Guide Workflow
**Priority:** Medium
**Estimate:** 3 days

Create complete workflow for user guide generation.

**Tasks:**
- [ ] Create `workflow.yaml` for user guide generation
- [ ] Create `instructions.md` for execution
- [ ] Create `user-guide-template.md`
- [ ] Add progressive disclosure logic
- [ ] Include screenshot/media placeholder generation
- [ ] Add FAQ section generation

**Acceptance Criteria:**
- Generates comprehensive user guides
- Supports beginner to advanced progression
- Creates tutorial-style content
- Includes troubleshooting section

---

### Story 6: Create Architecture Documentation Workflow
**Priority:** Medium
**Estimate:** 3 days

Create workflow for architecture documentation.

**Tasks:**
- [ ] Create `workflow.yaml` for architecture docs
- [ ] Create `instructions.md` for execution
- [ ] Create `architecture-template.md`
- [ ] Integrate diagram generation (C4, sequence, etc.)
- [ ] Add component interaction analysis
- [ ] Include deployment architecture

**Acceptance Criteria:**
- Generates C4 architecture diagrams
- Documents system components
- Shows data flow
- Includes security architecture

---

### Story 7: Create Documentation Validation Task
**Priority:** High
**Estimate:** 2 days

Create robust validation task for documentation quality.

**Tasks:**
- [ ] Create `/bmad/core/tasks/tech-writer/validate-documentation.md`
- [ ] Add completeness checks
- [ ] Add link validation logic
- [ ] Add reading level analysis instructions
- [ ] Add code example validation
- [ ] Create validation report format

**Acceptance Criteria:**
- Validates all documentation types
- Provides actionable feedback
- Calculates quality scores
- Identifies missing sections

---

### Story 8: Remove Shell Script Dependencies
**Priority:** High
**Estimate:** 1 day

Clean up legacy shell script wrappers.

**Tasks:**
- [ ] Test all workflows work without shell scripts
- [ ] Remove `/bmad/bmm/tech-writer` bash file
- [ ] Remove `/bmad/bmm/.commands/*.sh` files
- [ ] Update any documentation referencing shell scripts
- [ ] Update tests to use new MD-based execution

**Acceptance Criteria:**
- All tech writer functionality works without shell scripts
- No JavaScript execution required
- All tests pass
- Documentation updated

---

### Story 9: Create Documentation Schemas
**Priority:** Medium
**Estimate:** 1 day

Define YAML schemas for documentation metadata and validation.

**Tasks:**
- [ ] Create `doc-metadata-schema.yaml`
- [ ] Create `validation-rules-schema.yaml`
- [ ] Document schema usage
- [ ] Add schema validation examples

**Acceptance Criteria:**
- Schemas define doc structure
- Can track documentation coverage
- Support versioning and changelog

---

### Story 10: Integration Testing and Documentation
**Priority:** High
**Estimate:** 2 days

Comprehensive testing and documentation of new system.

**Tasks:**
- [ ] Test README generation on 5+ project types
- [ ] Test API documentation generation
- [ ] Create transition guide
- [ ] Update BMAD documentation
- [ ] Create comparison doc (like RVTM comparison)
- [ ] Performance benchmarking

**Acceptance Criteria:**
- All workflows tested and working
- Documentation complete
- Migration guide available
- Performance acceptable (< 60s for README)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Story 1: Core task definitions
- Story 7: Validation task
- Story 9: Documentation schemas

**Deliverables:**
- Reusable task library
- Validation framework
- Schema definitions

### Phase 2: Primary Workflows (Week 2)
- Story 2: README generation
- Story 3: API documentation
- Story 4: Update agent definition

**Deliverables:**
- Working README workflow (MD/YAML only)
- Working API docs workflow (MD/YAML only)
- Updated agent with new commands

### Phase 3: Extended Workflows (Week 3)
- Story 5: User guide workflow
- Story 6: Architecture workflow
- Story 8: Remove shell scripts
- Story 10: Testing and documentation

**Deliverables:**
- Complete workflow suite
- Clean codebase (no shell scripts)
- Comprehensive documentation

## Technical Approach

### Pattern: RVTM Transition as Template

Follow the same approach used for RVTM transition:

1. **Task-Based Architecture**: Break functionality into reusable MD task files
2. **Instruction Files**: Create step-by-step instructions.md for each workflow
3. **Schema Definitions**: Use YAML for data structure definitions
4. **Agent Integration**: Update agent commands to reference MD instructions
5. **Non-Blocking Execution**: Failures should warn but not halt

### Key Patterns from RVTM

**Task Invocation:**
```xml
<invoke-task path="bmad/core/tasks/tech-writer/analyze-codebase.md">
  <param name="project_root">{project-root}</param>
  <param name="output_format">yaml</param>
</invoke-task>
```

**Step Structure:**
```xml
<step n="1" goal="Analyze project">
  <action>Describe what to do</action>
  <validation>Check results</validation>
  <output>Report findings</output>
  <check>Handle errors gracefully</check>
</step>
```

**Schema Reference:**
```yaml
# doc-metadata-schema.yaml
documentation:
  title: string
  version: string
  created: timestamp
  updated: timestamp
  type: enum [readme, api, guide, architecture]
  coverage:
    completeness: percentage
    sections:
      - name: string
        status: enum [complete, partial, missing]
```

## Success Metrics

### Functional Requirements
- ✅ All documentation can be generated without shell scripts
- ✅ All documentation can be generated without JavaScript execution
- ✅ Claude can execute all workflows using only MD instructions
- ✅ Workflow quality matches or exceeds current implementation

### Performance Targets
- README generation: < 30 seconds
- API documentation: < 60 seconds
- User guide: < 45 seconds
- Architecture docs: < 90 seconds

### Quality Metrics
- Documentation completeness: > 90%
- Validation pass rate: > 95%
- Reading level accuracy: ± 0.5 grades
- Zero broken links in generated docs

## Risks and Mitigations

### Risk 1: Workflow Complexity
**Risk:** MD-based workflows may be harder to debug than shell scripts
**Mitigation:**
- Include verbose logging in each step
- Add validation checkpoints
- Create debugging guide

### Risk 2: Performance
**Risk:** MD execution may be slower than shell scripts
**Mitigation:**
- Optimize task structure
- Cache analysis results
- Use parallel processing where possible

### Risk 3: Feature Parity
**Risk:** Some shell script functionality may be hard to replicate
**Mitigation:**
- Start with core features
- Add advanced features incrementally
- Document any limitations

## Dependencies

### BMAD Core Requirements
- Workflow execution engine must support MD instructions
- Task invocation system must be functional
- Parameter passing must work between tasks
- YAML parsing must be available

### External Tools (Read-Only)
- Git (for repo analysis)
- File system access
- YAML parsing capability
- Markdown rendering

**Note:** No external tool execution required, only reading/analysis

## Definition of Done

### Epic Complete When:
- [ ] All 10 stories completed and tested
- [ ] Shell scripts removed from codebase
- [ ] Agent definition updated
- [ ] All workflows documented
- [ ] Migration guide published
- [ ] Tests passing
- [ ] Performance benchmarks met
- [ ] User acceptance testing complete

### Documentation Deliverables:
- [ ] Tech Writer MD/YAML Architecture Guide
- [ ] Workflow Creation Tutorial
- [ ] Task Reference Documentation
- [ ] Migration Guide (Shell to MD/YAML)
- [ ] Comparison Document (Before/After)
- [ ] Troubleshooting Guide

## Notes for Implementers

### Best Practices
1. **Start Simple**: Begin with README workflow, then expand
2. **Follow RVTM Pattern**: Use RVTM implementation as reference
3. **Test Incrementally**: Test each workflow before moving to next
4. **Document As You Go**: Keep docs updated with implementation
5. **Preserve Templates**: Existing templates are good, enhance them

### Reference Implementations
- RVTM tasks: `/bmad/core/tasks/rvtm/*.md`
- RVTM workflows: `/bmad/bmm/workflows/rvtm/*`
- PRD workflow: `/bmad/bmm/workflows/2-plan/prd/instructions*.md`
- Story workflow: `/bmad/bmm/workflows/4-implementation/*/instructions.md`

### Testing Strategy
1. Test each task independently
2. Test workflows on diverse project types
3. Compare output quality with current implementation
4. Measure performance
5. Validate schema compliance

## Related Documents
- `/docs/rvtm-md-yaml-transition-plan.md` - RVTM transition (use as template)
- `/docs/tech-writer-workflows-epic.md` - Original tech writer epic
- `/bmad/bmm/agents/tech-writer.md` - Current agent definition
- BMAD Workflow Documentation (reference core task patterns)

---

**Epic Status:** Ready for Implementation
**Next Action:** Begin Story 1 - Create Core Task Definitions
**Estimated Total Effort:** ~23 days (~3 weeks with parallel work)