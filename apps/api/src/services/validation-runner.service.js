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
    loadScenarioModule(
      validatorPath
    );

  const result = await validator({
    executeCommand,
    containerId:
      sandbox.containerId,

    /*
     * Generic learner action history.
     *
     * Existing scenarios don't have to use it.
     */
    actions: Array.isArray(
      sandbox.actions
    )
      ? sandbox.actions
      : [],
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
    loadScenarioModule(
      progressPath
    );

  const result = await progress({
    executeCommand,
    containerId:
      sandbox.containerId,

    /*
     * Generic action history.
     */
    actions: Array.isArray(
      sandbox.actions
    )
      ? sandbox.actions
      : [],
  });

  return result;
};

module.exports = {
  validateScenario,
  getScenarioProgress,
};