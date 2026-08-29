module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const git = async (command) => {
    return executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );
  };

  // =========================================
  // 1. MUST FINISH ON MASTER
  // =========================================

  const currentBranch = await git(
    "git branch --show-current"
  );

  if (currentBranch.trim() !== "master") {
    return {
      success: false,
      message:
        "The merge must be completed on the master branch.",
    };
  }

  // =========================================
  // 2. VERIFY ORIGINAL COMMITS EXIST
  // =========================================

  const history = await git(
    "git log master --format='%H|%s'"
  );

  const historyLines = history
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const featureLine = historyLines.find(
    (line) => line.endsWith("|Feature changes")
  );

  const mainLine = historyLines.find(
    (line) => line.endsWith("|Main changes")
  );

  if (!featureLine || !mainLine) {
    return {
      success: false,
      message:
        "The original feature and master commits must both remain in the final history.",
    };
  }

  const featureCommit = featureLine.split("|")[0];
  const mainCommit = mainLine.split("|")[0];

  // =========================================
  // 3. VERIFY BOTH ORIGINAL COMMITS REACH
  //    THE FINAL MASTER HISTORY
  // =========================================

  const featureReachable = await git(
    `git merge-base --is-ancestor ${featureCommit} HEAD && echo yes || echo no`
  );

  if (featureReachable.trim() !== "yes") {
    return {
      success: false,
      message:
        "The feature branch work has not been integrated into master.",
    };
  }

  const mainReachable = await git(
    `git merge-base --is-ancestor ${mainCommit} HEAD && echo yes || echo no`
  );

  if (mainReachable.trim() !== "yes") {
    return {
      success: false,
      message:
        "The original master history is not part of the completed merge.",
    };
  }

  // =========================================
  // 4. FINAL HEAD MUST BE A MERGE COMMIT
  // =========================================

  const headParents = await git(
    "git rev-list --parents -n 1 HEAD"
  );

  const parents = headParents
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parents.length !== 3) {
    return {
      success: false,
      message:
        "The feature has not been completed as a proper merge into master.",
    };
  }

  // =========================================
  // 5. MERGE MUST NOT STILL BE IN PROGRESS
  // =========================================

  const mergeState = await git(
    "if [ -f .git/MERGE_HEAD ]; then echo yes; else echo no; fi"
  );

  if (mergeState.trim() === "yes") {
    return {
      success: false,
      message:
        "A merge is still in progress. Finish resolving the conflict and complete the merge.",
    };
  }

  // =========================================
  // 6. NO UNMERGED FILES
  // =========================================

  const status = await git(
    "git status --porcelain=v1"
  );

  const unmergedFiles = status
    .split(/\r?\n/)
    .filter((line) =>
      /^(UU|AA|AU|UA|DD|DU|UD)/.test(
        line.trim()
      )
    );

  if (unmergedFiles.length > 0) {
    return {
      success: false,
      message:
        "README.md still has an unresolved merge conflict.",
    };
  }

  // =========================================
  // 7. NO CONFLICT MARKERS
  // =========================================

  const conflictMarkers = await git(
    "grep -n -E '^(<<<<<<<|=======|>>>>>>>)' README.md 2>/dev/null || true"
  );

  if (conflictMarkers.trim() !== "") {
    return {
      success: false,
      message:
        "README.md still contains merge conflict markers.",
    };
  }

  // =========================================
  // 8. VERIFY FINAL README IS A REAL
  //    RESOLUTION OF THE CONFLICT
  // =========================================

  const finalReadme = await git(
    "cat README.md"
  );

  const hasHeader = finalReadme.includes(
    "# Git Merge Conflict"
  );

  const hasLine1 = finalReadme.includes(
    "Line 1"
  );

  const hasLine3 = finalReadme.includes(
    "Line 3"
  );

  const choseFeatureVersion =
    finalReadme.includes(
      "Feature changed Line 2"
    );

  const choseMasterVersion =
    finalReadme.includes(
      "Main changed Line 2"
    );

  if (
    !hasHeader ||
    !hasLine1 ||
    !hasLine3 ||
    (!choseFeatureVersion &&
      !choseMasterVersion)
  ) {
    return {
      success: false,
      message:
        "README.md does not contain a valid resolution of the conflicting Line 2 change.",
    };
  }

  // =========================================
  // 9. WORKING TREE MUST BE CLEAN
  // =========================================

  if (status.trim() !== "") {
    return {
      success: false,
      message:
        "The merge is complete, but the working tree still contains pending changes.",
    };
  }

  // =========================================
  // SUCCESS
  // =========================================

  return {
    success: true,
    message:
      "Excellent! The conflict was resolved, both histories were preserved, and the merge was completed cleanly.",
  };
};