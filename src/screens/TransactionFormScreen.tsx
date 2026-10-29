import React, { useState } from 'react';
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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Header, IconButton } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip, Segmented } from '../components/ui';
import { CategoryIcon } from '../components/TransactionRow';
import { useApp } from '../store/AppContext';
import { walletBalance } from '../lib/finance';
import { formatInputAmount, formatIDR } from '../lib/format';
import {
  parseISODate,
  toISODate,
  todayISO,
  yesterdayISO,
  formatDateLongID,
} from '../lib/date';
import { colors, radius, withAlpha } from '../theme';
import { RootScreenProps } from '../navigation/types';
import { TxType } from '../types';

const TYPE_OPTIONS: { label: string; value: TxType }[] = [
  { label: 'Pengeluaran', value: 'expense' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
];

export function TransactionFormScreen({ navigation, route }: RootScreenProps<'TransactionForm'>) {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const editing = route.params?.id
    ? state.transactions.find((tx) => tx.id === route.params?.id)
    : undefined;
  const initialType = editing?.type ?? route.params?.type ?? 'expense';
  const initialCategory =
    state.categories.find(
      (category) => category.type === (initialType === 'income' ? 'income' : 'expense')
    ) ?? null;

  const [type, setType] = useState<TxType>(initialType);
  const [amountDigits, setAmountDigits] = useState(editing ? String(editing.amount) : '');
  const [categoryId, setCategoryId] = useState<string | null>(
    editing ? editing.categoryId : initialType === 'transfer' ? null : initialCategory?.id ?? null
  );
  const [walletId, setWalletId] = useState(editing?.walletId ?? state.wallets[0]?.id ?? '');
  const [toWalletId, setToWalletId] = useState(
    editing?.toWalletId ??
      state.wallets.find((wallet) => wallet.id !== (editing?.walletId ?? state.wallets[0]?.id))?.id ??
      ''
  );
  const [note, setNote] = useState(editing?.note ?? '');
  const [date, setDate] = useState(editing?.date ?? todayISO());
  const [showPicker, setShowPicker] = useState(false);

  const amount = parseInt(amountDigits || '0', 10);
  const categories = state.categories.filter((category) =>
    type === 'income' ? category.type === 'income' : category.type === 'expense'
  );
  const accent =
    type === 'income' ? colors.income : type === 'expense' ? colors.expense : colors.primary;

  const changeType = (next: TxType) => {
    setType(next);
    if (next === 'transfer') {
      setCategoryId(null);
      return;
    }
    const current = state.categories.find((category) => category.id === categoryId);
    if (!current || current.type !== next) {
      const fallback = state.categories.find((category) => category.type === next);
      setCategoryId(fallback?.id ?? null);
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (event.type === 'dismissed') return;
    if (event.type === 'set' && selected) setDate(toISODate(selected));
  };

  const save = () => {
    if (!amount || amount <= 0) {
      Alert.alert('Jumlah belum diisi', 'Masukkan nominal transaksi terlebih dahulu.');
      return;
    }
    if (!walletId) {
      Alert.alert('Dompet belum dipilih', 'Tambahkan dompet terlebih dahulu.');
      return;
    }
    if (type !== 'transfer' && !categoryId) {
      Alert.alert('Kategori belum dipilih', 'Pilih kategori untuk transaksi ini.');
      return;
    }
    if (type === 'transfer') {
      if (!toWalletId) {
        Alert.alert('Dompet tujuan kosong', 'Pilih dompet tujuan transfer.');
        return;
      }
      if (toWalletId === walletId) {
        Alert.alert('Dompet sama', 'Dompet asal dan tujuan tidak boleh sama.');
        return;
      }
    }

    const payload = {
      type,
      amount,
      categoryId: type === 'transfer' ? null : categoryId,
      walletId,
      toWalletId: type === 'transfer' ? toWalletId : null,
      note: note.trim(),
      date,
    };

    if (editing) {
      updateTransaction(editing.id, payload);
    } else {
      addTransaction(payload);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    navigation.goBack();
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert('Hapus transaksi?', 'Transaksi ini akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(editing.id);
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
          title={editing ? 'Ubah Transaksi' : 'Catat Transaksi'}
          subtitle={type === 'income' ? 'Pemasukan baru' : type === 'expense' ? 'Pengeluaran baru' : 'Pindah saldo antar dompet'}
          onBack={() => navigation.goBack()}
          right={
            editing ? (
              <IconButton
                icon="trash-outline"
                color={colors.expense}
                background={colors.expenseSoft}
                onPress={confirmDelete}
              />
            ) : undefined
          }
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Segmented options={TYPE_OPTIONS} value={type} onChange={changeType} accent={accent} />

          <Card style={styles.amountCard}>
            <Text style={styles.amountLabel}>
              {type === 'income' ? 'Jumlah pemasukan' : type === 'expense' ? 'Jumlah pengeluaran' : 'Jumlah transfer'}
            </Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currency, { color: accent }]}>Rp</Text>
              <TextInput
                value={formatInputAmount(amountDigits)}
                onChangeText={(value) => setAmountDigits(value.replace(/[^\d]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.faint}
                style={styles.amountInput}
                autoFocus={!editing}
                maxLength={15}
              />
            </View>
            <View style={[styles.amountUnderline, { backgroundColor: withAlpha(accent, 0.35) }]} />
          </Card>

          {type !== 'transfer' ? (
            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <Text style={styles.blockTitle}>Kategori</Text>
                <Pressable onPress={() => navigation.navigate('Categories')} hitSlop={8}>
                  <Text style={styles.blockLink}>Kelola</Text>
                </Pressable>
              </View>
              <View style={styles.grid}>
                {categories.map((category) => {
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
              {categories.length === 0 ? (
                <Text style={styles.emptyCategories}>
                  Belum ada kategori. Tambahkan lewat menu Kelola.
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.block}>
            <Text style={styles.blockTitle}>
              {type === 'transfer' ? 'Dari dompet' : 'Dompet'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletRow}
            >
              {state.wallets.map((wallet) => {
                const selected = wallet.id === walletId;
                return (
                  <Pressable
                    key={wallet.id}
                    onPress={() => {
                      setWalletId(wallet.id);
                      if (type === 'transfer' && toWalletId === wallet.id) {
                        const alternative = state.wallets.find((item) => item.id !== wallet.id);
                        setToWalletId(alternative?.id ?? '');
                      }
                    }}
                    style={[
                      styles.walletChip,
                      selected && { borderColor: wallet.color, backgroundColor: withAlpha(wallet.color, 0.08) },
                    ]}
                  >
                    <View style={[styles.walletChipIcon, { backgroundColor: withAlpha(wallet.color, 0.15) }]}>
                      <Ionicons name={wallet.icon as never} size={16} color={wallet.color} />
                    </View>
                    <View>
                      <Text style={styles.walletChipName} numberOfLines={1}>
                        {wallet.name}
                      </Text>
                      <Text style={styles.walletChipBalance} numberOfLines={1}>
                        {formatIDR(walletBalance(wallet.id, state))}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {type === 'transfer' ? (
              <>
                <Text style={[styles.blockTitle, { marginTop: 16 }]}>Ke dompet</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.walletRow}
                >
                  {state.wallets
                    .filter((wallet) => wallet.id !== walletId)
                    .map((wallet) => {
                      const selected = wallet.id === toWalletId;
                      return (
                        <Pressable
                          key={wallet.id}
                          onPress={() => setToWalletId(wallet.id)}
                          style={[
                            styles.walletChip,
                            selected && {
                              borderColor: wallet.color,
                              backgroundColor: withAlpha(wallet.color, 0.08),
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.walletChipIcon,
                              { backgroundColor: withAlpha(wallet.color, 0.15) },
                            ]}
                          >
                            <Ionicons name={wallet.icon as never} size={16} color={wallet.color} />
                          </View>
                          <View>
                            <Text style={styles.walletChipName} numberOfLines={1}>
                              {wallet.name}
                            </Text>
                            <Text style={styles.walletChipBalance} numberOfLines={1}>
                              {formatIDR(walletBalance(wallet.id, state))}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                </ScrollView>
                {state.wallets.length < 2 ? (
                  <Text style={styles.emptyCategories}>
                    Tambahkan minimal dua dompet untuk melakukan transfer.
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Tanggal</Text>
            <View style={styles.dateChips}>
              <Chip
                label="Hari ini"
                active={date === todayISO()}
                onPress={() => setDate(todayISO())}
                color={accent}
              />
              <Chip
                label="Kemarin"
                active={date === yesterdayISO()}
                onPress={() => setDate(yesterdayISO())}
                color={accent}
              />
              <Chip
                label={formatDateLongID(date)}
                active={date !== todayISO() && date !== yesterdayISO()}
                onPress={() => setShowPicker(true)}
                icon="calendar-outline"
                color={accent}
              />
            </View>
            {showPicker ? (
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={parseISODate(date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  locale="id-ID"
                  themeVariant="light"
                  onChange={onChangeDate}
                  maximumDate={new Date(2100, 11, 31)}
                />
                {Platform.OS === 'ios' ? (
                  <Pressable onPress={() => setShowPicker(false)} style={styles.pickerDone}>
                    <Text style={styles.pickerDoneText}>Selesai</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Catatan</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Contoh: makan siang, gaji bulan ini..."
              placeholderTextColor={colors.faint}
              style={styles.noteInput}
              multiline
              maxLength={160}
            />
          </View>

          {state.wallets.length === 0 ? (
            <Button
              title="Tambah Dompet Dulu"
              icon="wallet-outline"
              variant="secondary"
              onPress={() => navigation.navigate('WalletForm')}
            />
          ) : (
            <Button title={editing ? 'Simpan Perubahan' : 'Simpan Transaksi'} icon="checkmark" onPress={save} />
          )}

          {editing ? (
            <Button
              title="Hapus Transaksi"
              icon="trash-outline"
              variant="danger"
              onPress={confirmDelete}
              style={{ marginTop: 10 }}
            />
          ) : null}

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
  amountCard: {
    marginTop: 16,
    padding: 18,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  currency: {
    fontSize: 20,
    fontWeight: '800',
  },
  amountInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
    paddingVertical: 6,
    padding: 0,
  },
  amountUnderline: {
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
  block: {
    marginTop: 22,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    marginBottom: 10,
  },
  blockLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
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
  emptyCategories: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
    lineHeight: 17,
  },
  walletRow: {
    gap: 10,
    paddingRight: 8,
    paddingVertical: 2,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 140,
    maxWidth: 200,
  },
  walletChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletChipName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
  walletChipBalance: {
    fontSize: 10.5,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 1,
  },
  dateChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerWrap: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 8,
  },
  pickerDone: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pickerDoneText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  noteInput: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    minHeight: 76,
    textAlignVertical: 'top',
  },
});
