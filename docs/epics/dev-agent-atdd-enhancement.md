# Epic: Developer Agent ATDD & Red-Green-Refactor Enhancement

**Status:** Planning
**Priority:** High
**Epic Owner:** Party Mode / Overlord BaconPants
**Created:** 2025-09-30
**Target Completion:** 2-3 weeks

---

## Executive Summary

Enhance the Developer Agent to follow Acceptance Test-Driven Development (ATDD) and red-green-refactor practices by default, while maintaining the MD and YAML-driven architecture. This ensures all implementation is test-first, verification-focused, and follows industry best practices for test-driven development.

## Business Value

### Current Pain Points
1. **Tests Written After Code**: Current workflow writes tests in Step 3, after implementation in Step 2
2. **Missing Test-First Discipline**: No enforcement of red-green-refactor cycle
3. **ATDD Exists But Disconnected**: ATDD workflow exists (`bmad/bmm/testarch/atdd.md`) but isn't integrated into dev workflow
4. **Acceptance Criteria Not Verified First**: ACs are checked after implementation rather than driving implementation

### Expected Benefits
1. **Test-First Mentality**: All code driven by failing tests
2. **Higher Quality**: Implementations satisfy tests that verify acceptance criteria
3. **Better Design**: Test-first leads to more testable, modular code
4. **Continuous Verification**: Tests run at each stage of red-green-refactor
5. **RVTM Integration**: Tests registered with requirements from the start
6. **Maintained Architecture**: Pure MD/YAML execution, no JavaScript/shell scripts required

## Current State Analysis

### Existing Components

#### Developer Agent
- **File**: `/bmad/bmm/agents/dev.md`
- **Status**: Already MD/YAML driven ✅
- **Issue**: Workflow doesn't integrate ATDD

#### Dev Story Workflow
- **Files**:
  - `/bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml`
  - `/bmad/bmm/workflows/4-implementation/dev-story/instructions.md`
- **Current Flow**:
  1. Load story (Step 1)
  2. Implement (Step 2)
  3. Write tests (Step 3)
  4. Run tests (Step 4)
  5. Mark complete (Step 5)
- **Issue**: Code-first, not test-first

#### ATDD Workflow (Exists!)
- **File**: `/bmad/bmm/testarch/atdd.md`
- **Status**: Already MD/YAML format ✅
- **Features**:
  - Generates failing acceptance tests
  - Uses TEA knowledge base
  - Registers tests with RVTM
  - Creates implementation checklist
- **Issue**: Not integrated into dev workflow

#### Test Architect Agent (TEA)
- **File**: `/bmad/bmm/agents/tea.md`
- **Commands**: Has `*tdd` command for ATDD
- **Knowledge Base**: `/bmad/bmm/testarch/tea-knowledge.md`
- **Command Registry**: `/bmad/bmm/testarch/tea-commands.csv`

### What Works Well
1. ✅ All components already MD/YAML driven
2. ✅ ATDD workflow already exists
3. ✅ RVTM integration already built
4. ✅ TEA agent has test generation capabilities
5. ✅ Story Context JSON provides authoritative requirements

### What Needs to Change
1. **Dev Workflow Instructions**: Reorder steps to follow red-green-refactor
2. **Integrate ATDD Task**: Invoke ATDD workflow before implementation
3. **Add Refactor Step**: Explicit refactoring phase with test verification
4. **Update Agent Commands**: Add test-first workflow option
5. **Story Context Enhancement**: Include test strategy in context

## Target Architecture

### Red-Green-Refactor Workflow

