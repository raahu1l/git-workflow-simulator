module.exports = async ({
  executeCommand,
  containerId,
}) => {

  const git = async (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  // =========================================
  // MILESTONES
  // =========================================

  const currentBranch = await git(
    "git branch --show-current"
  );

  const progress = {
    switchToMain:
      currentBranch.trim() === "main",
    mergeFeature: false,
    deleteFeatureBranch: false,
    cleanWorkingTree: false,
  };

  const featureBranch = await git(
    "git show-ref --verify --quiet refs/heads/feature/search && echo exists || echo missing"
  );

  progress.deleteFeatureBranch =
    featureBranch.trim() === "missing";

  const featureHistory = await git(
    "git log main --format='%H|%s' 2>/dev/null || true"
  );

  const historyLines = featureHistory
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const normalizationCommit =
    historyLines.find(
      (line) =>
        line.endsWith(
          "|Add search query normalization"
        )
    );

  const searchServiceCommit =
    historyLines.find(
      (line) =>
        line.endsWith(
          "|Add product search service"
        )
    );

  if (
    normalizationCommit &&
    searchServiceCommit
  ) {
    const normalizationHash =
      normalizationCommit.split("|")[0];

    const searchServiceHash =
      searchServiceCommit.split("|")[0];

    const normalizationReachable =
      await git(
        `git merge-base --is-ancestor ${normalizationHash} main && echo yes || echo no`
      );

    const searchServiceReachable =
      await git(
        `git merge-base --is-ancestor ${searchServiceHash} main && echo yes || echo no`
      );

    const searchFiles =
      await git(
        "git ls-tree -r --name-only main -- src/search_utils.py src/search_service.py"
      );

    const files = searchFiles
      .split(/\r?\n/)
      .map((file) => file.trim())
      .filter(Boolean);

    progress.mergeFeature =
      normalizationReachable.trim() === "yes" &&
      searchServiceReachable.trim() === "yes" &&
      files.includes("src/search_utils.py") &&
      files.includes("src/search_service.py");
  }

  const statusForProgress = await git(
    "git status --porcelain --untracked-files=all"
  );

  progress.cleanWorkingTree =
    statusForProgress.trim() === "";

  // =========================================
  // MUST FINISH ON MAIN
  // =========================================

  if (currentBranch.trim() !== "main") {
    return {
      success: false,
      progress,
      message:
        "The search feature must be integrated into main.",
    };
  }

  // =========================================
  // FEATURE BRANCH MUST HAVE BEEN REMOVED
  // =========================================

  if (featureBranch.trim() !== "missing") {
    return {
      success: false,
      progress,
      message:
        "The feature is integrated, but the temporary feature branch still exists.",
    };
  }

  // =========================================
  // FEATURE COMMITS MUST EXIST IN HISTORY
  // =========================================

  const featureCommits = await git(
    "git log main --format='%H|%s'"
  );

  const historyLinesFinal = featureCommits
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const normalizationCommitFinal =
    historyLinesFinal.find(
      (line) =>
        line.endsWith(
          "|Add search query normalization"
        )
    );

  const searchServiceCommitFinal =
    historyLinesFinal.find(
      (line) =>
        line.endsWith(
          "|Add product search service"
        )
    );

  if (
    !normalizationCommitFinal ||
    !searchServiceCommitFinal
  ) {
    return {
      success: false,
      progress,
      message:
        "The completed search feature is not fully present in main's history.",
    };
  }

  const normalizationHash =
    normalizationCommitFinal.split("|")[0];

  const searchServiceHash =
    searchServiceCommitFinal.split("|")[0];

  // =========================================
  // FEATURE COMMITS MUST BE REACHABLE
  // =========================================

  const normalizationReachable =
    await git(
      `git merge-base --is-ancestor ${normalizationHash} main && echo yes || echo no`
    );

  const searchServiceReachable =
    await git(
      `git merge-base --is-ancestor ${searchServiceHash} main && echo yes || echo no`
    );

  if (
    normalizationReachable.trim() !== "yes" ||
    searchServiceReachable.trim() !== "yes"
  ) {
    return {
      success: false,
      progress,
      message:
        "The search feature commits are not reachable from main.",
    };
  }

  // =========================================
  // MERGE MUST PRESERVE THE FEATURE HISTORY
  // =========================================

  const featureParent =
    await git(
      `git rev-list --parents -n 1 ${searchServiceHash}`
    );

  if (!featureParent.trim()) {
    return {
      success: false,
      progress,
      message:
        "The search feature history could not be verified.",
    };
  }

  // =========================================
  // SEARCH FILES MUST EXIST ON MAIN
  // =========================================

  const searchFiles = await git(
    "git ls-tree -r --name-only main -- src/search_utils.py src/search_service.py"
  );

  const files = searchFiles
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);

  if (
    !files.includes("src/search_utils.py") ||
    !files.includes("src/search_service.py")
  ) {
    return {
      success: false,
      progress,
      message:
        "The search feature files are not present in main.",
    };
  }

  // =========================================
  // MAIN'S OWN WORK MUST STILL EXIST
  // =========================================

  const mainFiles = await git(
    "git ls-tree -r --name-only main -- DEPLOYMENT.md src/config.py"
  );

  const mainFileList = mainFiles
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);

  if (
    !mainFileList.includes("DEPLOYMENT.md") ||
    !mainFileList.includes("src/config.py")
  ) {
    return {
      success: false,
      progress,
      message:
        "Main's existing deployment work was not preserved during the integration.",
    };
  }

  // =========================================
  // NO CONFLICT MARKERS
  // =========================================

  const conflictMarkers = await git(
    "grep -R -n -E '^(<<<<<<<|=======|>>>>>>>)' /workspace --exclude-dir=.git 2>/dev/null || true"
  );

  if (conflictMarkers.trim() !== "") {
    return {
      success: false,
      progress,
      message:
        "Conflict markers remain in the workspace.",
    };
  }

  // =========================================
  // WORKING TREE MUST BE CLEAN
  // =========================================

  const status = await git(
    "git status --porcelain --untracked-files=all"
  );

  if (status.trim() !== "") {
    return {
      success: false,
      progress,
      message:
        "The merge is complete, but the working tree is not clean.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,
    progress: {
      switchToMain: true,
      mergeFeature: true,
      deleteFeatureBranch: true,
      cleanWorkingTree: true,
    },
    message:
      "Merged and confirmed. The search feature is part of main, its history is preserved, the feature branch is cleaned up, and the repository is ready.",
  };
};