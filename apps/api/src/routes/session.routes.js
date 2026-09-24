const express = require("express");

const {
  validateSession,
  getSession,
  resetSession,
} = require("../controllers/session.controller");

const {
  authorizeSession,
} = require("../middleware/session-auth");

const router = express.Router();

router.get(
  "/:sessionId",
  authorizeSession,
  getSession
);

router.post(
  "/:sessionId/validate",
  authorizeSession,
  validateSession
);

router.post(
  "/:sessionId/reset",
  authorizeSession,
  resetSession
);

module.exports = router;