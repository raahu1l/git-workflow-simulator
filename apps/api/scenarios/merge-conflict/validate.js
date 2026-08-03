module.exports = async ({ executeCommand, containerId }) => {
  const checks = [];

  // Check 1 - Current branch
  const currentBranch = (
    await executeCommand(
      containerId,
      "git branch --show-current"
    )
  ).trim();

  checks.push({
    name: "On main branch",
    passed: currentBranch === "master",
  });

  // Check 2 - Merge commit
  const parents = (
    await executeCommand(
      containerId,
      "git rev-list --parents -n 1 HEAD"
    )
  )
    .trim()
    .split(" ");

  checks.push({
    name: "Merge commit exists",
    passed: parents.length === 3,
  });

  // Check 3 - Working tree clean
  const status = await executeCommand(
    containerId,
    "git status --porcelain"
  );

  checks.push({
    name: "Working tree clean",
    passed: status.trim() === "",
  });

  // Check 4 - Conflict markers removed
  const conflictMarkers = await executeCommand(
    containerId,
    'grep -R "<<<<<<<" /workspace || true'
  );

  checks.push({
    name: "No conflict markers",
    passed: conflictMarkers.trim() === "",
  });

  // Check 5 - README contains both changes
  const readme = await executeCommand(
    containerId,
    "cat /workspace/README.md"
  );

  const hasMain = readme.includes(
    "Main changed Line 2"
  );

  const hasFeature = readme.includes(
    "Feature changed Line 2"
  );

  checks.push({
    name: "Both changes preserved",
    passed: hasMain && hasFeature,
  });

  const passedChecks = checks.filter(
    (check) => check.passed
  ).length;

  const score = Math.round(
    (passedChecks / checks.length) * 100
  );

  return {
    success: passedChecks === checks.length,
    score,
    checks,
    message:
      passedChecks === checks.length
        ? "Merge conflict resolved successfully!"
        : `${checks.length - passedChecks} check(s) failed.`,
  };
};