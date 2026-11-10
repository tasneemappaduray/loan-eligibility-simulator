// How money and percentages are written everywhere in the app, in the style of Capitec's own
// examples: R7,096.10 and 13.41%.

// Writes an amount with cents, like R7,096.10.
export function formatCurrency(amount) {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}R${digits}`;
}

// Writes an amount in whole rand, like R300,000.
export function formatCurrencyWhole(amount) {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.abs(amount).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return `${sign}R${digits}`;
}

// Writes a percentage with up to two decimals, like 13.41% or 20%.
export function formatPercent(value) {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
}
