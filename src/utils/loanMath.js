import { PERCENT } from "../config/loanRules";
import { roundMoney } from "./money";

const MONTHS_PER_YEAR = 12;

function monthlyRate(annualRatePct) {
  return annualRatePct / PERCENT / MONTHS_PER_YEAR;
}

function unroundedPayment(principal, annualRatePct, termMonths) {
  const r = monthlyRate(annualRatePct);
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - (1 + r) ** -termMonths);
}

// Works out the fixed amount paid each month.
// The loan must last at least 1 month. The form rules make sure of that.
export function monthlyPayment(principal, annualRatePct, termMonths) {
  return roundMoney(unroundedPayment(principal, annualRatePct, termMonths));
}

// Builds one row of the repayment table: the interest for the month, and how the payment is split.
// The last month pays off exactly what is left, so no stray cents remain.
function scheduleRow({ month, balance, rate, payment, isLast }) {
  const interest = roundMoney(balance * rate);
  if (isLast) {
    return {
      month,
      payment: roundMoney(balance + interest),
      principal: balance,
      interest,
      balance: 0,
    };
  }
  const principalPaid = roundMoney(payment - interest);
  return {
    month,
    payment,
    principal: principalPaid,
    interest,
    balance: roundMoney(balance - principalPaid),
  };
}

// Builds the full quote: monthly payment, total to pay back, total interest and the month-by-month table.
// The loan must last at least 1 month. The form rules make sure of that.
export function buildLoanQuote(principal, annualRatePct, termMonths) {
  const payment = monthlyPayment(principal, annualRatePct, termMonths);
  const rate = monthlyRate(annualRatePct);
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= termMonths; month += 1) {
    const row = scheduleRow({ month, balance, rate, payment, isLast: month === termMonths });
    schedule.push(row);
    balance = row.balance;
  }

  const totalRepayment = roundMoney(schedule.reduce((sum, row) => sum + row.payment, 0));
  return {
    monthlyPayment: payment,
    totalRepayment,
    totalInterest: roundMoney(totalRepayment - principal),
    schedule,
  };
}

// The most someone could borrow if they can only afford this much each month. Gives 0 if they can afford nothing.
export function maxPrincipalForPayment(maxMonthlyPayment, annualRatePct, termMonths) {
  if (maxMonthlyPayment <= 0) return 0;
  const r = monthlyRate(annualRatePct);
  if (r === 0) return maxMonthlyPayment * termMonths;
  return (maxMonthlyPayment * (1 - (1 + r) ** -termMonths)) / r;
}
