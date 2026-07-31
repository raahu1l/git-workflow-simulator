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

const updateSandboxStatus = (sessionId, status) => {
  const sandbox = sessions[sessionId];

  if (!sandbox) {
    return null;
  }

  sandbox.status = status;

  return sandbox;
};

const deleteSandbox = (sessionId) => {
  const sandbox = sessions[sessionId];

  if (!sandbox) {
    return null;
  }

  delete sessions[sessionId];

  return sandbox;
};

module.exports = {
  createSandbox,
  getSandbox,
  updateSandboxStatus,
  deleteSandbox,
};