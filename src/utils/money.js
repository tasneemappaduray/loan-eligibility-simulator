const CENTS_PER_RAND = 100;

// Rounds to cents (2 decimal places).
export function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * CENTS_PER_RAND) / CENTS_PER_RAND;
}

// Keeps a number between a lowest and a highest value.
export function keepWithinRange(number, lowest, highest) {
  return Math.min(Math.max(number, lowest), highest);
}
