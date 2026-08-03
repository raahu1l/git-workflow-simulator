const express = require("express");

const {
  validateSession,
} = require("../controllers/session.controller");

const router = express.Router();

router.post("/:sessionId/validate", validateSession);

module.exports = router;