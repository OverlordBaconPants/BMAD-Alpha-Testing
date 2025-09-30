# Generate Architecture Documentation - Workflow Instructions

```xml
<critical>The workflow execution engine is governed by: {project_root}/bmad/core/tasks/workflow.md</critical>
<critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
<critical>This workflow generates comprehensive architecture documentation using pure MD/YAML approach.</critical>

<workflow>

  <step n="1" goal="Analyze project architecture">
    <action>Deep analysis of project structure:

<invoke-task path="bmad/core/tasks/tech-writer/analyze-codebase.md">
  <param name="project_root">{{project_root}}</param>
  <param name="output_format">yaml</param>
  <param name="analysis_depth">deep</param>
</invoke-task>

Store in {{project_analysis}}
</action>
  </step>

  <step n="2" goal="Generate System Overview">
    <action>Create high-level system overview including:</action>
    <action>  - System purpose and goals</action>
    <action>  - Key architectural decisions</action>
    <action>  - Technology stack</action>
    <action>  - System boundaries</action>

    <action>Generate section:

<invoke-task path="bmad/core/tasks/tech-writer/generate-section.md">
  <param name="section_name">Architecture Overview</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{project_analysis}}</param>
  <param name="reading_level">12</param>
</invoke-task>

Store in {{section_overview}}
</action>
  </step>

  <step n="3" goal="Generate C4 Context Diagram">
    <action>Create C4 Context diagram:

<invoke-task path="bmad/core/tasks/tech-writer/create-diagrams.md">
  <param name="diagram_type">architecture</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{project_analysis}}</param>
  <param name="scope">high-level</param>
</invoke-task>

Store in {{diagram_context}}
</action>

    <output>
✓ Generated system context diagram
</output>
  </step>

  <step n="4" goal="Document component architecture">
    <action>Create component diagram:

<invoke-task path="bmad/core/tasks/tech-writer/create-diagrams.md">
  <param name="diagram_type">component</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{project_analysis}}</param>
  <param name="scope">detailed</param>
</invoke-task>

Store in {{diagram_components}}
</action>

    <action>Document each major component:</action>
    <action>  - Purpose and responsibility</action>
    <action>  - Dependencies</action>
    <action>  - Interfaces</action>
    <action>  - Technology choices</action>

    <action>Store in {{section_components}}</action>
  </step>

  <step n="5" goal="Document data flow">
    <action>Create sequence diagram for key interactions:

<invoke-task path="bmad/core/tasks/tech-writer/create-diagrams.md">
  <param name="diagram_type">sequence</param>
  <param name="project_root">{{project_root}}</param>
  <param name="project_analysis">{{project_analysis}}</param>
</invoke-task>

Store in {{diagram_sequence}}
</action>

    <action>Document data flow patterns:</action>
    <action>  - Request/response flow</action>
    <action>  - Data transformations</action>
    <action>  - State management</action>

    <action>Store in {{section_dataflow}}</action>
  </step>

  <step n="6" goal="Document deployment architecture">
    <action>Document deployment strategy:</action>
    <action>  - Infrastructure requirements</action>
    <action>  - Deployment topology</action>
    <action>  - Scaling considerations</action>
    <action>  - Monitoring and observability</action>

    <action>Store in {{section_deployment}}</action>
  </step>

  <step n="7" goal="Document security architecture">
    <action>Document security considerations:</action>
    <action>  - Authentication and authorization</action>
    <action>  - Data protection</action>
    <action>  - Security boundaries</action>
    <action>  - Threat model</action>

    <action>Store in {{section_security}}</action>
  </step>

  <step n="8" goal="Document design decisions">
    <action>Create Architecture Decision Records (ADRs) section:</action>
    <action>  - Key architectural choices</action>
    <action>  - Rationale for decisions</action>
    <action>  - Trade-offs considered</action>
    <action>  - Alternatives rejected</action>

    <action>Store in {{section_decisions}}</action>
  </step>

  <step n="9" goal="Assemble architecture documentation">
    <action>Combine all sections:</action>
    <action>  1. Title</action>
    <action>  2. Table of Contents</action>
    <action>  3. {{section_overview}}</action>
    <action>  4. {{diagram_context}}</action>
    <action>  5. {{section_components}} + {{diagram_components}}</action>
    <action>  6. {{section_dataflow}} + {{diagram_sequence}}</action>
    <action>  7. {{section_deployment}}</action>
    <action>  8. {{section_security}}</action>
    <action>  9. {{section_decisions}}</action>

    <action>Store in {{architecture_content}}</action>
  </step>

  <step n="10" goal="Validate architecture documentation">
    <action>Validate:

<invoke-task path="bmad/core/tasks/tech-writer/validate-documentation.md">
  <param name="doc_file">{{temp_file}}</param>
  <param name="project_root">{{project_root}}</param>
  <param name="validation_level">standard</param>
</invoke-task>

Store in {{validation_results}}
</action>
  </step>

  <step n="11" goal="Save architecture documentation">
    <action>Save to {{project_root}}/docs/ARCHITECTURE.md</action>

    <output>
✅ Architecture Documentation Complete

Components Documented: {{component_count}}
Diagrams Generated: {{diagram_count}}
Quality Score: {{validation_results.quality_score}}/100

Saved to: {{output_path}}

Documentation includes:
  ✓ System Overview
  ✓ C4 Context Diagram
  ✓ Component Architecture
  ✓ Data Flow Diagrams
  ✓ Deployment Architecture
  ✓ Security Architecture
  ✓ Design Decisions

🤖 Generated with BMAD Tech Writer
</output>
  </step>

</workflow>
```