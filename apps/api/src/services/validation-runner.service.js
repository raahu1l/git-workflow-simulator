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
   LOAD SCENARIO MODULE FRESH
========================================= */

const loadScenarioModule = (modulePath) => {
  /*
   * Scenario files can be changed while the API
   * server is running. Remove the cached module so
   * validation/progress always uses the current file.
   */
  try {
    delete require.cache[
      require.resolve(modulePath)
    ];
  } catch {
    // Module was not cached yet.
  }

  return require(modulePath);
};

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

  const validator =
    loadScenarioModule(validatorPath);

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

  const progress =
    loadScenarioModule(progressPath);

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