module.exports = async ({
  executeCommand,
  containerId,
}) => {

  const git = (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  const progress = {
    stageFile: false,
    createCommit: false,
    cleanWorkingTree: false,
  };

  // =========================================
  // 1. REPOSITORY MUST EXIST
  // =========================================

  const repository = await executeCommand(
    containerId,
    "test -d /workspace/.git && echo yes || echo no"
  );

  if (repository.trim() !== "yes") {
    return {
      success: false,
      progress,
      message:
        "The Git repository has not been initialized.",
    };
  }

  // =========================================
  // 2. FORGOTTEN FILE MUST EXIST
  // =========================================

  const forgottenFile = await git(
    "test -f project-notes.txt && echo yes || echo no"
  );

  if (forgottenFile.trim() !== "yes") {
    return {
      success: false,
      progress,
      message:
        "The forgotten project file is missing.",
    };
  }

  // =========================================
  // 3. FILE MUST BE TRACKED
  // =========================================

  const trackedFile = await git(
    "git ls-files --error-unmatch project-notes.txt 2>/dev/null || true"
  );

  const isTracked =
    trackedFile.trim() === "project-notes.txt";

  if (!isTracked) {
    return {
      success: false,
      progress,
      message:
        "The forgotten file exists, but it is not tracked by Git.",
    };
  }

  // =========================================
  // 4. FILE MUST BE PART OF COMMITTED HISTORY
  // =========================================

  const committedFile = await git(
    "git ls-tree -r --name-only HEAD -- project-notes.txt 2>/dev/null || true"
  );

  const fileInHead =
    committedFile
      .split(/\r?\n/)
      .map((file) => file.trim())
      .includes("project-notes.txt");

  // Stage milestone remains true once the file has
  // reached committed history.
  const stagedFile = await git(
    "git diff --cached --name-only -- project-notes.txt 2>/dev/null || true"
  );

  const currentlyStaged =
    stagedFile
      .split(/\r?\n/)
      .map((file) => file.trim())
      .includes("project-notes.txt");

  progress.stageFile =
    currentlyStaged || fileInHead;

  if (!fileInHead) {
    return {
      success: false,
      progress,
      message:
        "The forgotten file is tracked but has not been committed.",
    };
  }

  // =========================================
  // 5. A NEW COMMIT MUST EXIST
  // =========================================

  const commitCount = await git(
    "git rev-list --count HEAD"
  );

  const hasNewCommit =
    Number(commitCount.trim()) >= 2;

  if (!hasNewCommit) {
    return {
      success: false,
      progress,
      message:
        "The forgotten file has not been added in a new commit.",
    };
  }

  // =========================================
  // 6. VERIFY THE FORGOTTEN FILE IS IN THE
  //    LATEST COMMIT
  // =========================================

  const latestCommitFiles = await git(
    "git diff-tree --no-commit-id --name-only -r HEAD"
  );

  const fileInLatestCommit =
    latestCommitFiles
      .split(/\r?\n/)
      .map((file) => file.trim())
      .includes("project-notes.txt");

  progress.createCommit =
    hasNewCommit && fileInLatestCommit;

  if (!fileInLatestCommit) {
    return {
      success: false,
      progress,
      message:
        "The latest commit does not contain the forgotten file.",
    };
  }

  // =========================================
  // 7. WORKING TREE MUST BE CLEAN
  // =========================================

  const status = await git(
    "git status --porcelain --untracked-files=all"
  );

  progress.cleanWorkingTree =
    status.trim() === "";

  if (status.trim() !== "") {
    return {
      success: false,
      progress,
      message:
        "The repository still contains uncommitted or untracked changes.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,
    progress: {
      stageFile: true,
      createCommit: true,
      cleanWorkingTree: true,
    },
    message:
      "Great job! The forgotten file is tracked, committed, and the repository is clean.",
  };
};