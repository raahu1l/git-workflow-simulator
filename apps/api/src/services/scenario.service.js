const fs = require("fs");
const path = require("path");

const scenariosPath = path.join(
  __dirname,
  "../../scenarios"
);

/* =========================================
   FIND SCENARIO DIRECTORY
========================================= */

const getScenarioDirectory = (id) => {
  const categories = fs
    .readdirSync(scenariosPath, {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory());

  for (const category of categories) {
    const scenarioDirectory = path.join(
      scenariosPath,
      category.name,
      id
    );

    if (
      fs.existsSync(scenarioDirectory) &&
      fs.statSync(scenarioDirectory).isDirectory()
    ) {
      return scenarioDirectory;
    }
  }

  return null;
};

/* =========================================
   GET ALL SCENARIOS
========================================= */

const getAllScenarios = () => {
  const categories = fs
    .readdirSync(scenariosPath, {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory());

  const scenarios = [];

  for (const category of categories) {
    const categoryPath = path.join(
      scenariosPath,
      category.name
    );

    const scenarioFolders = fs
      .readdirSync(categoryPath, {
        withFileTypes: true,
      })
      .filter((entry) => entry.isDirectory());

    for (const scenarioFolder of scenarioFolders) {
      const scenarioFile = path.join(
        categoryPath,
        scenarioFolder.name,
        "scenario.json"
      );

      if (!fs.existsSync(scenarioFile)) {
        continue;
      }

      const scenarioData = fs.readFileSync(
        scenarioFile,
        "utf-8"
      );

      const scenario = JSON.parse(
        scenarioData
      );

      scenarios.push({
        ...scenario,
        category: category.name,
      });
    }
  }

  return scenarios;
};

/* =========================================
   GET SCENARIO BY ID
========================================= */

const getScenarioById = (id) => {
  const scenarioDirectory =
    getScenarioDirectory(id);

  if (!scenarioDirectory) {
    return null;
  }

  const scenarioFile = path.join(
    scenarioDirectory,
    "scenario.json"
  );

  if (!fs.existsSync(scenarioFile)) {
    return null;
  }

  const scenarioData = fs.readFileSync(
    scenarioFile,
    "utf-8"
  );

  return JSON.parse(scenarioData);
};

/* =========================================
   START SCENARIO
========================================= */

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
  getScenarioDirectory,
  startScenario,
};