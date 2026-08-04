const WebSocket = require("ws");

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({
    server,
  });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.send("Connected to Git Workflow Simulator!");

    ws.on("message", (message) => {
      console.log("Received:", message.toString());

      ws.send(`Echo: ${message}`);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

module.exports = {
  setupWebSocket,
};