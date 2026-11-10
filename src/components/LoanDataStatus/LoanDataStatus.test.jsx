import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoanDataContext } from "../../hooks/useLoanData";
import LoanDataStatus from "./LoanDataStatus";

function renderWithStatus(status, retry = vi.fn()) {
  render(
    <LoanDataContext value={{ status, loanProducts: [], validationRules: null, retry }}>
      <LoanDataStatus>
        <p>The page</p>
      </LoanDataStatus>
    </LoanDataContext>,
  );
  return retry;
}

describe("LoanDataStatus", () => {
  it("shows the loader while the loan data is loading", () => {
    renderWithStatus("loading");
    expect(screen.getByText("Loading loan options…")).toBeInTheDocument();
    expect(screen.queryByText("The page")).not.toBeInTheDocument();
  });

  it("shows a message and a Try again button when loading failed", async () => {
    const retry = renderWithStatus("failed");
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load the loan options.");
    expect(screen.queryByText("The page")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("shows the page once the loan data is ready", () => {
    renderWithStatus("ready");
    expect(screen.getByText("The page")).toBeInTheDocument();
    expect(screen.queryByText("Loading loan options…")).not.toBeInTheDocument();
  });
});
