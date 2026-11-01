# Adding a provider adapter

1. Add `src/providers/<provider>.js`.
2. Read credentials and base URL from `src/config.js`.
3. Validate credentials before making a request.
4. Map the common request to the provider's documented API.
5. Use the configured timeout and injected `fetchImpl`.
6. Convert provider responses into the documented chat-completions shape.
7. Convert provider failures into `HttpError` without leaking credentials.
8. Add success and failure tests with mocked `Response` objects.
9. Document supported message types and limitations.
10. Add the provider to `resolveModel` and the dispatch in `src/server.js`.

Never copy a provider's SDK or documentation verbatim. Link to the official API documentation in the adapter's comments or project docs.
