#!/bin/bash
set -e

cd /workspace

rm -rf .git src README.md

git init -b main
git config user.name "Student"
git config user.email "student@example.com"

apt-get update
apt-get install -y nano
git config core.editor nano

mkdir -p src

cat > src/app.py <<'EOF'
def application_status():
    return "running"
EOF

cat > README.md <<'EOF'
# Store Platform

Internal store platform.
EOF

git add .
git commit -m "Initialize store platform"

# Checkout feature
git checkout -b feature/checkout

cat > src/checkout.py <<'EOF'
def checkout(cart):
    return {
        "items": cart,
        "status": "ready"
    }
EOF

git add src/checkout.py
git commit -m "Add checkout feature"

# Notifications feature
git checkout main
git checkout -b feature/notifications

cat > src/notifications.py <<'EOF'
def send_notification(message):
    return {
        "message": message,
        "status": "queued"
    }
EOF

git add src/notifications.py
git commit -m "Add notifications feature"

# Experimental search feature
git checkout main
git checkout -b feature/search-experimental

cat > src/search_experimental.py <<'EOF'
def experimental_search(query):
    return {
        "query": query,
        "experimental": True
    }
EOF

git add src/search_experimental.py
git commit -m "Add experimental search"

# Start learner on main
git checkout main

git status --porcelain