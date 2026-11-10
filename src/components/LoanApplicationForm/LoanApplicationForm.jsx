import { useState } from "react";
import { formatCurrencyWhole } from "../../utils/format";
import {
  blankFormValues,
  findFormProblems,
  homeLoanAmount,
  makeApplicationRequest,
} from "../../utils/loanFormChecks";
import Button from "../ui/Button";
import RangeSlider from "../ui/RangeSlider";
import Select from "../ui/Select";
import TextInput from "../ui/TextInput";
import styles from "./LoanApplicationForm.module.scss";

// The boxes from top to bottom, so the cursor can go to the first one with a problem.
const boxIdsInOrder = [
  "employmentStatus",
  "age",
  "employmentDuration",
  "monthlyIncome",
  "monthlyExpenses",
  "existingDebt",
  "creditScore",
  "purpose",
  "requestedAmount",
  "propertyPrice",
  "deposit",
  "loanTerm",
];

// Turns an id like "home_improvement" into words people can read: "Home improvement".
function readableText(id) {
  const words = id.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// The form where the person types in their details. It checks every box and only sends
// the application when everything is filled in correctly.
export default function LoanApplicationForm({
  validationRules,
  loanProduct,
  isSending,
  onSendApplication,
}) {
  const [formValues, setFormValues] = useState({
    ...blankFormValues,
    loanType: loanProduct.id,
    purpose: loanProduct.purposes[0],
  });
  const [boxesLeft, setBoxesLeft] = useState([]);
  const [hasTriedToSend, setHasTriedToSend] = useState(false);

  // Every problem right now, worked out again from what is typed.
  const errorMessages = findFormProblems(formValues, validationRules, loanProduct);
  // Only the problems to show: boxes the person has left, or all of them after pressing the button.
  const shownErrorMessages = {};
  for (const boxId of boxIdsInOrder) {
    if (errorMessages[boxId] && (hasTriedToSend || boxesLeft.includes(boxId))) {
      shownErrorMessages[boxId] = errorMessages[boxId];
    }
  }

  function handleChange(event) {
    setFormValues({ ...formValues, [event.target.id]: event.target.value });
  }

  function handleBlur(event) {
    if (!boxesLeft.includes(event.target.id)) {
      setBoxesLeft([...boxesLeft, event.target.id]);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setHasTriedToSend(true);

    const firstBoxWithAProblem = boxIdsInOrder.find((boxId) => errorMessages[boxId]);
    if (firstBoxWithAProblem) {
      event.currentTarget.elements[firstBoxWithAProblem].focus();
      return;
    }
    onSendApplication(makeApplicationRequest(formValues, loanProduct));
  }

  const employmentStatusChoices = validationRules.personalInfo.employmentStatus.options.map(
    (employmentStatus) => ({ value: employmentStatus, label: readableText(employmentStatus) }),
  );
  const loanPurposeChoices = loanProduct.purposes.map((purpose) => ({
    value: purpose,
    label: readableText(purpose),
  }));

  // The loan amount shown under the price and deposit boxes of a home loan.
  const homeLoanAmountText =
    homeLoanAmount(formValues) > 0 ? formatCurrencyWhole(homeLoanAmount(formValues)) : "—";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>About you</h2>
        <Select
          inputId="employmentStatus"
          labelText="Employment status"
          placeholder="Select…"
          options={employmentStatusChoices}
          value={formValues.employmentStatus}
          onChange={handleChange}
          onBlur={handleBlur}
          errorMessage={shownErrorMessages.employmentStatus}
        />
        <div className={styles.twoBoxesInARow}>
          <TextInput
            inputId="age"
            labelText="Age"
            inputMode="numeric"
            value={formValues.age}
            onChange={handleChange}
            onBlur={handleBlur}
            errorMessage={shownErrorMessages.age}
          />
          <TextInput
            inputId="employmentDuration"
            labelText="Months employed"
            inputMode="numeric"
            value={formValues.employmentDuration}
            onChange={handleChange}
            onBlur={handleBlur}
            errorMessage={shownErrorMessages.employmentDuration}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Your money</h2>
        <div className={styles.twoBoxesInARow}>
          <TextInput
            inputId="monthlyIncome"
            labelText="Monthly income"
            unitBefore="R"
            value={formValues.monthlyIncome}
            onChange={handleChange}
            onBlur={handleBlur}
            errorMessage={shownErrorMessages.monthlyIncome}
          />
          <TextInput
            inputId="monthlyExpenses"
            labelText="Monthly expenses"
            unitBefore="R"
            value={formValues.monthlyExpenses}
            onChange={handleChange}
            onBlur={handleBlur}
            errorMessage={shownErrorMessages.monthlyExpenses}
          />
        </div>
        <div className={styles.twoBoxesInARow}>
          <TextInput
            inputId="existingDebt"
            labelText="Existing monthly debt"
            unitBefore="R"
            value={formValues.existingDebt}
            onChange={handleChange}
            onBlur={handleBlur}
            errorMessage={shownErrorMessages.existingDebt}
          />
          <TextInput
            inputId="creditScore"
            labelText="Credit score (optional)"
            inputMode="numeric"
            value={formValues.creditScore}
            onChange={handleChange}
            onBlur={handleBlur}
            errorMessage={shownErrorMessages.creditScore}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>The loan</h2>
        <Select
          inputId="purpose"
          labelText="Loan purpose"
          options={loanPurposeChoices}
          value={formValues.purpose}
          onChange={handleChange}
          onBlur={handleBlur}
          errorMessage={shownErrorMessages.purpose}
        />
        {loanProduct.needsPropertyPrice ? (
          <>
            <div className={styles.twoBoxesInARow}>
              <TextInput
                inputId="propertyPrice"
                labelText="Property price"
                unitBefore="R"
                value={formValues.propertyPrice}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={shownErrorMessages.propertyPrice}
              />
              <TextInput
                inputId="deposit"
                labelText="Deposit"
                unitBefore="R"
                value={formValues.deposit}
                onChange={handleChange}
                onBlur={handleBlur}
                errorMessage={shownErrorMessages.deposit}
              />
            </div>
            <p className={styles.loanAmountLine}>{`Loan amount: ${homeLoanAmountText}`}</p>
          </>
        ) : (
          <>
            <TextInput
              inputId="requestedAmount"
              labelText="Loan amount"
              unitBefore="R"
              value={formValues.requestedAmount}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={shownErrorMessages.requestedAmount}
            />
            <RangeSlider
              inputId="requestedAmountSlider"
              labelText="Loan amount slider"
              min={loanProduct.minAmount}
              max={loanProduct.maxAmount}
              step={1000}
              value={Number(formValues.requestedAmount) || null}
              onChange={(amount) =>
                setFormValues({ ...formValues, requestedAmount: String(amount) })
              }
              format={formatCurrencyWhole}
            />
          </>
        )}
        <TextInput
          inputId="loanTerm"
          labelText="Loan term (months)"
          inputMode="numeric"
          value={formValues.loanTerm}
          onChange={handleChange}
          onBlur={handleBlur}
          errorMessage={shownErrorMessages.loanTerm}
        />
        <RangeSlider
          inputId="loanTermSlider"
          labelText="Loan term slider"
          min={loanProduct.minTerm}
          max={loanProduct.maxTerm}
          step={1}
          value={Number(formValues.loanTerm) || null}
          onChange={(months) => setFormValues({ ...formValues, loanTerm: String(months) })}
          format={(months) => `${months} months`}
        />
      </div>

      <Button type="submit" loading={isSending}>
        Check eligibility
      </Button>
    </form>
  );
}
