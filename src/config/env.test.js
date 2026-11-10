import { describe, expect, it } from "vitest";
import { DEFAULT_MOCK_LATENCY_MS, parseLatency } from "./env";

describe("parseLatency", () => {
  it("falls back to the default when the setting is missing", () => {
    expect(parseLatency(undefined)).toBe(DEFAULT_MOCK_LATENCY_MS);
  });

  it.each([
    ["0", 0],
    ["250", 250],
  ])("uses %s as the delay", (value, expected) => {
    expect(parseLatency(value)).toBe(expected);
  });

  it.each(["abc", "", "-5"])("falls back to the default for %j", (value) => {
    expect(parseLatency(value)).toBe(DEFAULT_MOCK_LATENCY_MS);
  });
});
