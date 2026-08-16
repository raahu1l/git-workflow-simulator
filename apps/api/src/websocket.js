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

    /* =========================================
       CREATE TERMINAL
    ========================================== */

    const ensureTerminal = (sessionId) => {
      if (terminal) {
        return terminal;
      }

      const sandbox = getSandbox(sessionId);

      if (!sandbox) {
        ws.send(
          JSON.stringify({
            type: "error",
            data: "Session not found.\r\n",
          })
        );

        return null;
      }

      terminal = startTerminal(sandbox.containerId);

      /* =========================================
         PTY OUTPUT → WEBSOCKET
      ========================================== */

      terminal.onData((output) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "output",
              data: output,
            })
          );
        }
      });

      /* =========================================
         PTY EXIT
      ========================================== */

      terminal.onExit(({ exitCode }) => {
        console.log(`Terminal exited with code ${exitCode}`);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "info",
              data: `\r\nTerminal exited (${exitCode}).\r\n`,
            })
          );
        }

        terminal = null;
      });

      return terminal;
    };

    /* =========================================
       WEBSOCKET MESSAGE
    ========================================== */

    ws.on("message", (message) => {
      try {
        const rawMessage = message.toString();

        console.log("WebSocket message:", rawMessage);

        const data = JSON.parse(rawMessage);

        /* =====================================
           RAW TERMINAL INPUT
        ====================================== */

        if (data.type === "input") {
          if (typeof data.data !== "string") {
            return;
          }

          const pty = ensureTerminal(data.sessionId);

          if (!pty) {
            return;
          }

          pty.write(data.data);

          return;
        }

        /* =====================================
           TERMINAL RESIZE
        ====================================== */

        if (data.type === "resize") {
          const pty = ensureTerminal(data.sessionId);

          if (!pty) {
            return;
          }

          const cols = Number(data.cols);
          const rows = Number(data.rows);

          if (
            Number.isInteger(cols) &&
            Number.isInteger(rows) &&
            cols > 0 &&
            rows > 0
          ) {
            pty.resize(cols, rows);
          }

          return;
        }

        /* =====================================
           UNKNOWN MESSAGE
        ====================================== */

        console.log(
          "Unknown WebSocket message type:",
          data.type
        );

      } catch (err) {
        console.error("WebSocket message error:", err);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "error",
              data: `Server error: ${err.message}\r\n`,
            })
          );
        }
      }
    });

    /* =========================================
       CLIENT DISCONNECTED
    ========================================== */

    ws.on("close", () => {
      console.log("Client disconnected");

      if (terminal) {
        try {
          terminal.kill();
        } catch (error) {
          console.error(
            "Failed to kill terminal:",
            error
          );
        }

        terminal = null;
      }
    });
  });
};

module.exports = {
  setupWebSocket,
};