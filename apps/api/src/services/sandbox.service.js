const crypto = require("crypto");
const { sessions } = require("../store/sessions");

const createSandbox = (scenarioId) => {
  const sessionId = crypto.randomUUID();

  const sandbox = {
    sessionId,
    scenarioId,
    status: "created",
  };

  sessions[sessionId] = sandbox;

  return sandbox;
};

const getSandbox = (sessionId) => {
  return sessions[sessionId];
};

module.exports = {
  createSandbox,
  getSandbox,
};