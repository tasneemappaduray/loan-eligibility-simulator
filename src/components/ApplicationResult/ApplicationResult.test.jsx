import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { formatCurrency } from "../../utils/format";
import { buildLoanQuote } from "../../utils/loanMath";
import ApplicationResult from "./ApplicationResult";
import NumberCounter from "./NumberCounter";

const qualifyingDecision = {
  eligibilityResult: {
    isEligible: true,
    isAssessed: true,
    approvalLikelihood: 64,
    riskCategory: "medium",
    decisionReason: "Your income covers this loan, but with limited room",
  },
  recommendedLoan: {
    maxAmount: 157000,
    recommendedAmount: 150000,
    interestRate: 13.41,
    monthlyPayment: 7160.19,
    totalRepayment: 171844.7,
  },
  affordabilityAnalysis: {
    disposableIncome: 10000,
    debtToIncomeRatio: 20,
    loanToIncomeRatio: 6,
    affordabilityScore: "fair",
  },
};

const decliningDecision = {
  eligibilityResult: {
    isEligible: false,
    isAssessed: true,
    approvalLikelihood: 0,
    riskCategory: "high",
    decisionReason: "Credit score is below the minimum of 500",
  },
  recommendedLoan: {
    maxAmount: 0,
    recommendedAmount: 0,
    interestRate: 16.32,
    monthlyPayment: 9088.24,
    totalRepayment: 109058.88,
  },
  affordabilityAnalysis: {
    disposableIncome: 2000,
    debtToIncomeRatio: 10,
    loanToIncomeRatio: 10,
    affordabilityScore: "poor",
  },
};

const unassessedDecision = {
  ...decliningDecision,
  eligibilityResult: {
    ...decliningDecision.eligibilityResult,
    isAssessed: false,
    decisionReason: "Unemployed applicants cannot be assessed",
  },
  affordabilityAnalysis: {
    disposableIncome: 22000,
    debtToIncomeRatio: 26.67,
    loanToIncomeRatio: 6,
    affordabilityScore: "good",
  },
};

const repaymentRows = buildLoanQuote(150000, 13.41, 24).schedule;

