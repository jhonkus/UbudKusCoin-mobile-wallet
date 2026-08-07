import React, {useCallback, useEffect, useState} from 'react';
import {Text, FlatList, View, Image, TouchableOpacity, Pressable, RefreshControl, StyleSheet} from 'react-native';
import IMAGES from '../../../assets';
import {formatBaseUnits, getAccount, getNetwork, getTransactions, TransactionSummary, walletAddressFromMnemonic} from '../../protocol';
import {WalletSession} from '../../wallet/WalletSession';
import styleSheet from './style';
import Clipboard from '@react-native-clipboard/clipboard';

export const Dashboard = ({navigation}: any) => {
  const styles = styleSheet();
  const mnemonic = WalletSession.isUnlocked() ? WalletSession.getMnemonic() : '';
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [blockHeight, setBlockHeight] = useState<string | number>('---');
  const [nodeReady, setNodeReady] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const apiBaseUrl = WalletSession.getApiBaseUrl();

  const refresh = useCallback(async () => {
    if (!mnemonic) {
      setError('Wallet seed is not loaded.');
      return;
    }
    setRefreshing(true);
    try {
      const walletAddress = walletAddressFromMnemonic(mnemonic);
      const [account, history, net] = await Promise.all([
        getAccount(apiBaseUrl, walletAddress),
        getTransactions(apiBaseUrl, walletAddress),
        getNetwork(apiBaseUrl).catch(() => null),
      ]);
      setAddress(walletAddress);
      setBalance(formatBaseUnits(account.balanceBaseUnits));
      setTransactions(history);
      if (net) {
        setBlockHeight(net.height);
        setNodeReady(true);
      }
      setError('');
    } catch (refreshError: any) {
      setNodeReady(false);
      setError(refreshError?.message ?? 'Unable to load wallet data.');
    } finally {
      setRefreshing(false);
    }
  }, [mnemonic, apiBaseUrl]);

  useEffect(() => { refresh(); }, [refresh]);

  const copyAddress = () => {
    if (address) Clipboard.setString(address);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'sent') return tx.from === address;
    if (filter === 'received') return tx.to === address;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Network Header Banner */}
      <View style={customStyles.networkBanner}>
        <Text style={customStyles.networkText}>
          {nodeReady ? '🟢 Connected' : '🔴 Offline'} | Height: #{blockHeight}
        </Text>
        <Pressable onPress={() => navigation.navigate('Settings')}>
          <Text style={customStyles.settingsLink}>⚙️ Settings</Text>
        </Pressable>
      </View>

      <View style={styles.accountInfo}>
        <Text style={styles.name}>UbudKusCoin Wallet</Text>
        <Pressable onPress={copyAddress}>
          <Text style={styles.address}>{address || 'Loading address...'} 📋</Text>
        </Pressable>
        <Text style={styles.balance}>{balance} UKC</Text>
      </View>

      {error ? <Text style={customStyles.errorText}>{error}</Text> : null}

      <View style={styles.btnBox}>
        <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('Send')}><Image source={IMAGES.IconSend} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('Receive')}><Image source={IMAGES.IconReceive} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity style={styles.btnAction} onPress={() => navigation.navigate('Scan')}><Image source={IMAGES.IconScan} style={styles.icon} /></TouchableOpacity>
        <TouchableOpacity style={styles.btnAction} onPress={() => { WalletSession.lock(); navigation.replace('Home'); }}><Image source={IMAGES.IconExit} style={styles.icon} /></TouchableOpacity>
      </View>

      {/* Quick Utility Actions Bar */}
      <View style={customStyles.quickBar}>
        <Pressable style={customStyles.quickBtn} onPress={() => navigation.navigate('AddressBook')}>
          <Text style={customStyles.quickBtnText}>📖 Contacts</Text>
        </Pressable>
        <Pressable style={customStyles.quickBtn} onPress={() => navigation.navigate('Staking')}>
          <Text style={customStyles.quickBtnText}>🥩 Staking</Text>
        </Pressable>
        <Pressable style={customStyles.quickBtn} onPress={() => navigation.navigate('Settings')}>
          <Text style={customStyles.quickBtnText}>⚙️ Node Config</Text>
        </Pressable>
      </View>

      {/* Transaction Filter Tabs */}
      <View style={customStyles.filterRow}>
        <Pressable
          style={[customStyles.tab, filter === 'all' && customStyles.tabActive]}
          onPress={() => setFilter('all')}>
          <Text style={filter === 'all' ? customStyles.tabTextActive : customStyles.tabText}>All</Text>
        </Pressable>
        <Pressable
          style={[customStyles.tab, filter === 'sent' && customStyles.tabActive]}
          onPress={() => setFilter('sent')}>
          <Text style={filter === 'sent' ? customStyles.tabTextActive : customStyles.tabText}>Sent</Text>
        </Pressable>
        <Pressable
          style={[customStyles.tab, filter === 'received' && customStyles.tabActive]}
          onPress={() => setFilter('received')}>
          <Text style={filter === 'received' ? customStyles.tabTextActive : customStyles.tabText}>Received</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredTransactions}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={<Text style={customStyles.emptyText}>{error ? '' : 'No transactions found.'}</Text>}
        renderItem={({item}) => {
          const isSent = item.from === address;
          return (
            <Pressable style={styles.row} onPress={() => navigation.navigate('TransactionDetail', {tx: item})}>
              <View style={styles.colLeft}>
                <Text style={styles.itemAddress}>{isSent ? '📤 To: ' : '📥 From: '}{item.txId.substring(0, 16)}...</Text>
                <Text style={styles.itemDate}>Block #{item.height}</Text>
              </View>
              <View style={styles.colRight}>
                <Text style={[styles.itemAmmount, {color: isSent ? '#e53e3e' : '#38a169'}]}>
                  {isSent ? '-' : '+'}{formatBaseUnits(item.amountBaseUnits)} UKC
                </Text>
              </View>
            </Pressable>
          );
        }}
        keyExtractor={item => item.txId}
      />
    </View>
  );
};

const customStyles = StyleSheet.create({
  networkBanner: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#edf2f7',
    borderRadius: 6,
    marginBottom: 8,
  },
  networkText: {fontSize: 12, fontWeight: '600', color: '#2d3748'},
  settingsLink: {fontSize: 12, color: '#3182ce', fontWeight: 'bold'},
  errorText: {color: '#e53e3e', fontSize: 13, marginVertical: 4, textAlign: 'center'},
  quickBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickBtn: {padding: 6},
  quickBtnText: {fontSize: 13, fontWeight: '600', color: '#2b6cb0'},
  filterRow: {flexDirection: 'row', gap: 8, marginBottom: 8},
  tab: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#edf2f7',
  },
  tabActive: {backgroundColor: '#3182ce'},
  tabText: {fontSize: 12, color: '#4a5568'},
  tabTextActive: {fontSize: 12, color: '#ffffff', fontWeight: 'bold'},
  emptyText: {textAlign: 'center', color: '#a0aec0', marginTop: 20},
});

