const { exec } = require("child_process");

function createContainer() {
  return new Promise((resolve, reject) => {
    exec("docker run -d git-sandbox", (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      resolve(stdout.trim());
    });
  });
}

module.exports = {
  createContainer,
};