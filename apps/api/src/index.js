const express = require("express");
const healthRoutes = require("./routes/health.routes");
const scenarioRoutes = require("./routes/scenario.routes");

const app = express();

app.use("/api", healthRoutes);
app.use("/api", scenarioRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});