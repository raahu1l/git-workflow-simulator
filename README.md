# Git Workflow Simulator

Git Workflow Simulator is an open-source practice environment for learning Git through realistic terminal scenarios. Each scenario runs in its own Docker sandbox and is validated by repository state, not by matching typed commands.

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop or Docker Engine
- Git

## Run locally

```bash
npm install
docker build -t git-sandbox docker
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
npm run dev:api
npm run dev:web
```

Open `http://localhost:3000`.

On macOS/Linux, replace `copy` with `cp`.

## Checks

```bash
npm run check:scenarios
npm run check:syntax --workspace @git-workflow-simulator/api
npm run lint:web
npm run build:web
```

Scenario setup scripts require Docker. Run the API and frontend in separate terminals during development.

## Add a scenario

Add one folder under `apps/api/scenarios/<category>/<scenario-id>/` containing exactly:

- `scenario.json`: metadata, instructions, hints, and Alex reactions.
- `setup.sh`: creates a clean learner repository in `/workspace`.
- `validate.js`: checks repository state and returns `{ success, progress, message }`.

Keep scenario IDs unique, use kebab-case, leave `/scenarios` read-only, and never store learner-specific state in the scenario folder. Run `npm run check:scenarios` before opening a pull request.

## Architecture

- `apps/api`: Express API, Docker sandbox lifecycle, WebSocket terminal, and scenario validation.
- `apps/web`: Next.js interface, scenario library, terminal, and progress reactions.
- `docker`: reusable sandbox image.
- `scripts`: repository checks used locally and in CI.

## Contributions

Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a change. Security issues should follow [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
