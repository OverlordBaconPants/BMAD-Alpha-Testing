# Generate User Guide - Workflow Instructions

```xml
<critical>The workflow execution engine is governed by: {project_root}/bmad/core/tasks/workflow.md</critical>
<critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
<critical>This workflow generates comprehensive user guide documentation using pure MD/YAML approach.</critical>

<workflow>

  <step n="1" goal="Analyze project and target audience">
    <action>Analyze project:

<invoke-task path="bmad/core/tasks/tech-writer/analyze-codebase.md">
  <param name="project_root">{{project_root}}</param>
  <param name="output_format">yaml</param>
  <param name="analysis_depth">standard</param>
</invoke-task>

Store in {{project_analysis}}
</action>

    <action>Ask user about target audience:</action>
    <action>```</action>
    <action>Creating user guide for {{project_analysis.project_name}}.</action>
    <action></action>
    <action>Target audience (choose one):</action>
    <action>  1. Beginners (no technical background)</action>
    <action>  2. Intermediate users (some technical knowledge)</action>
    <action>  3. Advanced users (technical experts)</action>
    <action>  4. Mixed audience (all levels)</action>
    <action></action>
    <action>Selection [4]: </action>
    <action>```</action>

    <action>Store in {{target_audience}}</action>
  </step>

  <step n="2" goal="Generate Introduction section">
    <action>Create introduction including:</action>
    <action>  - What the software does</action>
    <action>  - Who should use it</action>
    <action>  - What users will learn</action>
    <action>  - How to use this guide</action>

    <action>Generate section:

<invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
  <param name="section_name">Introduction</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{project_analysis}}</param>
  <param name="reading_level">{{target_audience_reading_level}}</param>
</invoke-task>

Store in {{section_intro}}
</action>
  </step>

  <step n="3" goal="Generate Getting Started section">
    <action>Create getting started guide with:</action>
    <action>  - Prerequisites</action>
    <action>  - Installation steps</action>
    <action>  - First-time setup</action>
    <action>  - Hello World example</action>

    <action>Generate section:

<invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
  <param name="section_name">Getting Started</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{project_analysis}}</param>
  <param name="reading_level">{{target_audience_reading_level}}</param>
  <param name="include_examples">true</param>
</invoke-task>

Store in {{section_getting_started}}
</action>
  </step>

  <step n="4" goal="Generate Core Features tutorials">
    <action>Identify 3-5 core features to document</action>
    <action>For each feature, create tutorial-style documentation with:</action>
    <action>  - Feature overview</action>
    <action>  - Step-by-step instructions</action>
    <action>  - Screenshots/diagrams (placeholders)</action>
    <action>  - Common use cases</action>
    <action>  - Tips and tricks</action>

    <action>Store in {{section_features}}</action>

    <output>
✓ Generated {{feature_count}} feature tutorials
</output>
  </step>

  <step n="5" goal="Generate Advanced Topics section (if applicable)">
    <check>If {{target_audience}} includes advanced users → Generate advanced section</check>
    <check>Otherwise → Skip this step</check>

    <action>Document advanced topics such as:</action>
    <action>  - Configuration options</action>
    <action>  - Customization</action>
    <action>  - Integration with other tools</action>
    <action>  - Performance optimization</action>
    <action>  - Advanced workflows</action>

    <action>Store in {{section_advanced}}</action>
  </step>

  <step n="6" goal="Generate Troubleshooting section">
    <action>Create troubleshooting guide with:</action>
    <action>  - Common issues and solutions</action>
    <action>  - Error messages and fixes</action>
    <action>  - Debugging tips</action>
    <action>  - Where to get help</action>

    <action>Store in {{section_troubleshooting}}</action>
  </step>

  <step n="7" goal="Generate FAQ section">
    <action>Create FAQ with common questions:</action>
    <action>  - General questions</action>
    <action>  - Technical questions</action>
    <action>  - Licensing/support questions</action>

    <action>Store in {{section_faq}}</action>
  </step>

  <step n="8" goal="Assemble user guide">
    <action>Combine all sections:</action>
    <action>  1. Title</action>
    <action>  2. Table of Contents</action>
    <action>  3. {{section_intro}}</action>
    <action>  4. {{section_getting_started}}</action>
    <action>  5. {{section_features}}</action>
    <action>  6. {{section_advanced}} (if exists)</action>
    <action>  7. {{section_troubleshooting}}</action>
    <action>  8. {{section_faq}}</action>

    <action>Store in {{user_guide_content}}</action>
  </step>

  <step n="9" goal="Validate user guide">
    <action>Validate documentation:

<invoke-task path="bmad/core/tasks/tech-writer/validate-documentation.md">
  <param name="doc_file">{{temp_file}}</param>
  <param name="project_root">{{project_root}}</param>
  <param name="validation_level">standard</param>
</invoke-task>

Store in {{validation_results}}
</action>
  </step>

  <step n="10" goal="Save user guide">
    <action>Save to {{project_root}}/docs/USER_GUIDE.md</action>

    <output>
✅ User Guide Complete

Target Audience: {{target_audience}}
Sections: {{section_count}}
Quality Score: {{validation_results.quality_score}}/100

Saved to: {{output_path}}

Next Steps:
  • Add screenshots and images
  • Test all examples
  • Get user feedback

🤖 Generated with BMAD Tech Writer
</output>
  </step>

</workflow>
```