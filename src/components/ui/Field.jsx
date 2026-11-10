import { AnimatePresence, motion } from "framer-motion";
import styles from "./Field.module.scss";

// A label, then a box, then an error message if there is one.
export default function Field({ inputId, labelText, errorMessage, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {labelText}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {errorMessage && (
          <motion.p
            className={styles.error}
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