```xml
<workflow name="dev-story-tdd">
  <step n="1" goal="Load story and select task">
    <!-- Same as current -->
  </step>

  <step n="2" goal="Generate failing acceptance tests (RED)">
    <action>Invoke ATDD task to generate failing tests</action>
    <invoke-task path="bmad/bmm/testarch/atdd.md">
      <param name="story_path">{{story_path}}</param>
      <param name="context">{{story_context}}</param>
      <param name="task">{{current_task}}</param>
    </invoke-task>
    <action>Register tests with RVTM</action>
    <action>Run tests to verify they fail (RED state)</action>
    <check>If tests pass initially → HALT: tests must fail before implementation</check>
  </step>

  <step n="3" goal="Implement to pass tests (GREEN)">
    <action>Review failing tests and acceptance criteria</action>
    <action>Implement ONLY enough to make tests pass</action>
    <action>Run tests iteratively during implementation</action>
    <action>Continue until all tests pass (GREEN state)</action>
    <check>If tests still fail after 3 attempts → refine tests or ask for guidance</check>
  </step>

  <step n="4" goal="Refactor while maintaining green (REFACTOR)">
    <action>Review implementation for code quality</action>
    <action>Refactor to improve design, readability, performance</action>
    <action>Run tests after each refactoring change</action>
    <action>Ensure all tests remain green</action>
    <check>If any test fails → revert last change and try different approach</check>
  </step>

  <step n="5" goal="Run full validation">
    <action>Run complete test suite (unit, integration, e2e)</action>
    <action>Run linting and code quality checks</action>
    <action>Validate against all acceptance criteria</action>
    <action>Update RVTM with test results</action>
  </step>

  <step n="6" goal="Mark task complete and update story">
    <!-- Same as current -->
  </step>

  <step n="7" goal="Story completion sequence">
    <!-- Same as current -->
  </step>
</workflow>
```

### Directory Structure (No Changes Needed!)

All files already exist in correct locations:
```
bmad/bmm/
├── agents/
│   ├── dev.md                      # UPDATE: Add TDD workflow option
│   └── tea.md                      # EXISTS: Test architect
├── workflows/
│   └── 4-implementation/
│       ├── dev-story/
│       │   ├── workflow.yaml       # UPDATE: Add TDD mode
│       │   ├── instructions.md     # UPDATE: Reorder for red-green-refactor
│       │   └── instructions-tdd.md # NEW: Explicit TDD variant
│       └── dev-story-tdd/          # NEW: Complete TDD workflow copy
│           ├── workflow.yaml
│           ├── instructions.md
│           └── checklist.md
├── testarch/
│   ├── atdd.md                     # EXISTS: Already perfect
│   ├── tea-knowledge.md            # EXISTS: Test patterns
│   └── tea-commands.csv            # EXISTS: Command registry
```

## Epic Stories

### Story 1: Create TDD Workflow Instructions
**Priority:** Critical
**Estimate:** 2 days

Create new TDD variant of dev-story workflow following red-green-refactor.

**Tasks:**
- [ ] Create `/bmad/bmm/workflows/4-implementation/dev-story-tdd/` directory
- [ ] Create `workflow.yaml` with TDD configuration
- [ ] Create `instructions.md` following red-green-refactor pattern
- [ ] Create `checklist.md` for TDD validation
- [ ] Add ATDD task invocation in Step 2
- [ ] Add explicit refactor step with test verification
- [ ] Include RVTM integration at each step

**Acceptance Criteria:**
- Instructions follow XML format like existing workflows
- Step 2 invokes ATDD task and generates failing tests
- Step 3 implements code to pass tests
- Step 4 refactors with continuous test verification
- Tests are registered with RVTM before implementation
- Workflow can run continuously without pausing (run_until_complete)
- All steps include proper HALT conditions

**Reference Pattern:**
```xml
<step n="2" goal="Generate failing acceptance tests (RED)">
  <action>Review Story Context JSON and current task acceptance criteria</action>
  <action>Invoke ATDD workflow:
    <invoke-task path="bmad/bmm/testarch/atdd.md">
      <param name="story_path">{{story_path}}</param>
      <param name="acceptance_criteria">{{current_task_ac}}</param>
    </invoke-task>
  </action>
  <action>Review generated tests for completeness</action>
  <action>Run tests to verify they fail (RED state)</action>
  <check>If tests pass without implementation → HALT: "Tests must fail initially to verify they test the right thing"</check>
  <check>If tests cannot be created → Ask user for clarification on acceptance criteria</check>
</step>
```

---

### Story 2: Enhance ATDD Task Integration
**Priority:** Critical
**Estimate:** 2 days

