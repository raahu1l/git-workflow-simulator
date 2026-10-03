# Security Policy

## Supported versions

Only the latest default branch is supported. This project runs learner commands inside Docker; do not expose the Docker socket or API directly to untrusted networks without authentication and a reverse proxy.

## Report a vulnerability

Do not open a public issue for a security vulnerability. Contact the repository maintainer privately through the security contact listed in the repository profile with:

- a description of the issue;
- affected files or endpoints;
- reproduction steps;
- impact and suggested mitigation, if known.

Do not include passwords, tokens, or private learner data in a report.

Please allow time for investigation and a fix before public disclosure.

For local deployments, set `CORS_ORIGIN` to the exact web origin, keep `.env` files out of version control, and do not share session URLs while they are active.
