import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function ProgressBar({
  ratio,
  color = colors.primary,
  height = 8,
  track = colors.line,
}: {
  ratio: number;
  color?: string;
  height?: number;
  track?: string;
}) {
  const clamped = Math.min(100, Math.max(0, ratio));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: track }]}>
      <View
        style={{
          width: `${clamped}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  color = colors.primary,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  color?: string;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: color, borderColor: color },
        pressed && { opacity: 0.75 },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? colors.white : colors.muted} />
      ) : null}
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accent = colors.primary,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  accent?: string;
}) {
  return (
    <View style={styles.segmentWrap}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && { backgroundColor: accent }]}
          >
            <Text style={[styles.segmentText, active && { color: colors.white }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MonthSwitcher({
  label,
  onPrev,
  onNext,
  onPress,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onPress?: () => void;
}) {
  return (
    <View style={styles.monthWrap}>
      <Pressable onPress={onPrev} hitSlop={8} style={styles.monthButton}>
        <Ionicons name="chevron-back" size={18} color={colors.textSoft} />
      </Pressable>
      <Pressable onPress={onPress} style={styles.monthLabelWrap}>
        <Text style={styles.monthLabel}>{label}</Text>
      </Pressable>
      <Pressable onPress={onNext} hitSlop={8} style={styles.monthButton}>
        <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
      </Pressable>
    </View>
  );
}

export function Field({
  label,
  children,
  style,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  style?: ViewStyle;
  hint?: string;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function TextField({
  label,
  style,
  ...props
}: { label?: string } & TextInputProps & { style?: ViewStyle }) {
  const input = (
    <TextInput
      placeholderTextColor={colors.faint}
      style={[styles.input, style]}
      {...props}
    />
  );
  if (!label) return input;
  return <Field label={label}>{input}</Field>;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action ? <View style={{ marginTop: 14 }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSoft,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#EAEEF6',
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
  },
  monthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  monthLabelWrap: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});
