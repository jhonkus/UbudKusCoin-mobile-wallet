import React from 'react';
import {View, Text, StyleSheet, Pressable, Image} from 'react-native';
import IMAGES from '../../../assets';

export const OnboardingScreen = ({navigation}: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={IMAGES.IconLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>UbudKusCoin Wallet</Text>
        <Text style={styles.subtitle}>
          Secure, production-grade non-custodial wallet for digital payments & community economies.
        </Text>
      </View>

      <View style={styles.actionBox}>
        <Pressable
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('NewWallet')}>
          <Text style={styles.btnPrimaryText}>Create a New Wallet</Text>
        </Pressable>

        <Pressable
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('OpenWallet')}>
          <Text style={styles.btnSecondaryText}>I Already Have a Wallet</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff', padding: 24, justifyContent: 'space-between'},
  content: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  logo: {width: 100, height: 100, marginBottom: 24},
  title: {fontSize: 26, fontWeight: 'bold', color: '#1a202c', marginBottom: 12, textAlign: 'center'},
  subtitle: {fontSize: 15, color: '#718096', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16},
  actionBox: {gap: 12, marginBottom: 24},
  btnPrimary: {
    backgroundColor: '#3182ce',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: {color: '#ffffff', fontWeight: 'bold', fontSize: 16},
  btnSecondary: {
    backgroundColor: '#edf2f7',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSecondaryText: {color: '#2b6cb0', fontWeight: 'bold', fontSize: 16},
});
