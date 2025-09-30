#!/bin/bash
# Auto-generated command wrapper for analyze-project

workflow_path="/home/bj/python/BMAD-METHOD/bmad/bmm/workflows/analyze-code/workflow.yaml"

if [ ! -f "$workflow_path" ]; then
    echo "❌ Workflow not found: $workflow_path"
    exit 1
fi

echo "Running analyze-project workflow..."
echo "Project: ${1:-$(pwd)}"

# Execute workflow (placeholder - replace with actual workflow engine)
python3 -c "
import yaml
import sys

with open('$workflow_path', 'r') as f:
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

