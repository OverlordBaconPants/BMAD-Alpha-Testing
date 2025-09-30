<!-- Powered by BMAD-CORE™ -->

# Tech Writer: Generate Documentation Section

```xml
<task id="bmad/core/tasks/tech-writer/generate-section.md" name="Generate Documentation Section">
  <objective>Generate a specific section of documentation based on template and project analysis</objective>

  <inputs critical="true">
    <input name="section_name" type="string" required="true" description="Name of section to generate (e.g., 'Installation', 'Usage', 'API Reference')" />
    <input name="project_root" type="path" required="true" description="Path to project root directory" />
    <input name="project_analysis" type="object" required="true" description="Project analysis data from analyze-codebase task" />
    <input name="reading_level" type="number" default="8" description="Target reading level (grade level)" />
    <input name="include_examples" type="boolean" default="true" description="Include code examples when applicable" />
    <input name="output_format" type="string" default="markdown" description="Output format: markdown or rst" />
  </inputs>

  <outputs>
    <output name="section_content" type="string" />
    <output name="word_count" type="number" />
    <output name="code_examples_included" type="number" />
  </outputs>

  <flow>

    <step n="1" goal="Validate inputs">
      <action>Verify {{section_name}} is provided and not empty</action>
      <action>Verify {{project_analysis}} contains required fields:</action>
      <action>  - project_name</action>
      <action>  - project_type</action>
      <action>  - primary_language</action>

      <check>If validation fails → HALT with error message</check>
    </step>

    <step n="2" goal="Determine section template">
      <action>Map {{section_name}} to section type:</action>

      <action>Common sections:</action>
      <action>  - "Overview", "Introduction", "About" → overview</action>
      <action>  - "Installation", "Getting Started", "Setup" → installation</action>
      <action>  - "Usage", "Quick Start", "Examples" → usage</action>
      <action>  - "API", "API Reference", "API Documentation" → api-reference</action>
      <action>  - "Configuration", "Settings", "Options" → configuration</action>
      <action>  - "Development", "Contributing" → development</action>
      <action>  - "Testing" → testing</action>
      <action>  - "Deployment" → deployment</action>
      <action>  - "Troubleshooting", "FAQ" → troubleshooting</action>
      <action>  - "Architecture" → architecture</action>
      <action>  - "License" → license</action>

      <action>Store section type in {{section_type}}</action>
      <check>If no match found → Set {{section_type}} = "custom"</check>
    </step>

    <step n="3" goal="Generate Overview section">
      <check>If {{section_type}} != "overview" → Skip to step 4</check>

      <action>Create overview content including:</action>
      <action>  1. Brief project description (1-2 sentences)</action>
      <action>  2. Key features (3-5 bullet points)</action>
      <action>  3. Technology stack (based on {{project_analysis}})</action>
      <action>  4. Target audience</action>

      <action>Content structure:</action>
      <action>```markdown</action>
      <action>## Overview</action>
      <action></action>
      <action>{{project_name}} is a {{project_type}} built with {{primary_language}}.</action>
      <action></action>
      <action>### Key Features</action>
      <action></action>
      <action>- [Feature 1 based on project analysis]</action>
      <action>- [Feature 2]</action>
      <action>- [Feature 3]</action>
      <action></action>
      <action>### Tech Stack</action>
      <action></action>
      <action>- **Language**: {{primary_language}}</action>
      <action>- **Framework**: {{framework if detected}}</action>
      <action>- **Key Dependencies**: {{major dependencies}}</action>
      <action>```</action>

      <action>Store in {{section_content}}</action>
      <action>Jump to step 10</action>
    </step>

    <step n="4" goal="Generate Installation section">
      <check>If {{section_type}} != "installation" → Skip to step 5</check>

      <action>Detect installation method based on project type:</action>

      <action>For Node.js projects (package.json exists):</action>
      <action>  Include npm/yarn installation instructions</action>
      <action>  Check if global CLI (has "bin" field) → show global install</action>

      <action>For Python projects:</action>
      <action>  Include pip installation instructions</action>
      <action>  Check for requirements.txt → show requirements install</action>
      <action>  Check for setup.py → show setuptools install</action>

      <action>For other languages:</action>
      <action>  Detect package manager and show appropriate commands</action>

      <action>Always include:</action>
      <action>  - Prerequisites (language version, system requirements)</action>
      <action>  - Clone/download instructions</action>
      <action>  - Dependency installation</action>
      <action>  - Build steps (if applicable)</action>
      <action>  - Verification steps</action>

      <action>Example structure for Node.js:</action>
      <action>```markdown</action>
      <action>## Installation</action>
      <action></action>
      <action>### Prerequisites</action>
      <action></action>
      <action>- Node.js 16+ and npm</action>
      <action></action>
      <action>### Install</action>
      <action></action>
      <action>```bash</action>
      <action># Clone the repository</action>
      <action>git clone https://github.com/user/{{project_name}}.git</action>
      <action>cd {{project_name}}</action>
      <action></action>
      <action># Install dependencies</action>
      <action>npm install</action>
      <action></action>
      <action># Build (if needed)</action>
      <action>npm run build</action>
      <action>```</action>
      <action>```</action>

      <action>Store in {{section_content}}</action>
      <action>Jump to step 10</action>
    </step>

    <step n="5" goal="Generate Usage section">
      <check>If {{section_type}} != "usage" → Skip to step 6</check>

      <action>Create usage examples based on project type:</action>

      <action>For CLI applications:</action>
      <action>  - Show command-line usage syntax</action>
      <action>  - List available commands/options</action>
      <action>  - Provide 2-3 common usage examples</action>

      <action>For libraries:</action>
      <action>  - Show import/require statement</action>
      <action>  - Demonstrate basic API usage</action>
      <action>  - Show 2-3 common use cases</action>

      <action>For APIs:</action>
      <action>  - Show how to start the server</action>
      <action>  - Provide example API requests</action>
      <action>  - Show response examples</action>

      <action>For web applications:</action>
      <action>  - Show how to run development server</action>
      <action>  - Explain how to access the application</action>
      <action>  - Provide usage workflows</action>

      <action>If {{include_examples}} is true:</action>
      <action>  - Include at least 2 code examples</action>
      <action>  - Use realistic, runnable code</action>
      <action>  - Add comments explaining key parts</action>

      <action>Store in {{section_content}}</action>
      <action>Increment {{code_examples_included}} counter</action>
      <action>Jump to step 10</action>
    </step>

    <step n="6" goal="Generate API Reference section">
      <check>If {{section_type}} != "api-reference" → Skip to step 7</check>

      <action>For library projects:</action>
      <action>  - List main classes/functions</action>
      <action>  - Document parameters and return values</action>
      <action>  - Include usage examples for each</action>

      <action>For API projects:</action>
      <action>  - List endpoints (invoke extract-api-endpoints if needed)</action>
      <action>  - Document request/response formats</action>
      <action>  - Show authentication requirements</action>
      <action>  - Provide curl examples</action>

      <action>Structure:</action>
      <action>```markdown</action>
      <action>## API Reference</action>
      <action></action>
      <action>### Endpoints</action>
      <action></action>
      <action>#### `GET /api/resource`</action>
      <action></action>
      <action>Description of endpoint</action>
      <action></action>
      <action>**Parameters:**</action>
      <action>- `param1` (string, required): Description</action>
      <action></action>
      <action>**Response:**</action>
      <action>```json</action>
      <action>{</action>
      <action>  "key": "value"</action>
      <action>}</action>
      <action>```</action>
      <action></action>
      <action>**Example:**</action>
      <action>```bash</action>
      <action>curl -X GET https://api.example.com/api/resource</action>
      <action>```</action>
      <action>```</action>

      <action>Store in {{section_content}}</action>
      <action>Jump to step 10</action>
    </step>

    <step n="7" goal="Generate Configuration section">
      <check>If {{section_type}} != "configuration" → Skip to step 8</check>

      <action>Identify configuration sources:</action>
      <action>  - Look for config files (.env, config.json, config.yaml, etc.)</action>
      <action>  - Check for environment variable usage</action>
      <action>  - Look for CLI flags/options</action>

      <action>Document each configuration option:</action>
      <action>  - Name and type</action>
      <action>  - Description</action>
      <action>  - Default value</action>
      <action>  - Example</action>

      <action>Include configuration file examples</action>

      <action>Store in {{section_content}}</action>
      <action>Jump to step 10</action>
    </step>

    <step n="8" goal="Generate Development/Contributing section">
      <check>If {{section_type}} != "development" → Skip to step 9</check>

      <action>Create development guide including:</action>
      <action>  - Development setup instructions</action>
      <action>  - Code structure overview</action>
      <action>  - Running tests (if test framework detected)</action>
      <action>  - Coding standards</action>
      <action>  - Contribution workflow</action>
      <action>  - Pull request process</action>

      <action>Store in {{section_content}}</action>
      <action>Jump to step 10</action>
    </step>

    <step n="9" goal="Generate custom/generic section">
      <action>For unrecognized section types:</action>
      <action>  - Create section header with {{section_name}}</action>
      <action>  - Add placeholder content indicating manual completion needed</action>
      <action>  - Provide guidance on what to include</action>

      <action>Structure:</action>
      <action>```markdown</action>
      <action>## {{section_name}}</action>
      <action></action>
      <action>[This section requires manual content. Consider including:]</action>
      <action></action>
      <action>- [Relevant information about {{section_name}}]</action>
      <action>- [Examples or details specific to your project]</action>
      <action>```</action>

      <action>Store in {{section_content}}</action>
    </step>

    <step n="10" goal="Adjust for reading level">
      <action>Review {{section_content}} for readability</action>

      <action>If {{reading_level}} <= 8 (general audience):</action>
      <action>  - Use simple, clear language</action>
      <action>  - Avoid jargon or explain technical terms</action>
      <action>  - Use shorter sentences</action>
      <action>  - Add more examples</action>

      <action>If {{reading_level}} >= 12 (technical audience):</action>
      <action>  - Can use technical terminology</action>
      <action>  - Can include more detailed explanations</action>
      <action>  - Can reference advanced concepts</action>

      <action>Note: This is guidance for content generation, not automated text simplification</action>
    </step>

    <step n="11" goal="Calculate metrics">
      <action>Count words in {{section_content}}</action>
      <action>Store in {{word_count}}</action>

      <action>Count code blocks in {{section_content}}</action>
      <action>Store in {{code_examples_included}}</action>
    </step>

    <step n="12" goal="Format output">
      <action>If {{output_format}} == "markdown":</action>
      <action>  Return {{section_content}} as-is (already markdown)</action>

      <action>If {{output_format}} == "rst":</action>
      <action>  Convert markdown to reStructuredText format:</action>
      <action>    - Convert headers (## → underlines with =)</action>
      <action>    - Convert code blocks (``` → ::)</action>
      <action>    - Convert bullet lists (- → *)</action>

      <output>
Generated section: {{section_name}}
Word count: {{word_count}}
Code examples: {{code_examples_included}}

Content ready for inclusion in documentation.
</output>
    </step>

  </flow>

  <error-handling>
    <on-error step="1">HALT with error - invalid inputs</on-error>
    <on-error step="2-12">Log warning, generate generic section with placeholder content</on-error>
  </error-handling>

  <examples>
    <example name="Installation section for Node.js project">
      <input>
        section_name: "Installation"
        project_analysis: {project_name: "my-tool", project_type: "cli-application", primary_language: "JavaScript"}
        reading_level: 8
      </input>
      <output>
        section_content: "## Installation\n\n### Prerequisites\n\n- Node.js 16+..."
        word_count: 147
        code_examples_included: 2
      </output>
    </example>

    <example name="Usage section for Python library">
      <input>
        section_name: "Usage"
        project_analysis: {project_name: "data-processor", project_type: "library", primary_language: "Python"}
        include_examples: true
      </input>
      <output>
        section_content: "## Usage\n\nImport the library:\n\n```python\nfrom data_processor..."
        word_count: 203
        code_examples_included: 3
      </output>
    </example>
  </examples>

</task>
```