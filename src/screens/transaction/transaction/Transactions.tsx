import React, {useCallback, useEffect, useState} from 'react';
import {RefreshControl, Text, FlatList, View, Pressable} from 'react-native';
import {UKC_API_BASE_URL} from '../../../constants';
import {formatBaseUnits, getTransactions, TransactionSummary, walletAddressFromMnemonic} from '../../../protocol';
import {WalletSession} from '../../../wallet/WalletSession';
import styleSheet from './style';

type Navigation = {navigate: (screen: string, params?: any) => void};

const Item = ({data, navigator}: {data: TransactionSummary; navigator: Navigation}) => {
  const styles = styleSheet();
  const otherParty = data.from === data.to ? data.to : (data.to || data.from);
  return (
    <Pressable
      onPress={() => {
        navigator.navigate('TransactionDetail', {tx: data});
      }}
      style={({pressed}) => [
        {
          backgroundColor: pressed ? 'rgb(210, 230, 255)' : null,
        },
        styles.wrapperCustom,
      ]}>
      <View style={styles.row}>
        <View style={styles.colLeft}>
          <Text style={styles.itemAddress}>{otherParty}</Text>
          <Text style={styles.itemDate}>Block {data.height}</Text>
        </View>
        <View style={styles.colRight}>
          <Text style={styles.itemAmmount}>{formatBaseUnits(data.amountBaseUnits)} UKC</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const Transactions = ({navigation}: {navigation: Navigation}) => {
  const styles = styleSheet();
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const mnemonic = WalletSession.isUnlocked() ? WalletSession.getMnemonic() : '';
    if (!mnemonic) {
      setError('Wallet seed is not loaded.');
      return;
    }
    setRefreshing(true);
    try {
      const walletAddress = walletAddressFromMnemonic(mnemonic);
      const history = await getTransactions(UKC_API_BASE_URL, walletAddress);
      setTransactions(history);
      setError('');
    } catch (refreshError: any) {
      setError(refreshError?.message ?? 'Unable to load transaction history.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <View style={styles.container}>
      {error ? <Text>{error}</Text> : null}
      <FlatList
        data={transactions}
        keyExtractor={item => item.txId}
        renderItem={({item}) => <Item data={item} navigator={navigation} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={<Text>{error ? '' : 'No transactions yet.'}</Text>}
      />
    </View>
  );
};
