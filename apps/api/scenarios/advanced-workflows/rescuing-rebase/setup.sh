#!/bin/bash

set -e

echo "=== Starting rescuing-rebase setup ==="

cd /workspace

echo "=== Installing nano ==="
apt-get update
apt-get install -y nano

echo "=== Removing previous Git metadata ==="
rm -rf /workspace/.git

echo "=== Initializing repository ==="
git -C /workspace init

echo "=== Verifying repository ==="
git -C /workspace rev-parse --is-inside-work-tree

echo "=== Configuring Git ==="
git -C /workspace config user.name "Git Workflow Simulator"
git -C /workspace config user.email "simulator@example.com"
git -C /workspace config core.editor nano

echo "=== Creating main branch ==="
git -C /workspace checkout -b main

mkdir -p /workspace/src

cat > /workspace/src/notifications.py <<'PY'
NOTIFICATION_FORMAT = "text"

def send_notification(message):
    return f"Sending text notification: {message}"
PY

cat > /workspace/README.md <<'MD'
# Notification Service

Internal notification service.
MD

echo "=== Creating initial commit ==="

git -C /workspace add .
git -C /workspace commit -m "Initialize notification service"

echo "=== Creating feature branch ==="

git -C /workspace checkout -b feature/notifications

cat > /workspace/src/notifications.py <<'PY'
NOTIFICATION_FORMAT = "email"

def send_notification(message):
    return f"Sending email notification: {message}"
PY

git -C /workspace add src/notifications.py
git -C /workspace commit -m "Add email notification support"

FEATURE_BASELINE=$(git -C /workspace rev-parse HEAD)

git -C /workspace branch -f \
  scenario-notifications-feature-baseline \
  "$FEATURE_BASELINE"

echo "=== Updating main ==="

git -C /workspace checkout main

cat > /workspace/src/notifications.py <<'PY'
NOTIFICATION_FORMAT = "json"

def send_notification(message):
    return f"Sending JSON notification: {message}"
PY

git -C /workspace add src/notifications.py
git -C /workspace commit -m "Update notification configuration"

MAIN_BASELINE=$(git -C /workspace rev-parse HEAD)

git -C /workspace branch -f \
  scenario-notifications-main-baseline \
  "$MAIN_BASELINE"

echo "=== Starting conflicting rebase ==="

git -C /workspace checkout feature/notifications

git -C /workspace rebase main || true

echo ""
echo "========================================"
echo " Scenario setup complete"
echo "========================================"
echo ""
echo "The repository is intentionally paused"
echo "inside a rebase conflict."
echo ""
echo "Valid recovery paths:"
echo ""
echo "  git rebase --abort"
echo ""
echo "OR resolve the conflict, then:"
echo ""
echo "  git add src/notifications.py"
echo "  git rebase --continue"
echo ""