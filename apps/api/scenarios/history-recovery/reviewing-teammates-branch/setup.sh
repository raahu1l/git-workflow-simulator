#!/bin/bash

set -e

cd /workspace

rm -rf .git

git init -b main

git config user.name "Student"
git config user.email "student@example.com"
git config core.editor "true"

mkdir -p src

cat > README.md <<'EOF'
# Reporting Service

Internal reporting service.
EOF

cat > src/report.py <<'EOF'
def generate_report(data):
    return {
        "count": len(data),
        "items": data
    }
EOF

git add .
git commit -m "Initialize reporting service"

git switch -c feature/reporting

cat > src/report_filters.py <<'EOF'
def filter_active(items):
    return [
        item
        for item in items
        if item.get("active")
    ]
EOF

git add .
git commit -m "Add report filtering"

cat > src/report_export.py <<'EOF'
def export_report(report):
    return "\n".join(
        str(item)
        for item in report["items"]
    )
EOF

git add .
git commit -m "Add report export"

cat > src/report.py <<'EOF'
def generate_report(data):
    return {
        "count": len(data),
        "items": data,
        "source": "reporting"
    }
EOF

git add .
git commit -m "Add reporting metadata"

git switch main

echo ""
echo "========================================="
echo "Repository prepared successfully."
echo ""
echo "Current branch: main"
echo ""
echo "Priya's feature/reporting branch contains"
echo "three commits with reporting work."
echo ""
echo "Review the branch before approving the PR."
echo "Do not merge or modify either branch."
echo "========================================="