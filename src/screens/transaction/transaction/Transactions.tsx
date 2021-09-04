import React from 'react';
import {useEffect} from 'react';
import {Pressable} from 'react-native';
import {Text, FlatList, View} from 'react-native';
import styleSheet from './style';

const DATA = [
  {
    address: '0xbb1df8d6ad9809...',
    id: 0,
    txDate: '22/08/2021 09:09:09',
    amount: '0.59 Ukc',
  },
  {
    address: '0xf29cb956b580b31...',
    id: 1,
    txDate: '23/08/2021 09:09:09',
    amount: '0.0789 Ukc',
  },
  {
    address: '0x93e59a5ebd7453...',
    id: 2,
    txDate: '22/08/2021 09:09:09',
    amount: '0 Ukc',
  },
  {
    address: '0x8494b1f11248...',
    id: 3,
    txDate: '24/08/2021 09:09:09',
    amount: '0.00349 Ukc',
  },
  {
    address: '0xebf45fdcf3f20b7...',
    id: 4,
    txDate: '25/08/2021 09:09:09',
    amount: '0.0634 Ukc',
  },
  {
    address: '0x93e59a5ebd7453...',
    id: 5,
    txDate: '22/08/2021 09:09:09',
    amount: '0 Ukc',
  },
  {
    address: '0x8494b1f11248...',
    id: 6,
    txDate: '24/08/2021 09:09:09',
    amount: '0.00349 Ukc',
  },
  {
    address: '0x93e59a5ebd7453...',
    id: 7,
    txDate: '22/08/2021 09:09:09',
    amount: '0 Ukc',
  },
  {
    address: '0x8494b1f11248...',
    id: 8,
    txDate: '24/08/2021 09:09:09',
    amount: '0.00349 Ukc',
  },
  {
    address: '0x93e59a5ebd7453...',
    id: 9,
    txDate: '22/08/2021 09:09:09',
    amount: '0 Ukc',
  },
  {
    address: '0x8494b1f11248...',
    id: 10,
    txDate: '24/08/2021 09:09:09',
    amount: '0.00349 Ukc',
  },
  {
    address: '0x93e59a5ebd7453...',
    id: 11,
    txDate: '22/08/2021 09:09:09',
    amount: '0 Ukc',
  },
  {
    address: '0x8494b1f11248...',
    id: 12,
    txDate: '24/08/2021 09:09:09',
    amount: '0.00349 Ukc',
  },
  {
    address: '0x93e59a5ebd7453...',
    id: 13,
    txDate: '22/08/2021 09:09:09',
    amount: '0 Ukc',
  },
  {
    address: '0x8494b1f11248...',
    id: 14,
    txDate: '24/08/2021 09:09:09',
    amount: '0.00349 Ukc',
  },
];

const Item = props => {
  console.log(props.data.address);
  const styles = styleSheet();
  return (
    <Pressable
      onPress={() => {
        props.navigator.navigate('TransactionDetail');
      }}
      style={({pressed}) => [
        {
          backgroundColor: pressed ? 'rgb(210, 230, 255)' : null,
        },
        styles.wrapperCustom,
      ]}>
      <View style={styles.row}>
        <View style={styles.colLeft}>
          <Text style={styles.itemAddress}>{props.data.address}</Text>
          <Text style={styles.itemDate}>{props.data.txDate}</Text>
        </View>
        <View style={styles.colRight}>
          <Text style={styles.itemAmmount}>{props.data.amount}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const Transactions = ({navigation}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = () => {
    setRefreshing(prevState => !prevState);
  };

  const styles = styleSheet();

  const myKeyExtractor = item => {
    return item.id;
  };

  const renderItem = ({item}) => {
    return <Item data={item} navigator={navigation} />;
  };

  useEffect(() => {}, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={myKeyExtractor}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};
