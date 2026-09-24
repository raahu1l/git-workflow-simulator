const fs = require("fs");
const path = require("path");

const {
  scenariosPath,
} = require("../config");

const getScenarioEntries = () => {
  const entries = [];

  for (const category of fs
    .readdirSync(scenariosPath, {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory())) {
    const categoryPath = path.join(
      scenariosPath,
      category.name
    );

    for (const scenarioFolder of fs
      .readdirSync(categoryPath, {
        withFileTypes: true,
      })
      .filter((entry) => entry.isDirectory())) {
      const directory = path.join(
        categoryPath,
        scenarioFolder.name
      );
      const file = path.join(
        directory,
        "scenario.json"
      );

      if (!fs.existsSync(file)) {
        continue;
      }

      try {
        const scenario = JSON.parse(
          fs.readFileSync(file, "utf-8")
        );

        entries.push({
          category: category.name,
          directory,
          folderName: scenarioFolder.name,
          scenario,
        });
      } catch (error) {
        console.error(
          `Unable to load scenario ${file}:`,
          error.message
        );
      }
    }
  }

  return entries;
};

const getEffectiveScenarioIds = (entries) => {
  const counts = new Map();

  for (const entry of entries) {
    const id = entry.scenario.id;
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  return entries.map((entry) => ({
    ...entry,
    id:
      counts.get(entry.scenario.id) === 1
        ? entry.scenario.id
        : entry.folderName,
  }));
};

/* =========================================
   FIND SCENARIO DIRECTORY
========================================= */

const getScenarioDirectory = (id) => {
  const entry = getEffectiveScenarioIds(
    getScenarioEntries()
  ).find((candidate) =>
    candidate.id === id ||
    candidate.scenario.id === id
  );

  return entry?.directory || null;
};

/* =========================================
   GET ALL SCENARIOS
========================================= */

const getAllScenarios = () => {
  return getEffectiveScenarioIds(
    getScenarioEntries()
  ).map((entry) => ({
    ...entry.scenario,
    id: entry.id,
    category: entry.category,
    createdAt: fs
      .statSync(entry.directory)
      .birthtime.toISOString(),
  }));
};

/* =========================================
   GET SCENARIO BY ID
========================================= */

const getScenarioById = (id) => {
  const entries = getEffectiveScenarioIds(
    getScenarioEntries()
  );
  const entry = entries.find((candidate) =>
    candidate.id === id ||
    candidate.scenario.id === id
  );

  const scenarioDirectory = entry?.directory;

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

  return {
    ...JSON.parse(scenarioData),
    id: entry.id,
  };
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