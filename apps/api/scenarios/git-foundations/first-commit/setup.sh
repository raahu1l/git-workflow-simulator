#!/bin/bash

set -e

cd /workspace

# =========================================
# FRESH SCENARIO STATE
# =========================================

find /workspace -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

# =========================================
# GIT IDENTITY
# =========================================

git config --global user.name "Student"
git config --global user.email "student@example.com"

# =========================================
# LEARNER STARTING STATE
# =========================================

echo ""
echo "========================================="
echo "PROJECT SETUP"
echo "========================================="
echo ""
echo "The project is ready, but Git has not"
echo "been initialized yet."
echo ""
echo "Prepare this repository for version control."
echo ""
echo "Your goal:"
echo ""
echo "  • Initialize Git"
echo "  • Create README.md"
echo "  • Stage README.md"
echo "  • Create the first commit"
echo ""
echo "Use the terminal to complete the setup."
echo "========================================="
echo ""