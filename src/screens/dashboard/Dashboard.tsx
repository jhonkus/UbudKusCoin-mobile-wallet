import React, {useState} from 'react';
import {useEffect} from 'react';
import {Pressable} from 'react-native';
import {Text, FlatList, View, Image, TouchableOpacity} from 'react-native';
import IMAGES from '../../../assets';
import styleSheet from './style';

const DATA = [
  {
    address: '0xbb1df8d6ad9809...',
    id: '0',
    txDate: '22/08/2021 09:09:09',
    amount: '0.59 Ukc',
  },
  {
    address: '0xf29cb956b580b31...',
    id: '1',
    txDate: '23/08/2021 09:09:09',
    amount: '0.0789 Ukc',
  },
  {
    address: '0x93e59a5ebd7453...',
    id: '2',
    txDate: '22/08/2021 09:09:09',
    amount: '0.01 Ukc',
  },
  {
    address: '0x8494b1f11248...',
    id: '3',
    txDate: '24/08/2021 09:09:09',
    amount: '0.00349 Ukc',
  },
  {
    address: '0xebf45fdcf3f20b7...',
    id: '4',
    txDate: '25/08/2021 09:09:09',
    amount: '0.0634 Ukc',
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

export const Dashboard = ({navigation}) => {
  const [balance, setBalance] = useState(10);
  const [address, setAddress] = useState('');

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

  useEffect(() => {
    setAddress('0x2f1df659444...d53b0e71269f');
    setBalance(103.09);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.accountInfo}>
        <Text style={styles.name}>Acount 1</Text>
        <Text style={styles.address}>{address}</Text>
        <Text style={styles.balance}>{balance} UKC</Text>
      </View>
      <View style={styles.btnBox}>
        <TouchableOpacity
          style={[styles.btnAction]}
          onPress={() => navigation.navigate('Send')}>
          <Image source={IMAGES.IconSend} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAction]}
          onPress={() => navigation.navigate('Receive')}>
          <Image source={IMAGES.IconReceive} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAction]}
          onPress={() => navigation.navigate('Scan')}>
          <Image source={IMAGES.IconScan} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnAction]}
          onPress={() => navigation.navigate('Home')}>
          <Image source={IMAGES.IconExit} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.subtitle}>
        <View style={styles.subLeft}>
          <Text style={styles.textLeft}>Transaction(s)</Text>
        </View>
        <Pressable
          style={styles.subRight}
          onPress={() => {
            navigation.navigate('Transactions');
          }}>
          <Text style={styles.textRight}>Show All</Text>
        </Pressable>
      </View>
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
