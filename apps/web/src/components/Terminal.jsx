"use client";

import { useEffect, useRef } from "react";
import "xterm/css/xterm.css";

export default function Terminal({ sessionId }) {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const terminalInstanceRef = useRef(null);

  useEffect(() => {
    let terminal;
    let socket;
    let resizeObserver;

    const init = async () => {
      const { Terminal: XTerm } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");

      if (!terminalRef.current) return;

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

      terminalInstanceRef.current = terminal;

      /* =========================================
         INITIAL TERMINAL SIZE
      ========================================== */

      const fitTerminal = () => {
        try {
          fitAddon.fit();

          if (
            socket &&
            socket.readyState === WebSocket.OPEN
          ) {
            socket.send(
              JSON.stringify({
                type: "resize",
                sessionId,
                cols: terminal.cols,
                rows: terminal.rows,
              })
            );
          }
        } catch (error) {
          console.error("Terminal resize error:", error);
        }
      };

      requestAnimationFrame(() => {
        fitTerminal();
      });

      /* =========================================
         RESIZE OBSERVER
      ========================================== */

      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          fitTerminal();
        });
      });

      resizeObserver.observe(terminalRef.current);

      /* =========================================
         WEBSOCKET
      ========================================== */

      socket = new WebSocket("ws://localhost:5000");

      socketRef.current = socket;

      socket.onopen = () => {
        terminal.writeln("Connecting...");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "info":
            case "output":
            case "error":
              terminal.write(message.data);
              break;

            default:
              console.log("Unknown terminal message:", message);
          }
        } catch (error) {
          console.error(
            "Failed to parse terminal message:",
            error
          );
        }
      };

      socket.onerror = () => {
        terminal.writeln("\r\nWebSocket Error");
      };

      socket.onclose = () => {
        terminal.writeln("\r\nDisconnected");
      };

      /* =========================================
         TERMINAL INPUT → WEBSOCKET
      ========================================== */

      terminal.onData((data) => {
        if (
          socket &&
          socket.readyState === WebSocket.OPEN
        ) {
          socket.send(
            JSON.stringify({
              type: "input",
              sessionId,
              data,
            })
          );
        }
      });
    };

    init();

    /* =========================================
       CLEANUP
    ========================================== */

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (socket) {
        socket.close();
      }

      if (terminal) {
        terminal.dispose();
      }

      socketRef.current = null;
      terminalInstanceRef.current = null;
    };
  }, [sessionId]);

  return (
    <div
      ref={terminalRef}
      className="h-full w-full overflow-hidden bg-[#0d1117] p-2"
    />
  );
}