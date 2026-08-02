const {
  getAllScenarios,
  getScenarioById,
  startScenario,
} = require("../services/scenario.service");

const { createSandbox } = require("../services/sandbox.service");

const {
  createContainer,
  runSetupScript,
} = require("../services/docker.service");

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
  const { id } = req.params;

  const scenario = startScenario(id);

  if (!scenario) {
    return res.status(404).json({
      message: "Scenario not found",
    });
  }

  try {
    const containerId = await createContainer();

    await runSetupScript(
      containerId,
      scenario.id
    );

    const sandbox = createSandbox(
      scenario.id,
      containerId
    );

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