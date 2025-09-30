# TDD Dev Story Workflow

## Overview

The TDD Dev Story workflow implements strict **Test-Driven Development** using the **RED-GREEN-REFACTOR** methodology with automatic **RVTM traceability**. Every feature begins with a failing test that validates acceptance criteria, followed by minimal implementation to pass tests, then refactoring with continuous verification.

## Key Features

### 🔴 RED Phase - Failing Tests First
- Generate comprehensive acceptance tests using ATDD
- Automatically register tests with RVTM (requirement traceability)
- Verify tests FAIL before any implementation (proves tests are valid)
- Tests driven directly from Story Context acceptance criteria

### 🟢 GREEN Phase - Implement to Pass
- Write minimal code to make tests pass
- Run tests iteratively during implementation
- Continue until all tests GREEN
- Implementation guided by test failure messages

### ♻️ REFACTOR Phase - Improve Quality
- Refactor code while keeping tests green
- Apply one change at a time, test after each
- Revert immediately if tests fail
- Improve code quality: DRY, SOLID, clean code

### 📊 RVTM Integration - Automatic Traceability
- Tests registered with requirements upon creation
- Test status updated after execution
- Story completion triggers requirement status updates
- Complete bidirectional traceability maintained automatically
- Stakeholder visibility without manual effort

## Comparison: Traditional vs TDD Workflow

| Aspect | Traditional (dev-story) | TDD (dev-story-tdd) |
|--------|-------------------------|---------------------|
| **Step 1** | Load story | Load story |
| **Step 2** | Plan & implement | Generate failing tests (RED) |
| **Step 3** | Author tests | Implement to pass tests (GREEN) |
| **Step 4** | Run tests | Refactor while keeping green (REFACTOR) |
| **Step 5** | Mark complete | Run comprehensive validation |
| **Step 6** | Story completion | Mark complete & update RVTM |
| **Step 7** | Validation (optional) | Story completion |
| **Step 8** | — | Validation & handoff |
| **Test-First** | ❌ No | ✅ Yes |
| **RVTM Integration** | Manual | Automatic |
| **Refactor Step** | Implicit | Explicit |
| **RED Verification** | N/A | ✅ Required |

## When to Use This Workflow

### ✅ Use TDD Workflow When:
- Quality and reliability are critical
- Requirements are well-defined (acceptance criteria clear)
- Building new features from scratch
- Want comprehensive test coverage
- Need traceability for compliance/audit
- Team is comfortable with test-first approach
- Refactoring safety net desired

### 🤔 Consider Traditional Workflow When:
- Prototyping or exploring solutions
- Requirements are vague or changing rapidly
- Making trivial changes
- Time constraints prevent test-first
- Legacy code without test infrastructure

## Prerequisites

### Required
- **Story Status:** Approved
- **Story Context JSON:** Must contain acceptance criteria
- **ATDD Support:** BMAD test architecture (`bmad/bmm/testarch/atdd.md`)
- **Test Infrastructure:** Project must support test execution

### Optional
- **RVTM Initialized:** `.rvtm/matrix.yaml` exists (gracefully degrades if not)
- **Test Strategy:** Story Context includes test strategy (types, coverage)
- **CI/CD:** Automated test execution pipeline

## Usage

### Via TDD Developer Agent (Ted)

```bash
# Activate Ted
@dev-tdd

# Load story
1  # or *load-story

# Execute TDD workflow
3  # or *develop-tdd
```

### Direct Workflow Invocation

```bash
# From BMad Master or other agent
run-workflow: {project-root}/bmad/bmm/workflows/4-implementation/dev-story-tdd/workflow.yaml
```

### Parameters

```yaml
variables:
  story_path: "path/to/story-001.md"  # Optional: auto-discover if not provided
  run_tests_command: "npm test"       # Optional: auto-infer if not provided
  verify_red_state: true              # Verify tests fail before implementation
  refactor_required: true             # Include explicit refactor step
  run_until_complete: true            # Run all tasks without pausing
```

## Workflow Steps Detail

### Step 1: Load Story
- Auto-discover or select story file
- Parse all sections including acceptance criteria
- Load Story Context JSON (authoritative source)
- Check RVTM status if available

