module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const git = (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  /* =========================================
     GET COMMIT HISTORY
  ========================================== */

  const commitsRaw = await git(
    "git rev-list --reverse HEAD 2>/dev/null || true"
  );

  const commits = commitsRaw
    .split(/\r?\n/)
    .map((commit) => commit.trim())
    .filter(Boolean);

  /*
   * The scenario starts with one initial commit.
   *
   * The learner must create exactly three
   * additional commits:
   *
   * 1. Bug fix
   * 2. Helper function
   * 3. Formatting cleanup
   */

  if (commits.length !== 4) {
    return {
      success: false,
      message:
        "Create three separate commits for the three logical changes.",
    };
  }

  /* =========================================
     READ FILE FROM A COMMIT
  ========================================== */

  const getFileAtCommit = async (commit) => {
    try {
      return await git(
        `git show ${commit}:utils.py`
      );
    } catch {
      return "";
    }
  };

  /* =========================================
     FIRST COMMIT — BUG FIX
  ========================================== */

  const bugFixFile =
    await getFileAtCommit(commits[1]);

  const bugFixExists =
    /if\s*\(?\s*quantity\s*<\s*0\s*\)?\s*:/.test(
      bugFixFile
    ) &&
    /raise\s+ValueError\s*\(/.test(
      bugFixFile
    );

  if (!bugFixExists) {
    return {
      success: false,
      message:
        "The first commit should contain the negative-quantity fix.",
    };
  }

  /* =========================================
     SECOND COMMIT — HELPER
  ========================================== */

  const helperFile =
    await getFileAtCommit(commits[2]);

  const helperExists =
    /def\s+is_even\s*\(\s*value\s*\)\s*:/.test(
      helperFile
    ) &&
    /return\s+value\s*%\s*2\s*==\s*0/.test(
      helperFile
    );

  if (!helperExists) {
    return {
      success: false,
      message:
        "The second commit should contain the is_even helper.",
    };
  }

  /* =========================================
     THIRD COMMIT — FORMATTING
  ========================================== */

  const finalCommitFile =
    await getFileAtCommit(commits[3]);

  const formattingExists =
    /return\s+name\.strip\(\)\.title\(\)/.test(
      finalCommitFile
    );

  if (!formattingExists) {
    return {
      success: false,
      message:
        "The third commit should contain the name-formatting cleanup.",
    };
  }

  /* =========================================
     FINAL FILE
  ========================================== */

  const finalFile = await git(
    "cat utils.py"
  );

  const finalHasBugFix =
    /if\s*\(?\s*quantity\s*<\s*0\s*\)?\s*:/.test(
      finalFile
    ) &&
    /raise\s+ValueError\s*\(/.test(
      finalFile
    );

  const finalHasHelper =
    /def\s+is_even\s*\(\s*value\s*\)\s*:/.test(
      finalFile
    ) &&
    /return\s+value\s*%\s*2\s*==\s*0/.test(
      finalFile
    );

  const finalHasFormatting =
    /return\s+name\.strip\(\)\.title\(\)/.test(
      finalFile
    );

  if (
    !finalHasBugFix ||
    !finalHasHelper ||
    !finalHasFormatting
  ) {
    return {
      success: false,
      message:
        "The final file does not contain all three required changes.",
    };
  }

  /* =========================================
     WORKING TREE
  ========================================== */

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

  /* =========================================
     SUCCESS
  ========================================== */

  return {
    success: true,
    message:
      "Excellent! The commit history is clean, logical, and easy to review.",
  };
};