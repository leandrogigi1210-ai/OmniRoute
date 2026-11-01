import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.js";

const config = {
  host: "127.0.0.1",
  port: 0,
  gatewayApiKey: "test-gateway-key",
  requestTimeoutMs: 1000,
  maxBodyBytes: 10000,
  providers: {
    openai: { apiKey: "test-openai-key", baseUrl: "https://example.test/v1" },
    anthropic: { apiKey: "test-anthropic-key", baseUrl: "https://example.test/v1" },
  },
};

async function withServer(handler, run) {
  const server = createServer({ config, fetchImpl: handler, logger: { error() {} } });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("health endpoint responds without credentials", async () => {
  await withServer(fetch, async (base) => {
    const response = await fetch(`${base}/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, "ok");
  });
});

test("chat endpoint requires gateway authentication", async () => {
  await withServer(fetch, async (base) => {
    const response = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "openai:gpt-4.1-mini", messages: [{ role: "user", content: "Hi" }] }),
    });
    assert.equal(response.status, 401);
  });
});

test("OpenAI route forwards provider model and returns provider response", async () => {
  let forwarded;
  const fakeFetch = async (url, options) => {
    forwarded = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({
      id: "chatcmpl-test",
      object: "chat.completion",
      choices: [{ index: 0, message: { role: "assistant", content: "Hello" }, finish_reason: "stop" }],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  await withServer(fakeFetch, async (base) => {
    const response = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-gateway-key",
      },
      body: JSON.stringify({
        model: "openai:gpt-4.1-mini",
        messages: [{ role: "user", content: "Hi" }],
      }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).choices[0].message.content, "Hello");
    assert.equal(forwarded.body.model, "gpt-4.1-mini");
    assert.equal(forwarded.url, "https://example.test/v1/chat/completions");
    assert.equal(forwarded.options.headers.authorization, "Bearer test-openai-key");
  });
});

test("Anthropic route maps the response to chat-completions shape", async () => {
  let forwarded;
  const fakeFetch = async (url, options) => {
    forwarded = { url, body: JSON.parse(options.body), headers: options.headers };
    return new Response(JSON.stringify({
      id: "msg_test",
      stop_reason: "end_turn",
      content: [{ type: "text", text: "Hello from Claude" }],
      usage: { input_tokens: 7, output_tokens: 4 },
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  await withServer(fakeFetch, async (base) => {
    const response = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-gateway-key",
      },
      body: JSON.stringify({
        model: "anthropic:claude-sonnet-4-5",
        messages: [
          { role: "system", content: "Be concise." },
          { role: "user", content: "Hi" },
        ],
        max_tokens: 200,
      }),
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.choices[0].message.content, "Hello from Claude");
    assert.equal(payload.usage.total_tokens, 11);
    assert.equal(forwarded.body.system, "Be concise.");
    assert.equal(forwarded.body.model, "claude-sonnet-4-5");
    assert.equal(forwarded.headers["x-api-key"], "test-anthropic-key");
  });
});
