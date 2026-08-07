import React, {ReactNode} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({children, style}) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
});
