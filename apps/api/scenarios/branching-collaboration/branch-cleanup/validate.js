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

  // =========================================
  // MUST FINISH ON RENAMED ACTIVE BRANCH
  // =========================================

  const currentBranch = await git(
    "git branch --show-current"
  );

  if (
    currentBranch.trim() !==
    "fix-login-validation"
  ) {
    return {
      success: false,
      message:
        "Finish on the renamed active login-fix branch: fix-login-validation.",
    };
  }

  // =========================================
  // OLD BRANCH MUST BE GONE
  // =========================================

  const oldActiveBranch = await git(
    "git show-ref --verify --quiet refs/heads/fix-bug && echo exists || echo missing"
  );

  if (oldActiveBranch.trim() !== "missing") {
    return {
      success: false,
      message:
        "The active branch still has its old name. Rename fix-bug to fix-login-validation.",
    };
  }

  // =========================================
  // RENAMED BRANCH MUST EXIST
  // =========================================

  const renamedBranch = await git(
    "git show-ref --verify --quiet refs/heads/fix-login-validation && echo exists || echo missing"
  );

  if (renamedBranch.trim() !== "exists") {
    return {
      success: false,
      message:
        "The active login-fix branch has not been renamed correctly.",
    };
  }

  // =========================================
  // BOTH LOGIN COMMITS MUST EXIST
  // =========================================

  const history = await git(
    "git log fix-login-validation --format='%H|%s'"
  );

  const historyLines = history
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const loginFixCommit =
    historyLines.find(
      (line) =>
        line.endsWith(
          "|Fix empty login credentials"
        )
    );

  const loginErrorCommit =
    historyLines.find(
      (line) =>
        line.endsWith(
          "|Improve login error handling"
        )
    );

  if (
    !loginFixCommit ||
    !loginErrorCommit
  ) {
    return {
      success: false,
      message:
        "The renamed branch does not contain both original login-fix commits.",
    };
  }

  // =========================================
  // VERIFY COMMITS ARE REACHABLE FROM BRANCH
  // =========================================

  const loginFixHash =
    loginFixCommit.split("|")[0];

  const loginErrorHash =
    loginErrorCommit.split("|")[0];

  const loginFixReachable = await git(
    `git merge-base --is-ancestor ${loginFixHash} fix-login-validation && echo yes || echo no`
  );

  const loginErrorReachable = await git(
    `git merge-base --is-ancestor ${loginErrorHash} fix-login-validation && echo yes || echo no`
  );

  if (
    loginFixReachable.trim() !== "yes" ||
    loginErrorReachable.trim() !== "yes"
  ) {
    return {
      success: false,
      message:
        "The original login-fix commits are no longer safely reachable from the renamed branch.",
    };
  }

  // =========================================
  // OLD SIGNUP BRANCH MUST BE DELETED
  // =========================================

  const signupBranch = await git(
    "git show-ref --verify --quiet refs/heads/feature/old-signup && echo exists || echo missing"
  );

  if (signupBranch.trim() !== "missing") {
    return {
      success: false,
      message:
        "The already-merged feature/old-signup branch still exists.",
    };
  }

  // =========================================
  // MAIN MUST REMAIN UNCHANGED
  // =========================================

  const baselineMain = await git(
    "git rev-parse scenario-main-baseline"
  );

  const currentMain = await git(
    "git rev-parse main"
  );

  if (
    baselineMain.trim() !==
    currentMain.trim()
  ) {
    return {
      success: false,
      message:
        "main was modified. This cleanup should not change main's history.",
    };
  }

  // =========================================
  // ACTIVE BRANCH MUST STILL POINT TO
  // ORIGINAL LOGIN WORK
  // =========================================

  const baselineFix = await git(
    "git rev-parse scenario-fix-bug-baseline"
  );

  const currentFix = await git(
    "git rev-parse fix-login-validation"
  );

  if (
    baselineFix.trim() !==
    currentFix.trim()
  ) {
    return {
      success: false,
      message:
        "The active login-fix branch no longer points to the original completed work.",
    };
  }

  // =========================================
  // WORKING TREE MUST BE CLEAN
  // =========================================

  const status = await git(
    "git status --porcelain --untracked-files=all"
  );

  if (status.trim() !== "") {
    return {
      success: false,
      message:
        "The branch cleanup is complete, but the working tree is not clean.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,
    message:
      "Much cleaner now. The active login-fix work is preserved, the branch has a clear name, the merged signup branch is removed, and main remains untouched.",
  };
};