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
  const sandbox =
    getSandbox(sessionId);

  if (!sandbox) {
    return null;
  }

  if (
    sandbox.status ===
    "resetting"
  ) {
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

  const validatorPath =
    path.join(
      scenarioDirectory,
      "validate.js"
    );

  const validator =
    loadScenarioModule(
      validatorPath
    );

  const result =
    await validator({
      executeCommand,
      containerId:
        sandbox.containerId,

      /*
       * Generic learner action history.
       *
       * Scenarios can use this if they need
       * to reason about actions, but they
       * are not required to do so.
       */
      actions:
        Array.isArray(
          sandbox.actions
        )
          ? sandbox.actions
          : [],

      /*
       * Raw stdout captured from this
       * session's most recent setup.sh run.
       *
       * Optional. Most scenarios do not need it.
       */
      setupOutput:
        typeof sandbox.setupOutput ===
        "string"
          ? sandbox.setupOutput
          : "",
    });

  return result;
};

module.exports = {
  validateScenario,
};