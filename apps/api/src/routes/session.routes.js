const express = require("express");

const {
  validateSession,
  getSession,
  resetSession,
} = require("../controllers/session.controller");

const router = express.Router();

router.get(
  "/:sessionId",
  getSession
);

router.post(
  "/:sessionId/validate",
  validateSession
);

router.post(
  "/:sessionId/reset",
  resetSession
);

module.exports = router;