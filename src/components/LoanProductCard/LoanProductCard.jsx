import { Link } from "react-router-dom";
import { loanTypeIcons } from "../../config/loanTypeIcons";
import { simulatorPath } from "../../config/routes";
import { formatCurrencyWhole, formatPercent } from "../../utils/format";
import NavIcon from "../NavIcon/NavIcon";
import styles from "./LoanProductCard.module.scss";

// A card for one loan type: its name, description, amounts, terms and interest rates,
// and a link to the simulator for that loan.
export default function LoanProductCard({ loanProduct }) {
  const { id, name, description, minAmount, maxAmount, minTerm, maxTerm, interestRateRange } =
    loanProduct;

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon}>
          <NavIcon iconName={loanTypeIcons[id] ?? "products"} />
        </span>
        <h2 className={styles.cardTitle}>{name}</h2>
      </header>
      <div className={styles.cardBody}>
        <p className={styles.cardDescription}>{description}</p>
        <dl className={styles.cardFacts}>
          <div className={styles.factTile}>
            <dt className={styles.factLabel}>Borrow</dt>
            <dd className={styles.factValue}>
              {formatCurrencyWhole(minAmount)} to {formatCurrencyWhole(maxAmount)}
            </dd>
          </div>
          <div className={styles.factTile}>
            <dt className={styles.factLabel}>Repay over</dt>
            <dd className={styles.factValue}>
              {minTerm} to {maxTerm} months
            </dd>
          </div>
          <div className={styles.factTile}>
            <dt className={styles.factLabel}>Interest rate</dt>
            <dd className={styles.factValue}>
              {formatPercent(interestRateRange.min)} to {formatPercent(interestRateRange.max)}
            </dd>
          </div>
        </dl>
        <Link className={styles.cardLink} to={simulatorPath(id)}>
          See if I qualify
        </Link>
      </div>
    </article>
  );
}
