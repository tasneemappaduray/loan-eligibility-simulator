import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { formatCurrency } from "../../utils/format";
import styles from "./MonthlyPaymentsTable.module.scss";

// A button that shows or hides the table of what is paid each month: the payment, how much of it
// reduces the loan, how much is interest, and what is still owed.
export default function MonthlyPaymentsTable({ repaymentRows }) {
  const [isShowing, setIsShowing] = useState(false);
  const tableElementId = useId();

  return (
    <div>
      <button
        type="button"
        className={styles.showHideButton}
        aria-expanded={isShowing}
        aria-controls={tableElementId}
        onClick={() => setIsShowing(!isShowing)}
      >
        {isShowing ? "Hide" : "Show"} month-by-month repayments
      </button>
      <AnimatePresence initial={false}>
        {isShowing && (
          <motion.div
            id={tableElementId}
            className={styles.slidingBox}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <table className={styles.repaymentTable} aria-label="Month-by-month repayments">
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col" className={styles.amountCell}>
                    Payment
                  </th>
                  <th scope="col" className={styles.amountCell}>
                    Principal
                  </th>
                  <th scope="col" className={styles.amountCell}>
                    Interest
                  </th>
                  <th scope="col" className={styles.amountCell}>
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {repaymentRows.map((row) => (
                  <tr key={row.month}>
                    <th scope="row">{row.month}</th>
                    <td className={styles.amountCell}>{formatCurrency(row.payment)}</td>
                    <td className={styles.amountCell}>{formatCurrency(row.principal)}</td>
                    <td className={styles.amountCell}>{formatCurrency(row.interest)}</td>
                    <td className={styles.amountCell}>{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
