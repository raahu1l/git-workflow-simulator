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
     1. FILE STAGED
  ========================================== */

  const staged = await git(
    "git diff --cached --name-only -- project-notes.txt"
  );

  const isStaged = staged
    .split(/\r?\n/)
    .map((file) => file.trim())
    .includes("project-notes.txt");

  progress.stageFile = isStaged;

  /* =========================================
     2. FILE COMMITTED
  ========================================== */

  const committed = await git(
    "git ls-tree -r --name-only HEAD -- project-notes.txt 2>/dev/null || true"
  );

  const isCommitted = committed
    .split(/\r?\n/)
    .map((file) => file.trim())
    .includes("project-notes.txt");

  progress.createCommit = isCommitted;

  /* =========================================
     3. WORKING TREE CLEAN
  ========================================== */

  const status = await git(
    "git status --porcelain"
  );

  progress.cleanWorkingTree =
    status.trim() === "" && isCommitted;

  return progress;
};