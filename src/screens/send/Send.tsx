import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Pressable} from 'react-native';
import styleSheet from './style';
import {isValidAddress, parseAmount, walletAddressFromMnemonic} from '../../protocol';
import {WalletSession} from '../../wallet/WalletSession';

export const Send = ({navigation, route}: any) => {
  const styles = styleSheet();
  const mnemonic = WalletSession.isUnlocked() ? WalletSession.getMnemonic() : '';
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState(route?.params?.recipient ?? '');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0.0001');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mnemonic) setSender(walletAddressFromMnemonic(mnemonic));
  }, [mnemonic]);

  const continueToConfirmation = () => {
    setError('');
    if (!recipient || !isValidAddress(recipient)) {
      return setError('Please enter a valid UKC recipient address.');
    }
    try {
      const amountBaseUnits = parseAmount(amount);
      const feeBaseUnits = parseAmount(fee);
      if (amountBaseUnits <= 0n) {
        return setError('Amount must be greater than zero.');
      }
      if (feeBaseUnits < 10000n) {
        return setError('Fee is below the network minimum of 0.0001 UKC.');
      }
    } catch {
      return setError('Please enter valid numeric values for amount and fee.');
    }
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
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.btnBox}>
        <Pressable style={styles.btnContinue} onPress={continueToConfirmation}>
          <Text style={styles.txtContinue}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
};
