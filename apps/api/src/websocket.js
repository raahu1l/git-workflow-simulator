const WebSocket = require("ws");
const { execFile } = require("child_process");

const {
  getSandbox,
} = require("./services/sandbox.service");

const {
  startTerminal,
} = require("./services/docker.service");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    let terminal = null;
    let terminalSessionId = null;
    let shuttingDown = false;

    ws.send(
      JSON.stringify({
        type: "info",
        data:
          "Connected to Git Workflow Simulator!\r\n",
      })
    );

    /* =========================================
       SEND MESSAGE SAFELY
    ========================================== */

    const send = (message) => {
      if (
        !shuttingDown &&
        ws.readyState === WebSocket.OPEN
      ) {
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(
            "WebSocket send error:",
            error
          );
        }
      }
    };

    /* =========================================
       DESTROY TERMINAL SAFELY
    ========================================== */

    const destroyTerminal = () => {
      const oldTerminal = terminal;

      if (!oldTerminal) {
        terminalSessionId = null;
        return;
      }

      /*
       * Invalidate the terminal FIRST.
       *
       * This prevents late PTY events from
       * interfering with a future terminal.
       */
      terminal = null;
      terminalSessionId = null;

      /*
       * IMPORTANT:
       *
       * Do NOT call oldTerminal.kill() on Windows.
       *
       * node-pty's Windows kill() enters
       * _getConsoleProcessList(), which is the
       * code currently crashing in your setup.
       *
       * Instead, terminate the Windows process
       * tree directly.
       */

      if (process.platform === "win32") {
        const pid = oldTerminal.pid;

        if (!pid) {
          console.log(
            "Terminal has no PID; skipping process cleanup."
          );

          return;
        }

        console.log(
          `Stopping terminal process tree (PID ${pid})`
        );

        execFile(
          "taskkill",
          [
            "/PID",
            String(pid),
            "/T",
            "/F",
          ],
          {
            windowsHide: true,
          },
          (error, stdout, stderr) => {
            if (error) {
              /*
               * The process may already have exited.
               * Do not crash the server.
               */
              console.log(
                `Terminal process cleanup finished: ${error.message}`
              );

              return;
            }

            console.log(
              `Terminal process tree stopped (PID ${pid})`
            );
          }
        );

        return;
      }

      /*
       * Linux/macOS:
       * node-pty kill() is fine because the
       * Windows-specific getConsoleProcessList()
       * problem does not apply.
       */
      try {
        oldTerminal.kill();
      } catch (error) {
        console.log(
          "Terminal already exited during cleanup."
        );
      }
    };

    /* =========================================
       CREATE TERMINAL
    ========================================== */

    const ensureTerminal = (sessionId) => {
      if (shuttingDown) {
        return null;
      }

      /*
       * Reuse terminal for the same session.
       */
      if (
        terminal &&
        terminalSessionId === sessionId
      ) {
        return terminal;
      }

      /*
       * A WebSocket owns only one terminal.
       */
      if (terminal) {
        destroyTerminal();
      }

      const sandbox = getSandbox(sessionId);

      if (!sandbox) {
        send({
          type: "error",
          data: "Session not found.\r\n",
        });

        return null;
      }

      let newTerminal;

      try {
        newTerminal = startTerminal(
          sandbox.containerId
        );
      } catch (error) {
        console.error(
          "Failed to start terminal:",
          error
        );

        send({
          type: "error",
          data:
            `Failed to start terminal: ${error.message}\r\n`,
        });

        return null;
      }

      terminal = newTerminal;
      terminalSessionId = sessionId;

      /* =========================================
         PTY OUTPUT → WEBSOCKET
      ========================================== */

      newTerminal.onData((output) => {
        /*
         * Ignore output from stale terminals.
         */
        if (
          shuttingDown ||
          terminal !== newTerminal ||
          ws.readyState !== WebSocket.OPEN
        ) {
          return;
        }

        try {
          ws.send(
            JSON.stringify({
              type: "output",
              data: output,
            })
          );
        } catch (error) {
          console.error(
            "PTY output send error:",
            error
          );
        }
      });

      /* =========================================
         PTY EXIT
      ========================================== */

      newTerminal.onExit(
        ({ exitCode, signal }) => {
          console.log(
            `Terminal exited with code ${exitCode}${
              signal
                ? ` (signal ${signal})`
                : ""
            }`
          );

          /*
           * Ignore exit events belonging to an
           * older terminal.
           */
          if (terminal !== newTerminal) {
            return;
          }

          terminal = null;
          terminalSessionId = null;

          if (
            !shuttingDown &&
            ws.readyState === WebSocket.OPEN
          ) {
            try {
              ws.send(
                JSON.stringify({
                  type: "info",
                  data:
                    `\r\nTerminal exited (${exitCode}).\r\n`,
                })
              );
            } catch (error) {
              console.error(
                "Failed to send PTY exit message:",
                error
              );
            }
          }
        }
      );

      return newTerminal;
    };

    /* =========================================
       WEBSOCKET MESSAGE
    ========================================== */

    ws.on("message", (message) => {
      if (shuttingDown) {
        return;
      }

      try {
        const rawMessage =
          message.toString();

        console.log(
          "WebSocket message:",
          rawMessage
        );

        const data =
          JSON.parse(rawMessage);

        /* =====================================
           TERMINAL INPUT
        ====================================== */

        if (data.type === "input") {
          if (
            typeof data.data !== "string"
          ) {
            return;
          }

          const pty = ensureTerminal(
            data.sessionId
          );

          if (!pty) {
            return;
          }

          if (
            shuttingDown ||
            terminal !== pty
          ) {
            return;
          }

          try {
            pty.write(data.data);
          } catch (error) {
            if (!shuttingDown) {
              console.error(
                "PTY write error:",
                error
              );
            }
          }

          return;
        }

        /* =====================================
           TERMINAL RESIZE
        ====================================== */

        if (data.type === "resize") {
          const pty = ensureTerminal(
            data.sessionId
          );

          if (!pty) {
            return;
          }

          const cols = Number(data.cols);
          const rows = Number(data.rows);

          if (
            !Number.isInteger(cols) ||
            !Number.isInteger(rows) ||
            cols <= 0 ||
            rows <= 0
          ) {
            return;
          }

          if (
            shuttingDown ||
            terminal !== pty
          ) {
            return;
          }

          try {
            pty.resize(cols, rows);
          } catch (error) {
            if (!shuttingDown) {
              console.error(
                "PTY resize error:",
                error
              );
            }
          }

          return;
        }

        console.log(
          "Unknown WebSocket message type:",
          data.type
        );
      } catch (error) {
        if (shuttingDown) {
          return;
        }

        console.error(
          "WebSocket message error:",
          error
        );

        send({
          type: "error",
          data:
            `Server error: ${error.message}\r\n`,
        });
      }
    });

    /* =========================================
       CLIENT DISCONNECTED
    ========================================== */

    ws.on("close", () => {
      console.log("Client disconnected");

      /*
       * Invalidate the socket BEFORE touching
       * the PTY.
       */
      shuttingDown = true;

      destroyTerminal();
    });

    /* =========================================
       CLIENT ERROR
    ========================================== */

    ws.on("error", (error) => {
      console.error(
        "WebSocket error:",
        error.message
      );
    });
  });
};

module.exports = {
  setupWebSocket,
};