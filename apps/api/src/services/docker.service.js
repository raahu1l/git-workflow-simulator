const { execFile } = require("child_process");
const pty = require("node-pty");
const path = require("path");

const {
  getScenarioDirectory,
} = require("./scenario.service");

const scenariosPath = path.resolve(
  __dirname,
  "../../scenarios"
);

const {
  dockerImage,
} = require("../config");

const runDocker = (args, options = {}) =>
  new Promise((resolve, reject) => {
    execFile(
      "docker",
      args,
      {
        maxBuffer: 1024 * 1024,
        ...options,
      },
      (error, stdout, stderr) => {
        if (error) {
          error.stderr = stderr;
          return reject(error);
        }

        resolve(stdout.trim());
      }
    );
  });

/* =========================================
   CREATE CONTAINER
========================================= */

const createContainer = () => {
  return runDocker([
    "run",
    "-d",
    "--init",
    "--cpus=1",
    "--memory=512m",
    "--pids-limit=256",
    "-v",
    `${scenariosPath}:/scenarios:ro`,
    dockerImage,
  ]);
};

/* =========================================
   EXECUTE SINGLE COMMAND
========================================= */

const executeCommand = (
  containerId,
  command
) => {
  if (
    typeof containerId !== "string" ||
    !/^[a-f0-9]+$/i.test(containerId)
  ) {
    return Promise.reject(
      new Error("Invalid container ID")
    );
  }

  if (typeof command !== "string") {
    return Promise.reject(
      new Error("Docker command must be a string")
    );
  }

  return runDocker([
    "exec",
    containerId,
    "bash",
    "-lc",
    command,
  ]);
};

const destroyContainer = async (containerId) => {
  if (
    typeof containerId !== "string" ||
    !/^[a-f0-9]+$/i.test(containerId)
  ) {
    return;
  }

  try {
    await runDocker(["rm", "-f", containerId]);
  } catch (error) {
    console.warn(
      `Unable to remove container ${containerId}: ${error.message}`
    );
  }
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

  if (
    typeof containerId !== "string" ||
    !/^[a-f0-9]+$/i.test(containerId)
  ) {
    throw new Error("Invalid container ID");
  }

  const command =
    `docker exec -it ${containerId} bash -i`;

  const shell = process.platform === "win32"
    ? process.env.ComSpec || "cmd.exe"
    : "/bin/sh";

  const shellArgs = process.platform === "win32"
    ? ["/d", "/s", "/c", command]
    : ["-c", command];

  const terminal = pty.spawn(
    shell,
    shellArgs,
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
  destroyContainer,
  startTerminal,
};