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
import { Card, SectionTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Segmented } from '../components/ui';
import { CategoryIcon } from '../components/TransactionRow';
import { useApp } from '../store/AppContext';
import { isCategoryUsed } from '../lib/finance';
import { colors, palette, radius, withAlpha } from '../theme';
import { RootScreenProps } from '../navigation/types';

const ICONS = [
  'restaurant-outline',
  'cafe-outline',
  'car-outline',
  'bus-outline',
  'bag-handle-outline',
  'cart-outline',
  'receipt-outline',
  'home-outline',
  'medkit-outline',
  'fitness-outline',
  'game-controller-outline',
  'school-outline',
  'airplane-outline',
  'paw-outline',
  'gift-outline',
  'cash-outline',
  'briefcase-outline',
  'trending-up-outline',
  'heart-outline',
  'ellipsis-horizontal-circle-outline',
];

export function CategoriesScreen({ navigation }: RootScreenProps<'Categories'>) {
  const { state, addCategory, deleteCategory } = useApp();
  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(palette[0]);

  const categories = useMemo(
    () => state.categories.filter((category) => category.type === mode),
    [state.categories, mode]
  );

  const usage = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of state.transactions) {
      if (!tx.categoryId) continue;
      map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + 1);
    }
    return map;
  }, [state.transactions]);

  const submit = () => {
    if (!name.trim()) {
      Alert.alert('Nama kategori kosong', 'Masukkan nama kategori terlebih dahulu.');
      return;
    }
    addCategory({ name: name.trim(), type: mode, icon, color });
    setName('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const removeCategory = (id: string, categoryName: string) => {
    if (isCategoryUsed(state, id)) {
      Alert.alert(
        'Kategori masih digunakan',
        `"${categoryName}" dipakai oleh transaksi atau anggaran. Hapus data terkait terlebih dahulu.`
      );
      return;
    }
    Alert.alert('Hapus kategori?', `Kategori "${categoryName}" akan dihapus.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => deleteCategory(id) },
    ]);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header
          title="Kategori"
          subtitle="Kelola kategori transaksi"
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Segmented
            options={[
              { label: 'Pengeluaran', value: 'expense' },
              { label: 'Pemasukan', value: 'income' },
            ]}
            value={mode}
            onChange={setMode}
            accent={mode === 'expense' ? colors.expense : colors.income}
          />

          <SectionTitle title="Tambah kategori baru" />
          <Card>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nama kategori"
              placeholderTextColor={colors.faint}
              style={styles.input}
              maxLength={30}
            />

            <Text style={styles.label}>Ikon</Text>
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
                    <Ionicons name={item as never} size={19} color={active ? color : colors.muted} />
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Warna</Text>
            <View style={styles.colorRow}>
              {palette.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setColor(item)}
                  style={[styles.colorDot, { backgroundColor: item }]}
                >
                  {item === color ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : null}
                </Pressable>
              ))}
            </View>

            <Button
              title="Tambah Kategori"
              icon="add"
              onPress={submit}
              style={{ marginTop: 16 }}
            />
          </Card>

          <SectionTitle title={`Kategori ${mode === 'expense' ? 'pengeluaran' : 'pemasukan'}`} />
          <Card padded={false} style={styles.listCard}>
            <View style={styles.listInner}>
              {categories.map((category, index) => {
                const count = usage.get(category.id) ?? 0;
                return (
                  <View
                    key={category.id}
                    style={[styles.row, index > 0 && styles.rowBorder]}
                  >
                    <CategoryIcon icon={category.icon} color={category.color} size={40} />
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowName}>{category.name}</Text>
                      <Text style={styles.rowMeta}>
                        {count > 0 ? `${count} transaksi` : 'Belum digunakan'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => removeCategory(category.id, category.name)}
                      hitSlop={8}
                      style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.6 }]}
                    >
                      <Ionicons
                        name={count > 0 ? 'lock-closed-outline' : 'trash-outline'}
                        size={16}
                        color={count > 0 ? colors.faint : colors.expense}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </Card>
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
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    color: colors.text,
    fontWeight: '600',
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSoft,
    marginTop: 16,
    marginBottom: 9,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconItem: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    paddingHorizontal: 16,
  },
  listInner: {
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
  },
  rowMeta: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '500',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
