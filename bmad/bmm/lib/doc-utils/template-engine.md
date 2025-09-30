# Template Engine System

## Overview
The Template Engine provides variable substitution, conditional rendering, and template composition for documentation generation.

## Core Features

### 1. Variable Substitution
```yaml
syntax:
  basic: "{variable_name}"
  nested: "{section.variable}"
  default: "{variable|default_value}"
  computed: "{@function:parameter}"
```

### 2. Conditional Rendering
```yaml
conditions:
  if_exists: "{{#if variable}}content{{/if}}"
  if_not: "{{^if variable}}content{{/if}}"
  if_equals: "{{#if variable == 'value'}}content{{/if}}"
  if_contains: "{{#if list contains 'item'}}content{{/if}}"
```

### 3. Template Inheritance
```yaml
inheritance:
  extends: "{{extends base-template.md}}"
  blocks: "{{block section_name}}content{{/block}}"
  include: "{{include partial-template.md}}"
  override: "{{super}}additional content"
```

### 4. Iterators and Lists
```yaml
iterators:
  for_each: |
    {{#each items as item}}
    - {item.name}: {item.description}
    {{/each}}

  with_index: |
    {{#each items as item index}}
    {index}. {item}
    {{/each}}
```

### 5. Filters and Transformations
```yaml
filters:
  uppercase: "{variable|upper}"
  lowercase: "{variable|lower}"
  capitalize: "{variable|capitalize}"
  truncate: "{variable|truncate:50}"
  markdown_escape: "{variable|md_escape}"
  code_format: "{variable|code:python}"
  reading_level: "{content|adjust_reading:8}"
```

## Template Processing Pipeline

### Phase 1: Template Loading
```yaml
steps:
  - load_template: Read template file
  - parse_structure: Identify blocks and inheritance
  - resolve_includes: Load included templates
  - merge_inheritance: Apply template inheritance
```

### Phase 2: Variable Resolution
```yaml
steps:
  - collect_variables: Identify all variable placeholders
  - resolve_context: Load variable values from context
  - compute_dynamic: Calculate computed variables
  - apply_defaults: Use default values for missing variables
```

### Phase 3: Conditional Processing
```yaml
steps:
  - evaluate_conditions: Process if/else blocks
  - process_loops: Execute iterators
  - apply_filters: Transform values through filters
  - clean_empty: Remove empty sections
```

### Phase 4: Output Generation
```yaml
steps:
  - format_output: Apply output format (MD/HTML/PDF)
  - validate_syntax: Check output validity
  - optimize_whitespace: Clean extra whitespace
  - generate_toc: Create table of contents if needed
```

## Progressive Disclosure Implementation

### Content Levels
```yaml
levels:
  basic:
    reading_level: 8
    sections: [overview, getting_started, basic_usage]
    complexity: simple

  intermediate:
    reading_level: 10
    sections: [all_basic, advanced_features, configuration]
    complexity: moderate

  advanced:
    reading_level: 12
    sections: [all, internals, api_reference]
    complexity: detailed
```

### Disclosure Markers
```markdown
<!-- disclosure:basic -->
This is basic content visible to all users.
<!-- /disclosure:basic -->

<!-- disclosure:intermediate -->
This content appears for intermediate and advanced users.
<!-- /disclosure:intermediate -->

<!-- disclosure:advanced -->
Deep technical content for advanced users only.
<!-- /disclosure:advanced -->
```

## Reading Level Adjustment

### Simplification Rules
```yaml
simplification:
  grade_8:
    sentence_length: max_20_words
    syllables_per_word: max_2
    passive_voice: avoid
    technical_terms: explain_first_use

  grade_10:
    sentence_length: max_25_words
    syllables_per_word: max_3
    passive_voice: minimal
    technical_terms: glossary_link

  grade_12:
    sentence_length: unrestricted
    syllables_per_word: unrestricted
    passive_voice: allowed
    technical_terms: assumed_knowledge
```

## Code Example Formatting

### Syntax Highlighting
```yaml
languages:
  python:
    highlighter: pygments
    style: monokai
  javascript:
    highlighter: prism
    style: tomorrow
  yaml:
    highlighter: pygments
    style: default
```

