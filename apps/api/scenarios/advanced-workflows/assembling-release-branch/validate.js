module.exports = async ({
  executeCommand,
  containerId,
}) => {
  const git = async (command) =>
    executeCommand(
      containerId,
      `cd /workspace && ${command}`
    );

  // --------------------------------------------------
  // CURRENT BRANCH
  // --------------------------------------------------

  const branchName = (
    await git("git branch --show-current")
  ).trim();

  const sourceBranches = [
    "main",
    "feature/checkout",
    "feature/notifications",
    "feature/search-experimental",
  ];

  const isReleaseBranch =
    branchName !== "" &&
    !sourceBranches.includes(branchName);

  // --------------------------------------------------
  // RELEASE BRANCH IS BASED ON MAIN
  // --------------------------------------------------

  let basedOnMain = false;

  if (isReleaseBranch) {
    const mergeBase = (
      await git(
        `git merge-base main ${branchName}`
      )
    ).trim();

    const mainHead = (
      await git("git rev-parse main")
    ).trim();

    basedOnMain =
      mergeBase === mainHead;
  }

  // --------------------------------------------------
  // CURRENT RELEASE TREE
  // --------------------------------------------------

  let currentFiles = [];

  if (isReleaseBranch) {
    currentFiles = (
      await git(
        `git ls-tree -r --name-only ${branchName}`
      )
    )
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const hasCheckout =
    currentFiles.includes(
      "src/checkout.py"
    );

  const hasNotifications =
    currentFiles.includes(
      "src/notifications.py"
    );

  const hasExperimentalSearch =
    currentFiles.includes(
      "src/search_experimental.py"
    );

  // --------------------------------------------------
  // FEATURE CONTENT
  // --------------------------------------------------

  let checkoutContent = "";

  let checkoutSourceContent = "";

  if (isReleaseBranch) {
    checkoutContent = await git(
      `git show ${branchName}:src/checkout.py 2>/dev/null || true`
    );

    checkoutSourceContent = await git(
      "git show feature/checkout:src/checkout.py"
    );
  }

  const checkoutIncluded =
    hasCheckout &&
    checkoutContent === checkoutSourceContent;

  let notificationsContent = "";

  let notificationsSourceContent = "";

  if (isReleaseBranch) {
    notificationsContent = await git(
      `git show ${branchName}:src/notifications.py 2>/dev/null || true`
    );

    notificationsSourceContent = await git(
      "git show feature/notifications:src/notifications.py"
    );
  }

  const notificationsIncluded =
    hasNotifications &&
    notificationsContent ===
      notificationsSourceContent;

  // --------------------------------------------------
  // MAIN MUST REMAIN CLEAN
  // --------------------------------------------------

  const mainFiles = (
    await git(
      "git ls-tree -r --name-only main"
    )
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const expectedMainFiles = [
    "README.md",
    "src/app.py",
  ];

  const mainUnchanged =
    mainFiles.length ===
      expectedMainFiles.length &&
    expectedMainFiles.every((file) =>
      mainFiles.includes(file)
    );

  // --------------------------------------------------
  // ORIGINAL FEATURE BRANCHES MUST REMAIN INTACT
  // --------------------------------------------------

  const checkoutBranchDiff = (
    await git(
      "git diff --name-only main feature/checkout"
    )
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const notificationsBranchDiff = (
    await git(
      "git diff --name-only main feature/notifications"
    )
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const searchBranchDiff = (
    await git(
      "git diff --name-only main feature/search-experimental"
    )
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sourceBranchesUnchanged =
    checkoutBranchDiff.length === 1 &&
    checkoutBranchDiff[0] ===
      "src/checkout.py" &&

    notificationsBranchDiff.length === 1 &&
    notificationsBranchDiff[0] ===
      "src/notifications.py" &&

    searchBranchDiff.length === 1 &&
    searchBranchDiff[0] ===
      "src/search_experimental.py";

  // --------------------------------------------------
  // FINAL RELEASE TREE
  // --------------------------------------------------

  const expectedReleaseFiles = [
    "README.md",
    "src/app.py",
    "src/checkout.py",
    "src/notifications.py",
  ];

  const releaseTreeCorrect =
    isReleaseBranch &&
    currentFiles.length ===
      expectedReleaseFiles.length &&
    expectedReleaseFiles.every((file) =>
      currentFiles.includes(file)
    ) &&
    !hasExperimentalSearch;

  // --------------------------------------------------
  // ONLY INTENDED DIFFERENCES FROM MAIN
  // --------------------------------------------------

  let releaseDiff = [];

  if (isReleaseBranch) {
    releaseDiff = (
      await git(
        `git diff --name-only main ${branchName}`
      )
    )
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const onlyExpectedChanges =
    releaseDiff.length === 2 &&
    releaseDiff.includes(
      "src/checkout.py"
    ) &&
    releaseDiff.includes(
      "src/notifications.py"
    );

  // --------------------------------------------------
  // WORKING TREE
  // --------------------------------------------------

  const status = (
    await git(
      "git status --porcelain --untracked-files=all"
    )
  ).trim();

  const workingTreeClean =
    status === "";

  // --------------------------------------------------
  // PROGRESS
  // --------------------------------------------------

  const createRelease =
    isReleaseBranch &&
    basedOnMain;

  const includeCheckout =
    createRelease &&
    checkoutIncluded;

  const includeNotifications =
    includeCheckout &&
    notificationsIncluded;

  const excludeSearch =
    includeNotifications &&
    !hasExperimentalSearch;

  const progress = {
    createRelease,
    includeCheckout,
    includeNotifications,
    excludeSearch,
  };

  // --------------------------------------------------
  // FINAL VALIDATION
  // --------------------------------------------------

  const splitCommit =
    !isReleaseBranch
      ? false
      : createRelease &&
        includeCheckout &&
        includeNotifications &&
        excludeSearch &&
        mainUnchanged &&
        sourceBranchesUnchanged &&
        releaseTreeCorrect &&
        onlyExpectedChanges &&
        workingTreeClean;

  if (!isReleaseBranch) {
    return {
      success: false,
      progress,
      message:
        "Create a separate release branch from main.",
    };
  }

  if (!createRelease) {
    return {
      success: false,
      progress,
      message:
        "The release branch must be based on main.",
    };
  }

  if (!includeCheckout) {
    return {
      success: false,
      progress,
      message:
        "Include the checkout feature in the release.",
    };
  }

  if (!includeNotifications) {
    return {
      success: false,
      progress,
      message:
        "Include the notifications feature in the release.",
    };
  }

  if (!excludeSearch) {
    return {
      success: false,
      progress,
      message:
        "Keep the experimental search feature out of the release.",
    };
  }

  if (!mainUnchanged) {
    return {
      success: false,
      progress,
      message:
        "main must remain unchanged.",
    };
  }

  if (!sourceBranchesUnchanged) {
    return {
      success: false,
      progress,
      message:
        "The original feature branches must remain unchanged.",
    };
  }

  if (!releaseTreeCorrect) {
    return {
      success: false,
      progress,
      message:
        "The release branch contains the wrong files.",
    };
  }

  if (!onlyExpectedChanges) {
    return {
      success: false,
      progress,
      message:
        "The release should differ from main only through checkout and notifications.",
    };
  }

  if (!workingTreeClean) {
    return {
      success: false,
      progress,
      message:
        "The working tree must be clean.",
    };
  }

  if (!splitCommit) {
    return {
      success: false,
      progress,
      message:
        "The release branch is not in the required final state.",
    };
  }

  return {
    success: true,
    progress,
    message:
      "Perfect. The release contains exactly the features we need.",
  };
};