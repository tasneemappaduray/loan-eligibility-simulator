import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as loanApi from "../services/loanApi";
import { useLoanApplication } from "./useLoanApplication";

const qualifyingRequest = {
  personalInfo: { age: 35, employmentStatus: "employed", employmentDuration: 24 },
  financialInfo: {
    monthlyIncome: 25000,
    monthlyExpenses: 15000,
    existingDebt: 5000,
    creditScore: 650,
  },
  loanDetails: {
    requestedAmount: 150000,
    loanTerm: 24,
    loanType: "personal_loan",
    loanPurpose: "education",
  },
};

const decliningRequest = {
  personalInfo: { age: 35, employmentStatus: "employed", employmentDuration: 24 },
  financialInfo: {
    monthlyIncome: 10000,
    monthlyExpenses: 8000,
    existingDebt: 1000,
    creditScore: 450,
  },
  loanDetails: {
    requestedAmount: 100000,
    loanTerm: 12,
    loanType: "personal_loan",
    loanPurpose: "education",
  },
};

function renderApplication() {
  return renderHook(() => useLoanApplication());
}

describe("useLoanApplication", () => {
  beforeEach(() => {
    loanApi.setMockLatency(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts out waiting with nothing to show", () => {
    const { result } = renderApplication();
    expect(result.current.applicationStatus).toBe("waiting");
    expect(result.current.loanDecision).toBeNull();
    expect(result.current.repaymentRows).toEqual([]);
  });

  it("gives the decision and the 24-month repayment table for a person who qualifies", async () => {
    const { result } = renderApplication();
    await act(() => result.current.sendApplication(qualifyingRequest));

    expect(result.current.applicationStatus).toBe("done");
    expect(result.current.loanDecision.eligibilityResult.isEligible).toBe(true);
    expect(result.current.repaymentRows).toHaveLength(24);
  });

  it("builds the repayment table for the amount the person asked for, not a rounded one", async () => {
    const calculateRate = vi.spyOn(loanApi, "calculateRate");
    const { result } = renderApplication();
    await act(() =>
      result.current.sendApplication({
        ...qualifyingRequest,
        loanDetails: { ...qualifyingRequest.loanDetails, requestedAmount: 157070 },
      }),
    );

    expect(result.current.loanDecision.eligibilityResult.isEligible).toBe(true);
    expect(calculateRate).toHaveBeenCalledWith(expect.objectContaining({ loanAmount: 157070 }));
    expect(
      result.current.repaymentRows[0].principal + result.current.repaymentRows[0].interest,
    ).toBeCloseTo(result.current.loanDecision.recommendedLoan.monthlyPayment, 1);
  });

  it("skips the repayment table when the person is not eligible", async () => {
    const calculateRate = vi.spyOn(loanApi, "calculateRate");
    const { result } = renderApplication();
    await act(() => result.current.sendApplication(decliningRequest));

    expect(result.current.applicationStatus).toBe("done");
    expect(result.current.loanDecision.eligibilityResult.isEligible).toBe(false);
    expect(result.current.repaymentRows).toEqual([]);
    expect(calculateRate).not.toHaveBeenCalled();
  });

  it("gives no repayment table to a person who is declined, even if a smaller loan could be offered", async () => {
    const calculateRate = vi.spyOn(loanApi, "calculateRate");
    const { result } = renderApplication();
    await act(() =>
      result.current.sendApplication({
        ...qualifyingRequest,
        financialInfo: {
          ...qualifyingRequest.financialInfo,
          monthlyIncome: 20000,
          monthlyExpenses: 5000,
          existingDebt: 0,
        },
        loanDetails: { ...qualifyingRequest.loanDetails, requestedAmount: 300000 },
      }),
    );

    const { eligibilityResult, recommendedLoan } = result.current.loanDecision;
    expect(eligibilityResult.isEligible).toBe(false);
    expect(recommendedLoan.maxAmount).toBeGreaterThan(0);
    expect(result.current.repaymentRows).toEqual([]);
    expect(calculateRate).not.toHaveBeenCalled();
  });

  it("sends only one request when the form is sent twice quickly", async () => {
    const checkLoanApplication = vi.spyOn(loanApi, "checkLoanApplication");
    const { result } = renderApplication();
    await act(async () => {
      result.current.sendApplication(qualifyingRequest);
      result.current.sendApplication(qualifyingRequest);
    });

    expect(checkLoanApplication).toHaveBeenCalledTimes(1);
  });

  it("says failed when the server fails, and can be sent again", async () => {
    vi.spyOn(loanApi, "checkLoanApplication").mockRejectedValueOnce(new Error("offline"));
    const { result } = renderApplication();
    await act(() => result.current.sendApplication(qualifyingRequest));

    expect(result.current.applicationStatus).toBe("failed");

    await act(() => result.current.sendApplication(qualifyingRequest));
    expect(result.current.applicationStatus).toBe("done");
  });
});
