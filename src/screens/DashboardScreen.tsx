import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Header, IconButton } from '../components/Header';
import { Card, SectionTitle } from '../components/Card';
import { ProgressBar } from '../components/ui';
import { DonutChart } from '../components/DonutChart';
import { TransactionRow, CategoryIcon } from '../components/TransactionRow';
import { Fab } from '../components/Fab';
import { useApp } from '../store/AppContext';
import { budgetProgressList, categoryBreakdown, monthlyTotals, totalBalance, walletBalance } from '../lib/finance';
import { currentMonthKey, formatDateLongID, monthLabel, todayISO } from '../lib/date';
import { formatIDR, formatIDRShort } from '../lib/format';
import { colors, radius, shadow, withAlpha } from '../theme';
import { TabScreenProps } from '../navigation/types';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export function DashboardScreen({ navigation }: TabScreenProps<'Beranda'>) {
  const { state } = useApp();
  const [hidden, setHidden] = useState(false);
  const monthKey = currentMonthKey();
  const totals = monthlyTotals(state.transactions, monthKey);
  const balance = totalBalance(state);

  const breakdown = categoryBreakdown(
    state.transactions,
    state.categories,
    monthKey,
    'expense'
  );

  const donutSlices = breakdown.slice(0, 5).map((slice) => ({
    value: slice.total,
    color: slice.category.color,
  }));
  const restExpense = breakdown.slice(5).reduce((sum, slice) => sum + slice.total, 0);
  if (restExpense > 0) donutSlices.push({ value: restExpense, color: colors.faint });

  const budgets = budgetProgressList(state, monthKey);
  const recent = [...state.transactions]
    .sort((a, b) => {
      if (a.date === b.date) return b.createdAt.localeCompare(a.createdAt);
      return b.date.localeCompare(a.date);
    })
    .slice(0, 5);

  const openAdd = (type: 'income' | 'expense' | 'transfer') => {
    navigation.navigate('TransactionForm', { type });
  };

  return (
    <Screen>
      <Header
        large
        title={greeting()}
        subtitle={formatDateLongID(todayISO())}
        right={
          <IconButton
            icon="settings-outline"
            background={colors.card}
            onPress={() => navigation.navigate('Settings')}
          />
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <LinearGradient
          colors={[colors.primary, '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Total Saldo</Text>
            <Pressable onPress={() => setHidden((value) => !value)} hitSlop={8}>
              <Ionicons
                name={hidden ? 'eye-off-outline' : 'eye-outline'}
                size={19}
                color="rgba(255,255,255,0.85)"
              />
            </Pressable>
          </View>
          <Text
            style={styles.heroAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {hidden ? 'Rp ••••••' : formatIDR(balance)}
          </Text>
          <Text style={styles.heroSub}>
            {state.wallets.length} dompet · {monthLabel(monthKey)}
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <View style={styles.heroStatLabel}>
                <View style={[styles.heroDot, { backgroundColor: '#5EEAD4' }]} />
                <Text style={styles.heroStatText}>Pemasukan</Text>
              </View>
              <Text style={styles.heroStatValue}>
                {hidden ? '••••' : formatIDRShort(totals.income)}
              </Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <View style={styles.heroStatLabel}>
                <View style={[styles.heroDot, { backgroundColor: '#FDA4AF' }]} />
                <Text style={styles.heroStatText}>Pengeluaran</Text>
              </View>
              <Text style={styles.heroStatValue}>
                {hidden ? '••••' : formatIDRShort(totals.expense)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickRow}>
          <QuickAction
            icon="arrow-down-outline"
            label="Pemasukan"
            color={colors.income}
            onPress={() => openAdd('income')}
          />
          <QuickAction
            icon="arrow-up-outline"
            label="Pengeluaran"
            color={colors.expense}
            onPress={() => openAdd('expense')}
          />
          <QuickAction
            icon="swap-horizontal-outline"
            label="Transfer"
            color={colors.primary}
            onPress={() => openAdd('transfer')}
          />
        </View>

        <SectionTitle
          title="Anggaran bulan ini"
          action={budgets.length ? 'Kelola' : undefined}
          onAction={() => navigation.navigate('Anggaran')}
        />
        <Card padded={false} style={styles.cardInner}>
          {budgets.length === 0 ? (
            <Pressable
              onPress={() => navigation.navigate('Anggaran')}
              style={({ pressed }) => [styles.budgetEmpty, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.budgetEmptyIcon}>
                <Ionicons name="flag-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.budgetEmptyTitle}>Atur anggaran pertamamu</Text>
                <Text style={styles.budgetEmptyText}>
                  Batasi pengeluaran per kategori agar keuangan lebih terkontrol.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </Pressable>
          ) : (
            budgets.slice(0, 2).map((item, index) => {
              const barColor = item.over
                ? colors.expense
                : item.ratio >= 80
                  ? colors.warning
                  : item.category?.color ?? colors.primary;
              return (
                <View
                  key={item.budget.id}
                  style={[styles.budgetRow, index > 0 && styles.budgetRowBorder]}
                >
                  <View style={styles.budgetTop}>
                    <View style={styles.budgetLeft}>
                      <CategoryIcon
                        icon={item.category?.icon ?? 'ellipsis-horizontal'}
                        color={item.category?.color ?? colors.primary}
                        size={34}
                        iconSize={16}
                      />
                      <Text style={styles.budgetName}>{item.category?.name ?? 'Kategori'}</Text>
                    </View>
                    <Text style={[styles.budgetRatio, item.over && { color: colors.expense }]}>
                      {Math.round(item.ratio)}%
                    </Text>
                  </View>
                  <ProgressBar ratio={item.ratio} color={barColor} height={7} />
                  <Text style={styles.budgetMeta}>
                    {formatIDR(item.spent)} dari {formatIDR(item.budget.amount)}
                  </Text>
                </View>
              );
            })
          )}
        </Card>

        <SectionTitle
          title="Pengeluaran per kategori"
          action="Statistik"
          onAction={() => navigation.navigate('Statistik')}
        />
        <Card style={styles.chartCard}>
          {donutSlices.length === 0 ? (
            <View style={styles.chartEmpty}>
              <Ionicons name="pie-chart-outline" size={22} color={colors.faint} />
              <Text style={styles.chartEmptyText}>Belum ada pengeluaran bulan ini</Text>
            </View>
          ) : (
            <View style={styles.chartRow}>
              <DonutChart slices={donutSlices} size={124} thickness={17}>
                <Text style={styles.donutLabel}>Total</Text>
                <Text style={styles.donutValue}>{formatIDRShort(totals.expense)}</Text>
              </DonutChart>
              <View style={styles.legend}>
                {breakdown.slice(0, 4).map((slice) => (
                  <View key={slice.category.id} style={styles.legendRow}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: slice.category.color }]} />
                      <Text style={styles.legendName} numberOfLines={1}>
                        {slice.category.name}
                      </Text>
                    </View>
                    <Text style={styles.legendValue}>{Math.round(slice.share)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        <SectionTitle
          title="Transaksi terakhir"
          action={recent.length ? 'Lihat semua' : undefined}
          onAction={() => navigation.navigate('Transaksi')}
        />
        <Card padded={false} style={styles.cardInner}>
          {recent.length === 0 ? (
            <View style={styles.recentEmpty}>
              <Text style={styles.recentEmptyText}>
                Belum ada transaksi. Tekan tombol + untuk mulai mencatat.
              </Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recent.map((tx, index) => {
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
                    last={index === recent.length - 1}
                    onPress={() => navigation.navigate('TransactionForm', { id: tx.id })}
                  />
                );
              })}
            </View>
          )}
        </Card>

        <SectionTitle title="Dompet saya" action="Kelola" onAction={() => navigation.navigate('Dompet')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.walletRow}
        >
          {state.wallets.map((wallet) => {
            const value = walletBalance(wallet.id, state);
            return (
              <Pressable
                key={wallet.id}
                onPress={() => navigation.navigate('Dompet')}
                style={({ pressed }) => [
                  styles.walletCard,
                  { backgroundColor: withAlpha(wallet.color, 0.09) },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <View style={[styles.walletIcon, { backgroundColor: withAlpha(wallet.color, 0.16) }]}>
                  <Ionicons name={wallet.icon as never} size={19} color={wallet.color} />
                </View>
                <Text style={styles.walletName} numberOfLines={1}>
                  {wallet.name}
                </Text>
                <Text style={styles.walletBalance} numberOfLines={1} adjustsFontSizeToFit>
                  {hidden ? 'Rp ••••' : formatIDR(value)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ height: 96 }} />
      </ScrollView>
      <Fab onPress={() => openAdd('expense')} />
    </Screen>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quick, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
    >
      <View style={[styles.quickIcon, { backgroundColor: withAlpha(color, 0.12) }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  hero: {
    borderRadius: radius.xl,
    padding: 20,
    ...shadow,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroAmount: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 6,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  heroStat: {
    flex: 1,
    gap: 4,
  },
  heroStatLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  heroStatText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11.5,
    fontWeight: '600',
  },
  heroStatValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  heroDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: 14,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  quick: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 13,
    gap: 7,
    ...shadow,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSoft,
  },
  cardInner: {
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  chartCard: {
    paddingVertical: 18,
  },
  chartEmpty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  chartEmptyText: {
    fontSize: 12.5,
    color: colors.muted,
    fontWeight: '500',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  donutLabel: {
    fontSize: 10.5,
    color: colors.muted,
    fontWeight: '600',
  },
  donutValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '800',
    marginTop: 2,
  },
  legend: {
    flex: 1,
    gap: 11,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 12,
    color: colors.textSoft,
    fontWeight: '600',
    flex: 1,
  },
  legendValue: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '700',
  },
  budgetEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  budgetEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetEmptyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
  },
  budgetEmptyText: {
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 3,
    lineHeight: 16,
  },
  budgetRow: {
    paddingVertical: 14,
    gap: 8,
  },
  budgetRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  budgetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  budgetRatio: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.textSoft,
  },
  budgetMeta: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  recentList: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  recentEmpty: {
    padding: 18,
  },
  recentEmptyText: {
    fontSize: 12.5,
    color: colors.muted,
    lineHeight: 18,
    textAlign: 'center',
  },
  walletRow: {
    gap: 12,
    paddingRight: 20,
    paddingVertical: 2,
  },
  walletCard: {
    width: 158,
    borderRadius: radius.lg,
    padding: 14,
    gap: 8,
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSoft,
    letterSpacing: -0.2,
  },
});
