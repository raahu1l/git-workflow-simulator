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

  /* =========================================
     LOAD ORIGINAL LOST COMMIT
  ========================================== */

  const match = (setupOutput || "").match(
    /LOST_COMMIT=([0-9a-f]{6,40})/
  );

  const lostCommit = match ? match[1] : "";

  if (!lostCommit) {
    return {
      success: false,
      message:
        "Recovery metadata could not be found.",
    };
  }

  /* =========================================
     1. RECOVERED WORK MUST BE IN MAIN
  ========================================== */

  const inMain = await git(
    `if git merge-base --is-ancestor ${lostCommit} main; then echo yes; else echo no; fi`
  );

  if (inMain.trim() !== "yes") {
    return {
      success: false,
      message:
        "The recovered payment-validation work has not been merged into main.",
    };
  }

  /* =========================================
     2. BOTH ORIGINAL COMMITS MUST BE IN MAIN
  ========================================== */

  const history = await git(
    "git log main --format='%s'"
  );

  const hasAddValidation =
    history.includes(
      "Add payment validation"
    );

  const hasValidateMethod =
    history.includes(
      "Validate payment method"
    );

  if (
    !hasAddValidation ||
    !hasValidateMethod
  ) {
    return {
      success: false,
      message:
        "Both original payment-validation commits must be present in main.",
    };
  }

  /* =========================================
     3. RECOVERY BRANCH MUST BE DELETED
  ========================================== */

  const branchExists = await git(
    "if git show-ref --verify --quiet refs/heads/feature/payment-validation; then echo yes; else echo no; fi"
  );

  if (
    branchExists.trim() === "yes"
  ) {
    return {
      success: false,
      message:
        "The recovered work is in main, but the recovery branch has not been deleted.",
    };
  }

  /* =========================================
     4. FINAL SUCCESS
  ========================================== */

  return {
    success: true,
    message:
      "Recovery complete. The deleted branch was recovered, the original commits were verified, the work was merged into main, and the recovery branch was safely removed.",
  };
};