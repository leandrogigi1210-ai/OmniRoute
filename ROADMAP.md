# Roadmap

This roadmap describes possible future work. Items are not complete until implemented, tested, and merged.

## v0.1 — Initial text gateway

- [x] Node.js HTTP server
- [x] OpenAI Chat Completions adapter
- [x] Anthropic Messages adapter
- [x] Provider-prefixed model routing
- [x] Optional gateway bearer authentication
- [x] Request size limit and upstream timeout
- [x] Mocked automated tests
- [x] CI workflow

## v0.2 — Compatibility and reliability

- [ ] Add structured logging with redaction tests.
- [ ] Add configurable per-client rate limiting.
- [ ] Improve upstream error normalization.
- [ ] Add explicit model capability metadata.
- [ ] Add tests for timeouts, malformed provider responses, and body-size limits.

## v0.3 — Additional capabilities

- [ ] Evaluate streaming support with backpressure tests.
- [ ] Evaluate tool/function calling across providers.
- [ ] Add image input only after provider-specific validation.
- [ ] Add a third provider adapter based on community demand.

## Later

- [ ] Provider health checks with clear timeout behavior.
- [ ] Optional metrics endpoint with no sensitive prompt data.
- [ ] Deployment examples and container image.
- [ ] Compatibility matrix validated against live provider APIs.

## Prioritization

Prioritize correctness, security, documentation, and reproducible tests over adding provider count or marketing claims.
