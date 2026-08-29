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
  // REPOSITORY
  // =========================================

  const repository = await executeCommand(
    containerId,
    "test -d /workspace/.git && echo yes || echo no"
  );

  if (repository.trim() !== "yes") {
    return {
      success: false,
      message:
        "The Git repository has not been initialized.",
    };
  }

  // =========================================
  // COMMIT HISTORY
  // =========================================

  const commitsRaw = await git(
    "git rev-list --reverse HEAD"
  );

  const commits = commitsRaw
    .split(/\r?\n/)
    .map((commit) => commit.trim())
    .filter(Boolean);

  /*
   * Expected history:
   *
   * 1. Initial repository state
   * 2. Bug fix
   * 3. Helper function
   * 4. Formatting cleanup
   */

  if (commits.length !== 4) {
    return {
      success: false,
      message:
        "The repository should contain the initial commit followed by three separate logical commits.",
    };
  }

  // =========================================
  // READ FILE FROM A COMMIT
  // =========================================

  const getFileAtCommit = async (commit) => {
    try {
      return await git(
        `git show ${commit}:utils.py`
      );
    } catch {
      return "";
    }
  };

  // =========================================
  // INITIAL COMMIT
  // =========================================

  const initialFile =
    await getFileAtCommit(commits[0]);

  if (
    !initialFile.includes(
      "return price * quantity"
    ) ||
    !initialFile.includes(
      "return name.strip()"
    ) ||
    initialFile.includes(
      "def is_even(value)"
    )
  ) {
    return {
      success: false,
      message:
        "The repository does not appear to have the expected initial state.",
    };
  }

  // =========================================
  // BUG-FIX COMMIT
  // =========================================

  const bugFixFile =
    await getFileAtCommit(commits[1]);

  const bugFixCorrect =
    bugFixFile.includes(
      "if quantity < 0:"
    ) &&
    bugFixFile.includes(
      'raise ValueError("quantity cannot be negative")'
    ) &&
    !bugFixFile.includes(
      "def is_even(value)"
    ) &&
    bugFixFile.includes(
      "return name.strip()"
    );

  if (!bugFixCorrect) {
    return {
      success: false,
      message:
        "The first learner commit should contain only the negative-quantity bug fix.",
    };
  }

  // =========================================
  // HELPER COMMIT
  // =========================================

  const helperFile =
    await getFileAtCommit(commits[2]);

  const helperCorrect =
    helperFile.includes(
      "def is_even(value):"
    ) &&
    helperFile.includes(
      "return value % 2 == 0"
    ) &&
    helperFile.includes(
      "if quantity < 0:"
    ) &&
    helperFile.includes(
      'raise ValueError("quantity cannot be negative")'
    ) &&
    helperFile.includes(
      "return name.strip()"
    );

  if (!helperCorrect) {
    return {
      success: false,
      message:
        "The second learner commit should add only the is_even helper to the already-fixed file.",
    };
  }

  // =========================================
  // FORMATTING COMMIT
  // =========================================

  const formattingFile =
    await getFileAtCommit(commits[3]);

  const formattingCorrect =
    formattingFile.includes(
      "if quantity < 0:"
    ) &&
    formattingFile.includes(
      'raise ValueError("quantity cannot be negative")'
    ) &&
    formattingFile.includes(
      "def is_even(value):"
    ) &&
    formattingFile.includes(
      "return value % 2 == 0"
    ) &&
    formattingFile.includes(
      "return name.strip().title()"
    );

  if (!formattingCorrect) {
    return {
      success: false,
      message:
        "The third learner commit should contain the name-formatting cleanup.",
    };
  }

  // =========================================
  // VERIFY COMMIT BOUNDARIES
  // =========================================

  const bugFixDiff = await git(
    `git diff ${commits[0]} ${commits[1]} -- utils.py`
  );

  const helperDiff = await git(
    `git diff ${commits[1]} ${commits[2]} -- utils.py`
  );

  const formattingDiff = await git(
    `git diff ${commits[2]} ${commits[3]} -- utils.py`
  );

  // Bug-fix commit must introduce the bug fix.
  if (
    !bugFixDiff.includes(
      "if quantity < 0:"
    ) ||
    !bugFixDiff.includes(
      'raise ValueError("quantity cannot be negative")'
    )
  ) {
    return {
      success: false,
      message:
        "The bug-fix change is not isolated correctly.",
    };
  }

  // Helper commit must introduce the helper.
  if (
    !helperDiff.includes(
      "def is_even(value):"
    ) ||
    !helperDiff.includes(
      "return value % 2 == 0"
    )
  ) {
    return {
      success: false,
      message:
        "The helper-function change is not isolated correctly.",
    };
  }

  // Formatting commit must introduce the formatting change.
  if (
    !formattingDiff.includes(
      "return name.strip().title()"
    )
  ) {
    return {
      success: false,
      message:
        "The formatting change is not isolated correctly.",
    };
  }

  // =========================================
  // FINAL FILE
  // =========================================

  const finalFile = await git(
    "cat utils.py"
  );

  const finalStateCorrect =
    finalFile.includes(
      "if quantity < 0:"
    ) &&
    finalFile.includes(
      'raise ValueError("quantity cannot be negative")'
    ) &&
    finalFile.includes(
      "def is_even(value):"
    ) &&
    finalFile.includes(
      "return value % 2 == 0"
    ) &&
    finalFile.includes(
      "return name.strip().title()"
    );

  if (!finalStateCorrect) {
    return {
      success: false,
      message:
        "The final utils.py does not contain all three required changes.",
    };
  }

  // =========================================
  // CLEAN WORKING TREE
  // =========================================

  const status = await git(
    "git status --porcelain --untracked-files=all"
  );

  if (status.trim() !== "") {
    return {
      success: false,
      message:
        "The required commits are present, but the working tree is not clean.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,
    message:
      "Excellent! The three logical changes are isolated in the correct order and the repository is clean.",
  };
};