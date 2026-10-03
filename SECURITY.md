# Security Policy

## Supported versions

This project does not currently publish versioned releases. Security fixes are made against the latest default branch.

## Reporting a vulnerability

Do not report sensitive vulnerabilities in a public issue. Use GitHub's private vulnerability reporting or Security Advisories for this repository if available. Otherwise, contact the maintainer privately through the GitHub profile.

## What to include

Provide a description, affected component, reproduction steps, impact, and relevant logs or screenshots that do not contain secrets.

## Response

The maintainer will review the report, clarify details when needed, and coordinate a fix or mitigation before public disclosure where practical. No response time is guaranteed.

## Deployment considerations

Learner commands run inside Docker containers. Container isolation is an important control but is not a perfect security boundary. Deployments should restrict Docker access, apply resource and network controls, use HTTPS, set `CORS_ORIGIN` to the exact web origin, and keep session URLs private. Scenario scripts are project-controlled code and should be reviewed before accepting contributions.
