import { describe, expect, it } from "vitest";
import { buildLoanQuote, maxPrincipalForPayment, monthlyPayment } from "./loanMath";

describe("monthlyPayment", () => {
  it("computes an amortised payment", () => {
    expect(monthlyPayment(150000, 12.5, 24)).toBe(7096.1);
  });

  it("splits evenly when the rate is zero", () => {
    expect(monthlyPayment(12000, 0, 12)).toBe(1000);
  });
});

describe("buildLoanQuote", () => {
  const quote = buildLoanQuote(150000, 12.5, 24);

  it("builds one schedule row per month", () => {
    expect(quote.schedule).toHaveLength(24);
  });

  it("computes the first row", () => {
    expect(quote.schedule[0]).toEqual({
      month: 1,
      payment: 7096.1,
      principal: 5533.6,
      interest: 1562.5,
      balance: 144466.4,
    });
  });

  it("settles the balance exactly in the last row", () => {
    expect(quote.schedule[23]).toEqual({
      month: 24,
      payment: 7096,
      principal: 7022.85,
      interest: 73.15,
      balance: 0,
    });
  });

  it("totals the repayment and interest", () => {
    expect(quote.monthlyPayment).toBe(7096.1);
    expect(quote.totalRepayment).toBe(170306.3);
    expect(quote.totalInterest).toBe(20306.3);
  });
});

describe("maxPrincipalForPayment", () => {
  it("is zero for a zero payment", () => {
    expect(maxPrincipalForPayment(0, 12.5, 24)).toBe(0);
  });

  it("is zero for a negative payment", () => {
    expect(maxPrincipalForPayment(-100, 12.5, 24)).toBe(0);
  });

  it("is the inverse of monthlyPayment", () => {
    const principal = maxPrincipalForPayment(7096.1, 12.5, 24);
    expect(principal).toBeCloseTo(150000, 0);
  });

  it("handles a zero rate", () => {
    expect(maxPrincipalForPayment(1000, 0, 12)).toBe(12000);
  });
});
