import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, ActivityIndicator} from 'react-native';
import {UKC_API_BASE_URL, UKC_NODE_RPC_URL} from '../../../constants';
import {broadcastTransaction, createSignedTransfer, getAccount, getNetwork, parseAmount, walletAddressFromMnemonic, SignedTransfer} from '../../../protocol';
import styleSheet from './style';
import {WalletSession} from '../../../wallet/WalletSession';

export const SendConfirmation = ({navigation, route}: any) => {
  const styles = styleSheet();
  const mnemonic = WalletSession.isUnlocked() ? WalletSession.getMnemonic() : '';
  const {recipient, amount, fee} = route.params ?? {};
  const [transfer, setTransfer] = useState<SignedTransfer | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    const prepare = async () => {
      try {
        if (!mnemonic) throw new Error('Wallet seed is not loaded.');
        const sender = walletAddressFromMnemonic(mnemonic);
        const [network, account] = await Promise.all([
          getNetwork(UKC_API_BASE_URL),
          getAccount(UKC_API_BASE_URL, sender),
        ]);
        const amountBaseUnits = parseAmount(amount);
        const feeBaseUnits = parseAmount(fee);
        if (amountBaseUnits + feeBaseUnits > BigInt(account.balanceBaseUnits)) {
          throw new Error('Insufficient balance for amount and fee.');
        }
        const nonce = BigInt(account.nonce) + 1n;
        const signed = createSignedTransfer({
          mnemonic,
          to: recipient,
          amount,
          fee,
          nonce,
          chainId: Number(network.chainId),
          minFeeBaseUnits: BigInt(network.minRelayFeeBaseUnits),
        });
        if (active) setTransfer(signed);
      } catch (prepareError: any) {
        if (active) setError(prepareError?.message ?? 'Unable to prepare transaction.');
      }
    };
    prepare();
    return () => { active = false; };
  }, [mnemonic, recipient, amount, fee]);

  const submit = async () => {
    if (!transfer || sending) return;
    setSending(true);
    try {
      const result = await broadcastTransaction(UKC_NODE_RPC_URL, transfer.bytes);
      if (result.code !== 0) throw new Error(result.log || `Node rejected transaction (${result.code}).`);
      navigation.replace('SendSuccess', {txId: transfer.txId});
    } catch (submitError: any) {
      setError(submitError?.message ?? 'Transaction was not accepted.');
      setSending(false);
    }
  };

  const rows = transfer ? [
    {label: 'From', id: 'from', value: transfer.sender},
    {label: 'To', id: 'to', value: transfer.recipient},
    {label: 'Amount', id: 'amount', value: `${transfer.amountBaseUnits.toString()} base units`},
    {label: 'Fee', id: 'fee', value: `${transfer.feeBaseUnits.toString()} base units`},
    {label: 'Nonce', id: 'nonce', value: transfer.nonce.toString()},
  ] : [];

  return (
    <View style={styles.container}>
      {!transfer && !error && <ActivityIndicator />}
      {error ? <Text>{error}</Text> : <FlatList data={rows} renderItem={({item}) => <View style={styles.rowDtl}><Text style={styles.itemLabel}>{item.label}</Text><Text style={styles.itemValue}>{item.value}</Text></View>} keyExtractor={item => item.id} />}
      <View style={styles.btnBox}>
        <TouchableOpacity style={styles.btnContinue} disabled={!transfer || sending} onPress={submit}>
          <Text style={styles.txtContinue}>{sending ? 'Sending...' : 'Sign and Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
