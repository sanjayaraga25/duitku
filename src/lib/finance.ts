import { AppState, Budget, Category, Transaction, TxType } from '../types';
import { monthKeyOf } from './date';

export function walletBalance(walletId: string, state: AppState): number {
  const wallet = state.wallets.find((w) => w.id === walletId);
  let balance = wallet ? wallet.initialBalance : 0;
  for (const tx of state.transactions) {
    if (tx.type === 'income' && tx.walletId === walletId) balance += tx.amount;
    if (tx.type === 'expense' && tx.walletId === walletId) balance -= tx.amount;
    if (tx.type === 'transfer') {
      if (tx.walletId === walletId) balance -= tx.amount;
      if (tx.toWalletId === walletId) balance += tx.amount;
    }
  }
  return balance;
}

export function totalBalance(state: AppState): number {
  return state.wallets.reduce((sum, wallet) => sum + walletBalance(wallet.id, state), 0);
}

export function sumType(transactions: Transaction[], type: TxType): number {
  return transactions.reduce((sum, tx) => (tx.type === type ? sum + tx.amount : sum), 0);
}

export function transactionsInMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((tx) => monthKeyOf(tx.date) === monthKey);
}

export function monthlyTotals(transactions: Transaction[], monthKey: string) {
  const inMonth = transactionsInMonth(transactions, monthKey);
  return {
    income: sumType(inMonth, 'income'),
    expense: sumType(inMonth, 'expense'),
    count: inMonth.length,
  };
}

export function expenseByCategory(transactions: Transaction[], monthKey: string) {
  const totals = new Map<string, number>();
  for (const tx of transactionsInMonth(transactions, monthKey)) {
    if (tx.type !== 'expense' || !tx.categoryId) continue;
    totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
  }
  return totals;
}

export interface CategorySlice {
  category: Category;
  total: number;
  share: number;
}

export function categoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  monthKey: string,
  type: 'expense' | 'income'
): CategorySlice[] {
  const totals = new Map<string, number>();
  for (const tx of transactionsInMonth(transactions, monthKey)) {
    if (tx.type !== type || !tx.categoryId) continue;
    totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
  }
  const total = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
  const slices: CategorySlice[] = [];
  totals.forEach((value, categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    slices.push({
      category,
      total: value,
      share: total > 0 ? (value / total) * 100 : 0,
    });
  });
  return slices.sort((a, b) => b.total - a.total);
}

export function categoryById(categories: Category[], id: string | null): Category | undefined {
  if (!id) return undefined;
  return categories.find((category) => category.id === id);
}

export interface BudgetProgress {
  budget: Budget;
  category: Category | undefined;
  spent: number;
  remaining: number;
  ratio: number;
  over: boolean;
}

export function budgetProgressList(state: AppState, monthKey: string): BudgetProgress[] {
  const totals = expenseByCategory(state.transactions, monthKey);
  return state.budgets
    .map((budget) => {
      const category = state.categories.find((c) => c.id === budget.categoryId);
      const spent = totals.get(budget.categoryId) ?? 0;
      const ratio = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return {
        budget,
        category,
        spent,
        remaining: budget.amount - spent,
        ratio,
        over: spent > budget.amount,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

export function isCategoryUsed(state: AppState, categoryId: string): boolean {
  return (
    state.transactions.some((tx) => tx.categoryId === categoryId) ||
    state.budgets.some((budget) => budget.categoryId === categoryId)
  );
}

export function isWalletUsed(state: AppState, walletId: string): boolean {
  return state.transactions.some(
    (tx) => tx.walletId === walletId || tx.toWalletId === walletId
  );
}

export function monthTransactionCount(state: AppState, monthKey: string): number {
  return transactionsInMonth(state.transactions, monthKey).length;
}
