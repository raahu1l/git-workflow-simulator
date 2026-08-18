const {
  validateScenario,
  getScenarioProgress,
} = require("../services/validation-runner.service");

const {
  getSandbox,
} = require("../services/sandbox.service");

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

module.exports = {
  validateSession,
  getProgress,
  getSession,
};