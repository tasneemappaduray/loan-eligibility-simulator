import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLoanData } from "./useLoanData";

describe("useLoanData", () => {
  it("says so when it is used outside the LoanDataProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLoanData())).toThrow(
      "useLoanData must be used inside LoanDataProvider",
    );
    vi.restoreAllMocks();
  });
});
