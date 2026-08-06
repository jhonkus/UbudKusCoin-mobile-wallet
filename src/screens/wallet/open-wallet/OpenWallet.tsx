import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

export const OpenWallet = ({navigation}: any) => (
  <View>
    <Text>Wallet is locked for this session.</Text>
    <TouchableOpacity onPress={() => navigation.replace('Pin', {mode: 'unlock'})}>
      <Text>Unlock with PIN</Text>
    </TouchableOpacity>
  </View>
);
