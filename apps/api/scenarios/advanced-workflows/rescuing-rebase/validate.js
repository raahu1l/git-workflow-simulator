module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const git = async (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  /*
   * =========================================================
   * BASIC REPOSITORY STATE
   * =========================================================
   */

  const branchName = (
    await git("git branch --show-current")
  ).trim();

  const featureBaseline = (
    await git(
      "git rev-parse scenario-notifications-feature-baseline"
    )
  ).trim();

  const mainBaseline = (
    await git(
      "git rev-parse scenario-notifications-main-baseline"
    )
  ).trim();

  const currentFeature = (
    await git(
      "git rev-parse feature/notifications"
    )
  ).trim();

  const currentMain = (
    await git("git rev-parse main")
  ).trim();

  const mainUnchanged =
    currentMain === mainBaseline;

  /*
   * =========================================================
   * REBASE STATE
   * =========================================================
   */

  const rebaseMergeExists = (
    await git(
      `[ -d "$(git rev-parse --git-path rebase-merge)" ] && echo yes || echo no`
    )
  ).trim();

  const rebaseApplyExists = (
    await git(
      `[ -d "$(git rev-parse --git-path rebase-apply)" ] && echo yes || echo no`
    )
  ).trim();

  const rebaseInProgress =
    rebaseMergeExists === "yes" ||
    rebaseApplyExists === "yes";

  /*
   * =========================================================
   * CONFLICT STATE
   * =========================================================
   *
   * git diff --name-only --diff-filter=U is the authoritative
   * state check for unresolved merge/rebase conflicts.
   */

  const unresolvedFiles = (
    await git(
      "git diff --name-only --diff-filter=U"
    )
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const hasUnresolvedConflict =
    unresolvedFiles.length > 0;

  /*
   * =========================================================
   * CURRENT WORKING FILE
   * =========================================================
   */

  const workingFile = await git(
    "cat src/notifications.py 2>/dev/null || true"
  );

  const hasConflictMarkers =
    workingFile.includes("<<<<<<<") ||
    workingFile.includes("=======") ||
    workingFile.includes(">>>>>>>");

  /*
   * We don't require an exact file string.
   *
   * We only require that the intended feature behavior
   * remains after resolving the conflict.
   */

  const containsFeatureNotification =
    workingFile.includes('NOTIFICATION_FORMAT = "email"') &&
    workingFile.includes(
      'Sending email notification'
    );

  /*
   * =========================================================
   * INDEX / STAGING STATE
   * =========================================================
   *
   * During a rebase, the resolved file is represented in the
   * index/working tree before the branch ref is updated.
   *
   * Therefore we inspect the index directly rather than using
   * git show feature/notifications:...
   */

  const stagedFiles = (
    await git(
      "git diff --cached --name-only"
    )
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const notificationFileStaged =
    stagedFiles.includes(
      "src/notifications.py"
    );

  /*
   * =========================================================
   * ALEX RESOLUTION MILESTONE
   * =========================================================
   *
   * Meaningful state:
   *
   * - rebase is still active
   * - conflict is gone
   * - conflict markers are gone
   * - intended feature behavior is present
   * - file is staged
   *
   * No command history is inspected.
   */

  const resolveConflict =
    rebaseInProgress &&
    !hasUnresolvedConflict &&
    !hasConflictMarkers &&
    containsFeatureNotification &&
    notificationFileStaged;

  /*
   * =========================================================
   * WORKING TREE
   * =========================================================
   */

  const status = (
    await git(
      "git status --porcelain --untracked-files=all"
    )
  ).trim();

  const workingTreeClean =
    status === "";

  /*
   * =========================================================
   * ABORT PATH
   * =========================================================
   *
   * After aborting, the feature branch must be exactly the
   * same commit it was at before the rebase.
   */

  const abortRebase =
    !rebaseInProgress &&
    branchName === "feature/notifications" &&
    currentFeature === featureBaseline &&
    mainUnchanged &&
    workingTreeClean;

  /*
   * =========================================================
   * FINAL REBASE PATH
   * =========================================================
   */

  const featureContainsMain = (
    await git(
      "git merge-base --is-ancestor main feature/notifications >/dev/null 2>&1 && echo yes || echo no"
    )
  ).trim() === "yes";

  const finalFeatureContent = await git(
    "git show feature/notifications:src/notifications.py 2>/dev/null || true"
  );

  const finalHasConflictMarkers =
    finalFeatureContent.includes("<<<<<<<") ||
    finalFeatureContent.includes("=======") ||
    finalFeatureContent.includes(">>>>>>>");

  const finalContainsFeatureBehavior =
    finalFeatureContent.includes(
      'NOTIFICATION_FORMAT = "email"'
    ) &&
    finalFeatureContent.includes(
      "Sending email notification"
    );

  /*
   * The feature branch must have moved because a completed
   * rebase rewrites the feature commit.
   */

  const featureWasRewritten =
    currentFeature !== featureBaseline;

  const completedRebase =
    !rebaseInProgress &&
    branchName === "feature/notifications" &&
    mainUnchanged &&
    featureWasRewritten &&
    featureContainsMain &&
    !finalHasConflictMarkers &&
    finalContainsFeatureBehavior &&
    workingTreeClean;

  /*
   * =========================================================
   * FINAL RESULT
   * =========================================================
   */

  const recovered =
    abortRebase ||
    completedRebase;

  /*
   * =========================================================
   * PROGRESS
   * =========================================================
   */

  const progress = {
    resolveConflict,
    abortRebase
  };

  /*
   * =========================================================
   * ABORT SUCCESS
   * =========================================================
   *
   * Keep abortRebase TRUE here so Alex can react to the
   * state transition before/alongside completion.
   */

  if (abortRebase) {
    return {
      success: true,
      progress: {
        resolveConflict: false,
        abortRebase: true
      },
      message:
        "Good instinct knowing you could always back out safely. Either way, we're in a clean state now."
    };
  }

  /*
   * =========================================================
   * COMPLETED REBASE SUCCESS
   * =========================================================
   */

  if (completedRebase) {
    return {
      success: true,
      progress: {
        resolveConflict: false,
        abortRebase: false
      },
      message:
        "Good instinct knowing you could always back out safely. Either way, we're in a clean state now."
    };
  }

  /*
   * =========================================================
   * RESOLVED BUT NOT YET CONTINUED
   * =========================================================
   */

  if (resolveConflict) {
    return {
      success: false,
      progress: {
        resolveConflict: true,
        abortRebase: false
      },
      message:
        "Nice. The conflict is resolved and staged. Continue the rebase when you're ready."
    };
  }

  /*
   * =========================================================
   * STILL CONFLICTED
   * =========================================================
   */

  if (
    rebaseInProgress &&
    hasUnresolvedConflict
  ) {
    return {
      success: false,
      progress,
      message:
        "The rebase is paused on a conflict. Either resolve the conflict or abort the rebase safely."
    };
  }

  /*
   * =========================================================
   * STILL REBASING
   * =========================================================
   */

  if (rebaseInProgress) {
    return {
      success: false,
      progress,
      message:
        "The rebase is still in progress. Finish resolving the conflict or abort the rebase."
    };
  }

  /*
   * =========================================================
   * OTHER FAILURE STATES
   * =========================================================
   */

  if (
    branchName !== "feature/notifications"
  ) {
    return {
      success: false,
      progress,
      message:
        "Finish on feature/notifications."
    };
  }

  if (!mainUnchanged) {
    return {
      success: false,
      progress,
      message:
        "The main branch should remain unchanged."
    };
  }

  if (!workingTreeClean) {
    return {
      success: false,
      progress,
      message:
        "The working tree must be clean when you finish."
    };
  }

  if (!recovered) {
    return {
      success: false,
      progress,
      message:
        "The rebase was not recovered correctly. Either restore the original branch state or complete the conflict resolution and rebase."
    };
  }

  return {
    success: false,
    progress,
    message:
      "The repository is not yet in one of the valid recovered states."
  };
};