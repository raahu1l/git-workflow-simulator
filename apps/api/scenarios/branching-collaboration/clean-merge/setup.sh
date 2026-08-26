#!/bin/bash

set -e

cd /workspace

# =========================================
# FRESH REPOSITORY
# =========================================

rm -rf .git

git init -b main

git config user.name "Student"
git config user.email "student@example.com"
git config core.editor "true"

# =========================================
# INITIAL PROJECT
# =========================================

mkdir -p src

cat > src/search.py <<'EOF'
def search(items, query):
    return [
        item
        for item in items
        if query.lower() in item.lower()
    ]
EOF

cat > README.md <<'EOF'
# Search Service

A small application providing search functionality.
EOF

git add .
git commit -m "Initialize search service"

# =========================================
# FEATURE BRANCH
# =========================================

git switch -c feature/search

cat > src/search_utils.py <<'EOF'
def normalize_query(query):
    return query.strip().lower()
EOF

git add .
git commit -m "Add search query normalization"

cat > src/search_service.py <<'EOF'
from search_utils import normalize_query


def search_products(products, query):
    query = normalize_query(query)

    return [
        product
        for product in products
        if query in product.lower()
    ]
EOF

git add .
git commit -m "Add product search service"

# =========================================
# RETURN TO MAIN
# =========================================

git switch main

cat > DEPLOYMENT.md <<'EOF'
# Deployment Notes

The search service is prepared for the next deployment.
EOF

git add .
git commit -m "Add deployment notes"

cat > src/config.py <<'EOF'
APP_NAME = "Search Service"
ENVIRONMENT = "production"
EOF

git add .
git commit -m "Add application configuration"

# =========================================
# START LEARNER ON FEATURE BRANCH
# =========================================

git switch feature/search

echo ""
echo "========================================="
echo "Repository prepared successfully."
echo ""
echo "Current branch: feature/search"
echo ""
echo "The search feature has been completed."
echo "Move the feature into main and finish"
echo "the collaboration workflow."
echo "========================================="