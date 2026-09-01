module.exports = async ({
  executeCommand,
  containerId,
  actions = [],
}) => {
  const git = async (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  const getActionCommand = (action) => {
    if (typeof action === "string") {
      return action;
    }

    if (
      action &&
      typeof action.command === "string"
    ) {
      return action.command;
    }

    return "";
  };

  const cleanCommand = (command) =>
    command
      .replace(
        /\x1b\[[0-9;?]*[ -/]*[@-~]/g,
        ""
      )
      .trim();

  const commands = actions
    .map(getActionCommand)
    .map(cleanCommand)
    .filter(Boolean);

  const isFeatureCheckout = (command) =>
    command ===
      "git switch feature/reporting" ||
    command ===
      "git checkout feature/reporting";

  const isInspection = (command) =>
    command === "git log" ||
    command === "git reflog" ||
    command === "git diff main" ||
    command ===
      "git diff main...feature/reporting" ||
    command ===
      "git diff feature/reporting...main" ||
    command === "git --no-pager log" ||
    command === "git --no-pager reflog" ||
    command ===
      "git --no-pager diff main" ||
    command ===
      "git --no-pager diff main...feature/reporting" ||
    command ===
      "git --no-pager diff feature/reporting...main";

  let checkoutIndex = -1;

  for (let index = 0; index < commands.length; index += 1) {
    if (isFeatureCheckout(commands[index])) {
      checkoutIndex = index;
    }
  }

  let inspectionIndex = -1;

  if (checkoutIndex !== -1) {
    for (
      let index = checkoutIndex + 1;
      index < commands.length;
      index += 1
    ) {
      if (isInspection(commands[index])) {
        inspectionIndex = index;
        break;
      }
    }
  }

  const checkoutBranch =
    checkoutIndex !== -1;

  const inspectChanges =
    checkoutBranch &&
    inspectionIndex > checkoutIndex;

  const currentBranch = await git(
    "git branch --show-current"
  );

  const returnToMain =
    inspectChanges &&
    currentBranch.trim() === "main";

  const progress = {
    checkoutBranch,
    inspectChanges,
    returnToMain,
  };

  // =========================================
  // 1. MUST FINISH ON MAIN
  // =========================================

  if (currentBranch.trim() !== "main") {
    return {
      success: false,
      progress,
      message:
        "Return to main after reviewing the reporting branch.",
    };
  }

  // =========================================
  // 2. REPORTING BRANCH MUST STILL EXIST
  // =========================================

  const featureBranch = await git(
    "git show-ref --verify --quiet refs/heads/feature/reporting && echo exists || echo missing"
  );

  if (featureBranch.trim() !== "exists") {
    return {
      success: false,
      progress,
      message:
        "The feature/reporting branch should remain unchanged after the review.",
    };
  }

  // =========================================
  // 3. VERIFY REPORTING HISTORY
  // =========================================

  const featureHistory = await git(
    "git log feature/reporting --format='%H|%s'"
  );

  const featureLines = featureHistory
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const filterCommit =
    featureLines.find(
      (line) =>
        line.endsWith(
          "|Add report filtering"
        )
    );

  const exportCommit =
    featureLines.find(
      (line) =>
        line.endsWith(
          "|Add report export"
        )
    );

  const metadataCommit =
    featureLines.find(
      (line) =>
        line.endsWith(
          "|Add reporting metadata"
        )
    );

  if (
    !filterCommit ||
    !exportCommit ||
    !metadataCommit
  ) {
    return {
      success: false,
      progress,
      message:
        "The original reporting commits are no longer intact.",
    };
  }

  // =========================================
  // 4. REPORTING COMMITS MUST REMAIN
  //    OUTSIDE MAIN
  // =========================================

  const metadataHash =
    metadataCommit.split("|")[0];

  const featureInMain = await git(
    `git merge-base --is-ancestor ${metadataHash} main && echo yes || echo no`
  );

  if (featureInMain.trim() === "yes") {
    return {
      success: false,
      progress,
      message:
        "The reporting branch was merged into main. Review the branch without merging it.",
    };
  }

  // =========================================
  // 5. VERIFY REPORTING FILES
  // =========================================

  const searchFiles = await git(
    "git ls-tree -r --name-only feature/reporting -- src/report.py src/report_filters.py src/report_export.py"
  );

  const files = searchFiles
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);

  if (
    !files.includes("src/report.py") ||
    !files.includes("src/report_filters.py") ||
    !files.includes("src/report_export.py")
  ) {
    return {
      success: false,
      progress,
      message:
        "The reporting branch no longer contains its expected files.",
    };
  }

  // =========================================
  // 6. MAIN MUST NOT CONTAIN REPORTING FILES
  // =========================================

  const mainFeatureFiles = await git(
    "git ls-tree -r --name-only main -- src/report_filters.py src/report_export.py"
  );

  const mainFiles = mainFeatureFiles
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);

  if (
    mainFiles.includes(
      "src/report_filters.py"
    ) ||
    mainFiles.includes(
      "src/report_export.py"
    )
  ) {
    return {
      success: false,
      progress,
      message:
        "Reporting work was added to main. The branch should only be reviewed, not merged.",
    };
  }

  // =========================================
  // 7. WORKING TREE MUST BE CLEAN
  // =========================================

  const status = await git(
    "git status --porcelain --untracked-files=all"
  );

  if (status.trim() !== "") {
    return {
      success: false,
      progress,
      message:
        "The review is complete, but the working tree was modified.",
    };
  }

  // =========================================
  // 8. CHECKOUT MILESTONE
  // =========================================

  if (!checkoutBranch) {
    return {
      success: false,
      progress,
      message:
        "Check out feature/reporting before reviewing Priya's work.",
    };
  }

  // =========================================
  // 9. INSPECTION MILESTONE
  // =========================================

  if (!inspectChanges) {
    return {
      success: false,
      progress,
      message:
        "Inspect the reporting branch's history or differences against main before returning.",
    };
  }

  // =========================================
  // 10. RETURN MILESTONE
  // =========================================

  if (!returnToMain) {
    return {
      success: false,
      progress,
      message:
        "Return to main after completing the review.",
    };
  }

  return {
    success: true,
    progress: {
      checkoutBranch: true,
      inspectChanges: true,
      returnToMain: true,
    },
    message:
      "Good overview — that matches the PR description. Thanks for taking the time to actually look through it.",
  };
};