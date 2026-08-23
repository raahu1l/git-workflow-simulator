#!/bin/bash

cd /workspace

# Reset workspace
find /workspace -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

# Configure Git identity
git config --global user.name "Student"
git config --global user.email "student@example.com"

# Create the initial file
cat > utils.py <<'EOF'
def calculate_total(price, quantity):
    # TODO 1 — Bug fix:
    # Negative quantities should not be accepted.
    #
    # If quantity is less than 0, raise:
    # ValueError("quantity cannot be negative")
    #
    # Make this change first, then stage and commit it.
    return price * quantity


def format_name(name):
    # TODO 3 — Formatting cleanup:
    # Strip surrounding whitespace and convert the
    # returned name to title case.
    return name.strip()


# TODO 2 — Helper function:
# Add a function named is_even(value).
#
# It should return True when value is even
# and False when value is odd.
EOF

# Create the initial repository
git init
git add utils.py
git commit -m "Initial repository state"

echo "Your task:"
echo "1. Fix the quantity bug and commit it separately."
echo "2. Add the is_even helper and commit it separately."
echo "3. Clean up name formatting and commit it separately."