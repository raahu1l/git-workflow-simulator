const fs = require("fs");
const path = require("path");

const scenariosPath = path.join(__dirname, "../../scenarios");

const getAllScenarios = () => {
  const scenarioFolders = fs.readdirSync(scenariosPath);

  const scenarios = scenarioFolders.map((folder) => {
    const scenarioFile = path.join(
      scenariosPath,
      folder,
      "scenario.json"
    );

    const scenarioData = fs.readFileSync(scenarioFile, "utf-8");

    return JSON.parse(scenarioData);
  });

  return scenarios;
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

module.exports = {
  getAllScenarios,
  getScenarioById,
};