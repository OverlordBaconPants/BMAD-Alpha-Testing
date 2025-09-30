# Code Analysis Utilities

## Overview
The Code Analyzer provides comprehensive codebase analysis for intelligent documentation generation, including language detection, framework identification, API discovery, and dependency mapping.

## Core Capabilities

### 1. Language Detection
```yaml
detection_methods:
  file_extensions:
    priority: 1
    mapping:
      ".py": python
      ".js": javascript
      ".ts": typescript
      ".java": java
      ".go": golang
      ".rs": rust
      ".cpp": cpp
      ".rb": ruby

  shebang_analysis:
    priority: 2
    patterns:
      "#!/usr/bin/env python": python
      "#!/usr/bin/env node": javascript
      "#!/usr/bin/env ruby": ruby

  content_analysis:
    priority: 3
    patterns:
      "import pandas": python
      "require('express')": javascript
      "use std::": rust
```

### 2. Framework Detection
```yaml
frameworks:
  python:
    fastapi:
      indicators:
        - "from fastapi import"
        - "FastAPI()"
      config_files: ["pyproject.toml", "requirements.txt"]

    django:
      indicators:
        - "from django"
        - "DJANGO_SETTINGS_MODULE"
      config_files: ["manage.py", "settings.py"]

    flask:
      indicators:
        - "from flask import"
        - "Flask(__name__)"
      config_files: ["app.py", "wsgi.py"]

  javascript:
    react:
      indicators:
        - "import React"
        - "from 'react'"
      config_files: ["package.json:react"]

    vue:
      indicators:
        - "import Vue"
        - ".vue files"
      config_files: ["package.json:vue"]

    express:
      indicators:
        - "require('express')"
        - "app.listen("
      config_files: ["package.json:express"]
```

### 3. API Endpoint Discovery
```yaml
endpoint_patterns:
  rest:
    python_fastapi:
      decorators: ["@app.get", "@app.post", "@app.put", "@app.delete", "@router."]
      extraction: |
        @app.{method}("{path}")
        async def {function_name}({parameters}):

    python_flask:
      decorators: ["@app.route", "@blueprint.route"]
      extraction: |
        @app.route("{path}", methods=[{methods}])
        def {function_name}({parameters}):

    javascript_express:
      patterns: ["app.get(", "app.post(", "router."]
      extraction: |
        app.{method}("{path}", {middleware}, (req, res) => {

  graphql:
    schema_files: ["schema.graphql", "*.graphql"]
    code_patterns:
      - "type Query"
      - "type Mutation"
      - "@Resolver"

  websocket:
    patterns:
      - "io.on('connection'"
      - "@WebSocketGateway"
      - "ws.on('message'"
```

### 4. Class and Interface Detection
```yaml
class_extraction:
  python:
    pattern: |
      class {ClassName}({Inheritance}):
          """?{Docstring}"""?
          {Methods}

    interface_pattern: |
      from typing import Protocol

      class {InterfaceName}(Protocol):
          {Methods}

  typescript:
    class_pattern: |
      class {ClassName} {implements}? {extends}? {
          {Properties}
          {Methods}
      }

    interface_pattern: |
      interface {InterfaceName} {extends}? {
          {Properties}
          {Methods}
      }

  java:
    class_pattern: |
      {modifiers} class {ClassName} {extends}? {implements}? {
          {Fields}
          {Methods}
      }
```

### 5. Dependency Mapping
```yaml
dependency_sources:
  python:
    files:
      - requirements.txt
      - Pipfile
      - pyproject.toml
      - setup.py
      - environment.yml

  javascript:
    files:
      - package.json
      - yarn.lock
      - package-lock.json

  java:
    files:
      - pom.xml
      - build.gradle
      - build.gradle.kts

  go:
    files:
      - go.mod
      - go.sum

  rust:
    files:
      - Cargo.toml
      - Cargo.lock
```

## Analysis Output Format

