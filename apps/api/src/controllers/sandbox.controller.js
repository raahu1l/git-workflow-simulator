const {
  createSandbox,
  getSandbox,
  updateSandboxStatus,
  deleteSandbox,
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

const updateStatus = (req, res) => {
  const { sessionId } = req.params;
  const { status } = req.body;

  const sandbox = updateSandboxStatus(sessionId, status);

  if (!sandbox) {
    return res.status(404).json({
      message: "Sandbox not found",
    });
  }

  res.json(sandbox);
};

const removeSandbox = (req, res) => {
  const { sessionId } = req.params;

  const sandbox = deleteSandbox(sessionId);

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
  updateStatus,
  removeSandbox,
};