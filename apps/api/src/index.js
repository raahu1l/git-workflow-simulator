const express = require("express");

const healthRoutes = require("./routes/health.routes");
const scenarioRoutes = require("./routes/scenario.routes");
const sandboxRoutes = require("./routes/sandbox.routes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api", healthRoutes);
app.use("/api", scenarioRoutes);
app.use("/api", sandboxRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});