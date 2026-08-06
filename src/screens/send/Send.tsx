import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import styleSheet from './style';
import {walletAddressFromMnemonic} from '../../protocol';
import {WalletSession} from '../../wallet/WalletSession';

export const Send = ({navigation}: any) => {
  const styles = styleSheet();
  const mnemonic = WalletSession.isUnlocked() ? WalletSession.getMnemonic() : '';
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0.0001');

  useEffect(() => {
    if (mnemonic) setSender(walletAddressFromMnemonic(mnemonic));
  }, [mnemonic]);

  const continueToConfirmation = () => {
    navigation.navigate('SendConfirmation', {recipient, amount, fee});
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>From</Text>
        <View style={styles.from}><Text>{sender || 'Wallet is not loaded'}</Text></View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>To</Text>
        <TextInput value={recipient} onChangeText={setRecipient} style={styles.textInput} autoCapitalize="none" placeholder="UKC recipient address" />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Amount UKC</Text>
        <TextInput value={amount} onChangeText={setAmount} style={styles.textInput} keyboardType="decimal-pad" placeholder="0.00000000" />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fee UKC</Text>
        <TextInput value={fee} onChangeText={setFee} style={styles.textInput} keyboardType="decimal-pad" />
      </View>
      <View style={styles.btnBox}>
        <TouchableOpacity style={styles.btnContinue} onPress={continueToConfirmation}>
          <Text style={styles.txtContinue}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
