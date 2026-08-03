const {
  validateScenario,
} = require("../services/validation-runner.service");

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

module.exports = {
  validateSession,
};