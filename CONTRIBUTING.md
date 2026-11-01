# Contributing

Thanks for helping improve OmniRoute.

## Before opening a pull request

1. Search existing issues and pull requests.
2. For a substantial change, open an issue to discuss the design first.
3. Keep pull requests focused and explain the user problem they solve.
4. Add or update tests for behavior changes.
5. Update documentation when behavior or configuration changes.

## Local checks

- Use Node.js 20.11 or newer.
- Run `npm run check`.
- Tests must not require real provider credentials or paid API calls.
- Use mocked HTTP responses in automated tests.

## Provider adapters

A new adapter should:
- isolate provider-specific HTTP and authentication behavior;
- validate required configuration;
- avoid logging secrets or request content;
- map errors into useful gateway errors;
- document unsupported capabilities;
- include tests for success and failure responses.

## Security

Never commit API keys, tokens, passwords, private user data, or real `.env` files. Report vulnerabilities privately using GitHub's private vulnerability reporting feature when available.

## Pull requests

Complete the repository pull request template and state exactly which checks you ran.
