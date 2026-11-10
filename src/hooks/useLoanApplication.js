import { useRef, useState } from "react";
import { calculateRate, checkLoanApplication } from "../services/loanApi";

// Sends the filled-in form to the pretend server and keeps the answer: the decision and the repayment table.
export function useLoanApplication() {
  const [applicationStatus, setApplicationStatus] = useState("waiting");
  const [loanDecision, setLoanDecision] = useState(null);
  const [repaymentRows, setRepaymentRows] = useState([]);
  // A plain box that changes instantly, so a double click cannot slip a second request through.
  const requestInProgress = useRef(false);

  async function sendApplication(request) {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setApplicationStatus("sending");

    try {
      const newLoanDecision = await checkLoanApplication(request);
      let newRepaymentRows = [];
      // Only a person who is eligible gets the table, and it is always for the amount they asked for.
      if (newLoanDecision.eligibilityResult.isEligible) {
        const quote = await calculateRate({
          loanAmount: request.loanDetails.requestedAmount,
          loanTerm: request.loanDetails.loanTerm,
          creditScore: request.financialInfo.creditScore,
          loanType: request.loanDetails.loanType,
        });
        newRepaymentRows = quote.paymentSchedule;
      }
      setLoanDecision(newLoanDecision);
      setRepaymentRows(newRepaymentRows);
      setApplicationStatus("done");
    } catch {
      setApplicationStatus("failed");
    } finally {
      requestInProgress.current = false;
    }
  }

  return {
    applicationStatus,
    loanDecision,
    repaymentRows,
    sendApplication,
  };
}
