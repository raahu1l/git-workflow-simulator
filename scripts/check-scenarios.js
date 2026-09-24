const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const scenariosRoot = path.resolve(
  __dirname,
  "../apps/api/scenarios"
);

const errors = [];
const warnings = [];
const declaredIds = new Map();
const effectiveIds = new Set();
let scenarioCount = 0;

const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const scenarioDirectory = path.join(
      directory,
      entry.name
    );
    const scenarioFile = path.join(
      scenarioDirectory,
      "scenario.json"
    );

    if (!fs.existsSync(scenarioFile)) {
      walk(scenarioDirectory);
      continue;
    }

    scenarioCount += 1;

    for (const fileName of [
      "scenario.json",
      "setup.sh",
      "validate.js",
    ]) {
      if (!fs.existsSync(path.join(scenarioDirectory, fileName))) {
        errors.push(
          `${scenarioDirectory}: missing ${fileName}`
        );
      }
    }

    let scenario;

    try {
      scenario = JSON.parse(
        fs.readFileSync(scenarioFile, "utf8")
      );
    } catch (error) {
      errors.push(
        `${scenarioFile}: invalid JSON (${error.message})`
      );
      continue;
    }

    if (
      typeof scenario.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenario.id)
    ) {
      errors.push(
        `${scenarioFile}: id must be kebab-case`
      );
    }

    if (!scenario.title || !scenario.objective) {
      errors.push(
        `${scenarioFile}: title and objective are required`
      );
    }

    if (!Array.isArray(scenario.whatToDo) ||
        scenario.whatToDo.length === 0) {
      errors.push(
        `${scenarioFile}: whatToDo must contain at least one item`
      );
    }

    if (!scenario.alex?.intro || !scenario.alex?.failure ||
        !scenario.alex?.success) {
      errors.push(
        `${scenarioFile}: alex intro, success, and failure are required`
      );
    }

    if (declaredIds.has(scenario.id)) {
      warnings.push(
        `Duplicate declared id '${scenario.id}': ${declaredIds.get(scenario.id)} and ${scenarioFile}. The runtime uses the folder name for this duplicate.`
      );
    } else {
      declaredIds.set(scenario.id, scenarioFile);
    }

    const effectiveId = declaredIds.has(scenario.id) &&
      declaredIds.get(scenario.id) !== scenarioFile
      ? entry.name
      : scenario.id;

    if (effectiveIds.has(effectiveId)) {
      errors.push(
        `${scenarioFile}: duplicate effective id '${effectiveId}'`
      );
    }

    effectiveIds.add(effectiveId);

    const syntax = spawnSync(
      process.execPath,
      ["--check", path.join(scenarioDirectory, "validate.js")],
      { encoding: "utf8" }
    );

    if (syntax.status !== 0) {
      errors.push(
        `${scenarioDirectory}/validate.js: syntax check failed\n${syntax.stderr.trim()}`
      );
    }
  }
};

walk(scenariosRoot);

console.log(`Checked ${scenarioCount} scenarios.`);

for (const warning of warnings) {
  console.warn(`WARNING: ${warning}`);
}

if (errors.length > 0) {
  console.error("Scenario contract failures:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Scenario contract check passed.");
