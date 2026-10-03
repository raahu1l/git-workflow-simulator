# Contributing

Thank you for helping improve Git Workflow Simulator. Scenario additions are the preferred contribution; documentation and focused bug fixes are welcome too.

## Before you start

Install Node.js 20+, npm, Git, and Docker. Fork and clone the repository, then run:

```bash
npm ci
docker build -t git-sandbox docker
```

Create local environment files from `apps/api/.env.example` and `apps/web/.env.example`, then run the API and web app in separate terminals with `npm run dev:api` and `npm run dev:web`.

## Add a scenario

Create `apps/api/scenarios/<category>/<scenario-id>/` with exactly:

1. `scenario.json`: metadata, `whatToDo`, hints, and Alex reactions.
2. `setup.sh`: a repeatable script that creates the initial Git repository in `/workspace`.
3. `validate.js`: a repeatable validator that reads Git state and returns `success`, `progress`, and `message`.

Use a unique kebab-case ID and matching folder name. Match `whatToDo[].id` values with `alex.situations` keys. Do not write state into `/scenarios` or modify shared application architecture.

Run:

```bash
npm run check:scenarios
npm run test:scenario-setups
```

The repository currently contains one legacy duplicate metadata ID. The checker reports it as a warning and the runtime uses the folder name to keep exposed IDs unique. New scenarios must not add duplicates.

## Code and documentation changes

- Keep changes focused and consistent with the existing architecture.
- Do not commit `.env` files, credentials, build output, or `node_modules`.
- Update documentation when behavior or setup changes.
- Run the relevant checks before opening a pull request.

## Pull requests

Create a focused branch, explain the Git concept or bug being addressed, and include the checks you ran. For scenario changes, describe the intended learner workflow and the commands needed to complete it. Keep unrelated formatting or dependency changes out of the pull request.

Maintainers may request revisions for correctness, clarity, accessibility, or consistency with the scenario contract.
