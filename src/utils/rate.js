import { MAX_SCORE, MIN_SCORE } from "../config/loanRules";
import { keepWithinRange, roundMoney } from "./money";

// Works out the interest rate from a credit score. The better the score, the lower the rate. With no score, it uses the middle rate.
export function rateForCreditScore(range, creditScore) {
  if (creditScore == null) return roundMoney((range.min + range.max) / 2);
  const position =
    (keepWithinRange(creditScore, MIN_SCORE, MAX_SCORE) - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);
  return roundMoney(range.max - position * (range.max - range.min));
}
