# OmniRoute

**An open-source, self-hosted AI gateway with a unified API for multiple AI providers.**

OmniRoute provides one OpenAI-compatible chat completions endpoint and routes requests to different AI providers using explicit model prefixes.

## Features

- OpenAI-compatible `POST /v1/chat/completions` endpoint.
- OpenAI provider adapter.
- Anthropic provider adapter.
- Provider selection using `openai:<model>` and `anthropic:<model>`.
- Optional bearer-token authentication.
- Request-size limits and upstream timeouts.
- Health endpoint.
- Automated tests and GitHub Actions CI.

## Requirements

- Node.js 20.11 or newer.
- An API key for at least one supported provider.

## Getting started

Clone the repository:

```bash
git clone https://github.com/leandrogigi1210-ai/OmniRoute.git
cd OmniRoute
```

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and configure your provider API key.

Run the checks:

```bash
npm run check
```

Start the server:

```bash
npm start
```

The default local address is:

`http://127.0.0.1:8787`

## Example request

```bash
curl http://127.0.0.1:8787/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GATEWAY_KEY" \
  -d '{
    "model": "openai:gpt-4.1-mini",
    "messages": [
      {
        "role": "user",
        "content": "Hello from OmniRoute!"
      }
    ]
  }'
```

For Anthropic, use a model name beginning with `anthropic:`.

## Current limitations

OmniRoute is an early-stage implementation and is not yet production-hardened.

Currently, it supports text-only, non-streaming chat requests. Tool calling, image input, audio, embeddings, billing, user accounts and automatic load balancing are not implemented.

Provider API keys and usage costs remain the responsibility of the user.

## Project structure

```text
OmniRoute/
├── docs/
├── src/
│   ├── providers/
│   ├── config.js
│   ├── errors.js
│   ├── router.js
│   └── server.js
├── test/
├── package.json
├── LICENSE
└── README.md
```

## Contributing

Contributions, bug reports and feature suggestions are welcome.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

## License

OmniRoute is licensed under the MIT License. See [LICENSE](LICENSE).
