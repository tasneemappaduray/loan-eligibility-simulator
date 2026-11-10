import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { roundMoney } from "../../utils/money";
import { formatCurrency, formatCurrencyWhole, formatPercent } from "../../utils/format";
import ChanceDial from "./ChanceDial";
import MoneyLeftOver from "./MoneyLeftOver";
import MonthlyPaymentsTable from "./MonthlyPaymentsTable";
import NumberCounter from "./NumberCounter";
import styles from "./ApplicationResult.module.scss";

// The answer to the loan application: whether the person is likely to be approved, what they would
// pay, and how affordable it is. The cursor moves to the headline so screen readers read it out.
export default function ApplicationResult({ loanDecision, repaymentRows }) {
  const { eligibilityResult, recommendedLoan, affordabilityAnalysis } = loanDecision;
  // What the person pays on top of the money they borrow.
  const totalInterest = roundMoney(
    recommendedLoan.totalRepayment - recommendedLoan.recommendedAmount,
  );
  const headlineHandle = useRef(null);

  useEffect(() => {
    headlineHandle.current.focus();
  }, [loanDecision]);

  return (
    <motion.section
      className={styles.panel}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 ref={headlineHandle} tabIndex={-1} className={styles.headline} aria-live="polite">
        <span aria-hidden="true">{eligibilityResult.isEligible ? "✔" : "✕"}</span>{" "}
        {eligibilityResult.isEligible ? "Likely eligible" : "Unlikely to be approved"}
      </h2>
      <p className={styles.reason}>{eligibilityResult.decisionReason}</p>

      <ChanceDial
        approvalLikelihood={eligibilityResult.approvalLikelihood}
        riskCategory={eligibilityResult.riskCategory}
      />

      {/* A person who is declined is not shown a payment for a loan they cannot get. */}
      {eligibilityResult.isEligible && (
        <>
          <p className={styles.monthlyPayment}>
            <NumberCounter value={recommendedLoan.monthlyPayment} formatValue={formatCurrency} /> /
            month
          </p>
          <p className={styles.paymentDetails}>
            {`${formatCurrency(recommendedLoan.totalRepayment)} in total (${formatCurrency(totalInterest)} interest) · ${formatPercent(recommendedLoan.interestRate)} a year`}
          </p>
          <p className={styles.recommendedLoan}>
            {`Recommended loan: ${formatCurrencyWhole(recommendedLoan.recommendedAmount)} · we could offer up to ${formatCurrencyWhole(recommendedLoan.maxAmount)}`}
          </p>
        </>
      )}

      {eligibilityResult.isAssessed && (
        <MoneyLeftOver affordabilityAnalysis={affordabilityAnalysis} />
      )}

      {!eligibilityResult.isEligible && recommendedLoan.maxAmount > 0 && (
        <p className={styles.offerLine}>
          We could offer up to {formatCurrencyWhole(recommendedLoan.maxAmount)}
        </p>
      )}

      {repaymentRows.length > 0 && <MonthlyPaymentsTable repaymentRows={repaymentRows} />}
    </motion.section>
  );
}
