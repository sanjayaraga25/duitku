import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Header, IconButton } from '../components/Header';
import { Card, SectionTitle } from '../components/Card';
import { Button } from '../components/Button';
import { EmptyState } from '../components/ui';
import { Fab } from '../components/Fab';
import { useApp } from '../store/AppContext';
import { totalBalance, walletBalance } from '../lib/finance';
import { formatIDR } from '../lib/format';
import { colors, radius, shadow, withAlpha } from '../theme';
import { TabScreenProps } from '../navigation/types';
import { WALLET_TYPE_LABEL } from '../types';

export function WalletsScreen({ navigation }: TabScreenProps<'Dompet'>) {
  const { state } = useApp();
  const balance = totalBalance(state);

  return (
    <Screen>
      <Header
        large
        title="Dompet"
        subtitle={`${state.wallets.length} dompet terdaftar`}
        right={
          <IconButton
            icon="add"
            color={colors.white}
            background={colors.primary}
            onPress={() => navigation.navigate('WalletForm')}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroLabel}>Total saldo semua dompet</Text>
          <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {formatIDR(balance)}
          </Text>
          <View style={styles.heroFoot}>
            <View style={styles.heroMeta}>
              <Ionicons name="shield-checkmark-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroMetaText}>Data tersimpan di perangkat</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('TransactionForm', { type: 'transfer' })}
              style={({ pressed }) => [styles.transferButton, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="swap-horizontal" size={15} color={colors.white} />
              <Text style={styles.transferText}>Transfer</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <SectionTitle title="Daftar dompet" />
        {state.wallets.length === 0 ? (
          <Card>
            <EmptyState
              icon="wallet-outline"
              title="Belum ada dompet"
              message="Tambahkan dompet tunai, rekening bank, atau e-wallet untuk memisahkan saldo."
              action={
                <Button
                  title="Tambah Dompet"
                  icon="add"
                  onPress={() => navigation.navigate('WalletForm')}
                />
              }
            />
          </Card>
        ) : (
          <View style={styles.list}>
            {state.wallets.map((wallet) => {
              const value = walletBalance(wallet.id, state);
              return (
                <Pressable
                  key={wallet.id}
                  onPress={() => navigation.navigate('WalletForm', { id: wallet.id })}
                  style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                >
                  <Card style={styles.walletCard}>
                    <View style={styles.walletRow}>
                      <View
                        style={[styles.walletIcon, { backgroundColor: withAlpha(wallet.color, 0.14) }]}
                      >
                        <Ionicons name={wallet.icon as never} size={22} color={wallet.color} />
                      </View>
                      <View style={styles.walletInfo}>
                        <Text style={styles.walletName}>{wallet.name}</Text>
                        <View style={styles.walletTypeRow}>
                          <View style={[styles.walletDot, { backgroundColor: wallet.color }]} />
                          <Text style={styles.walletType}>{WALLET_TYPE_LABEL[wallet.type]}</Text>
                        </View>
                      </View>
                      <View style={styles.walletRight}>
                        <Text
                          style={[
                            styles.walletBalance,
                            value < 0 && { color: colors.expense },
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          {formatIDR(value)}
                        </Text>
                        <View style={styles.walletEdit}>
                          <Text style={styles.walletEditText}>Ubah</Text>
                          <Ionicons name="chevron-forward" size={12} color={colors.faint} />
                        </View>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}

        {state.wallets.length > 0 ? (
          <Button
            title="Tambah Dompet"
            icon="add"
            variant="secondary"
            onPress={() => navigation.navigate('WalletForm')}
            style={{ marginTop: 14 }}
          />
        ) : null}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={15} color={colors.faint} />
          <Text style={styles.noteText}>
            Saldo dihitung otomatis dari saldo awal ditambah pemasukan, dikurangi pengeluaran dan
            transfer.
          </Text>
        </View>
        <View style={{ height: 96 }} />
      </ScrollView>
      <Fab onPress={() => navigation.navigate('WalletForm')} icon="add" />
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
    ...shadow,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 30,
    color: colors.white,
    fontWeight: '800',
    letterSpacing: -0.9,
    marginTop: 6,
  },
  heroFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  heroMetaText: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  transferText: {
    fontSize: 11.5,
    color: colors.white,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  walletCard: {
    padding: 15,
    ...shadow,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
    gap: 4,
  },
  walletName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  walletTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  walletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  walletType: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  walletRight: {
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: '46%',
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  walletEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  walletEditText: {
    fontSize: 10.5,
    color: colors.faint,
    fontWeight: '600',
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
