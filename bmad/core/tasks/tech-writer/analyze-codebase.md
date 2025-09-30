<!-- Powered by BMAD-CORE™ -->

# Tech Writer: Analyze Codebase

```xml
<task id="bmad/core/tasks/tech-writer/analyze-codebase.md" name="Analyze Codebase">
  <objective>Analyze project structure and codebase to extract information for documentation generation</objective>

  <inputs critical="true">
    <input name="project_root" type="path" required="true" description="Path to project root directory" />
    <input name="output_format" type="string" default="yaml" description="Output format: yaml, json, or markdown" />
    <input name="analysis_depth" type="string" default="standard" description="Analysis depth: quick, standard, or deep" />
  </inputs>

  <outputs>
    <output name="project_name" type="string" />
    <output name="project_type" type="string" />
    <output name="primary_language" type="string" />
    <output name="file_count" type="number" />
    <output name="structure_summary" type="object" />
    <output name="key_files" type="array" />
  </outputs>

  <flow>

    <step n="1" goal="Validate project directory">
      <action>Check if directory exists: {{project_root}}</action>
      <check>If not exists → HALT with error: "Project directory not found: {{project_root}}"</check>
      <action>Verify read permissions on directory</action>
      <check>If no read access → HALT with error: "Cannot read project directory"</check>
    </step>

    <step n="2" goal="Detect project name">
      <action>Check for package.json and extract "name" field</action>
      <action>Check for setup.py and extract project name</action>
      <action>Check for Cargo.toml and extract "name" field</action>
      <action>Check for pom.xml and extract artifactId</action>
      <action>Check for composer.json and extract "name" field</action>
      <action>If no config found → Use directory name as project name</action>
      <action>Store result in {{project_name}}</action>

      <info>Priority order: package.json > setup.py > Cargo.toml > pom.xml > composer.json > directory name</info>
    </step>

    <step n="3" goal="Identify primary programming language">
      <action>Scan {{project_root}} for file extensions (recursively, max depth 5)</action>
      <action>Count files by extension:</action>
      <action>  - .js, .jsx, .ts, .tsx → JavaScript/TypeScript</action>
      <action>  - .py → Python</action>
      <action>  - .java → Java</action>
      <action>  - .cs → C#</action>
      <action>  - .go → Go</action>
      <action>  - .rs → Rust</action>
      <action>  - .rb → Ruby</action>
      <action>  - .php → PHP</action>
      <action>  - .cpp, .cc, .cxx → C++</action>
      <action>  - .c, .h → C</action>

      <action>Determine language with highest file count</action>
      <action>Store in {{primary_language}}</action>
      <action>Store total file count in {{file_count}}</action>

      <check>If no source files found → Set {{primary_language}} = "unknown"</check>
    </step>

    <step n="4" goal="Invoke project type detection">
      <action>Call detect-project-type task to classify project:

<invoke-task path="bmad/core/tasks/tech-writer/detect-project-type.md">
  <param name="project_root">{{project_root}}</param>
  <param name="primary_language">{{primary_language}}</param>
</invoke-task>

Store result in {{project_type}}
</action>
    </step>

    <step n="5" goal="Identify key files">
      <action>Build list of important files for documentation:</action>

      <action>Configuration files:</action>
      <action>  - package.json (Node.js/JS)</action>
      <action>  - requirements.txt, setup.py, pyproject.toml (Python)</action>
      <action>  - Cargo.toml (Rust)</action>
      <action>  - pom.xml, build.gradle (Java)</action>
      <action>  - composer.json (PHP)</action>
      <action>  - go.mod (Go)</action>

      <action>Documentation files:</action>
      <action>  - README.md, README.rst, README.txt</action>
      <action>  - CONTRIBUTING.md</action>
      <action>  - LICENSE, LICENSE.md, LICENSE.txt</action>
      <action>  - CHANGELOG.md</action>
      <action>  - docs/ directory</action>

      <action>Build/CI files:</action>
      <action>  - Dockerfile, docker-compose.yml</action>
      <action>  - .github/workflows/*.yml</action>
      <action>  - .gitlab-ci.yml</action>
      <action>  - Makefile</action>

      <action>Entry point files:</action>
      <action>  - index.js, main.js, app.js, server.js (JS)</action>
      <action>  - main.py, __init__.py, app.py (Python)</action>
      <action>  - main.go (Go)</action>
      <action>  - main.rs, lib.rs (Rust)</action>
      <action>  - Main.java, Application.java (Java)</action>

      <action>For each file, if exists, store in {{key_files}} with:</action>
      <action>  - path: relative path from {{project_root}}</action>
      <action>  - type: configuration|documentation|build|entrypoint</action>
      <action>  - exists: true</action>
    </step>

    <step n="6" goal="Analyze directory structure">
      <action>Map top-level directory structure</action>
      <action>For each directory in {{project_root}} (depth 1):</action>
      <action>  - Identify purpose based on common conventions:</action>
      <action>    • src/, source/ → Source code</action>
      <action>    • lib/, libs/ → Libraries</action>
      <action>    • test/, tests/, __tests__ → Tests</action>
      <action>    • docs/, documentation/ → Documentation</action>
      <action>    • examples/, demos/ → Examples</action>
      <action>    • scripts/, tools/ → Scripts/utilities</action>
      <action>    • public/, static/, assets/ → Static assets</action>
      <action>    • config/, conf/ → Configuration</action>
      <action>    • dist/, build/, target/ → Build outputs</action>
      <action>    • node_modules/, vendor/, venv/ → Dependencies</action>

      <action>Store in {{structure_summary}} with:</action>
      <action>  - directories: array of {name, purpose, file_count}</action>
      <action>  - source_locations: paths likely containing source code</action>
      <action>  - test_locations: paths containing tests</action>
      <action>  - docs_locations: paths containing documentation</action>
    </step>

    <step n="7" goal="Analyze dependencies (if analysis_depth >= standard)">
      <check>If {{analysis_depth}} == "quick" → Skip to step 8</check>

      <action>For Node.js projects (package.json exists):</action>
      <action>  - Read package.json</action>
      <action>  - Extract dependencies and devDependencies</action>
      <action>  - Identify framework/library (React, Vue, Express, etc.)</action>

      <action>For Python projects (requirements.txt or pyproject.toml exists):</action>
      <action>  - Read dependency file</action>
      <action>  - Extract package list</action>
      <action>  - Identify framework (Django, Flask, FastAPI, etc.)</action>

      <action>For other languages, read respective dependency files</action>

      <action>Store in {{structure_summary}}.dependencies:</action>
      <action>  - framework: primary framework name (if detected)</action>
      <action>  - key_dependencies: list of important libraries</action>
      <action>  - dependency_count: total number of dependencies</action>
    </step>

    <step n="8" goal="Detect API endpoints (if analysis_depth == deep)">
      <check>If {{analysis_depth}} != "deep" → Skip to step 9</check>

      <action>Invoke extract-api-endpoints task for deep analysis:

<invoke-task path="bmad/core/tasks/tech-writer/extract-api-endpoints.md">
  <param name="project_root">{{project_root}}</param>
  <param name="primary_language">{{primary_language}}</param>
  <param name="framework">{{structure_summary.dependencies.framework}}</param>
</invoke-task>

Store API endpoint count in {{structure_summary}}.api_endpoints_count
</action>
    </step>

    <step n="9" goal="Calculate codebase metrics">
      <action>Count total lines of code (excluding node_modules/, venv/, etc.)</action>
      <action>Count number of source files by type</action>
      <action>Estimate project size:</action>
      <action>  - Small: < 5,000 LOC</action>
      <action>  - Medium: 5,000 - 50,000 LOC</action>
      <action>  - Large: 50,000 - 200,000 LOC</action>
      <action>  - Very Large: > 200,000 LOC</action>

      <action>Store in {{structure_summary}}.metrics:</action>
      <action>  - total_lines: approximate line count</action>
      <action>  - source_files: number of source files</action>
      <action>  - project_size: small|medium|large|very_large</action>
    </step>

    <step n="10" goal="Generate output">
      <action>Compile all collected data into analysis result</action>

      <action>If {{output_format}} == "yaml":</action>
      <action>  Format as YAML structure with:</action>
      <action>    - project_name</action>
      <action>    - project_type</action>
      <action>    - primary_language</action>
      <action>    - file_count</action>
      <action>    - key_files (array)</action>
      <action>    - structure (object)</action>
      <action>    - metrics (object)</action>

      <action>If {{output_format}} == "json":</action>
      <action>  Format as JSON with same structure</action>

      <action>If {{output_format}} == "markdown":</action>
      <action>  Format as human-readable markdown report</action>

      <output>
Analysis complete for project: {{project_name}}

Project Type: {{project_type}}
Primary Language: {{primary_language}}
Total Files: {{file_count}}
Project Size: {{structure_summary.metrics.project_size}}

Key Files Detected:
{{#each key_files}}
  - {{this.path}} ({{this.type}})
{{/each}}

Structure:
{{structure_summary.directories.length}} top-level directories
Source: {{structure_summary.source_locations}}
Tests: {{structure_summary.test_locations}}
Docs: {{structure_summary.docs_locations}}

{{#if structure_summary.dependencies}}
Dependencies:
  Framework: {{structure_summary.dependencies.framework}}
  Total Dependencies: {{structure_summary.dependencies.dependency_count}}
{{/if}}
</output>
    </step>

  </flow>

  <error-handling>
    <on-error step="1">HALT with error - cannot proceed without valid project directory</on-error>
    <on-error step="2-9">Log warning and continue with best-effort analysis</on-error>
    <on-error step="10">HALT with error - must produce valid output</on-error>
  </error-handling>

  <examples>
    <example name="Node.js Express API">
      <input>
        project_root: /projects/my-api
        output_format: yaml
        analysis_depth: standard
      </input>
      <output>
        project_name: my-api
        project_type: rest-api
        primary_language: JavaScript
        file_count: 47
        key_files:
          - package.json (configuration)
          - server.js (entrypoint)
          - README.md (documentation)
        structure:
          directories: [src, tests, config]
          source_locations: [src/]
          test_locations: [tests/]
        dependencies:
          framework: Express
          dependency_count: 23
      </output>
    </example>

    <example name="Python CLI Tool">
      <input>
        project_root: /projects/my-tool
        output_format: yaml
        analysis_depth: quick
      </input>
      <output>
        project_name: my-tool
        project_type: cli-application
        primary_language: Python
        file_count: 12
        key_files:
          - setup.py (configuration)
          - main.py (entrypoint)
        structure:
          directories: [src, tests]
          source_locations: [src/]
      </output>
    </example>
  </examples>

</task>
```