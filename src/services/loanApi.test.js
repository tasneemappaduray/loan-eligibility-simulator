import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  calculateRate,
  checkLoanApplication,
  getLoanProducts,
  getValidationRules,
  setMockLatency,
} from "./loanApi";

const sampleRequest = {
  personalInfo: { age: 35, employmentStatus: "employed", employmentDuration: 24 },
  financialInfo: {
    monthlyIncome: 25000,
    monthlyExpenses: 15000,
    existingDebt: 5000,
    creditScore: 650,
  },
  loanDetails: { requestedAmount: 150000, loanTerm: 24, loanType: "personal_loan" },
};

beforeEach(() => setMockLatency(0));

describe("loanApi", () => {
  it("returns the three loan products", async () => {
    const { products } = await getLoanProducts();
    expect(products.map((product) => product.id)).toEqual([
      "personal_loan",
      "vehicle_loan",
      "home_loan",
    ]);
  });

  it("returns the validation rules", async () => {
    const rules = await getValidationRules();
    expect(rules.personalInfo.age.min).toBe(18);
    expect(rules.financialInfo.existingDebt.min).toBe(0);
  });

  it("returns copies so callers cannot mutate the mock data", async () => {
    const first = await getLoanProducts();
    first.products[0].name = "Tampered";
    const second = await getLoanProducts();
    expect(second.products[0].name).toBe("Personal Loan");
  });

  it("checks eligibility and returns the API-shaped result", async () => {
    const result = await checkLoanApplication(sampleRequest);
    expect(Object.keys(result).sort()).toEqual([
      "affordabilityAnalysis",
      "eligibilityResult",
      "recommendedLoan",
    ]);
  });

  it("rejects eligibility checks for an unknown loan type", async () => {
    const request = {
      ...sampleRequest,
      loanDetails: { ...sampleRequest.loanDetails, loanType: "boat" },
    };
    await expect(checkLoanApplication(request)).rejects.toMatchObject({
      message: "Unknown loan type",
    });
  });

  it("calculates the rate, quote and schedule", async () => {
    const quote = await calculateRate({
      loanAmount: 150000,
      loanTerm: 24,
      creditScore: 650,
      loanType: "personal_loan",
    });
    expect(quote.interestRate).toBe(13.41);
    expect(quote.paymentSchedule).toHaveLength(24);
  });

  it("rejects rate calculation for an unknown loan type", async () => {
    const promise = calculateRate({
      loanAmount: 1,
      loanTerm: 6,
      creditScore: 650,
      loanType: "boat",
    });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ message: "Unknown loan type" });
  });

  describe("latency", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("does not resolve before the configured delay", async () => {
      setMockLatency(600);
      const onResolve = vi.fn();
      getLoanProducts().then(onResolve);

      await vi.advanceTimersByTimeAsync(100);
      expect(onResolve).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(500);
      expect(onResolve).toHaveBeenCalledOnce();
    });
  });
});
