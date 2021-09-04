import React from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import styleSheet from './style';

const DATA = [
  {label: 'From', id: 1, value: '0x2f1df65944443a049c49851660dfd53b0e71269f'},
  {label: 'To', id: 2, value: '0x002010e1aacc7fba0ef5c5114a89b0749e57ec90'},
  {label: 'Value', id: 3, value: '0.00001 Ether ($80.99)'},
  {label: 'Transaction Fee', id: 4, value: '0.002755277918463 Ether ($8.99)'},
];

const Item = props => {
  console.log(props.data.address);
  const styles = styleSheet();
  return (
    <View style={styles.rowDtl}>
      <Text style={styles.itemLabel}>{props.data.label}</Text>
      <Text style={styles.itemValue}>{props.data.value}</Text>
    </View>
  );
};

export const SendConfirmation = ({navigation}) => {
  const styles = styleSheet();
  const renderItem = ({item}) => {
    return <Item data={item} />;
  };
  const myKeyExtractor = item => {
    return item.id;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={myKeyExtractor}
      />
      <View style={styles.btnBox}>
        <TouchableOpacity
          style={styles.btnContinue}
          onPress={() => navigation.navigate('SendSuccess')}>
          <Text style={styles.txtContinue}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
