"use client";

import { useEffect, useRef } from "react";
import "xterm/css/xterm.css";

export default function Terminal() {
  const terminalRef = useRef(null);

  useEffect(() => {
    let terminal;

    const initTerminal = async () => {
      const { Terminal: XTerm } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");

      terminal = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#0d1117",
        },
      });

      const fitAddon = new FitAddon();

      terminal.loadAddon(fitAddon);

      terminal.open(terminalRef.current);

      fitAddon.fit();

      terminal.writeln("Welcome to Git Workflow Simulator");
      terminal.writeln("");
      terminal.write("rahul@git-lab:/workspace$ ");
    };

    initTerminal();

    return () => {
      if (terminal) {
        terminal.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        width: "100%",
        height: "500px",
      }}
    />
  );
}