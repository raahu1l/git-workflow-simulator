const {
  validateScenario,
  getScenarioProgress,
} = require("../services/validation-runner.service");

const {
  getSandbox,
  resetSandbox,
} = require("../services/sandbox.service");

const {
  runSetupScript,
} = require("../services/docker.service");

/* =========================================
   VALIDATE SESSION
========================================= */

const validateSession = async (req, res) => {
  try {
    const result = await validateScenario(
      req.params.sessionId
    );

    if (!result) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.json(result);
  } catch (error) {
    console.error(
      "Validation failed:",
      error
    );

    res.status(500).json({
      message: "Validation failed",
    });
  }
};

/* =========================================
   GET PROGRESS
========================================= */

const getProgress = async (req, res) => {
  try {
    const result = await getScenarioProgress(
      req.params.sessionId
    );

    if (result === null) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.json(result);
  } catch (error) {
    console.error(
      "Failed to get scenario progress:",
      error
    );

    res.status(500).json({
      message: "Failed to get scenario progress",
    });
  }
};

/* =========================================
   GET SESSION
========================================= */

const getSession = (req, res) => {
  const sandbox = getSandbox(
    req.params.sessionId
  );

  if (!sandbox) {
    return res.status(404).json({
      message: "Session not found",
    });
  }

  res.json({
    sessionId: sandbox.sessionId,
    scenarioId: sandbox.scenarioId,
    status: sandbox.status,
  });
};

/* =========================================
   RESET SESSION
========================================= */

const resetSession = async (req, res) => {
  const sessionId = req.params.sessionId;

  try {
    const sandbox = getSandbox(sessionId);

    if (!sandbox) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    /*
     * Prevent progress/validation requests from
     * treating the temporary reset state as a
     * broken Git repository.
     */
    if (sandbox.status === "resetting") {
      return res.status(409).json({
        success: false,
        message: "Session is already resetting.",
      });
    }

    console.log(
      `Resetting session ${sessionId}`
    );

    /*
     * Mark the sandbox as resetting BEFORE changing
     * anything inside the container.
     */
    sandbox.status = "resetting";

    /*
     * setup.sh already performs a complete reset
     * of /workspace, including removing .git.
     *
     * Therefore we do NOT manually delete .git here.
     *
     * This keeps the reset logic owned by the scenario.
     */
    await runSetupScript(
      sandbox.containerId,
      sandbox.scenarioId
    );

    /*
     * Only mark the session as ready after setup
     * has completed successfully.
     */
    resetSandbox(sessionId);

    console.log(
      `Session ${sessionId} reset successfully`
    );

    res.json({
      success: true,
      message:
        "Scenario reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset failed:",
      error
    );

    /*
     * If reset failed, restore the sandbox to a
     * usable status rather than leaving it stuck
     * permanently in "resetting".
     */
    const sandbox = getSandbox(sessionId);

    if (sandbox) {
      sandbox.status = "created";
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to reset scenario.",
    });
  }
};

module.exports = {
  validateSession,
  getProgress,
  getSession,
  resetSession,
};