module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const git = async (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  const branchName = (
    await git("git branch --show-current")
  ).trim();

  const baselineMain = (
    await git("git rev-parse scenario-main-baseline")
  ).trim();

  const currentMain = (
    await git("git rev-parse main")
  ).trim();

  const mainUnchanged =
    baselineMain === currentMain;

  const baselineFeature = (
    await git(
      "git rev-parse scenario-feature-baseline"
    )
  ).trim();

  const featureTip = (
    await git(
      "git rev-parse feature/reporting"
    )
  ).trim();

  const featureWasRewritten =
    featureTip !== baselineFeature;

  const history = await git(
    "git log feature/reporting --format='%H|%s'"
  );

  const commits = history
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf("|");

      return {
        hash: line.slice(0, separator),
        message: line.slice(separator + 1),
      };
    });

  const validationCommit = commits.find(
    (commit) =>
      commit.message ===
      "Add report validation"
  );

  const documentationCommit = commits.find(
    (commit) =>
      commit.message ===
      "Document report workflow"
  );

  const hasValidationCommit =
    !!validationCommit;

  const hasDocumentationCommit =
    !!documentationCommit;

  const hasMixedCommit = commits.some(
    (commit) =>
      commit.message ===
      "Fix quantity calculation and add report export"
  );

  const mixedCommitRemoved =
    !hasMixedCommit;

  const currentHead = (
    await git("git rev-parse HEAD")
  ).trim();

  const headParent = (
    await git(
      "git rev-parse HEAD^ 2>/dev/null || true"
    )
  ).trim();

  let headDiff = "";

  if (headParent) {
    headDiff = await git(
      `git diff ${headParent} ${currentHead} -- src/report.py`
    );
  }

  const headHasBugFix =
    headDiff.includes(
      'item["price"] * item.get("quantity", 1)'
    );

  const headHasExport =
    headDiff.includes(
      "def export_report"
    );

  const isDetachedHead =
    branchName === "";

  const splitBugFix =
    isDetachedHead &&
    headHasBugFix &&
    !headHasExport;

  const splitFeature =
    isDetachedHead &&
    headHasExport &&
    !headHasBugFix;

  let rewrittenCommits = [];

  if (
    validationCommit &&
    documentationCommit
  ) {
    const rewrittenHistory = await git(
      `git rev-list --reverse ${validationCommit.hash}..${documentationCommit.hash}^`
    );

    rewrittenCommits = rewrittenHistory
      .split(/\r?\n/)
      .map((hash) => hash.trim())
      .filter(Boolean);
  }

  const hasExactlyTwoRewrittenCommits =
    rewrittenCommits.length === 2;

  let finalBugFixCommit = "";
  let finalExportCommit = "";

  for (const hash of rewrittenCommits) {
    const diff = await git(
      `git diff ${hash}^ ${hash} -- src/report.py`
    );

    const hasBugFix =
      diff.includes(
        'item["price"] * item.get("quantity", 1)'
      );

    const hasExport =
      diff.includes(
        "def export_report"
      );

    if (hasBugFix && !hasExport) {
      finalBugFixCommit = hash;
    }

    if (hasExport && !hasBugFix) {
      finalExportCommit = hash;
    }
  }

  const finalSplitCleanly =
    hasExactlyTwoRewrittenCommits &&
    finalBugFixCommit !== "" &&
    finalExportCommit !== "";

  const finalReport = await git(
    "git show feature/reporting:src/report.py"
  );

  const originalReport = await git(
    "git show scenario-feature-baseline:src/report.py"
  );

  const finalReadme = await git(
    "git show feature/reporting:README.md"
  );

  const originalReadme = await git(
    "git show scenario-feature-baseline:README.md"
  );

  const finalContentUnchanged =
    finalReport === originalReport &&
    finalReadme === originalReadme;

  const finalStatus = (
    await git(
      "git status --porcelain --untracked-files=all"
    )
  ).trim();

  const workingTreeClean =
    finalStatus === "";

  const surroundingCommitsPreserved =
    hasValidationCommit &&
    hasDocumentationCommit;

  const splitCommit =
    !isDetachedHead &&
    branchName === "feature/reporting" &&
    mainUnchanged &&
    surroundingCommitsPreserved &&
    mixedCommitRemoved &&
    finalSplitCleanly &&
    finalContentUnchanged &&
    workingTreeClean &&
    featureWasRewritten;

  const progress = {
    splitBugFix,
    splitFeature,
    splitCommit,
  };

  if (branchName !== "feature/reporting" && !isDetachedHead) {
    return {
      success: false,
      progress,
      message:
        "Finish on feature/reporting after splitting the commit.",
    };
  }

  if (!mainUnchanged) {
    return {
      success: false,
      progress,
      message:
        "main was changed. The commit cleanup should only rewrite feature/reporting.",
    };
  }

  if (!isDetachedHead && !mixedCommitRemoved) {
    return {
      success: false,
      progress,
      message:
        "The original mixed commit still exists.",
    };
  }

  if (!isDetachedHead && !hasValidationCommit) {
    return {
      success: false,
      progress,
      message:
        "Keep the Add report validation commit intact.",
    };
  }

  if (!isDetachedHead && !hasDocumentationCommit) {
    return {
      success: false,
      progress,
      message:
        "Keep the Document report workflow commit intact.",
    };
  }

  if (!isDetachedHead && !finalSplitCleanly) {
    return {
      success: false,
      progress,
      message:
        "Split the mixed commit into separate bug-fix and feature commits.",
    };
  }

  if (!isDetachedHead && !finalContentUnchanged) {
    return {
      success: false,
      progress,
      message:
        "The final project content changed. Splitting the commit must preserve the original final state.",
    };
  }

  if (!isDetachedHead && !workingTreeClean) {
    return {
      success: false,
      progress,
      message:
        "The working tree must be clean after the rebase.",
    };
  }

  if (!splitCommit) {
    return {
      success: false,
      progress,
      message:
        "The history is not yet in the required final state.",
    };
  }

return {
  success: true,
  progress: {
    splitBugFix: false,
    splitFeature: false,
    splitCommit: true,
  },
  message:
    "Perfect, changelog will actually make sense now. Thanks for taking the time to split that properly.",
};
};