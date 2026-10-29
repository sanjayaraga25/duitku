import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Circle, G, Svg } from 'react-native-svg';
import { colors } from '../theme';

export interface DonutSlice {
  value: number;
  color: string;
}

export function DonutChart({
  slices,
  size = 168,
  thickness = 22,
  children,
  style,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const radiusValue = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let accumulated = 0;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radiusValue}
            stroke={colors.line}
            strokeWidth={thickness}
            fill="none"
          />
          {total > 0
            ? slices.map((slice, index) => {
                const length = (slice.value / total) * circumference;
                const dash = `${Math.max(length - 2, 0)} ${circumference}`;
                const offset = -accumulated;
                accumulated += length;
                return (
                  <Circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radiusValue}
                    stroke={slice.color}
                    strokeWidth={thickness}
                    strokeDasharray={dash}
                    strokeDashoffset={offset}
                    strokeLinecap="butt"
                    fill="none"
                  />
                );
              })
            : null}
        </G>
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
