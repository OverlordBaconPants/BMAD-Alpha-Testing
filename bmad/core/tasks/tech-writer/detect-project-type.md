<!-- Powered by BMAD-CORE™ -->

# Tech Writer: Detect Project Type

```xml
<task id="bmad/core/tasks/tech-writer/detect-project-type.md" name="Detect Project Type">
  <objective>Classify project type based on structure, dependencies, and file patterns</objective>

  <inputs critical="true">
    <input name="project_root" type="path" required="true" description="Path to project root directory" />
    <input name="primary_language" type="string" default="" description="Primary programming language (optional, helps classification)" />
  </inputs>

  <outputs>
    <output name="project_type" type="string" />
    <output name="confidence" type="string" />
    <output name="indicators" type="array" />
  </outputs>

  <flow>

    <step n="1" goal="Initialize detection variables">
      <action>Set {{indicators}} = empty array</action>
      <action>Set {{project_type}} = "unknown"</action>
      <action>Set {{confidence}} = "low"</action>
      <action>Set {{score_map}} = empty object (will track scores for each type)</action>
    </step>

    <step n="2" goal="Check for web application indicators">
      <action>Check for files/patterns indicating web application:</action>

      <action>Frontend frameworks:</action>
      <action>  - package.json with "react" dependency → +5 points web-application</action>
      <action>  - package.json with "vue" dependency → +5 points web-application</action>
      <action>  - package.json with "angular" dependency → +5 points web-application</action>
      <action>  - package.json with "next" dependency → +5 points web-application</action>
      <action>  - package.json with "svelte" dependency → +5 points web-application</action>

      <action>Static site generators:</action>
      <action>  - package.json with "gatsby" dependency → +5 points static-site</action>
      <action>  - package.json with "hugo" dependency → +5 points static-site</action>
      <action>  - package.json with "jekyll" dependency → +5 points static-site</action>

      <action>Web-related files:</action>
      <action>  - index.html exists → +2 points web-application</action>
      <action>  - public/ or static/ directory → +2 points web-application</action>
      <action>  - webpack.config.js or vite.config.js → +3 points web-application</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="3" goal="Check for API/backend indicators">
      <action>Check for backend frameworks and patterns:</action>

      <action>Node.js backends:</action>
      <action>  - package.json with "express" dependency → +5 points rest-api</action>
      <action>  - package.json with "fastify" dependency → +5 points rest-api</action>
      <action>  - package.json with "koa" dependency → +5 points rest-api</action>
      <action>  - package.json with "nestjs" dependency → +5 points rest-api</action>

      <action>Python backends:</action>
      <action>  - requirements.txt with "django" → +5 points web-framework</action>
      <action>  - requirements.txt with "flask" → +5 points rest-api</action>
      <action>  - requirements.txt with "fastapi" → +5 points rest-api</action>

      <action>Other backends:</action>
      <action>  - pom.xml with spring-boot → +5 points rest-api</action>
      <action>  - Cargo.toml with "actix-web" or "rocket" → +5 points rest-api</action>
      <action>  - go.mod with "gin" or "echo" or "fiber" → +5 points rest-api</action>

      <action>API indicators:</action>
      <action>  - routes/ or controllers/ directory → +3 points rest-api</action>
      <action>  - api/ directory → +3 points rest-api</action>
      <action>  - openapi.yaml or swagger.json → +4 points rest-api</action>
      <action>  - graphql schema files → +4 points graphql-api</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="4" goal="Check for library/package indicators">
      <action>Check for library/package patterns:</action>

      <action>Package structure:</action>
      <action>  - package.json without dependencies on frameworks → +3 points library</action>
      <action>  - setup.py with library structure → +3 points library</action>
      <action>  - Cargo.toml with [lib] section → +4 points library</action>
      <action>  - No main entry point (no main.*, index.*, etc.) → +2 points library</action>

      <action>Library indicators:</action>
      <action>  - lib/ or src/lib/ directory → +2 points library</action>
      <action>  - dist/ or build/ with compiled output → +2 points library</action>
      <action>  - .d.ts TypeScript definition files → +3 points library</action>
      <action>  - Publishing configuration (npmignore, MANIFEST.in) → +3 points library</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="5" goal="Check for CLI application indicators">
      <action>Check for command-line interface patterns:</action>

      <action>CLI frameworks:</action>
      <action>  - package.json with "commander" or "yargs" → +4 points cli-application</action>
      <action>  - requirements.txt with "click" or "argparse" → +4 points cli-application</action>
      <action>  - Cargo.toml with "clap" → +4 points cli-application</action>

      <action>CLI structure:</action>
      <action>  - package.json with "bin" field → +5 points cli-application</action>
      <action>  - bin/ or scripts/ directory with executables → +3 points cli-application</action>
      <action>  - No web-related dependencies → +2 points cli-application</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="6" goal="Check for mobile application indicators">
      <action>Check for mobile development patterns:</action>

      <action>React Native:</action>
      <action>  - package.json with "react-native" → +5 points mobile-application</action>
      <action>  - android/ and ios/ directories → +4 points mobile-application</action>

      <action>Flutter:</action>
      <action>  - pubspec.yaml with flutter → +5 points mobile-application</action>

      <action>Native mobile:</action>
      <action>  - build.gradle with android SDK → +5 points mobile-application</action>
      <action>  - Podfile or .xcodeproj → +5 points mobile-application</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="7" goal="Check for desktop application indicators">
      <action>Check for desktop app patterns:</action>

      <action>Electron:</action>
      <action>  - package.json with "electron" → +5 points desktop-application</action>

      <action>Tauri:</action>
      <action>  - Cargo.toml with "tauri" → +5 points desktop-application</action>

      <action>Native desktop:</action>
      <action>  - Qt project files → +5 points desktop-application</action>
      <action>  - WPF/WinForms project files → +5 points desktop-application</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="8" goal="Check for data science/ML indicators">
      <action>Check for data science patterns:</action>

      <action>Data science libraries:</action>
      <action>  - requirements.txt with "pandas" → +3 points data-science</action>
      <action>  - requirements.txt with "numpy" or "scipy" → +2 points data-science</action>
      <action>  - requirements.txt with "scikit-learn" → +3 points data-science</action>
      <action>  - requirements.txt with "tensorflow" or "pytorch" → +4 points machine-learning</action>

      <action>Data science files:</action>
      <action>  - .ipynb notebook files → +4 points data-science</action>
      <action>  - notebooks/ directory → +3 points data-science</action>
      <action>  - models/ directory with ML models → +3 points machine-learning</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="9" goal="Check for DevOps/Infrastructure indicators">
      <action>Check for infrastructure patterns:</action>

      <action>Container orchestration:</action>
      <action>  - docker-compose.yml → +3 points devops-tool</action>
      <action>  - kubernetes/ or k8s/ directory → +4 points devops-tool</action>
      <action>  - helm charts → +4 points devops-tool</action>

      <action>Infrastructure as Code:</action>
      <action>  - Terraform files (*.tf) → +5 points infrastructure</action>
      <action>  - Ansible playbooks → +5 points infrastructure</action>
      <action>  - CloudFormation templates → +5 points infrastructure</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="10" goal="Check for documentation project indicators">
      <action>Check for documentation-focused projects:</action>

      <action>  - docs/ as primary directory with minimal code → +4 points documentation</action>
      <action>  - mkdocs.yml or docusaurus.config.js → +5 points documentation</action>
      <action>  - sphinx configuration → +5 points documentation</action>
      <action>  - Mostly markdown files (>70% of files) → +3 points documentation</action>

      <action>For each match, add indicator to {{indicators}} array</action>
    </step>

    <step n="11" goal="Calculate final project type">
      <action>Find project type with highest score in {{score_map}}</action>

      <action>Set confidence based on score:</action>
      <action>  - Score >= 10 → confidence = "high"</action>
      <action>  - Score >= 5 → confidence = "medium"</action>
      <action>  - Score < 5 → confidence = "low"</action>

      <action>If highest score < 3:</action>
      <action>  - Set {{project_type}} = "general-application"</action>
      <action>  - Set {{confidence}} = "low"</action>

      <action>Otherwise:</action>
      <action>  - Set {{project_type}} = type with highest score</action>
    </step>

    <step n="12" goal="Return classification result">
      <output>
Project Type Detection Complete

Detected Type: {{project_type}}
Confidence: {{confidence}}

Indicators Found:
{{#each indicators}}
  - {{this}}
{{/each}}

Type Scores:
{{#each score_map}}
  {{@key}}: {{this}} points
{{/each}}
</output>
    </step>

  </flow>

  <error-handling>
    <on-error step="any">Log warning and continue with best-effort classification</on-error>
  </error-handling>

  <project-types>
    <type name="web-application">Frontend web application or SPA</type>
    <type name="rest-api">RESTful API backend service</type>
    <type name="graphql-api">GraphQL API service</type>
    <type name="web-framework">Full-stack web framework application</type>
    <type name="library">Reusable library or package</type>
    <type name="cli-application">Command-line interface tool</type>
    <type name="mobile-application">Mobile app (iOS/Android)</type>
    <type name="desktop-application">Desktop application</type>
    <type name="data-science">Data science/analysis project</type>
    <type name="machine-learning">Machine learning project</type>
    <type name="devops-tool">DevOps automation tool</type>
    <type name="infrastructure">Infrastructure as Code</type>
    <type name="documentation">Documentation project</type>
    <type name="static-site">Static site generator project</type>
    <type name="general-application">General purpose application</type>
    <type name="unknown">Cannot determine project type</type>
  </project-types>

  <examples>
    <example name="React SPA">
      <input>
        project_root: /projects/my-react-app
        primary_language: JavaScript
      </input>
      <output>
        project_type: web-application
        confidence: high
        indicators: ["React dependency", "webpack.config.js", "public/ directory"]
      </output>
    </example>

    <example name="Flask API">
      <input>
        project_root: /projects/api-service
        primary_language: Python
      </input>
      <output>
        project_type: rest-api
        confidence: high
        indicators: ["Flask dependency", "routes/ directory", "No frontend files"]
      </output>
    </example>

    <example name="Python Library">
      <input>
        project_root: /projects/my-lib
        primary_language: Python
      </input>
      <output>
        project_type: library
        confidence: medium
        indicators: ["setup.py present", "lib/ directory", "No main entry point"]
      </output>
    </example>
  </examples>

</task>
```