Enhance ATDD task to work seamlessly with dev workflow context.

**Tasks:**
- [ ] Review `/bmad/bmm/testarch/atdd.md` for integration points
- [ ] Add Story Context JSON parsing to ATDD task
- [ ] Support per-task test generation (not just per-story)
- [ ] Add test template selection based on task type
- [ ] Improve RVTM registration to include task metadata
- [ ] Add validation that tests fail initially

**Acceptance Criteria:**
- ATDD task accepts Story Context JSON as input
- Can generate tests for individual task (not just whole story)
- Tests map to specific acceptance criteria
- Generated tests include proper assertions
- Tests follow TEA knowledge patterns
- RVTM registration includes task/subtask traceability
- Task verifies tests fail before returning

**Current ATDD Flow:**
```xml
<flow>
  <step n="1" title="Preflight">
    <action>Verify requirements from CSV</action>
  </step>
  <step n="2" title="Execute TDD Flow">
    <action>Generate failing tests using TEA knowledge</action>
  </step>
  <step n="3" title="Deliverables">
    <action>Produce test files + implementation checklist</action>
  </step>
  <step n="4" title="Register Tests in RVTM">
    <action>Register with requirement traceability</action>
  </step>
</flow>
```

**Enhancement Needed:**
- Accept `task_id` parameter to generate tests for specific task
- Parse Story Context to extract task-specific acceptance criteria
- Map generated tests to task checkbox in story markdown
- Add "verify RED state" validation before completing

---

### Story 3: Update Developer Agent Commands
**Priority:** High
**Estimate:** 1 day

Add TDD workflow option to Developer Agent commands.

**Tasks:**
- [ ] Add `*develop-tdd` command to `/bmad/bmm/agents/dev.md`
- [ ] Update `*develop` to prompt for TDD vs traditional
- [ ] Add `*tdd-cycle` command for single red-green-refactor iteration
- [ ] Update critical actions to mention TDD option
- [ ] Update persona to emphasize test-first approach

**Acceptance Criteria:**
- Agent has `*develop-tdd` command
- Command references TDD workflow instructions
- Agent explains difference between `*develop` and `*develop-tdd`
- Default behavior can be configured in config.yaml
- Help text describes TDD workflow benefits

**New Commands:**
```xml
<cmds>
  <c cmd="*help">Show numbered cmd list</c>
  <c cmd="*load-story" action="#load-story">Load story and context</c>
  <c cmd="*status" action="#status">Show current story status</c>

  <c cmd="*develop"
     run-workflow="{project-root}/bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml">
    Execute Dev Story workflow (traditional: implement then test)
  </c>

  <!-- NEW -->
  <c cmd="*develop-tdd"
     run-workflow="{project-root}/bmad/bmm/workflows/4-implementation/dev-story-tdd/workflow.yaml">
    Execute Dev Story workflow with TDD (test-first: RED-GREEN-REFACTOR)
  </c>

  <!-- NEW -->
  <c cmd="*tdd-cycle" action="#tdd-cycle">
    Execute single red-green-refactor cycle for current task
  </c>

  <c cmd="*review"
     run-workflow="{project-root}/bmad/bmm/workflows/4-implementation/review-story/workflow.yaml">
    Perform Senior Developer Review
  </c>
  <c cmd="*exit">Exit with confirmation</c>
</cmds>
```

---

### Story 4: Add Refactor Step with Continuous Verification
**Priority:** High
**Estimate:** 2 days

Create explicit refactoring step that maintains test green state.

**Tasks:**
- [ ] Define refactoring patterns to apply
- [ ] Create refactoring checklist (DRY, SOLID, clean code)
- [ ] Add test execution after each refactor
- [ ] Add revert mechanism if tests fail
- [ ] Include code quality metrics validation
- [ ] Add architectural consistency checks

**Acceptance Criteria:**
- Step 4 explicitly focuses on refactoring
- Tests run after each refactoring change
- If any test fails, changes are reverted
- Refactoring follows established patterns
- Code quality improves measurably
- All tests remain green throughout
- Architectural patterns are maintained

