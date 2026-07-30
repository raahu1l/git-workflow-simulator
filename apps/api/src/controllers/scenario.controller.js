const { getAllScenarios } = require("../services/scenario.service");

const getScenarios = (req, res) => {
  const scenarios = getAllScenarios();

  res.json(scenarios);
};

module.exports = {
  getScenarios,
};