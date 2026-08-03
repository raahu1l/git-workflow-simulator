#!/bin/bash

cd /workspace

# Initialize repository
git init

git config user.name "Student"
git config user.email "student@example.com"

# Initial file
cat <<EOF > README.md
# Git Merge Conflict

Line 1
Line 2
Line 3
EOF

git add .
git commit -m "Initial commit"

# Create feature branch
git checkout -b feature

cat <<EOF > README.md
# Git Merge Conflict

Line 1
Feature changed Line 2
Line 3
EOF

git add README.md
git commit -m "Feature changes"

# Back to main
git checkout master

cat <<EOF > README.md
# Git Merge Conflict

Line 1
Main changed Line 2
Line 3
EOF

git add README.md
git commit -m "Main changes"

echo ""
echo "========================================="
echo "Your task:"
echo ""
echo "Merge the 'feature' branch into the current branch."
echo "Resolve the merge conflict."
echo "Commit the merge."
echo "========================================="