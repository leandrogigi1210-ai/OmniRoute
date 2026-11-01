import { HttpError } from "../errors.js";

function convertMessages(messages = []) {
  let system = "";
  const converted = [];

  for (const message of messages) {
    if (!message || typeof message !== "object" || typeof message.role !== "string") {
      throw new HttpError(400, "Each message must have a role and content.");
    }
    if (message.role === "system" || message.role === "developer") {
      const text = typeof message.content === "string" ? message.content : "";
      system = system ? `${system}\n\n${text}` : text;
      continue;
    }
    if (!["user", "assistant"].includes(message.role)) {
      throw new HttpError(400, `Anthropic adapter does not support role "${message.role}".`);
    }
    if (typeof message.content !== "string") {
      throw new HttpError(400, "Anthropic adapter currently supports text-only message content.");
    }
    converted.push({ role: message.role, content: message.content });
  }

  if (converted.length === 0) {
    throw new HttpError(400, "At least one user or assistant message is required.");
  }
  return { system, messages: converted };
}

export async function chatWithAnthropic({ config, model, body, fetchImpl, timeoutMs }) {
  if (!config.apiKey) {
    throw new HttpError(503, "Anthropic is not configured. Set ANTHROPIC_API_KEY.", "provider_error");
  }
  const { system, messages } = convertMessages(body.messages);
  const maxTokens = Number.isSafeInteger(body.max_tokens) && body.max_tokens > 0
    ? body.max_tokens
    : 1024;

  const requestBody = {
    model,
    max_tokens: maxTokens,
    messages,
  };
  if (system) requestBody.system = system;
  if (body.temperature !== undefined) requestBody.temperature = body.temperature;
  if (body.top_p !== undefined) requestBody.top_p = body.top_p;

  const response = await fetchImpl(`${config.baseUrl}/messages`, {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Anthropic returned HTTP ${response.status}.`;
    throw new HttpError(response.status >= 500 ? 502 : response.status, message, "provider_error");
  }

  const text = (payload.content || [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  return {
    id: payload.id || `omni-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: body.model,
    choices: [{
      index: 0,
      message: { role: "assistant", content: text },
      finish_reason: payload.stop_reason || "stop",
    }],
    usage: {
      prompt_tokens: payload.usage?.input_tokens ?? 0,
      completion_tokens: payload.usage?.output_tokens ?? 0,
      total_tokens: (payload.usage?.input_tokens ?? 0) + (payload.usage?.output_tokens ?? 0),
    },
  };
}
