import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { createInitialState } from '../lib/seed';
import { uid } from '../lib/format';
import { AppState, Budget, Category, Transaction, Wallet } from '../types';

const STORAGE_KEY = '@duitku/state/v1';

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'addTransaction'; transaction: Transaction }
  | { type: 'updateTransaction'; id: string; patch: Partial<Transaction> }
  | { type: 'deleteTransaction'; id: string }
  | { type: 'addWallet'; wallet: Wallet }
  | { type: 'updateWallet'; id: string; patch: Partial<Wallet> }
  | { type: 'deleteWallet'; id: string }
  | { type: 'addBudget'; budget: Budget }
  | { type: 'updateBudget'; id: string; patch: Partial<Budget> }
  | { type: 'deleteBudget'; id: string }
  | { type: 'addCategory'; category: Category }
  | { type: 'deleteCategory'; id: string }
  | { type: 'reset' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'addTransaction':
      return { ...state, transactions: [action.transaction, ...state.transactions] };
    case 'updateTransaction':
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.id ? { ...tx, ...action.patch } : tx
        ),
      };
    case 'deleteTransaction':
      return {
        ...state,
        transactions: state.transactions.filter((tx) => tx.id !== action.id),
      };
    case 'addWallet':
      return { ...state, wallets: [...state.wallets, action.wallet] };
    case 'updateWallet':
      return {
        ...state,
        wallets: state.wallets.map((wallet) =>
          wallet.id === action.id ? { ...wallet, ...action.patch } : wallet
        ),
      };
    case 'deleteWallet':
      return { ...state, wallets: state.wallets.filter((wallet) => wallet.id !== action.id) };
    case 'addBudget':
      return { ...state, budgets: [...state.budgets, action.budget] };
    case 'updateBudget':
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.id ? { ...budget, ...action.patch } : budget
        ),
      };
    case 'deleteBudget':
      return { ...state, budgets: state.budgets.filter((budget) => budget.id !== action.id) };
    case 'addCategory':
      return { ...state, categories: [...state.categories, action.category] };
    case 'deleteCategory':
      return {
        ...state,
        categories: state.categories.filter((category) => category.id !== action.id),
        budgets: state.budgets.filter((budget) => budget.categoryId !== action.id),
      };
    case 'reset':
      return createInitialState();
    default:
      return state;
  }
}

function normalizeStoredState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<AppState>;
  if (!Array.isArray(candidate.wallets) || !Array.isArray(candidate.categories)) return null;
  return {
    wallets: candidate.wallets,
    categories: candidate.categories,
    transactions: Array.isArray(candidate.transactions) ? candidate.transactions : [],
    budgets: Array.isArray(candidate.budgets) ? candidate.budgets : [],
  };
}

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addWallet: (input: Omit<Wallet, 'id' | 'createdAt'>) => void;
  updateWallet: (id: string, patch: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  addBudget: (input: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addCategory: (input: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = normalizeStoredState(JSON.parse(stored));
          if (parsed && mounted) dispatch({ type: 'hydrate', state: parsed });
        }
      } catch {
        // keep seeded state when storage is unreadable
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const addTransaction = useCallback((input: Omit<Transaction, 'id' | 'createdAt'>) => {
    dispatch({
      type: 'addTransaction',
      transaction: { ...input, id: uid('tx'), createdAt: new Date().toISOString() },
    });
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    dispatch({ type: 'updateTransaction', id, patch });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'deleteTransaction', id });
  }, []);

  const addWallet = useCallback((input: Omit<Wallet, 'id' | 'createdAt'>) => {
    dispatch({
      type: 'addWallet',
      wallet: { ...input, id: uid('wallet'), createdAt: new Date().toISOString() },
    });
  }, []);

  const updateWallet = useCallback((id: string, patch: Partial<Wallet>) => {
    dispatch({ type: 'updateWallet', id, patch });
  }, []);

  const deleteWallet = useCallback((id: string) => {
    dispatch({ type: 'deleteWallet', id });
  }, []);

  const addBudget = useCallback((input: Omit<Budget, 'id'>) => {
    dispatch({ type: 'addBudget', budget: { ...input, id: uid('budget') } });
  }, []);

  const updateBudget = useCallback((id: string, patch: Partial<Budget>) => {
    dispatch({ type: 'updateBudget', id, patch });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    dispatch({ type: 'deleteBudget', id });
  }, []);

  const addCategory = useCallback((input: Omit<Category, 'id'>) => {
    dispatch({ type: 'addCategory', category: { ...input, id: uid('cat') } });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    dispatch({ type: 'deleteCategory', id });
  }, []);

  const resetData = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      hydrated,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addWallet,
      updateWallet,
      deleteWallet,
      addBudget,
      updateBudget,
      deleteBudget,
      addCategory,
      deleteCategory,
      resetData,
    }),
    [
      state,
      hydrated,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addWallet,
      updateWallet,
      deleteWallet,
      addBudget,
      updateBudget,
      deleteBudget,
      addCategory,
      deleteCategory,
      resetData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
