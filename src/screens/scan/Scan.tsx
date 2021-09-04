import React from 'react';
import {View, Text} from 'react-native';
import styleSheet from './style';

export const Scan = () => {
  const styles = styleSheet();

  return (
    <View style={styles.container}>
      <Text>Scan</Text>
    </View>
  );
};