### Standard Output Schema
```yaml
analysis:
  metadata:
    analyzed_at: "2025-09-29T10:00:00Z"
    total_files: 150
    total_lines: 25000
    analysis_time: 5.2

  languages:
    - name: python
      percentage: 65
      files: 98
      lines: 16250

    - name: javascript
      percentage: 30
      files: 45
      lines: 7500

    - name: sql
      percentage: 5
      files: 7
      lines: 1250

  frameworks:
    - name: fastapi
      version: "0.104.0"
      confidence: high

    - name: react
      version: "18.2.0"
      confidence: high

  entry_points:
    - file: main.py
      type: application
      command: "python main.py"

    - file: index.js
      type: web
      command: "npm start"

  api_endpoints:
    - method: GET
      path: /api/users
      handler: get_users
      file: api/users.py:45
      authentication: required

    - method: POST
      path: /api/users
      handler: create_user
      file: api/users.py:67
      authentication: required

  core_modules:
    - name: authentication
      path: src/auth
      purpose: User authentication and authorization
      dependencies: ["jwt", "bcrypt"]

    - name: database
      path: src/db
      purpose: Database models and connections
      dependencies: ["sqlalchemy", "alembic"]

  dependencies:
    production:
      - name: fastapi
        version: "0.104.0"
        license: MIT

      - name: sqlalchemy
        version: "2.0.0"
        license: MIT

    development:
      - name: pytest
        version: "7.4.0"
        license: MIT

  design_patterns:
    - pattern: Repository
      locations: ["src/repositories/*.py"]
      confidence: high

    - pattern: Factory
      locations: ["src/factories/*.py"]
      confidence: medium

  database:
    type: postgresql
    orm: sqlalchemy
    migrations: alembic
    models_count: 15
```

## AST Analysis

### Python AST Processing
```python
import ast

class PythonAnalyzer:
    def analyze_file(self, file_path):
        with open(file_path, 'r') as f:
            tree = ast.parse(f.read())

        return {
            'classes': self.extract_classes(tree),
            'functions': self.extract_functions(tree),
            'imports': self.extract_imports(tree),
            'decorators': self.extract_decorators(tree),
        }

    def extract_classes(self, tree):
        classes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                classes.append({
                    'name': node.name,
                    'bases': [b.id for b in node.bases if hasattr(b, 'id')],
                    'methods': [m.name for m in node.body if isinstance(m, ast.FunctionDef)],
                    'docstring': ast.get_docstring(node),
                    'line': node.lineno
                })
        return classes

    def extract_functions(self, tree):
        functions = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                functions.append({
                    'name': node.name,
                    'args': [arg.arg for arg in node.args.args],
                    'returns': self.get_return_annotation(node),
                    'docstring': ast.get_docstring(node),
                    'decorators': [d.id for d in node.decorator_list if hasattr(d, 'id')],
                    'line': node.lineno
                })
        return functions
```

### JavaScript/TypeScript AST Processing
```yaml
parser_config:
  parser: "@babel/parser"
  plugins:
    - typescript
    - jsx
    - decorators
    - classProperties

analysis_visitors:
  ClassDeclaration:
    extract: [name, superClass, methods, properties]

  FunctionDeclaration:
    extract: [name, params, returnType, async]

  ImportDeclaration:
    extract: [source, specifiers]

  ExportDeclaration:
    extract: [declaration, specifiers, source]
```

## Comment and Documentation Extraction

### Docstring Patterns
```yaml
docstring_patterns:
  python:
    google_style: |
      """Summary line.

      Args:
          param1: Description
          param2: Description

      Returns:
          Description

      Raises:
          ExceptionType: Description
      """

    numpy_style: |
      """
      Summary line.

      Parameters
      ----------
      param1 : type
          Description

      Returns
      -------
      type
          Description
      """

  javascript:
    jsdoc: |
      /**
       * Summary
       * @param {type} param - Description
       * @returns {type} Description
       * @throws {Error} Description
       */

  java:
    javadoc: |
      /**
       * Summary
       * @param param Description
       * @return Description
       * @throws Exception Description
       */
```

## Technology Stack Identification

### Stack Detection Rules
```yaml
stack_detection:
  frontend:
    indicators:
      - package.json contains "react|vue|angular"
      - presence of .jsx|.tsx|.vue files
      - webpack.config.js exists

    stack_types:
      spa: ["react", "vue", "angular"]
      ssr: ["next.js", "nuxt.js", "gatsby"]
      static: ["jekyll", "hugo", "11ty"]

  backend:
    indicators:
      - server file patterns
      - API route definitions
      - database configurations

    stack_types:
      api: ["fastapi", "express", "django-rest"]
      fullstack: ["django", "rails", "laravel"]
      microservices: ["kubernetes", "docker-compose"]

  database:
    indicators:
      - connection strings
      - ORM configurations
      - migration files

    types:
      relational: ["postgresql", "mysql", "sqlite"]
      nosql: ["mongodb", "redis", "elasticsearch"]
      graph: ["neo4j", "dgraph"]
```

