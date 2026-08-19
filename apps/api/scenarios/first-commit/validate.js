module.exports = async ({ executeCommand, containerId }) => {
  // Make sure every Git command runs inside the scenario workspace.
  const git = (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  // 1. Count commits.
  const commitCount = await git(
    "git rev-list --count HEAD 2>/dev/null || echo 0"
  );

  // 2. Check working tree.
  const status = await git(
    "git status --porcelain 2>/dev/null || true"
  );

  // 3. Check README.md.
  const readmeExists = await git(
    "test -f README.md && echo yes || echo no"
  );

  // Exactly one commit is required.
  if (Number(commitCount.trim()) !== 1) {
    return {
      success: false,
      message: "Expected exactly one commit.",
    };
  }

  // Working tree must be clean.
  if (status.trim() !== "") {
    return {
      success: false,
      message: "Working tree is not clean.",
    };
  }

  // README.md must exist.
  if (readmeExists.trim() !== "yes") {
    return {
      success: false,
      message: "README.md is missing.",
    };
  }

  return {
    success: true,
    message: "Great job! First Commit completed successfully.",
  };
};