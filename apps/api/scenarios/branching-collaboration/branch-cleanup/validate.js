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
     1. VERIFY BRANCH RENAME
  ========================================== */

  const branches = await git(
    "git branch --format='%(refname:short)'"
  );

  const branchList = branches
    .split(/\r?\n/)
    .map((branch) => branch.trim())
    .filter(Boolean);

  if (
    branchList.includes("fix-bug") ||
    !branchList.includes(
      "fix-login-validation"
    )
  ) {
    return {
      success: false,
      message:
        "The active bug-fix branch has not been renamed correctly. Rename fix-bug to fix-login-validation.",
    };
  }

  /* =========================================
     2. VERIFY ACTIVE WORK
  ========================================== */

  const expectedFixTip = await git(
    "git rev-parse scenario-fix-bug-baseline"
  );

  const actualFixTip = await git(
    "git rev-parse fix-login-validation"
  );

  if (
    expectedFixTip.trim() !==
    actualFixTip.trim()
  ) {
    return {
      success: false,
      message:
        "The branch was renamed, but its original bug-fix history is no longer intact.",
    };
  }

  /* =========================================
     3. VERIFY OLD SIGNUP BRANCH DELETED
  ========================================== */

  if (
    branchList.includes(
      "feature/old-signup"
    )
  ) {
    return {
      success: false,
      message:
        "The old signup branch still exists. It has already been merged into main and can be safely removed.",
    };
  }

  /* =========================================
     4. VERIFY MAIN WAS NOT CHANGED
  ========================================== */

  const expectedMainTip = await git(
    "git rev-parse scenario-main-baseline"
  );

  const actualMainTip = await git(
    "git rev-parse main"
  );

  if (
    expectedMainTip.trim() !==
    actualMainTip.trim()
  ) {
    return {
      success: false,
      message:
        "main has changed. The cleanup should not modify the main branch's history.",
    };
  }

  /* =========================================
     SUCCESS
  ========================================== */

  return {
    success: true,
    message:
      "Much cleaner now. Thanks for keeping the branch list from turning into a junk drawer.",
  };
};