import { describe, expect, it } from "vitest";
import { checkIfPersonQualifies } from "./loanAssessment";

const PERSONAL_PRODUCT = {
  id: "personal_loan",
  name: "Personal Loan",
  description: "Flexible personal financing for various needs",
  minAmount: 5000.0,
  maxAmount: 300000.0,
  minTerm: 6,
  maxTerm: 60,
  interestRateRange: { min: 10.5, max: 18.5 },
  purposes: ["debt_consolidation", "home_improvement", "education", "medical", "other"],
};

const VEHICLE_PRODUCT = {
  id: "vehicle_loan",
  name: "Vehicle Finance",
  description: "Financing for new and used vehicles",
  minAmount: 50000.0,
  maxAmount: 1500000.0,
  minTerm: 12,
  maxTerm: 72,
  interestRateRange: { min: 8.5, max: 15.0 },
  purposes: ["new_vehicle", "used_vehicle"],
};

function buildRequest({
  income = 25000,
  expenses = 15000,
  existingDebt = 5000,
  creditScore = 650,
  amount = 150000,
  term = 24,
  employmentStatus = "employed",
  product = PERSONAL_PRODUCT,
} = {}) {
  return {
    personalInfo: { age: 30, employmentStatus, employmentDuration: 36 },
    financialInfo: {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      existingDebt,
      creditScore,
    },
    loanDetails: { loanType: "personal_loan", requestedAmount: amount, loanTerm: term },
    product,
  };
}

function numericValues(result) {
  const { eligibilityResult, recommendedLoan, affordabilityAnalysis } = result;
  return [
    ...Object.values(eligibilityResult),
    ...Object.values(recommendedLoan),
    ...Object.values(affordabilityAnalysis),
  ].filter((value) => typeof value === "number");
}

