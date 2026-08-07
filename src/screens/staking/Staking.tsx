import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import {WalletSession} from '../../wallet/WalletSession';
import {getAccount, formatBaseUnits, walletAddressFromMnemonic} from '../../protocol';

export const Staking = ({navigation}: any) => {
  const mnemonic = WalletSession.isUnlocked() ? WalletSession.getMnemonic() : '';
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    if (mnemonic) {
      const addr = walletAddressFromMnemonic(mnemonic);
      setAddress(addr);
      getAccount(WalletSession.getApiBaseUrl(), addr)
        .then(acc => {
          setBalance(formatBaseUnits(acc.balanceBaseUnits));
        })
        .catch(() => {});
    }
  }, [mnemonic]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>UbudKusCoin Staking</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Staking Overview</Text>
        <Text style={styles.infoText}>Validator Network: CometBFT Consensus</Text>
        <Text style={styles.infoText}>Staking Token: UKC</Text>
        <Text style={styles.balanceText}>Available Balance: {balance} UKC</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Active Stake</Text>
        <Text style={styles.desc}>
          Bond your UKC tokens to participate in consensus validator rewards on the UbudKusCoin network.
        </Text>
        
        <View style={styles.stakeRow}>
          <Text style={styles.stakeLabel}>Bonded Amount:</Text>
          <Text style={styles.stakeValue}>0.00000000 UKC</Text>
        </View>

        <View style={styles.stakeRow}>
          <Text style={styles.stakeLabel}>Unbonding Lockup:</Text>
          <Text style={styles.stakeValue}>0 Blocks</Text>
        </View>

        <Pressable
          style={styles.btnAction}
          onPress={() => navigation.navigate('Send')}>
          <Text style={styles.btnText}>Delegate / Bond Tokens</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Protocol Info</Text>
        <Text style={styles.infoText}>• Min Bond Amount: 1.00 UKC</Text>
        <Text style={styles.infoText}>• Unbonding Period: Deterministic Lock</Text>
        <Text style={styles.infoText}>• Key Custody: Ed25519 Consensus Key</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f8f9fa'},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#1a202c'},
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  cardTitle: {fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginBottom: 8},
  infoText: {fontSize: 13, color: '#4a5568', marginBottom: 4},
  desc: {fontSize: 13, color: '#718096', marginBottom: 12},
  balanceText: {fontSize: 14, fontWeight: 'bold', color: '#3182ce', marginTop: 8},
  stakeRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  stakeLabel: {fontSize: 13, color: '#4a5568'},
  stakeValue: {fontSize: 13, fontWeight: '600', color: '#2d3748'},
  btnAction: {
    backgroundColor: '#38a169',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {color: '#fff', fontWeight: 'bold', fontSize: 14},
});
