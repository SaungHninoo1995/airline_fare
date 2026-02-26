export function n(value) {
  const parsed = Number.parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function fmt(value) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}

export function money(value) {
  const rounded = Math.round(value * 100) / 100;
  return `$${fmt(rounded)}`;
}
