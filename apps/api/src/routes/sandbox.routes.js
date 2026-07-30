const express = require("express");
const router = express.Router();

const { startSandbox } = require("../controllers/sandbox.controller");

router.post("/sandbox/create", startSandbox);

module.exports = router;