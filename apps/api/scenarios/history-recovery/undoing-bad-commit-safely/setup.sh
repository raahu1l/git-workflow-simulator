#!/bin/bash

set -e

cd /workspace

# =========================================
# FRESH REPOSITORY
# =========================================

rm -rf .git app.py

git init -b main

git config user.name "Git Workflow Simulator"
git config user.email "simulator@example.com"
git config core.editor ":"

# =========================================
# ORIGINAL WORKING VERSION
# =========================================

cat > app.py <<'EOF'
def calculate_total(price, quantity):
    return price * quantity


def format_total(total):
    return f"Total: ${total:.2f}"


def main():
    price = 10
    quantity = 2
    total = calculate_total(price, quantity)
    print(format_total(total))


if __name__ == "__main__":
    main()
EOF

git add app.py
git commit -m "Add order total calculation"

# =========================================
# BREAKING CHANGE
# =========================================

cat > app.py <<'EOF'
def calculate_total(price, quantity):
    return price * quantity


def format_total(total):
    return f"TOTAL: ${total:.2f}"


def main():
    price = 10
    quantity = 2
    total = calculate_total(price, quantity)
    print(format_total(total))


if __name__ == "__main__":
    main()
EOF

git add app.py
git commit -m "Break total formatting"

# =========================================
# LEARNER STARTING POINT
# =========================================

echo ""
echo "========================================="
echo "INCIDENT: BROKEN MAIN"
echo "========================================="
echo ""
echo "The latest commit changed the application's"
echo "total formatting and broke the expected output."
echo ""
echo "The commit is already on shared main."
echo ""
echo "The team needs the change undone without"
echo "rewriting the existing history."
echo ""
echo "Investigate the recent history and safely"
echo "restore the application."
echo "========================================="
echo ""