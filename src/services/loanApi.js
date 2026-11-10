import { MOCK_LATENCY_MS } from "../config/env";
import { buildLoanQuote } from "../utils/loanMath";
import { rateForCreditScore } from "../utils/rate";
import { checkIfPersonQualifies } from "../utils/loanAssessment";
import { LOAN_PRODUCTS, VALIDATION_RULES } from "./mockData";

let latencyMs = MOCK_LATENCY_MS;

// An error from the pretend server, so it can be told apart from other errors.
export class ApiError extends Error {
  name = "ApiError";
}

// Sets how long the pretend server waits before answering.
export function setMockLatency(ms) {
  latencyMs = ms;
}

// Waits for the pretend delay, then hands back a fresh copy of the data so nobody can change the original.
function respond(produce) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(structuredClone(produce()));
      } catch (error) {
        reject(error);
      }
    }, latencyMs);
  });
}

function findProduct(loanType) {
  const product = LOAN_PRODUCTS.find((candidate) => candidate.id === loanType);
  if (!product) throw new ApiError("Unknown loan type");
  return product;
}

// Pretends to be GET /api/loans/products: the list of loan types.
export function getLoanProducts() {
  return respond(() => ({ products: LOAN_PRODUCTS }));
}

// Pretends to be GET /api/loans/validation-rules: the form's rules.
export function getValidationRules() {
  return respond(() => VALIDATION_RULES);
}

// Pretends to be POST /api/loans/eligibility: checks if the person qualifies.
export function checkLoanApplication(request) {
  return respond(() =>
    checkIfPersonQualifies({ ...request, product: findProduct(request.loanDetails.loanType) }),
  );
}

// Pretends to be POST /api/loans/calculate-rate: works out the rate and the month-by-month table.
export function calculateRate({ loanAmount, loanTerm, creditScore, loanType }) {
  return respond(() => {
    const product = findProduct(loanType);
    const interestRate = rateForCreditScore(product.interestRateRange, creditScore);
    const { schedule, ...quote } = buildLoanQuote(loanAmount, interestRate, loanTerm);
    return { interestRate, ...quote, paymentSchedule: schedule };
  });
}
