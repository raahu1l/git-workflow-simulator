const {
  createSandbox,
  getSandbox,
} = require("../services/sandbox.service");

const startSandbox = (req, res) => {
  const { scenarioId } = req.body;

  const sandbox = createSandbox(scenarioId);

  res.json(sandbox);
};

const getSandboxById = (req, res) => {
  const { sessionId } = req.params;

  const sandbox = getSandbox(sessionId);

  if (!sandbox) {
    return res.status(404).json({
      message: "Sandbox not found",
    });
  }

  res.json(sandbox);
};

module.exports = {
  startSandbox,
  getSandboxById,
};