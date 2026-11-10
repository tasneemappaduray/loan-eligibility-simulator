import { NavLink } from "react-router-dom";
import { ROUTES, simulatorPath } from "../../config/routes";
import { useLoanData } from "../../hooks/useLoanData";
import { loanTypeIcons } from "../../config/loanTypeIcons";
import NavIcon from "../NavIcon/NavIcon";
import styles from "./SideMenu.module.scss";

// The class names for a link: always menuLink, and also activeMenuLink for the page you are on.
function menuLinkClassName({ isActive }) {
  return isActive ? `${styles.menuLink} ${styles.activeMenuLink}` : styles.menuLink;
}

// The dark menu down the side of the page. On a phone it becomes a row of links.
export default function SideMenu() {
  const { status, loanProducts } = useLoanData();

  return (
    <nav className={styles.sidePanel}>
      <div className={styles.menuGroup}>
        <p className={styles.menuGroupTitle}>Loans</p>
        <NavLink to={ROUTES.products} end className={menuLinkClassName}>
          <NavIcon iconName="products" />
          Loan products
        </NavLink>
        {status === "ready" &&
          loanProducts.map((loanProduct) => (
            <NavLink
              key={loanProduct.id}
              to={simulatorPath(loanProduct.id)}
              className={menuLinkClassName}
            >
              <NavIcon iconName={loanTypeIcons[loanProduct.id] ?? "products"} />
              {loanProduct.name}
            </NavLink>
          ))}
      </div>
      <div className={styles.menuGroup}>
        <p className={styles.menuGroupTitle}>Information</p>
        <NavLink to={ROUTES.howItWorks} className={menuLinkClassName}>
          <NavIcon iconName="howItWorks" />
          How it works
        </NavLink>
      </div>
      <p className={styles.panelFooter}>Created by Tasneem Appaduray</p>
    </nav>
  );
}
