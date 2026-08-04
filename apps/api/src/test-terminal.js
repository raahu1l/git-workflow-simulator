const {
  createContainer,
  startTerminal,
} = require("./services/docker.service");

(async () => {
  try {
    const containerId = await createContainer();

    console.log("Container:");
    console.log(containerId);

    const terminal = startTerminal(containerId);

    terminal.stdout.on("data", (data) => {
      console.log("OUTPUT:");
      console.log(data.toString());
    });

    terminal.stderr.on("data", (data) => {
      console.log("ERROR:");
      console.log(data.toString());
    });

    terminal.stdin.write("pwd\n");
    terminal.stdin.write("ls\n");
    terminal.stdin.write("cd /workspace\n");
    terminal.stdin.write("pwd\n");
    terminal.stdin.write("git status\n");

    setTimeout(() => {
      terminal.stdin.write("exit\n");
    }, 2000);
  } catch (err) {
    console.error(err);
  }
})();