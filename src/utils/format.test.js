import { describe, expect, it } from "vitest";
import { formatCurrency, formatCurrencyWhole, formatPercent } from "./format";

describe("format", () => {
  it("writes currency with commas between thousands and two decimals", () => {
    expect(formatCurrency(7096.1)).toBe("R7,096.10");
    expect(formatCurrency(171844.7)).toBe("R171,844.70");
    expect(formatCurrency(0)).toBe("R0.00");
  });

  it("writes a negative amount with the minus sign in front", () => {
    expect(formatCurrency(-5000)).toBe("-R5,000.00");
    expect(formatCurrencyWhole(-5000)).toBe("-R5,000");
  });

  it("writes whole-rand currency without decimals", () => {
    expect(formatCurrencyWhole(150000)).toBe("R150,000");
    expect(formatCurrencyWhole(5000)).toBe("R5,000");
  });

  it("writes percentages with up to two decimals and no trailing zeros", () => {
    expect(formatPercent(20)).toBe("20%");
    expect(formatPercent(13.41)).toBe("13.41%");
    expect(formatPercent(10.5)).toBe("10.5%");
  });
});
