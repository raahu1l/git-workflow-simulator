const {
  validateScenario,
  getScenarioProgress,
} = require("../services/validation-runner.service");

const {
  getSandbox,
  resetSandbox,
} = require("../services/sandbox.service");

const {
  executeCommand,
  runSetupScript,
} = require("../services/docker.service");

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
    console.error(error);

    res.status(500).json({
      message: "Validation failed",
    });
  }
};

const getProgress = async (req, res) => {
  try {
    const result = await getScenarioProgress(
      req.params.sessionId
    );

    if (!result) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get scenario progress",
    });
  }
};

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

const resetSession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const sandbox = getSandbox(sessionId);

    if (!sandbox) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    console.log(
      `Resetting session ${sessionId}`
    );

    // Remove the current scenario state.
    await executeCommand(
      sandbox.containerId,
      "cd /workspace && rm -rf .git README.md"
    );

    // Restore the scenario's initial state.
    await runSetupScript(
      sandbox.containerId,
      sandbox.scenarioId
    );

    resetSandbox(sessionId);

    console.log(
      `Session ${sessionId} reset successfully`
    );

    res.json({
      success: true,
      message: "Scenario reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset failed:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to reset scenario.",
    });
  }
};

module.exports = {
  validateSession,
  getProgress,
  getSession,
  resetSession,
};