import test from "node:test";
import assert from "node:assert/strict";
import { resolveModel } from "../src/router.js";

test("resolves OpenAI model prefixes", () => {
  assert.deepEqual(resolveModel("openai:gpt-4.1-mini"), {
    provider: "openai",
    model: "gpt-4.1-mini",
  });
});

test("resolves Anthropic model prefixes", () => {
  assert.deepEqual(resolveModel("anthropic:claude-sonnet-4-5"), {
    provider: "anthropic",
    model: "claude-sonnet-4-5",
  });
});

test("rejects missing and unknown model prefixes", () => {
  assert.throws(() => resolveModel("gpt-4.1-mini"), /provider-prefixed/);
  assert.throws(() => resolveModel("other:model"), /Unsupported provider/);
  assert.throws(() => resolveModel(""), /required/);
});
