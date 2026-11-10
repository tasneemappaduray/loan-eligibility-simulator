import { MAX_OBLIGATION_RATIO, MIN_CREDIT_SCORE, PERCENT } from "../config/loanRules";
import { useBrowserTabTitle } from "../hooks/useBrowserTabTitle";
import styles from "./HowItWorksPage.module.scss";

// Explains in plain words how a loan request is judged. The numbers come from the rules file,
// so this page can never say something different from what the code does.
export default function HowItWorksPage() {
  useBrowserTabTitle("How it works");

  return (
    <>
      <h1 className={styles.heading}>How it works</h1>
      <p className={styles.intro}>This simulator gives an estimate, not a promise.</p>
      <ol>
        <li>
          Your monthly payment is worked out from the amount, the term and an interest rate. A
          better credit score gets a lower rate.
        </li>
        <li>The payment must fit in the money you have left after expenses.</li>
        <li>
          Your debt payments plus the new payment cannot be more than{" "}
          {MAX_OBLIGATION_RATIO * PERCENT}% of your income.
        </li>
        <li>If you give a credit score, it must be {MIN_CREDIT_SCORE} or more.</li>
        <li>People who are unemployed cannot be assessed.</li>
        <li>
          The approval chance mixes your credit score, how much of your income goes on debt, and how
          much you have left over.
        </li>
      </ol>
    </>
  );
}
