const {
  validateScenario,
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
  const sessionId =
    req.params.sessionId;

  try {
    const sandbox =
      getSandbox(sessionId);

    if (!sandbox) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    /*
     * Prevent multiple resets from running
     * against the same sandbox at once.
     */
    if (
      sandbox.status ===
      "resetting"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Session is already resetting.",
      });
    }

    console.log(
      `Resetting session ${sessionId}`
    );

    /*
     * Mark the sandbox as resetting BEFORE
     * changing anything inside the container.
     */
    sandbox.status = "resetting";

    /*
     * setup.sh owns the actual repository reset.
     *
     * The shared backend does not know how a
     * particular scenario should be initialized.
     */
    const setupOutput =
      await runSetupScript(
        sandbox.containerId,
        sandbox.scenarioId
      );

    /*
     * Reset generic session state after the
     * scenario setup completed successfully.
     */
    resetSandbox(sessionId);

    /*
     * Preserve the fresh setup output.
     */
    sandbox.setupOutput =
      typeof setupOutput === "string"
        ? setupOutput
        : "";

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
     * Never leave the sandbox permanently
     * stuck in "resetting" after a failure.
     */
    const sandbox =
      getSandbox(sessionId);

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
  getSession,
  resetSession,
};