import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const content = (
    <View style={styles.inner}>
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={variant === 'primary' ? colors.white : variant === 'danger' ? colors.expense : colors.text}
        />
      ) : null}
      <Text
        style={[
          styles.text,
          variant === 'primary' && { color: colors.white },
          variant === 'danger' && { color: colors.expense },
          variant === 'secondary' && { color: colors.text },
          variant === 'ghost' && { color: colors.muted },
        ]}
      >
        {title}
      </Text>
    </View>
  );

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          style,
          { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        ]}
      >
        <LinearGradient
          colors={[colors.primary, '#6D3FE8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles.plain,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        style,
        { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plain: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  danger: {
    backgroundColor: colors.expenseSoft,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
