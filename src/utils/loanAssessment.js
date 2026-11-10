import {
  CREDIT_WEIGHT,
  FULL_MARGIN_RATIO,
  GOOD_OBLIGATION_RATIO,
  LOW_RISK_LIKELIHOOD,
  MARGIN_WEIGHT,
  MAX_AMOUNT_STEP,
  MAX_OBLIGATION_RATIO,
  MAX_SCORE,
  MEDIUM_RISK_LIKELIHOOD,
  MIN_CREDIT_SCORE,
  MIN_SCORE,
  OBLIGATION_WEIGHT,
  PERCENT,
  UNKNOWN_CREDIT_SUBSCORE,
} from "../config/loanRules";
import { buildLoanQuote, maxPrincipalForPayment } from "./loanMath";
import { keepWithinRange, roundMoney } from "./money";
import { rateForCreditScore } from "./rate";

const REASONS = {
  noIncome: "Income is required to assess this loan",
  unemployed: "Unemployed applicants cannot be assessed",
  lowScore: `Credit score is below the minimum of ${MIN_CREDIT_SCORE}`,
  paymentTooHigh: "The monthly payment is more than your income left after expenses",
  tooMuchDebt: `Total debt payments would be more than ${MAX_OBLIGATION_RATIO * PERCENT}% of your income`,
  comfortable: "Your income comfortably covers this loan",
  limited: "Your income covers this loan, but with limited room",
};

function affordabilityScoreFor(obligationRatio) {
  if (obligationRatio <= GOOD_OBLIGATION_RATIO) return "good";
  if (obligationRatio <= MAX_OBLIGATION_RATIO) return "fair";
  return "poor";
}

function riskCategoryFor(likelihood) {
  if (likelihood >= LOW_RISK_LIKELIHOOD) return "low";
  if (likelihood >= MEDIUM_RISK_LIKELIHOOD) return "medium";
  return "high";
}

function approvalLikelihoodFor({ creditScore, obligationRatio, income, left, payment }) {
  const credit =
    creditScore == null
      ? UNKNOWN_CREDIT_SUBSCORE
      : ((creditScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * PERCENT;
  const obligation = keepWithinRange(PERCENT * (1 - obligationRatio), 0, PERCENT);
  const margin = keepWithinRange(
    (PERCENT * ((left - payment) / income)) / FULL_MARGIN_RATIO,
    0,
    PERCENT,
  );
  const blended = CREDIT_WEIGHT * credit + OBLIGATION_WEIGHT * obligation + MARGIN_WEIGHT * margin;
  return keepWithinRange(Math.round(blended), 0, PERCENT);
}

function declineReason({ isUnemployed, hasLowScore, payment, left, obligationRatio }) {
  if (isUnemployed) return REASONS.unemployed;
  if (hasLowScore) return REASONS.lowScore;
  if (payment > left) return REASONS.paymentTooHigh;
  if (obligationRatio > MAX_OBLIGATION_RATIO) return REASONS.tooMuchDebt;
  return null;
}

// Works out if the person qualifies, how much they could borrow, and what they would pay.
export function checkIfPersonQualifies({ personalInfo, financialInfo, loanDetails, product }) {
  const {
    monthlyIncome: income,
    monthlyExpenses: expenses,
    existingDebt,
    creditScore,
  } = financialInfo;
  const { requestedAmount, loanTerm } = loanDetails;

  const left = income - expenses;
  const hasIncome = income > 0;
  const interestRate = rateForCreditScore(product.interestRateRange, creditScore);
  const quote = buildLoanQuote(requestedAmount, interestRate, loanTerm);
  const payment = quote.monthlyPayment;
  const obligationRatio = hasIncome ? (existingDebt + payment) / income : 0;

  const isUnemployed = personalInfo.employmentStatus === "unemployed";
  const hasLowScore = creditScore != null && creditScore < MIN_CREDIT_SCORE;
  const reason = hasIncome
    ? declineReason({ isUnemployed, hasLowScore, payment, left, obligationRatio })
    : REASONS.noIncome;
  const isEligible = reason === null;

  // If the payment is more than the money left after expenses, it is never "good" or "fair".
  const affordabilityScore = payment > left ? "poor" : affordabilityScoreFor(obligationRatio);
  // Someone who is declined shows 0%, so the result never says "declined" next to a high chance.
  const approvalLikelihood = isEligible
    ? approvalLikelihoodFor({ creditScore, obligationRatio, income, left, payment })
    : 0;

  const canBorrow = hasIncome && !isUnemployed && !hasLowScore;
  const affordablePayment = Math.min(left, MAX_OBLIGATION_RATIO * income - existingDebt);
  const largestAffordableAmount = canBorrow
    ? Math.min(
        Math.floor(
          maxPrincipalForPayment(affordablePayment, interestRate, loanTerm) / MAX_AMOUNT_STEP,
        ) * MAX_AMOUNT_STEP,
        product.maxAmount,
      )
    : 0;
  // We never offer less than the loan type's own minimum, and never less than an eligible
  // person asked for (rounding down to the step could otherwise cut it).
  const maxAmount = isEligible
    ? Math.max(largestAffordableAmount, requestedAmount)
    : largestAffordableAmount >= product.minAmount
      ? largestAffordableAmount
      : 0;

  return {
    eligibilityResult: {
      isEligible,
      // False when the money figures mean nothing: an unemployed person, or no income at all.
      isAssessed: hasIncome && !isUnemployed,
      approvalLikelihood,
      riskCategory: riskCategoryFor(approvalLikelihood),
      decisionReason: isEligible
        ? affordabilityScore === "good"
          ? REASONS.comfortable
          : REASONS.limited
        : reason,
    },
    recommendedLoan: {
      maxAmount,
      recommendedAmount: Math.min(requestedAmount, maxAmount),
      interestRate,
      monthlyPayment: payment,
      totalRepayment: quote.totalRepayment,
    },
    affordabilityAnalysis: {
      debtToIncomeRatio: hasIncome ? roundMoney((existingDebt / income) * PERCENT) : 0,
      loanToIncomeRatio: hasIncome ? roundMoney(requestedAmount / income) : 0,
      disposableIncome: left,
      affordabilityScore,
    },
  };
}
