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
    await git(
      "git rev-parse scenario-main-baseline"
    )
  ).trim();

  const currentMain = (
    await git("git rev-parse main")
  ).trim();

  const mainUnchanged =
    baselineMain === currentMain;

  const featureTip = (
    await git(
      "git rev-parse feature/reporting"
    )
  ).trim();

  const baselineFeature = (
    await git(
      "git rev-parse scenario-feature-baseline"
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
      commit.message === "Add report validation"
  );

  const documentationCommit = commits.find(
    (commit) =>
      commit.message === "Document report workflow"
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

  let rewrittenCommits = [];

  if (
    validationCommit &&
    documentationCommit
  ) {
    const validationIndex = commits.findIndex(
      (commit) =>
        commit.hash === validationCommit.hash
    );

    const documentationIndex = commits.findIndex(
      (commit) =>
        commit.hash === documentationCommit.hash
    );

    if (
      validationIndex >= 0 &&
      documentationIndex > validationIndex
    ) {
      rewrittenCommits = commits.slice(
        validationIndex + 1,
        documentationIndex
      );
    }
  }

  const hasTwoRewrittenCommits =
    rewrittenCommits.length === 2;

  let bugFixCommit = null;
  let exportCommit = null;

  for (const commit of rewrittenCommits) {
    const diff = await git(
      `git diff-tree --no-commit-id --unified=0 -r ${commit.hash} -- src/report.py`
    );

    if (
      diff.includes(
        'item["price"] * item.get("quantity", 1)'
      ) &&
      !diff.includes("export_report")
    ) {
      bugFixCommit = commit;
    }

    if (
      diff.includes("export_report") &&
      !diff.includes(
        'item["price"] * item.get("quantity", 1)'
      )
    ) {
      exportCommit = commit;
    }
  }

  const splitCleanly =
    hasTwoRewrittenCommits &&
    !!bugFixCommit &&
    !!exportCommit;

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

  const splitBugFix =
    mixedCommitRemoved &&
    !!bugFixCommit;

  const splitFeature =
    splitBugFix &&
    !!exportCommit;

  const completeSolution =
    branchName === "feature/reporting" &&
    mainUnchanged &&
    hasValidationCommit &&
    hasDocumentationCommit &&
    mixedCommitRemoved &&
    splitCleanly &&
    finalContentUnchanged &&
    workingTreeClean &&
    featureWasRewritten;

  const progress = {
    splitBugFix,
    splitFeature,
  };

  if (branchName !== "feature/reporting") {
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

  if (!mixedCommitRemoved) {
    return {
      success: false,
      progress,
      message:
        "The original mixed commit still exists.",
    };
  }

  if (!hasValidationCommit || !hasDocumentationCommit) {
    return {
      success: false,
      progress,
      message:
        "Keep the surrounding commits intact while splitting the mixed commit.",
    };
  }

  if (!hasTwoRewrittenCommits || !splitCleanly) {
    return {
      success: false,
      progress,
      message:
        "Split the mixed commit into separate bug-fix and feature commits.",
    };
  }

  if (!finalContentUnchanged) {
    return {
      success: false,
      progress,
      message:
        "The final project content changed. Splitting the commit must preserve the original final state.",
    };
  }

  if (!workingTreeClean) {
    return {
      success: false,
      progress,
      message:
        "The working tree must be clean after the rebase.",
    };
  }

  if (!completeSolution) {
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
      splitBugFix: true,
      splitFeature: true,
    },
    message:
      "Perfect, changelog will actually make sense now. Thanks for taking the time to split that properly.",
  };
};