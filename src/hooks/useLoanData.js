import { createContext, useContext } from "react";

export const LoanDataContext = createContext(null);

// Gives a page the loan types and form rules, and whether they are still loading.
export function useLoanData() {
  const loanData = useContext(LoanDataContext);
  if (loanData === null) {
    throw new Error("useLoanData must be used inside LoanDataProvider");
  }
  return loanData;
}
