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

    /*
     * Generic learner action history.
     *
     * Scenarios can use this to determine
     * whether the learner actually performed
     * an important action.
     *
     * Example:
     * ["git branch -m fix-login-validation",
     *  "git log --oneline"]
     */
    actions: [],

    /*
     * =========================================
     * PERSISTED TASK COMPLETION
     * =========================================
     *
     * scenario progress.js always reports the
     * LIVE state of the repository for each task
     * id it defines (e.g. "does this branch exist
     * right now?").
     *
     * That live state can legitimately go back to
     * false later in an attempt, because a later
     * task in the same scenario may require undoing
     * something an earlier task checked for (e.g.
     * deleting a branch after it was merged).
     *
     * The backend — not any individual scenario —
     * is responsible for remembering that a task
     * was completed at some point during the
     * current attempt, and for continuing to report
     * it as completed even if the live repository
     * state no longer matches.
     *
     * This is generic: it is just a map of
     * taskId -> true, built from whatever keys
     * progress.js happens to return. It never
     * inspects task ids, commands, or scenario ids.
     *
     * Cleared only on reset (fresh attempt).
     */
    completedTasks: {},

    /*
     * =========================================
     * GENERIC SETUP OUTPUT CHANNEL
     * =========================================
     *
     * Raw stdout captured from this session's own
     * most recent setup.sh run.
     *
     * Isolated by construction: it lives on this
     * session's own sandbox record, never touches
     * the shared /scenarios mount or any other
     * session's container.
     *
     * Opaque to the backend — scenarios decide
     * what (if anything) to put in it and how to
     * parse it back out in progress.js/validate.js.
     *
     * Cleared on reset, repopulated once the fresh
     * setup.sh run completes.
     */
    setupOutput: "",
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
   RECORD LEARNER ACTION
========================================= */

const recordSandboxAction = (
  sessionId,
  action
) => {
  const sandbox = sessions[sessionId];

  if (!sandbox) {
    return null;
  }

  if (
    typeof action !== "string" ||
    !action.trim()
  ) {
    return sandbox;
  }

  if (!Array.isArray(sandbox.actions)) {
    sandbox.actions = [];
  }

  sandbox.actions.push(action.trim());

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

  /*
   * A fresh scenario means a fresh action
   * history as well.
   */
  sandbox.actions = [];

  /*
   * A fresh attempt means no task has been
   * completed yet.
   */
  sandbox.completedTasks = {};

  /*
   * A fresh attempt means any previously captured
   * setup output is stale until the new setup.sh
   * run completes and repopulates it (see
   * session.controller.js).
   */
  sandbox.setupOutput = "";

  return sandbox;
};

/* =========================================
   MERGE TASK PROGRESS
   =========================================

   Takes whatever live progress a scenario's
   progress.js reports for this call, records
   any newly-true task ids as permanently
   completed for the current attempt, and
   returns the merged (persisted) view.

   Generic by construction: it only ever reads
   and writes the key names supplied by the
   scenario's own progress.js return value —
   it never knows what those keys mean, how many
   there are, or what scenario they belong to.
========================================= */

const mergeTaskProgress = (
  sessionId,
  liveProgress
) => {
  const sandbox = sessions[sessionId];

  if (!sandbox) {
    return null;
  }

  if (
    !liveProgress ||
    typeof liveProgress !== "object" ||
    Array.isArray(liveProgress)
  ) {
    return sandbox.completedTasks || {};
  }

  if (
    !sandbox.completedTasks ||
    typeof sandbox.completedTasks !== "object"
  ) {
    sandbox.completedTasks = {};
  }

  const merged = {};

  for (const [taskId, isComplete] of Object.entries(
    liveProgress
  )) {
    if (isComplete === true) {
      sandbox.completedTasks[taskId] = true;
    }

    merged[taskId] =
      sandbox.completedTasks[taskId] === true;
  }

  return merged;
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
  recordSandboxAction,
  resetSandbox,
  deleteSandbox,
  mergeTaskProgress,
};