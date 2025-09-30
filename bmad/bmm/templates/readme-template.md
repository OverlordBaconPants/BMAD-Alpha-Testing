# {project_name}

{{#if badges}}
![Build Status]({build_badge|https://img.shields.io/badge/build-passing-brightgreen})
![Coverage]({coverage_badge|https://img.shields.io/badge/coverage-0%25-red})
![License]({license_badge|https://img.shields.io/badge/license-MIT-blue})
![Version]({version_badge|https://img.shields.io/badge/version-0.0.0-orange})
{{/if}}

{description|A comprehensive project that needs a description}

{{#if table_of_contents}}
## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
{{#if has_api}}
- [API Reference](#api-reference)
{{/if}}
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact & Support](#contact--support)
{{/if}}

## Overview

{overview_content|This project provides a solution for...}

### Key Highlights

{{#each key_highlights}}
- **{title}**: {description}
{{/each}}

### Technology Stack

{{#if tech_stack}}
| Category | Technology |
|----------|-----------|
{{#each tech_stack}}
| {category} | {technology} |
{{/each}}
{{else}}
- Primary Language: {main_language|Unknown}
- Framework: {main_framework|Not specified}
- Database: {database|Not specified}
{{/if}}

## Features

{{#each feature_categories}}
### {category_name}

{{#each features}}
- ✨ **{name}**: {description}
{{/each}}
{{/each}}

{{#if simple_features}}
{{#each simple_features}}
- {feature}
{{/each}}
{{/if}}

## Installation

### Prerequisites

{{#each prerequisites}}
- {requirement}
{{/each}}

### Quick Start

```bash
# Clone the repository
git clone {repo_url|https://github.com/username/project.git}
cd {project_dir|project}

# Install dependencies
{install_command|npm install}

# Run the application
{run_command|npm start}
```

### Detailed Installation

{{#if detailed_installation}}
{detailed_installation}
{{else}}
1. **Clone the repository**
   ```bash
   git clone {repo_url}
   cd {project_dir}
   ```

2. **Install dependencies**
   ```bash
   {install_command}
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database** (if applicable)
   ```bash
   {db_init_command|# Database initialization command}
   ```

5. **Start the application**
   ```bash
   {start_command}
   ```
{{/if}}

{{#if docker_available}}
### Docker Installation

```bash
# Build the Docker image
docker build -t {project_name|app} .

# Run the container
docker run -p {port|3000}:{port|3000} {project_name|app}
```

Or using Docker Compose:

```bash
docker-compose up
```
{{/if}}

## Usage

### Basic Usage

{{#if basic_usage_examples}}
{{#each basic_usage_examples}}
#### {example_title}

```{language}
{code}
```

{explanation}
{{/each}}
{{else}}
```{main_language|bash}
# Example usage
{example_command|./run.sh}
```
{{/if}}

### Advanced Usage

{{#if advanced_examples}}
{{#each advanced_examples}}
<details>
<summary>{example_title}</summary>

```{language}
{code}
```

{detailed_explanation}
</details>
{{/each}}
{{/if}}

{{#if has_cli}}
### Command Line Interface

```bash
{cli_name} [command] [options]
```

**Available Commands:**

{{#each cli_commands}}
| Command | Description | Example |
|---------|-------------|---------|
| `{command}` | {description} | `{example}` |
{{/each}}

**Options:**

{{#each cli_options}}
| Option | Description | Default |
|--------|-------------|---------|
| `{option}` | {description} | {default_value} |
{{/each}}
{{/if}}

{{#if has_api}}
## API Reference

### Base URL

```
{api_base_url|http://localhost:3000/api}
```

### Authentication

{{#if api_auth}}
{api_auth_description}

```http
Authorization: Bearer {token}
```
{{else}}
No authentication required for public endpoints.
{{/if}}

### Endpoints

{{#each api_endpoints}}
#### {method} {path}

{description}

**Parameters:**

{{#if parameters}}
| Name | Type | Required | Description |
|------|------|----------|-------------|
{{#each parameters}}
| `{name}` | {type} | {required} | {description} |
{{/each}}
{{/if}}

**Request Example:**

```{request_format|json}
{request_example}
```

**Response Example:**

```json
{response_example}
```

{{#if error_responses}}
**Error Responses:**

{{#each error_responses}}
- `{code}`: {description}
{{/each}}
{{/if}}
{{/each}}

### Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
{{#each error_codes}}
| {code} | {description} | {resolution} |
{{/each}}
{{/if}}

## Project Structure

```
{project_name}/
{{#each project_structure}}
{indent}{item}
{{/each}}
```

### Key Directories

{{#each key_directories}}
- **`{path}`**: {description}
{{/each}}

## Configuration

### Environment Variables

{{#if env_variables}}
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
{{#each env_variables}}
| `{name}` | {description} | {default} | {required} |
{{/each}}
{{else}}
Create a `.env` file in the root directory with the following variables:

```env
# Example environment variables
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://localhost/mydb
```
{{/if}}

### Configuration Files

{{#each config_files}}
- **`{file}`**: {description}
{{/each}}

## Testing

### Running Tests

```bash
# Run all tests
{test_command|npm test}

# Run with coverage
{coverage_command|npm run test:coverage}

# Run specific test suite
{test_suite_command|npm test -- --grep "suite name"}
```

### Test Structure

```
tests/
{{#each test_structure}}
{indent}{item}
{{/each}}
```

{{#if test_examples}}
### Writing Tests

```{test_language|javascript}
{test_example}
```
{{/if}}

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Guide

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/your-username/{project_name}.git

# Install development dependencies
{dev_install_command|npm install --dev}

# Run in development mode
{dev_command|npm run dev}
```

### Code Style

{{#if code_style}}
{code_style}
{{else}}
Please follow the existing code style. Run the linter before submitting:

```bash
{lint_command|npm run lint}
```
{{/if}}

## License

{{#if license}}
This project is licensed under the {license} License - see the [LICENSE](LICENSE) file for details.
{{else}}
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
{{/if}}

## Contact & Support

### Maintainers

{{#each maintainers}}
- {name} - {email|contact}
{{/each}}

### Links

- 📦 **Repository**: [{repo_url}]({repo_url})
- 🐛 **Issue Tracker**: [{issues_url}]({issues_url})
- 📖 **Documentation**: [{docs_url}]({docs_url})
- 💬 **Discussions**: [{discussions_url}]({discussions_url})

### Getting Help

{{#if support_channels}}
{{#each support_channels}}
- {channel}: {description}
{{/each}}
{{else}}
- Open an issue for bug reports or feature requests
- Start a discussion for questions and general help
- Check the documentation for detailed guides
{{/if}}

## Acknowledgments

{{#if acknowledgments}}
{{#each acknowledgments}}
- {acknowledgment}
{{/each}}
{{else}}
- Thanks to all contributors who have helped shape this project
- Special thanks to the open source community
{{/if}}

---

{{#if footer}}
{footer}
{{else}}
*Last updated: {last_updated|today}*

Generated with ❤️ by [BMAD Tech Writer](https://github.com/bmad-method)
{{/if}}