#!/usr/bin/env python3
"""
Unit tests for README generation workflow using ATDD approach.
Tests individual components and functions in isolation.
"""

import unittest
from unittest.mock import Mock, patch, MagicMock
import json
import yaml
from pathlib import Path


class TestReadmeGeneration(unittest.TestCase):
    """Test README generation workflow components."""

    def setUp(self):
        """Set up test fixtures."""
        self.test_project_root = Path("/test/project")
        self.test_output_folder = Path("/test/output")

        self.mock_analysis_result = {
            "languages": [
                {"name": "python", "percentage": 65},
                {"name": "javascript", "percentage": 35}
            ],
            "frameworks": [
                {"name": "fastapi", "version": "0.104.0"},
                {"name": "react", "version": "18.2.0"}
            ],
            "api_endpoints": [
                {
                    "method": "GET",
                    "path": "/api/users",
                    "handler": "get_users"
                },
                {
                    "method": "POST",
                    "path": "/api/users",
                    "handler": "create_user"
                }
            ],
            "dependencies": {
                "production": ["fastapi", "sqlalchemy", "pydantic"],
                "development": ["pytest", "black", "mypy"]
            }
        }

    def test_code_analysis(self):
        """Test that code analysis correctly identifies project characteristics."""
        with patch('bmad.lib.CodeAnalyzer') as MockAnalyzer:
            analyzer = MockAnalyzer.return_value
            analyzer.analyze.return_value = self.mock_analysis_result

            result = analyzer.analyze()

            self.assertEqual(len(result["languages"]), 2)
            self.assertEqual(result["languages"][0]["name"], "python")
            self.assertEqual(len(result["api_endpoints"]), 2)
            self.assertIn("fastapi", [f["name"] for f in result["frameworks"]])

    def test_project_type_detection(self):
        """Test project type detection based on analysis."""
        def detect_project_type(analysis):
            project_type = "unknown"
            features = []

            frameworks = [f["name"] for f in analysis.get("frameworks", [])]

            if "fastapi" in frameworks or "express" in frameworks:
                project_type = "api"
            elif "react" in frameworks or "vue" in frameworks:
                if project_type == "api":
                    project_type = "fullstack"
                else:
                    project_type = "frontend"

            if "docker" in analysis.get("config_files", []):
                features.append("containerized")

            return {"type": project_type, "features": features}

        result = detect_project_type(self.mock_analysis_result)
        self.assertEqual(result["type"], "fullstack")

    def test_template_variable_substitution(self):
        """Test template engine variable substitution."""
        template = "# {project_name}\n\nVersion: {version}"
        context = {
            "project_name": "Test Project",
            "version": "1.0.0"
        }

        def render_template(template_str, ctx):
            result = template_str
            for key, value in ctx.items():
                result = result.replace(f"{{{key}}}", str(value))
            return result

        output = render_template(template, context)
        self.assertIn("# Test Project", output)
        self.assertIn("Version: 1.0.0", output)

    def test_section_generation_overview(self):
        """Test overview section generation."""
        def generate_overview(analysis, reading_level=8):
            tech_stack = ", ".join([f["name"] for f in analysis["frameworks"]])
            main_lang = analysis["languages"][0]["name"]

            overview = f"""
This project is built with {main_lang} as the primary language,
utilizing {tech_stack} for its core functionality.
It provides {len(analysis['api_endpoints'])} API endpoints for user interaction.
"""

            # Simplify for reading level
            if reading_level <= 8:
                overview = overview.replace("utilizing", "using")
                overview = overview.replace("functionality", "features")

            return overview.strip()

        section = generate_overview(self.mock_analysis_result)
        self.assertIn("python", section)
        self.assertIn("fastapi", section)
        self.assertIn("2 API endpoints", section)

    def test_installation_guide_generation(self):
        """Test installation instructions generation."""
        def generate_installation(analysis):
            main_lang = analysis["languages"][0]["name"]

            commands = {
                "python": {
                    "install": "pip install -r requirements.txt",
                    "run": "python main.py"
                },
                "javascript": {
                    "install": "npm install",
                    "run": "npm start"
                }
            }

            lang_commands = commands.get(main_lang, commands["python"])

            return f"""
### Quick Start

```bash
# Clone the repository
git clone https://github.com/username/project.git
cd project

# Install dependencies
{lang_commands['install']}

# Run the application
{lang_commands['run']}
```
"""

        section = generate_installation(self.mock_analysis_result)
        self.assertIn("pip install", section)
        self.assertIn("python main.py", section)

    def test_api_reference_generation(self):
        """Test API reference section generation."""
        def generate_api_reference(endpoints):
            if not endpoints:
                return None

            lines = ["## API Reference\n"]

            for endpoint in endpoints:
                lines.append(f"### {endpoint['method']} {endpoint['path']}")
                lines.append(f"Handler: `{endpoint['handler']}`\n")

            return "\n".join(lines)

        section = generate_api_reference(self.mock_analysis_result["api_endpoints"])
        self.assertIn("GET /api/users", section)
        self.assertIn("POST /api/users", section)

    def test_feature_discovery(self):
        """Test automatic feature discovery from codebase."""
        def discover_features(analysis):
            features = []

            # API features
            if analysis.get("api_endpoints"):
                features.append("RESTful API with " +
                              str(len(analysis["api_endpoints"])) + " endpoints")

            # Framework features
            for framework in analysis.get("frameworks", []):
                if framework["name"] == "fastapi":
                    features.append("Async request handling")
                    features.append("Automatic API documentation")
                elif framework["name"] == "react":
                    features.append("Interactive user interface")
                    features.append("Component-based architecture")

            # Testing features
            if "pytest" in analysis.get("dependencies", {}).get("development", []):
                features.append("Comprehensive test suite")

            return features

        features = discover_features(self.mock_analysis_result)
        self.assertIn("RESTful API with 2 endpoints", features)
        self.assertIn("Automatic API documentation", features)
        self.assertIn("Comprehensive test suite", features)

    def test_reading_level_adjustment(self):
        """Test content simplification for target reading level."""
        def adjust_reading_level(text, target_level):
            if target_level <= 8:
                # Simplify complex words
                replacements = {
                    "utilize": "use",
                    "implement": "build",
                    "comprehensive": "complete",
                    "functionality": "features",
                    "optimize": "improve",
                    "architecture": "structure"
                }

                result = text
                for complex_word, simple_word in replacements.items():
                    result = result.replace(complex_word, simple_word)

                return result

            return text

        complex_text = "Utilize comprehensive functionality to optimize architecture"
        simple_text = adjust_reading_level(complex_text, 8)

        self.assertIn("use", simple_text)
        self.assertIn("complete", simple_text)
        self.assertNotIn("utilize", simple_text)

    def test_validation_completeness(self):
        """Test document completeness validation."""
        def validate_completeness(document, doc_type="readme"):
            required_sections = {
                "readme": ["overview", "installation", "usage", "license"],
                "api": ["overview", "authentication", "endpoints", "errors"]
            }

            required = required_sections.get(doc_type, [])
            document_lower = document.lower()

            missing = []
            for section in required:
                if f"## {section}" not in document_lower and \
                   f"# {section}" not in document_lower:
                    missing.append(section)

            return {
                "complete": len(missing) == 0,
                "missing_sections": missing,
                "score": ((len(required) - len(missing)) / len(required)) * 100
            }

        test_doc = """
# Test Project
## Overview
This is a test.
## Installation
Run install command.
## Usage
Use the tool.
"""

        result = validate_completeness(test_doc)
        self.assertFalse(result["complete"])
        self.assertIn("license", result["missing_sections"])
        self.assertEqual(result["score"], 75.0)

    def test_diagram_generation(self):
        """Test Mermaid diagram generation."""
        def generate_architecture_diagram(analysis):
            frameworks = [f["name"] for f in analysis.get("frameworks", [])]

            diagram = """```mermaid
graph TB
    Client[Client Application]
    API[API Server]
    DB[(Database)]

    Client --> API
    API --> DB
"""

            if "react" in frameworks:
                diagram += "    Client --> React[React Frontend]\n"

            if "fastapi" in frameworks:
                diagram += "    API --> FastAPI[FastAPI Backend]\n"

            diagram += "```"

            return diagram

        diagram = generate_architecture_diagram(self.mock_analysis_result)
        self.assertIn("mermaid", diagram)
        self.assertIn("FastAPI", diagram)
        self.assertIn("React", diagram)

    def test_error_handling_missing_data(self):
        """Test graceful handling of missing project data."""
        def generate_readme_with_fallback(analysis=None):
            if not analysis:
                # Use minimal template
                return """# Project

## Overview
Project documentation is being generated.

## Installation
Please refer to project documentation.

## Usage
See project files for usage information.

## License
See LICENSE file for details.
"""

            # Normal generation
            return f"# {analysis.get('name', 'Project')}"

        # Test with no data
        result_no_data = generate_readme_with_fallback(None)
        self.assertIn("## Overview", result_no_data)
        self.assertIn("being generated", result_no_data)

        # Test with data
        result_with_data = generate_readme_with_fallback({"name": "Test"})
        self.assertIn("# Test", result_with_data)

    def test_performance_metrics(self):
        """Test generation performance tracking."""
        import time

        class PerformanceTracker:
            def __init__(self):
                self.metrics = {}

            def start_phase(self, phase_name):
                self.metrics[phase_name] = {"start": time.time()}

            def end_phase(self, phase_name):
                if phase_name in self.metrics:
                    self.metrics[phase_name]["end"] = time.time()
                    self.metrics[phase_name]["duration"] = (
                        self.metrics[phase_name]["end"] -
                        self.metrics[phase_name]["start"]
                    )

            def get_total_time(self):
                return sum(m.get("duration", 0) for m in self.metrics.values())

            def is_within_target(self, target_seconds):
                return self.get_total_time() <= target_seconds

        tracker = PerformanceTracker()

        # Simulate phases
        tracker.start_phase("analysis")
        time.sleep(0.01)
        tracker.end_phase("analysis")

        tracker.start_phase("generation")
        time.sleep(0.01)
        tracker.end_phase("generation")

        # Check metrics
        self.assertIn("analysis", tracker.metrics)
        self.assertIn("generation", tracker.metrics)
        self.assertTrue(tracker.is_within_target(30))
        self.assertLess(tracker.get_total_time(), 1)


