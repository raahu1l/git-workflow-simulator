module.exports = async ({
  executeCommand,
  containerId,
  setupOutput,
}) => {
  const git = async (command) => {
    return executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );
  };

  /*
   * Parse this session's own setup output.
   *
   * setupOutput is captured per-session by the
   * backend from THIS session's own setup.sh run —
   * it can never contain another session's value.
   */
  const match = (setupOutput || "").match(
    /LOST_COMMIT=([0-9a-f]{6,40})/
  );

  const lostCommit = match ? match[1] : "";

  if (!lostCommit) {
    return {};
  }

  /* =========================================
     TASK 1 — RECOVER BRANCH
  ========================================== */

  const branchExists =
    await git(
      "if git show-ref --verify --quiet refs/heads/feature/payment-validation; then echo yes; else echo no; fi"
    );

  let restoreBranch = false;

  if (
    branchExists.trim() === "yes"
  ) {
    const branchTip = await git(
      "git rev-parse feature/payment-validation"
    );

    restoreBranch =
      branchTip.trim() === lostCommit;
  }

  /* =========================================
     TASK 2 — VERIFY RECOVERED COMMITS
  ========================================== */

  const currentBranch = await git(
    "git branch --show-current"
  );

  let verifyCommits = false;

  if (
    currentBranch.trim() ===
      "feature/payment-validation"
  ) {
    const history = await git(
      "git log feature/payment-validation --format='%s'"
    );

    const hasFirstCommit =
      history.includes(
        "Add payment validation"
      );

    const hasSecondCommit =
      history.includes(
        "Validate payment method"
      );

    verifyCommits =
      restoreBranch &&
      hasFirstCommit &&
      hasSecondCommit;
  }

  /* =========================================
     TASK 3 — MERGED INTO MAIN
  ========================================== */

  const merged =
    await git(
      `if git merge-base --is-ancestor ${lostCommit} main; then echo yes; else echo no; fi`
    );

  const mergeToMain =
    merged.trim() === "yes";

  /* =========================================
     TASK 4 — CLEAN UP BRANCH
  ========================================== */

  const recoveryBranchStillExists =
    await git(
      "if git show-ref --verify --quiet refs/heads/feature/payment-validation; then echo yes; else echo no; fi"
    );

  const cleanUpBranch =
    mergeToMain &&
    recoveryBranchStillExists.trim() ===
      "no";

  return {
    restoreBranch,
    verifyRecovery: verifyCommits,
    mergeRecovery: mergeToMain,
    cleanupBranch: cleanUpBranch,
  };
};