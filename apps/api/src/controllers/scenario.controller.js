const {
  getAllScenarios,
  getScenarioById,
  startScenario,
} = require("../services/scenario.service");

const { createSandbox } = require("../services/sandbox.service");

const listScenarios = (req, res) => {
  const scenarios = getAllScenarios();

  res.json(scenarios);
};

const getScenario = (req, res) => {
  const { id } = req.params;

  const scenario = getScenarioById(id);

  if (!scenario) {
    return res.status(404).json({
      message: "Scenario not found",
    });
  }

  res.json(scenario);
};

const startScenarioById = (req, res) => {
  const { id } = req.params;

  const scenario = startScenario(id);

  if (!scenario) {
    return res.status(404).json({
      message: "Scenario not found",
    });
  }

  const sandbox = createSandbox(scenario.id);

  res.status(201).json(sandbox);
};

module.exports = {
  listScenarios,
  getScenario,
  startScenarioById,
};