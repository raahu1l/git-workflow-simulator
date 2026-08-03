const path = require("path");

const { executeCommand } = require("./docker.service");

const { getSandbox } = require("./sandbox.service");

const validateScenario = async (sessionId) => {
  const sandbox = getSandbox(sessionId);

  if (!sandbox) {
    return null;
  }

  const validatorPath = path.resolve(
    __dirname,
    `../../scenarios/${sandbox.scenarioId}/validate.js`
  );

  const validator = require(validatorPath);

  const result = await validator({
    executeCommand,
    containerId: sandbox.containerId,
  });

  return result;
};

module.exports = {
  validateScenario,
};