// Format a number as Nepalese Rupees using the रु. symbol.
const numberFormat = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  return `रु. ${numberFormat.format(value ?? 0)}`;
}
