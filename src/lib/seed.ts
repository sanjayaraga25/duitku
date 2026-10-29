import { AppState, Category, Wallet } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Makan & Minum', type: 'expense', icon: 'restaurant-outline', color: '#F97316' },
  { id: 'cat-transport', name: 'Transportasi', type: 'expense', icon: 'car-outline', color: '#3B82F6' },
  { id: 'cat-shopping', name: 'Belanja', type: 'expense', icon: 'bag-handle-outline', color: '#EC4899' },
  { id: 'cat-bills', name: 'Tagihan', type: 'expense', icon: 'receipt-outline', color: '#8B5CF6' },
  { id: 'cat-health', name: 'Kesehatan', type: 'expense', icon: 'medkit-outline', color: '#E5484D' },
  { id: 'cat-fun', name: 'Hiburan', type: 'expense', icon: 'game-controller-outline', color: '#06B6D4' },
  { id: 'cat-edu', name: 'Pendidikan', type: 'expense', icon: 'school-outline', color: '#6366F1' },
  { id: 'cat-home', name: 'Rumah', type: 'expense', icon: 'home-outline', color: '#14B8A6' },
  { id: 'cat-other-expense', name: 'Lainnya', type: 'expense', icon: 'ellipsis-horizontal-circle-outline', color: '#64748B' },
  { id: 'cat-salary', name: 'Gaji', type: 'income', icon: 'cash-outline', color: '#0EA66B' },
  { id: 'cat-bonus', name: 'Bonus', type: 'income', icon: 'gift-outline', color: '#10B981' },
  { id: 'cat-invest', name: 'Investasi', type: 'income', icon: 'trending-up-outline', color: '#14B8A6' },
  { id: 'cat-business', name: 'Usaha', type: 'income', icon: 'briefcase-outline', color: '#22C55E' },
  { id: 'cat-other-income', name: 'Lainnya', type: 'income', icon: 'add-circle-outline', color: '#64748B' },
];

export function createDefaultWallet(): Wallet {
  return {
    id: 'wallet-cash',
    name: 'Tunai',
    type: 'cash',
    color: '#4F46E5',
    icon: 'wallet-outline',
    initialBalance: 0,
    createdAt: new Date().toISOString(),
  };
}

export function createInitialState(): AppState {
  return {
    wallets: [createDefaultWallet()],
    categories: DEFAULT_CATEGORIES,
    transactions: [],
    budgets: [],
  };
}
