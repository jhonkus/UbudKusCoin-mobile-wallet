import React from 'react';
import {View, Text, Image} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import IMAGES from '../../../assets';
import styleSheet from './style';

export const Receive = () => {
  const styles = styleSheet();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your UKC Address:</Text>
      <Text style={styles.address}>
        0x2f1df65944443a049c49851660dfd53b0e71269f
      </Text>
      <QRCode value="0x2f1df65944443a049c49851660dfd53b0e71269f" size={200} />
      <Text style={styles.show}>Show this QRCode to receive token/coin</Text>
      <View style={styles.btnBox}>
        <View style={styles.btn}>
          <Image source={IMAGES.IconCopy} style={styles.icon} />
        </View>
        <View style={styles.btn}>
          <Image source={IMAGES.IconShare} style={styles.icon} />
        </View>
      </View>
    </View>
  );
};
