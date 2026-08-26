const crypto = require("crypto");

const { sessions } = require("../store/sessions");

/* =========================================
   CREATE SANDBOX
========================================= */

const createSandbox = (
  scenarioId,
  containerId = null,
  status = "created"
) => {
  const sessionId = crypto.randomUUID();

  const createdAt = new Date();

  const expiresAt = new Date(
    createdAt.getTime() + 30 * 60 * 1000
  );

  const sandbox = {
    sessionId,
    scenarioId,
    status,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    containerId,
  };

  sessions[sessionId] = sandbox;

  return sandbox;
};

/* =========================================
   GET SANDBOX
========================================= */

const getSandbox = (sessionId) => {
  return sessions[sessionId];
};

/* =========================================
   UPDATE SANDBOX STATUS
========================================= */

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

/* =========================================
   RESET SANDBOX
========================================= */

const resetSandbox = (sessionId) => {
  const sandbox = sessions[sessionId];

  if (!sandbox) {
    return null;
  }

  sandbox.status = "created";

  return sandbox;
};

/* =========================================
   DELETE SANDBOX
========================================= */

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