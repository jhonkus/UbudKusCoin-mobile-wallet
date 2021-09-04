import React from 'react';
import {View, Text} from 'react-native';
import styleSheet from './style';

export const Buy = () => {
  const styles = styleSheet();

  return (
    <View style={styles.container}>
      <Text>Buy</Text>
    </View>
  );
};
