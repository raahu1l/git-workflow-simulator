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
     1. VERIFY MERGE COMMIT
  ========================================== */

  const headParents = await git(
    "git rev-list --parents -n 1 HEAD 2>/dev/null || true"
  );

  const parents = headParents
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  /*
   * A normal commit has:
   *
   * commit + 1 parent
   *
   * A merge commit has:
   *
   * commit + 2 parents
   */

  if (parents.length < 3) {
    return {
      success: false,
      message:
        "The merge has not been completed yet. Finish the merge with a commit.",
    };
  }

  /* =========================================
     2. VERIFY NO MERGE IS IN PROGRESS
  ========================================== */

  const mergeState = await git(
    "if [ -f .git/MERGE_HEAD ]; then echo yes; else echo no; fi"
  );

  if (mergeState.trim() === "yes") {
    return {
      success: false,
      message:
        "A merge is still in progress. Resolve any remaining conflicts and complete the merge.",
    };
  }

  /* =========================================
     3. VERIFY NO UNMERGED FILES
  ========================================== */

  const status = await git(
    "git status --porcelain=v1"
  );

  const unmergedFiles = status
    .split(/\r?\n/)
    .filter((line) =>
      /^(UU|AA|AU|UA|DD|DU|UD)/.test(
        line.trim()
      )
    );

  if (unmergedFiles.length > 0) {
    return {
      success: false,
      message:
        "There are still unresolved merge conflicts.",
    };
  }

  /* =========================================
     4. VERIFY NO CONFLICT MARKERS
  ========================================== */

const conflictMarkers = await git(
  "grep -n -E '^(<<<<<<<|=======|>>>>>>>)' README.md 2>/dev/null || true"
);

  if (conflictMarkers.trim() !== "") {
    return {
      success: false,
      message:
        "Conflict markers are still present in the workspace.",
    };
  }

  /* =========================================
     5. VERIFY CLEAN WORKING TREE
  ========================================== */

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
      "Excellent! You resolved the merge conflict and completed the merge successfully.",
  };
};