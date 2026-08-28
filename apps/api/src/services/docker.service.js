const { exec } = require("child_process");
const pty = require("node-pty");
const path = require("path");

const {
  getScenarioDirectory,
} = require("./scenario.service");

const scenariosPath = path.resolve(
  __dirname,
  "../../scenarios"
);

/* =========================================
   CREATE CONTAINER
========================================= */

const createContainer = () => {
  return new Promise((resolve, reject) => {
    /*
     * =========================================
     * MOUNT SCENARIO DEFINITIONS READ-ONLY
     * =========================================
     *
     * /scenarios is the SAME host directory bind-
     * mounted into every learner's container.
     *
     * It must never be writable from inside a
     * container: a scenario's setup.sh writing
     * into it (even under its own folder) would
     * mutate shared, on-disk state that every other
     * concurrent session for that scenario also
     * reads from — breaking session isolation.
     *
     * Any per-attempt data a scenario needs to
     * remember between setup.sh and progress.js /
     * validate.js must go through the generic
     * setupOutput channel (see runSetupScript
     * below), which is inherently per-session.
     */
    exec(
      `docker run -d -v "${scenariosPath}:/scenarios:ro" git-sandbox`,
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        resolve(stdout.trim());
      }
    );
  });
};

/* =========================================
   EXECUTE SINGLE COMMAND
========================================= */

const executeCommand = (
  containerId,
  command
) => {
  return new Promise((resolve, reject) => {
    const escapedCommand =
      command.replace(/"/g, '\\"');

    exec(
      `docker exec ${containerId} bash -c "${escapedCommand}"`,
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        resolve(stdout.trim());
      }
    );
  });
};

/* =========================================
   EXECUTE MULTIPLE COMMANDS
========================================= */

const executeCommands = async (
  containerId,
  commands
) => {
  for (const command of commands) {
    await executeCommand(
      containerId,
      command
    );
  }
};

/* =========================================
   RUN SCENARIO SETUP
========================================= */

const runSetupScript = async (
  containerId,
  scenarioId
) => {
  const scenarioDirectory =
    getScenarioDirectory(
      scenarioId
    );

  if (!scenarioDirectory) {
    throw new Error(
      `Scenario directory not found: ${scenarioId}`
    );
  }

  /*
   * =========================================
   * CLEAN WORKSPACE
   * =========================================
   *
   * Reset is shared infrastructure.
   *
   * Every scenario must start from a completely
   * clean /workspace.
   *
   * Scenario setup scripts are responsible only
   * for creating their own scenario environment.
   *
   * This prevents files, Git repositories, and
   * branches from previous runs from affecting
   * Reset, Retry, or Restart Scenario.
   */

  await executeCommand(
    containerId,
    "find /workspace -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +"
  );

  /*
   * =========================================
   * CONVERT SCENARIO PATH
   * =========================================
   *
   * Example:
   *
   * scenarios/
   *   git-foundations/
   *     tracking-a-forgotten-file/
   *
   * becomes:
   *
   * /scenarios/git-foundations/tracking-a-forgotten-file/setup.sh
   */

  const relativePath = path
    .relative(
      scenariosPath,
      scenarioDirectory
    )
    .split(path.sep)
    .join("/");

  /*
   * =========================================
   * RUN SCENARIO SETUP
   * =========================================
   *
   * The resolved stdout of setup.sh is returned
   * to the caller (see scenario-runner.service.js
   * and session.controller.js), which persists it
   * on that session's own sandbox record as
   * `setupOutput`.
   *
   * This is the generic, per-session channel a
   * scenario can use to carry data it generates
   * at setup time (e.g. a commit hash the learner
   * needs to "discover", not just read from a
   * file) forward to its own progress.js and
   * validate.js — without writing to any shared,
   * on-disk, or learner-visible location.
   *
   * The backend never parses this output; it is
   * opaque scenario-specific text.
   */

  return executeCommand(
    containerId,
    `bash /scenarios/${relativePath}/setup.sh`
  );
};

/* =========================================
   START INTERACTIVE TERMINAL
========================================= */

const startTerminal = (containerId) => {
  /*
   * Windows:
   *
   * node-pty
   *   ↓
   * cmd.exe
   *   ↓
   * docker exec -it
   *   ↓
   * bash -i
   *
   * Keep this structure because it works
   * correctly with the current Windows setup.
   */

  const command =
    `docker exec -it ${containerId} bash -i`;

  const terminal = pty.spawn(
    process.env.ComSpec ||
      "C:\\Windows\\System32\\cmd.exe",
    [
      "/d",
      "/s",
      "/c",
      command,
    ],
    {
      name: "xterm-color",
      cols: 120,
      rows: 30,
      cwd: process.cwd(),
      env: {
        ...process.env,
        TERM: "xterm-256color",
      },
    }
  );

  return terminal;
};

module.exports = {
  createContainer,
  executeCommand,
  executeCommands,
  runSetupScript,
  startTerminal,
};