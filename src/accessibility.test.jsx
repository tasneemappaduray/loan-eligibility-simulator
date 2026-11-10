import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import App from "./App";
import { LoanDataProvider } from "./context/LoanDataContext";
import * as loanApi from "./services/loanApi";

function renderApp(startAddress) {
  return render(
    <MemoryRouter initialEntries={[startAddress]}>
      <LoanDataProvider>
        <App />
      </LoanDataProvider>
    </MemoryRouter>,
  );
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

describe("accessibility", () => {
  beforeEach(() => {
    loanApi.setMockLatency(0);
  });

  it("has no problems on the loan products page", async () => {
    const { container } = renderApp("/");
    await screen.findByRole("heading", { name: "Our loans" });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no problems on the empty simulator page", async () => {
    const { container } = renderApp("/simulator/personal_loan");
    await screen.findByRole("heading", { name: "Personal Loan" });
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no problems on the simulator page when error messages are showing", async () => {
    const { container } = renderApp("/simulator/personal_loan");
    await screen.findByRole("heading", { name: "Personal Loan" });
    await userEvent.click(screen.getByRole("button", { name: "Check eligibility" }));
    await screen.findByText("Minimum monthly income of R5,000 required");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no problems on the simulator page with a result and the repayment table open", async () => {
    const user = userEvent.setup();
    const { container } = renderApp("/simulator/personal_loan");
    await screen.findByRole("heading", { name: "Personal Loan" });
    await fillInQualifyingPerson(user);
    await user.click(screen.getByRole("button", { name: "Check eligibility" }));
    await screen.findByRole("heading", { name: "Likely eligible" });
    await user.click(screen.getByRole("button", { name: "Show month-by-month repayments" }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no problems on the how it works page", async () => {
    const { container } = renderApp("/how-it-works");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no problems on the page not found page", async () => {
    const { container } = renderApp("/nope");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("lets a keyboard user reach the logo and the side menu links in reading order", async () => {
    const user = userEvent.setup();
    renderApp("/how-it-works");
    await screen.findByRole("link", { name: "Vehicle Finance" });

    for (const name of [
      "Capitec",
      "Loan products",
      "Personal Loan",
      "Vehicle Finance",
      "Home Loan",
      "How it works",
    ]) {
      await user.tab();
      expect(screen.getByRole("link", { name })).toHaveFocus();
    }
  });

  it("marks the page you are on in the side menu", async () => {
    renderApp("/how-it-works");
    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Loan products" })).not.toHaveAttribute("aria-current");
  });
});
