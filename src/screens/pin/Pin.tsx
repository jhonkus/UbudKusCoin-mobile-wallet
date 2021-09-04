import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView, StatusBar, Text, View, StyleSheet} from 'react-native';
import ReactNativePinView from 'react-native-pin-view';
export const Pin = ({navigation}) => {
  const pinView = useRef(null);
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  useEffect(() => {
    if (enteredPin.length > 0) {
      setShowRemoveButton(true);
    } else {
      setShowRemoveButton(false);
    }
    if (enteredPin.length === 6) {
      setShowCompletedButton(true);
    } else {
      setShowCompletedButton(false);
    }
  }, [enteredPin]);
  return (
    <>
      <StatusBar />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#22577A',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 80,
        }}>
        {/* <Text
          style={{
            paddingTop: 0,
            paddingBottom: 48,
            color: 'rgba(255,255,255,0.7)',
            fontSize: 24,
          }}>
          Input your PIN code
        </Text> */}
        <ReactNativePinView
          inputSize={20}
          ref={pinView}
          pinLength={6}
          buttonSize={60}
          onValueChange={value => setEnteredPin(value)}
          buttonAreaStyle={{
            marginTop: 44,
          }}
          inputAreaStyle={{
            marginBottom: 24,
          }}
          inputViewEmptyStyle={{
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#FFF',
          }}
          inputViewFilledStyle={{
            backgroundColor: '#FFF',
          }}
          buttonViewStyle={{
            borderWidth: 1,
            borderColor: '#FFF',
          }}
          buttonTextStyle={{
            color: '#FFF',
          }}
          onButtonPress={key => {
            if (key === 'custom_left') {
              pinView.current.clear();
            }
            if (key === 'custom_right') {
              navigation.navigate('Dashboard');
            }
            if (key === 'three') {
              console.log(' theree was presed');
            }
          }}
          customLeftButton={
            showRemoveButton ? (
              <View style={styles.btnPin}>
                <Text style={styles.txtPin}> Clear </Text>
              </View>
            ) : undefined
          }
          customRightButton={
            showCompletedButton ? (
              <View style={styles.btnPin}>
                <Text style={styles.txtPin}> Oke </Text>
              </View>
            ) : undefined
          }
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  btnPin: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 8,
    borderColor: '#ffffff',
  },
  txtPin: {
    color: '#ffffff',
  },
});
