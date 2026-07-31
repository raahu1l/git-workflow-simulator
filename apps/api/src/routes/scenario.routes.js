const express = require("express");
const router = express.Router();

const {
  listScenarios,
  getScenario,
  startScenarioById,
} = require("../controllers/scenario.controller");

router.get("/scenarios", listScenarios);

router.get("/scenarios/:id", getScenario);

router.post("/scenarios/:id/start", startScenarioById);

module.exports = router;