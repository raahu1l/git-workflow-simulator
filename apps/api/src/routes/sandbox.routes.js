const express = require("express");
const router = express.Router();

const {
  startSandbox,
  getSandboxById,
} = require("../controllers/sandbox.controller");

router.post("/sandbox/create", startSandbox);

router.get("/sandbox/:sessionId", getSandboxById);

module.exports = router;