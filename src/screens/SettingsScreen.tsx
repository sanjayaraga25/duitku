import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Card, SectionTitle } from '../components/Card';
import { useApp } from '../store/AppContext';
import { exportCSV, exportPDF } from '../lib/export';
import { formatThousands } from '../lib/format';
import { totalBalance } from '../lib/finance';
import { colors, radius } from '../theme';
import { RootScreenProps } from '../navigation/types';

type RowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  value?: string;
  last?: boolean;
  loading?: boolean;
};

function SettingRow({ icon, title, subtitle, onPress, danger, value, last, loading }: RowProps) {
  const color = danger ? colors.expense : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress || loading}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { opacity: 0.65 }]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: danger ? colors.expenseSoft : colors.primarySoft },
        ]}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowTitle, danger && { color: colors.expense }]}>{title}</Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {loading ? (
        <Text style={styles.rowValue}>Memproses...</Text>
      ) : value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={17} color={colors.faint} />
      ) : null}
    </Pressable>
  );
}

export function SettingsScreen({ navigation }: RootScreenProps<'Settings'>) {
  const { state, resetData } = useApp();
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const runExport = async (kind: 'csv' | 'pdf') => {
    if (exporting) return;
    setExporting(kind);
    try {
      if (kind === 'csv') {
        await exportCSV(state);
      } else {
        await exportPDF(state);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      Alert.alert(
        'Gagal mengekspor',
        'Terjadi kendala saat membuat laporan. Silakan coba lagi.'
      );
    } finally {
      setExporting(null);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      'Hapus semua data?',
      'Seluruh transaksi, dompet, kategori, dan anggaran akan dihapus dan dikembalikan ke kondisi awal.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => {
            resetData();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const balance = totalBalance(state);

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Pengaturan" subtitle="Kelola data dan preferensi" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View style={styles.logo}>
              <Ionicons name="wallet" size={26} color={colors.white} />
            </View>
            <View>
              <Text style={styles.heroTitle}>Duitku</Text>
              <Text style={styles.heroSubtitle}>Catatan keuangan pribadi</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{formatThousands(balance)}</Text>
              <Text style={styles.heroStatLabel}>Total saldo</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{state.transactions.length}</Text>
              <Text style={styles.heroStatLabel}>Transaksi</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{state.wallets.length}</Text>
              <Text style={styles.heroStatLabel}>Dompet</Text>
            </View>
          </View>
        </LinearGradient>

        <SectionTitle title="Laporan" />
        <Card padded={false} style={styles.cardInner}>
          <View style={styles.cardPad}>
            <SettingRow
              icon="grid-outline"
              title="Ekspor CSV"
              subtitle="Buka di Excel atau Google Sheets"
              onPress={() => runExport('csv')}
              loading={exporting === 'csv'}
            />
            <SettingRow
              icon="document-text-outline"
              title="Ekspor PDF"
              subtitle="Laporan rapi siap dibagikan"
              onPress={() => runExport('pdf')}
              loading={exporting === 'pdf'}
              last
            />
          </View>
        </Card>

        <SectionTitle title="Kelola data" />
        <Card padded={false} style={styles.cardInner}>
          <View style={styles.cardPad}>
            <SettingRow
              icon="pricetags-outline"
              title="Kategori"
              subtitle={`${state.categories.length} kategori transaksi`}
              onPress={() => navigation.navigate('Categories')}
            />
            <SettingRow
              icon="wallet-outline"
              title="Dompet"
              subtitle={`${state.wallets.length} dompet terdaftar`}
              onPress={() => navigation.navigate('Tabs', { screen: 'Dompet' })}
            />
            <SettingRow
              icon="cash-outline"
              title="Mata uang"
              subtitle="Format nominal yang digunakan"
              value="IDR (Rp)"
              last
            />
          </View>
        </Card>

        <SectionTitle title="Data aplikasi" />
        <Card padded={false} style={styles.cardInner}>
          <View style={styles.cardPad}>
            <SettingRow
              icon="shield-checkmark-outline"
              title="Penyimpanan lokal"
              subtitle="Data tersimpan aman di perangkat ini tanpa koneksi internet"
              value="Aktif"
            />
            <SettingRow
              icon="trash-outline"
              title="Hapus semua data"
              subtitle="Kembalikan aplikasi ke kondisi awal"
              onPress={confirmReset}
              danger
              last
            />
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Duitku v1.0.0</Text>
          <Text style={styles.footerText}>
            Aplikasi pencatat keuangan pribadi untuk iOS. Dibuat dengan React Native dan Expo.
          </Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  hero: {
    borderRadius: radius.xl,
    padding: 20,
    marginTop: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
    marginTop: 2,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  heroStatValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
  heroStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  heroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardInner: {
    paddingHorizontal: 16,
  },
  cardPad: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 15,
  },
  rowValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.muted,
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
    gap: 4,
    paddingHorizontal: 20,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
  },
  footerText: {
    fontSize: 10.5,
    color: colors.faint,
    textAlign: 'center',
    lineHeight: 16,
  },
});
