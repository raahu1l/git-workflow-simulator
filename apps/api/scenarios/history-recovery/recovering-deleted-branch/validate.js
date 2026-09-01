module.exports = async ({
  executeCommand,
  containerId,
}) => {

  const git = async (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  const failures = [];

  // =========================================
  // MILESTONES
  // =========================================

  const currentBranch = await git(
    "git branch --show-current"
  );

  const recoveryBranch = await git(
    "if git show-ref --verify --quiet refs/heads/feature/payment-validation; then echo exists; else echo deleted; fi"
  );

  const recoveryHistory = await git(
    "git log feature/payment-validation --format='%H%x09%s' 2>/dev/null || true"
  );

  const recoveryLines = recoveryHistory
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const recoveryValidationCommit =
    recoveryLines.find(
      (line) =>
        line.endsWith(
          "\tAdd payment validation"
        )
    );

  const recoveryMethodCommit =
    recoveryLines.find(
      (line) =>
        line.endsWith(
          "\tValidate payment method"
        )
    );

  let restoreBranch = false;
  let verifyRecovery = false;
  let mergeRecovery = false;

  if (
    recoveryBranch.trim() === "exists"
  ) {
    const branchTip = await git(
      "git rev-parse feature/payment-validation"
    );

    const recoveredCommits = await git(
      "git log feature/payment-validation --format='%H'"
    );

    const recoveredHashes =
      recoveredCommits
        .split(/\r?\n/)
        .map((hash) => hash.trim())
        .filter(Boolean);

    restoreBranch =
      Boolean(recoveryMethodCommit) &&
      recoveredHashes.includes(
        recoveryMethodCommit.split("\t")[0]
      );

    if (
      recoveryValidationCommit &&
      recoveryMethodCommit
    ) {
      const validationHash =
        recoveryValidationCommit.split("\t")[0];

      const methodHash =
        recoveryMethodCommit.split("\t")[0];

      const methodParent = await git(
        `git rev-parse ${methodHash}^`
      );

      const validationReachable = await git(
        `if git merge-base --is-ancestor ${validationHash} feature/payment-validation; then echo yes; else echo no; fi`
      );

      const methodReachable = await git(
        `if git merge-base --is-ancestor ${methodHash} feature/payment-validation; then echo yes; else echo no; fi`
      );

      const recoveredFile =
        await git(
          "git show feature/payment-validation:src/payment_validation.py 2>/dev/null || true"
        );

      const fileComplete =
        recoveredFile.includes(
          "def validate_payment(amount):"
        ) &&
        recoveredFile.includes(
          "def validate_payment_method(method):"
        );

      verifyRecovery =
        restoreBranch &&
        methodParent.trim() ===
          validationHash &&
        validationReachable.trim() === "yes" &&
        methodReachable.trim() === "yes" &&
        fileComplete;
    }
  }

  const mainHistory = await git(
    "git log main --format='%H%x09%s'"
  );

  const mainLines = mainHistory
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const mainValidationCommit =
    mainLines.find(
      (line) =>
        line.endsWith(
          "\tAdd payment validation"
        )
    );

  const mainMethodCommit =
    mainLines.find(
      (line) =>
        line.endsWith(
          "\tValidate payment method"
        )
    );

  if (
    mainValidationCommit &&
    mainMethodCommit
  ) {
    const mainValidationHash =
      mainValidationCommit.split("\t")[0];

    const mainMethodHash =
      mainMethodCommit.split("\t")[0];

    const validationInMain = await git(
      `if git merge-base --is-ancestor ${mainValidationHash} main; then echo yes; else echo no; fi`
    );

    const methodInMain = await git(
      `if git merge-base --is-ancestor ${mainMethodHash} main; then echo yes; else echo no; fi`
    );

    mergeRecovery =
      verifyRecovery &&
      validationInMain.trim() === "yes" &&
      methodInMain.trim() === "yes";
  }

  const statusForProgress = await git(
    "git status --porcelain --untracked-files=all"
  );

  const progress = {
    restoreBranch,
    verifyRecovery,
    mergeRecovery,
    cleanupBranch:
      mergeRecovery &&
      currentBranch.trim() === "main" &&
      recoveryBranch.trim() === "deleted",
    cleanWorkingTree:
      statusForProgress.trim() === "",
  };

  // =========================================
  // 1. CURRENT BRANCH
  // =========================================

  if (currentBranch.trim() !== "main") {
    failures.push(
      `Current branch is "${currentBranch.trim() || "detached HEAD"}", expected "main".`
    );
  }

  // =========================================
  // 2. RECOVERY BRANCH MUST BE DELETED
  // =========================================

  const recoveryBranchFinal = await git(
    "if git show-ref --verify --quiet refs/heads/feature/payment-validation; then echo exists; else echo deleted; fi"
  );

  if (recoveryBranchFinal.trim() !== "deleted") {
    failures.push(
      "The feature/payment-validation branch still exists."
    );
  }

  // =========================================
  // 3. GET MAIN HISTORY
  // =========================================

  const history = await git(
    "git log main --format='%H%x09%s'"
  );

  const lines = history
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const validationCommit = lines.find(
    (line) =>
      line.endsWith(
        "\tAdd payment validation"
      )
  );

  const methodCommit = lines.find(
    (line) =>
      line.endsWith(
        "\tValidate payment method"
      )
  );

  if (!validationCommit) {
    failures.push(
      "The original 'Add payment validation' commit is not in main."
    );
  }

  if (!methodCommit) {
    failures.push(
      "The original 'Validate payment method' commit is not in main."
    );
  }

  // =========================================
  // 4. VERIFY ORIGINAL COMMIT RELATIONSHIP
  // =========================================

  if (
    validationCommit &&
    methodCommit
  ) {
    const validationHash =
      validationCommit.split("\t")[0];

    const methodHash =
      methodCommit.split("\t")[0];

    const methodParent = await git(
      `git rev-parse ${methodHash}^`
    );

    if (
      methodParent.trim() !==
      validationHash
    ) {
      failures.push(
        "The two recovered commits do not have their original parent relationship."
      );
    }

    // =======================================
    // 5. VERIFY BOTH ARE IN MAIN
    // =======================================

    const validationInMain = await git(
      `if git merge-base --is-ancestor ${validationHash} main; then echo yes; else echo no; fi`
    );

    if (
      validationInMain.trim() !== "yes"
    ) {
      failures.push(
        "The 'Add payment validation' commit is not an ancestor of main."
      );
    }

    const methodInMain = await git(
      `if git merge-base --is-ancestor ${methodHash} main; then echo yes; else echo no; fi`
    );

    if (
      methodInMain.trim() !== "yes"
    ) {
      failures.push(
        "The 'Validate payment method' commit is not an ancestor of main."
      );
    }
  }

  // =========================================
  // 6. VERIFY RECOVERED FILE
  // =========================================

  const fileCheck = await git(
    "test -f src/payment_validation.py && echo exists || echo missing"
  );

  if (fileCheck.trim() !== "exists") {
    failures.push(
      "src/payment_validation.py is missing."
    );
  } else {
    const fileContent = await git(
      "cat src/payment_validation.py"
    );

    if (
      !fileContent.includes(
        "def validate_payment(amount):"
      )
    ) {
      failures.push(
        "validate_payment() is missing from the recovered file."
      );
    }

    if (
      !fileContent.includes(
        "def validate_payment_method(method):"
      )
    ) {
      failures.push(
        "validate_payment_method() is missing from the recovered file."
      );
    }
  }

  // =========================================
  // FINAL RESULT
  // =========================================

  if (failures.length > 0) {
    return {
      success: false,
      progress,
      message:
        "The repository is not in the required final state.",
      details: failures,
    };
  }

  return {
    success: true,
    progress: {
      restoreBranch: true,
      verifyRecovery: true,
      mergeRecovery: true,
      cleanupBranch: true,
      cleanWorkingTree: true,
    },
    message:
      "Recovery complete. The original payment-validation commits were recovered, verified, restored to main, and the temporary recovery branch was removed.",
  };
};