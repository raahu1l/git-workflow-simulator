const WebSocket = require("ws");

const { getSandbox } = require("./services/sandbox.service");
const { startTerminal } = require("./services/docker.service");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    let terminal = null;

    ws.send("Connected to Git Workflow Simulator!\n");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type !== "command") {
          return;
        }

        if (!terminal) {
          const sandbox = getSandbox(data.sessionId);

          if (!sandbox) {
            ws.send("Session not found.\n");
            return;
          }

          terminal = startTerminal(sandbox.containerId);

          terminal.stdout.on("data", (output) => {
            ws.send(output.toString());
          });

          terminal.stderr.on("data", (output) => {
            ws.send(output.toString());
          });

          terminal.on("error", (err) => {
            console.error("Terminal error:", err);
            ws.send("Terminal error.\n");
          });
        }

        terminal.stdin.write(data.command + "\n");
      } catch (err) {
        console.error(err);
        ws.send("Invalid message format.\n");
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