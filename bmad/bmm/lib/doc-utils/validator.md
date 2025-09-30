# Documentation Validator

## Overview
The Documentation Validator ensures generated documentation meets quality standards, completeness requirements, and format specifications.

## Validation Categories

### 1. Completeness Verification

#### Section Presence
```yaml
required_sections:
  readme:
    mandatory:
      - overview
      - installation
      - usage
      - license
    optional:
      - features
      - api_reference
      - contributing
      - changelog

  api_documentation:
    mandatory:
      - overview
      - authentication
      - endpoints
      - error_codes
    optional:
      - rate_limiting
      - versioning
      - deprecation
      - examples

  user_guide:
    mandatory:
      - introduction
      - getting_started
      - basic_usage
    optional:
      - advanced_features
      - troubleshooting
      - faq
      - glossary

  architecture:
    mandatory:
      - system_overview
      - components
      - data_flow
    optional:
      - deployment
      - security
      - performance
      - scalability
```

#### Content Requirements
```yaml
content_rules:
  overview:
    min_length: 100
    max_length: 500
    must_include:
      - project_purpose
      - key_features
      - target_audience

  installation:
    must_include:
      - prerequisites
      - step_by_step_instructions
      - verification_steps
    code_blocks: required

  api_endpoints:
    per_endpoint:
      - method
      - path
      - description
      - parameters
      - response
      - example

  examples:
    requirements:
      - runnable_code
      - expected_output
      - common_use_cases
```

### 2. Link Validation

#### Link Types
```yaml
link_validators:
  internal:
    pattern: "#[a-z0-9-]+"
    validation:
      - anchor_exists
      - unique_anchor
      - proper_format

  external:
    pattern: "https?://.*"
    validation:
      - url_reachable
      - not_404
      - ssl_valid

  relative:
    pattern: "\\.\\./.*|\\./.*"
    validation:
      - file_exists
      - not_broken
      - correct_path

  api_reference:
    pattern: "@api:.*"
    validation:
      - endpoint_exists
      - correct_format
      - documented
```

#### Link Checking Implementation
```python
class LinkValidator:
    def validate_links(self, document):
        """Validate all links in document."""
        results = {
            'valid': [],
            'broken': [],
            'warnings': []
        }

        links = self.extract_links(document)

        for link in links:
            if link.is_internal():
                result = self.check_internal_link(link)
            elif link.is_external():
                result = self.check_external_link(link)
            elif link.is_relative():
                result = self.check_relative_link(link)
            else:
                result = self.check_api_link(link)

            self.categorize_result(result, results)

        return results

    def check_external_link(self, link):
        """Check external URL validity."""
        try:
            response = requests.head(
                link.url,
                timeout=5,
                allow_redirects=True
            )
            if response.status_code == 200:
                return {'status': 'valid', 'link': link}
            elif response.status_code < 400:
                return {'status': 'warning', 'link': link, 'msg': f'Redirect {response.status_code}'}
            else:
                return {'status': 'broken', 'link': link, 'msg': f'HTTP {response.status_code}'}
        except Exception as e:
            return {'status': 'broken', 'link': link, 'msg': str(e)}
```

### 3. Code Example Testing

#### Syntax Validation
```yaml
code_validators:
  python:
    validator: python_ast
    checks:
      - syntax_valid
      - imports_available
      - no_undefined_variables

  javascript:
    validator: eslint
    checks:
      - syntax_valid
      - no_console
      - no_undefined

  bash:
    validator: shellcheck
    checks:
      - syntax_valid
      - command_exists
      - safe_practices

  sql:
    validator: sqlparse
    checks:
      - syntax_valid
      - table_references
      - standard_compliant
```

#### Example Execution
```python
class CodeExampleValidator:
    def validate_code_examples(self, document):
        """Validate and optionally execute code examples."""
        results = []

        code_blocks = self.extract_code_blocks(document)

        for block in code_blocks:
            language = block.get('language')
            code = block.get('code')

            # Syntax check
            syntax_result = self.check_syntax(code, language)
            results.append(syntax_result)

            # Optional execution (sandboxed)
            if block.get('runnable', False):
                exec_result = self.execute_safely(code, language)
                results.append(exec_result)

        return results

    def execute_safely(self, code, language):
        """Execute code in sandboxed environment."""
        sandbox_config = {
            'timeout': 5,
            'memory_limit': '128MB',
            'network': False,
            'filesystem': 'readonly'
        }

        if language == 'python':
            return self.execute_python_sandbox(code, sandbox_config)
        elif language == 'javascript':
            return self.execute_node_sandbox(code, sandbox_config)
        elif language == 'bash':
            return self.execute_bash_sandbox(code, sandbox_config)
```

