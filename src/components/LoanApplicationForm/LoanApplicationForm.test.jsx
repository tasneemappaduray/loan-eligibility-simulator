import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { LOAN_PRODUCTS, VALIDATION_RULES } from "../../services/mockData";
import LoanApplicationForm from "./LoanApplicationForm";

const personalLoan = LOAN_PRODUCTS.find((loanProduct) => loanProduct.id === "personal_loan");
const vehicleLoan = LOAN_PRODUCTS.find((loanProduct) => loanProduct.id === "vehicle_loan");
const homeLoan = LOAN_PRODUCTS.find((loanProduct) => loanProduct.id === "home_loan");

function renderForm(overrides = {}) {
  const props = {
    validationRules: VALIDATION_RULES,
    loanProduct: personalLoan,
    isSending: false,
    onSendApplication: vi.fn(),
    ...overrides,
  };
  const view = render(<LoanApplicationForm {...props} />);
  return { ...props, ...view };
}

async function fillInQualifyingPerson(user) {
  await user.selectOptions(screen.getByLabelText("Employment status"), "employed");
  await user.type(screen.getByLabelText("Age"), "35");
  await user.type(screen.getByLabelText("Months employed"), "24");
  await user.type(screen.getByLabelText("Monthly income"), "25000");
  await user.type(screen.getByLabelText("Monthly expenses"), "15000");
  await user.type(screen.getByLabelText("Existing monthly debt"), "5000");
  await user.type(screen.getByLabelText("Credit score (optional)"), "650");
  await user.type(screen.getByLabelText("Loan amount"), "150000");
  await user.type(screen.getByLabelText("Loan term (months)"), "24");
}

