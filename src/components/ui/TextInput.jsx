import { removeNonDigits, removeNonMoneyCharacters } from "../../utils/cleanTypedText";
import Field from "./Field";
import styles from "./TextInput.module.scss";

// A text box with a label and an error message. The browser is asked not to fill it in from
// earlier visits. Only numbers can be typed: inputMode="numeric" allows
// whole numbers, and the default allows money amounts.
export default function TextInput({
  inputId,
  labelText,
  errorMessage,
  unitBefore,
  inputMode = "decimal",
  onChange,
  ...inputProps
}) {
  return (
    <Field inputId={inputId} labelText={labelText} errorMessage={errorMessage}>
      <div className={styles.control}>
        {unitBefore && (
          <span className={styles.currencyOrUnitText} aria-hidden="true">
            {unitBefore}
          </span>
        )}
        <input
          id={inputId}
          className={styles.input}
          inputMode={inputMode}
          autoComplete="off"
          aria-invalid={errorMessage ? "true" : undefined}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          onChange={(event) => {
            // Wrong characters are removed as they are typed, so the box can never hold a letter.
            event.target.value =
              inputMode === "numeric"
                ? removeNonDigits(event.target.value)
                : removeNonMoneyCharacters(event.target.value);
            onChange?.(event);
          }}
          {...inputProps}
        />
      </div>
    </Field>
  );
}