### Example Template
```markdown
{{#code language="python" title="Example Usage" line_numbers=true}}
def process_template(template_str, context):
    """Process a template with given context."""
    engine = TemplateEngine()
    return engine.render(template_str, context)
{{/code}}
```

## Cross-Reference Management

### Reference Types
```yaml
references:
  internal:
    syntax: "[text](#anchor)"
    validation: check_anchor_exists

  external:
    syntax: "[text](url)"
    validation: check_url_valid

  cross_doc:
    syntax: "[text](../other-doc.md#anchor)"
    validation: check_file_and_anchor

  api:
    syntax: "[@api:ClassName.method]"
    resolution: link_to_api_docs
```

## Error Handling

### Error Types
```yaml
errors:
  missing_variable:
    level: warning
    action: use_default_or_empty
    message: "Variable '{name}' not found, using default"

  invalid_template:
    level: error
    action: abort_processing
    message: "Template syntax error at line {line}"

  circular_include:
    level: error
    action: abort_processing
    message: "Circular template inclusion detected"
```

## Usage API

### Basic Usage
```python
# Initialize engine
engine = TemplateEngine()

# Load template
template = engine.load_template("readme-template.md")

# Prepare context
context = {
    "project_name": "My Project",
    "version": "1.0.0",
    "features": ["Feature 1", "Feature 2"],
    "api_endpoints": [...],
}

# Render template
output = engine.render(template, context)

# Save output
engine.save(output, "README.md")
```

### Advanced Configuration
```python
# Configure engine
engine = TemplateEngine(
    config={
        "reading_level": 8,
        "progressive_disclosure": True,
        "include_toc": True,
        "validate_links": True,
        "code_execution": False,  # Safety: don't execute code blocks
    }
)

# Register custom filters
engine.register_filter("custom", my_custom_filter)

# Set template paths
engine.set_template_dirs([
    "/bmad/bmm/templates",
    "/project/templates"
])
```

## Integration Points

### BMAD Workflow Integration
```xml
<c cmd="*template-render"
   template="{template_path}"
   context="{context_file}"
   output="{output_path}"
   reading_level="8">
</c>
```

### Context Schema
```yaml
context:
  required:
    project_name: string
    project_root: path
    output_folder: path

  optional:
    version: string
    description: string
    features: array
    custom_sections: object
    reading_level: number
    include_diagrams: boolean
```

## Performance Optimization

### Caching Strategy
```yaml
cache:
  template_cache:
    type: memory
    ttl: 3600
    key: template_path_hash

  rendered_cache:
    type: disk
    ttl: 86400
    key: template_context_hash

  compiled_cache:
    type: memory
    ttl: 7200
    key: template_ast_hash
```

### Parallel Processing
```yaml
parallel:
  section_rendering: true
  max_workers: 4
  chunk_size: 1000_lines
  merge_strategy: sequential
```

## Testing Utilities

### Template Testing
```python
def test_template_rendering():
    """Test template renders correctly."""
    engine = TemplateEngine()

    template = """
    # {project_name}
    Version: {version}

    {{#if features}}
    ## Features
    {{#each features as feature}}
    - {feature}
    {{/each}}
    {{/if}}
    """

    context = {
        "project_name": "Test Project",
        "version": "1.0.0",
        "features": ["Feature A", "Feature B"]
    }

    result = engine.render(template, context)

    assert "# Test Project" in result
    assert "Version: 1.0.0" in result
    assert "- Feature A" in result
    assert "- Feature B" in result
```

### Validation Testing
```python
def test_template_validation():
    """Test template validation."""
    engine = TemplateEngine()

    # Valid template
    valid = engine.validate("# {title}")
    assert valid.is_valid

    # Invalid template
    invalid = engine.validate("# {title")
    assert not invalid.is_valid
    assert "Unclosed variable" in invalid.errors[0]
```

## Best Practices

1. **Variable Naming**: Use snake_case for variables
2. **Template Organization**: One template per document type
3. **Conditional Sections**: Use sparingly, prefer includes
4. **Performance**: Cache rendered sections when possible
5. **Security**: Never execute user-provided code
6. **Validation**: Always validate before rendering
7. **Error Messages**: Provide context-aware error messages
8. **Documentation**: Document all custom filters and functions