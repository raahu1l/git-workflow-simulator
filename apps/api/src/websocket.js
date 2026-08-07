const WebSocket = require("ws");

const { getSandbox } = require("./services/sandbox.service");
const { startTerminal } = require("./services/docker.service");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    let terminal = null;

    ws.send(
      JSON.stringify({
        type: "info",
        data: "Connected to Git Workflow Simulator!\r\n",
      })
    );

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type !== "command") {
          return;
        }

        if (!terminal) {
          const sandbox = getSandbox(data.sessionId);

          if (!sandbox) {
            ws.send(
              JSON.stringify({
                type: "error",
                data: "Session not found.\r\n",
              })
            );
            return;
          }

          terminal = startTerminal(sandbox.containerId);

          terminal.stdout.on("data", (output) => {
            ws.send(
              JSON.stringify({
                type: "output",
                data: output.toString(),
              })
            );
          });

          terminal.stderr.on("data", (output) => {
            ws.send(
              JSON.stringify({
                type: "output",
                data: output.toString(),
              })
            );
          });

          terminal.on("error", (err) => {
            console.error(err);

            ws.send(
              JSON.stringify({
                type: "error",
                data: "Terminal error.\r\n",
              })
            );
          });
        }

        terminal.stdin.write(data.command + "\n");
      } catch (err) {
        console.error(err);

        ws.send(
          JSON.stringify({
            type: "error",
            data: "Invalid message format.\r\n",
          })
        );
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");

      if (terminal) {
        terminal.stdin.write("exit\n");
        terminal.kill();
      }
    });
  });
};

module.exports = {
  setupWebSocket,
};