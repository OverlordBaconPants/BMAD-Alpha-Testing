# Tech Writer Workflows Implementation Epic

## Overview
This epic encompasses the implementation of four critical documentation generation workflows for the Tech Writer agent (Yvonne). These workflows will enable automated, intelligent documentation creation across different documentation types while maintaining consistency and quality.

## Epic Goals
- Automate documentation generation for common formats (README, API, User Guide, Architecture)
- Ensure consistent documentation quality across all outputs
- Provide intelligent content generation based on codebase analysis
- Support multiple output formats with appropriate styling
- Maintain 8th-grade reading level default with adjustable complexity

## Shared Components

### 1. Template Engine System
**Location:** `/bmad/bmm/lib/doc-utils/template-engine.md`

**Responsibilities:**
- Variable substitution and resolution
- Section conditional rendering
- Template inheritance and composition
- Markdown/HTML/PDF output generation

**Key Features:**
- Progressive disclosure patterns
- Reading level adjustment
- Code example formatting
- Cross-reference management

### 2. Code Analysis Utilities
**Location:** `/bmad/bmm/lib/doc-utils/code-analyzer.md`

**Capabilities:**
- Function/method extraction with signatures
- Class and interface detection
- Dependency mapping
- Comment and docstring parsing
- Technology stack identification
- Design pattern recognition

**Output Format:**
```yaml
analysis:
  languages: []
  frameworks: []
  entry_points: []
  api_endpoints: []
  core_modules: []
  dependencies: []
```

### 3. Diagram Generation Service
**Location:** `/bmad/bmm/lib/doc-utils/diagram-generator.md`

**Diagram Types:**
- Architecture diagrams (C4 model)
- Sequence diagrams
- Class diagrams
- Data flow diagrams
- Entity relationship diagrams

**Output:** Mermaid syntax for easy integration

### 4. Documentation Validator
**Location:** `/bmad/bmm/lib/doc-utils/validator.md`

**Validation Checks:**
- Completeness verification
- Link validation
- Code example testing
- Reading level analysis
- Format compliance
- Section presence

## Workflow Standards

### Variable Naming Conventions
```yaml
# Input Variables (user-provided or discovered)
project_name: "Project display name"
project_root: "{project-root}"
output_folder: "{output_folder}"
reading_level: "8"  # Default
include_examples: true
include_diagrams: true

# Computed Variables (workflow-generated)
tech_stack: []  # From code analysis
main_language: ""  # Primary programming language
api_count: 0  # Number of endpoints
last_updated: "{date}"
```

### Error Handling Patterns
1. **Graceful Degradation:** Continue with partial data if non-critical components fail
2. **User Notification:** Clear messages about what couldn't be generated and why
3. **Fallback Templates:** Use simpler templates if complex analysis fails
4. **Recovery Suggestions:** Provide actionable steps to resolve issues

### Progress Reporting Format
```
[Analysis Phase] Scanning codebase...
  ✓ Found 23 source files
  ✓ Detected Python/FastAPI stack
  ✓ Identified 12 API endpoints

[Generation Phase] Creating documentation...
  ✓ Generated overview section
  ✓ Created installation guide
  ⚠ Skipped deployment (no config found)

[Validation Phase] Checking quality...
  ✓ All links valid
  ✓ Reading level: Grade 8.2
```

### Validation Checklist Structure
Each workflow should include a checklist template:
```markdown
## Quality Checklist
- [ ] Overview section present
- [ ] Installation instructions included
- [ ] API/Usage examples provided
- [ ] Dependencies documented
- [ ] License information present
- [ ] Contact/support section included
- [ ] All links functional
- [ ] Code examples tested
- [ ] Reading level appropriate
```

## Integration Points

### 1. Agent-Workflow Communication
**Command Invocation:**
```xml
<c cmd="*generate-readme"
   run-workflow="{project-root}/bmad/bmm/workflows/generate-readme/workflow.yaml">
```

**Context Passing:**
- Agent passes: `project_root`, `output_folder`, `reading_level`
- Workflow discovers: `tech_stack`, `project_structure`
- User provides: `project_name`, `description`, `custom_sections`

### 2. Shared Configuration Management
**Config Location:** `/bmad/bmm/config.yaml`

**Shared Settings:**
```yaml
documentation:
  default_reading_level: 8
  default_format: markdown
  include_timestamps: true
  auto_toc: true
  max_section_depth: 3
  code_style: github
  diagram_style: mermaid
```

### 3. Output Directory Structure
```
{output_folder}/
├── README.md                 # Primary readme
├── docs/
│   ├── api/                 # API documentation
│   │   ├── index.md
│   │   └── endpoints/
│   ├── guides/              # User guides
│   │   ├── getting-started.md
│   │   └── advanced.md
│   ├── architecture/        # Architecture docs
│   │   ├── overview.md
│   │   └── diagrams/
│   └── assets/              # Images, diagrams
│       └── diagrams/
```

