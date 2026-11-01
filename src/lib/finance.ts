/**
 * Equated monthly instalment for a reducing-balance loan:
 *   EMI = P · r · (1 + r)^n / ((1 + r)^n − 1)
 * where P is the principal, r the monthly rate and n the number of months.
 */
export function emi(principal: number, annualRatePercent: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  if (r === 0) return principal / months;
  const f = (1 + r) ** months;
  return (principal * r * f) / (f - 1);
}

export function loanBreakdown(price: number, downPaymentPercent: number, annualRatePercent: number, years: number) {
  const principal = Math.round(price * (1 - downPaymentPercent / 100));
  const months = Math.round(years * 12);
  const monthly = emi(principal, annualRatePercent, months);
  const totalPayable = monthly * months;
  return {
    downPayment: price - principal,
    principal,
    monthly: Math.round(monthly),
    totalInterest: Math.round(totalPayable - principal),
    totalPayable: Math.round(totalPayable),
  };
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** ₹12,34,567, Indian digit grouping. */
export function formatINR(value: number) {
  return inr.format(value);
}

/** ₹7.75 L / ₹1.2 Cr, the way buyers talk about land prices. */
export function formatINRShort(value: number) {
  if (value >= 1e7) return `₹${trim(value / 1e7)} Cr`;
  if (value >= 1e5) return `₹${trim(value / 1e5)} L`;
  return formatINR(value);
}

function trim(n: number) {
  return n.toFixed(2).replace(/\.?0+$/, "");
}
