module.exports = async ({ executeCommand, containerId }) => {
  const progress = {
    initializeRepository: false,
    createFile: false,
    stageFile: false,
    createCommit: false,
  };

  // 1. Repository initialized
  const repo = await executeCommand(
    containerId,
    "if [ -d /workspace/.git ]; then echo yes; else echo no; fi"
  );

  progress.initializeRepository = repo.trim() === "yes";

  // 2. README.md exists
  const readme = await executeCommand(
    containerId,
    "if [ -f /workspace/README.md ]; then echo yes; else echo no; fi"
  );

  progress.createFile = readme.trim() === "yes";

  // 3. README.md has been staged OR has already been committed
  if (progress.createFile) {
    const staged = await executeCommand(
      containerId,
      "git diff --cached --name-only -- README.md || true"
    );

    const committed = await executeCommand(
      containerId,
      "git ls-tree -r --name-only HEAD -- README.md 2>/dev/null || true"
    );

    const isStaged = staged
      .split(/\r?\n/)
      .map((file) => file.trim())
      .includes("README.md");

    const isCommitted = committed
      .split(/\r?\n/)
      .map((file) => file.trim())
      .includes("README.md");

    progress.stageFile = isStaged || isCommitted;
  }

  // 4. First commit exists
  const commitCount = await executeCommand(
    containerId,
    "git rev-list --count HEAD 2>/dev/null || echo 0"
  );

  progress.createCommit =
    Number(commitCount.trim()) === 1;

  return progress;
};