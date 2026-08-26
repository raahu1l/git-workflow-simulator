#!/bin/bash

set -e

cd /workspace

# =========================================
# FRESH REPOSITORY
# =========================================

rm -rf .git
rm -rf .scenario-state

git init -b main

git config user.name "Student"
git config user.email "student@example.com"
git config core.editor "true"

mkdir -p src
mkdir -p .scenario-state

# =========================================
# INITIAL PROJECT
# =========================================

cat > README.md <<'EOF'
# Acme Web App

Internal web application used by the team.
EOF

cat > src/app.py <<'EOF'
def start_app():
    print("Starting Acme Web App")
EOF

git add .
git commit -m "Initialize application"

cat > src/config.py <<'EOF'
APP_NAME = "Acme Web App"
ENVIRONMENT = "production"
EOF

git add .
git commit -m "Add application configuration"

# =========================================
# OLD SIGNUP FEATURE
# =========================================

git switch -c feature/old-signup

cat > src/signup.py <<'EOF'
def signup(email):
    return {
        "email": email,
        "created": True
    }
EOF

git add .
git commit -m "Add signup flow"

cat > src/signup_validation.py <<'EOF'
def validate_signup(email):
    return "@" in email
EOF

git add .
git commit -m "Add signup validation"

# =========================================
# MERGE OLD SIGNUP INTO MAIN
# =========================================

git switch main

git merge --no-ff feature/old-signup \
  -m "Merge old signup feature"

# =========================================
# BASELINE MAIN
# =========================================
#
# This tag records the exact main state
# before the learner begins cleanup.
#

git tag scenario-main-baseline

# =========================================
# ACTIVE BUG-FIX BRANCH
# =========================================

git switch -c fix-bug

cat > src/login_validation.py <<'EOF'
def validate_login(username, password):
    if not username:
        return False

    if not password:
        return False

    return True
EOF

git add .
git commit -m "Fix empty login credentials"

cat > src/login_errors.py <<'EOF'
def login_error():
    return "Invalid username or password"
EOF

git add .
git commit -m "Improve login error handling"

# =========================================
# RECORD ACTIVE WORK BASELINE
# =========================================

git tag scenario-fix-bug-baseline

# =========================================
# START LEARNER HERE
# =========================================

git switch fix-bug

echo ""
echo "========================================="
echo "Repository prepared successfully."
echo ""
echo "Current branch: fix-bug"
echo ""
echo "Release preparation is underway."
echo "Your active login fix needs a clearer"
echo "branch name, while the old signup branch"
echo "has already been merged into main."
echo ""
echo "Keep the active work safe while cleaning"
echo "up the repository."
echo "========================================="