### 4. Reading Level Analysis

#### Readability Metrics
```yaml
readability_metrics:
  flesch_kincaid:
    formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    grade_levels:
      8: score < 60
      10: 60 <= score < 70
      12: 70 <= score < 80
      college: score >= 80

  gunning_fog:
    formula: 0.4 * ((words/sentences) + 100 * (complex_words/words))
    complexity_threshold: 3_syllables

  smog:
    formula: 1.0430 * sqrt(complex_words * (30/sentences)) + 3.1291

  automated_readability:
    formula: 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
```

#### Reading Level Implementation
```python
class ReadingLevelAnalyzer:
    def analyze_reading_level(self, text):
        """Analyze text reading level."""
        metrics = {
            'sentences': self.count_sentences(text),
            'words': self.count_words(text),
            'syllables': self.count_syllables(text),
            'complex_words': self.count_complex_words(text),
            'characters': len(text)
        }

        scores = {
            'flesch_kincaid': self.calculate_flesch_kincaid(metrics),
            'gunning_fog': self.calculate_gunning_fog(metrics),
            'smog': self.calculate_smog(metrics),
            'ari': self.calculate_ari(metrics)
        }

        grade_level = self.average_grade_level(scores)

        return {
            'grade_level': grade_level,
            'scores': scores,
            'metrics': metrics,
            'recommendations': self.get_recommendations(grade_level)
        }

    def get_recommendations(self, grade_level):
        """Get recommendations for improving readability."""
        target = 8  # Default target grade level

        if grade_level > target + 2:
            return [
                "Simplify complex sentences",
                "Use shorter words",
                "Break up long paragraphs",
                "Define technical terms",
                "Add examples"
            ]
        elif grade_level < target - 2:
            return [
                "Add more detail",
                "Include technical specifics",
                "Expand explanations"
            ]
        else:
            return ["Reading level is appropriate"]
```

### 5. Format Compliance

#### Markdown Validation
```yaml
markdown_rules:
  heading_hierarchy:
    rule: sequential_levels
    check: h2_follows_h1

  list_formatting:
    rule: consistent_markers
    check: all_bullets_same

  code_blocks:
    rule: language_specified
    check: all_blocks_have_language

  table_formatting:
    rule: proper_alignment
    check: pipes_aligned

  image_references:
    rule: alt_text_required
    check: all_images_have_alt
```

#### HTML Validation
```yaml
html_rules:
  structure:
    - valid_nesting
    - closed_tags
    - unique_ids

  accessibility:
    - alt_attributes
    - aria_labels
    - semantic_html

  standards:
    - w3c_compliance
    - html5_valid
```

## Validation Pipeline

### 1. Pre-Processing
```yaml
preprocessing:
  steps:
    - normalize_whitespace
    - fix_encoding
    - extract_metadata
    - identify_format
```

### 2. Multi-Stage Validation
```yaml
validation_stages:
  stage_1_structure:
    - check_document_format
    - validate_sections
    - verify_hierarchy

  stage_2_content:
    - check_completeness
    - validate_links
    - test_code_examples

  stage_3_quality:
    - analyze_reading_level
    - check_consistency
    - verify_accessibility

  stage_4_final:
    - compile_results
    - generate_report
    - provide_recommendations
```

### 3. Report Generation
```yaml
report_format:
  summary:
    total_issues: number
    critical: number
    warnings: number
    info: number
    score: percentage

  detailed:
    by_category:
      completeness:
        - missing_sections
        - incomplete_content

      links:
        - broken_links
        - redirect_warnings

      code:
        - syntax_errors
        - execution_failures

      readability:
        - grade_level
        - complexity_issues

  recommendations:
    priority_high:
      - fix_broken_links
      - add_missing_sections

    priority_medium:
      - improve_readability
      - update_examples

    priority_low:
      - formatting_improvements
      - style_consistency
```

## Quality Scoring

### Scoring Algorithm
```yaml
scoring:
  weights:
    completeness: 0.3
    link_validity: 0.2
    code_correctness: 0.2
    readability: 0.15
    format_compliance: 0.15

  thresholds:
    excellent: >= 95
    good: >= 85
    acceptable: >= 75
    needs_work: >= 60
    poor: < 60

  calculation: |
    score = sum(
      category_score * weight
      for category, weight in weights
    )
```

