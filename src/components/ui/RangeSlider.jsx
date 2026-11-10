import { keepWithinRange } from "../../utils/money";
import Field from "./Field";
import styles from "./RangeSlider.module.scss";

// A slider that shows its current value. The page using it decides what the value is.
// With no value (null) it sits at the lowest point and shows no number.
export default function RangeSlider({
  inputId,
  labelText,
  min,
  max,
  step,
  value,
  onChange,
  format,
}) {
  // How far along the bar the slider is, from 0 to 100 percent.
  const hasValue = value !== null;
  const sliderPosition = hasValue
    ? keepWithinRange(((value - min) / (max - min)) * 100, 0, 100)
    : 0;

  return (
    <Field inputId={inputId} labelText={labelText}>
      <output className={styles.value} htmlFor={inputId}>
        {hasValue ? format(value) : ""}
      </output>
      <div className={styles.sliderBox}>
        <div className={styles.blueBar} style={{ width: `${sliderPosition}%` }} />
        <input
          id={inputId}
          className={styles.slider}
          type="range"
          min={min}
          max={max}
          step={step}
          value={hasValue ? value : min}
          aria-valuetext={hasValue ? format(value) : undefined}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
    </Field>
  );
}