**Refactoring Step Pattern:**
```xml
<step n="4" goal="Refactor while maintaining green (REFACTOR)">
  <action>Review implementation against code quality standards:
    - DRY (Don't Repeat Yourself)
    - SOLID principles
    - Naming clarity
    - Function/method size
    - Complexity reduction
    - Pattern consistency
  </action>
  <action>Identify refactoring opportunities</action>
  <action>For each refactoring:
    1. Make ONE small change
    2. Run tests immediately
    3. If tests fail → revert and try different approach
    4. If tests pass → commit change and continue
  </action>
  <action>Validate final implementation:
    - All tests green ✅
    - Code quality metrics improved
    - No duplication introduced
    - Architecture patterns followed
  </action>
  <check>If tests fail during refactoring → Revert last change</check>
  <check>If code quality decreases → Revert and try different refactoring</check>
</step>
```

---

### Story 5: Enhance Story Context with Test Strategy
**Priority:** Medium
**Estimate:** 2 days

Add test strategy metadata to Story Context JSON.

**Tasks:**
- [ ] Define test strategy schema extension
- [ ] Add test type requirements (unit, integration, e2e)
- [ ] Add coverage expectations per task
- [ ] Add test pattern recommendations
- [ ] Update story creation workflow to include test strategy
- [ ] Update spec-context workflow to generate test strategy

**Acceptance Criteria:**
- Story Context JSON includes `testStrategy` section
- Strategy specifies required test types per task
- Minimum coverage thresholds defined
- Recommended test patterns included
- ATDD task can read and use test strategy
- Story creation prompts for test strategy

**Schema Extension:**
```json
{
  "metadata": {
    "epicId": "EPIC-001",
    "storyId": "STORY-001"
  },
  "acceptanceCriteria": [...],
  "testStrategy": {
    "approach": "ATDD",
    "requiredTypes": ["unit", "integration"],
    "coverageThreshold": 90,
    "patterns": [
      "AAA (Arrange-Act-Assert)",
      "Given-When-Then for acceptance tests"
    ],
    "taskTestRequirements": {
      "task-1": {
        "testTypes": ["unit"],
        "minCoverage": 85,
        "criticalPaths": ["happy path", "error handling"]
      },
      "task-2": {
        "testTypes": ["unit", "integration"],
        "minCoverage": 90,
        "criticalPaths": ["API interaction", "data validation"]
      }
    }
  },
  "artifacts": [...],
  "interfaces": [...],
  "constraints": [...]
}
```

---

### Story 6: Create TDD Mode Configuration
**Priority:** Medium
**Estimate:** 1 day

Add configuration options for TDD behavior in config.yaml.

**Tasks:**
- [ ] Add `development` section to `/bmad/bmm/config.yaml`
- [ ] Add `tdd_mode` setting (enabled/disabled/prompt)
- [ ] Add `test_first_enforcement` setting
- [ ] Add `refactor_step_required` setting
- [ ] Add `min_test_coverage` threshold
- [ ] Update workflow to respect configuration

**Acceptance Criteria:**
- Config file has development/tdd section
- Can enable TDD mode by default
- Can require test-first enforcement
- Coverage thresholds configurable
- Workflow reads and respects config
- Agent mentions TDD mode during activation

**Configuration Schema:**
```yaml
# bmad/bmm/config.yaml
development:
  workflow:
    default_mode: "tdd"  # "tdd" | "traditional" | "prompt"

  tdd:
    enabled: true
    test_first_enforcement: true  # HALT if trying to code before tests
    refactor_step_required: true
    verify_red_state: true  # Verify tests fail initially

  testing:
    min_coverage: 90
    required_types: ["unit"]
    run_on_refactor: true
    halt_on_regression: true

  quality:
    run_linting: true
    enforce_patterns: true
    max_complexity: 10
```

---

### Story 7: Add TDD Validation Checklist
**Priority:** High
**Estimate:** 1 day

Create comprehensive validation checklist for TDD workflow.

