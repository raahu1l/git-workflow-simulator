const crypto = require("crypto");

const { sessions } = require("../store/sessions");

const createSandbox = (scenarioId, containerId) => {
  const sessionId = crypto.randomUUID();

  const createdAt = new Date();

  const expiresAt = new Date(
    createdAt.getTime() + 30 * 60 * 1000
  );

  const sandbox = {
    sessionId,
    scenarioId,
    status: "created",
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    containerId,
  };

  sessions[sessionId] = sandbox;

  return sandbox;
};

const getSandbox = (sessionId) => {
  return sessions[sessionId];
};

const updateSandboxStatus = (
  sessionId,
  status
) => {
  const sandbox = sessions[sessionId];

  if (!sandbox) {
    return null;
  }

  sandbox.status = status;

  return sandbox;
};

const resetSandbox = (sessionId) => {
  const sandbox = sessions[sessionId];

  if (!sandbox) {
    return null;
  }

  sandbox.status = "created";

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
  resetSandbox,
  deleteSandbox,
};