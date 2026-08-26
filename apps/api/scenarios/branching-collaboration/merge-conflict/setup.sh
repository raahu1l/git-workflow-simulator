#!/bin/bash

cd /workspace

# Completely reset the workspace.
rm -rf .git

# Initialize repository.
git init

# Configure Git identity.
git config user.name "Student"
git config user.email "student@example.com"

# Create initial file.
cat <<EOF > README.md
# Git Merge Conflict

Line 1
Line 2
Line 3
EOF

git add README.md
git commit -m "Initial commit"

# Create feature branch.
git checkout -b feature

# Make a conflicting change on feature.
cat <<EOF > README.md
# Git Merge Conflict

Line 1
Feature changed Line 2
Line 3
EOF

git add README.md
git commit -m "Feature changes"

# Return to main branch.
git checkout master

# Make a conflicting change on master.
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
echo "Merge the feature branch into master."
echo "A merge conflict will occur because both"
echo "branches changed the same line."
echo ""
echo "Resolve the conflict by deciding what"
echo "the final README.md should contain."
echo ""
echo "After resolving the conflict, complete"
echo "the merge and leave the working tree clean."
echo "========================================="