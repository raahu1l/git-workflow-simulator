const express = require("express");
const http = require("http");

const healthRoutes = require("./routes/health.routes");
const scenarioRoutes = require("./routes/scenario.routes");
const sandboxRoutes = require("./routes/sandbox.routes");
const sessionRoutes = require("./routes/session.routes");

const { setupWebSocket } = require("./websocket");

const app = express();

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", scenarioRoutes);
app.use("/api", sandboxRoutes);
app.use("/api/sessions", sessionRoutes);

const server = http.createServer(app);

setupWebSocket(server);

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});