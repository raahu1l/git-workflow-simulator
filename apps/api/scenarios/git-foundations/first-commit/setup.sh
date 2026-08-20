#!/bin/bash

cd /workspace

# Completely restore the workspace to its initial state
find /workspace -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

# Configure Git identity
git config --global user.name "Student"
git config --global user.email "student@example.com"

echo "Your task:"
echo "1. Initialize a Git repository"
echo "2. Create README.md"
echo "3. Add it to Git"
echo "4. Create your first commit"