describe("LoanApplicationForm", () => {
  it("shows the three sections and the Check eligibility button", () => {
    renderForm();
    for (const title of ["About you", "Your money", "The loan"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Check eligibility" })).toBeInTheDocument();
  });

  it("shows the rule's error and sends nothing when the form is empty", async () => {
    const { onSendApplication } = renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Check eligibility" }));

    expect(
      await screen.findByText("Minimum monthly income of R5,000 required"),
    ).toBeInTheDocument();
    expect(onSendApplication).not.toHaveBeenCalled();
  });

  it("sends the application once when everything is filled in correctly", async () => {
    const user = userEvent.setup();
    const { onSendApplication } = renderForm();
    await fillInQualifyingPerson(user);
    await user.click(screen.getByRole("button", { name: "Check eligibility" }));

    await waitFor(() => expect(onSendApplication).toHaveBeenCalledTimes(1));
    expect(onSendApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        personalInfo: expect.objectContaining({ age: 35, employmentStatus: "employed" }),
        financialInfo: expect.objectContaining({ monthlyIncome: 25000, creditScore: 650 }),
        loanDetails: expect.objectContaining({
          loanType: "personal_loan",
          requestedAmount: 150000,
          loanTerm: 24,
        }),
      }),
    );
  });

  it("cannot be filled with letters or a decimal age, and never shows NaN", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Monthly income"), "abc");
    await user.type(screen.getByLabelText("Age"), "35.5");

    expect(screen.getByLabelText("Monthly income")).toHaveValue("");
    expect(screen.getByLabelText("Age")).toHaveValue("355");
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("shows the rule's error when a box is left blank and the person moves on", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByLabelText("Monthly income"));
    await user.tab();

    expect(
      await screen.findByText("Minimum monthly income of R5,000 required"),
    ).toBeInTheDocument();
  });

  it("moves the amount slider when an amount is typed, and the box when the slider moves", async () => {
    const user = userEvent.setup();
    renderForm();
    const amountBox = screen.getByLabelText("Loan amount");
    const amountSlider = screen.getByLabelText("Loan amount slider");

    await user.type(amountBox, "120000");
    expect(amountSlider).toHaveValue("120000");

    fireEvent.change(amountSlider, { target: { value: "200000" } });
    expect(amountBox).toHaveValue("200000");
  });

  it("shows no value on the sliders until the person types or drags", async () => {
    const user = userEvent.setup();
    renderForm();
    expect(screen.getByLabelText("Loan amount slider")).not.toHaveAttribute("aria-valuetext");
    expect(screen.getByLabelText("Loan term slider")).not.toHaveAttribute("aria-valuetext");

    await user.type(screen.getByLabelText("Loan amount"), "120000");
    await user.type(screen.getByLabelText("Loan term (months)"), "24");
    expect(screen.getByLabelText("Loan amount slider")).toHaveAttribute(
      "aria-valuetext",
      expect.stringMatching(/R120,000/),
    );
    expect(screen.getByLabelText("Loan term slider")).toHaveAttribute(
      "aria-valuetext",
      "24 months",
    );
  });

  it("moves the term slider and the term box together", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Loan term (months)"), "24");
    expect(screen.getByLabelText("Loan term slider")).toHaveValue("24");

    fireEvent.change(screen.getByLabelText("Loan term slider"), { target: { value: "36" } });
    expect(screen.getByLabelText("Loan term (months)")).toHaveValue("36");
  });

  it("has no loan type dropdown, because the page already says which loan it is", () => {
    renderForm();
    expect(screen.queryByLabelText("Loan type")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Loan purpose")).toBeInTheDocument();
  });

  it("offers the purposes of the chosen loan type in readable words", () => {
    renderForm({ loanProduct: vehicleLoan });
    const purposeBox = screen.getByLabelText("Loan purpose");
    expect(
      Array.from(purposeBox.querySelectorAll("option")).map((option) => option.textContent),
    ).toEqual(["New vehicle", "Used vehicle"]);
  });

  it("disables the button and marks it busy while sending", () => {
    renderForm({ isSending: true });
    const button = screen.getByRole("button", { name: "Check eligibility" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("puts the cursor in the first box with a problem after a failed send", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Check eligibility" }));
    await waitFor(() => expect(screen.getByLabelText("Employment status")).toHaveFocus());
  });

  it("has no accessibility problems, empty or showing errors", async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();

    await userEvent.click(screen.getByRole("button", { name: "Check eligibility" }));
    await screen.findByText("Minimum monthly income of R5,000 required");
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("LoanApplicationForm for a home loan", () => {
  it("asks for a property price and a deposit instead of a loan amount", () => {
    renderForm({ loanProduct: homeLoan });
    expect(screen.getByLabelText("Property price")).toBeInTheDocument();
    expect(screen.getByLabelText("Deposit")).toBeInTheDocument();
    expect(screen.queryByLabelText("Loan amount")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Loan amount slider")).not.toBeInTheDocument();
  });

  it("shows the loan amount worked out from the price and deposit as they are typed", async () => {
    const user = userEvent.setup();
    renderForm({ loanProduct: homeLoan });
    expect(screen.getByText("Loan amount: —")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Property price"), "1500000");
    await user.type(screen.getByLabelText("Deposit"), "300000");
    expect(screen.getByText("Loan amount: R1,200,000")).toBeInTheDocument();
  });

  it("sends the price minus the deposit as the loan amount", async () => {
    const user = userEvent.setup();
    const { onSendApplication } = renderForm({ loanProduct: homeLoan });
    await user.selectOptions(screen.getByLabelText("Employment status"), "employed");
    await user.type(screen.getByLabelText("Age"), "35");
    await user.type(screen.getByLabelText("Months employed"), "24");
    await user.type(screen.getByLabelText("Monthly income"), "60000");
    await user.type(screen.getByLabelText("Monthly expenses"), "15000");
    await user.type(screen.getByLabelText("Property price"), "1500000");
    await user.type(screen.getByLabelText("Deposit"), "300000");
    await user.type(screen.getByLabelText("Loan term (months)"), "240");
    await user.click(screen.getByRole("button", { name: "Check eligibility" }));

    await waitFor(() => expect(onSendApplication).toHaveBeenCalledTimes(1));
    expect(onSendApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        loanDetails: expect.objectContaining({
          loanType: "home_loan",
          requestedAmount: 1200000,
          loanTerm: 240,
        }),
      }),
    );
  });

  it("shows the error under the deposit when it is as big as the price", async () => {
    const user = userEvent.setup();
    renderForm({ loanProduct: homeLoan });
    await user.type(screen.getByLabelText("Property price"), "900000");
    await user.type(screen.getByLabelText("Deposit"), "900000");
    await user.tab();

    expect(
      await screen.findByText("The deposit must be less than the property price"),
    ).toBeInTheDocument();
  });

  it("has no accessibility problems", async () => {
    const { container } = renderForm({ loanProduct: homeLoan });
    expect(await axe(container)).toHaveNoViolations();
  });
});
