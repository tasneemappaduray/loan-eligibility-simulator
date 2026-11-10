import { describe, expect, it } from "vitest";
import { LOAN_PRODUCTS, VALIDATION_RULES } from "../services/mockData";
import { blankFormValues, findFormProblems, makeApplicationRequest } from "./loanFormChecks";

const personalLoan = LOAN_PRODUCTS.find((loanProduct) => loanProduct.id === "personal_loan");
const vehicleLoan = LOAN_PRODUCTS.find((loanProduct) => loanProduct.id === "vehicle_loan");
const homeLoan = LOAN_PRODUCTS.find((loanProduct) => loanProduct.id === "home_loan");

const validPersonalValues = {
  loanType: "personal_loan",
  purpose: "education",
  age: "35",
  employmentStatus: "employed",
  employmentDuration: "24",
  monthlyIncome: "25000",
  monthlyExpenses: "10000",
  existingDebt: "2000",
  creditScore: "700",
  requestedAmount: "100000",
  loanTerm: "36",
};

// Gives the problem found in one box, or null if that box is fine.
function problemInBox(formValues, boxId, loanProduct = personalLoan) {
  return findFormProblems(formValues, VALIDATION_RULES, loanProduct)[boxId] ?? null;
}

describe("findFormProblems", () => {
  it("finds no problems in a fully valid personal-loan form", () => {
    expect(findFormProblems(validPersonalValues, VALIDATION_RULES, personalLoan)).toEqual({});
  });

  it("finds a problem in every required box of an empty form, and none in the optional ones", () => {
    const problems = findFormProblems(blankFormValues, VALIDATION_RULES, personalLoan);
    expect(Object.keys(problems).sort()).toEqual(
      [
        "age",
        "employmentDuration",
        "employmentStatus",
        "loanTerm",
        "monthlyExpenses",
        "monthlyIncome",
        "purpose",
        "requestedAmount",
      ].sort(),
    );
  });

  it.each(["17", "66"])("rejects age %s", (age) => {
    expect(problemInBox({ ...validPersonalValues, age }, "age")).toBe(
      "Age must be between 18 and 65",
    );
  });

  it("rejects employment duration below the minimum", () => {
    expect(
      problemInBox({ ...validPersonalValues, employmentDuration: "2" }, "employmentDuration"),
    ).toBe("Minimum 3 months employment required");
  });

  it.each([
    ["age", "35.5", "Age must be between 18 and 65"],
    ["employmentDuration", "3.5", "Minimum 3 months employment required"],
    ["loanTerm", "24.5", "Loan term must be between 6 and 60 months"],
  ])("rejects a decimal in %s (%s) because it must be a whole number", (boxId, typed, message) => {
    expect(problemInBox({ ...validPersonalValues, [boxId]: typed }, boxId)).toBe(message);
  });

  it("still accepts cents in money boxes", () => {
    expect(
      problemInBox({ ...validPersonalValues, monthlyIncome: "25000.50" }, "monthlyIncome"),
    ).toBeNull();
  });

  it("does not ask an unemployed person for months employed", () => {
    const unemployedValues = {
      ...validPersonalValues,
      employmentStatus: "unemployed",
      employmentDuration: "",
    };
    expect(problemInBox(unemployedValues, "employmentDuration")).toBeNull();
    expect(findFormProblems(unemployedValues, VALIDATION_RULES, personalLoan)).toEqual({});
  });

  it("still asks everyone else for months employed", () => {
    expect(
      problemInBox(
        { ...validPersonalValues, employmentStatus: "retired", employmentDuration: "" },
        "employmentDuration",
      ),
    ).toBe("Minimum 3 months employment required");
  });

  it("rejects an unselected employment status", () => {
    expect(problemInBox({ ...validPersonalValues, employmentStatus: "" }, "employmentStatus")).toBe(
      "Please select your employment status",
    );
  });

  it("rejects income below the minimum", () => {
    expect(problemInBox({ ...validPersonalValues, monthlyIncome: "4999" }, "monthlyIncome")).toBe(
      "Minimum monthly income of R5,000 required",
    );
  });

  it.each(["", "abc"])("gives the rule message for monthly income %j without crashing", (typed) => {
    expect(problemInBox({ ...validPersonalValues, monthlyIncome: typed }, "monthlyIncome")).toBe(
      "Minimum monthly income of R5,000 required",
    );
  });

  it("requires monthly expenses", () => {
    expect(problemInBox({ ...validPersonalValues, monthlyExpenses: "" }, "monthlyExpenses")).toBe(
      "Please enter your monthly expenses",
    );
  });

  it("accepts blank existing debt and rejects a negative amount", () => {
    expect(problemInBox({ ...validPersonalValues, existingDebt: "" }, "existingDebt")).toBeNull();
    expect(problemInBox({ ...validPersonalValues, existingDebt: "-1" }, "existingDebt")).toBe(
      "Existing debt cannot be negative",
    );
  });

  it.each(["299", "851", "abc"])("rejects credit score %s", (creditScore) => {
    expect(problemInBox({ ...validPersonalValues, creditScore }, "creditScore")).toBe(
      "Credit score must be between 300 and 850",
    );
  });

  it("accepts a blank credit score", () => {
    expect(problemInBox({ ...validPersonalValues, creditScore: "" }, "creditScore")).toBeNull();
  });

  it("accepts 400000 for a vehicle loan but not for a personal loan", () => {
    const personalValues = { ...validPersonalValues, requestedAmount: "400000" };
    expect(problemInBox(personalValues, "requestedAmount", personalLoan)).toBe(
      "Loan amount must be between R5,000 and R300,000",
    );

    const vehicleValues = {
      ...personalValues,
      loanType: "vehicle_loan",
      purpose: "new_vehicle",
      loanTerm: "48",
    };
    expect(problemInBox(vehicleValues, "requestedAmount", vehicleLoan)).toBeNull();
  });

  it("builds the amount and term messages from the loan type's own limits", () => {
    const vehicleValues = {
      ...validPersonalValues,
      loanType: "vehicle_loan",
      purpose: "new_vehicle",
    };
    expect(
      problemInBox({ ...vehicleValues, requestedAmount: "1000" }, "requestedAmount", vehicleLoan),
    ).toBe("Loan amount must be between R50,000 and R1,500,000");
    expect(problemInBox({ ...vehicleValues, loanTerm: "6" }, "loanTerm", vehicleLoan)).toBe(
      "Loan term must be between 12 and 72 months",
    );
  });

  it("uses the rule's own term message for personal loans, including when blank", () => {
    expect(problemInBox({ ...validPersonalValues, loanTerm: "" }, "loanTerm")).toBe(
      "Loan term must be between 6 and 60 months",
    );
  });

  it("requires a purpose that belongs to the chosen loan type", () => {
    expect(problemInBox({ ...validPersonalValues, purpose: "new_vehicle" }, "purpose")).toBe(
      "Please select a loan purpose",
    );
  });
});

