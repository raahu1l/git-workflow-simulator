module.exports = async ({
  executeCommand,
  containerId,
}) => {

  const git = async (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  // =========================================
  // MILESTONES
  // =========================================

  const currentBranch = await git(
    "git branch --show-current"
  );

  const oldActiveBranch = await git(
    "git show-ref --verify --quiet refs/heads/fix-bug && echo exists || echo missing"
  );

  const renamedBranch = await git(
    "git show-ref --verify --quiet refs/heads/fix-login-validation && echo exists || echo missing"
  );

  const history = await git(
    "git log fix-login-validation --format='%H|%s' 2>/dev/null || true"
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

  const loginFixHash =
    loginFixCommit?.split("|")[0];

  const loginErrorHash =
    loginErrorCommit?.split("|")[0];

  let commitsIntact = false;

  if (
    renamedBranch.trim() === "exists" &&
    loginFixHash &&
    loginErrorHash
  ) {
    const loginFixReachable =
      await git(
        `git merge-base --is-ancestor ${loginFixHash} fix-login-validation && echo yes || echo no`
      );

    const loginErrorReachable =
      await git(
        `git merge-base --is-ancestor ${loginErrorHash} fix-login-validation && echo yes || echo no`
      );

    commitsIntact =
      loginFixReachable.trim() === "yes" &&
      loginErrorReachable.trim() === "yes";
  }

  const signupBranch = await git(
    "git show-ref --verify --quiet refs/heads/feature/old-signup && echo exists || echo missing"
  );

  const statusForProgress = await git(
    "git status --porcelain --untracked-files=all"
  );

  const progress = {
    renameBranch:
      currentBranch.trim() ===
        "fix-login-validation" &&
      oldActiveBranch.trim() === "missing" &&
      renamedBranch.trim() === "exists",

    verifyWork:
      currentBranch.trim() ===
        "fix-login-validation" &&
      renamedBranch.trim() === "exists" &&
      commitsIntact,

    deleteMergedBranch:
      currentBranch.trim() ===
        "fix-login-validation" &&
      signupBranch.trim() === "missing",

    cleanWorkingTree:
      statusForProgress.trim() === "",
  };

  // =========================================
  // MUST FINISH ON RENAMED ACTIVE BRANCH
  // =========================================

  if (
    currentBranch.trim() !==
    "fix-login-validation"
  ) {
    return {
      success: false,
      progress,
      message:
        "Finish on the renamed active login-fix branch: fix-login-validation.",
    };
  }

  // =========================================
  // OLD BRANCH MUST BE GONE
  // =========================================

  if (oldActiveBranch.trim() !== "missing") {
    return {
      success: false,
      progress,
      message:
        "The active branch still has its old name. Rename fix-bug to fix-login-validation.",
    };
  }

  // =========================================
  // RENAMED BRANCH MUST EXIST
  // =========================================

  if (renamedBranch.trim() !== "exists") {
    return {
      success: false,
      progress,
      message:
        "The active login-fix branch has not been renamed correctly.",
    };
  }

  // =========================================
  // BOTH LOGIN COMMITS MUST EXIST
  // =========================================

  const historyFinal = await git(
    "git log fix-login-validation --format='%H|%s'"
  );

  const historyLinesFinal = historyFinal
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const loginFixCommitFinal =
    historyLinesFinal.find(
      (line) =>
        line.endsWith(
          "|Fix empty login credentials"
        )
    );

  const loginErrorCommitFinal =
    historyLinesFinal.find(
      (line) =>
        line.endsWith(
          "|Improve login error handling"
        )
    );

  if (
    !loginFixCommitFinal ||
    !loginErrorCommitFinal
  ) {
    return {
      success: false,
      progress,
      message:
        "The renamed branch does not contain both original login-fix commits.",
    };
  }

  // =========================================
  // VERIFY COMMITS ARE REACHABLE FROM BRANCH
  // =========================================

  const loginFixHashFinal =
    loginFixCommitFinal.split("|")[0];

  const loginErrorHashFinal =
    loginErrorCommitFinal.split("|")[0];

  const loginFixReachable = await git(
    `git merge-base --is-ancestor ${loginFixHashFinal} fix-login-validation && echo yes || echo no`
  );

  const loginErrorReachable = await git(
    `git merge-base --is-ancestor ${loginErrorHashFinal} fix-login-validation && echo yes || echo no`
  );

  if (
    loginFixReachable.trim() !== "yes" ||
    loginErrorReachable.trim() !== "yes"
  ) {
    return {
      success: false,
      progress,
      message:
        "The original login-fix commits are no longer safely reachable from the renamed branch.",
    };
  }

  // =========================================
  // OLD SIGNUP BRANCH MUST BE DELETED
  // =========================================

  const signupBranchFinal = await git(
    "git show-ref --verify --quiet refs/heads/feature/old-signup && echo exists || echo missing"
  );

  if (signupBranchFinal.trim() !== "missing") {
    return {
      success: false,
      progress,
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
      progress,
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
      progress,
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
      progress,
      message:
        "The branch cleanup is complete, but the working tree is not clean.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,
    progress: {
      renameBranch: true,
      verifyWork: true,
      deleteMergedBranch: true,
      cleanWorkingTree: true,
    },
    message:
      "Much cleaner now. The active login-fix work is preserved, the branch has a clear name, the merged signup branch is removed, and main remains untouched.",
  };
};