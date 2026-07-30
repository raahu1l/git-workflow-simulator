const { createSandbox } = require("../services/sandbox.service");

const startSandbox = (req, res) => {
  const { scenarioId } = req.body;

  const sandbox = createSandbox(scenarioId);

  res.json(sandbox);
};

module.exports = {
  startSandbox,
};