**Tasks:**
- [ ] Create `/bmad/bmm/workflows/4-implementation/dev-story-tdd/checklist.md`
- [ ] Add RED phase validation checks
- [ ] Add GREEN phase validation checks
- [ ] Add REFACTOR phase validation checks
- [ ] Add RVTM integration validation
- [ ] Add acceptance criteria verification

**Acceptance Criteria:**
- Checklist validates all TDD phases
- Validates tests fail initially (RED)
- Validates tests pass after implementation (GREEN)
- Validates tests stay green during refactoring
- Validates RVTM registration
- Validates acceptance criteria met
- Can be used by validate-workflow task

**Checklist Structure:**
```markdown
# TDD Workflow Validation Checklist

## Phase 1: RED - Failing Tests
- [ ] Story Context JSON loaded and parsed
- [ ] Acceptance criteria identified for current task
- [ ] ATDD task invoked successfully
- [ ] Test files generated for all acceptance criteria
- [ ] Tests follow TEA knowledge patterns
- [ ] Tests registered with RVTM
- [ ] Tests executed and FAILED (RED state verified)
- [ ] Failure messages are clear and actionable

## Phase 2: GREEN - Implementation
- [ ] Implementation addresses failing tests
- [ ] Code follows repository patterns
- [ ] Tests executed after implementation
- [ ] All tests PASS (GREEN state achieved)
- [ ] No tests skipped or disabled
- [ ] Implementation satisfies acceptance criteria

## Phase 3: REFACTOR - Improvement
- [ ] Code quality issues identified
- [ ] Refactoring applied incrementally
- [ ] Tests run after each refactoring
- [ ] All tests remain GREEN throughout
- [ ] Code quality metrics improved
- [ ] No duplication introduced

## Phase 4: Validation
- [ ] Full test suite passes
- [ ] Code coverage meets threshold
- [ ] Linting passes
- [ ] Architecture patterns followed
- [ ] RVTM updated with results
- [ ] All acceptance criteria verified

## Phase 5: Completion
- [ ] Task checkbox marked complete
- [ ] File list updated
- [ ] Change log entry added
- [ ] Story file saved
- [ ] Ready for review
```

---

### Story 8: Create TDD Tutorial and Examples
**Priority:** Medium
**Estimate:** 2 days

Create comprehensive documentation and examples.

**Tasks:**
- [ ] Create TDD workflow guide
- [ ] Create red-green-refactor examples
- [ ] Create comparison: traditional vs TDD
- [ ] Create troubleshooting guide
- [ ] Create video/animated demonstration
- [ ] Create quick reference card

**Acceptance Criteria:**
- Tutorial explains red-green-refactor cycle
- Examples show complete TDD workflow
- Comparison highlights benefits
- Troubleshooting covers common issues
- Documentation is clear and actionable
- Reference card fits on one page

**Documentation Structure:**
```
docs/
├── guides/
│   └── tdd-workflow-guide.md           # Complete guide
├── examples/
│   ├── tdd-example-simple.md           # Simple example
│   ├── tdd-example-api.md              # API endpoint example
│   └── tdd-example-refactor.md         # Refactoring example
├── comparisons/
│   └── traditional-vs-tdd.md           # Side-by-side comparison
└── references/
    ├── tdd-quick-reference.md          # One-page reference
    └── tdd-troubleshooting.md          # Common issues
```

---

### Story 9: Integration Testing and Validation
**Priority:** High
**Estimate:** 2 days

Test complete TDD workflow end-to-end.

**Tasks:**
- [ ] Test TDD workflow on sample story
- [ ] Test with different project types
- [ ] Test RVTM integration
- [ ] Test failure scenarios
- [ ] Performance benchmarking
- [ ] Create regression test suite

**Acceptance Criteria:**
- TDD workflow completes successfully
- Tests are generated correctly
- RED-GREEN-REFACTOR cycle works
- RVTM properly updated
- Failure handling works correctly
- Performance acceptable (<10% overhead)
- No regressions in traditional workflow

**Test Scenarios:**
1. Simple feature implementation
2. Bug fix with failing test reproduction
3. Refactoring existing code
4. API endpoint development
5. Database interaction
6. Error handling implementation
7. Performance optimization

