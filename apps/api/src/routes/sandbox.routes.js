const express = require("express");
const router = express.Router();

const {
  startSandbox,
  getSandboxById,
  updateStatus,
  removeSandbox,
} = require("../controllers/sandbox.controller");

router.post("/sandbox/create", startSandbox);

router.get("/sandbox/:sessionId", getSandboxById);

router.patch("/sandbox/:sessionId/status", updateStatus);

router.delete("/sandbox/:sessionId", removeSandbox);

module.exports = router;