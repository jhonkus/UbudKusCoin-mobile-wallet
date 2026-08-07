import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import styleSheet from './style';
import {formatBaseUnits, getAccount, isValidAddress, parseAmount, walletAddressFromMnemonic} from '../../protocol';
import {WalletSession} from '../../wallet/WalletSession';

export const Send = ({navigation, route}: any) => {
  const styles = styleSheet();
  const mnemonic = WalletSession.isUnlocked() ? WalletSession.getMnemonic() : '';
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState(route?.params?.recipient ?? '');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0.0001');
  const [balanceBaseUnits, setBalanceBaseUnits] = useState('0');
  const [error, setError] = useState('');

  useEffect(() => {
    if (route?.params?.recipient) {
      setRecipient(route.params.recipient);
    }
  }, [route?.params?.recipient]);

  useEffect(() => {
    if (mnemonic) {
      const addr = walletAddressFromMnemonic(mnemonic);
      setSender(addr);
      getAccount(WalletSession.getApiBaseUrl(), addr)
        .then(acc => setBalanceBaseUnits(String(acc.balanceBaseUnits)))
        .catch(() => {});
    }
  }, [mnemonic]);

  const handleSendMax = () => {
    try {
      const balance = BigInt(balanceBaseUnits);
      const feeBaseUnits = parseAmount(fee);
      if (balance <= feeBaseUnits) {
        return setError('Balance is too low to cover transaction fee.');
      }
      const maxBaseUnits = balance - feeBaseUnits;
      setAmount(formatBaseUnits(maxBaseUnits));
      setError('');
    } catch {
      setError('Invalid fee amount.');
    }
  };

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
      if (amountBaseUnits + feeBaseUnits > BigInt(balanceBaseUnits)) {
        return setError('Insufficient balance for amount plus fee.');
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
        <View style={styles.from}>
          <Text style={{fontSize: 12}}>{sender || 'Wallet is not loaded'}</Text>
          <Text style={{fontSize: 11, color: '#3182ce', marginTop: 2}}>
            Balance: {formatBaseUnits(balanceBaseUnits)} UKC
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={styles.label}>To</Text>
          <Pressable onPress={() => navigation.navigate('AddressBook', {mode: 'picker'})}>
            <Text style={{color: '#3182ce', fontWeight: 'bold', fontSize: 12}}>📖 Contacts</Text>
          </Pressable>
        </View>
        <TextInput
          value={recipient}
          onChangeText={setRecipient}
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="UKC recipient address"
        />
      </View>
      <View style={styles.row}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={styles.label}>Amount UKC</Text>
          <Pressable onPress={handleSendMax}>
            <Text style={{color: '#dd6b20', fontWeight: 'bold', fontSize: 12}}>Send Max</Text>
          </Pressable>
        </View>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          style={styles.textInput}
          keyboardType="decimal-pad"
          placeholder="0.00000000"
        />
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