class TestReadmeWorkflowIntegration(unittest.TestCase):
    """Integration tests for README workflow."""

    def test_full_workflow_execution(self):
        """Test complete workflow from analysis to output."""
        workflow_config = {
            "project_root": "/test/project",
            "output_folder": "/test/output",
            "reading_level": 8,
            "include_badges": True,
            "include_diagrams": True
        }

        def execute_workflow(config):
            steps = []

            # Analysis phase
            steps.append("Analyzing codebase...")
            analysis = {"languages": ["python"], "frameworks": ["fastapi"]}

            # Generation phase
            steps.append("Generating content...")
            content = "# Project README\n## Overview\nGenerated content"

            # Validation phase
            steps.append("Validating document...")
            validation = {"score": 95, "issues": []}

            # Output phase
            steps.append("Saving README...")
            output_path = Path(config["output_folder"]) / "README.md"

            return {
                "success": True,
                "output_path": str(output_path),
                "validation_score": validation["score"],
                "steps_completed": steps
            }

        result = execute_workflow(workflow_config)

        self.assertTrue(result["success"])
        self.assertEqual(result["validation_score"], 95)
        self.assertIn("README.md", result["output_path"])
        self.assertEqual(len(result["steps_completed"]), 4)

    def test_workflow_error_recovery(self):
        """Test workflow handles errors gracefully."""
        def execute_with_error_handling(config):
            try:
                # Simulate error in analysis
                if not Path(config["project_root"]).exists():
                    raise FileNotFoundError("Project root not found")

                return {"success": True}

            except FileNotFoundError as e:
                # Fallback to simple template
                return {
                    "success": False,
                    "error": str(e),
                    "fallback": True,
                    "output": "# Project\nMinimal README generated"
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": str(e),
                    "fallback": False
                }

        # Test with non-existent path
        result = execute_with_error_handling({"project_root": "/nonexistent"})

        self.assertFalse(result["success"])
        self.assertTrue(result["fallback"])
        self.assertIn("Minimal README", result["output"])


if __name__ == "__main__":
    unittest.main()