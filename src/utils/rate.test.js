import { describe, expect, it } from "vitest";
import { rateForCreditScore } from "./rate";

const RANGE = { min: 10.5, max: 18.5 };

describe("rateForCreditScore", () => {
  it("interpolates between the range ends", () => {
    expect(rateForCreditScore(RANGE, 650)).toBe(13.41);
  });

  it("uses the midpoint when there is no score", () => {
    expect(rateForCreditScore(RANGE, null)).toBe(14.5);
  });

  it("gives the highest rate at the lowest score", () => {
    expect(rateForCreditScore(RANGE, 300)).toBe(18.5);
  });

  it("gives the lowest rate at the highest score", () => {
    expect(rateForCreditScore(RANGE, 850)).toBe(10.5);
  });

  it("clamps scores above the maximum", () => {
    expect(rateForCreditScore(RANGE, 900)).toBe(10.5);
  });
});
