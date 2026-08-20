module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const progress = {
    stageFile: false,
    createCommit: false,
    cleanWorkingTree: false,
  };

  const git = (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  /* =========================================
     1. CHECK IF FILE IS STAGED
  ========================================== */

  const staged = await git(
    "git diff --cached --name-only -- project-notes.txt"
  );

  const isStaged = staged
    .split(/\r?\n/)
    .map((file) => file.trim())
    .includes("project-notes.txt");

  /* =========================================
     2. CHECK IF FILE IS COMMITTED
  ========================================== */

  const committed = await git(
    "git ls-tree -r --name-only HEAD -- project-notes.txt 2>/dev/null || true"
  );

  const isCommitted = committed
    .split(/\r?\n/)
    .map((file) => file.trim())
    .includes("project-notes.txt");

  /*
   * Once the file has been staged and committed,
   * the staging task remains completed.
   *
   * This prevents progress from going backwards
   * after `git commit` clears the staging area.
   */
  progress.stageFile =
    isStaged || isCommitted;

  progress.createCommit =
    isCommitted;

  /* =========================================
     3. CHECK WORKING TREE
  ========================================== */

  const status = await git(
    "git status --porcelain"
  );

  progress.cleanWorkingTree =
    isCommitted &&
    status.trim() === "";

  return progress;
};