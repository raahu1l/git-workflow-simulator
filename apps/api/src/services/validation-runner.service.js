const path = require("path");

const {
  executeCommand,
} = require("./docker.service");

const {
  getSandbox,
  mergeTaskProgress,
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

    /*
     * Raw stdout captured from this session's own
     * most recent setup.sh run. Optional — most
     * scenarios don't need it. See
     * sandbox.service.js for details.
     */
    setupOutput:
      typeof sandbox.setupOutput === "string"
        ? sandbox.setupOutput
        : "",
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

  const liveProgress = await progress({
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

    /*
     * Raw stdout captured from this session's own
     * most recent setup.sh run. Optional — most
     * scenarios don't need it. See
     * sandbox.service.js for details.
     */
    setupOutput:
      typeof sandbox.setupOutput === "string"
        ? sandbox.setupOutput
        : "",
  });

  /*
   * =========================================
   * PERSIST TASK COMPLETION
   * =========================================
   *
   * progress.js reports the LIVE repository
   * state. The backend is responsible for
   * remembering which tasks have already been
   * completed during this attempt so that a
   * later repository change (e.g. a later task
   * requiring the undo of something an earlier
   * task checked for) can never uncheck a task
   * that was already completed.
   *
   * This is fully generic: it merges whatever
   * task ids progress.js returned, and knows
   * nothing about this scenario specifically.
   */
  const persistedProgress = mergeTaskProgress(
    sessionId,
    liveProgress
  );

  return persistedProgress || liveProgress;
};

module.exports = {
  validateScenario,
  getScenarioProgress,
};