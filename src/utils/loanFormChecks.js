import { formatCurrencyWhole } from "./format";

// What the form starts with. Numbers are kept as text because that is what a text box gives us.
export const blankFormValues = {
  loanType: "personal_loan",
  purpose: "",
  age: "",
  employmentStatus: "",
  employmentDuration: "",
  monthlyIncome: "",
  monthlyExpenses: "",
  existingDebt: "",
  creditScore: "",
  requestedAmount: "",
  propertyPrice: "",
  deposit: "",
  loanTerm: "",
};

const isBlank = (typedText) => typedText.trim() === "";

// True when the text is a number inside the limits. Blank text and text like "abc" are not.
function isWithinLimits(typedText, { min, max, wholeNumber = false }) {
  if (isBlank(typedText)) return false;
  const number = Number(typedText);
  if (!Number.isFinite(number)) return false;
  if (wholeNumber && !Number.isInteger(number)) return false;
  if (min !== undefined && number < min) return false;
  if (max !== undefined && number > max) return false;
  return true;
}

// The loan amount for a home loan is the property price minus the deposit. A blank deposit is 0.
export function homeLoanAmount(formValues) {
  const deposit = isBlank(formValues.deposit) ? 0 : Number(formValues.deposit);
  return Number(formValues.propertyPrice) - deposit;
}

// Checks the property price and deposit of a home loan, and gives back the problem found in each
// of those two boxes. The loan amount worked out from them has to fit the loan type's limits.
function findHomeLoanProblems(formValues, loanProduct) {
  const problems = {};

  if (!isWithinLimits(formValues.propertyPrice, { min: 1 })) {
    problems.propertyPrice = "Please enter the property price";
    return problems;
  }
  if (!isBlank(formValues.deposit) && !isWithinLimits(formValues.deposit, { min: 0 })) {
    problems.deposit = "The deposit cannot be negative";
    return problems;
  }

  const loanAmount = homeLoanAmount(formValues);
  if (loanAmount <= 0) {
    problems.deposit = "The deposit must be less than the property price";
  } else if (loanAmount < loanProduct.minAmount || loanAmount > loanProduct.maxAmount) {
    problems.deposit = `Price minus deposit must be between ${formatCurrencyWhole(loanProduct.minAmount)} and ${formatCurrencyWhole(loanProduct.maxAmount)}`;
  }
  return problems;
}

// Uses the message from the rules when the loan type has the same limits as the rules.
// Otherwise builds a message from this loan type's own limits.
function limitMessage(rule, limits, makeMessage) {
  const sameAsRule = Object.entries(limits).every(
    ([limitName, limit]) => rule[limitName] === limit,
  );
  return sameAsRule ? rule.errorMessage : makeMessage(limits);
}

// Checks every box and gives back the error message for each box that has a problem,
// like { age: "Age must be between 18 and 65" }. Gives back an empty object when all is well.
export function findFormProblems(formValues, validationRules, loanProduct) {
  const { personalInfo, financialInfo, loanDetails } = validationRules;
  const problems = {};

  if (!loanProduct.purposes.includes(formValues.purpose)) {
    problems.purpose = "Please select a loan purpose";
  }
  if (!personalInfo.employmentStatus.options.includes(formValues.employmentStatus)) {
    problems.employmentStatus = personalInfo.employmentStatus.errorMessage;
  }
  if (!isWithinLimits(formValues.age, { ...personalInfo.age, wholeNumber: true })) {
    problems.age = personalInfo.age.errorMessage;
  }
  // Someone who is unemployed has no months employed to enter.
  if (
    formValues.employmentStatus !== "unemployed" &&
    !isWithinLimits(formValues.employmentDuration, {
      ...personalInfo.employmentDuration,
      wholeNumber: true,
    })
  ) {
    problems.employmentDuration = personalInfo.employmentDuration.errorMessage;
  }
  if (!isWithinLimits(formValues.monthlyIncome, financialInfo.monthlyIncome)) {
    problems.monthlyIncome = financialInfo.monthlyIncome.errorMessage;
  }
  if (!isWithinLimits(formValues.monthlyExpenses, financialInfo.monthlyExpenses)) {
    problems.monthlyExpenses = financialInfo.monthlyExpenses.errorMessage;
  }
  // These two may be left blank, but if something is typed it must be fine.
  if (
    !isBlank(formValues.existingDebt) &&
    !isWithinLimits(formValues.existingDebt, financialInfo.existingDebt)
  ) {
    problems.existingDebt = financialInfo.existingDebt.errorMessage;
  }
  if (
    !isBlank(formValues.creditScore) &&
    !isWithinLimits(formValues.creditScore, financialInfo.creditScore)
  ) {
    problems.creditScore = financialInfo.creditScore.errorMessage;
  }

  if (loanProduct.needsPropertyPrice) {
    Object.assign(problems, findHomeLoanProblems(formValues, loanProduct));
  } else {
    const amountLimits = { min: loanProduct.minAmount, max: loanProduct.maxAmount };
    if (!isWithinLimits(formValues.requestedAmount, amountLimits)) {
      problems.requestedAmount = limitMessage(
        loanDetails.requestedAmount,
        amountLimits,
        ({ min, max }) =>
          `Loan amount must be between ${formatCurrencyWhole(min)} and ${formatCurrencyWhole(max)}`,
      );
    }
  }
  const termLimits = { min: loanProduct.minTerm, max: loanProduct.maxTerm };
  if (!isWithinLimits(formValues.loanTerm, { ...termLimits, wholeNumber: true })) {
    problems.loanTerm = limitMessage(
      loanDetails.loanTerm,
      termLimits,
      ({ min, max }) => `Loan term must be between ${min} and ${max} months`,
    );
  }

  return problems;
}

// Turns the form's answers into the shape the loan check expects. A home loan sends the price
// minus the deposit as the loan amount. A blank credit score becomes nothing, and blank existing debt becomes 0.
export function makeApplicationRequest(formValues, loanProduct) {
  return {
    personalInfo: {
      age: Number(formValues.age),
      employmentStatus: formValues.employmentStatus,
      employmentDuration: Number(formValues.employmentDuration),
    },
    financialInfo: {
      monthlyIncome: Number(formValues.monthlyIncome),
      monthlyExpenses: Number(formValues.monthlyExpenses),
      existingDebt: isBlank(formValues.existingDebt) ? 0 : Number(formValues.existingDebt),
      creditScore: isBlank(formValues.creditScore) ? null : Number(formValues.creditScore),
    },
    loanDetails: {
      loanType: formValues.loanType,
      loanPurpose: formValues.purpose,
      requestedAmount: loanProduct.needsPropertyPrice
        ? homeLoanAmount(formValues)
        : Number(formValues.requestedAmount),
      loanTerm: Number(formValues.loanTerm),
    },
  };
}
