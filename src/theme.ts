import { ViewStyle } from 'react-native';

export const colors = {
  bg: '#F4F6FB',
  card: '#FFFFFF',
  text: '#0B1B33',
  textSoft: '#33445C',
  muted: '#6B7A90',
  faint: '#9AA7B8',
  line: '#E8EDF4',
  primary: '#4F46E5',
  primaryDark: '#3B32C9',
  primarySoft: '#EEF0FF',
  income: '#0EA66B',
  incomeSoft: '#E5F8EF',
  expense: '#E5484D',
  expenseSoft: '#FDECEC',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  white: '#FFFFFF',
  overlay: 'rgba(11,27,51,0.35)',
  gradient: ['#4F46E5', '#7C3AED'] as const,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
};

export const shadow: ViewStyle = {
  shadowColor: '#0B1B33',
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const palette = [
  '#4F46E5',
  '#7C3AED',
  '#0EA66B',
  '#0D9488',
  '#0284C7',
  '#3B82F6',
  '#F97316',
  '#E5484D',
  '#EC4899',
  '#D97706',
  '#64748B',
  '#111827',
];

export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
