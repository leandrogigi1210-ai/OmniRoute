# Security Policy

## Supported versions

Only the latest code on the default branch is currently supported. There are no published stable releases yet.

## Reporting a vulnerability

Do not publish exploitable vulnerability details in a public issue. Use GitHub's private vulnerability reporting feature for this repository if enabled. Otherwise, contact the maintainer privately through GitHub.

Include the affected commit, impact, and safe reproduction steps. Redact credentials and personal data.

## Security notes

- Keep provider keys in environment variables or a secret manager.
- Keep `.env` out of version control.
- Rotate credentials if they may have been exposed.
- Do not expose the gateway publicly without TLS, rate limiting, monitoring, and a production security review.
- The optional gateway key is a simple shared bearer token, not a full user identity system.
