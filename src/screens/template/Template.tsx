import React from 'react';
import {View, Text} from 'react-native';
import styleSheet from './style';

export const Template = () => {
  const styles = styleSheet();

  return (
    <View style={styles.container}>
      <Text>Template</Text>
    </View>
  );
};
