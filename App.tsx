import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/store/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 450, fade: true });

function AppContent() {
  const { hydrated } = useApp();

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [hydrated]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>D</Text>
        </View>
        <Text style={styles.brand}>Duitku</Text>
        <Text style={styles.tagline}>Catatan keuangan pribadi</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.white,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 14,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 4,
  },
});
