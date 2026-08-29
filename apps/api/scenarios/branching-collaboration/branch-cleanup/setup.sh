#!/bin/bash

set -e

cd /workspace

# =========================================
# FRESH REPOSITORY
# =========================================

rm -rf .git

git init -b main

git config user.name "Student"
git config user.email "student@example.com"
git config core.editor "true"

mkdir -p src

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
# MERGE SIGNUP INTO MAIN
# =========================================

git switch main

git merge --no-ff feature/old-signup \
  -m "Merge old signup feature"

# =========================================
# RECORD MAIN BASELINE
# =========================================

git tag scenario-main-baseline

# =========================================
# ACTIVE LOGIN BUG-FIX BRANCH
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
# LEARNER STARTING POINT
# =========================================

git switch fix-bug

echo ""
echo "========================================="
echo "RELEASE CLEANUP"
echo "========================================="
echo ""
echo "The active login fix is currently on"
echo "a branch with an unclear name."
echo ""
echo "Two commits of active login work must"
echo "remain safe during the cleanup."
echo ""
echo "The old signup feature has already been"
echo "merged into main, but its old branch"
echo "is still hanging around."
echo ""
echo "Clean up the repository without disturbing"
echo "the active login work."
echo "========================================="
echo ""