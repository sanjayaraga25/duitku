export const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const MONTHS_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function yesterdayISO(): string {
  return toISODate(new Date(Date.now() - 86400000));
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function monthKeyOf(iso: string): string {
  return iso.slice(0, 7);
}

export function currentMonthKey(): string {
  return todayISO().slice(0, 7);
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${MONTHS_ID[(m ?? 1) - 1]} ${y}`;
}

export function monthLabelShort(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${MONTHS_SHORT_ID[(m ?? 1) - 1]} ${String(y).slice(2)}`;
}

export function addMonths(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function lastNMonths(monthKey: string, count: number): string[] {
  const result: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    result.push(addMonths(monthKey, -i));
  }
  return result;
}

export function formatDateID(iso: string): string {
  const date = parseISODate(iso);
  return `${date.getDate()} ${MONTHS_SHORT_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateLongID(iso: string): string {
  const date = parseISODate(iso);
  return `${DAYS_ID[date.getDay()]}, ${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDayHeader(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Hari ini';
  const yesterday = toISODate(new Date(Date.now() - 86400000));
  if (iso === yesterday) return 'Kemarin';
  const date = parseISODate(iso);
  return `${DAYS_ID[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m ?? 1, 0).getDate();
}
