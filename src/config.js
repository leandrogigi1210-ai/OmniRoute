const DEFAULTS = {
  host: "127.0.0.1",
  port: 8787,
  requestTimeoutMs: 60_000,
  maxBodyBytes: 1_048_576,
};

function positiveInteger(value, fallback, name) {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

export function loadConfig(env = process.env) {
  return {
    host: env.HOST || DEFAULTS.host,
    port: positiveInteger(env.PORT, DEFAULTS.port, "PORT"),
    gatewayApiKey: env.OMNIROUTE_API_KEY || "",
    requestTimeoutMs: positiveInteger(
      env.REQUEST_TIMEOUT_MS,
      DEFAULTS.requestTimeoutMs,
      "REQUEST_TIMEOUT_MS",
    ),
    maxBodyBytes: positiveInteger(env.MAX_BODY_BYTES, DEFAULTS.maxBodyBytes, "MAX_BODY_BYTES"),
    providers: {
      openai: {
        apiKey: env.OPENAI_API_KEY || "",
        baseUrl: (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, ""),
      },
      anthropic: {
        apiKey: env.ANTHROPIC_API_KEY || "",
        baseUrl: (env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1").replace(/\/+$/, ""),
      },
    },
  };
}
