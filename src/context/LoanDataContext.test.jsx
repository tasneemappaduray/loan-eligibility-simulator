import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLoanData } from "../hooks/useLoanData";
import * as loanApi from "../services/loanApi";
import { LoanDataProvider } from "./LoanDataContext";

function renderLoanData() {
  return renderHook(() => useLoanData(), { wrapper: LoanDataProvider });
}

describe("LoanDataProvider", () => {
  beforeEach(() => {
    loanApi.setMockLatency(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts loading, then has the loan products and the form rules", async () => {
    const { result } = renderLoanData();
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.loanProducts.map((loanProduct) => loanProduct.id)).toEqual([
      "personal_loan",
      "vehicle_loan",
      "home_loan",
    ]);
    expect(result.current.validationRules.personalInfo.age.min).toBe(18);
  });

  it("says failed when loading fails, and loads again after retry", async () => {
    vi.spyOn(loanApi, "getLoanProducts").mockRejectedValueOnce(new Error("offline"));
    const { result } = renderLoanData();

    await waitFor(() => expect(result.current.status).toBe("failed"));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.loanProducts).toHaveLength(3);
  });

  it("ignores a load that finishes after the page has gone", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = renderLoanData();
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(consoleError).not.toHaveBeenCalled();
  });
});