describe("checkIfPersonQualifies", () => {
  it("approves the spec sample", () => {
    const { eligibilityResult, recommendedLoan, affordabilityAnalysis } =
      checkIfPersonQualifies(buildRequest());

    expect(eligibilityResult.isEligible).toBe(true);
    expect(eligibilityResult.approvalLikelihood).toBe(64);
    expect(eligibilityResult.riskCategory).toBe("medium");
    expect(eligibilityResult.decisionReason).toBe(
      "Your income covers this loan, but with limited room",
    );
    expect(recommendedLoan.interestRate).toBe(13.41);
    expect(recommendedLoan.monthlyPayment).toBe(7160.19);
    expect(recommendedLoan.totalRepayment).toBe(171844.7);
    expect(recommendedLoan.maxAmount).toBe(157000);
    expect(recommendedLoan.recommendedAmount).toBe(150000);
    expect(affordabilityAnalysis).toMatchObject({
      disposableIncome: 10000,
      debtToIncomeRatio: 20,
      loanToIncomeRatio: 6,
      affordabilityScore: "fair",
    });
  });

  it("declines a low credit score with no recommendation", () => {
    const { eligibilityResult, recommendedLoan } = checkIfPersonQualifies(
      buildRequest({
        income: 10000,
        expenses: 8000,
        existingDebt: 1000,
        creditScore: 450,
        amount: 100000,
        term: 12,
      }),
    );

    expect(eligibilityResult.isEligible).toBe(false);
    expect(eligibilityResult.decisionReason).toBe("Credit score is below the minimum of 500");
    expect(eligibilityResult.approvalLikelihood).toBe(0);
    expect(eligibilityResult.riskCategory).toBe("high");
    expect(recommendedLoan.maxAmount).toBe(0);
    expect(recommendedLoan.recommendedAmount).toBe(0);
  });

  it("marks a normal request as assessed", () => {
    const { eligibilityResult } = checkIfPersonQualifies(buildRequest());
    expect(eligibilityResult.isAssessed).toBe(true);
  });

  it("marks an unemployed applicant as not assessed, so no money figures are shown", () => {
    const { eligibilityResult } = checkIfPersonQualifies(
      buildRequest({ employmentStatus: "unemployed" }),
    );
    expect(eligibilityResult.isAssessed).toBe(false);
  });

  it("marks a request with no income as not assessed", () => {
    const { eligibilityResult } = checkIfPersonQualifies(buildRequest({ income: 0, expenses: 0 }));
    expect(eligibilityResult.isAssessed).toBe(false);
  });

  it("still marks a declined person with an income as assessed, so the figures explain the decline", () => {
    const { eligibilityResult } = checkIfPersonQualifies(buildRequest({ creditScore: 450 }));
    expect(eligibilityResult.isEligible).toBe(false);
    expect(eligibilityResult.isAssessed).toBe(true);
  });

  it("declines unemployed applicants", () => {
    const { eligibilityResult, recommendedLoan } = checkIfPersonQualifies(
      buildRequest({ employmentStatus: "unemployed", creditScore: 800 }),
    );

    expect(eligibilityResult.isEligible).toBe(false);
    expect(eligibilityResult.decisionReason).toBe("Unemployed applicants cannot be assessed");
    expect(eligibilityResult.approvalLikelihood).toBe(0);
    expect(eligibilityResult.riskCategory).toBe("high");
    expect(recommendedLoan.maxAmount).toBe(0);
  });

  it("declines when the payment exceeds income left after expenses", () => {
    const { eligibilityResult, affordabilityAnalysis } = checkIfPersonQualifies(
      buildRequest({ expenses: 30000 }),
    );

    expect(eligibilityResult.isEligible).toBe(false);
    expect(affordabilityAnalysis.disposableIncome).toBe(-5000);
    expect(eligibilityResult.decisionReason).toBe(
      "The monthly payment is more than your income left after expenses",
    );
    expect(affordabilityAnalysis.affordabilityScore).toBe("poor");
    expect(eligibilityResult.approvalLikelihood).toBe(0);
  });

  it("calls affordability poor when the payment is more than the money left, even if debt looks small", () => {
    const { eligibilityResult, affordabilityAnalysis } = checkIfPersonQualifies(
      buildRequest({ income: 20000, expenses: 30000, existingDebt: 0, amount: 50000 }),
    );

    expect(eligibilityResult.isEligible).toBe(false);
    expect(affordabilityAnalysis.disposableIncome).toBe(-10000);
    expect(affordabilityAnalysis.affordabilityScore).toBe("poor");
    expect(eligibilityResult.approvalLikelihood).toBe(0);
    expect(eligibilityResult.riskCategory).toBe("high");
  });

  it("does not offer less than the loan type's own minimum", () => {
    const { eligibilityResult, recommendedLoan } = checkIfPersonQualifies(
      buildRequest({
        income: 10000,
        expenses: 8000,
        existingDebt: 0,
        amount: 100000,
        product: VEHICLE_PRODUCT,
      }),
    );

    expect(eligibilityResult.isEligible).toBe(false);
    expect(recommendedLoan.maxAmount).toBe(0);
    expect(recommendedLoan.recommendedAmount).toBe(0);
  });

  it("never recommends less than an eligible person asked for, even if it is not a round amount", () => {
    const { eligibilityResult, recommendedLoan } = checkIfPersonQualifies(
      buildRequest({ amount: 157070 }),
    );

    expect(eligibilityResult.isEligible).toBe(true);
    expect(recommendedLoan.recommendedAmount).toBe(157070);
    expect(recommendedLoan.maxAmount).toBeGreaterThanOrEqual(157070);
  });

  it("declines when total debt payments exceed half of income", () => {
    const { eligibilityResult, affordabilityAnalysis } = checkIfPersonQualifies(
      buildRequest({ income: 20000, expenses: 2000, existingDebt: 9000, amount: 50000 }),
    );

    expect(eligibilityResult.isEligible).toBe(false);
    expect(eligibilityResult.decisionReason).toBe(
      "Total debt payments would be more than 50% of your income",
    );
    expect(affordabilityAnalysis.affordabilityScore).toBe("poor");
  });

  it("rates a comfortable loan as good", () => {
    const { eligibilityResult, affordabilityAnalysis } = checkIfPersonQualifies(
      buildRequest({ income: 60000, expenses: 10000, existingDebt: 0, amount: 50000 }),
    );

    expect(eligibilityResult.isEligible).toBe(true);
    expect(eligibilityResult.decisionReason).toBe("Your income comfortably covers this loan");
    expect(affordabilityAnalysis.affordabilityScore).toBe("good");
    expect(eligibilityResult.riskCategory).toBe("low");
  });

  it("caps the maximum amount at the product maximum", () => {
    const { recommendedLoan } = checkIfPersonQualifies(
      buildRequest({ income: 500000, expenses: 1000, existingDebt: 0, amount: 100000 }),
    );

    expect(recommendedLoan.maxAmount).toBe(PERSONAL_PRODUCT.maxAmount);
    expect(recommendedLoan.recommendedAmount).toBe(100000);
  });

  it("evaluates without a credit score", () => {
    const result = checkIfPersonQualifies(buildRequest({ creditScore: null }));

    expect(result.eligibilityResult.isEligible).toBe(true);
    expect(result.recommendedLoan.interestRate).toBe(14.5);
    expect(numericValues(result).every(Number.isFinite)).toBe(true);
  });

  it("guards against zero income without NaN", () => {
    const result = checkIfPersonQualifies(buildRequest({ income: 0, expenses: 0 }));

    expect(result.eligibilityResult.isEligible).toBe(false);
    expect(result.eligibilityResult.decisionReason).toBe("Income is required to assess this loan");
    expect(numericValues(result).every(Number.isFinite)).toBe(true);
  });
});
