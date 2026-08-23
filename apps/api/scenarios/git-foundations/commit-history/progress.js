module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const progress = {
    bugFixCommit: false,
    helperCommit: false,
    formattingCommit: false,
  };

  const git = async (command) => {
    return executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );
  };

  /* =========================================
     GET COMMIT HISTORY
  ========================================== */

  let commits = [];

  try {
    const output = await git(
      "git rev-list --reverse HEAD"
    );

    commits = output
      .split(/\r?\n/)
      .map((commit) => commit.trim())
      .filter(Boolean);
  } catch (error) {
    console.error(
      "Could not read Git history:",
      error.message
    );

    return progress;
  }

  /*
   * Expected:
   *
   * Initial repository state
   *        ↓
   * Bug-fix commit
   *        ↓
   * Helper-function commit
   *        ↓
   * Formatting commit
   */

  const getFileAtCommit = async (commit) => {
    try {
      return await git(
        `git show ${commit}:utils.py`
      );
    } catch (error) {
      console.error(
        `Could not read utils.py from ${commit}:`,
        error.message
      );

      return "";
    }
  };

  /* =========================================
     1. BUG-FIX COMMIT
  ========================================== */

  if (commits.length >= 2) {
    const bugFixCommit = commits[1];

    const content =
      await getFileAtCommit(
        bugFixCommit
      );

    /*
     * The learner must:
     *
     * - check whether quantity is negative
     * - raise ValueError
     *
     * The exact error message does NOT matter.
     *
     * These should all be acceptable:
     *
     * raise ValueError("quantity cannot be negative")
     * raise ValueError("quantity cannot be -ve")
     * raise ValueError("negative quantity")
     */

    const hasNegativeQuantityCheck =
      /if\s*\(?\s*quantity\s*<\s*0\s*\)?\s*:/.test(
        content
      );

    const hasValueError =
      /raise\s+ValueError\s*\(/.test(
        content
      );

    progress.bugFixCommit =
      hasNegativeQuantityCheck &&
      hasValueError;
  }

  /* =========================================
     2. HELPER-FUNCTION COMMIT
  ========================================== */

  if (commits.length >= 3) {
    const helperCommit = commits[2];

    const content =
      await getFileAtCommit(
        helperCommit
      );

    const hasHelperFunction =
      /def\s+is_even\s*\(\s*value\s*\)\s*:/.test(
        content
      );

    const hasCorrectHelperReturn =
      /return\s+value\s*%\s*2\s*==\s*0/.test(
        content
      );

    progress.helperCommit =
      hasHelperFunction &&
      hasCorrectHelperReturn;
  }

  /* =========================================
     3. FORMATTING COMMIT
  ========================================== */

  if (commits.length >= 4) {
    const formattingCommit =
      commits[3];

    const content =
      await getFileAtCommit(
        formattingCommit
      );

    progress.formattingCommit =
      /return\s+name\.strip\(\)\.title\(\)/.test(
        content
      );
  }

  return progress;
};