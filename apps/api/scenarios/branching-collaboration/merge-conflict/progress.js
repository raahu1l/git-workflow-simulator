module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const progress = {
    startMerge: false,
    resolveConflict: false,
    completeMerge: false,
  };

  const git = async (command) => {
    try {
      return await executeCommand(
        containerId,
        `cd /workspace && ${command}`
      );
    } catch {
      return "";
    }
  };

  /* =========================================
     MERGE IN PROGRESS
  ========================================== */

  const mergeState = await git(
    "test -f .git/MERGE_HEAD && echo yes || echo no"
  );

  const mergeInProgress =
    mergeState.trim() === "yes";

  /* =========================================
     UNRESOLVED CONFLICTS
  ========================================== */

  const unresolved = await git(
    "git ls-files -u 2>/dev/null || true"
  );

  const hasUnresolvedConflicts =
    unresolved.trim() !== "";

  /* =========================================
     WORKING TREE
  ========================================== */

  const status = await git(
    "git status --porcelain=v1 2>/dev/null || true"
  );

  /* =========================================
     MERGE COMMIT
  ========================================== */

  const head = await git(
    "git rev-list --parents -n 1 HEAD 2>/dev/null || true"
  );

  const parents = head
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const isMergeCommit =
    parents.length === 3;

  const workingTreeClean =
    status.trim() === "";

  /* =========================================
     TASK 1
     START MERGE
  ========================================== */

  progress.startMerge =
    mergeInProgress ||
    isMergeCommit;

  /* =========================================
     TASK 2
     RESOLVE CONFLICT
  ========================================== */

  /*
   * Git's index is the source of truth.
   *
   * If:
   *
   * MERGE_HEAD exists
   * AND
   * git ls-files -u returns nothing
   *
   * then all merge conflicts have been resolved.
   *
   * This works with:
   *
   * git add README.md
   * git add .
   * git add -A
   */

  progress.resolveConflict =
    (
      mergeInProgress &&
      !hasUnresolvedConflicts
    ) ||
    isMergeCommit;

  /* =========================================
     TASK 3
     COMPLETE MERGE
  ========================================== */

  progress.completeMerge =
    isMergeCommit &&
    !mergeInProgress &&
    workingTreeClean;

  return progress;
};