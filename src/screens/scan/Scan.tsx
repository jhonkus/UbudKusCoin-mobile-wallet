import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Camera, useCameraDevice, useCodeScanner, useCameraPermission} from 'react-native-vision-camera';
import IMAGES from '../../../assets';
import {isValidAddress} from '../../protocol';
import styleSheet from './style';

export const Scan = ({navigation}: any) => {
  const styles = styleSheet();
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const [scanned, setScanned] = useState(false);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: useCallback((codes: any[]) => {
      if (scanned) return;
      const value = codes[0]?.displayValue ?? codes[0]?.data;
      if (value && isValidAddress(value.trim())) {
        setScanned(true);
        navigation.replace('Send', {recipient: value.trim()});
      } else if (value) {
        Alert.alert('Invalid QR Code', 'This QR code does not contain a valid UKC address.');
      }
    }, [navigation, scanned]),
  });

  // Request camera permission on mount if not yet granted
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Requesting camera permission…</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator />
        <Text>No camera device available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        codeScanner={codeScanner}
        isActive={!scanned}
      />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.replace('Dashboard')}>
        <Image source={IMAGES.IconExit} style={styles.icon} />
        <Text>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};