## Workflow-Specific Considerations

### README Generation
- **Primary Template:** `/bmad/bmm/templates/readme-template.md`
- **Sections:** Overview, Features, Installation, Usage, API Reference, Contributing, License
- **Auto-Discovery:** Package managers, build tools, test frameworks
- **Smart Defaults:** Infer project type and adjust sections accordingly

### API Documentation
- **Primary Template:** `/bmad/bmm/templates/api-template.md`
- **Sections:** Overview, Authentication, Endpoints, Models, Error Codes, Examples
- **Auto-Discovery:** REST endpoints, GraphQL schemas, WebSocket events
- **Format Support:** OpenAPI/Swagger integration

### User Guide
- **Primary Template:** `/bmad/bmm/templates/user-guide-template.md`
- **Sections:** Introduction, Getting Started, Features, Tutorials, Troubleshooting, FAQ
- **Progressive Disclosure:** Basic → Intermediate → Advanced
- **Media Support:** Screenshots, GIFs, embedded videos

### Architecture Documentation
- **Primary Template:** `/bmad/bmm/templates/architecture-template.md`
- **Sections:** System Overview, Components, Data Flow, Deployment, Security, Performance
- **Diagram Types:** C4 models, sequence diagrams, deployment diagrams
- **Technical Depth:** Adjustable based on audience

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create shared component library structure
- [ ] Implement basic template engine
- [ ] Set up code analyzer foundation
- [ ] Create base workflow structure

### Phase 2: README Workflow (Week 2)
- [ ] Implement README workflow
- [ ] Create README template
- [ ] Add smart content discovery
- [ ] Test with various project types

### Phase 3: API Docs Workflow (Week 3)
- [ ] Implement API documentation workflow
- [ ] Create endpoint analyzer
- [ ] Build API template system
- [ ] Add example generation

### Phase 4: User Guide & Architecture (Week 4)
- [ ] Implement User Guide workflow
- [ ] Implement Architecture workflow
- [ ] Create diagram generation
- [ ] Complete validation system

### Phase 5: Polish & Integration (Week 5)
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] User acceptance testing

## Success Metrics

### Quality Metrics
- Documentation completeness score > 90%
- Reading level accuracy ± 0.5 grades
- Zero broken links in generated docs
- Code examples execution rate > 95%

### Performance Targets
- README generation < 30 seconds
- API docs generation < 60 seconds
- Full architecture docs < 2 minutes
- Incremental updates < 10 seconds

### User Acceptance Criteria
- Documentation requires < 10% manual editing
- Covers all critical sections automatically
- Maintains consistent style across outputs
- Provides actionable improvement suggestions

## Technical Dependencies

### Required BMAD Components
- `/bmad/core/tasks/workflow.md` - Workflow execution engine
- `/bmad/core/tasks/create-doc.md` - Document creation task
- `/bmad/core/tasks/validate-workflow.md` - Validation task
- `/bmad/core/tasks/adv-elicit.md` - Advanced elicitation

### External Tools
- Language parsers (AST analysis)
- Markdown processors
- Mermaid diagram renderer
- Reading level analyzers

## Risk Mitigation

### Identified Risks
1. **Complex Codebases:** May timeout or produce incomplete analysis
   - *Mitigation:* Implement incremental analysis with caching

2. **Language Support:** Not all languages equally supported
   - *Mitigation:* Start with top 5 languages, expand gradually

3. **Template Rigidity:** Fixed templates may not fit all projects
   - *Mitigation:* Highly modular template system with customization

4. **Performance Issues:** Large projects may be slow
   - *Mitigation:* Parallel processing, smart caching, progressive generation

## Notes for Implementers

### Best Practices
1. **Start Simple:** Get basic generation working before adding intelligence
2. **Test Diverse Projects:** Use various project types for testing
3. **User Feedback Loop:** Iterate based on actual usage patterns
4. **Modular Design:** Keep components loosely coupled for reusability
5. **Documentation:** Document the workflows themselves thoroughly

### Common Pitfalls to Avoid
- Over-engineering the template system initially
- Hardcoding language-specific assumptions
- Ignoring edge cases (empty projects, monorepos)
- Not handling missing dependencies gracefully
- Forgetting about incremental updates

### Resources
- [BMAD Workflow Documentation](bmad/core/tasks/workflow.md)
- [Template Best Practices](bmad/bmm/templates/README.md)
- [Code Analysis Patterns](bmad/bmm/lib/patterns.md)

---

*Epic Owner: Overlord BaconPants*
*Created: 2025-09-29*
*Target Completion: 5 weeks*
*Status: Planning Phase*