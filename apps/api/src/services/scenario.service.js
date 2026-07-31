const fs = require("fs");
const path = require("path");

const scenariosPath = path.join(__dirname, "../../scenarios");

const getAllScenarios = () => {
  const scenarioFolders = fs.readdirSync(scenariosPath);

  return scenarioFolders.map((folder) => {
    const scenarioFile = path.join(
      scenariosPath,
      folder,
      "scenario.json"
    );

    const scenarioData = fs.readFileSync(scenarioFile, "utf-8");

    return JSON.parse(scenarioData);
  });
};

const getScenarioById = (id) => {
  const scenarioFile = path.join(
    scenariosPath,
    id,
    "scenario.json"
  );

  if (!fs.existsSync(scenarioFile)) {
    return null;
  }

  const scenarioData = fs.readFileSync(scenarioFile, "utf-8");

  return JSON.parse(scenarioData);
};

const startScenario = (id) => {
  const scenario = getScenarioById(id);

  if (!scenario) {
    return null;
  }

  return scenario;
};

module.exports = {
  getAllScenarios,
  getScenarioById,
  startScenario,
};