# Tech Writer Transition Roadmap

**Status:** Ready to Execute
**Created:** 2025-09-30
**Owner:** Overlord BaconPants

---

## Quick Start Guide

This roadmap provides a practical, step-by-step guide to transitioning Tech Writer from shell scripts to MD/YAML architecture.

## Week 1: Foundation

### Day 1-2: Core Analysis Tasks
**Goal:** Create tasks for project analysis and classification

**Create Files:**
1. `/bmad/core/tasks/tech-writer/analyze-codebase.md`
   - Scan project structure
   - Detect languages and frameworks
   - Find entry points
   - Extract dependencies

2. `/bmad/core/tasks/tech-writer/detect-project-type.md`
   - Classify project as: api, frontend, cli, library, etc.
   - Based on framework detection and structure

**Success Check:**
- [ ] Task files created with clear instructions
- [ ] Sample execution produces expected output format
- [ ] Error handling documented

---

### Day 3: Content Generation Tasks
**Goal:** Create tasks for documentation content generation

**Create Files:**
1. `/bmad/core/tasks/tech-writer/generate-section.md`
   - Generate README sections (overview, features, installation, etc.)
   - Support multiple section types
   - Adjust for reading level

2. `/bmad/core/tasks/tech-writer/extract-api-endpoints.md`
   - Parse code for API routes
   - Support Express, FastAPI, Rails, etc.
   - Extract request/response formats

**Success Check:**
- [ ] Can generate different section types
- [ ] Output quality is good
- [ ] Works with different project types

---

### Day 4: Validation and Diagram Tasks
**Goal:** Create quality assurance tasks

**Create Files:**
1. `/bmad/core/tasks/tech-writer/validate-documentation.md`
   - Check completeness
   - Validate links
   - Analyze reading level
   - Generate quality report

2. `/bmad/core/tasks/tech-writer/create-diagrams.md`
   - Generate Mermaid diagrams
   - Architecture diagrams (C4)
   - Data flow diagrams

**Success Check:**
- [ ] Validation produces actionable feedback
- [ ] Diagrams render correctly
- [ ] Quality scores are meaningful

---

### Day 5: Schema Definitions
**Goal:** Create data structure schemas

**Create Files:**
1. `/bmad/core/lib/tech-writer/schema/doc-metadata-schema.yaml`
   ```yaml
   documentation:
     title: string
     version: string
     type: enum [readme, api, guide, architecture]
     created: timestamp
     updated: timestamp
     author: string
     coverage:
       completeness: percentage
       sections:
         - name: string
           status: enum [complete, partial, missing]
           quality_score: percentage
   ```

2. `/bmad/core/lib/tech-writer/schema/validation-rules-schema.yaml`
   ```yaml
   validation_rules:
     readme:
       required_sections:
         - Overview
         - Installation
         - Usage
       min_quality_score: 90
       max_reading_level: 10
     api:
       required_sections:
         - Authentication
         - Endpoints
         - Error Codes
       completeness_threshold: 95
   ```

**Success Check:**
- [ ] Schemas are well-documented
- [ ] Cover all documentation types
- [ ] Can be parsed and validated

---

## Week 2: Primary Workflows

### Day 6-7: README Generation Workflow
**Goal:** Complete README generation without shell scripts

**Create Files:**
1. `/bmad/bmm/workflows/generate-readme/instructions.md`

**Structure:**
```xml
<instructions>
  <context>README generation workflow</context>

  <variables>
    <var name="project_root" required="true"/>
    <var name="output_folder" default="{project-root}"/>
    <var name="reading_level" default="8"/>
  </variables>

  <flow>
    <step n="1" goal="Analyze project">
      <action>Invoke analyze-codebase task</action>
      <validation>Verify analysis complete</validation>
    </step>

    <step n="2" goal="Detect project type">
      <action>Invoke detect-project-type task</action>
    </step>

    <step n="3" goal="Generate sections">
      <action>Loop through sections, invoke generate-section</action>
    </step>

    <step n="4" goal="Validate README">
      <action>Invoke validate-documentation task</action>
    </step>

    <step n="5" goal="Save file">
      <action>Write to {output_folder}/README.md</action>
    </step>
  </flow>
</instructions>
```

2. Update `/bmad/bmm/workflows/generate-readme/workflow.yaml` (add metadata)

**Test:**
- [ ] Generate README for Node.js project
- [ ] Generate README for Python project
- [ ] Generate README for Go project
- [ ] Quality score > 90%

---

### Day 8-9: API Documentation Workflow
**Goal:** Complete API docs generation without shell scripts

**Create Files:**
1. `/bmad/bmm/workflows/generate-api-docs/instructions.md`

