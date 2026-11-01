import { HttpError } from "../errors.js";

export async function chatWithOpenAI({ config, model, body, fetchImpl, timeoutMs }) {
  if (!config.apiKey) throw new HttpError(503, "OpenAI is not configured. Set OPENAI_API_KEY.", "provider_error");

  const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ ...body, model }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI returned HTTP ${response.status}.`;
    throw new HttpError(response.status >= 500 ? 502 : response.status, message, "provider_error");
  }
  return payload;
}
