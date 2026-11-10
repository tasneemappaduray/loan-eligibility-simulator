import { formatCurrencyWhole, formatPercent } from "../../utils/format";
import styles from "./MoneyLeftOver.module.scss";

const affordabilityStyles = {
  good: styles.goodAffordability,
  fair: styles.fairAffordability,
  poor: styles.poorAffordability,
};

// Four small figures: money left after expenses, how much of the income goes on debt, how many
// times the monthly income the loan is, and how affordable it is.
export default function MoneyLeftOver({ affordabilityAnalysis }) {
  const { disposableIncome, debtToIncomeRatio, loanToIncomeRatio, affordabilityScore } =
    affordabilityAnalysis;

  return (
    <dl className={styles.figures}>
      <div className={styles.figure}>
        <dt className={styles.figureLabel}>Left after expenses</dt>
        <dd className={styles.figureValue}>{formatCurrencyWhole(disposableIncome)}</dd>
      </div>
      <div className={styles.figure}>
        <dt className={styles.figureLabel}>Debt to income</dt>
        <dd className={styles.figureValue}>{formatPercent(debtToIncomeRatio)}</dd>
      </div>
      <div className={styles.figure}>
        <dt className={styles.figureLabel}>Loan to income</dt>
        <dd className={styles.figureValue}>{`${loanToIncomeRatio}×`}</dd>
      </div>
      <div className={styles.figure}>
        <dt className={styles.figureLabel}>Affordability</dt>
        <dd className={`${styles.figureValue} ${affordabilityStyles[affordabilityScore]}`}>
          {affordabilityScore}
        </dd>
      </div>
    </dl>
  );
}
