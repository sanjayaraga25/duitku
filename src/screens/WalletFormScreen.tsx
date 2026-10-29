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
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Field } from '../components/ui';
import { useApp } from '../store/AppContext';
import { walletBalance } from '../lib/finance';
import { formatIDR, formatInputAmount } from '../lib/format';
import { colors, palette, radius, withAlpha } from '../theme';
import { RootScreenProps } from '../navigation/types';
import {
  WALLET_TYPE_ICON,
  WALLET_TYPE_LABEL,
  WalletType,
} from '../types';

const WALLET_TYPES: WalletType[] = ['cash', 'bank', 'ewallet', 'investment'];

const ICONS = [
  'wallet-outline',
  'cash-outline',
  'business-outline',
  'phone-portrait-outline',
  'card-outline',
  'server-outline',
  'trending-up-outline',
  'logo-bitcoin',
  'home-outline',
  'car-outline',
  'briefcase-outline',
  'gift-outline',
];

export function WalletFormScreen({ navigation, route }: RootScreenProps<'WalletForm'>) {
  const { state, addWallet, updateWallet, deleteWallet } = useApp();
  const editing = route.params?.id
    ? state.wallets.find((wallet) => wallet.id === route.params?.id)
    : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [type, setType] = useState<WalletType>(editing?.type ?? 'cash');
  const [icon, setIcon] = useState(editing?.icon ?? WALLET_TYPE_ICON.cash);
  const [color, setColor] = useState(editing?.color ?? palette[0]);
  const [balanceDigits, setBalanceDigits] = useState(
    editing ? String(editing.initialBalance) : ''
  );

  const currentBalance = editing ? walletBalance(editing.id, state) : 0;

  const selectType = (next: WalletType) => {
    setType(next);
    setIcon(WALLET_TYPE_ICON[next]);
  };

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Nama dompet kosong', 'Beri nama dompet agar mudah dikenali.');
      return;
    }
    const payload = {
      name: name.trim(),
      type,
      icon,
      color,
      initialBalance: parseInt(balanceDigits || '0', 10),
    };
    if (editing) {
      updateWallet(editing.id, payload);
    } else {
      addWallet(payload);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    navigation.goBack();
  };

  const confirmDelete = () => {
    if (!editing) return;
    if (state.wallets.length <= 1) {
      Alert.alert('Tidak bisa dihapus', 'Minimal harus ada satu dompet dalam aplikasi.');
      return;
    }
    const used = state.transactions.some(
      (tx) => tx.walletId === editing.id || tx.toWalletId === editing.id
    );
    if (used) {
      Alert.alert(
        'Dompet masih digunakan',
        'Dompet ini memiliki transaksi terkait. Hapus atau pindahkan transaksinya terlebih dahulu.'
      );
      return;
    }
    Alert.alert('Hapus dompet?', `Dompet "${editing.name}" akan dihapus permanen.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteWallet(editing.id);
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
          title={editing ? 'Ubah Dompet' : 'Tambah Dompet'}
          subtitle={editing ? 'Perbarui detail dompet' : 'Pisahkan saldo sesuai kebutuhan'}
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Card style={styles.preview}>
            <View style={[styles.previewIcon, { backgroundColor: withAlpha(color, 0.15) }]}>
              <Ionicons name={icon as never} size={30} color={color} />
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={1}>
                {name.trim() || 'Dompet Baru'}
              </Text>
              <Text style={styles.previewType}>{WALLET_TYPE_LABEL[type]}</Text>
            </View>
            <View style={styles.previewBalance}>
              <Text style={styles.previewLabel}>{editing ? 'Saldo saat ini' : 'Saldo awal'}</Text>
              <Text style={styles.previewValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatIDR(editing ? currentBalance : parseInt(balanceDigits || '0', 10))}
              </Text>
            </View>
          </Card>

          <View style={styles.block}>
            <Field label="Nama dompet">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Contoh: BCA, GoPay, Tunai"
                placeholderTextColor={colors.faint}
                style={styles.input}
                autoFocus={!editing}
                maxLength={30}
              />
            </Field>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Jenis dompet</Text>
            <View style={styles.typeRow}>
              {WALLET_TYPES.map((item) => {
                const active = item === type;
                return (
                  <Pressable
                    key={item}
                    onPress={() => selectType(item)}
                    style={[
                      styles.typeChip,
                      active && { backgroundColor: withAlpha(color, 0.12), borderColor: color },
                    ]}
                  >
                    <Ionicons
                      name={WALLET_TYPE_ICON[item] as never}
                      size={16}
                      color={active ? color : colors.muted}
                    />
                    <Text style={[styles.typeText, active && { color }]}>
                      {WALLET_TYPE_LABEL[item]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Warna</Text>
            <View style={styles.colorRow}>
              {palette.map((item) => {
                const active = item === color;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setColor(item)}
                    style={[styles.colorDot, { backgroundColor: item }]}
                  >
                    {active ? <Ionicons name="checkmark" size={15} color={colors.white} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Ikon</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((item) => {
                const active = item === icon;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setIcon(item)}
                    style={[
                      styles.iconItem,
                      active && { backgroundColor: withAlpha(color, 0.12), borderColor: color },
                    ]}
                  >
                    <Ionicons name={item as never} size={20} color={active ? color : colors.muted} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Field label={editing ? 'Saldo awal (penyesuaian)' : 'Saldo awal'}>
              <View style={styles.balanceInputRow}>
                <Text style={styles.balanceCurrency}>Rp</Text>
                <TextInput
                  value={formatInputAmount(balanceDigits)}
                  onChangeText={(value) => setBalanceDigits(value.replace(/[^\d]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.faint}
                  style={styles.balanceInput}
                />
              </View>
              <Text style={styles.hint}>
                {editing
                  ? 'Ubah nilai ini untuk mengoreksi saldo awal dompet.'
                  : 'Masukkan saldo yang saat ini ada di dompet ini (opsional).'}
              </Text>
            </Field>
          </View>

          <Button title={editing ? 'Simpan Perubahan' : 'Tambah Dompet'} icon="checkmark" onPress={save} />

          {editing ? (
            <Button
              title="Hapus Dompet"
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
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  previewIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    gap: 3,
  },
  previewName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  previewType: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.muted,
  },
  previewBalance: {
    alignItems: 'flex-end',
    maxWidth: '42%',
  },
  previewLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.faint,
  },
  previewValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  block: {
    marginTop: 22,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  typeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.muted,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
  },
  balanceCurrency: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.muted,
  },
  balanceInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 7,
    lineHeight: 16,
  },
});
