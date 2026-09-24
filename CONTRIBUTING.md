# Contributing

## Scope

Scenario additions are the preferred contribution. Keep the existing API, web, and Docker architecture unchanged unless a separate issue explicitly requests an architectural change.

## Add a scenario

1. Create `apps/api/scenarios/<category>/<scenario-id>/`.
2. Add `scenario.json`, `setup.sh`, and `validate.js`.
3. Start from a clean `/workspace` in `setup.sh`.
4. Make `validate.js` verify the final repository state and return `success`, `progress`, and `message`.
5. Define matching `whatToDo` IDs and `alex.situations` keys.
6. Keep the scenario folder self-contained and do not write generated state into `/scenarios`.
7. Run the checks listed in the README.

## Pull requests

- Explain the Git skill being taught.
- Include the commands needed to solve the scenario in the pull request description.
- Confirm setup and validator checks pass.
- Keep unrelated formatting and dependency changes out of the pull request.

## Code changes

For changes outside scenarios, include a focused reason, a regression test or reproducible check, and the expected local commands. Do not commit `.env` files, credentials, build output, or `node_modules`.
