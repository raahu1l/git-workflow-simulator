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
  // MILESTONES
  // =========================================
  //
  // These are verified repository-state
  // milestones for Alex.
  //
  // Each milestone is monotonic:
  // once the repository has reached that
  // meaningful state, later work does not
  // make the milestone disappear.
  // =========================================

  const repository = await executeCommand(
    containerId,
    "test -d /workspace/.git && echo yes || echo no"
  );

  const repoExists =
    repository.trim() === "yes";

  const readmeExists = await git(
    "test -f README.md && echo yes || echo no"
  );

  const fileExists =
    readmeExists.trim() === "yes";

  const trackedReadme = await git(
    "git ls-files --error-unmatch README.md 2>/dev/null || true"
  );

  const isTracked =
    trackedReadme.trim() === "README.md";

  /*
   * README is considered staged once it is
   * staged OR already included in a commit.
   *
   * This keeps the milestone true after the
   * learner moves on to the commit step.
   */
  const stagedReadme = await git(
    "git diff --cached --name-only -- README.md 2>/dev/null || true"
  );

  const committedReadme = await git(
    "git ls-tree -r --name-only HEAD -- README.md 2>/dev/null || true"
  );

  const readmeWasStaged =
    stagedReadme
      .split(/\r?\n/)
      .map((file) => file.trim())
      .includes("README.md");

  const readmeWasCommitted =
    committedReadme
      .split(/\r?\n/)
      .map((file) => file.trim())
      .includes("README.md");

  const stageMilestone =
    readmeWasStaged ||
    readmeWasCommitted;

  const commitCountRaw = await git(
    "git rev-list --count HEAD 2>/dev/null || echo 0"
  );

  const commitCount =
    Number(commitCountRaw.trim());

  const commitMilestone =
    repoExists &&
    commitCount === 1 &&
    readmeWasCommitted;

  const progress = {
    initializeRepository: repoExists,
    createFile:
      repoExists && fileExists,
    stageFile:
      repoExists &&
      fileExists &&
      stageMilestone,
    createCommit:
      commitMilestone,
  };

  // =========================================
  // 1. GIT REPOSITORY MUST EXIST
  // =========================================

  if (!repoExists) {
    return {
      success: false,
      progress,
      message:
        "Git has not been initialized in /workspace.",
    };
  }

  // =========================================
  // 2. README.MD MUST EXIST
  // =========================================

  if (!fileExists) {
    return {
      success: false,
      progress,
      message:
        "README.md is missing from the repository.",
    };
  }

  // =========================================
  // 3. README.MD MUST BE TRACKED
  // =========================================

  if (!isTracked) {
    return {
      success: false,
      progress,
      message:
        "README.md exists, but it is not tracked by Git.",
    };
  }

  // =========================================
  // 4. EXACTLY ONE COMMIT MUST EXIST
  // =========================================

  if (commitCount !== 1) {
    return {
      success: false,
      progress,
      message:
        "The repository must contain exactly one commit.",
    };
  }

  // =========================================
  // 5. README.MD MUST BE PART OF THE COMMIT
  // =========================================

  if (!readmeWasCommitted) {
    return {
      success: false,
      progress,
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
      progress,
      message:
        "The repository has uncommitted or untracked changes.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,

    progress: {
      initializeRepository: true,
      createFile: true,
      stageFile: true,
      createCommit: true,
    },

    message:
      "First commit complete. README.md is tracked, committed, and the repository is clean.",
  };
};