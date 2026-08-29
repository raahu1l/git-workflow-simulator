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
  // REPOSITORY MUST EXIST
  // =========================================

  const branch = await git(
    "git branch --show-current"
  );

  if (branch.trim() !== "main") {
    return {
      success: false,
      message:
        "Finish the recovery on main.",
    };
  }

  // =========================================
  // GET HISTORY
  // =========================================

  const history = await git(
    "git log main --format='%H|%s'"
  );

  const lines = history
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // =========================================
  // ORIGINAL COMMITS MUST EXIST
  // =========================================

  const initialLine = lines.find(
    (line) =>
      line.endsWith(
        "|Add order total calculation"
      )
  );

  const badLine = lines.find(
    (line) =>
      line.endsWith(
        "|Break total formatting"
      )
  );

  if (!initialLine || !badLine) {
    return {
      success: false,
      message:
        "The original repository history must remain intact.",
    };
  }

  const initialHash =
    initialLine.split("|")[0];

  const badHash =
    badLine.split("|")[0];

  // =========================================
  // BAD COMMIT MUST FOLLOW INITIAL COMMIT
  // =========================================

  const badCommitIsBasedOnInitial =
    await git(
      `git merge-base --is-ancestor ${initialHash} ${badHash} && echo yes || echo no`
    );

  if (
    badCommitIsBasedOnInitial.trim() !== "yes"
  ) {
    return {
      success: false,
      message:
        "The original commit history has been altered.",
    };
  }

  // =========================================
  // FIND REVERT COMMIT
  // =========================================

  const revertLine = lines.find(
    (line) =>
      line.includes(
        'Revert "Break total formatting"'
      )
  );

  if (!revertLine) {
    return {
      success: false,
      message:
        "The breaking commit has not been reverted with a new commit.",
    };
  }

  const revertHash =
    revertLine.split("|")[0];

  // =========================================
  // REVERT MUST COME AFTER BAD COMMIT
  // =========================================

  const revertFollowsBadCommit =
    await git(
      `git merge-base --is-ancestor ${badHash} ${revertHash} && echo yes || echo no`
    );

  if (
    revertFollowsBadCommit.trim() !== "yes"
  ) {
    return {
      success: false,
      message:
        "The revert commit must come after the original breaking commit.",
    };
  }

  // =========================================
  // ORIGINAL BAD COMMIT MUST REMAIN
  // =========================================

  const originalStillReachable =
    await git(
      `git merge-base --is-ancestor ${badHash} main && echo yes || echo no`
    );

  if (
    originalStillReachable.trim() !== "yes"
  ) {
    return {
      success: false,
      message:
        "The original breaking commit must remain in main's history.",
    };
  }

  // =========================================
  // FINAL STATE MUST MATCH PRE-BREAK STATE
  // =========================================

  const expectedContent = await git(
    `git show ${badHash}^:app.py`
  );

  const currentContent = await git(
    "git show main:app.py"
  );

  if (
    expectedContent !== currentContent
  ) {
    return {
      success: false,
      message:
        "The final application state does not match the state before the breaking commit.",
    };
  }

  // =========================================
  // WORKING TREE MUST BE CLEAN
  // =========================================

  const status = await git(
    "git status --porcelain"
  );

  if (status.trim() !== "") {
    return {
      success: false,
      message:
        "Finish with a clean working tree.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,
    message:
      "Build's green again and nobody has to force-pull anything. Exactly the right call.",
  };
};