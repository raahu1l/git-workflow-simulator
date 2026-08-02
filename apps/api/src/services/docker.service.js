const { exec } = require("child_process");

const createContainer = () => {
  return new Promise((resolve, reject) => {
    exec("docker run -d git-sandbox", (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      resolve(stdout.trim());
    });
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

module.exports = {
  createContainer,
  executeCommand,
  executeCommands,
};