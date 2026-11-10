import { useEffect, useState } from "react";
import { LoanDataContext } from "../hooks/useLoanData";
import { getLoanProducts, getValidationRules } from "../services/loanApi";

// Loads the loan types and form rules once, and shares them with every page inside it.
export function LoanDataProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [loanProducts, setLoanProducts] = useState([]);
  const [validationRules, setValidationRules] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(1);

  useEffect(() => {
    // Becomes true if the page goes away, or Retry starts a newer load, so this load's answer is ignored.
    let isLoadOutOfDate = false;

    Promise.all([getLoanProducts(), getValidationRules()])
      .then(([{ products }, rules]) => {
        if (isLoadOutOfDate) return;
        setLoanProducts(products);
        setValidationRules(rules);
        setStatus("ready");
      })
      .catch(() => {
        if (!isLoadOutOfDate) setStatus("failed");
      });

    return () => {
      isLoadOutOfDate = true;
    };
  }, [loadAttempt]);

  function retry() {
    setStatus("loading");
    setLoadAttempt(loadAttempt + 1);
  }

  return (
    <LoanDataContext value={{ status, loanProducts, validationRules, retry }}>
      {children}
    </LoanDataContext>
  );
}
