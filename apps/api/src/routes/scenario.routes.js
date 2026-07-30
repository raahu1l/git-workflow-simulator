const express = require("express");
const { getScenarios } = require("../controllers/scenario.controller");

const router = express.Router();

router.get("/scenarios", getScenarios);

module.exports = router;