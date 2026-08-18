const express = require("express");

const {
  validateSession,
  getProgress,
  getSession,
} = require("../controllers/session.controller");

const router = express.Router();

router.get("/:sessionId", getSession);

router.post("/:sessionId/validate", validateSession);

router.get("/:sessionId/progress", getProgress);

module.exports = router;