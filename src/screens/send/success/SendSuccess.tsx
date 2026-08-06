import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import IMAGES from '../../../../assets';
import styleSheet from './style';
import {UKC_API_BASE_URL} from '../../../constants';
import {TransactionStatus, waitForTransaction} from '../../../protocol';
export const SendSuccess = ({navigation, route}: any) => {
  const styles = styleSheet();
  const [status, setStatus] = useState<TransactionStatus | null>(null);

  useEffect(() => {
    let active = true;
    const txId = route.params?.txId;
    if (txId) {
      waitForTransaction(UKC_API_BASE_URL, txId)
        .then(result => { if (active) setStatus(result); })
        .catch(error => { if (active) setStatus({txId, status: 'rejected', message: error?.message ?? 'Unable to query transaction status.'}); });
    }
    return () => { active = false; };
  }, [route.params?.txId]);

  return (
    <View style={styles.container}>
      <View style={styles.partTop}>
        <Image source={IMAGES.IconSuccess} style={styles.logo} />
        <Text style={styles.desc}>
          {status?.status === 'confirmed' ? 'Transaction confirmed on UbudKusCoin.' : status?.status === 'rejected' ? 'Transaction rejected by the network.' : 'Transaction submitted; waiting for confirmation.'}
        </Text>
        <Text>{route.params?.txId ?? ''}</Text>
        <Text>{status?.message ?? ''}</Text>
      </View>
      <View style={styles.partBottom}>
        <TouchableOpacity
          style={[styles.btn, styles.btnNew]}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.btnLabel}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