**Key Steps:**
1. Analyze codebase
2. Extract API endpoints
3. Detect authentication methods
4. Generate endpoint documentation
5. Create request/response examples
6. Generate OpenAPI spec (if needed)
7. Validate completeness

2. `/bmad/bmm/templates/api-docs-template.md` (if needed)

**Test:**
- [ ] Document Express.js API
- [ ] Document FastAPI API
- [ ] Generate OpenAPI spec
- [ ] Create Postman collection data

---

### Day 10: Update Agent Definition
**Goal:** Connect agent to new workflows

**Update File:**
`/bmad/bmm/agents/tech-writer.md`

**Changes:**
```xml
<!-- FROM: -->
<c cmd="*generate-readme" run-workflow="todo">

<!-- TO: -->
<c cmd="*generate-readme"
   run-workflow="{project-root}/bmad/bmm/workflows/generate-readme/instructions.md">


<!-- FROM: -->
<c cmd="*generate-api-docs" run-workflow="todo">

<!-- TO: -->
<c cmd="*generate-api-docs"
   run-workflow="{project-root}/bmad/bmm/workflows/generate-api-docs/instructions.md">
```

**Test:**
- [ ] Agent command invokes correct workflow
- [ ] Parameters passed correctly
- [ ] Output is as expected

---

## Week 3: Extended Features & Cleanup

### Day 11-12: User Guide Workflow
**Goal:** Add user guide generation

**Create Files:**
1. `/bmad/bmm/workflows/generate-user-guide/workflow.yaml`
2. `/bmad/bmm/workflows/generate-user-guide/instructions.md`
3. `/bmad/bmm/templates/user-guide-template.md`

**Features:**
- Progressive disclosure (beginner → advanced)
- Tutorial-style content
- FAQ section
- Troubleshooting guide

---

### Day 13-14: Architecture Documentation Workflow
**Goal:** Add architecture docs generation

**Create Files:**
1. `/bmad/bmm/workflows/generate-architecture/workflow.yaml`
2. `/bmad/bmm/workflows/generate-architecture/instructions.md`
3. `/bmad/bmm/templates/architecture-template.md`

**Features:**
- C4 architecture diagrams
- Component descriptions
- Data flow diagrams
- Deployment architecture

---

### Day 15: Remove Shell Scripts
**Goal:** Clean up legacy code

**Delete Files:**
- `/bmad/bmm/tech-writer` (bash CLI)
- `/bmad/bmm/.commands/generate-readme.sh`
- `/bmad/bmm/.commands/generate-api-docs.sh`
- `/bmad/bmm/.commands/analyze-project.sh`
- `/bmad/bmm/.commands/validate-docs.sh`

**Before Deleting:**
- [ ] Verify all functionality works with MD/YAML
- [ ] Run full test suite
- [ ] Backup scripts to archive directory (optional)

---

### Day 16: Testing & Documentation
**Goal:** Comprehensive validation

**Activities:**
1. **Test Suite:**
   - README generation (5+ project types)
   - API documentation (3+ frameworks)
   - User guide generation (2+ project types)
   - Architecture docs (2+ project types)
   - Validation task (all doc types)

2. **Performance Benchmarks:**
   - Measure generation time for each workflow
   - Compare with previous implementation
   - Document any performance differences

3. **Documentation:**
   - Update BMAD documentation
   - Create migration guide
   - Write troubleshooting guide

**Deliverables:**
- [ ] All tests passing
- [ ] Performance benchmarks documented
- [ ] User documentation complete

---

## Implementation Checklist

### Foundation (Week 1)
- [ ] analyze-codebase.md created
- [ ] detect-project-type.md created
- [ ] generate-section.md created
- [ ] extract-api-endpoints.md created
- [ ] validate-documentation.md created
- [ ] create-diagrams.md created
- [ ] doc-metadata-schema.yaml created
- [ ] validation-rules-schema.yaml created

### Primary Workflows (Week 2)
- [ ] README instructions.md created
- [ ] README workflow tested on 3+ project types
- [ ] API docs instructions.md created
- [ ] API docs workflow tested on 2+ frameworks
- [ ] Agent definition updated
- [ ] Agent commands tested

### Extended Features (Week 3)
- [ ] User guide workflow created and tested
- [ ] Architecture workflow created and tested
- [ ] Shell scripts removed
- [ ] Full test suite passing
- [ ] Documentation updated

---

## Quick Reference: File Structure

