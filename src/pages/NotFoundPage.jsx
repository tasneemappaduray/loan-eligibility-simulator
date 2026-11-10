import { Link } from "react-router-dom";
import { ROUTES } from "../config/routes";
import { useBrowserTabTitle } from "../hooks/useBrowserTabTitle";
import styles from "./NotFoundPage.module.scss";

// Shown for any address that does not match a page.
export default function NotFoundPage() {
  useBrowserTabTitle("Page not found");

  return (
    <>
      <h1 className={styles.heading}>Page not found</h1>
      <p className={styles.intro}>
        <Link to={ROUTES.products}>Back to loan products</Link>
      </p>
    </>
  );
}
