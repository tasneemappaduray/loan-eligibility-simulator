import styles from "./PacmanSpinner.module.scss";

// A Pac-Man that keeps eating dots while the loan options load. It is drawn with CSS only.
export default function PacmanSpinner() {
  return (
    <div className={styles.spinner} role="status">
      <div className={styles.pacmanSpinner}>
        <div className={styles.dots}>
          <span className={styles.firstDot} />
          <span className={styles.secondDot} />
          <span className={styles.thirdDot} />
        </div>
        <div className={styles.pacman}>
          <span className={styles.upperJaw} />
          <span className={styles.lowerJaw} />
          <span className={styles.backOfHead} />
          <div className={styles.eye} />
        </div>
      </div>
      <p className={styles.loadingText}>Loading loan options…</p>
    </div>
  );
}
