import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TxType } from '../types';

export type TabParamList = {
  Beranda: undefined;
  Transaksi: undefined;
  Statistik: undefined;
  Anggaran: undefined;
  Dompet: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  TransactionForm: { id?: string; type?: TxType } | undefined;
  WalletForm: { id?: string } | undefined;
  BudgetForm: { id?: string } | undefined;
  Settings: undefined;
  Categories: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
