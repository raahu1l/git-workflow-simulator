const {
  createContainer,
  runSetupScript,
} = require("./docker.service");

const {
  createSandbox,
  getSandbox,
  updateSandboxStatus,
} = require("./sandbox.service");

const {
  startScenario,
} = require("./scenario.service");

/* =========================================
   START SCENARIO
========================================= */

const startScenarioRunner = async (
  scenarioId
) => {
  const scenario =
    startScenario(scenarioId);

  if (!scenario) {
    return null;
  }

  /*
   * =========================================
   * CREATE SESSION IMMEDIATELY
   * =========================================
   *
   * No Docker work is awaited here.
   *
   * This allows the API to return the session
   * immediately.
   */

  const sandbox = createSandbox(
    scenario.id,
    null,
    "starting"
  );

  /*
   * =========================================
   * PREPARE SANDBOX IN BACKGROUND
   * =========================================
   */

  (async () => {
    try {
      /*
       * Create Docker container.
       */
      const containerId =
        await createContainer();

      /*
       * Session may have been deleted while
       * Docker was starting.
       */
      const currentSandbox =
        getSandbox(sandbox.sessionId);

      if (!currentSandbox) {
        return;
      }

      /*
       * Attach container to the session.
       */
      currentSandbox.containerId =
        containerId;

      /*
       * Run scenario setup.
       */
      const setupOutput = await runSetupScript(
        containerId,
        scenario.id
      );

      /*
       * Persist the raw setup output on this
       * session's own sandbox record. See
       * sandbox.service.js and docker.service.js
       * for why this exists and why it is safe.
       */
      currentSandbox.setupOutput =
        typeof setupOutput === "string"
          ? setupOutput
          : "";

      /*
       * Scenario is now ready.
       */
      updateSandboxStatus(
        sandbox.sessionId,
        "created"
      );

      console.log(
        `Scenario ${sandbox.sessionId} started successfully`
      );
    } catch (error) {
      console.error(
        `Failed to prepare scenario ${sandbox.sessionId}:`,
        error
      );

      updateSandboxStatus(
        sandbox.sessionId,
        "failed"
      );
    }
  })();

  /*
   * =========================================
   * RETURN IMMEDIATELY
   * =========================================
   */

  return sandbox;
};

module.exports = {
  startScenarioRunner,
};