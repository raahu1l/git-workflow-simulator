const { createContainer } = require("./services/docker.service");

async function test() {
  try {
    const containerId = await createContainer();

    console.log("Container created:");
    console.log(containerId);
  } catch (err) {
    console.error(err);
  }
}

test();