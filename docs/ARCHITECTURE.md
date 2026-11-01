# Architecture

## Request flow

1. The HTTP server validates route, request size, and optional gateway authentication.
2. The router parses the `provider:model-id` model string.
3. The selected adapter maps the common request into the provider's API format.
4. The adapter calls the provider using a timeout.
5. The adapter returns a normalized chat-completions response.
6. The HTTP server returns JSON and a request ID.

## Module boundaries

- `src/server.js`: HTTP routing, input validation, auth, error serialization.
- `src/router.js`: explicit provider/model parsing.
- `src/providers/openai.js`: OpenAI upstream request.
- `src/providers/anthropic.js`: Anthropic request and response mapping.
- `src/config.js`: environment configuration.
- `src/errors.js`: consistent HTTP error representation.

## Design decisions

- Node's built-in HTTP server avoids a framework dependency for the initial implementation.
- Provider selection is explicit; the gateway does not silently choose a model.
- Provider keys remain server-side and are never accepted from callers.
- Streaming and non-text content are rejected rather than being partially or silently supported.
- Tests mock upstream responses to avoid paid API usage and flaky external dependencies.

## Known gaps

The initial version does not provide per-user identity, rate limiting, usage accounting, streaming, tool calling, retries, circuit breakers, or production deployment hardening. These are tracked in the roadmap.
