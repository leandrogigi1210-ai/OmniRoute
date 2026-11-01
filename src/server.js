import http from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { loadConfig } from "./config.js";
import { HttpError, errorPayload } from "./errors.js";
import { resolveModel } from "./router.js";
import { chatWithOpenAI } from "./providers/openai.js";
import { chatWithAnthropic } from "./providers/anthropic.js";

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(payload));
}

function isAuthorized(request, expectedKey) {
  if (!expectedKey) return true;
  const header = request.headers.authorization || "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(supplied);
  const b = Buffer.from(expectedKey);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function readJson(request, maxBytes) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, "Request body is too large.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

export function createServer({
  config = loadConfig(),
  fetchImpl = fetch,
  logger = console,
} = {}) {
  return http.createServer(async (request, response) => {
    const requestId = randomUUID();
    response.setHeader("x-request-id", requestId);

    try {
      const url = new URL(request.url || "/", "http://localhost");

      if (request.method === "GET" && url.pathname === "/health") {
        return sendJson(response, 200, {
          status: "ok",
          service: "omniroute",
          version: "0.1.0",
        });
      }

      if (request.method === "GET" && url.pathname === "/v1/models") {
        return sendJson(response, 200, {
          object: "list",
          data: [],
          note: "Provider models are selected explicitly with provider:model names.",
        });
      }

      if (request.method !== "POST" || url.pathname !== "/v1/chat/completions") {
        throw new HttpError(404, "Route not found.", "not_found_error");
      }

      if (!isAuthorized(request, config.gatewayApiKey)) {
        throw new HttpError(401, "Missing or invalid gateway API key.", "authentication_error");
      }

      const body = await readJson(request, config.maxBodyBytes);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new HttpError(400, "Request body must be a JSON object.");
      }
      if (body.stream === true) {
        throw new HttpError(400, "Streaming is not supported in this initial release.");
      }
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        throw new HttpError(400, "The messages field must be a non-empty array.");
      }

      const { provider, model } = resolveModel(body.model);
      const args = {
        config: config.providers[provider],
        model,
        body,
        fetchImpl,
        timeoutMs: config.requestTimeoutMs,
      };
      const result = provider === "openai"
        ? await chatWithOpenAI(args)
        : await chatWithAnthropic(args);

      return sendJson(response, 200, result);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const message = error instanceof Error ? error.message : "Unexpected server error.";
      if (status >= 500) logger.error?.(`[${requestId}] ${message}`);
      return sendJson(response, status, errorPayload(
        status === 500 ? "Internal server error." : message,
        error instanceof HttpError ? error.type : "server_error",
      ));
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const server = createServer({ config });
  server.listen(config.port, config.host, () => {
    console.log(`OmniRoute listening on http://${config.host}:${config.port}`);
  });
}
