import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LOAN_PRODUCTS } from "../../services/mockData";
import LoanProductCard from "./LoanProductCard";

const personalLoan = LOAN_PRODUCTS.find((loanProduct) => loanProduct.id === "personal_loan");

describe("LoanProductCard", () => {
  it("shows the loan's name, description and its three facts", () => {
    render(
      <MemoryRouter>
        <LoanProductCard loanProduct={personalLoan} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Personal Loan" })).toBeInTheDocument();
    expect(screen.getByText("Flexible personal financing for various needs")).toBeInTheDocument();
    expect(screen.getByText("Borrow")).toBeInTheDocument();
    expect(screen.getByText(/R5,000 to R300,000/)).toBeInTheDocument();
    expect(screen.getByText("Repay over")).toBeInTheDocument();
    expect(screen.getByText("6 to 60 months")).toBeInTheDocument();
    expect(screen.getByText("Interest rate")).toBeInTheDocument();
    expect(screen.getByText("10.5% to 18.5%")).toBeInTheDocument();
  });

  it("links to the simulator for that loan", () => {
    render(
      <MemoryRouter>
        <LoanProductCard loanProduct={personalLoan} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "See if I qualify" })).toHaveAttribute(
      "href",
      "/simulator/personal_loan",
    );
  });
});
