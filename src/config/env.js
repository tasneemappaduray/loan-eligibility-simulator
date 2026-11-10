export const DEFAULT_MOCK_LATENCY_MS = 1500;

// Reads how long the pretend server should wait, from a setting. If the setting is missing or wrong, it uses the default.
export function parseLatency(value) {
  if (value === undefined || value.trim() === "") return DEFAULT_MOCK_LATENCY_MS;
  const ms = Number(value);
  return Number.isFinite(ms) && ms >= 0 ? ms : DEFAULT_MOCK_LATENCY_MS;
}

// How long the pretend server waits before answering. Change it by setting VITE_MOCK_LATENCY_MS in your .env file.
export const MOCK_LATENCY_MS = parseLatency(import.meta.env.VITE_MOCK_LATENCY_MS);
