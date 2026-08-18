const express = require("express");

const {
  validateSession,
  getProgress,
} = require("../controllers/session.controller");

const router = express.Router();

router.post("/:sessionId/validate", validateSession);
router.get("/:sessionId/progress", getProgress);

module.exports = router;