```
bmad/
├── bmm/
│   ├── agents/
│   │   └── tech-writer.md                    ← UPDATE (Week 2, Day 10)
│   ├── workflows/
│   │   ├── generate-readme/
│   │   │   ├── workflow.yaml                 ← UPDATE (Week 2, Day 6)
│   │   │   └── instructions.md               ← CREATE (Week 2, Day 6-7)
│   │   ├── generate-api-docs/
│   │   │   ├── workflow.yaml                 ← UPDATE (Week 2, Day 8)
│   │   │   └── instructions.md               ← CREATE (Week 2, Day 8-9)
│   │   ├── generate-user-guide/
│   │   │   ├── workflow.yaml                 ← CREATE (Week 3, Day 11)
│   │   │   └── instructions.md               ← CREATE (Week 3, Day 11-12)
│   │   └── generate-architecture/
│   │       ├── workflow.yaml                 ← CREATE (Week 3, Day 13)
│   │       └── instructions.md               ← CREATE (Week 3, Day 13-14)
│   ├── templates/
│   │   ├── readme-template.md                ← EXISTS (may enhance)
│   │   ├── api-docs-template.md              ← CREATE (Week 2, Day 8)
│   │   ├── user-guide-template.md            ← CREATE (Week 3, Day 11)
│   │   └── architecture-template.md          ← CREATE (Week 3, Day 13)
│   ├── tech-writer                           ← DELETE (Week 3, Day 15)
│   └── .commands/                            ← DELETE (Week 3, Day 15)
└── core/
    ├── lib/
    │   └── tech-writer/
    │       └── schema/
    │           ├── doc-metadata-schema.yaml       ← CREATE (Week 1, Day 5)
    │           └── validation-rules-schema.yaml   ← CREATE (Week 1, Day 5)
    └── tasks/
        └── tech-writer/
            ├── analyze-codebase.md                ← CREATE (Week 1, Day 1)
            ├── detect-project-type.md             ← CREATE (Week 1, Day 2)
            ├── generate-section.md                ← CREATE (Week 1, Day 3)
            ├── extract-api-endpoints.md           ← CREATE (Week 1, Day 3)
            ├── validate-documentation.md          ← CREATE (Week 1, Day 4)
            └── create-diagrams.md                 ← CREATE (Week 1, Day 4)
```

---

## Testing Strategy

### Unit Testing (Per Task)
For each task file:
1. Read task instructions
2. Execute manually with sample data
3. Verify output format matches expected schema
4. Test error conditions

### Integration Testing (Per Workflow)
For each workflow:
1. Run on sample project
2. Verify all steps complete
3. Check output quality
4. Measure performance

### End-to-End Testing
1. Invoke through agent command
2. Complete full workflow
3. Validate final output
4. User acceptance

---

## Success Metrics

### Week 1 Success
- [ ] All 6 task files created
- [ ] All 2 schema files created
- [ ] Sample execution successful

### Week 2 Success
- [ ] README workflow functional
- [ ] API docs workflow functional
- [ ] Agent commands working
- [ ] No shell script execution needed

### Week 3 Success
- [ ] All 4 workflows complete
- [ ] Shell scripts removed
- [ ] All tests passing
- [ ] Documentation complete

---

## Support Resources

### Reference Implementations
- **RVTM Tasks:** `/bmad/core/tasks/rvtm/*.md`
- **RVTM Workflows:** `/bmad/bmm/workflows/rvtm/*`
- **PRD Workflow:** `/bmad/bmm/workflows/2-plan/prd/instructions-lg.md`

### Documentation
- **Epic Plan:** `/docs/epics/tech-writer-md-yaml-transition.md`
- **Architecture Comparison:** `/docs/tech-writer-architecture-comparison.md`
- **This Roadmap:** `/docs/tech-writer-transition-roadmap.md`

### Getting Help
- Review RVTM implementation patterns
- Check existing workflow structures
- Refer to task templates
- Test incrementally

---

## Risk Mitigation

### If a Task is Complex
- Break it into sub-steps
- Create helper tasks
- Document assumptions
- Add detailed examples

### If Workflow Isn't Working
- Test each step independently
- Check parameter passing
- Verify task output format
- Add debug logging

### If Performance is Slow
- Profile slow steps
- Add caching where appropriate
- Consider parallel execution
- Optimize file scanning

---

## Next Steps

1. **Review Documents:**
   - Read the Epic plan
   - Review Architecture Comparison
   - Understand this roadmap

2. **Start Implementation:**
   - Begin Week 1, Day 1
   - Create first task file
   - Test as you go

3. **Track Progress:**
   - Check off items as completed
   - Update status in Epic document
   - Note any issues or changes

4. **Celebrate Milestones:**
   - End of Week 1: Foundation complete! 🎉
   - End of Week 2: Primary workflows working! 🎉
   - End of Week 3: Full transition complete! 🎉🎉🎉

---

**Status:** Ready to Begin
**Next Action:** Create `/bmad/core/tasks/tech-writer/analyze-codebase.md`
**Estimated Completion:** 3 weeks from start date