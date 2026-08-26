module.exports = async ({
  executeCommand,
  containerId,
}) => {
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

  const progress = {
    switchToMain: false,
    mergeFeature: false,
    deleteFeatureBranch: false,
  };

  /* =========================================
     1. CHECK CURRENT BRANCH
  ========================================== */

  const branch = await git(
    "git branch --show-current"
  );

  progress.switchToMain =
    branch.trim() === "main";

  if (!progress.switchToMain) {
    return progress;
  }

  /* =========================================
     2. CHECK FEATURE INTEGRATION
  ========================================== */

  /*
   * The setup creates divergent histories, so a
   * normal merge produces a commit with two parents.
   *
   * We do not care about:
   * - commit messages
   * - exact commit hashes
   * - the command used to perform the merge
   */

  const headParents = await git(
    "git rev-list --parents -n 1 HEAD 2>/dev/null || true"
  );

  const parents = headParents
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const hasMergeCommit =
    parents.length >= 3;

  /*
   * Confirm that the feature work is reachable
   * from main.
   *
   * These files were created by the feature branch,
   * and after a successful merge they remain reachable
   * through main's history.
   */

  const featureHistory = await git(
    "git log main --oneline -- src/search_utils.py src/search_service.py 2>/dev/null || true"
  );

  const featureIntegrated =
    featureHistory.trim() !== "";

  progress.mergeFeature =
    hasMergeCommit &&
    featureIntegrated;

  if (!progress.mergeFeature) {
    return progress;
  }

  /* =========================================
     3. CHECK FEATURE BRANCH CLEANUP
  ========================================== */

  const featureBranch = await git(
    "git rev-parse --verify feature/search 2>/dev/null || true"
  );

  progress.deleteFeatureBranch =
    featureBranch.trim() === "";

  return progress;
};