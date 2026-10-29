import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { WalletsScreen } from '../screens/WalletsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { TransactionFormScreen } from '../screens/TransactionFormScreen';
import { WalletFormScreen } from '../screens/WalletFormScreen';
import { BudgetFormScreen } from '../screens/BudgetFormScreen';
import { RootStackParamList, TabParamList } from './types';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof TabParamList, { active: string; inactive: string }> = {
  Beranda: { active: 'home', inactive: 'home-outline' },
  Transaksi: { active: 'receipt', inactive: 'receipt-outline' },
  Statistik: { active: 'pie-chart', inactive: 'pie-chart-outline' },
  Anggaran: { active: 'flag', inactive: 'flag-outline' },
  Dompet: { active: 'wallet', inactive: 'wallet-outline' },
};

function TabsNavigator() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 58 + bottom,
            paddingBottom: bottom,
            borderTopWidth: StyleSheet.hairlineWidth,
          },
        ],
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={
              (focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive) as never
            }
            size={size ?? 22}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Beranda" component={DashboardScreen} />
      <Tab.Screen name="Transaksi" component={TransactionsScreen} />
      <Tab.Screen name="Statistik" component={StatisticsScreen} />
      <Tab.Screen name="Anggaran" component={BudgetScreen} />
      <Tab.Screen name="Dompet" component={WalletsScreen} />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.line,
    notification: colors.expense,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Tabs" component={TabsNavigator} />
        <Stack.Screen
          name="TransactionForm"
          component={TransactionFormScreen}
          options={{
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="WalletForm"
          component={WalletFormScreen}
          options={{
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="BudgetForm"
          component={BudgetFormScreen}
          options={{
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.line,
    paddingTop: 6,
    shadowColor: '#0B1B33',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
});
