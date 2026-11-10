import { describe, expect, it } from "vitest";
import { simulatorPath } from "./routes";

describe("routes", () => {
  it("builds the simulator address for a loan type", () => {
    expect(simulatorPath("personal_loan")).toBe("/simulator/personal_loan");
  });
});