---

### Story 10: Update BMAD Documentation
**Priority:** Medium
**Estimate:** 1 day

Update all BMAD documentation to reflect TDD support.

**Tasks:**
- [ ] Update Developer Agent documentation
- [ ] Update workflow documentation
- [ ] Update agent party XML configuration
- [ ] Update CHANGELOG.md
- [ ] Update CONTRIBUTING.md
- [ ] Create migration guide for teams

**Acceptance Criteria:**
- All documentation updated
- TDD workflow documented
- Agent commands explained
- Configuration options documented
- Examples included
- Migration guide available

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Stories:** 1, 2, 7
**Focus:** Core TDD workflow and ATDD integration

**Deliverables:**
- TDD workflow instructions.md
- Enhanced ATDD task
- TDD validation checklist
- Working RED-GREEN-REFACTOR cycle

### Phase 2: Integration (Week 2)
**Stories:** 3, 4, 6
**Focus:** Agent integration and configuration

**Deliverables:**
- Updated Developer Agent commands
- Refactoring step implementation
- TDD configuration in config.yaml
- Configurable TDD behavior

### Phase 3: Enhancement (Week 3)
**Stories:** 5, 8, 9, 10
**Focus:** Context enhancement, docs, and testing

**Deliverables:**
- Enhanced Story Context schema
- Complete documentation suite
- Integration tests
- Updated BMAD documentation

## Success Metrics

### Functional Requirements
- ✅ Tests generated before implementation
- ✅ RED state verified before coding
- ✅ GREEN state achieved through implementation
- ✅ REFACTOR maintains test green state
- ✅ RVTM integration throughout workflow
- ✅ Pure MD/YAML execution (no JS/shell required)

### Quality Metrics
- Test coverage: >90% for TDD workflow
- Test-first compliance: 100%
- Refactor safety: 0% test breakage during refactor
- RVTM traceability: 100%
- Workflow completion time: <20% overhead vs traditional

### Adoption Metrics
- Developer understanding: >90% in surveys
- TDD mode usage: >70% of new stories
- Test quality improvement: Measurable via coverage
- Bug escape rate: Reduction vs traditional

## Technical Approach

### Pattern: Reuse Existing ATDD Infrastructure

Unlike Tech Writer and RVTM transitions which required creating new components, this epic REUSES existing infrastructure:

1. **ATDD Task Already Exists**: `/bmad/bmm/testarch/atdd.md` is complete
2. **TEA Agent Already Exists**: Has test generation capabilities
3. **Knowledge Base Already Exists**: TEA knowledge patterns documented
4. **RVTM Already Integrated**: Test registration working

**We Only Need To:**
1. Reorder workflow steps
2. Invoke ATDD task at right time
3. Add refactor step
4. Create TDD variant of workflow

### Integration Pattern

```xml
<!-- Old Flow (Code First) -->
<step n="2">Implement</step>
<step n="3">Write tests</step>
<step n="4">Run tests</step>

<!-- New Flow (Test First) -->
<step n="2">Generate failing tests (RED)</step>
<step n="3">Implement to pass tests (GREEN)</step>
<step n="4">Refactor while keeping tests green (REFACTOR)</step>
<step n="5">Validate</step>
```

### Key Difference from Previous Epics

| Aspect | Tech Writer Epic | RVTM Epic | This Epic |
|--------|-----------------|-----------|-----------|
| **Goal** | Convert shell scripts to MD/YAML | Create new traceability system | Reorder existing workflow |
| **Scope** | Large (new architecture) | Large (new system) | Medium (integrate existing) |
| **New Components** | Many | Many | Few |
| **Existing Assets** | Templates only | None | ATDD, TEA, RVTM |
| **Complexity** | High | High | Medium |
| **Risk** | Medium | Medium | Low |

## Risks and Mitigations

### Risk 1: Developer Learning Curve
**Risk:** Developers unfamiliar with TDD may resist
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Make TDD opt-in initially (via config or command choice)
- Provide excellent documentation and examples
- Show clear benefits (fewer bugs, better design)
- Support both traditional and TDD workflows

