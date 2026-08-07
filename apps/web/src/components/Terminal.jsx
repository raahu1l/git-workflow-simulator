"use client";

import { useEffect, useRef } from "react";
import "xterm/css/xterm.css";

export default function Terminal({ sessionId }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    let terminal;
    let socket;

    const init = async () => {
      const { Terminal: XTerm } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");

      terminal = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#0d1117",
          foreground: "#ffffff",
        },
      });

      const fitAddon = new FitAddon();

      terminal.loadAddon(fitAddon);
      terminal.open(terminalRef.current);
      fitAddon.fit();

      socket = new WebSocket("ws://localhost:5000");

      socket.onopen = () => {
        terminal.writeln("Connecting...");
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "info":
          case "output":
          case "error":
            terminal.write(message.data);
            break;

          default:
            console.log(message);
        }
      };

      socket.onerror = () => {
        terminal.writeln("\r\nWebSocket Error");
      };

      socket.onclose = () => {
        terminal.writeln("\r\nDisconnected");
      };

      let currentLine = "";

      terminal.onData((data) => {
        // Enter
        if (data === "\r") {
          terminal.write("\r\n");

          if (currentLine.trim() !== "") {
            socket.send(
              JSON.stringify({
                type: "command",
                sessionId,
                command: currentLine,
              })
            );
          }

          currentLine = "";
          return;
        }

        // Backspace
        if (data === "\u007f") {
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            terminal.write("\b \b");
          }
          return;
        }

        currentLine += data;
        terminal.write(data);
      });
    };

    init();

    return () => {
      if (terminal) terminal.dispose();
      if (socket) socket.close();
    };
  }, [sessionId]);

  return (
    <div
      ref={terminalRef}
      style={{
        width: "100%",
        height: "500px",
        background: "#0d1117",
      }}
    />
  );
}