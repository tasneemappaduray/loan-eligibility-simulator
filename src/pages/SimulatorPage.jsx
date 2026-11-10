import { useParams } from "react-router-dom";
import LoanDataStatus from "../components/LoanDataStatus/LoanDataStatus";
import LoanSimulator from "../components/LoanSimulator/LoanSimulator";
import { useLoanData } from "../hooks/useLoanData";
import NotFoundPage from "./NotFoundPage";
import styles from "./SimulatorPage.module.scss";

// The page for one loan type, picked by the address (for example /simulator/personal_loan).
// An address with a loan type that does not exist shows the not-found page.
export default function SimulatorPage() {
  const { loanType } = useParams();
  const { loanProducts } = useLoanData();
  const loanProduct = loanProducts.find((eachLoanProduct) => eachLoanProduct.id === loanType);

  return (
    <LoanDataStatus>
      {loanProduct ? (
        <>
          <h1 className={styles.heading}>{loanProduct.name}</h1>
          <p className={styles.intro}>{loanProduct.description}</p>
          <LoanSimulator key={loanProduct.id} loanProduct={loanProduct} />
        </>
      ) : (
        <NotFoundPage />
      )}
    </LoanDataStatus>
  );
}
