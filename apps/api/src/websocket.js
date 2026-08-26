const WebSocket = require("ws");

const { execFile } = require("child_process");

const {
  getSandbox,
} = require("./services/sandbox.service");

const {
  startTerminal,
} = require("./services/docker.service");

const {
  recordSandboxAction,
} = require("./services/sandbox.service");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    let terminal = null;
    let terminalSessionId = null;
    let shuttingDown = false;

    /*
     * =========================================
     * COMMAND BUFFER
     * =========================================
     *
     * Stores what the learner is typing until
     * Enter is pressed.
     *
     * This is intentionally generic.
     * The WebSocket layer does NOT know anything
     * about Git or individual scenarios.
     */
    let commandBuffer = "";

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
       RECORD SUBMITTED COMMAND
    ========================================== */

    const recordSubmittedCommand = (
      sessionId
    ) => {
      const command = commandBuffer.trim();

      commandBuffer = "";

      if (!command) {
        return;
      }

      /*
       * Ignore terminal escape sequences or
       * other non-command input.
       *
       * We only record normal submitted text.
       */
      const cleanedCommand = command
        .replace(
          /\x1b\[[0-9;?]*[ -/]*[@-~]/g,
          ""
        )
        .trim();

      if (!cleanedCommand) {
        return;
      }

      console.log(
        `Learner command [${sessionId}]: ${cleanedCommand}`
      );

      recordSandboxAction(
        sessionId,
        cleanedCommand
      );
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

      terminal = null;
      terminalSessionId = null;

      /*
       * Clear command state when the terminal
       * itself is destroyed.
       */
      commandBuffer = "";

      /*
       * Windows:
       * terminate process tree directly.
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
          (error) => {
            if (error) {
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
       * Linux/macOS
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
       * Reuse terminal for same session.
       */
      if (
        terminal &&
        terminalSessionId === sessionId
      ) {
        return terminal;
      }

      /*
       * One terminal per WebSocket.
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

      /*
       * Fresh terminal means fresh input buffer.
       */
      commandBuffer = "";

      /* =========================================
         PTY OUTPUT → WEBSOCKET
      ========================================== */

      newTerminal.onData((output) => {
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

          if (terminal !== newTerminal) {
            return;
          }

          terminal = null;
          terminalSessionId = null;
          commandBuffer = "";

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

          /*
           * =====================================
           * GENERIC COMMAND TRACKING
           * =====================================
           *
           * Record the command when Enter is
           * pressed.
           *
           * We don't record every keystroke.
           */

          const input = data.data;

          /*
           * Ctrl+C:
           * cancel the current command buffer.
           */
          if (input.includes("\u0003")) {
            commandBuffer = "";
          }

          /*
           * Backspace.
           */
          if (
            input.includes("\u007f") ||
            input.includes("\b")
          ) {
            commandBuffer =
              commandBuffer.slice(
                0,
                -1
              );
          }

          /*
           * Add normal printable characters.
           *
           * Ignore escape sequences used by
           * arrows/function keys.
           */
          const printable = input
            .replace(
              /\x1b\[[0-9;?]*[ -/]*[@-~]/g,
              ""
            )
            .replace(
              /[\r\n\u0003\u007f\b]/g,
              ""
            );

          if (printable) {
            commandBuffer += printable;
          }

          /*
           * Enter submits the command.
           */
          if (
            input.includes("\r") ||
            input.includes("\n")
          ) {
            recordSubmittedCommand(
              data.sessionId
            );
          }

          try {
            pty.write(input);
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

          const cols = Number(
            data.cols
          );

          const rows = Number(
            data.rows
          );

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
      console.log(
        "Client disconnected"
      );

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