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

cat > README.md <<'EOF'
# Payment Service

A small service responsible for processing customer payments.
EOF

cat > src/payment.py <<'EOF'
def process_payment(amount):
    return {
        "amount": amount,
        "status": "pending"
    }
EOF

git add .
git commit -m "Initialize payment service"

# =========================================
# PAYMENT VALIDATION BRANCH
# =========================================

git switch -c feature/payment-validation

cat > src/payment_validation.py <<'EOF'
def validate_payment(amount):
    if amount <= 0:
        return False

    return True
EOF

git add .
git commit -m "Add payment validation"

cat >> src/payment_validation.py <<'EOF'


def validate_payment_method(method):
    return method in ["card", "upi"]
EOF

git add .
git commit -m "Validate payment method"

# =========================================
# DELETE FEATURE BRANCH
# =========================================

git switch main

git branch -D feature/payment-validation

# =========================================
# NORMAL MAIN WORK
# =========================================

cat > DEPLOYMENT.md <<'EOF'
# Deployment Notes

Payment processing is scheduled for the next release.
EOF

git add .
git commit -m "Add deployment notes"

# =========================================
# START LEARNER ON MAIN
# =========================================

echo ""
echo "========================================="
echo "INCIDENT: DELETED FEATURE BRANCH"
echo ""
echo "Current branch: main"
echo ""
echo "The payment-validation feature branch"
echo "was deleted before its work was merged."
echo ""
echo "The developer needs the committed work"
echo "recovered before the release continues."
echo ""
echo "Investigate what Git still knows about"
echo "the deleted branch and recover the work."
echo "========================================="