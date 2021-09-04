import React from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import styleSheet from './style';

export const Send = ({navigation}) => {
  const styles = styleSheet();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>From</Text>
        <View style={styles.from}>
          <Text>Account 1</Text>
          <Text>0x2f1df65944443a049c49851660dfd53b0e71269f</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>To</Text>
        <TextInput
          style={styles.textInput}
          placeholder="input recipient address"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Amount UKC</Text>
        <TextInput style={styles.textInput} placeholder="input amount in UKC" />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fee</Text>
        <TextInput
          secureTextEntry
          style={[styles.textInput]}
          placeholder="input transaction fee"
        />
      </View>
      <View style={styles.btnBox}>
        <TouchableOpacity
          style={styles.btnContinue}
          onPress={() => navigation.navigate('SendConfirmation')}>
          <Text style={styles.txtContinue}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnClear}>
          <Text style={styles.txtCancel}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
