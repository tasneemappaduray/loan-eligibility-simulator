import { Link, Outlet } from "react-router-dom";
import capitecLogo from "../../assets/capitec-logo.png";
import { ROUTES } from "../../config/routes";
import SideMenu from "../SideMenu/SideMenu";
import styles from "./Layout.module.scss";

// The frame around every page: a top bar with the logo, the side menu, and the page itself.
export default function Layout() {
  return (
    <>
      <header className={styles.topBar}>
        <Link to={ROUTES.products}>
          <img className={styles.logo} src={capitecLogo} alt="Capitec" />
        </Link>
        <span className={styles.logoDivider} aria-hidden="true" />
        <span className={styles.siteLabel}>Loan Simulator</span>
      </header>
      <div className={styles.layoutGrid}>
        <SideMenu />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </>
  );
}
