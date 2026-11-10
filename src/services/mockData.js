// The loan types, as the products endpoint would return them.
export const LOAN_PRODUCTS = [
  {
    id: "personal_loan",
    name: "Personal Loan",
    description: "Flexible personal financing for various needs",
    minAmount: 5000.0,
    maxAmount: 300000.0,
    minTerm: 6,
    maxTerm: 60,
    interestRateRange: { min: 10.5, max: 18.5 },
    purposes: ["debt_consolidation", "home_improvement", "education", "medical", "other"],
  },
  {
    id: "vehicle_loan",
    name: "Vehicle Finance",
    description: "Financing for new and used vehicles",
    minAmount: 50000.0,
    maxAmount: 1500000.0,
    minTerm: 12,
    maxTerm: 72,
    interestRateRange: { min: 8.5, max: 15.0 },
    purposes: ["new_vehicle", "used_vehicle"],
  },
  {
    id: "home_loan",
    name: "Home Loan",
    description: "Finance to buy, build or switch your home loan",
    minAmount: 300000.0,
    maxAmount: 5000000.0,
    minTerm: 120,
    maxTerm: 360,
    interestRateRange: { min: 10.5, max: 13.0 },
    purposes: ["buy_home", "build_home", "switch_bond"],
    // The form asks for the property price and a deposit, and works out the loan amount from them.
    needsPropertyPrice: true,
  },
];

// The form's rules, as the validation-rules endpoint would return them.
export const VALIDATION_RULES = {
  personalInfo: {
    age: {
      min: 18,
      max: 65,
      required: true,
      errorMessage: "Age must be between 18 and 65",
    },
    employmentStatus: {
      required: true,
      options: ["employed", "self_employed", "unemployed", "retired"],
      errorMessage: "Please select your employment status",
    },
    employmentDuration: {
      min: 3,
      required: true,
      errorMessage: "Minimum 3 months employment required",
    },
  },
  financialInfo: {
    monthlyIncome: {
      min: 5000.0,
      required: true,
      errorMessage: "Minimum monthly income of R5,000 required",
    },
    monthlyExpenses: {
      min: 0,
      required: true,
      errorMessage: "Please enter your monthly expenses",
    },
    // Not in Capitec's spec: existing debt is optional but cannot be negative.
    existingDebt: {
      min: 0,
      required: false,
      errorMessage: "Existing debt cannot be negative",
    },
    creditScore: {
      min: 300,
      max: 850,
      required: false,
      errorMessage: "Credit score must be between 300 and 850",
    },
  },
  loanDetails: {
    requestedAmount: {
      min: 5000.0,
      max: 300000.0,
      required: true,
      errorMessage: "Loan amount must be between R5,000 and R300,000",
    },
    loanTerm: {
      min: 6,
      max: 60,
      required: true,
      errorMessage: "Loan term must be between 6 and 60 months",
    },
  },
};
