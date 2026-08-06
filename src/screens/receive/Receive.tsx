import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import IMAGES from '../../../assets';
import {walletAddressFromMnemonic} from '../../protocol';
import styleSheet from './style';

export const Receive = () => {
  const styles = styleSheet();
  const mnemonic = useSelector((state: any) => state.mnemonic?.words ?? '');
  const address = mnemonic ? walletAddressFromMnemonic(mnemonic) : '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your UKC Address:</Text>
      <Text style={styles.address}>{address || 'Wallet is not loaded'}</Text>
      {address ? <QRCode value={address} size={200} /> : null}
      <Text style={styles.show}>Only send UKC testnet funds to this address.</Text>
      <View style={styles.btnBox}>
        <TouchableOpacity style={styles.btn} onPress={() => Clipboard.setString(address)}><Image source={IMAGES.IconCopy} style={styles.icon} /></TouchableOpacity>
      </View>
    </View>
  );
};
