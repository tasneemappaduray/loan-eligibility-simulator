import Field from "./Field";
import styles from "./Select.module.scss";

// A dropdown with a label and an error message.
export default function Select({
  inputId,
  labelText,
  options,
  errorMessage,
  placeholder,
  ...selectProps
}) {
  return (
    <Field inputId={inputId} labelText={labelText} errorMessage={errorMessage}>
      <div className={styles.wrap}>
        <select
          id={inputId}
          className={styles.select}
          aria-invalid={errorMessage ? "true" : undefined}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          {...selectProps}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}
