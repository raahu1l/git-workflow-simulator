const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const scenariosRoot = path.join(
  root,
  "apps",
  "api",
  "scenarios"
);

const scenarioDirectories = [];

const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const child = path.join(directory, entry.name);

    if (fs.existsSync(path.join(child, "setup.sh"))) {
      scenarioDirectories.push(child);
      continue;
    }

    walk(child);
  }
};

walk(scenariosRoot);

let failures = 0;

for (const directory of scenarioDirectories) {
  const relative = path
    .relative(scenariosRoot, directory)
    .split(path.sep)
    .join("/");
  const container = spawnSync(
    "docker",
    [
      "run",
      "-d",
      "--rm",
      "-v",
      `${scenariosRoot}:/scenarios:ro`,
      "git-sandbox",
    ],
    { encoding: "utf8" }
  );

  if (container.status !== 0) {
    console.error(`${relative}: container creation failed`);
    console.error(container.stderr.trim());
    failures += 1;
    continue;
  }

  const containerId = container.stdout.trim();
  const setup = spawnSync(
    "docker",
    [
      "exec",
      containerId,
      "bash",
      `/scenarios/${relative}/setup.sh`,
    ],
    { encoding: "utf8" }
  );

  spawnSync("docker", ["rm", "-f", containerId], {
    stdio: "ignore",
  });

  if (setup.status !== 0) {
    console.error(`${relative}: FAIL`);
    console.error(
      (setup.stderr || setup.stdout).trim()
    );
    failures += 1;
  } else {
    console.log(`${relative}: PASS`);
  }
}

console.log(
  `Checked ${scenarioDirectories.length} scenario setup scripts.`
);

if (failures > 0) {
  process.exit(1);
}