describe("ApplicationResult", () => {
  it("shows the headline, the reason and the money figures for a person who qualifies", () => {
    render(<ApplicationResult loanDecision={qualifyingDecision} repaymentRows={repaymentRows} />);

    expect(screen.getByRole("heading", { name: "Likely eligible" })).toBeInTheDocument();
    expect(
      screen.getByText("Your income covers this loan, but with limited room"),
    ).toBeInTheDocument();
    expect(screen.getByText(/R7,160.19/)).toBeInTheDocument();
    expect(
      screen.getByText("R171,844.70 in total (R21,844.70 interest) · 13.41% a year"),
    ).toBeInTheDocument();
    expect(screen.getByText("Left after expenses")).toBeInTheDocument();
    expect(screen.getByText(/R10,000/)).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("fair")).toBeInTheDocument();
  });

  it("shows the recommended loan, and the most we could offer, to a person who qualifies", () => {
    render(<ApplicationResult loanDecision={qualifyingDecision} repaymentRows={repaymentRows} />);
    expect(
      screen.getByText("Recommended loan: R150,000 · we could offer up to R157,000"),
    ).toBeInTheDocument();
  });

  it("shows how many times the monthly income the loan is", () => {
    render(<ApplicationResult loanDecision={qualifyingDecision} repaymentRows={repaymentRows} />);
    expect(screen.getByText("Loan to income")).toBeInTheDocument();
    expect(screen.getByText("6×")).toBeInTheDocument();
  });

  it("describes the approval chance to screen readers", () => {
    render(<ApplicationResult loanDecision={qualifyingDecision} repaymentRows={repaymentRows} />);
    expect(
      screen.getByRole("img", { name: "Approval likelihood 64 percent, medium risk" }),
    ).toBeInTheDocument();
    expect(screen.getByText("64%")).toBeInTheDocument();
  });

  it("says so, with the reason, when the person is unlikely to be approved", () => {
    render(<ApplicationResult loanDecision={decliningDecision} repaymentRows={[]} />);

    expect(screen.getByRole("heading", { name: "Unlikely to be approved" })).toBeInTheDocument();
    expect(screen.getByText("Credit score is below the minimum of 500")).toBeInTheDocument();
    expect(screen.queryByText(/We could offer up to/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /month-by-month/ })).not.toBeInTheDocument();
  });

  it("shows no monthly payment, total or interest to a person who is declined", () => {
    render(<ApplicationResult loanDecision={decliningDecision} repaymentRows={[]} />);

    expect(screen.queryByText(/R9,088\.24/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\/ month/)).not.toBeInTheDocument();
    expect(screen.queryByText(/in total/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recommended loan/)).not.toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("Left after expenses")).toBeInTheDocument();
    expect(screen.getByText("R2,000")).toBeInTheDocument();
  });

  it("shows none of the three money figures for a person who was not assessed", () => {
    render(<ApplicationResult loanDecision={unassessedDecision} repaymentRows={[]} />);

    expect(screen.getByText("Unemployed applicants cannot be assessed")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.queryByText("Left after expenses")).not.toBeInTheDocument();
    expect(screen.queryByText("Debt to income")).not.toBeInTheDocument();
    expect(screen.queryByText("Affordability")).not.toBeInTheDocument();
    expect(screen.queryByText("good")).not.toBeInTheDocument();
    expect(screen.queryByText(/22,000/)).not.toBeInTheDocument();
  });

  it("labels the debt figure 'Debt to income', without dashes", () => {
    render(<ApplicationResult loanDecision={qualifyingDecision} repaymentRows={repaymentRows} />);
    expect(screen.getByText("Debt to income")).toBeInTheDocument();
  });

  it("offers a smaller loan when the person does not qualify for the one they asked for", () => {
    const stretchedDecision = {
      ...decliningDecision,
      recommendedLoan: { ...decliningDecision.recommendedLoan, maxAmount: 40000 },
    };
    render(<ApplicationResult loanDecision={stretchedDecision} repaymentRows={[]} />);
    expect(screen.getByText(/We could offer up to R40,000/)).toBeInTheDocument();
  });

  it("shows a negative amount left after expenses without crashing or showing NaN", () => {
    const overspendingDecision = {
      ...decliningDecision,
      affordabilityAnalysis: {
        ...decliningDecision.affordabilityAnalysis,
        disposableIncome: -5000,
      },
    };
    render(<ApplicationResult loanDecision={overspendingDecision} repaymentRows={[]} />);
    expect(screen.getByText(/-R5,000/)).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("keeps the repayment table hidden until it is asked for, then shows one row per month", async () => {
    const user = userEvent.setup();
    render(<ApplicationResult loanDecision={qualifyingDecision} repaymentRows={repaymentRows} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const showHideButton = screen.getByRole("button", { name: "Show month-by-month repayments" });
    expect(showHideButton).toHaveAttribute("aria-expanded", "false");
    await user.click(showHideButton);

    expect(screen.getByRole("table", { name: "Month-by-month repayments" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(25);
    expect(screen.getByRole("button", { name: "Hide month-by-month repayments" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Hide month-by-month repayments" }));
    await waitFor(() => expect(screen.queryByRole("table")).not.toBeInTheDocument());
  });

  it("announces only the headline to screen readers, not the whole panel", () => {
    render(<ApplicationResult loanDecision={qualifyingDecision} repaymentRows={repaymentRows} />);
    expect(screen.getByRole("heading", { name: "Likely eligible" })).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("moves the cursor to the headline when a result appears", () => {
    render(<ApplicationResult loanDecision={qualifyingDecision} repaymentRows={repaymentRows} />);
    expect(screen.getByRole("heading", { name: "Likely eligible" })).toHaveFocus();
  });

  it.each([
    ["a person who qualifies", qualifyingDecision, repaymentRows],
    ["a person who does not", decliningDecision, []],
  ])("has no accessibility problems for %s", async (_name, loanDecision, rows) => {
    const { container } = render(
      <ApplicationResult loanDecision={loanDecision} repaymentRows={rows} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("NumberCounter", () => {
  it("shows the final value straight away when the person wants less motion", () => {
    render(<NumberCounter value={7160.19} formatValue={formatCurrency} />);
    expect(screen.getByText(/R7,160.19/)).toBeInTheDocument();
  });

  it("shows the plain number when no format is given", () => {
    render(<NumberCounter value={64} />);
    expect(screen.getByText("64")).toBeInTheDocument();
  });
});
