import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header, IconButton } from '../components/Header';
import { Card } from '../components/Card';
import { Chip, EmptyState, MonthSwitcher } from '../components/ui';
import { TransactionRow } from '../components/TransactionRow';
import { Fab } from '../components/Fab';
import { Button } from '../components/Button';
import { useApp } from '../store/AppContext';
import { sumType, transactionsInMonth } from '../lib/finance';
import {
  addMonths,
  currentMonthKey,
  formatDayHeader,
  monthLabel,
} from '../lib/date';
import { formatIDR } from '../lib/format';
import { colors, radius, shadow } from '../theme';
import { TabScreenProps } from '../navigation/types';
import { Transaction, TxType } from '../types';

type FilterType = 'all' | TxType;

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
];

interface DaySection {
  date: string;
  items: Transaction[];
  income: number;
  expense: number;
}

export function TransactionsScreen({ navigation }: TabScreenProps<'Transaksi'>) {
  const { state } = useApp();
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return transactionsInMonth(state.transactions, monthKey)
      .filter((tx) => (filter === 'all' ? true : tx.type === filter))
      .filter((tx) => {
        if (!term) return true;
        const category = state.categories.find((c) => c.id === tx.categoryId);
        const wallet = state.wallets.find((w) => w.id === tx.walletId);
        const toWallet = state.wallets.find((w) => w.id === tx.toWalletId);
        return [tx.note, category?.name, wallet?.name, toWallet?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      })
      .sort((a, b) => {
        if (a.date === b.date) return b.createdAt.localeCompare(a.createdAt);
        return b.date.localeCompare(a.date);
      });
  }, [state.transactions, state.categories, state.wallets, monthKey, filter, query]);

  const sections = useMemo<DaySection[]>(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const list = map.get(tx.date) ?? [];
      list.push(tx);
      map.set(tx.date, list);
    }
    return Array.from(map.entries()).map(([date, items]) => ({
      date,
      items,
      income: sumType(items, 'income'),
      expense: sumType(items, 'expense'),
    }));
  }, [filtered]);

  const income = sumType(filtered, 'income');
  const expense = sumType(filtered, 'expense');
  const transfer = sumType(filtered, 'transfer');

  const showIncome = filter === 'all' || filter === 'income';
  const showExpense = filter === 'all' || filter === 'expense';
  const showTransfer = filter === 'transfer';

  return (
    <Screen>
      <Header
        large
        title="Transaksi"
        subtitle={`${filtered.length} transaksi · ${monthLabel(monthKey)}`}
        right={
          <IconButton
            icon="add"
            color={colors.white}
            background={colors.primary}
            onPress={() => navigation.navigate('TransactionForm', { type: 'expense' })}
          />
        }
      />
      <View style={styles.controls}>
        <View style={styles.monthRow}>
          <MonthSwitcher
            label={monthLabel(monthKey)}
            onPrev={() => setMonthKey((key) => addMonths(key, -1))}
            onNext={() => setMonthKey((key) => addMonths(key, 1))}
          />
          <IconButton
            icon={searchOpen ? 'close' : 'search'}
            background={colors.card}
            onPress={() => {
              setSearchOpen((open) => !open);
              setQuery('');
            }}
          />
        </View>

        {searchOpen ? (
          <View style={styles.searchBox}>
            <Ionicons name="search" size={17} color={colors.faint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cari catatan, kategori, dompet..."
              placeholderTextColor={colors.faint}
              style={styles.searchInput}
              autoFocus
              returnKeyType="search"
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={17} color={colors.faint} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              active={filter === item.value}
              onPress={() => setFilter(item.value)}
              color={
                item.value === 'income'
                  ? colors.income
                  : item.value === 'expense'
                    ? colors.expense
                    : colors.primary
              }
            />
          ))}
        </ScrollView>

        <Card style={styles.summary} padded={false}>
          {showIncome ? (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Masuk</Text>
              <Text style={[styles.summaryValue, { color: colors.income }]} numberOfLines={1}>
                {formatIDR(income)}
              </Text>
            </View>
          ) : null}
          {showIncome && showExpense ? <View style={styles.summaryDivider} /> : null}
          {showExpense ? (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Keluar</Text>
              <Text style={[styles.summaryValue, { color: colors.expense }]} numberOfLines={1}>
                {formatIDR(expense)}
              </Text>
            </View>
          ) : null}
          {showTransfer ? (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Transfer</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]} numberOfLines={1}>
                {formatIDR(transfer)}
              </Text>
            </View>
          ) : null}
        </Card>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={state.transactions.length === 0 ? 'receipt-outline' : 'search-outline'}
            title={state.transactions.length === 0 ? 'Belum ada transaksi' : 'Transaksi tidak ditemukan'}
            message={
              state.transactions.length === 0
                ? 'Mulai catat pemasukan dan pengeluaran pertamamu hari ini.'
                : 'Coba ubah filter, bulan, atau kata kunci pencarian.'
            }
            action={
              state.transactions.length === 0 ? (
                <Button
                  title="Catat Transaksi"
                  icon="add"
                  onPress={() => navigation.navigate('TransactionForm', { type: 'expense' })}
                />
              ) : undefined
            }
          />
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{formatDayHeader(item.date)}</Text>
              <Text style={styles.dayMeta}>
                {item.income > 0 ? `+${formatIDR(item.income)}` : ''}
                {item.income > 0 && item.expense > 0 ? '  ·  ' : ''}
                {item.expense > 0 ? `-${formatIDR(item.expense)}` : ''}
                {item.income === 0 && item.expense === 0 ? 'Transfer' : ''}
              </Text>
            </View>
            <Card padded={false} style={styles.dayCard}>
              <View style={styles.dayCardInner}>
                {item.items.map((tx, index) => {
                  const category = state.categories.find((c) => c.id === tx.categoryId);
                  const wallet = state.wallets.find((w) => w.id === tx.walletId);
                  const toWallet = state.wallets.find((w) => w.id === tx.toWalletId);
                  return (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      categoryName={category?.name ?? 'Tanpa kategori'}
                      categoryIcon={category?.icon ?? 'ellipsis-horizontal'}
                      categoryColor={category?.color ?? colors.muted}
                      walletName={wallet?.name ?? '-'}
                      toWalletName={toWallet?.name}
                      last={index === item.items.length - 1}
                      onPress={() => navigation.navigate('TransactionForm', { id: tx.id })}
                    />
                  );
                })}
              </View>
            </Card>
          </View>
        )}
        ListFooterComponent={<View style={{ height: 96 }} />}
      />
      <Fab onPress={() => navigation.navigate('TransactionForm', { type: 'expense' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: {
    paddingHorizontal: 20,
    gap: 12,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    ...shadow,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13.5,
    color: colors.text,
    fontWeight: '500',
  },
  chipRow: {
    gap: 8,
    paddingRight: 8,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  summaryItem: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 3,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: colors.line,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 18,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dayTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSoft,
  },
  dayMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  dayCard: {
    paddingHorizontal: 16,
  },
  dayCardInner: {
    paddingTop: 2,
  },
});