### Risk 2: Workflow Performance
**Risk:** Extra test generation step may slow workflow
**Likelihood:** Low
**Impact:** Low
**Mitigation:**
- ATDD task already performant (RVTM uses it)
- Test generation is one-time per task
- Parallel test execution where possible
- Cache test templates

### Risk 3: Test Quality Variance
**Risk:** Generated tests may not always be high quality
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- TEA knowledge base defines patterns
- Story Context provides acceptance criteria
- Developer reviews tests in RED phase
- Validation checklist catches issues

### Risk 4: Breaking Traditional Workflow
**Risk:** Changes might affect existing non-TDD workflow
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Create separate TDD workflow (don't modify existing)
- Maintain backward compatibility
- Comprehensive testing of both workflows
- Gradual rollout with opt-in

## Dependencies

### Technical Dependencies
- BMAD Core workflow execution engine
- Existing ATDD task (`bmad/bmm/testarch/atdd.md`)
- TEA agent and knowledge base
- RVTM system
- Story Context JSON

### Process Dependencies
- Story Context generation must include acceptance criteria
- Developers must understand red-green-refactor
- Test execution infrastructure must be available

## Definition of Done

### Epic Complete When:
- [ ] TDD workflow instructions created and tested
- [ ] ATDD task enhanced for per-task operation
- [ ] Developer Agent commands updated
- [ ] Refactoring step implemented with verification
- [ ] Story Context enhanced with test strategy
- [ ] Configuration options added
- [ ] Validation checklist created
- [ ] Documentation complete
- [ ] Integration tests passing
- [ ] BMAD docs updated
- [ ] Both traditional AND TDD workflows working

### Key Deliverables:
- [ ] `/bmad/bmm/workflows/4-implementation/dev-story-tdd/instructions.md`
- [ ] `/bmad/bmm/workflows/4-implementation/dev-story-tdd/workflow.yaml`
- [ ] `/bmad/bmm/workflows/4-implementation/dev-story-tdd/checklist.md`
- [ ] Updated `/bmad/bmm/agents/dev.md` with `*develop-tdd` command
- [ ] Enhanced ATDD task with per-task support
- [ ] Updated config.yaml with TDD settings
- [ ] Complete documentation suite

## Notes for Implementers

### Best Practices
1. **Don't Break Traditional Workflow**: Create new TDD workflow, don't modify existing
2. **Reuse ATDD Infrastructure**: Don't recreate what exists
3. **Follow RVTM/Tech Writer Patterns**: Use same XML/MD patterns
4. **Test Both Workflows**: Ensure traditional workflow still works
5. **Make TDD Opt-In**: Don't force change on users

### Reference Implementations
- ATDD task: `/bmad/bmm/testarch/atdd.md`
- TEA knowledge: `/bmad/bmm/testarch/tea-knowledge.md`
- Current dev workflow: `/bmad/bmm/workflows/4-implementation/dev-story/instructions.md`
- RVTM integration: `/bmad/core/tasks/rvtm/*.md`

### Testing Strategy
1. Create sample story with clear acceptance criteria
2. Run TDD workflow end-to-end
3. Verify RED-GREEN-REFACTOR cycle
4. Validate RVTM integration
5. Test traditional workflow still works
6. Performance benchmark both workflows

## Related Documents
- `/bmad/bmm/testarch/atdd.md` - Existing ATDD workflow
- `/bmad/bmm/agents/tea.md` - Test Architect agent
- `/bmad/bmm/workflows/4-implementation/dev-story/instructions.md` - Current workflow
- `/docs/epics/tech-writer-md-yaml-transition.md` - Similar transition epic
- `/docs/epics/rvtm-implementation-epic.md` - RVTM system epic

---

**Epic Status:** Ready for Implementation
**Next Action:** Begin Story 1 - Create TDD Workflow Instructions
**Estimated Total Effort:** ~17 days (~2-3 weeks)
**Key Differentiator:** Leverages existing ATDD infrastructure, lower risk than previous epics