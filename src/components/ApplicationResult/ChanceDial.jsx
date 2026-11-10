import { motion } from "framer-motion";
import NumberCounter from "./NumberCounter";
import styles from "./ChanceDial.module.scss";

const riskStyles = {
  low: styles.lowRisk,
  medium: styles.mediumRisk,
  high: styles.highRisk,
};

// A ring that fills up to show the chance of approval, with the percentage in the middle.
export default function ChanceDial({ approvalLikelihood, riskCategory }) {
  return (
    <div
      className={`${styles.dial} ${riskStyles[riskCategory]}`}
      role="img"
      aria-label={`Approval likelihood ${approvalLikelihood} percent, ${riskCategory} risk`}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className={styles.dialTrack} cx="60" cy="60" r="52" />
        <motion.circle
          className={styles.dialFill}
          cx="60"
          cy="60"
          r="52"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: approvalLikelihood / 100 }}
          transition={{ duration: 0.9 }}
        />
      </svg>
      <span className={styles.dialNumber}>
        <NumberCounter
          value={approvalLikelihood}
          formatValue={(percent) => `${Math.round(percent)}%`}
        />
      </span>
    </div>
  );
}
