"use client";

import { useEffect, useRef } from "react";

import "xterm/css/xterm.css";

export default function Terminal({
  sessionId,
  resetting = false,
}) {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const terminalInstanceRef = useRef(null);

  useEffect(() => {
    let terminal = null;
    let socket = null;
    let resizeObserver = null;
    let dataDisposable = null;

    let destroyed = false;
    let shuttingDown = false;

    const init = async () => {
      const { Terminal: XTerm } =
        await import("xterm");

      const { FitAddon } =
        await import("xterm-addon-fit");

      if (
        destroyed ||
        !terminalRef.current
      ) {
        return;
      }

      terminal = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        lineHeight: 1.2,
        scrollback: 1000,
        convertEol: false,
        theme: {
          background: "#0d1117",
          foreground: "#f0f6fc",
          cursor: "#f0f6fc",
        },
        cursorStyle: "block",
      });

      const fitAddon = new FitAddon();

      terminal.loadAddon(fitAddon);

      terminal.open(terminalRef.current);

      if (destroyed) {
        terminal.dispose();
        terminal = null;
        return;
      }

      terminalInstanceRef.current = terminal;

      /*
       * During reset, create only the visual terminal.
       *
       * Do NOT create a WebSocket or PTY yet.
       */
      if (resetting) {
        terminal.clear();

        terminal.writeln(
          "\x1b[36mResetting workspace...\x1b[0m"
        );

        terminal.writeln(
          "\x1b[90mPreparing a fresh scenario.\x1b[0m"
        );

        return;
      }

      requestAnimationFrame(() => {
        if (
          !destroyed &&
          !shuttingDown &&
          terminal
        ) {
          terminal.focus();
        }
      });

      /* =========================================
         TERMINAL SIZE
      ========================================== */

      const fitTerminal = () => {
        if (
          destroyed ||
          shuttingDown ||
          !terminal ||
          !socket ||
          socket.readyState !==
            WebSocket.OPEN
        ) {
          return;
        }

        try {
          fitAddon.fit();

          socket.send(
            JSON.stringify({
              type: "resize",
              sessionId,
              cols: terminal.cols,
              rows: terminal.rows,
            })
          );
        } catch (error) {
          if (!shuttingDown) {
            console.error(
              "Terminal resize error:",
              error
            );
          }
        }
      };

      /* =========================================
         WEBSOCKET
      ========================================== */

      socket = new WebSocket(
        "ws://localhost:5000"
      );

      socketRef.current = socket;

      socket.onopen = () => {
        if (
          destroyed ||
          shuttingDown
        ) {
          return;
        }

        terminal?.writeln(
          "Connecting..."
        );

        requestAnimationFrame(() => {
          if (
            !destroyed &&
            !shuttingDown &&
            terminal
          ) {
            terminal.focus();
          }

          fitTerminal();
        });
      };

      socket.onmessage = (event) => {
        if (
          destroyed ||
          shuttingDown ||
          !terminal
        ) {
          return;
        }

        try {
          const message =
            JSON.parse(event.data);

          switch (message.type) {
            case "info":
            case "output":
            case "error":
              terminal.write(
                message.data
              );
              break;

            default:
              console.log(
                "Unknown terminal message:",
                message
              );
          }
        } catch (error) {
          if (!shuttingDown) {
            console.error(
              "Failed to parse terminal message:",
              error
            );
          }
        }
      };

      socket.onerror = () => {
        if (
          !destroyed &&
          !shuttingDown &&
          terminal
        ) {
          terminal.writeln(
            "\r\nWebSocket Error"
          );
        }
      };

      socket.onclose = () => {
        if (
          !destroyed &&
          !shuttingDown &&
          terminal
        ) {
          terminal.writeln(
            "\r\nDisconnected"
          );
        }
      };

      /* =========================================
         TERMINAL INPUT
      ========================================== */

      dataDisposable =
        terminal.onData((data) => {
          if (
            destroyed ||
            shuttingDown ||
            resetting ||
            !socket ||
            socket.readyState !==
              WebSocket.OPEN
          ) {
            return;
          }

          try {
            socket.send(
              JSON.stringify({
                type: "input",
                sessionId,
                data,
              })
            );
          } catch (error) {
            if (!shuttingDown) {
              console.error(
                "Terminal input error:",
                error
              );
            }
          }
        });

      /* =========================================
         RESIZE OBSERVER
      ========================================== */

      if (
        !destroyed &&
        terminalRef.current
      ) {
        resizeObserver =
          new ResizeObserver(() => {
            if (
              destroyed ||
              shuttingDown
            ) {
              return;
            }

            requestAnimationFrame(() => {
              fitTerminal();
            });
          });

        resizeObserver.observe(
          terminalRef.current
        );
      }

      /* =========================================
         INITIAL FIT
      ========================================== */

      requestAnimationFrame(() => {
        if (
          !destroyed &&
          !shuttingDown &&
          terminal
        ) {
          fitTerminal();
          terminal.focus();
        }
      });
    };

    init();

    /* =========================================
       CLEANUP
    ========================================== */

    return () => {
      destroyed = true;
      shuttingDown = true;

      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      if (dataDisposable) {
        try {
          dataDisposable.dispose();
        } catch (error) {
          console.error(
            "Failed to dispose terminal input:",
            error
          );
        }

        dataDisposable = null;
      }

      const oldSocket = socket;

      socket = null;

      if (
        socketRef.current ===
        oldSocket
      ) {
        socketRef.current = null;
      }

      if (oldSocket) {
        try {
          oldSocket.onopen = null;
          oldSocket.onmessage = null;
          oldSocket.onerror = null;
          oldSocket.onclose = null;

          if (
            oldSocket.readyState ===
            WebSocket.OPEN
          ) {
            oldSocket.close(
              1000,
              "Terminal reset"
            );
          }
        } catch (error) {
          console.error(
            "Failed to close terminal socket:",
            error
          );
        }
      }

      if (terminal) {
        try {
          terminal.dispose();
        } catch (error) {
          console.error(
            "Failed to dispose terminal:",
            error
          );
        }

        terminal = null;
      }

      terminalInstanceRef.current =
        null;
    };
  }, [sessionId, resetting]);

  return (
    <div
      ref={terminalRef}
      onClick={() => {
        if (!resetting) {
          terminalInstanceRef.current?.focus();
        }
      }}
      className="relative h-full w-full overflow-hidden bg-[#0d1117] p-2"
    />
  );
}