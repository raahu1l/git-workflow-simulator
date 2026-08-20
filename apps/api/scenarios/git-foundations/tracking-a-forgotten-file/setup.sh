#!/bin/bash

cd /workspace

# Completely restore the workspace to its initial state.
find /workspace -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

# Configure Git identity.
git config --global user.name "Student"
git config --global user.email "student@example.com"

# Initialize repository.
git init

# Create the existing project README.
echo "# Project" > README.md

# Create the forgotten file.
echo "Important project notes" > project-notes.txt

# Commit only the README.
git add README.md
git commit -m "Initial project setup"

echo "Your task:"
echo "1. Find the forgotten project-notes.txt file"
echo "2. Stage project-notes.txt"
echo "3. Commit the forgotten file"
echo "4. Leave the working tree clean"