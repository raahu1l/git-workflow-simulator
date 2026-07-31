const express = require("express");
const router = express.Router();

const {
  listScenarios,
  getScenario,
} = require("../controllers/scenario.controller");

router.get("/scenarios", listScenarios);

router.get("/scenarios/:id", getScenario);

module.exports = router;