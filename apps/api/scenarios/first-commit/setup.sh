#!/bin/bash

cd /workspace

git init

git config user.name "Student"
git config user.email "student@example.com"

echo "# First Commit" > README.md

git add .

git commit -m "Initial commit"