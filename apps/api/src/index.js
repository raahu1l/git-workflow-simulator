const express = require("express");
const http = require("http");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const scenarioRoutes = require("./routes/scenario.routes");
const sessionRoutes = require("./routes/session.routes");

const { setupWebSocket } = require("./websocket");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", scenarioRoutes);
app.use("/api/sessions", sessionRoutes);

const server = http.createServer(app);

setupWebSocket(server);

const PORT = 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});