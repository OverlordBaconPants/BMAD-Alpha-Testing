# Tech Writer Architecture Comparison: Shell Scripts vs MD/YAML

**Created:** 2025-09-30
**Purpose:** Illustrate the architectural transition for Tech Writer functionality

---

## Overview

This document compares the current shell-script-based Tech Writer implementation with the target MD/YAML-based architecture, using the successful RVTM transition as a model.

## Current Architecture (Shell Script Based)

### Flow Diagram
```
User Command
    ↓
tech-writer (bash CLI)
    ↓
.commands/generate-readme.sh (shell wrapper)
    ↓
Python YAML parser
    ↓
workflows/generate-readme/workflow.yaml (data only)
    ↓
(Execution logic unclear - depends on external engine)
```

### Component Breakdown

#### 1. Entry Point: Bash CLI
**File:** `/bmad/bmm/tech-writer`
```bash
#!/bin/bash
case "$1" in
    readme)
        "$SCRIPT_DIR/.commands/generate-readme.sh" "$@"
        ;;
    api)
        "$SCRIPT_DIR/.commands/generate-api-docs.sh" "$@"
        ;;
esac
```

**Issues:**
- Requires bash execution
- Platform-dependent
- Hard to debug
- Not AI-friendly

#### 2. Command Wrapper: Shell Scripts
**File:** `/bmad/bmm/.commands/generate-readme.sh`
```bash
#!/bin/bash
workflow_path="/path/to/workflow.yaml"
python3 -c "
import yaml
# ... Python code to parse and execute ...
"
```

**Issues:**
- Mixes bash and Python
- Workflow execution logic unclear
- Requires Python interpreter
- Cannot be executed directly by Claude

#### 3. Workflow Definition: YAML Only
**File:** `/bmad/bmm/workflows/generate-readme/workflow.yaml`
```yaml
name: generate-readme
description: Generate README
phases:
  - name: Analysis
    steps:
      - id: scan_codebase
        task: analyze-code  # <-- Where is this defined?
```

**Issues:**
- No execution instructions
- Task references are abstract
- No step-by-step guidance
- Requires external engine to interpret

---

## Target Architecture (MD/YAML Based)

### Flow Diagram
```
User Command
    ↓
tech-writer.md (agent definition)
    ↓
instructions.md (step-by-step execution)
    ↓
├── invoke-task: analyze-codebase.md
├── invoke-task: detect-project-type.md
├── invoke-task: generate-section.md
└── invoke-task: validate-documentation.md
    ↓
Output: Generated Documentation
```

### Component Breakdown

#### 1. Entry Point: Agent Definition
**File:** `/bmad/bmm/agents/tech-writer.md`
```xml
<c cmd="*generate-readme"
   run-workflow="{project-root}/bmad/bmm/workflows/generate-readme/instructions.md">
  Generate comprehensive project README
</c>
```

**Benefits:**
- Declarative, not imperative
- Direct reference to instructions
- No shell script execution
- Claude can interpret directly

#### 2. Workflow Instructions: Markdown
**File:** `/bmad/bmm/workflows/generate-readme/instructions.md`
```xml
<instructions>
  <context>
    Generate comprehensive README documentation by analyzing project structure,
    detecting project type, and generating appropriate content sections.
  </context>

  <variables>
    <var name="project_root" required="true"/>
    <var name="output_folder" default="{project-root}"/>
    <var name="reading_level" default="8"/>
  </variables>

  <flow>
    <step n="1" goal="Analyze project structure">
      <action>
        Invoke the codebase analysis task:
        <invoke-task path="bmad/core/tasks/tech-writer/analyze-codebase.md">
          <param name="project_root">{project-root}</param>
          <param name="output_format">yaml</param>
        </invoke-task>
      </action>

      <validation>
        Verify analysis output contains:
        - languages: List of programming languages
        - frameworks: Detected frameworks
        - entry_points: Main executable files
        - dependencies: Package dependencies
      </validation>

      <output>
        Store analysis results in variable: analysis_result
      </output>
    </step>

    <step n="2" goal="Detect project type">
      <action>
        Invoke project type detection:
        <invoke-task path="bmad/core/tasks/tech-writer/detect-project-type.md">
          <param name="analysis">{analysis_result}</param>
        </invoke-task>
      </action>

      <output>
        Project type detected: {project_type}
        (e.g., "api", "frontend", "cli", "library")
      </output>
    </step>

    <step n="3" goal="Generate README sections">
      <action>
        For each required section, generate content:

        1. Header and badges
        2. Overview
        3. Features
        4. Installation
        5. Usage
        6. API Reference (if type=api)
        7. Project Structure
        8. Contributing
        9. License

        Use generate-section task for each:
        <invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
          <param name="section_type">{section_name}</param>
          <param name="project_type">{project_type}</param>
          <param name="analysis">{analysis_result}</param>
          <param name="reading_level">{reading_level}</param>
        </invoke-task>
      </action>
    </step>

    <step n="4" goal="Validate documentation">
      <action>
        Validate generated README:
        <invoke-task path="bmad/core/tasks/tech-writer/validate-documentation.md">
          <param name="document">{generated_readme}</param>
          <param name="type">readme</param>
        </invoke-task>
      </action>

      <output>
        Validation report:
        - Completeness: {score}%
        - Reading level: Grade {level}
        - Missing sections: {list}
      </output>
    </step>

    <step n="5" goal="Save README file">
      <action>
        Write README to: {output_folder}/README.md
        Create backup if file exists
      </action>

      <output>
        ✅ README generated: {output_folder}/README.md
      </output>
    </step>
  </flow>

  <validation-checklist>
    - [ ] Project structure analyzed
    - [ ] Project type detected
    - [ ] All sections generated
    - [ ] Documentation validated
    - [ ] README file saved
    - [ ] Quality score > 90%
  </validation-checklist>
</instructions>
```

