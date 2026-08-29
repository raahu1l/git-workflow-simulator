#!/bin/bash

set -e

cd /workspace

# =========================================
# FRESH REPOSITORY
# =========================================

rm -rf .git

git init -b master

git config user.name "Student"
git config user.email "student@example.com"
git config core.editor ":"

# =========================================
# INITIAL FILE
# =========================================

cat > README.md <<'EOF'
# Git Merge Conflict

Line 1

Line 2

Line 3
EOF

git add README.md
git commit -m "Initial commit"

# =========================================
# FEATURE BRANCH
# =========================================

git switch -c feature

cat > README.md <<'EOF'
# Git Merge Conflict

Line 1

Feature changed Line 2

Line 3
EOF

git add README.md
git commit -m "Feature changes"

# =========================================
# RETURN TO MASTER
# =========================================

git switch master

cat > README.md <<'EOF'
# Git Merge Conflict

Line 1

Main changed Line 2

Line 3
EOF

git add README.md
git commit -m "Main changes"

# =========================================
# START LEARNER
# =========================================

echo ""
echo "========================================="
echo "Repository prepared successfully."
echo ""
echo "Current branch: master"
echo ""
echo "The feature branch contains useful work,"
echo "but master has a conflicting change."
echo ""
echo "Merge feature into master, resolve the"
echo "conflict in README.md, and complete the"
echo "merge with a clean working tree."
echo "========================================="