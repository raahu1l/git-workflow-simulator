const {
  getAllScenarios,
  getScenarioById,
} = require("../services/scenario.service");

const {
  startScenarioRunner,
} = require("../services/scenario-runner.service");

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

const startScenarioById = async (req, res) => {
  try {
    const sandbox = await startScenarioRunner(
      req.params.id
    );

    if (!sandbox) {
      return res.status(404).json({
        message: "Scenario not found",
      });
    }

    res.status(201).json(sandbox);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to start scenario",
    });
  }
};

module.exports = {
  listScenarios,
  getScenario,
  startScenarioById,
};