### Step 2: RED Phase
- Extract acceptance criteria for current task
- Invoke ATDD task to generate failing tests
- Tests automatically registered with RVTM
- Verify tests FAIL (proves they're valid)
- Log RED phase complete

### Step 3: GREEN Phase
- Implement code to pass failing tests
- Follow "simplest implementation" principle
- Run tests iteratively
- Continue until all GREEN
- Log GREEN phase complete

### Step 4: REFACTOR Phase
- Identify code quality improvements
- Apply refactoring incrementally
- Run tests after EACH change
- Revert if tests fail, continue if green
- Ensure quality metrics improve
- Log REFACTOR phase complete

### Step 5: Comprehensive Validation
- Run full test suite (not just new tests)
- Execute linting and quality checks
- Validate acceptance criteria satisfied
- Capture test results for RVTM

### Step 6: Task Completion
- Mark task complete in story file
- Update File List and Change Log
- Update RVTM with test results
- Display summary with traceability

### Step 7: Story Completion
- Verify all tasks complete
- Run final regression suite
- Update story status to "Ready for Review"
- Mark story complete in RVTM
- Generate final TDD summary report

### Step 8: Validation (Optional)
- Run workflow validation
- Check against TDD checklist
- Prepare handoff summary

## RVTM Integration Points

### Automatic Updates (Non-Blocking)

1. **Test Generation (Step 2):**
   - Tests registered in `.rvtm/matrix.yaml`
   - Linked to story requirements
   - Status: `pending`

2. **Test Execution (Step 5):**
   - Test status updated: `passed` or `failed`
   - Execution timestamps recorded
   - Coverage metrics calculated

3. **Story Completion (Step 7):**
   - Story marked `completed`
   - Requirements updated to `implemented`
   - Final coverage report generated

### Graceful Degradation
- If RVTM not initialized: log warning, continue workflow
- If RVTM update fails: log error, continue workflow
- Traceability important but not blocking

## Test Strategy

### From Story Context
```json
{
  "testStrategy": {
    "approach": "ATDD",
    "requiredTypes": ["unit", "integration"],
    "coverageThreshold": 90,
    "patterns": ["AAA", "Given-When-Then"],
    "taskTestRequirements": {
      "task-1": {
        "testTypes": ["unit"],
        "minCoverage": 85
      }
    }
  }
}
```

### Test Generation
- ATDD task reads test strategy from Story Context
- Generates appropriate test types per task
- Follows TEA knowledge patterns
- One test = one concern = one AC

## Quality Gates

### RED Phase Gates
- ✅ Tests generated for all ACs
- ✅ Tests follow TEA patterns
- ✅ Tests FAIL before implementation
- ✅ Tests registered in RVTM

### GREEN Phase Gates
- ✅ All tests PASS
- ✅ No tests skipped/disabled
- ✅ Acceptance criteria satisfied
- ✅ No regressions introduced

### REFACTOR Phase Gates
- ✅ Tests stay GREEN throughout
- ✅ Code quality improved
- ✅ No new complexity/duplication
- ✅ Architecture patterns maintained

### Story Completion Gates
- ✅ All tasks complete
- ✅ Full regression suite passing
- ✅ RVTM traceability complete
- ✅ Ready for review

## Benefits

### Development Quality
- **Test-First Design:** Better architecture, more testable code
- **Comprehensive Coverage:** All ACs have tests
- **Regression Safety:** Tests protect against future breaks
- **Refactoring Confidence:** Change code without fear

### Traceability & Compliance
- **Automatic:** No manual traceability effort
- **Real-Time:** Stakeholders see current status
- **Complete:** Requirements → Tests → Implementation
- **Auditable:** Full history in RVTM

### Team Efficiency
- **Clear Expectations:** Tests define "done"
- **Faster Debugging:** Test failures pinpoint issues
- **Better Documentation:** Tests document behavior
- **Reduced Rework:** Catch issues before review

## Troubleshooting

### Tests Won't Fail (RED Phase)
**Problem:** Tests pass without implementation
**Solution:** Review test assertions, ensure they check actual behavior

### Tests Keep Failing (GREEN Phase)
**Problem:** Can't get tests to pass after multiple attempts
**Solution:** Review test expectations vs requirements, may need AC clarification

### Tests Break During Refactor
**Problem:** Refactoring causes test failures
**Solution:** Revert immediately, workflow handles this automatically

### RVTM Updates Fail
**Problem:** Cannot update RVTM matrix
**Solution:** Check `.rvtm/matrix.yaml` exists and is writable, or ignore if not using RVTM

### Coverage Gaps
**Problem:** Some requirements have no tests
**Solution:** Review test generation, ensure all ACs mapped to tests

## Best Practices

### Before Starting
1. Ensure story Status == 'Approved'
2. Verify Story Context has clear acceptance criteria
3. Check test infrastructure is working
4. Review test strategy if provided

### During RED Phase
1. Read each test to ensure it tests the right thing
2. Verify tests fail for the right reason
3. Check test failure messages are clear
4. Confirm RVTM registration successful

### During GREEN Phase
1. Implement simplest solution that passes tests
2. Don't add features not required by tests
3. Run tests frequently during implementation
4. Follow architecture patterns from Story Context

### During REFACTOR Phase
1. One refactoring at a time
2. Test after every single change
3. Revert immediately if tests fail
4. Focus on readability and maintainability

### After Completion
1. Review RVTM traceability status
2. Verify all tasks and ACs satisfied
3. Check coverage metrics
4. Confirm ready for review

## Files in This Workflow

```
dev-story-tdd/
├── workflow.yaml           # Workflow configuration
├── instructions.md         # Detailed step-by-step instructions
├── checklist.md           # Comprehensive validation checklist
└── README.md              # This file
```

## Related Documentation

- **TDD Epic:** `/docs/epics/dev-agent-atdd-enhancement.md`
- **ATDD Task:** `/bmad/bmm/testarch/atdd.md`
- **TEA Knowledge:** `/bmad/bmm/testarch/tea-knowledge.md`
- **RVTM Tasks:** `/bmad/core/tasks/rvtm/*.md`
- **Dev Agent (Traditional):** `/bmad/bmm/agents/dev.md`
- **TDD Dev Agent (Ted):** `/bmad/bmm/agents/dev-tdd.md`

## Version History

- **v1.0.0** (2025-09-30)
  - Initial TDD workflow implementation
  - RED-GREEN-REFACTOR methodology
  - Automatic RVTM traceability
  - Based on dev-story workflow v6
  - Part of BMAD v6 TDD Enhancement Epic

## Support

For issues or questions:
- Review this README and checklist
- Check Epic: `/docs/epics/dev-agent-atdd-enhancement.md`
- Test with simple stories first
- Verify ATDD task working independently
- Consult TEA knowledge base

---

**Created:** 2025-09-30
**Agent:** Ted (TDD Developer Agent)
**Module:** BMM (BMAD Method Management)
**Part of:** BMAD v6 TDD Enhancement Epic