describe("makeApplicationRequest", () => {
  it("builds the request with the numbers converted from text", () => {
    expect(makeApplicationRequest(validPersonalValues, personalLoan)).toEqual({
      personalInfo: { age: 35, employmentStatus: "employed", employmentDuration: 24 },
      financialInfo: {
        monthlyIncome: 25000,
        monthlyExpenses: 10000,
        existingDebt: 2000,
        creditScore: 700,
      },
      loanDetails: {
        loanType: "personal_loan",
        loanPurpose: "education",
        requestedAmount: 100000,
        loanTerm: 36,
      },
    });
  });

  it("sends 0 months employed when an unemployed person left it blank", () => {
    const request = makeApplicationRequest(
      {
        ...validPersonalValues,
        employmentStatus: "unemployed",
        employmentDuration: "",
      },
      personalLoan,
    );
    expect(request.personalInfo.employmentDuration).toBe(0);
  });

  it("turns a blank credit score into nothing and blank existing debt into 0", () => {
    const request = makeApplicationRequest(
      {
        ...validPersonalValues,
        creditScore: "",
        existingDebt: "",
      },
      personalLoan,
    );
    expect(request.financialInfo.creditScore).toBeNull();
    expect(request.financialInfo.existingDebt).toBe(0);
  });
});

describe("the home loan form", () => {
  const validHomeValues = {
    ...validPersonalValues,
    loanType: "home_loan",
    purpose: "buy_home",
    propertyPrice: "1500000",
    deposit: "300000",
    requestedAmount: "",
    loanTerm: "240",
  };

  it("finds no problems when the price and deposit are fine, even with no loan amount typed", () => {
    expect(findFormProblems(validHomeValues, VALIDATION_RULES, homeLoan)).toEqual({});
  });

  it("asks for a property price, but treats a blank deposit as no deposit", () => {
    const problems = findFormProblems(
      { ...validHomeValues, propertyPrice: "", deposit: "" },
      VALIDATION_RULES,
      homeLoan,
    );
    expect(problems.propertyPrice).toBe("Please enter the property price");
    expect(problems.deposit).toBeUndefined();
  });

  it("rejects a deposit that is not less than the price", () => {
    expect(problemInBox({ ...validHomeValues, deposit: "1500000" }, "deposit", homeLoan)).toBe(
      "The deposit must be less than the property price",
    );
  });

  it("rejects a negative deposit", () => {
    expect(problemInBox({ ...validHomeValues, deposit: "-1" }, "deposit", homeLoan)).toBe(
      "The deposit cannot be negative",
    );
  });

  it.each([
    ["too small", { propertyPrice: "400000", deposit: "200000" }],
    ["too big", { propertyPrice: "6000000", deposit: "500000" }],
  ])("rejects a loan amount (price minus deposit) that is %s", (_description, boxes) => {
    expect(problemInBox({ ...validHomeValues, ...boxes }, "deposit", homeLoan)).toBe(
      "Price minus deposit must be between R300,000 and R5,000,000",
    );
  });

  it("does not ask for a loan amount box", () => {
    expect(problemInBox(validHomeValues, "requestedAmount", homeLoan)).toBeNull();
  });
});

describe("makeApplicationRequest for a home loan", () => {
  it("sends the price minus the deposit as the loan amount", () => {
    const request = makeApplicationRequest(
      {
        ...validPersonalValues,
        loanType: "home_loan",
        purpose: "buy_home",
        propertyPrice: "1500000",
        deposit: "300000",
        requestedAmount: "",
        loanTerm: "240",
      },
      homeLoan,
    );
    expect(request.loanDetails.requestedAmount).toBe(1200000);
  });

  it("treats a blank deposit as 0", () => {
    const request = makeApplicationRequest(
      { ...validPersonalValues, propertyPrice: "900000", deposit: "", requestedAmount: "" },
      homeLoan,
    );
    expect(request.loanDetails.requestedAmount).toBe(900000);
  });
});
