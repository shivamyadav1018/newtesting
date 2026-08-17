export function parseCurrencyInput(value: string): number {
  const numeric = value.replace(/[^0-9]/g, '');
  return numeric ? Number(numeric) : 0;
}

export function formatCurrencyInput(value: string | number): string {
  const numeric = String(value).replace(/[^0-9]/g, '');
  if (!numeric) {
    return '';
  }
  return Number(numeric).toLocaleString('en-IN');
}

export function formatINR(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCompactINR(value: number): string {
  const absolute = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absolute >= 10_000_000) {
    return `${sign}₹${trimZero(absolute / 10_000_000)} Cr`;
  }
  if (absolute >= 100_000) {
    return `${sign}₹${trimZero(absolute / 100_000)} L`;
  }
  if (absolute >= 1_000) {
    return `${sign}₹${trimZero(absolute / 1_000)}K`;
  }
  return `${sign}₹${Math.round(absolute).toLocaleString('en-IN')}`;
}

function trimZero(value: number): string {
  return value.toFixed(value >= 100 ? 0 : 1).replace(/\.0$/, '');
}

