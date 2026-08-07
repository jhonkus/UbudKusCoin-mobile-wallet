import React, {useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import {UKC_API_BASE_URL} from '../../../constants';
import {formatBaseUnits, getTransactionStatus, TransactionSummary, TransactionStatus} from '../../../protocol';
import styleSheet from './style';

type DetailItem = {label: string; id: number; value: string};

const Item = ({data}: {data: DetailItem}) => {
  const styles = styleSheet();
  return (
    <View style={styles.rowDtl}>
      <Text style={styles.itemLabel}>{data.label}</Text>
      <Text style={styles.itemValue}>{data.value}</Text>
    </View>
  );
};

export const TransactionDetail = ({route}: {route: {params?: {tx: TransactionSummary}}}) => {
  const styles = styleSheet();
  const tx = route?.params?.tx;
  const [status, setStatus] = useState<TransactionStatus | null>(null);

  useEffect(() => {
    if (!tx) return;
    getTransactionStatus(UKC_API_BASE_URL, tx.txId)
      .then(result => setStatus(result))
      .catch(error => setStatus({txId: tx.txId, status: 'rejected', message: error?.message ?? 'Unable to load status.'}));
  }, [tx]);

  if (!tx) {
    return (
      <View style={styles.container}><Text>Transaction not found.</Text></View>
    );
  }

  const rows: DetailItem[] = [
    {label: 'Transaction Hash', id: 0, value: tx.txId},
    {label: 'Status', id: 1, value: status?.status ?? 'Loading...'},
    {label: 'From', id: 2, value: tx.from},
    {label: 'To', id: 3, value: tx.to},
    {label: 'Amount', id: 4, value: `${formatBaseUnits(tx.amountBaseUnits)} UKC`},
    {label: 'Fee', id: 5, value: `${formatBaseUnits(tx.feeBaseUnits)} UKC`},
    {label: 'Nonce', id: 6, value: String(tx.nonce)},
    {label: 'Block Height', id: 7, value: String(tx.height)},
    {label: 'Timestamp', id: 8, value: String(tx.timeStamp)},
  ];
  const renderItem = ({item}: {item: DetailItem}) => <Item data={item} />;
  const myKeyExtractor = (item: DetailItem) => String(item.id);

  return (
    <View style={styles.container}>
      <FlatList data={rows} renderItem={renderItem} keyExtractor={myKeyExtractor} />
    </View>
  );
};
