export function formatThousands(value: number): string {
  const rounded = Math.round(Math.abs(value));
  const digits = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return value < 0 ? `-${digits}` : digits;
}

export function formatIDR(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}Rp ${formatThousands(Math.abs(value))}`;
}

export function formatIDRShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${trimZero(abs / 1_000_000_000)} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${trimZero(abs / 1_000_000)} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${trimZero(abs / 1_000)} rb`;
  }
  return `${sign}Rp ${Math.round(abs)}`;
}

function trimZero(value: number): string {
  const fixed = value >= 100 ? value.toFixed(0) : value.toFixed(1);
  return fixed.replace('.', ',').replace(/,0$/, '');
}

export function parseDigits(value: string): number {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export function formatInputAmount(digits: string): string {
  const clean = digits.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