### Score Calculation
```python
class QualityScorer:
    def calculate_score(self, validation_results):
        """Calculate overall quality score."""
        weights = {
            'completeness': 0.3,
            'links': 0.2,
            'code': 0.2,
            'readability': 0.15,
            'format': 0.15
        }

        scores = {}
        for category, weight in weights.items():
            category_result = validation_results.get(category, {})
            scores[category] = self.score_category(category_result)

        overall = sum(
            scores[cat] * weights[cat]
            for cat in weights
        )

        return {
            'overall': overall,
            'by_category': scores,
            'grade': self.get_grade(overall),
            'passed': overall >= 75
        }

    def score_category(self, result):
        """Score individual category."""
        total = result.get('total', 0)
        passed = result.get('passed', 0)

        if total == 0:
            return 100

        return (passed / total) * 100
```

## Usage API

### Basic Usage
```python
# Initialize validator
validator = DocumentValidator()

# Validate document
result = validator.validate("README.md")

# Check specific aspects
links = validator.check_links("README.md")
code = validator.check_code_examples("README.md")
reading = validator.check_reading_level("README.md")
```

### Advanced Usage
```python
# Configure validator
validator = DocumentValidator(
    config={
        'check_external_links': True,
        'execute_code': False,
        'target_reading_level': 8,
        'strict_mode': True,
        'custom_rules': my_rules
    }
)

# Validate with custom schema
schema = {
    'required_sections': ['intro', 'api', 'examples'],
    'max_reading_level': 10,
    'min_examples': 5
}

result = validator.validate_against_schema(
    document,
    schema
)

# Batch validation
results = validator.validate_directory(
    "docs/",
    pattern="*.md"
)
```

## Integration with BMAD

### Workflow Integration
```xml
<c cmd="*validate-docs"
   document="{document_path}"
   schema="{schema_file}"
   output_format="json"
   fix_issues="auto">
</c>
```

### Validation Rules Configuration
```yaml
validation_config:
  profiles:
    readme:
      required_sections: [overview, installation, usage, license]
      reading_level: 8
      check_links: true
      test_code: false

    api:
      required_sections: [overview, auth, endpoints, errors]
      reading_level: 10
      check_links: true
      test_code: true

    user_guide:
      required_sections: [intro, start, features]
      reading_level: 8
      check_links: true
      test_code: false
```

## Auto-Fix Capabilities

### Fixable Issues
```yaml
auto_fix:
  formatting:
    - normalize_headings
    - fix_list_markers
    - align_tables
    - fix_code_languages

  links:
    - update_redirects
    - fix_relative_paths
    - remove_broken_links

  content:
    - add_toc
    - generate_anchors
    - fix_typos

  readability:
    - simplify_sentences
    - define_acronyms
    - add_examples
```

### Auto-Fix Implementation
```python
class AutoFixer:
    def fix_document(self, document, issues):
        """Automatically fix detected issues."""
        fixes_applied = []

        for issue in issues:
            if self.can_auto_fix(issue):
                fix = self.get_fix(issue)
                document = self.apply_fix(document, fix)
                fixes_applied.append(fix)

        return {
            'fixed_document': document,
            'fixes_applied': fixes_applied,
            'remaining_issues': self.get_unfixable(issues)
        }
```

## Error Handling

### Validation Errors
```yaml
error_handling:
  missing_document:
    level: error
    message: "Document not found"
    action: abort

  parse_error:
    level: error
    message: "Cannot parse document"
    action: report_and_continue

  timeout:
    level: warning
    message: "Validation timeout"
    action: partial_results

  external_service:
    level: warning
    message: "Cannot check external links"
    action: skip_external
```

## Testing

### Unit Tests
```python
def test_completeness_validation():
    """Test section completeness validation."""
    validator = DocumentValidator()

    document = """
    # Project
    ## Overview
    This is a test project.
    ## Installation
    Run `pip install test`
    """

    result = validator.check_completeness(document, 'readme')
    assert 'usage' in result['missing_sections']
    assert 'license' in result['missing_sections']
```

### Integration Tests
```python
def test_full_validation():
    """Test complete document validation."""
    validator = DocumentValidator()

    result = validator.validate("test/fixtures/sample_readme.md")

    assert result['overall_score'] >= 75
    assert len(result['broken_links']) == 0
    assert result['reading_level'] <= 8.5
```

## Best Practices

1. **Progressive Validation**: Start with structure, then content
2. **Clear Reporting**: Provide actionable feedback
3. **Configurable Rules**: Allow project-specific requirements
4. **Performance**: Cache external link checks
5. **Graceful Degradation**: Continue validation on errors
6. **Accessibility Focus**: Ensure inclusive documentation
7. **Continuous Improvement**: Track validation trends
8. **User-Friendly**: Provide fix suggestions
9. **Automation**: Integrate with CI/CD
10. **Documentation**: Document validation rules