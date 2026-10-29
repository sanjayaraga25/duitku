import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header, IconButton } from '../components/Header';
import { Card, SectionTitle } from '../components/Card';
import { Button } from '../components/Button';
import { EmptyState, MonthSwitcher, ProgressBar } from '../components/ui';
import { CategoryIcon } from '../components/TransactionRow';
import { useApp } from '../store/AppContext';
import { budgetProgressList } from '../lib/finance';
import { addMonths, currentMonthKey, monthLabel } from '../lib/date';
import { formatIDR, formatIDRShort } from '../lib/format';
import { colors, radius, shadow, withAlpha } from '../theme';
import { TabScreenProps } from '../navigation/types';

export function BudgetScreen({ navigation }: TabScreenProps<'Anggaran'>) {
  const { state } = useApp();
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const items = useMemo(() => budgetProgressList(state, monthKey), [state, monthKey]);

  const totalBudget = items.reduce((sum, item) => sum + item.budget.amount, 0);
  const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
  const remaining = totalBudget - totalSpent;
  const ratio = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const overCount = items.filter((item) => item.over).length;

  return (
    <Screen>
      <Header
        large
        title="Anggaran"
        subtitle="Kendalikan pengeluaran per kategori"
        right={
          <IconButton
            icon="add"
            color={colors.white}
            background={colors.primary}
            onPress={() => navigation.navigate('BudgetForm')}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.monthRow}>
          <MonthSwitcher
            label={monthLabel(monthKey)}
            onPrev={() => setMonthKey((key) => addMonths(key, -1))}
            onNext={() => setMonthKey((key) => addMonths(key, 1))}
          />
        </View>

        {items.length === 0 ? (
          <Card>
            <EmptyState
              icon="flag-outline"
              title="Belum ada anggaran"
              message="Tentukan batas pengeluaran per kategori. Duitku akan memantau sisanya setiap bulan."
              action={
                <Button
                  title="Buat Anggaran"
                  icon="add"
                  onPress={() => navigation.navigate('BudgetForm')}
                />
              }
            />
          </Card>
        ) : (
          <>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryLabel}>
                    {remaining >= 0 ? 'Sisa anggaran' : 'Melebihi anggaran'}
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: remaining >= 0 ? colors.text : colors.expense },
                    ]}
                  >
                    {formatIDR(Math.abs(remaining))}
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryBadge,
                    {
                      backgroundColor:
                        ratio >= 100 ? colors.expenseSoft : withAlpha(colors.primary, 0.1),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryBadgeText,
                      { color: ratio >= 100 ? colors.expense : colors.primary },
                    ]}
                  >
                    {Math.round(ratio)}%
                  </Text>
                </View>
              </View>
              <ProgressBar
                ratio={ratio}
                height={10}
                color={ratio >= 100 ? colors.expense : ratio >= 80 ? colors.warning : colors.primary}
              />
              <View style={styles.summaryFoot}>
                <Text style={styles.summaryMeta}>
                  Terpakai {formatIDRShort(totalSpent)} dari {formatIDRShort(totalBudget)}
                </Text>
                <Text style={styles.summaryMeta}>{items.length} kategori</Text>
              </View>
              {overCount > 0 ? (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={colors.expense} />
                  <Text style={styles.warningText}>
                    {overCount} kategori melebihi anggaran bulan ini.
                  </Text>
                </View>
              ) : null}
            </Card>

            <SectionTitle title="Anggaran per kategori" />
            <View style={styles.list}>
              {items.map((item) => {
                const barColor = item.over
                  ? colors.expense
                  : item.ratio >= 80
                    ? colors.warning
                    : item.category?.color ?? colors.primary;
                return (
                  <Pressable
                    key={item.budget.id}
                    onPress={() => navigation.navigate('BudgetForm', { id: item.budget.id })}
                    style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                  >
                    <Card style={styles.itemCard}>
                      <View style={styles.itemTop}>
                        <View style={styles.itemLeft}>
                          <CategoryIcon
                            icon={item.category?.icon ?? 'ellipsis-horizontal'}
                            color={item.category?.color ?? colors.primary}
                            size={42}
                          />
                          <View>
                            <Text style={styles.itemName}>
                              {item.category?.name ?? 'Kategori'}
                            </Text>
                            <Text style={styles.itemMeta}>
                              {formatIDR(item.spent)} / {formatIDR(item.budget.amount)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.itemPercent}>
                          <Text style={[styles.itemPercentText, { color: barColor }]}>
                            {Math.round(item.ratio)}%
                          </Text>
                          <Ionicons name="chevron-forward" size={14} color={colors.faint} />
                        </View>
                      </View>
                      <ProgressBar ratio={item.ratio} color={barColor} height={7} />
                      <Text
                        style={[
                          styles.itemRemaining,
                          { color: item.over ? colors.expense : colors.muted },
                        ]}
                      >
                        {item.over
                          ? `Lebih ${formatIDR(Math.abs(item.remaining))} dari anggaran`
                          : `Sisa ${formatIDR(item.remaining)}`}
                      </Text>
                    </Card>
                  </Pressable>
                );
              })}
            </View>

            <Button
              title="Tambah Anggaran"
              icon="add"
              variant="secondary"
              onPress={() => navigation.navigate('BudgetForm')}
              style={{ marginTop: 14 }}
            />
          </>
        )}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={15} color={colors.faint} />
          <Text style={styles.noteText}>
            Anggaran berlaku otomatis setiap bulan dan dapat diubah kapan saja.
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
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
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginTop: 3,
  },
  summaryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  summaryBadgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  summaryFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  summaryMeta: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.expenseSoft,
    padding: 10,
    borderRadius: radius.sm,
    marginTop: 14,
  },
  warningText: {
    fontSize: 11.5,
    color: colors.expense,
    fontWeight: '600',
    flex: 1,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    padding: 15,
    ...shadow,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 11.5,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  itemPercent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemPercentText: {
    fontSize: 13,
    fontWeight: '800',
  },
  itemRemaining: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: colors.faint,
    lineHeight: 16,
  },
});
