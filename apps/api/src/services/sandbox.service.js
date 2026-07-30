const crypto = require("crypto");

const createSandbox = (scenarioId) => {
  const sessionId = crypto.randomUUID();

  return {
    sessionId,
  };
};

module.exports = {
  createSandbox,
};