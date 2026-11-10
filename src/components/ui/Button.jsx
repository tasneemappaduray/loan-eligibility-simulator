import styles from "./Button.module.scss";

// A button. While loading it cannot be clicked and shows a small spinner.
export default function Button({
  children,
  loading = false,
  type = "button",
  disabled,
  ...buttonProps
}) {
  return (
    <button
      type={type}
      className={styles.button}
      disabled={loading || disabled}
      aria-busy={loading ? "true" : undefined}
      {...buttonProps}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
