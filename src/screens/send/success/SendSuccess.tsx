import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import IMAGES from '../../../../assets';
import styleSheet from './style';
export const SendSuccess = ({navigation}) => {
  const styles = styleSheet();

  return (
    <View style={styles.container}>
      <View style={styles.partTop}>
        <Image source={IMAGES.IconSuccess} style={styles.logo} />
        <Text style={styles.desc}>
          Transaction successfully send to Ethereum blockhcain, you will receive
          confirmation soon!
        </Text>
      </View>
      <View style={styles.partBottom}>
        <TouchableOpacity
          style={[styles.btn, styles.btnNew]}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.btnLabel}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
