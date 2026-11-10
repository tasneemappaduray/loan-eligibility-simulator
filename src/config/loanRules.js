// The rules for deciding if someone qualifies for a loan.
// They are kept here so the code and the How it works page always say the same thing.

export const PERCENT = 100;

// The lowest and highest credit score the form accepts.
export const MIN_SCORE = 300;
export const MAX_SCORE = 850;

// Hard rules: breaking either one means the loan is declined.
export const MIN_CREDIT_SCORE = 500;
// Debt payments plus the new loan payment cannot be more than this share of income (0.5 is half).
export const MAX_OBLIGATION_RATIO = 0.5;

// Affordability shows as "good" up to this share of income, and "fair" up to the limit above.
export const GOOD_OBLIGATION_RATIO = 0.35;

// The most we offer is rounded down to a multiple of this many rand.
export const MAX_AMOUNT_STEP = 1000;

// The approval chance is a mix of three scores out of 100. These weights say how much each one counts.
export const CREDIT_WEIGHT = 0.4;
export const OBLIGATION_WEIGHT = 0.3;
export const MARGIN_WEIGHT = 0.3;
// The credit score used when the person did not give one.
export const UNKNOWN_CREDIT_SUBSCORE = 60;
// Having 15% of income left over after the payment earns the full score.
export const FULL_MARGIN_RATIO = 0.15;

// A low, medium or high risk label, based on the approval chance.
export const LOW_RISK_LIKELIHOOD = 75;
export const MEDIUM_RISK_LIKELIHOOD = 50;
