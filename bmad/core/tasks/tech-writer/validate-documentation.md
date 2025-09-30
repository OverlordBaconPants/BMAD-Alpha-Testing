<!-- Powered by BMAD-CORE™ -->

# Tech Writer: Validate Documentation

```xml
<task id="bmad/core/tasks/tech-writer/validate-documentation.md" name="Validate Documentation">
  <objective>Validate documentation quality, completeness, and accuracy</objective>

  <inputs critical="true">
    <input name="doc_file" type="path" required="true" description="Path to documentation file to validate" />
    <input name="project_root" type="path" required="true" description="Path to project root directory" />
    <input name="validation_level" type="string" default="standard" description="Validation level: basic, standard, or strict" />
    <input name="check_links" type="boolean" default="true" description="Check for broken links" />
  </inputs>

  <outputs>
    <output name="is_valid" type="boolean" />
    <output name="quality_score" type="number" />
    <output name="issues" type="array" />
    <output name="warnings" type="array" />
    <output name="completeness_percentage" type="number" />
  </outputs>

  <flow>

    <step n="1" goal="Read documentation file">
      <action>Read file: {{doc_file}}</action>
      <check>If file not found → HALT with error</check>
      <action>Store content in {{doc_content}}</action>
      <action>Detect format (markdown, rst, txt)</action>
      <action>Count total lines and words</action>
    </step>

    <step n="2" goal="Check structure completeness">
      <action>Identify document type by filename or content:</action>
      <action>  - README: Check for standard README sections</action>
      <action>  - API docs: Check for endpoint documentation</action>
      <action>  - User guide: Check for progressive structure</action>

      <action>For README files, check for essential sections:</action>
      <action>  - Title/Project name</action>
      <action>  - Description/Overview</action>
      <action>  - Installation instructions</action>
      <action>  - Usage examples</action>
      <action>  - License information</action>

      <action>Score completeness:</action>
      <action>  - Each present section = points</action>
      <action>  - Calculate percentage of expected sections present</action>
      <action>  - Store in {{completeness_percentage}}</action>

      <action>Add missing sections to {{issues}} array:</action>
      <action>  {type: "missing_section", severity: "warning", message: "Missing Installation section"}</action>
    </step>

    <step n="3" goal="Check for broken internal links">
      <check>If {{check_links}} is false → Skip to step 4</check>

      <action>Extract markdown links: [text](url) or [text][ref]</action>

      <action>For each link:</action>
      <action>  - If relative path (doesn't start with http/https):</action>
      <action>    • Resolve path relative to {{project_root}}</action>
      <action>    • Check if file exists</action>
      <action>    • If not exists → Add to {{issues}}</action>
      <action>      {type: "broken_link", severity: "error", message: "Link target not found: path"}</action>

      <action>  - If absolute path within project:</action>
      <action>    • Check if file exists</action>

      <action>  - If external URL (http/https):</action>
      <action>    • Add to {{warnings}} for manual verification</action>
      <action>      {type: "external_link", severity: "info", message: "External link (not validated): url"}</action>
    </step>

    <step n="4" goal="Check for broken anchor links">
      <action>Extract anchor links: #section-name</action>

      <action>Build list of available anchors in document:</action>
      <action>  - From headers: ## Header → #header</action>
      <action>  - From explicit anchors: <a name="anchor"></a></action>

      <action>For each anchor link referenced:</action>
      <action>  - Check if anchor exists in document</action>
      <action>  - If not found → Add to {{issues}}</action>
      <action>    {type: "broken_anchor", severity: "error", message: "Anchor not found: #anchor"}</action>
    </step>

    <step n="5" goal="Validate code examples">
      <action>Extract code blocks from markdown: ```language ... ```</action>

      <action>For each code block:</action>
      <action>  1. Check if language is specified</action>
      <action>     - If missing and {{validation_level}} >= "standard" → Add to {{warnings}}</action>
      <action>       {type: "missing_code_language", severity: "warning", message: "Code block missing language hint"}</action>

      <action>  2. Check for common issues:</action>
      <action>     - Placeholder text like [YOUR_API_KEY] without explanation</action>
      <action>     - Incomplete code (syntax errors visible)</action>
      <action>     - Examples that won't run (missing imports, undefined variables)</action>
      <action>     - If found and {{validation_level}} == "strict" → Add to {{warnings}}</action>

      <action>  3. Check code block length:</action>
      <action>     - If > 50 lines → Consider if it should be split or linked</action>
      <action>     - Add info message if very long</action>
    </step>

    <step n="6" goal="Check content quality">
      <action>Analyze writing quality:</action>

      <action>1. Check for placeholder text:</action>
      <action>   - Search for: "TODO", "FIXME", "[TBD]", "Coming soon"</action>
      <action>   - Each found → Add to {{issues}}</action>
      <action>     {type: "incomplete_content", severity: "warning", message: "Placeholder text found: line N"}</action>

      <action>2. Check for empty sections:</action>
      <action>   - Find headers with no content before next header</action>
      <action>   - Add to {{issues}}</action>
      <action>     {type: "empty_section", severity: "error", message: "Empty section: SectionName"}</action>

      <action>3. Estimate reading level (if validation_level >= standard):</action>
      <action>   - Calculate average sentence length</action>
      <action>   - Calculate average word length</action>
      <action>   - Estimate Flesch-Kincaid grade level</action>
      <action>   - If > 12th grade → Add info about complexity</action>
      <action>   - Store in metadata</action>

      <action>4. Check for consistent terminology:</action>
      <action>   - Look for mixed terms (e.g., "user" vs "customer")</action>
      <action>   - If {{validation_level}} == "strict" → Flag inconsistencies</action>
    </step>

    <step n="7" goal="Validate markdown syntax">
      <action>Check for common markdown issues:</action>

      <action>1. Malformed headers:</action>
      <action>   - Missing space after # (e.g., "#Header" instead of "# Header")</action>
      <action>   - Inconsistent header levels (skip levels)</action>

      <action>2. Malformed lists:</action>
      <action>   - Inconsistent bullet characters</action>
      <action>   - Improper indentation</action>

      <action>3. Malformed code blocks:</action>
      <action>   - Unclosed code blocks (missing closing ```)</action>
      <action>   - Mismatched inline code backticks</action>

      <action>4. Malformed tables:</action>
      <action>   - Inconsistent column count</action>
      <action>   - Missing header separator</action>

      <action>For each syntax error found → Add to {{issues}}</action>
      <action>  {type: "syntax_error", severity: "error", message: "Description of syntax error"}</action>
    </step>

    <step n="8" goal="Check accessibility (if validation_level == strict)">
      <check>If {{validation_level}} != "strict" → Skip to step 9</check>

      <action>Check for accessibility best practices:</action>

      <action>1. Images with alt text:</action>
      <action>   - Find all images: ![alt](url)</action>
      <action>   - Check if alt text is present and meaningful</action>
      <action>   - If missing or generic ("image") → Add to {{warnings}}</action>

      <action>2. Descriptive link text:</action>
      <action>   - Find links with generic text: "click here", "link", "read more"</action>
      <action>   - Add warnings to use descriptive text</action>

      <action>3. Heading hierarchy:</action>
      <action>   - Verify logical header progression (don't skip levels)</action>
      <action>   - H1 → H2 → H3 (not H1 → H3)</action>

      <action>4. Language specification:</action>
      <action>   - Check for language meta tag (for HTML docs)</action>
      <action>   - Check code blocks have language hints</action>
    </step>

    <step n="9" goal="Check for security issues">
      <action>Scan for accidentally exposed sensitive information:</action>

      <action>1. API keys or tokens:</action>
      <action>   - Pattern: "api[_-]?key", "token", "secret"</action>
      <action>   - Exclude obvious examples (with "YOUR", "EXAMPLE")</action>
      <action>   - Flag potential real credentials</action>

      <action>2. Passwords or credentials:</action>
      <action>   - Pattern: "password", "pwd", "credentials"</action>
      <action>   - Check if they look real (not placeholders)</action>

      <action>3. Personal information:</action>
      <action>   - Email addresses (except generic examples)</action>
      <action>   - Phone numbers</action>
      <action>   - IP addresses (private ranges ok)</action>

      <action>For each found → Add to {{issues}}</action>
      <action>  {type: "potential_sensitive_data", severity: "warning", message: "Potential credential in line N"}</action>
    </step>

    <step n="10" goal="Calculate quality score">
      <action>Calculate score based on:</action>
      <action>  Base score: 100 points</action>

      <action>Deductions:</action>
      <action>  - Each error: -10 points</action>
      <action>  - Each warning: -5 points</action>
      <action>  - Missing essential sections: -15 points each</action>
      <action>  - Completeness penalty: -(100 - completeness_percentage) / 2</action>

      <action>Bonuses:</action>
      <action>  - Has code examples: +10 points</action>
      <action>  - All links valid: +5 points</action>
      <action>  - Good structure (all essential sections): +10 points</action>
      <action>  - Images with alt text: +5 points</action>

      <action>Clamp score between 0 and 100</action>
      <action>Store in {{quality_score}}</action>

      <action>Determine {{is_valid}}:</action>
      <action>  - If {{quality_score}} >= 70 and no critical errors → true</action>
      <action>  - Otherwise → false</action>
    </step>

    <step n="11" goal="Generate validation report">
      <action>Summarize results:</action>

      <output>
Documentation Validation Report
File: {{doc_file}}

Overall Status: {{#if is_valid}}✅ PASS{{else}}❌ FAIL{{/if}}
Quality Score: {{quality_score}}/100
Completeness: {{completeness_percentage}}%

{{#if issues.length}}
Issues Found ({{issues.length}}):
{{#each issues}}
  [{{this.severity}}] {{this.message}}
{{/each}}
{{else}}
No issues found ✓
{{/if}}

{{#if warnings.length}}
Warnings ({{warnings.length}}):
{{#each warnings}}
  [{{this.severity}}] {{this.message}}
{{/each}}
{{/if}}

Recommendations:
{{#if completeness_percentage < 80}}
- Add missing sections to improve completeness
{{/if}}
{{#if issues.length > 0}}
- Address critical issues listed above
{{/if}}
{{#if quality_score < 70}}
- Review and improve documentation quality
{{/if}}
</output>
    </step>

  </flow>

  <error-handling>
    <on-error step="1">HALT with error - cannot read documentation file</on-error>
    <on-error step="2-11">Log warning and continue with best-effort validation</on-error>
  </error-handling>

  <validation-levels>
    <level name="basic">
      - Structure completeness
      - Broken links
      - Syntax errors
    </level>
    <level name="standard">
      - All basic checks
      - Code example validation
      - Content quality checks
      - Reading level analysis
    </level>
    <level name="strict">
      - All standard checks
      - Accessibility validation
      - Security scanning
      - Terminology consistency
    </level>
  </validation-levels>

  <examples>
    <example name="Valid README">
      <input>
        doc_file: /projects/my-app/README.md
        validation_level: "standard"
      </input>
      <output>
        is_valid: true
        quality_score: 92
        issues: []
        warnings: []
        completeness_percentage: 100
      </output>
    </example>

    <example name="Incomplete documentation">
      <input>
        doc_file: /projects/my-lib/docs/api.md
        validation_level: "strict"
      </input>
      <output>
        is_valid: false
        quality_score: 58
        issues: [
          {type: "missing_section", severity: "warning", message: "Missing Examples section"},
          {type: "broken_link", severity: "error", message: "Link target not found: ./utils.md"},
          {type: "empty_section", severity: "error", message: "Empty section: Configuration"}
        ]
        warnings: [
          {type: "missing_code_language", severity: "warning", message: "Code block missing language hint"}
        ]
        completeness_percentage: 60
      </output>
    </example>
  </examples>

</task>
```