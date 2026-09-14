#!/bin/bash
set -e

cd /workspace

rm -rf .git src README.md /tmp/rebase-editor.sh

git init -b main
git config user.name "Student"
git config user.email "student@example.com"

apt-get update
apt-get install -y nano
git config core.editor nano

cat > /tmp/rebase-editor.sh <<'EOF'
#!/bin/sh

TODO="$1"

echo
echo "Interactive rebase:"
echo
nl -ba "$TODO"
echo
printf "Enter the line number to change to 'edit': "
read LINE

if [ -n "$LINE" ]; then
    sed -i "${LINE}s/^pick /edit /" "$TODO"
fi

echo
echo "Updated rebase plan:"
echo
cat "$TODO"
echo
EOF

chmod +x /tmp/rebase-editor.sh
git config core.editor /tmp/rebase-editor.sh

mkdir -p src

cat > src/report.py <<'EOF'
def calculate_total(items):
    total = 0

    for item in items:
        total += item["price"]

    return total


def format_report(title, total):
    return f"{title}: {total:.2f}"
EOF

cat > README.md <<'EOF'
# Reporting Tool

Internal reporting utility.
EOF

git add .
git commit -m "Initialize reporting tool"

git checkout -b feature/reporting

cat > src/report.py <<'EOF'
def calculate_total(items):
    total = 0

    for item in items:
        total += item["price"]

    return total


def format_report(title, total):
    return f"{title}: {total:.2f}"


def validate_report(report):
    return bool(report)
EOF

git add src/report.py
git commit -m "Add report validation"

cat > src/report.py <<'EOF'
def calculate_total(items):
    total = 0

    for item in items:
        total += item["price"] * item.get("quantity", 1)

    return total


def format_report(title, total):
    return f"{title}: {total:.2f}"


def validate_report(report):
    return bool(report)


def export_report(report, path):
    with open(path, "w") as file:
        file.write(report)
EOF

git add src/report.py
git commit -m "Fix quantity calculation and add report export"

cat > README.md <<'EOF'
# Reporting Tool

Internal reporting utility.

Reports can be validated, calculated, and exported.
EOF

git add README.md
git commit -m "Document report workflow"

git branch scenario-main-baseline main
git branch scenario-feature-baseline feature/reporting

git status --porcelain