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
    exec(
      `docker run -d -v "${scenariosPath}:/scenarios" git-sandbox`,
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