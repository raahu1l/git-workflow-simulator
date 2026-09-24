const path = require("path");

const getPositiveInteger = (value, fallback) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
};

const apiPort = getPositiveInteger(
  process.env.PORT,
  5000
);

module.exports = {
  apiPort,
  apiHost: process.env.HOST || "0.0.0.0",
  corsOrigin: process.env.CORS_ORIGIN || true,
  dockerImage:
    process.env.DOCKER_IMAGE || "git-sandbox",
  sessionTtlMs: getPositiveInteger(
    process.env.SESSION_TTL_MS,
    30 * 60 * 1000
  ),
  maxWebSocketMessageBytes: getPositiveInteger(
    process.env.MAX_WEBSOCKET_MESSAGE_BYTES,
    64 * 1024
  ),
  scenariosPath: path.resolve(
    __dirname,
    "../scenarios"
  ),
};
