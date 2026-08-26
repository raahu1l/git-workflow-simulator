module.exports = async ({
  executeCommand,
  containerId,
  actions = [],
}) => {
  const git = async (command) => {
    return executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );
  };

  /* =========================================
     1. CHECK BRANCH RENAME
  ========================================== */

  const fixBugExists = await git(
    "if git show-ref --verify --quiet refs/heads/fix-bug; then echo yes; else echo no; fi"
  );

  const renamedBranchExists = await git(
    "if git show-ref --verify --quiet refs/heads/fix-login-validation; then echo yes; else echo no; fi"
  );

  const renameBranch =
    fixBugExists.trim() === "no" &&
    renamedBranchExists.trim() === "yes";

  /* =========================================
     2. VERIFY ORIGINAL COMMITS
  ========================================== */

  let commitsStillIntact = false;

  if (renamedBranchExists.trim() === "yes") {
    const expectedFixTip = await git(
      "git rev-parse scenario-fix-bug-baseline"
    );

    const actualFixTip = await git(
      "git rev-parse fix-login-validation"
    );

    commitsStillIntact =
      expectedFixTip.trim() !== "" &&
      actualFixTip.trim() !== "" &&
      expectedFixTip.trim() ===
        actualFixTip.trim();
  }

  /* =========================================
     3. FIND RENAME COMMAND
  ========================================== */

  const renameActionIndex =
    actions.findIndex((action) => {
      const command = action
        .trim()
        .toLowerCase();

      return (
        command ===
        "git branch -m fix-login-validation"
      );
    });

  /* =========================================
     4. HISTORY MUST BE INSPECTED AFTER
        THE RENAME
  ========================================== */

  let inspectedHistoryAfterRename = false;

  if (renameActionIndex !== -1) {
    inspectedHistoryAfterRename =
      actions
        .slice(renameActionIndex + 1)
        .some((action) => {
          const command = action
            .trim()
            .toLowerCase();

          return (
            command === "git log" ||
            command.startsWith("git log ")
          );
        });
  }

  const verifyWork =
    renameBranch &&
    commitsStillIntact &&
    inspectedHistoryAfterRename;

  /* =========================================
     5. CHECK OLD SIGNUP BRANCH
  ========================================== */

  const oldSignupExists = await git(
    "if git show-ref --verify --quiet refs/heads/feature/old-signup; then echo yes; else echo no; fi"
  );

  const deleteMergedBranch =
    oldSignupExists.trim() === "no";

  /* =========================================
     RETURN PROGRESS
  ========================================== */

  return {
    renameBranch,
    verifyWork,
    deleteMergedBranch,
  };
};