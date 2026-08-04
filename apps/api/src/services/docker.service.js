const { exec, spawn } = require("child_process");
const path = require("path");

const scenariosPath = path.resolve(__dirname, "../../scenarios");

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

const executeCommand = (containerId, command) => {
  return new Promise((resolve, reject) => {
    exec(
      `docker exec ${containerId} ${command}`,
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        resolve(stdout.trim());
      }
    );
  });
};

const executeCommands = async (containerId, commands) => {
  for (const command of commands) {
    await executeCommand(containerId, command);
  }
};

const runSetupScript = (containerId, scenarioId) => {
  return executeCommand(
    containerId,
    `bash /scenarios/${scenarioId}/setup.sh`
  );
};

const startTerminal = (containerId) => {
  const terminal = spawn("docker", [
    "exec",
    "-i",
    containerId,
    "bash",
  ]);

  return terminal;
};

module.exports = {
  createContainer,
  executeCommand,
  executeCommands,
  runSetupScript,
  startTerminal,
};