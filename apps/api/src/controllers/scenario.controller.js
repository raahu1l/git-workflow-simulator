const {
  getAllScenarios,
  getScenarioById,
} = require("../services/scenario.service");

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

module.exports = {
  listScenarios,
  getScenario,
};