#!/bin/bash
set -e

cd /workspace

rm -rf .git src README.md deploy.md

git init -b main
git config user.name "Student"
git config user.email "student@example.com"
git config core.editor true

mkdir -p src

cat > README.md <<'EOF'
# Reporting Service

Internal reporting service.
EOF

cat > src/config.py <<'EOF'
APP_NAME = "Reporting Service"
TIMEOUT = 30
EOF

git add README.md src/config.py
git commit -m "Initial project setup"

cat > src/config.py <<'EOF'
APP_NAME = "Reporting Service"
TIMEOUT = 30
LOG_LEVEL = "INFO"
EOF

git add src/config.py
git commit -m "Add configuration"

cat > README.md <<'EOF'
# Reporting Service

Internal reporting service.

API documentation is included for the current release.
EOF

git add README.md
git commit -m "Update API documentation"

git checkout -b feature/reporting

cat > src/report.py <<'EOF'
def generate_report(data):
    return {
        "count": len(data),
        "items": data
    }
EOF

git add src/report.py
git commit -m "Add report summary"

cat > src/report.py <<'EOF'
def generate_report(data):
    return {
        "count": len(data),
        "items": data,
        "include_archived": False
    }
EOF

git add src/report.py
git commit -m "Add archived report handling"

git checkout main

cat > src/logging.py <<'EOF'
LOG_FORMAT = "%(levelname)s:%(message)s"
EOF

git add src/logging.py
git commit -m "Improve logging"

cat > deploy.md <<'EOF'
# Deployment

The reporting service is deployed using the standard production configuration.
EOF

git add deploy.md
git commit -m "Add deployment configuration"

git branch scenario-main-baseline main
git branch scenario-feature-baseline feature/reporting

git checkout feature/reporting

git status --porcelain