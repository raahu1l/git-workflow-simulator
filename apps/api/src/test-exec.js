const {
  createContainer,
  executeCommand,
} = require("./services/docker.service");

async function test() {
  try {
    const containerId = await createContainer();

    console.log("Container:");
    console.log(containerId);

    const output = await executeCommand(
      containerId,
      "pwd"
    );

    console.log("\nCommand Output:");
    console.log(output);
  } catch (error) {
    console.error(error);
  }
}

test();