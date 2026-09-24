const {
  getSandbox,
} = require("../services/sandbox.service");

const getSessionToken = (req) =>
  req.get("x-session-token") ||
  req.query.token;

const authorizeSession = (req, res, next) => {
  const sandbox = getSandbox(
    req.params.sessionId
  );

  if (!sandbox) {
    return res.status(404).json({
      message: "Session not found",
    });
  }

  if (
    !getSessionToken(req) ||
    getSessionToken(req) !== sandbox.accessToken
  ) {
    return res.status(403).json({
      message: "Invalid session token",
    });
  }

  req.sandbox = sandbox;
  next();
};

module.exports = {
  authorizeSession,
  getSessionToken,
};
