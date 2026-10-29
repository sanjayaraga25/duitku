import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, withAlpha } from '../theme';
import { Transaction } from '../types';
import { formatIDR } from '../lib/format';

export function CategoryIcon({
  icon,
  color,
  size = 42,
  iconSize = 20,
}: {
  icon: string;
  color: string;
  size?: number;
  iconSize?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.8,
        backgroundColor: withAlpha(color, 0.14),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon as never} size={iconSize} color={color} />
    </View>
  );
}

export function TransactionRow({
  transaction,
  categoryName,
  categoryIcon,
  categoryColor,
  walletName,
  toWalletName,
  onPress,
  last,
}: {
  transaction: Transaction;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  walletName: string;
  toWalletName?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const isTransfer = transaction.type === 'transfer';
  const title = isTransfer ? 'Transfer' : categoryName;
  const subtitleParts = [walletName];
  if (isTransfer && toWalletName) subtitleParts.push(`→ ${toWalletName}`);
  if (transaction.note) subtitleParts.push(transaction.note);
  const amountColor =
    transaction.type === 'income'
      ? colors.income
      : transaction.type === 'expense'
        ? colors.text
        : colors.primary;
  const prefix = transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.border, pressed && { opacity: 0.65 }]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: isTransfer
              ? colors.primarySoft
              : withAlpha(categoryColor, 0.14),
          },
        ]}
      >
        <Ionicons
          name={
            (isTransfer
              ? 'swap-horizontal'
              : categoryIcon) as never
          }
          size={20}
          color={isTransfer ? colors.primary : categoryColor}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitleParts.join(' · ')}
        </Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]} numberOfLines={1}>
        {prefix}
        {formatIDR(transaction.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
