const { exec } = require("child_process");
const pty = require("node-pty");
const path = require("path");

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

const runSetupScript = (
  containerId,
  scenarioId
) => {
  return executeCommand(
    containerId,
    `bash /scenarios/${scenarioId}/setup.sh`
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
   * We keep cmd.exe here because Docker is
   * resolved correctly through the Windows
   * PATH in this environment.
   */

  const command = `docker exec -it ${containerId} bash -i`;

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