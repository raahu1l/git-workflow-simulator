const { getHealthStatus } = require("../services/health.service");

const getHealth = (req, res) => {
  const data = getHealthStatus();

  res.json(data);
};

module.exports = {
  getHealth,
};