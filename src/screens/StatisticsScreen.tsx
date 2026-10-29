import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Card, SectionTitle } from '../components/Card';
import { EmptyState, MonthSwitcher, Segmented } from '../components/ui';
import { DonutChart } from '../components/DonutChart';
import { MonthlyBarChart } from '../components/BarChart';
import { CategoryIcon } from '../components/TransactionRow';
import { useApp } from '../store/AppContext';
import {
  categoryBreakdown,
  monthlyTotals,
  transactionsInMonth,
} from '../lib/finance';
import {
  addMonths,
  currentMonthKey,
  daysInMonth,
  lastNMonths,
  monthLabel,
  monthLabelShort,
} from '../lib/date';
import { formatIDR, formatIDRShort } from '../lib/format';
import { colors, radius, withAlpha } from '../theme';

export function StatisticsScreen() {
  const { state } = useApp();
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [mode, setMode] = useState<'expense' | 'income'>('expense');

  const monthTx = useMemo(
    () => transactionsInMonth(state.transactions, monthKey),
    [state.transactions, monthKey]
  );
  const totals = useMemo(() => monthlyTotals(state.transactions, monthKey), [state.transactions, monthKey]);
  const breakdown = useMemo(
    () => categoryBreakdown(state.transactions, state.categories, monthKey, mode),
    [state.transactions, state.categories, monthKey, mode]
  );
  const breakdownTotal = breakdown.reduce((sum, slice) => sum + slice.total, 0);
  const chartData = useMemo(
    () =>
      lastNMonths(monthKey, 6).map((key) => {
        const month = monthlyTotals(state.transactions, key);
        return { label: monthLabelShort(key), income: month.income, expense: month.expense };
      }),
    [state.transactions, monthKey]
  );

  const largest = useMemo(() => {
    const items = monthTx.filter((tx) => tx.type === mode);
    return items.reduce<number>((max, tx) => Math.max(max, tx.amount), 0);
  }, [monthTx, mode]);

  const average = totals.expense / daysInMonth(monthKey);
  const hasData = monthTx.length > 0;

  return (
    <Screen>
      <Header large title="Statistik" subtitle="Analisis keuangan bulanan" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.monthRow}>
          <MonthSwitcher
            label={monthLabel(monthKey)}
            onPrev={() => setMonthKey((key) => addMonths(key, -1))}
            onNext={() => setMonthKey((key) => addMonths(key, 1))}
          />
        </View>

        {!hasData ? (
          <Card style={{ marginTop: 8 }}>
            <EmptyState
              icon="stats-chart-outline"
              title="Belum ada data"
              message={`Belum ada transaksi pada ${monthLabel(monthKey)}. Pilih bulan lain atau mulai catat transaksi.`}
            />
          </Card>
        ) : (
          <>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryLabel}>Pemasukan</Text>
                  <Text style={[styles.summaryValue, { color: colors.income }]}>
                    {formatIDR(totals.income)}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryLabel}>Pengeluaran</Text>
                  <Text style={[styles.summaryValue, { color: colors.expense }]}>
                    {formatIDR(totals.expense)}
                  </Text>
                </View>
              </View>

              <View style={styles.compareTrack}>
                <View
                  style={[
                    styles.compareFill,
                    {
                      flex: totals.income > 0 ? totals.income : 0.0001,
                      backgroundColor: colors.income,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.compareFill,
                    {
                      flex: totals.expense > 0 ? totals.expense : 0.0001,
                      backgroundColor: colors.expense,
                    },
                  ]}
                />
              </View>

              <View style={styles.netRow}>
                <Text style={styles.netLabel}>Selisih bulan ini</Text>
                <Text
                  style={[
                    styles.netValue,
                    { color: totals.income - totals.expense >= 0 ? colors.income : colors.expense },
                  ]}
                >
                  {totals.income - totals.expense >= 0 ? '+' : '-'}
                  {formatIDR(Math.abs(totals.income - totals.expense))}
                </Text>
              </View>
            </Card>

            <View style={styles.statGrid}>
              <MiniStat
                icon="receipt-outline"
                label="Transaksi"
                value={`${totals.count}x`}
                color={colors.primary}
              />
              <MiniStat
                icon="calendar-outline"
                label="Rata-rata/hari"
                value={formatIDRShort(average)}
                color={colors.warning}
              />
              <MiniStat
                icon="trending-up-outline"
                label="Terbesar"
                value={formatIDRShort(largest)}
                color={mode === 'expense' ? colors.expense : colors.income}
              />
            </View>

            <SectionTitle title={mode === 'expense' ? 'Pengeluaran per kategori' : 'Pemasukan per kategori'} />
            <Card>
              <Segmented
                options={[
                  { label: 'Pengeluaran', value: 'expense' },
                  { label: 'Pemasukan', value: 'income' },
                ]}
                value={mode}
                onChange={setMode}
                accent={mode === 'expense' ? colors.expense : colors.income}
              />

              {breakdown.length === 0 ? (
                <View style={styles.noCategory}>
                  <Text style={styles.noCategoryText}>
                    Tidak ada {mode === 'expense' ? 'pengeluaran' : 'pemasukan'} pada bulan ini.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.donutWrap}>
                    <DonutChart
                      slices={breakdown.map((slice) => ({
                        value: slice.total,
                        color: slice.category.color,
                      }))}
                      size={176}
                      thickness={24}
                    >
                      <Text style={styles.donutLabel}>Total</Text>
                      <Text style={styles.donutValue} numberOfLines={1} adjustsFontSizeToFit>
                        {formatIDRShort(breakdownTotal)}
                      </Text>
                      <Text style={styles.donutSub}>{breakdown.length} kategori</Text>
                    </DonutChart>
                  </View>

                  <View style={styles.categoryList}>
                    {breakdown.map((slice, index) => (
                      <View
                        key={slice.category.id}
                        style={[styles.categoryRow, index > 0 && styles.categoryBorder]}
                      >
                        <CategoryIcon
                          icon={slice.category.icon}
                          color={slice.category.color}
                          size={38}
                          iconSize={18}
                        />
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>{slice.category.name}</Text>
                          <Text style={styles.categoryMeta}>
                            {formatIDR(slice.total)} · {Math.round(slice.share)}%
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.shareBadge,
                            { backgroundColor: withAlpha(slice.category.color, 0.12) },
                          ]}
                        >
                          <Text style={[styles.shareText, { color: slice.category.color }]}>
                            {slice.share.toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Card>

            <SectionTitle title="Perbandingan 6 bulan" />
            <Card>
              <MonthlyBarChart data={chartData} />
            </Card>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.miniStat}>
      <View style={[styles.miniIcon, { backgroundColor: withAlpha(color, 0.12) }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.miniValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.miniLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  monthRow: {
    marginBottom: 14,
  },
  summaryCard: {
    padding: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCol: {
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: colors.muted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: colors.line,
    marginHorizontal: 12,
  },
  compareTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
    gap: 2,
  },
  compareFill: {
    height: 8,
    borderRadius: 4,
  },
  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  netLabel: {
    fontSize: 12.5,
    color: colors.muted,
    fontWeight: '600',
  },
  netValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  miniStat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
    alignItems: 'flex-start',
  },
  miniIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  miniValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
  },
  miniLabel: {
    fontSize: 10.5,
    color: colors.muted,
    fontWeight: '600',
  },
  donutWrap: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 8,
  },
  donutLabel: {
    fontSize: 10.5,
    color: colors.muted,
    fontWeight: '600',
  },
  donutValue: {
    fontSize: 17,
    color: colors.text,
    fontWeight: '800',
    marginTop: 2,
  },
  donutSub: {
    fontSize: 10,
    color: colors.faint,
    fontWeight: '500',
    marginTop: 2,
  },
  categoryList: {
    marginTop: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
  },
  categoryBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  categoryInfo: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  categoryMeta: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
  },
  shareBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '800',
  },
  noCategory: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  noCategoryText: {
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
  },
});
