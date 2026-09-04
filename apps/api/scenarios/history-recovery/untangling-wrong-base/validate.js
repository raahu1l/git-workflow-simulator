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

  const branchName = (
    await git("git branch --show-current")
  ).trim();

  const mainIncluded =
    (
      await git(
        "git merge-base --is-ancestor main feature/reporting && echo yes || echo no"
      )
    ).trim() === "yes";

  const history = await git(
    "git log feature/reporting --format='%H|%s'"
  );

  const lines = history
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const hasSummaryCommit = lines.some(
    (line) =>
      line.endsWith(
        "|Add report summary"
      )
  );

  const hasArchivedCommit = lines.some(
    (line) =>
      line.endsWith(
        "|Add archived report handling"
      )
  );

  const originalFeatureWorkPreserved =
    hasSummaryCommit &&
    hasArchivedCommit;

  const featureReport = await git(
    "git show feature/reporting:src/report.py"
  );

  const reportWorkIntact =
    featureReport.includes(
      "def generate_report(data):"
    ) &&
    featureReport.includes(
      "include_archived"
    );

  const workingTreeClean =
    (
      await git(
        "git status --porcelain --untracked-files=all"
      )
    ).trim() === "";

  const updateBranch =
    branchName === "feature/reporting" &&
    mainIncluded &&
    originalFeatureWorkPreserved &&
    reportWorkIntact;

  const progress = {
    updateBranch,
  };

  // =========================================
  // 1. MUST FINISH ON FEATURE BRANCH
  // =========================================

  if (branchName !== "feature/reporting") {
    return {
      success: false,
      progress,
      message:
        "Finish on feature/reporting after updating its base.",
    };
  }

  // =========================================
  // 2. MAIN MUST REMAIN UNCHANGED
  // =========================================

  const baselineMain = (
    await git(
      "git rev-parse scenario-main-baseline"
    )
  ).trim();

  const currentMain = (
    await git("git rev-parse main")
  ).trim();

  if (baselineMain !== currentMain) {
    return {
      success: false,
      progress,
      message:
        "main was modified. Only feature/reporting should be updated.",
    };
  }

  // =========================================
  // 3. CURRENT MAIN MUST BE INCLUDED
  // =========================================

  if (!mainIncluded) {
    return {
      success: false,
      progress,
      message:
        "feature/reporting is still based on an older main history.",
    };
  }

  // =========================================
  // 4. BOTH FEATURE COMMITS MUST REMAIN
  // =========================================

  if (
    !hasSummaryCommit ||
    !hasArchivedCommit
  ) {
    return {
      success: false,
      progress,
      message:
        "Both original reporting commits must remain on feature/reporting.",
    };
  }

  // =========================================
  // 5. REPORTING WORK MUST BE INTACT
  // =========================================

  if (!reportWorkIntact) {
    return {
      success: false,
      progress,
      message:
        "The reporting feature changes were not preserved.",
    };
  }

  // =========================================
  // 6. WORKING TREE MUST BE CLEAN
  // =========================================

  if (!workingTreeClean) {
    return {
      success: false,
      progress,
      message:
        "feature/reporting has uncommitted or untracked changes.",
    };
  }

  // =========================================
  // 7. FINAL DIFF
  // =========================================

  const finalDiff = await git(
    "git diff main...feature/reporting"
  );

  if (!finalDiff.includes("src/report.py")) {
    return {
      success: false,
      progress,
      message:
        "The final comparison does not contain the reporting feature changes.",
    };
  }

  if (
    finalDiff.includes("src/logging.py") ||
    finalDiff.includes("deploy.md") ||
    finalDiff.includes("LOG_FORMAT") ||
    finalDiff.includes(
      "standard production configuration"
    )
  ) {
    return {
      success: false,
      progress,
      message:
        "The final diff still contains unrelated main changes.",
    };
  }

  // =========================================
  // 8. REQUIRED MILESTONE
  // =========================================

  if (!updateBranch) {
    return {
      success: false,
      progress,
      message:
        "Bring feature/reporting up to the current main while preserving both reporting commits.",
    };
  }

  // =========================================
  // 9. SUCCESS
  // =========================================

  return {
    success: true,
    progress: {
      updateBranch: true,
    },
    message:
      "That explains it — diff looks clean now. Appreciate you digging into what actually happened instead of just guessing.",
  };
};