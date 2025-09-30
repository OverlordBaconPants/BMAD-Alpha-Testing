# Tech Writer Workflows Acceptance Tests
# Using Gherkin-style BDD/ATDD format for clear acceptance criteria

Feature: Tech Writer Documentation Generation Workflows
  As a technical writer using the BMAD method
  I want to automatically generate high-quality documentation
  So that I can maintain consistent, comprehensive docs with minimal effort

  Background:
    Given the BMAD tech writer agent Yvonne is configured
    And the project root is identified
    And the output folder is specified

  # README Generation Workflow Tests
  Scenario: Generate README for a Python project
    Given a Python project with FastAPI framework
    And the project has 12 API endpoints
    And the project has a requirements.txt file
    When I execute the generate-readme workflow
    Then a README.md should be created in the output folder
    And the README should contain the following sections:
      | Section         | Required |
      | Overview        | Yes      |
      | Features        | Yes      |
      | Installation    | Yes      |
      | Usage           | Yes      |
      | API Reference   | Yes      |
      | Contributing    | Yes      |
      | License         | Yes      |
    And the reading level should be grade 8 ± 0.5
    And all code examples should be syntactically correct
    And the generation should complete within 30 seconds

  Scenario: Generate README with custom sections
    Given a project with custom documentation needs
    And the user provides custom sections:
      """
      deployment: Deployment instructions
      security: Security considerations
      performance: Performance notes
      """
    When I execute the generate-readme workflow
    Then the README should include all custom sections
    And custom sections should integrate seamlessly with standard sections

  # API Documentation Workflow Tests
  Scenario: Generate API documentation for REST endpoints
    Given a RESTful API with 25 endpoints
    And the API uses JWT authentication
    And OpenAPI/Swagger spec is available
    When I execute the generate-api-docs workflow
    Then API documentation should be created in docs/api/
    And the documentation should include:
      | Component       | Details                    |
      | Overview        | API purpose and scope      |
      | Authentication  | JWT token usage            |
      | Endpoints       | All 25 endpoints documented|
      | Models          | Request/response schemas   |
      | Error Codes     | Comprehensive error list   |
      | Examples        | cURL and SDK examples      |
    And response examples should be valid JSON
    And the generation should complete within 60 seconds

  Scenario: Generate API docs without OpenAPI spec
    Given a REST API without OpenAPI specification
    When I execute the generate-api-docs workflow
    Then the workflow should analyze code to discover endpoints
    And generate documentation based on code analysis
    And notify about any endpoints that couldn't be fully documented

  # User Guide Workflow Tests
  Scenario: Generate user guide with progressive disclosure
    Given a complex application with multiple user roles
    When I execute the generate-user-guide workflow
    Then a user guide should be created in docs/guides/
    And the guide should use progressive disclosure:
      | Level        | Content Type                |
      | Basic        | Getting started, core tasks |
      | Intermediate | Advanced features, tips     |
      | Advanced     | Power user features, API    |
    And include appropriate media placeholders for screenshots
    And maintain grade 8 reading level for basic content

  Scenario: Generate user guide with tutorials
    Given a project requiring step-by-step tutorials
    When I execute the generate-user-guide workflow with tutorials flag
    Then the guide should include interactive tutorials
    And each tutorial should have:
      | Component    | Description              |
      | Objective    | Clear learning goal      |
      | Prerequisites| Required knowledge       |
      | Steps        | Numbered instructions    |
      | Validation   | Success criteria         |
      | Troubleshoot | Common issues            |

  # Architecture Documentation Workflow Tests
  Scenario: Generate architecture documentation with C4 diagrams
    Given a microservices architecture
    When I execute the generate-architecture-docs workflow
    Then architecture docs should be created in docs/architecture/
    And include C4 model diagrams:
      | Level    | Diagram Type                |
      | Context  | System context diagram      |
      | Container| Container diagram           |
      | Component| Component diagrams          |
      | Code     | Class diagrams (optional)   |
    And diagrams should be in Mermaid format
    And include deployment architecture
    And the generation should complete within 2 minutes

  Scenario: Generate architecture docs for monolithic application
    Given a monolithic application architecture
    When I execute the generate-architecture-docs workflow
    Then the documentation should focus on:
      | Aspect      | Coverage                    |
      | Layers      | Presentation, business, data|
      | Modules     | Core module breakdown       |
      | Data Flow   | Request lifecycle           |
      | Deployment  | Single deployment unit      |

  # Shared Component Tests
  Scenario: Template engine processes variables correctly
    Given a template with variables:
      """
      # {project_name}
      Version: {version}
      Last Updated: {last_updated}
      """
    And variable values:
      | Variable     | Value          |
      | project_name | My Project     |
      | version      | 1.0.0          |
      | last_updated | 2025-09-29     |
    When the template engine processes the template
    Then the output should have all variables substituted
    And maintain proper markdown formatting

  Scenario: Code analyzer identifies technology stack
    Given a project with multiple languages and frameworks
    When the code analyzer scans the project
    Then it should identify:
      | Component   | Expected Result              |
      | Languages   | Python, JavaScript, SQL      |
      | Frameworks  | FastAPI, React, PostgreSQL   |
      | Entry Points| main.py, index.js           |
      | APIs        | REST endpoints count         |
      | Dependencies| All package dependencies     |

  Scenario: Documentation validator ensures quality
    Given generated documentation
    When the validator checks the documentation
    Then it should verify:
      | Check            | Criteria                  |
      | Completeness     | All sections present      |
      | Links            | No broken links           |
      | Code Examples    | Syntactically correct     |
      | Reading Level    | Within target range       |
      | Format           | Valid markdown/HTML       |

  # Error Handling Tests
  Scenario: Handle missing project information gracefully
    Given a project with minimal information
    When I execute any documentation workflow
    Then the workflow should:
      | Action          | Result                     |
      | Continue        | Generate with available data|
      | Notify          | List missing information   |
      | Suggest        | Provide improvement steps  |
      | Fallback       | Use simpler templates      |

  Scenario: Handle large codebases efficiently
    Given a project with over 1000 files
    When I execute documentation workflows
    Then the system should:
      | Strategy        | Implementation            |
      | Cache          | Cache analysis results    |
      | Incremental    | Support incremental updates|
      | Parallel       | Process in parallel       |
      | Timeout        | Implement reasonable timeouts|

  # Integration Tests
  Scenario: All workflows integrate with Yvonne agent
    Given the tech writer agent Yvonne
    When Yvonne invokes any documentation workflow
    Then the workflow should:
      | Requirement     | Behavior                  |
      | Context        | Receive agent context     |
      | Discovery      | Auto-discover project info|
      | Customization  | Accept user preferences   |
      | Output         | Generate in specified folder|
      | Validation     | Return validation results |

  # Success Metrics Validation
  Scenario: Validate documentation quality metrics
    Given completed documentation generation
    When measuring success metrics
    Then the results should meet:
      | Metric                    | Target           |
      | Completeness Score        | > 90%            |
      | Reading Level Accuracy    | ± 0.5 grades     |
      | Broken Links              | 0                |
      | Code Example Success Rate | > 95%            |
      | Manual Editing Required   | < 10%            |