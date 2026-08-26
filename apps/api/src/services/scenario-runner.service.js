const {
  createContainer,
  runSetupScript,
} = require("./docker.service");

const {
  createSandbox,
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
        require("./sandbox.service").getSandbox(
          sandbox.sessionId
        );

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
      await runSetupScript(
        containerId,
        scenario.id
      );

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