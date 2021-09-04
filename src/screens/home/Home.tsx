import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import IMAGES from '../../../assets';
import styles from './style';

export const Home = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.partTop}>
        <Image source={IMAGES.LogoUkc} style={styles.logo} />
        <Text style={styles.desc}>
          {
            'Welcome to UbudKusCoin Wallet \nThe easy way to send and receive UKC'
          }
        </Text>
      </View>
      <View style={styles.partBottom}>
        <TouchableOpacity
          style={[styles.btn, styles.btnNew]}
          onPress={() => navigation.navigate('NewWallet')}>
          <Text style={styles.btnLabel}>Create New Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnOpen]}
          onPress={() => navigation.navigate('OpenWallet')}>
          <Text style={styles.btnLabel}>Open Existing Wallet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
