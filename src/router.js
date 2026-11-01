import { HttpError } from "./errors.js";

export function resolveModel(model) {
  if (typeof model !== "string" || !model.trim()) {
    throw new HttpError(400, "The model field is required.");
  }

  const separator = model.indexOf(":");
  if (separator < 1 || separator === model.length - 1) {
    throw new HttpError(
      400,
      'Use a provider-prefixed model name, for example "openai:gpt-4.1-mini" or "anthropic:claude-sonnet-4-5".',
    );
  }

  const provider = model.slice(0, separator).toLowerCase();
  const providerModel = model.slice(separator + 1);
  if (!["openai", "anthropic"].includes(provider)) {
    throw new HttpError(400, `Unsupported provider "${provider}". Supported providers: openai, anthropic.`);
  }
  return { provider, model: providerModel };
}
