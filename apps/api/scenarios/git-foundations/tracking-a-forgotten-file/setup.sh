#!/bin/bash

set -e

cd /workspace

# =========================================
# RESET WORKSPACE
# =========================================

find /workspace -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

# =========================================
# GIT IDENTITY
# =========================================

git config --global user.name "Student"
git config --global user.email "student@example.com"

# =========================================
# INITIAL PROJECT FILE
# =========================================

cat > utils.py <<'EOF'
def calculate_total(price, quantity):
    # BUG FIX:
    # Negative quantities should not be accepted.
    #
    # Add a check that raises:
    # ValueError("quantity cannot be negative")
    return price * quantity


def format_name(name):
    # FORMATTING CLEANUP:
    # Strip surrounding whitespace and convert
    # the returned name to title case.
    return name.strip()


# HELPER FUNCTION:
# Add a function named is_even(value).
#
# It should return True when value is even
# and False when value is odd.
EOF

# =========================================
# INITIAL REPOSITORY
# =========================================

git init -b main
git add utils.py
git commit -m "Initial repository state"

# =========================================
# LEARNER INSTRUCTIONS
# =========================================

echo ""
echo "========================================="
echo "COMMIT HISTORY CHALLENGE"
echo "========================================="
echo ""
echo "Three independent changes are described"
echo "inside utils.py."
echo ""
echo "Create three separate commits:"
echo ""
echo "  1. Fix the quantity bug."
echo "  2. Add the is_even helper."
echo "  3. Clean up name formatting."
echo ""
echo "Keep each logical change isolated in its"
echo "own commit and finish with a clean tree."
echo ""
echo "Start by examining the existing file."
echo "========================================="
echo ""