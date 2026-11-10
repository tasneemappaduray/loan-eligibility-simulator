import { useBrowserTabTitle } from "../../hooks/useBrowserTabTitle";
import { useLoanApplication } from "../../hooks/useLoanApplication";
import { useLoanData } from "../../hooks/useLoanData";
import ApplicationResult from "../ApplicationResult/ApplicationResult";
import LoanApplicationForm from "../LoanApplicationForm/LoanApplicationForm";
import styles from "./LoanSimulator.module.scss";

// The form on one side and its result on the other. The page gives it a new key for each loan
// type, so going to another loan type starts it fresh: an empty form and no old result.
export default function LoanSimulator({ loanProduct }) {
  const { validationRules } = useLoanData();
  const { applicationStatus, loanDecision, repaymentRows, sendApplication } = useLoanApplication();
  useBrowserTabTitle("Loan simulator");

  return (
    <div className={styles.columns}>
      <div className={styles.formColumn}>
        <LoanApplicationForm
          validationRules={validationRules}
          loanProduct={loanProduct}
          isSending={applicationStatus === "sending"}
          onSendApplication={sendApplication}
        />
      </div>
      <div className={styles.resultColumn}>
        {applicationStatus === "failed" && (
          <p className={styles.failureMessage} role="alert">
            Something went wrong. Please try again.
          </p>
        )}
        {applicationStatus === "done" && (
          <ApplicationResult loanDecision={loanDecision} repaymentRows={repaymentRows} />
        )}
        {applicationStatus === "waiting" && (
          <p className={styles.hint}>
            Fill in the form and press Check eligibility to see your result.
          </p>
        )}
      </div>
    </div>
  );
}
