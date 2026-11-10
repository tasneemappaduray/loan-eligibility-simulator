import LoanDataStatus from "../components/LoanDataStatus/LoanDataStatus";
import LoanProductCard from "../components/LoanProductCard/LoanProductCard";
import { useBrowserTabTitle } from "../hooks/useBrowserTabTitle";
import { useLoanData } from "../hooks/useLoanData";
import styles from "./ProductsPage.module.scss";

// The first page: a card for each loan type, each with a link to try it in the simulator.
export default function ProductsPage() {
  const { loanProducts } = useLoanData();
  useBrowserTabTitle("Loan products");

  return (
    <LoanDataStatus>
      <h1 className={styles.heading}>Our loans</h1>
      <p className={styles.intro}>Compare our loans, then check whether you qualify.</p>
      <div className={styles.loanGrid}>
        {loanProducts.map((loanProduct) => (
          <LoanProductCard key={loanProduct.id} loanProduct={loanProduct} />
        ))}
      </div>
    </LoanDataStatus>
  );
}
