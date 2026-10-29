import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export interface MonthBar {
  label: string;
  income: number;
  expense: number;
}

export function MonthlyBarChart({
  data,
  height = 132,
}: {
  data: MonthBar[];
  height?: number;
}) {
  const max = Math.max(
    1,
    ...data.map((item) => Math.max(item.income, item.expense))
  );
  const barsHeight = height - 24;

  return (
    <View>
      <View style={[styles.chart, { height }]}>
        {data.map((item) => {
          const incomeHeight =
            item.income > 0 ? Math.max(4, (item.income / max) * (barsHeight - 4)) : 3;
          const expenseHeight =
            item.expense > 0 ? Math.max(4, (item.expense / max) * (barsHeight - 4)) : 3;
          return (
            <View key={item.label} style={styles.column}>
              <View style={[styles.bars, { height: barsHeight }]}>
                <View
                  style={[
                    styles.bar,
                    { height: incomeHeight, backgroundColor: colors.income },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    { height: expenseHeight, backgroundColor: colors.expense },
                  ]}
                />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendText}>Pemasukan</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendText}>Pengeluaran</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    paddingBottom: 2,
  },
  bar: {
    width: 9,
    borderRadius: radius.sm,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  label: {
    fontSize: 10.5,
    color: colors.muted,
    fontWeight: '600',
    marginTop: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11.5,
    color: colors.muted,
    fontWeight: '600',
  },
});
