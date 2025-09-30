#!/bin/bash

# Tech Writer Agent Activation Script
# This script sets up the Tech Writer agent (Yvonne) for use

echo "🚀 Activating Tech Writer Agent (Yvonne)..."

# Set BMAD root
export BMAD_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Create necessary directories
mkdir -p "$BMAD_ROOT/bmm/logs"
mkdir -p "$BMAD_ROOT/bmm/cache"
mkdir -p "$BMAD_ROOT/bmm/output"

# Set up environment
export BMAD_AGENT="tech-writer"
export BMAD_AGENT_NAME="Yvonne"
export BMAD_WORKFLOWS_PATH="$BMAD_ROOT/bmm/workflows"
export BMAD_TEMPLATES_PATH="$BMAD_ROOT/bmm/templates"
export BMAD_LIB_PATH="$BMAD_ROOT/bmm/lib/doc-utils"

# Create command aliases
create_command() {
    local cmd_name=$1
    local workflow=$2

    echo "Creating command: $cmd_name -> $workflow"

    # Create wrapper function
    cat > "$BMAD_ROOT/bmm/.commands/$cmd_name.sh" << EOF
#!/bin/bash
# Auto-generated command wrapper for $cmd_name

workflow_path="$BMAD_WORKFLOWS_PATH/$workflow/workflow.yaml"

if [ ! -f "\$workflow_path" ]; then
    echo "❌ Workflow not found: \$workflow_path"
    exit 1
fi

echo "Running $cmd_name workflow..."
echo "Project: \${1:-\$(pwd)}"

# Execute workflow (placeholder - replace with actual workflow engine)
python3 -c "
import yaml
import sys

with open('\$workflow_path', 'r') as f:
    workflow = yaml.safe_load(f)

print(f'📝 Executing: {workflow.get(\"name\")}')
print(f'📄 Description: {workflow.get(\"description\")}')
print(f'✨ Version: {workflow.get(\"version\")}')
print()
print('Workflow would execute here with your workflow engine')
print()
print('For now, showing workflow structure:')
print(f'  - Phases: {len(workflow.get(\"phases\", []))}')
for phase in workflow.get('phases', []):
    print(f'    • {phase.get(\"name\")}: {phase.get(\"description\")}')
"

EOF
    chmod +x "$BMAD_ROOT/bmm/.commands/$cmd_name.sh"
}

# Create commands directory
mkdir -p "$BMAD_ROOT/bmm/.commands"

# Register commands
create_command "generate-readme" "generate-readme"
create_command "generate-api-docs" "generate-api-docs"
create_command "analyze-project" "analyze-code"
create_command "validate-docs" "validate-docs"

# Create main tech-writer command
cat > "$BMAD_ROOT/bmm/tech-writer" << 'EOF'
#!/bin/bash

# Tech Writer Agent CLI
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
    readme)
        shift
        "$SCRIPT_DIR/.commands/generate-readme.sh" "$@"
        ;;
    api)
        shift
        "$SCRIPT_DIR/.commands/generate-api-docs.sh" "$@"
        ;;
    analyze)
        shift
        "$SCRIPT_DIR/.commands/analyze-project.sh" "$@"
        ;;
    validate)
        shift
        "$SCRIPT_DIR/.commands/validate-docs.sh" "$@"
        ;;
    help|--help|-h)
        echo "Tech Writer Agent (Yvonne) - Documentation Automation"
        echo ""
        echo "Usage: tech-writer <command> [options]"
        echo ""
        echo "Commands:"
        echo "  readme [path]     Generate README documentation"
        echo "  api [path]        Generate API documentation"
        echo "  analyze [path]    Analyze project structure"
        echo "  validate [doc]    Validate documentation"
        echo "  help             Show this help message"
        echo ""
        echo "Examples:"
        echo "  tech-writer readme /my/project"
        echo "  tech-writer api --openapi swagger.yaml"
        echo "  tech-writer validate README.md"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run 'tech-writer help' for usage information"
        exit 1
        ;;
esac
EOF

chmod +x "$BMAD_ROOT/bmm/tech-writer"

# Create activation confirmation
cat > "$BMAD_ROOT/bmm/.tech-writer-active" << EOF
{
  "agent": "tech-writer",
  "name": "Yvonne",
  "version": "1.0.0",
  "activated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "workflows": [
    "generate-readme",
    "generate-api-docs",
    "generate-user-guide",
    "generate-architecture"
  ],
  "status": "active"
}
EOF

echo "✅ Tech Writer Agent activated successfully!"
echo ""
echo "📚 Available Commands:"
echo "  ./bmad/bmm/tech-writer readme [project-path]"
echo "  ./bmad/bmm/tech-writer api [project-path]"
echo "  ./bmad/bmm/tech-writer analyze [project-path]"
echo "  ./bmad/bmm/tech-writer validate [doc-path]"
echo ""
echo "🎯 Quick Start:"
echo "  cd your-project"
echo "  $BMAD_ROOT/bmm/tech-writer readme"
echo ""
echo "📖 Full documentation: $BMAD_ROOT/bmm/agents/tech-writer-yvonne.md"