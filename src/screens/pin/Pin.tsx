import React, {useState} from 'react';
import {Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {WalletSession} from '../../wallet/WalletSession';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'ok'];

export const Pin = ({navigation, route}: any) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState('');
  const isUnlock = route?.params?.mode === 'unlock';

  const press = (key: string) => {
    if (key === 'clear') return setEnteredPin(value => value.slice(0, -1));
    if (key === 'ok') {
      if (enteredPin.length !== 6) return setError('Enter all 6 digits.');
      try {
        if (isUnlock) {
          if (!WalletSession.unlock(enteredPin)) throw new Error('Invalid PIN.');
        } else {
          WalletSession.completeSetup(enteredPin);
        }
        navigation.replace('Dashboard');
      } catch {
        setEnteredPin('');
        setError('Invalid PIN or wallet setup expired.');
      }
      return;
    }
    if (enteredPin.length < 6) {
      setError('');
      setEnteredPin(value => value + key);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <Text style={styles.title}>{isUnlock ? 'Unlock Wallet' : 'Create Wallet PIN'}</Text>
      <View style={styles.dots}>{[0, 1, 2, 3, 4, 5].map(index => <View key={index} style={[styles.dot, index < enteredPin.length && styles.filled]} />)}</View>
      <Text style={styles.error}>{error}</Text>
      <View style={styles.pad}>{KEYS.map(key => <Pressable key={key} style={styles.key} onPress={() => press(key)}><Text style={styles.keyText}>{key === 'clear' ? 'DEL' : key === 'ok' ? 'OK' : key}</Text></Pressable>)}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#22577A', alignItems: 'center', justifyContent: 'center'},
  title: {color: '#FFF', fontSize: 24, marginBottom: 28},
  dots: {flexDirection: 'row', marginBottom: 12},
  dot: {width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#FFF', marginHorizontal: 8},
  filled: {backgroundColor: '#FFF'},
  error: {color: '#FFD6D6', height: 24},
  pad: {width: 270, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'},
  key: {width: 80, height: 60, margin: 4, borderWidth: 1, borderColor: '#FFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  keyText: {color: '#FFF', fontSize: 22},
});
