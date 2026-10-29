export type TxType = 'income' | 'expense' | 'transfer';

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  color: string;
  icon: string;
  initialBalance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  categoryId: string | null;
  walletId: string;
  toWalletId: string | null;
  note: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
}

export interface AppState {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
}

export const WALLET_TYPE_LABEL: Record<WalletType, string> = {
  cash: 'Tunai',
  bank: 'Bank',
  ewallet: 'E-Wallet',
  investment: 'Investasi',
};

export const WALLET_TYPE_ICON: Record<WalletType, string> = {
  cash: 'cash-outline',
  bank: 'business-outline',
  ewallet: 'phone-portrait-outline',
  investment: 'trending-up-outline',
};
