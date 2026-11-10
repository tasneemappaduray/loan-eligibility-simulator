// How many digits a whole-number box takes (age, months, credit score, loan term), and how many a
// money box takes before the decimal point. They stop absurdly long numbers being typed.
const MAX_WHOLE_NUMBER_DIGITS = 3;
const MAX_MONEY_DIGITS = 9;

// Keeps only the digits 0 to 9, up to the most a whole-number box takes.
export function removeNonDigits(typedText) {
  return typedText.replace(/\D/g, "").slice(0, MAX_WHOLE_NUMBER_DIGITS);
}

// Keeps digits and the first decimal point, with at most two digits after it,
// and at most the most a money box takes before it.
export function removeNonMoneyCharacters(typedText) {
  const digitsAndPoints = typedText.replace(/[^\d.]/g, "");
  const [beforePoint, ...afterPoints] = digitsAndPoints.split(".");
  const wholePart = beforePoint.slice(0, MAX_MONEY_DIGITS);
  if (afterPoints.length === 0) return wholePart;
  return `${wholePart}.${afterPoints.join("").slice(0, 2)}`;
}
