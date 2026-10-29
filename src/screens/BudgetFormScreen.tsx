import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CategoryIcon } from '../components/TransactionRow';
import { EmptyState } from '../components/ui';
import { useApp } from '../store/AppContext';
import { expenseByCategory } from '../lib/finance';
import { currentMonthKey, monthLabel } from '../lib/date';
import { formatIDR, formatInputAmount } from '../lib/format';
import { colors, radius, withAlpha } from '../theme';
import { RootScreenProps } from '../navigation/types';

export function BudgetFormScreen({ navigation, route }: RootScreenProps<'BudgetForm'>) {
  const { state, addBudget, updateBudget, deleteBudget } = useApp();
  const editing = route.params?.id
    ? state.budgets.find((budget) => budget.id === route.params?.id)
    : undefined;

  const available = useMemo(() => {
    return state.categories.filter((category) => {
      if (category.type !== 'expense') return false;
      const existing = state.budgets.find((budget) => budget.categoryId === category.id);
      if (!existing) return true;
      return existing.id === editing?.id;
    });
  }, [state.categories, state.budgets, editing?.id]);

  const [categoryId, setCategoryId] = useState<string | null>(
    editing?.categoryId ?? available[0]?.id ?? null
  );
  const [amountDigits, setAmountDigits] = useState(editing ? String(editing.amount) : '');

  const monthKey = currentMonthKey();
  const spentMap = useMemo(
    () => expenseByCategory(state.transactions, monthKey),
    [state.transactions, monthKey]
  );
  const spent = categoryId ? spentMap.get(categoryId) ?? 0 : 0;
  const amount = parseInt(amountDigits || '0', 10);
  const remaining = amount - spent;
  const selectedCategory = state.categories.find((category) => category.id === categoryId);

  const save = () => {
    if (!categoryId) {
      Alert.alert('Kategori belum dipilih', 'Pilih kategori untuk anggaran ini.');
      return;
    }
    if (!amount || amount <= 0) {
      Alert.alert('Nominal belum diisi', 'Masukkan batas anggaran lebih dari nol.');
      return;
    }
    if (editing) {
      updateBudget(editing.id, { categoryId, amount });
    } else {
      addBudget({ categoryId, amount });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    navigation.goBack();
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert('Hapus anggaran?', 'Transaksi tetap tersimpan, hanya batas anggaran yang dihapus.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteBudget(editing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header
          title={editing ? 'Ubah Anggaran' : 'Buat Anggaran'}
          subtitle="Batas pengeluaran bulanan"
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {available.length === 0 ? (
            <Card>
              <EmptyState
                icon="checkmark-done-outline"
                title="Semua kategori sudah dianggarkan"
                message="Setiap kategori pengeluaran sudah memiliki batas anggaran. Ubah anggaran yang ada atau tambahkan kategori baru."
                action={
                  <Button
                    title="Kelola Kategori"
                    icon="pricetags-outline"
                    variant="secondary"
                    onPress={() => navigation.navigate('Categories')}
                  />
                }
              />
            </Card>
          ) : (
            <>
              <Text style={styles.label}>Kategori pengeluaran</Text>
              <View style={styles.grid}>
                {available.map((category) => {
                  const selected = category.id === categoryId;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setCategoryId(category.id)}
                      style={[
                        styles.categoryItem,
                        selected && {
                          borderColor: category.color,
                          backgroundColor: withAlpha(category.color, 0.08),
                        },
                      ]}
                    >
                      <CategoryIcon
                        icon={category.icon}
                        color={category.color}
                        size={40}
                        iconSize={19}
                      />
                      <Text
                        style={[styles.categoryName, selected && { color: category.color }]}
                        numberOfLines={2}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.label, { marginTop: 22 }]}>Batas anggaran per bulan</Text>
              <Card style={styles.amountCard}>
                <View style={styles.amountRow}>
                  <Text style={styles.currency}>Rp</Text>
                  <TextInput
                    value={formatInputAmount(amountDigits)}
                    onChangeText={(value) => setAmountDigits(value.replace(/[^\d]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.faint}
                    style={styles.amountInput}
                    maxLength={12}
                  />
                </View>
                <Text style={styles.amountHint}>
                  Pengeluaran {selectedCategory?.name ?? 'kategori ini'} pada {monthLabel(monthKey)}:{' '}
                  {formatIDR(spent)}
                </Text>
              </Card>

              {amount > 0 ? (
                <View
                  style={[
                    styles.preview,
                    { backgroundColor: remaining >= 0 ? colors.incomeSoft : colors.expenseSoft },
                  ]}
                >
                  <Ionicons
                    name={remaining >= 0 ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                    size={18}
                    color={remaining >= 0 ? colors.income : colors.expense}
                  />
                  <Text
                    style={[
                      styles.previewText,
                      { color: remaining >= 0 ? colors.income : colors.expense },
                    ]}
                  >
                    {remaining >= 0
                      ? `Sisa anggaran bulan ini ${formatIDR(remaining)}`
                      : `Anggaran bulan ini sudah terlampaui ${formatIDR(Math.abs(remaining))}`}
                  </Text>
                </View>
              ) : null}

              <Button
                title={editing ? 'Simpan Perubahan' : 'Simpan Anggaran'}
                icon="checkmark"
                onPress={save}
                style={{ marginTop: 18 }}
              />

              {editing ? (
                <Button
                  title="Hapus Anggaran"
                  icon="trash-outline"
                  variant="danger"
                  onPress={confirmDelete}
                  style={{ marginTop: 10 }}
                />
              ) : null}

              <View style={styles.note}>
                <Ionicons name="refresh-outline" size={15} color={colors.faint} />
                <Text style={styles.noteText}>
                  Anggaran otomatis diperbarui setiap bulan tanpa perlu membuat ulang.
                </Text>
              </View>
            </>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: '22.7%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  categoryName: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSoft,
    textAlign: 'center',
    minHeight: 26,
  },
  amountCard: {
    padding: 18,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currency: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  amountInput: {
    flex: 1,
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
    paddingVertical: 4,
    padding: 0,
  },
  amountHint: {
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 6,
    lineHeight: 16,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    marginTop: 14,
  },
  previewText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: colors.faint,
    lineHeight: 16,
  },
});