## Design Pattern Recognition

### Pattern Detection
```yaml
patterns:
  creational:
    singleton:
      indicators:
        - single instance enforcement
        - private constructor
        - static getInstance method

    factory:
      indicators:
        - create* methods
        - abstract product creation
        - factory classes/functions

  structural:
    repository:
      indicators:
        - data access abstraction
        - CRUD operations
        - entity management

    adapter:
      indicators:
        - interface translation
        - wrapper classes
        - compatibility layers

  behavioral:
    observer:
      indicators:
        - event emitters
        - subscribers/listeners
        - notification mechanisms

    strategy:
      indicators:
        - algorithm families
        - runtime selection
        - interface implementation
```

## Performance Optimization

### Analysis Strategies
```yaml
optimization:
  file_filtering:
    ignore_patterns:
      - node_modules/
      - .git/
      - dist/
      - build/
      - "*.min.js"
      - __pycache__/

    max_file_size: 1MB

  parallel_processing:
    enabled: true
    max_workers: 8
    chunk_size: 100_files

  caching:
    file_hash_cache: true
    ast_cache: true
    result_cache: true
    ttl: 3600

  incremental_analysis:
    enabled: true
    track_changes: git
    analyze_diff_only: true
```

## Usage API

### Basic Usage
```python
analyzer = CodeAnalyzer(project_root="/path/to/project")

# Full analysis
result = analyzer.analyze()

# Specific analysis
languages = analyzer.detect_languages()
frameworks = analyzer.detect_frameworks()
apis = analyzer.discover_apis()
dependencies = analyzer.map_dependencies()
```

### Advanced Configuration
```python
analyzer = CodeAnalyzer(
    project_root="/path/to/project",
    config={
        "max_depth": 10,
        "ignore_patterns": ["test/", "docs/"],
        "parallel": True,
        "cache_results": True,
        "include_metrics": True,
        "extract_todos": True,
    }
)

# Custom pattern registration
analyzer.register_pattern("custom_framework", {
    "indicators": ["@CustomDecorator"],
    "config_files": ["custom.config.js"]
})

# Incremental analysis
changes = analyzer.analyze_changes(since="last_commit")
```

## Integration with BMAD

### Workflow Integration
```xml
<c cmd="*analyze-code"
   project_root="{project_root}"
   output_format="yaml"
   include_metrics="true"
   cache="true">
</c>
```

### Output Usage in Templates
```yaml
template_variables:
  from_analysis:
    tech_stack: analysis.frameworks
    main_language: analysis.languages[0].name
    api_count: analysis.api_endpoints.length
    dependency_count: analysis.dependencies.production.length
    has_tests: analysis.core_modules.any(name="test")
```

## Error Handling

### Common Issues
```yaml
errors:
  permission_denied:
    handle: skip_file
    log: warning
    message: "Skipping {file}: Permission denied"

  parse_error:
    handle: partial_analysis
    log: warning
    message: "Parse error in {file}: {error}"

  timeout:
    handle: partial_results
    log: error
    message: "Analysis timeout after {time}s"

  memory_limit:
    handle: reduce_parallel
    log: warning
    message: "Memory limit reached, reducing parallel workers"
```

## Testing Utilities

### Unit Tests
```python
def test_language_detection():
    """Test language detection accuracy."""
    analyzer = CodeAnalyzer()

    # Test Python detection
    assert analyzer.detect_language("app.py") == "python"
    assert analyzer.detect_language("#!/usr/bin/env python") == "python"

    # Test JavaScript detection
    assert analyzer.detect_language("app.js") == "javascript"
    assert analyzer.detect_language("const express = require") == "javascript"
```

### Integration Tests
```python
def test_full_analysis():
    """Test complete codebase analysis."""
    analyzer = CodeAnalyzer("test/fixtures/sample-project")
    result = analyzer.analyze()

    assert "python" in [lang["name"] for lang in result["languages"]]
    assert "fastapi" in [fw["name"] for fw in result["frameworks"]]
    assert len(result["api_endpoints"]) > 0
    assert len(result["dependencies"]["production"]) > 0
```