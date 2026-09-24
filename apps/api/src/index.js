const express = require("express");
const http = require("http");
const cors = require("cors");

const {
  apiHost,
  apiPort,
  corsOrigin,
} = require("./config");

const healthRoutes = require("./routes/health.routes");
const scenarioRoutes = require("./routes/scenario.routes");
const sessionRoutes = require("./routes/session.routes");

const { setupWebSocket } = require("./websocket");

const {
  getAllSandboxes,
  deleteSandbox,
} = require("./services/sandbox.service");

const {
  destroyContainer,
} = require("./services/docker.service");

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", scenarioRoutes);
app.use("/api/sessions", sessionRoutes);

const server = http.createServer(app);

setupWebSocket(server);

const cleanupExpiredSessions = async () => {
  const now = Date.now();

  for (const sandbox of getAllSandboxes()) {
    if (
      Date.parse(sandbox.expiresAt) > now
    ) {
      continue;
    }

    await destroyContainer(
      sandbox.containerId
    );
    deleteSandbox(sandbox.sessionId);
  }
};

const cleanupInterval = setInterval(
  cleanupExpiredSessions,
  60 * 1000
);

const shutdown = async () => {
  clearInterval(cleanupInterval);

  await Promise.all(
    getAllSandboxes().map((sandbox) =>
      destroyContainer(sandbox.containerId)
    )
  );

  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(apiPort, apiHost, () => {
  console.log(
    `Server running on ${apiHost}:${apiPort}`
  );
});