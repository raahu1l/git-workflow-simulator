const path = require("path");

const {
  executeCommand,
} = require("./docker.service");

const {
  getSandbox,
} = require("./sandbox.service");

const {
  getScenarioDirectory,
} = require("./scenario.service");

/* =========================================
   VALIDATE SCENARIO
========================================= */

const validateScenario = async (
  sessionId
) => {
  const sandbox = getSandbox(sessionId);

  if (!sandbox) {
    return null;
  }

  /*
   * Do not validate while the workspace is being
   * rebuilt.
   */
  if (sandbox.status === "resetting") {
    return {
      success: false,
      resetting: true,
      message:
        "Scenario is currently resetting.",
    };
  }

  const scenarioDirectory =
    getScenarioDirectory(
      sandbox.scenarioId
    );

  if (!scenarioDirectory) {
    return null;
  }

  const validatorPath = path.join(
    scenarioDirectory,
    "validate.js"
  );

  const validator = require(
    validatorPath
  );

  const result = await validator({
    executeCommand,
    containerId:
      sandbox.containerId,
  });

  return result;
};

/* =========================================
   GET SCENARIO PROGRESS
========================================= */

const getScenarioProgress = async (
  sessionId
) => {
  const sandbox = getSandbox(sessionId);

  if (!sandbox) {
    return null;
  }

  /*
   * Reset is an expected temporary state.
   *
   * The frontend should simply display 0 progress
   * while setup.sh rebuilds the workspace.
   */
  if (sandbox.status === "resetting") {
    return {};
  }

  const scenarioDirectory =
    getScenarioDirectory(
      sandbox.scenarioId
    );

  if (!scenarioDirectory) {
    return null;
  }

  const progressPath = path.join(
    scenarioDirectory,
    "progress.js"
  );

  const progress = require(
    progressPath
  );

  const result = await progress({
    executeCommand,
    containerId:
      sandbox.containerId,
  });

  return result;
};

module.exports = {
  validateScenario,
  getScenarioProgress,
};