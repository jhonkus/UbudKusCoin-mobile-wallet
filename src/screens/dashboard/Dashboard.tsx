import React, {useCallback, useEffect, useState} from 'react';
import {Text, FlatList, View, Image, TouchableOpacity, RefreshControl} from 'react-native';
import IMAGES from '../../../assets';
import {UKC_API_BASE_URL} from '../../constants';
import {formatBaseUnits, getAccount, getTransactions, TransactionSummary, walletAddressFromMnemonic} from '../../protocol';
import {WalletSession} from '../../wallet/WalletSession';
import styleSheet from './style';

export const Dashboard = ({navigation}: any) => {
  const styles = styleSheet();
  const mnemonic = WalletSession.isUnlocked() ? WalletSession.getMnemonic() : '';
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!mnemonic) {
      setError('Wallet seed is not loaded.');
      return;
    }
    setRefreshing(true);
    try {
      const walletAddress = walletAddressFromMnemonic(mnemonic);
      const [account, history] = await Promise.all([
        getAccount(UKC_API_BASE_URL, walletAddress),
        getTransactions(UKC_API_BASE_URL, walletAddress),
      ]);
      setAddress(walletAddress);
      setBalance(formatBaseUnits(account.balanceBaseUnits));
      setTransactions(history);
      setError('');
    } catch (refreshError: any) {
      setError(refreshError?.message ?? 'Unable to load wallet data.');
    } finally {
      setRefreshing(false);
    }
  }, [mnemonic]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <View style={styles.container}>
      <View style={styles.accountInfo}>
        <Text style={styles.name}>UbudKusCoin Wallet</Text>
        <Text style={styles.address}>{address || 'Loading address...'}</Text>
        <Text style={styles.balance}>{balance} UKC</Text>
      </View>
      {error ? <Text>{error}</Text> : null}
      <View style={styles.btnBox}>
        <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('Send')}><Image source={IMAGES.IconSend} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('Receive')}><Image source={IMAGES.IconReceive} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('Scan')}><Image source={IMAGES.IconScan} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity style={styles.btnAction} onPress={() => { WalletSession.lock(); navigation.replace('Home'); }}><Image source={IMAGES.IconExit} style={styles.icon} /></TouchableOpacity>
      </View>
      <View style={styles.subtitle}><Text style={styles.textLeft}>Transactions</Text></View>
      <FlatList
        data={transactions}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={<Text>{error ? '' : 'No transactions yet.'}</Text>}
        renderItem={({item}) => <View style={styles.row}><View style={styles.colLeft}><Text style={styles.itemAddress}>{item.txId}</Text><Text style={styles.itemDate}>Block {item.height}</Text></View><View style={styles.colRight}><Text style={styles.itemAmmount}>{formatBaseUnits(item.amountBaseUnits)} UKC</Text></View></View>}
        keyExtractor={item => item.txId}
      />
    </View>
  );
};
