import { useLoanData } from "../../hooks/useLoanData";
import PacmanSpinner from "../PacmanSpinner/PacmanSpinner";
import Button from "../ui/Button";
import styles from "./LoanDataStatus.module.scss";

// Shows the Pac-Man while the loan data loads, a message with a Try again button if loading fails,
// and the page itself once the data is ready.
export default function LoanDataStatus({ children }) {
  const { status, retry } = useLoanData();

  if (status === "loading") return <PacmanSpinner />;

  if (status === "failed") {
    return (
      <div className={styles.failureMessage} role="alert">
        <p>We couldn't load the loan options.</p>
        <Button onClick={retry}>Try again</Button>
      </div>
    );
  }

  return children;
}
