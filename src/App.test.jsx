import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("App", () => {
  beforeEach(() => {
    loanApi.setMockLatency(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("the loan products page", () => {
    it("shows the loader first, then a card for each loan type", async () => {
      renderApp("/");
      expect(screen.getByText("Loading loan options…")).toBeInTheDocument();

      expect(await screen.findByRole("heading", { name: "Our loans" })).toBeInTheDocument();
      expect(
        screen.getByText("Compare our loans, then check whether you qualify."),
      ).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Personal Loan" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Vehicle Finance" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Home Loan" })).toBeInTheDocument();

      const links = screen.getAllByRole("link", { name: "See if I qualify" });
      expect(links.map((link) => link.getAttribute("href"))).toEqual([
        "/simulator/personal_loan",
        "/simulator/vehicle_loan",
        "/simulator/home_loan",
      ]);
    });

    it("puts the page name on the browser tab", async () => {
      renderApp("/");
      await screen.findByRole("heading", { name: "Our loans" });
      await waitFor(() =>
        expect(document.title).toBe("Loan products · Loan Eligibility Simulator"),
      );
    });

    it("shows a message and recovers when the loan options fail to load", async () => {
      vi.spyOn(loanApi, "getLoanProducts").mockRejectedValueOnce(new Error("offline"));
      renderApp("/");

      expect(await screen.findByText("We couldn't load the loan options.")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Try again" }));
      expect(await screen.findByRole("heading", { name: "Our loans" })).toBeInTheDocument();
    });
  });

  describe("the top bar and the side menu", () => {
    it("has the Capitec logo, which leads home, and a label beside it", async () => {
      renderApp("/how-it-works");
      expect(screen.getByRole("link", { name: "Capitec" })).toHaveAttribute("href", "/");
      expect(screen.getByText("Loan Simulator")).toBeInTheDocument();
    });

    it("credits its creator at the bottom of the side panel", () => {
      renderApp("/how-it-works");
      expect(
        within(screen.getByRole("navigation")).getByText("Created by Tasneem Appaduray"),
      ).toBeInTheDocument();
    });

    it("lists the loan types in the side menu only once they have loaded", async () => {
      renderApp("/how-it-works");
      expect(screen.queryByRole("link", { name: "Personal Loan" })).not.toBeInTheDocument();
      expect(await screen.findByRole("link", { name: "Personal Loan" })).toBeInTheDocument();
    });

    it("groups the links under Loans and Information", async () => {
      renderApp("/");
      await screen.findByRole("link", { name: "Vehicle Finance" });

      const menu = within(screen.getByRole("navigation"));
      expect(menu.getByText("Loans")).toBeInTheDocument();
      expect(menu.getByText("Information")).toBeInTheDocument();
      expect(
        menu
          .getAllByRole("link")
          .map((link) => [link.textContent.trim(), link.getAttribute("href")]),
      ).toEqual([
        ["Loan products", "/"],
        ["Personal Loan", "/simulator/personal_loan"],
        ["Vehicle Finance", "/simulator/vehicle_loan"],
        ["Home Loan", "/simulator/home_loan"],
        ["How it works", "/how-it-works"],
      ]);
    });

    it("moves between pages and puts the page name on the browser tab", async () => {
      const user = userEvent.setup();
      renderApp("/");
      await screen.findByRole("heading", { name: "Our loans" });

      const menu = within(screen.getByRole("navigation"));
      await user.click(menu.getByRole("link", { name: "How it works" }));
      expect(await screen.findByRole("heading", { name: "How it works" })).toBeInTheDocument();
      await waitFor(() => expect(document.title).toBe("How it works · Loan Eligibility Simulator"));

      await user.click(menu.getByRole("link", { name: "Loan products" }));
      expect(await screen.findByRole("heading", { name: "Our loans" })).toBeInTheDocument();
    });

    it("marks the page you are on in the side menu", async () => {
      renderApp("/simulator/vehicle_loan");
      const vehicleLink = await screen.findByRole("link", { name: "Vehicle Finance" });
      expect(vehicleLink).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: "Personal Loan" })).not.toHaveAttribute(
        "aria-current",
      );
    });
  });

  describe("the how it works page", () => {
    it("explains the rules, using the numbers from the rules file", () => {
      renderApp("/how-it-works");
      expect(screen.getByRole("heading", { name: "How it works" })).toBeInTheDocument();
      expect(
        screen.getByText("This simulator gives an estimate, not a promise."),
      ).toBeInTheDocument();
      expect(screen.getByText(/more than 50% of your income/)).toBeInTheDocument();
      expect(screen.getByText(/must be 500 or more/)).toBeInTheDocument();
    });
  });

  describe("pages that do not exist", () => {
    it.each(["/nope", "/simulator/boat"])("shows Page not found for %s", async (address) => {
      renderApp(address);
      expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Back to loan products" })).toHaveAttribute(
        "href",
        "/",
      );
      await waitFor(() =>
        expect(document.title).toBe("Page not found · Loan Eligibility Simulator"),
      );
    });
  });

  describe("the simulator page", () => {
    it("shows the loan's name and description, the form, and a hint where the result will be", async () => {
      renderApp("/simulator/personal_loan");

      expect(await screen.findByRole("heading", { name: "Personal Loan" })).toBeInTheDocument();
      expect(screen.getByText("Flexible personal financing for various needs")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Check eligibility" })).toBeInTheDocument();
      expect(
        screen.getByText("Fill in the form and press Check eligibility to see your result."),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(document.title).toBe("Loan simulator · Loan Eligibility Simulator"),
      );
    });

    it("goes from the loan products page to a result and the repayment table", async () => {
      const user = userEvent.setup();
      renderApp("/");

      const links = await screen.findAllByRole("link", { name: "See if I qualify" });
      await user.click(links[0]);
      await screen.findByRole("heading", { name: "Personal Loan" });

      await fillInQualifyingPerson(user);
      await user.click(screen.getByRole("button", { name: "Check eligibility" }));

      expect(await screen.findByRole("heading", { name: "Likely eligible" })).toBeInTheDocument();
      expect(screen.getByText(/R7,160.19/)).toBeInTheDocument();
      expect(
        screen.queryByText("Fill in the form and press Check eligibility to see your result."),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Show month-by-month repayments" }));
      expect(screen.getAllByRole("row")).toHaveLength(25);
    });

    it("does not show the fill-in hint while the form is being sent", async () => {
      const user = userEvent.setup();
      vi.spyOn(loanApi, "checkLoanApplication").mockReturnValue(new Promise(() => {}));
      renderApp("/simulator/personal_loan");
      await screen.findByRole("heading", { name: "Personal Loan" });

      await fillInQualifyingPerson(user);
      await user.click(screen.getByRole("button", { name: "Check eligibility" }));

      expect(screen.getByRole("button", { name: "Check eligibility" })).toHaveAttribute(
        "aria-busy",
        "true",
      );
      expect(
        screen.queryByText("Fill in the form and press Check eligibility to see your result."),
      ).not.toBeInTheDocument();
    });

    it("keeps what was typed and lets the person try again when sending fails", async () => {
      const user = userEvent.setup();
      vi.spyOn(loanApi, "checkLoanApplication").mockRejectedValueOnce(new Error("offline"));
      renderApp("/simulator/personal_loan");
      await screen.findByRole("heading", { name: "Personal Loan" });

      await fillInQualifyingPerson(user);
      await user.click(screen.getByRole("button", { name: "Check eligibility" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Something went wrong. Please try again.",
      );
      expect(screen.getByLabelText("Monthly income")).toHaveValue("25000");
      expect(
        screen.queryByText("Fill in the form and press Check eligibility to see your result."),
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Check eligibility" }));
      expect(await screen.findByRole("heading", { name: "Likely eligible" })).toBeInTheDocument();
    });

    it("starts fresh, with no old result, when another loan type is picked in the side menu", async () => {
      const user = userEvent.setup();
      renderApp("/simulator/personal_loan");
      await screen.findByRole("heading", { name: "Personal Loan" });

      await fillInQualifyingPerson(user);
      await user.click(screen.getByRole("button", { name: "Check eligibility" }));
      await screen.findByRole("heading", { name: "Likely eligible" });

      await user.click(
        within(screen.getByRole("navigation")).getByRole("link", { name: "Vehicle Finance" }),
      );

      expect(await screen.findByRole("heading", { name: "Vehicle Finance" })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Likely eligible" })).not.toBeInTheDocument();
      expect(screen.getByLabelText("Age")).toHaveValue("");
    });
  });
});
