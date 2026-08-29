module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const git = (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  // =========================================
  // 1. GIT REPOSITORY MUST EXIST
  // =========================================

  const repository = await executeCommand(
    containerId,
    "test -d /workspace/.git && echo yes || echo no"
  );

  if (repository.trim() !== "yes") {
    return {
      success: false,
      message:
        "Git has not been initialized in /workspace.",
    };
  }

  // =========================================
  // 2. README.MD MUST EXIST
  // =========================================

  const readmeExists = await git(
    "test -f README.md && echo yes || echo no"
  );

  if (readmeExists.trim() !== "yes") {
    return {
      success: false,
      message:
        "README.md is missing from the repository.",
    };
  }

  // =========================================
  // 3. README.MD MUST BE TRACKED
  // =========================================

  const trackedReadme = await git(
    "git ls-files --error-unmatch README.md 2>/dev/null || true"
  );

  if (trackedReadme.trim() !== "README.md") {
    return {
      success: false,
      message:
        "README.md exists, but it is not tracked by Git.",
    };
  }

  // =========================================
  // 4. EXACTLY ONE COMMIT MUST EXIST
  // =========================================

  const commitCount = await git(
    "git rev-list --count HEAD 2>/dev/null || echo 0"
  );

  if (Number(commitCount.trim()) !== 1) {
    return {
      success: false,
      message:
        "The repository must contain exactly one commit.",
    };
  }

  // =========================================
  // 5. README.MD MUST BE PART OF THE COMMIT
  // =========================================

  const readmeInCommit = await git(
    "git ls-tree -r --name-only HEAD -- README.md 2>/dev/null || true"
  );

  const committedReadme =
    readmeInCommit
      .split(/\r?\n/)
      .map((file) => file.trim())
      .includes("README.md");

  if (!committedReadme) {
    return {
      success: false,
      message:
        "README.md is tracked, but it is not included in the first commit.",
    };
  }

  // =========================================
  // 6. WORKING TREE MUST BE CLEAN
  // =========================================

  const status = await git(
    "git status --porcelain --untracked-files=all"
  );

  if (status.trim() !== "") {
    return {
      success: false,
      message:
        "The repository has uncommitted or untracked changes.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,
    message:
      "First commit complete. README.md is tracked, committed, and the repository is clean.",
  };
};