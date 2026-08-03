module.exports = async ({ executeCommand, containerId }) => {
  const commitCount = await executeCommand(
    containerId,
    "git rev-list --count HEAD"
  );

  const status = await executeCommand(
    containerId,
    "git status --porcelain"
  );

  const readmeExists = await executeCommand(
    containerId,
    "test -f /workspace/README.md && echo yes || echo no"
  );

  if (Number(commitCount) !== 1) {
    return {
      success: false,
      message: "Expected exactly one commit.",
    };
  }

  if (status.trim() !== "") {
    return {
      success: false,
      message: "Working tree is not clean.",
    };
  }

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