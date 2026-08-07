import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({label, variant = 'info', style}) => {
  return (
    <View
      style={[
        styles.badge,
        variant === 'success' && styles.success,
        variant === 'warning' && styles.warning,
        variant === 'error' && styles.error,
        variant === 'info' && styles.info,
        style,
      ]}>
      <Text
        style={[
          styles.text,
          variant === 'success' && styles.textSuccess,
          variant === 'warning' && styles.textWarning,
          variant === 'error' && styles.textError,
          variant === 'info' && styles.textInfo,
        ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  success: {backgroundColor: '#e6fffa'},
  warning: {backgroundColor: '#feebc8'},
  error: {backgroundColor: '#fed7d7'},
  info: {backgroundColor: '#ebf8ff'},
  text: {fontSize: 11, fontWeight: 'bold'},
  textSuccess: {color: '#234e52'},
  textWarning: {color: '#742a2a'},
  textError: {color: '#9b2c2c'},
  textInfo: {color: '#2b6cb0'},
});
