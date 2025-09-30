# Generate README - Workflow Instructions

```xml
<critical>The workflow execution engine is governed by: {project_root}/bmad/core/tasks/workflow.md</critical>
<critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
<critical>This workflow generates comprehensive README documentation using pure MD/YAML approach.</critical>

<workflow>

  <step n="1" goal="Analyze project codebase">
    <action>Analyze project structure and extract metadata:

<invoke-task path="bmad/core/tasks/tech-writer/analyze-codebase.md">
  <param name="project_root">{{project_root}}</param>
  <param name="output_format">yaml</param>
  <param name="analysis_depth">standard</param>
</invoke-task>

Store results in {{project_analysis}}
</action>

    <validation>
Verify analysis completed successfully:
- Project name identified
- Project type detected
- Primary language identified
- Key files catalogued
</validation>

    <check>If analysis fails → Continue with manual elicitation</check>
  </step>

  <step n="2" goal="Elicit missing information from user">
    <action>Review {{project_analysis}} for completeness</action>

    <action>If key information is missing or uncertain, ask user:</action>
    <action>  - Project description/purpose (if not obvious from code)</action>
    <action>  - Target audience (developers, end-users, both)</action>
    <action>  - Key features to highlight</action>
    <action>  - License type (if LICENSE file not found)</action>
    <action>  - Contributing guidelines preferences</action>

    <action>Prompt user with specific questions:</action>
    <action>```</action>
    <action>I'm generating a README for {{project_analysis.project_name}}.</action>
    <action>Detected: {{project_analysis.project_type}} in {{project_analysis.primary_language}}</action>
    <action></action>
    <action>Please provide (press Enter to use defaults):</action>
    <action>1. Brief project description: [detected/default]</action>
    <action>2. Key features (comma-separated): [auto-detected]</action>
    <action>3. License type: [{{detected_license or 'MIT'}}]</action>
    <action>```</action>

    <action>Store user responses in {{user_input}}</action>
    <action>Merge with {{project_analysis}} to create {{readme_context}}</action>
  </step>

  <step n="3" goal="Generate Overview section">
    <action>Generate project overview section:

<invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
  <param name="section_name">Overview</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{readme_context}}</param>
  <param name="reading_level">8</param>
  <param name="include_examples">false</param>
</invoke-task>

Store in {{section_overview}}
</action>

    <output>
✓ Generated Overview section ({{section_overview.word_count}} words)
</output>
  </step>

  <step n="4" goal="Generate Features section">
    <action>Create features list based on:</action>
    <action>  - User input from step 2</action>
    <action>  - Project type and detected capabilities</action>
    <action>  - Framework features (if applicable)</action>

    <action>Format as markdown list:</action>
    <action>```markdown</action>
    <action>## Features</action>
    <action></action>
    <action>- 🚀 Feature 1 description</action>
    <action>- ⚡ Feature 2 description</action>
    <action>- 🔒 Feature 3 description</action>
    <action>```</action>

    <action>Store in {{section_features}}</action>

    <output>
✓ Generated Features section
</output>
  </step>

  <step n="5" goal="Generate Installation section">
    <action>Generate installation instructions:

<invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
  <param name="section_name">Installation</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{readme_context}}</param>
  <param name="reading_level">8</param>
  <param name="include_examples">true</param>
</invoke-task>

Store in {{section_installation}}
</action>

    <output>
✓ Generated Installation section ({{section_installation.code_examples_included}} code examples)
</output>
  </step>

  <step n="6" goal="Generate Usage section">
    <action>Generate usage examples and instructions:

<invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
  <param name="section_name">Usage</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{readme_context}}</param>
  <param name="reading_level">8</param>
  <param name="include_examples">true</param>
</invoke-task>

Store in {{section_usage}}
</action>

    <output>
✓ Generated Usage section ({{section_usage.code_examples_included}} code examples)
</output>
  </step>

  <step n="7" goal="Generate Configuration section (if applicable)">
    <check>If project has config files (.env, config.json, etc.) → Generate Configuration section</check>
    <check>If no config files → Skip this section</check>

    <action>Generate configuration documentation:

<invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
  <param name="section_name">Configuration</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{readme_context}}</param>
  <param name="reading_level">8</param>
  <param name="include_examples">true</param>
</invoke-task>

Store in {{section_configuration}}
</action>

    <output>
✓ Generated Configuration section
</output>
  </step>

  <step n="8" goal="Generate Architecture diagram (optional)">
    <action>Ask user: "Include architecture diagram? (yes/no) [no]"</action>

    <check>If user says no → Skip to step 9</check>

    <action>Generate architecture diagram:

<invoke-task path="bmad/core/tasks/tech-writer/create-diagrams.md">
  <param name="diagram_type">architecture</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{readme_context}}</param>
  <param name="scope">high-level</param>
</invoke-task>

Store in {{section_architecture}}
</action>

    <output>
✓ Generated architecture diagram
</output>
  </step>

  <step n="9" goal="Generate Development section">
    <action>Generate development and contributing information:

<invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
  <param name="section_name">Development</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{readme_context}}</param>
  <param name="reading_level">10</param>
  <param name="include_examples">true</param>
</invoke-task>

Store in {{section_development}}
</action>

    <output>
✓ Generated Development section
</output>
  </step>

  <step n="10" goal="Generate Testing section (if tests detected)">
    <check>If {{readme_context.structure.test_locations}} exists → Generate Testing section</check>
    <check>If no tests detected → Skip this section</check>

    <action>Create testing documentation including:</action>
    <action>  - How to run tests</action>
    <action>  - Test framework used</action>
    <action>  - Test coverage information (if available)</action>

    <action>Store in {{section_testing}}</action>

    <output>
✓ Generated Testing section
</output>
  </step>

  <step n="11" goal="Generate License section">
    <action>Detect license from LICENSE file or user input</action>

    <action>Create license section:</action>
    <action>```markdown</action>
    <action>## License</action>
    <action></action>
    <action>This project is licensed under the {{license_type}} License - see the [LICENSE](LICENSE) file for details.</action>
    <action>```</action>

    <action>Store in {{section_license}}</action>

    <output>
✓ Generated License section
</output>
  </step>

  <step n="12" goal="Assemble complete README">
    <action>Combine all sections in order:</action>
    <action>  1. Title (# {{project_name}})</action>
    <action>  2. Brief description (one-liner)</action>
    <action>  3. Badges (if applicable)</action>
    <action>  4. {{section_overview}}</action>
    <action>  5. {{section_features}}</action>
    <action>  6. {{section_installation}}</action>
    <action>  7. {{section_usage}}</action>
    <action>  8. {{section_configuration}} (if exists)</action>
    <action>  9. {{section_architecture}} (if exists)</action>
    <action>  10. {{section_development}}</action>
    <action>  11. {{section_testing}} (if exists)</action>
    <action>  12. {{section_license}}</action>

    <action>Add table of contents after title (for long READMEs)</action>
    <action>Format consistently (proper spacing, headers)</action>

    <action>Store complete README in {{readme_content}}</action>
  </step>

  <step n="13" goal="Validate README">
    <action>Validate generated README:

<invoke-task path="bmad/core/tasks/tech-writer/validate-documentation.md">
  <param name="doc_file">{{project_root}}/README.md</param>
  <param name="project_root">{{project_root}}</param>
  <param name="validation_level">standard</param>
  <param name="check_links">true</param>
</invoke-task>

Store validation results in {{validation_results}}
</action>

    <check>If {{validation_results.quality_score}} < 70 → Warn user</check>
    <check>If {{validation_results.issues}} contains errors → Display issues</check>

    <output>
Validation Results:
  Quality Score: {{validation_results.quality_score}}/100
  Completeness: {{validation_results.completeness_percentage}}%
  {{#if validation_results.issues.length > 0}}
  Issues: {{validation_results.issues.length}}
  {{/if}}
</output>
  </step>

  <step n="14" goal="Save README file">
    <action>Ask user: "Save README.md to {{project_root}}? (yes/no) [yes]"</action>

    <check>If user says no → Display content and exit</check>

    <action>Write {{readme_content}} to {{project_root}}/README.md</action>

    <output>
✅ README.md saved to {{project_root}}/README.md
</output>
  </step>

  <step n="15" goal="Integrate with RVTM (optional)">
    <check>If RVTM is initialized (.rvtm/ exists) → Offer to register documentation</check>
    <check>If RVTM not initialized → Skip this step</check>

    <action>Ask user: "Register README in RVTM for tracking? (yes/no) [no]"</action>

    <check>If user says no → Skip to step 16</check>

    <action>Create documentation metadata entry in RVTM</action>
    <action>Link to relevant requirements (if PRD exists)</action>

    <output>
✓ README registered in RVTM for tracking
</output>
  </step>

  <step n="16" goal="Display completion summary">
    <output>
╔══════════════════════════════════════════════════════════════╗
║           README Generation Complete ✅                      ║
╚══════════════════════════════════════════════════════════════╝

Project: {{project_name}}
Type: {{project_type}}
Language: {{primary_language}}

Generated Sections:
  ✓ Overview
  ✓ Features
  ✓ Installation
  ✓ Usage
  {{#if section_configuration}}✓ Configuration{{/if}}
  {{#if section_architecture}}✓ Architecture{{/if}}
  ✓ Development
  {{#if section_testing}}✓ Testing{{/if}}
  ✓ License

Statistics:
  Total Words: {{total_word_count}}
  Code Examples: {{total_code_examples}}
  Quality Score: {{validation_results.quality_score}}/100

File Location: {{project_root}}/README.md

Next Steps:
  • Review and customize the generated content
  • Add project-specific details and screenshots
  • Update as your project evolves
  {{#if validation_results.issues.length > 0}}
  • Address validation issues for higher quality
  {{/if}}

🤖 Generated with BMAD Tech Writer
</output>
  </step>

</workflow>
```