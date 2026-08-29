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

  const failures = [];

  // =========================================
  // 1. CURRENT BRANCH
  // =========================================

  const currentBranch = await git(
    "git branch --show-current"
  );

  if (currentBranch.trim() !== "main") {
    failures.push(
      `Current branch is "${currentBranch.trim() || "detached HEAD"}", expected "main".`
    );
  }

  // =========================================
  // 2. RECOVERY BRANCH MUST BE DELETED
  // =========================================

  const recoveryBranch = await git(
    "if git show-ref --verify --quiet refs/heads/feature/payment-validation; then echo exists; else echo deleted; fi"
  );

  if (recoveryBranch.trim() !== "deleted") {
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
      message:
        "The repository is not in the required final state.",
      details: failures,
    };
  }

  return {
    success: true,
    message:
      "Recovery complete. The original payment-validation commits were recovered, verified, restored to main, and the temporary recovery branch was removed.",
  };
};