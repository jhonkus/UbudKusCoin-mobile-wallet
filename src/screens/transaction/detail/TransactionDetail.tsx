import React from 'react';
import {View, Text, FlatList} from 'react-native';
import styleSheet from './style';

const DATA = [
  {label: 'Block ID', id: 0, value: '13129782'},
  {label: 'TimeStamp', id: 1, value: 'Aug-30-2021 11:13:01 PM +UTC'},
  {
    label: 'Transaction Hash',
    id: 2,
    value: '0xaad631745729b5f6f94ddd66a93ec18d5cbe5749639aac5a2849967d67e940c9',
  },
  {label: 'From', id: 3, value: '0x2f1df65944443a049c49851660dfd53b0e71269f'},
  {label: 'To', id: 4, value: '0x002010e1aacc7fba0ef5c5114a89b0749e57ec90'},
  {label: 'Value', id: 5, value: '0.00001 Ukus ($80.99)'},
  {label: 'Transaction Fee', id: 6, value: '0.002755277918463 Ukus ($8.99)'},
];

type TransactionDetailItem = (typeof DATA)[number];

const Item = ({data}: {data: TransactionDetailItem}) => {
  const styles = styleSheet();
  return (
    <View style={styles.rowDtl}>
      <Text style={styles.itemLabel}>{data.label}</Text>
      <Text style={styles.itemValue}>{data.value}</Text>
    </View>
  );
};

export const TransactionDetail = () => {
  const styles = styleSheet();
  const renderItem = ({item}: {item: TransactionDetailItem}) => {
    return <Item data={item} />;
  };
  const myKeyExtractor = (item: TransactionDetailItem) => {
    return String(item.id);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={myKeyExtractor}
      />
    </View>
  );
};
