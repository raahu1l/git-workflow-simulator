const {
  createContainer,
  runSetupScript,
} = require("./docker.service");

const { createSandbox } = require("./sandbox.service");

const { startScenario } = require("./scenario.service");

const startScenarioRunner = async (scenarioId) => {
  const scenario = startScenario(scenarioId);

  if (!scenario) {
    return null;
  }

  const containerId = await createContainer();

  await runSetupScript(
    containerId,
    scenario.id
  );

  const sandbox = createSandbox(
    scenario.id,
    containerId
  );

  return sandbox;
};

module.exports = {
  startScenarioRunner,
};