**Benefits:**
- Complete execution logic in readable format
- Clear step-by-step process
- Claude can follow instructions directly
- Easy to modify and extend
- Self-documenting

#### 3. Reusable Tasks: Markdown
**File:** `/bmad/core/tasks/tech-writer/analyze-codebase.md`
```markdown
# Task: Analyze Codebase

## Purpose
Analyze project structure and extract metadata for documentation generation.

## Parameters
- `project_root` (required): Path to project directory
- `output_format` (optional): yaml|json (default: yaml)

## Execution

### Step 1: Scan Directory Structure
1. List all files in project_root recursively
2. Ignore common exclusions:
   - node_modules, __pycache__, .git, dist, build
3. Categorize files by extension

### Step 2: Detect Languages
1. Count files by extension
2. Identify primary language (highest file count)
3. List all languages present

### Step 3: Detect Frameworks
1. Check for framework indicators:
   - package.json → Node.js (check dependencies)
   - requirements.txt → Python (check for flask/django/fastapi)
   - go.mod → Go
   - Cargo.toml → Rust
2. Parse package files for framework names

### Step 4: Find Entry Points
1. Look for main files:
   - main.py, app.py, index.js, server.js
   - main.go, cmd/main.go
   - src/main.rs
2. Check package.json scripts.start

### Step 5: Extract Dependencies
1. Parse dependency files:
   - package.json → dependencies + devDependencies
   - requirements.txt → pip packages
   - go.mod → go modules
2. Group by type (runtime, dev, test)

## Output Format

```yaml
analysis:
  project_root: "/path/to/project"
  timestamp: "2025-09-30T10:00:00Z"

  languages:
    - name: "JavaScript"
      files: 45
      primary: true
    - name: "Python"
      files: 12
      primary: false

  frameworks:
    - "Express.js"
    - "React"

  entry_points:
    - "src/index.js"
    - "server.js"

  dependencies:
    runtime:
      - express: "^4.18.0"
      - react: "^18.2.0"
    dev:
      - jest: "^29.0.0"

  structure:
    total_files: 57
    total_dirs: 12
    lines_of_code: 5420
```

## Error Handling
- If project_root doesn't exist: Return error message
- If no files found: Return minimal analysis
- If parsing fails: Skip that section, continue with others
```

**Benefits:**
- Self-contained task definition
- Clear inputs and outputs
- Step-by-step execution logic
- Reusable across workflows
- No code execution needed

#### 4. Workflow Metadata: YAML (Enhanced)
**File:** `/bmad/bmm/workflows/generate-readme/workflow.yaml`
```yaml
name: generate-readme
description: Generate comprehensive README documentation
version: 2.0.0
author: Tech Writer Agent
type: documentation
tags: [readme, documentation, automation]

metadata:
  execution_type: markdown_instructions
  instruction_file: instructions.md
  estimated_time: "30s"

inputs:
  required:
    - project_root
  optional:
    - output_folder
    - reading_level
    - include_badges
    - include_diagrams

outputs:
  - readme_path
  - validation_report
  - generation_time

tasks_used:
  - bmad/core/tasks/tech-writer/analyze-codebase.md
  - bmad/core/tasks/tech-writer/detect-project-type.md
  - bmad/core/tasks/tech-writer/generate-section.md
  - bmad/core/tasks/tech-writer/validate-documentation.md

success_criteria:
  - readme_file_created: true
  - validation_score: ">90%"
  - all_sections_present: true
```

**Benefits:**
- Clear metadata and expectations
- Lists all dependencies
- Defines success criteria
- References instruction file

---

## Side-by-Side Comparison

