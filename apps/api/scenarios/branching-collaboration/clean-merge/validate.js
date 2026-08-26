module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const git = async (command) => {
    return executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );
  };

  /* =========================================
     1. MUST BE ON MAIN
  ========================================== */

  const branch = await git(
    "git branch --show-current"
  );

  if (branch.trim() !== "main") {
    return {
      success: false,
      message:
        "Switch to main before integrating the search feature.",
    };
  }

  /* =========================================
     2. VERIFY MERGE
  ========================================== */

  const headParents = await git(
    "git rev-list --parents -n 1 HEAD 2>/dev/null || true"
  );

  const parents = headParents
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  /*
   * The branches diverged during setup, so a valid
   * integration should result in a merge commit.
   *
   * We intentionally do not check the commit message.
   */

  if (parents.length < 3) {
    return {
      success: false,
      message:
        "The search feature has not been merged into main yet.",
    };
  }

  /* =========================================
     3. VERIFY FEATURE WORK IS IN MAIN
  ========================================== */

  const featureHistory = await git(
    "git log main --oneline -- src/search_utils.py src/search_service.py 2>/dev/null || true"
  );

  if (featureHistory.trim() === "") {
    return {
      success: false,
      message:
        "The search feature's work is not present in main.",
    };
  }

  /* =========================================
     4. VERIFY NO CONFLICT MARKERS
  ========================================== */

  const conflictMarkers = await git(
    "grep -R -n -E '^(<<<<<<<|=======|>>>>>>>)' /workspace --exclude-dir=.git 2>/dev/null || true"
  );

  if (conflictMarkers.trim() !== "") {
    return {
      success: false,
      message:
        "Conflict markers are still present in the workspace.",
    };
  }

  /* =========================================
     5. VERIFY FEATURE BRANCH CLEANUP
  ========================================== */

  const featureBranch = await git(
    "git rev-parse --verify feature/search 2>/dev/null || true"
  );

  if (featureBranch.trim() !== "") {
    return {
      success: false,
      message:
        "The merge is complete, but the feature branch has not been cleaned up yet.",
    };
  }

  /* =========================================
     6. VERIFY CLEAN WORKING TREE
  ========================================== */

  const status = await git(
    "git status --porcelain"
  );

  if (status.trim() !== "") {
    return {
      success: false,
      message:
        "The merge is complete, but the working tree is not clean.",
    };
  }

  /* =========================================
     SUCCESS
  ========================================== */

  return {
    success: true,
    message:
      "Merged and confirmed. That search feature is officially part of main now.",
  };
};