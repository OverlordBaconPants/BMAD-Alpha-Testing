# Initialize RVTM - Workflow Instructions

```xml
<critical>The workflow execution engine is governed by: {project_root}/bmad/core/tasks/workflow.md</critical>
<critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
<critical>This workflow initializes RVTM structure for requirement traceability.</critical>

<workflow>

  <step n="1" goal="Check for existing RVTM">
    <check>If .rvtm/ directory already exists:</check>
    <action>Display warning: "RVTM already initialized. Run *reinit-rvtm to reinitialize (will backup existing)."</action>
    <action>HALT workflow - do not proceed</action>
  </step>

  <step n="2" goal="Initialize RVTM structure">
    <action>Initialize RVTM directory structure and matrix:

<invoke-task path="bmad/core/tasks/rvtm/init-rvtm.md">
  <param name="project_root">{{project_root}}</param>
  <param name="prd_file">{{prd_file}}</param>
</invoke-task>

This will:
- Create .rvtm/ directory structure
- Initialize matrix.yaml with schema
- Generate README.md documentation
- Create .gitignore for RVTM files
- Optionally extract requirements from PRD if provided
</action>

    <validation>
Verify RVTM initialized successfully:
- .rvtm/ directory exists
- matrix.yaml exists with valid YAML structure
- README.md present
- .gitignore created
</validation>

    <output>
Display initialization summary:
```
✅ RVTM Initialized Successfully

Created:
  📁 .rvtm/
  📄 matrix.yaml
  📄 README.md
  📄 .gitignore

Project: {{project_name}}
Status: Ready for requirement tracking

{{If PRD provided:}}
📊 Extracted {{requirement_count}} requirements from PRD

Next steps:
  1. Create stories and link to requirements
  2. Write tests and register with RVTM
  3. Track progress in matrix.yaml
  4. Generate reports with *rvtm-report
```
</output>
  </step>

  <step n="3" goal="Display quick start guide">
    <action>Show quick start information:

```
📖 RVTM Quick Start Guide

Automatic Integration:
  • Run *plan → Requirements auto-extracted from PRD
  • Run *create-story → Stories auto-linked to requirements
  • Run *dev-story → Status auto-updated on completion

Manual Commands (if needed):
  • Extract requirements: Invoke extract-requirements task
  • Link story: Invoke link-story-requirements task
  • Register test: Invoke register-tests task
  • Update status: Invoke update-story-status task

Documentation:
  • Read .rvtm/README.md for matrix structure
  • See bmad/core/tasks/rvtm/ for task instructions
  • Check docs/rvtm-* for architecture details

RVTM uses pure MD/YAML - no dependencies required! ✨
```
</action>
  </step>

</workflow>
```