| Aspect | Current (Shell) | Target (MD/YAML) |
|--------|----------------|------------------|
| **Entry Point** | Bash script | Agent MD definition |
| **Execution Logic** | Shell + Python mix | Markdown instructions |
| **Task Definitions** | Abstract references | Concrete MD files |
| **Workflow Data** | YAML only | YAML + MD instructions |
| **Claude Execution** | ❌ Cannot execute | ✅ Can execute directly |
| **Debugging** | Difficult (shell logs) | Easy (follow MD steps) |
| **Maintainability** | Low (multiple languages) | High (all readable text) |
| **Portability** | Platform-dependent | Platform-independent |
| **Testability** | Requires shell environment | Can test with MD parsing |
| **Version Control** | Mix of scripts | All text files |
| **Documentation** | Separate from code | Self-documenting |

---

## Transition Example: README Generation

### Before (Current)
```bash
# User runs:
$ ./bmad/bmm/tech-writer readme /my/project

# Execution flow:
tech-writer (bash)
  → .commands/generate-readme.sh (shell)
    → python3 -c "import yaml..." (Python)
      → workflow.yaml loaded (YAML)
        → ??? (unclear execution)
          → Output (maybe?)
```

### After (Target)
```bash
# User invokes through agent:
> *generate-readme

# Execution flow:
tech-writer.md (agent command)
  → instructions.md (step 1: analyze)
    → analyze-codebase.md (task)
      → [Claude follows instructions]
        → Output: analysis.yaml
  → instructions.md (step 2: detect type)
    → detect-project-type.md (task)
      → [Claude follows instructions]
        → Output: project_type
  → instructions.md (step 3: generate)
    → generate-section.md (task) x N sections
      → [Claude follows instructions]
        → Output: README content
  → instructions.md (step 4: validate)
    → validate-documentation.md (task)
      → [Claude follows instructions]
        → Output: validation report
  → instructions.md (step 5: save)
    → [Claude writes file]
      → Output: README.md
```

**Key Differences:**
1. No shell script execution
2. No Python interpreter needed
3. Clear step-by-step process
4. Claude executes directly
5. All logic visible and debuggable

---

## Benefits Summary

### For Developers
1. **Easier to Understand**: All logic in readable text
2. **Easier to Modify**: Edit MD files, not shell scripts
3. **Easier to Debug**: Follow steps in instructions.md
4. **Better Version Control**: Git diffs are meaningful

### For Claude
1. **Direct Execution**: Can follow MD instructions natively
2. **No External Dependencies**: No shell/Python/Node execution
3. **Clear Context**: Each task is self-contained
4. **Error Recovery**: Can understand and retry failed steps

### For BMAD
1. **Architectural Consistency**: All agents follow same pattern
2. **Reduced Complexity**: Fewer moving parts
3. **Improved Maintainability**: Single paradigm across system
4. **Better Documentation**: Logic is self-documenting

---

## Migration Strategy

### Phase 1: Core Tasks
Create reusable task definitions that replace shell script logic:
- `analyze-codebase.md` → Replaces file scanning logic
- `detect-project-type.md` → Replaces project classification
- `generate-section.md` → Replaces content generation
- `validate-documentation.md` → Replaces validation logic

### Phase 2: Instruction Files
Create instructions.md files that orchestrate tasks:
- `generate-readme/instructions.md` → Replaces generate-readme.sh
- `generate-api-docs/instructions.md` → Replaces generate-api-docs.sh

### Phase 3: Agent Update
Update agent definition to reference new instructions:
- Change `run-workflow` from "todo" to instruction file path
- Remove any shell script references

### Phase 4: Cleanup
Remove obsolete files:
- Delete `tech-writer` bash script
- Delete `.commands/*.sh` files
- Update any documentation

---

## Success Criteria

### Functional Parity
- ✅ All current features work with MD/YAML only
- ✅ No degradation in output quality
- ✅ Performance is acceptable (within 2x of current)

### Architectural Goals
- ✅ Zero shell script execution
- ✅ Zero JavaScript execution for core workflows
- ✅ Claude can execute end-to-end
- ✅ All logic in version-controlled text files

### Quality Improvements
- ✅ Better error messages (from instruction steps)
- ✅ Clearer debugging (follow MD steps)
- ✅ Self-documenting (instructions are documentation)

---

## Conclusion

The transition from shell scripts to MD/YAML for Tech Writer follows the proven pattern from RVTM migration. By moving all execution logic into readable Markdown instructions and reusable task definitions, we create a system that is:

1. **More Maintainable**: All logic in text files
2. **AI-Native**: Claude can execute directly
3. **Self-Documenting**: Instructions serve as documentation
4. **Architecturally Consistent**: Matches other BMAD components
5. **Platform-Independent**: No shell script dependencies

The result is a documentation system that truly embodies "BMAD Method can create artifacts without using JavaScript files" — pure AI-driven documentation generation through readable instructions.

---

**Next Steps:**
1. Review this comparison document
2. Approve the Epic plan
3. Begin implementation with Story 1 (Core Tasks)
4. Test incrementally as each component is completed