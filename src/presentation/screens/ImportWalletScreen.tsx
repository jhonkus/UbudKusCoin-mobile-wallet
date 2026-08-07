import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import {useWallet} from '../context/WalletContext';
import {useToast} from '../context/ToastContext';

export const ImportWalletScreen = ({navigation}: any) => {
  const {importWallet} = useWallet();
  const {showToast} = useToast();

  const [seedInput, setSeedInput] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImport = async () => {
    setError('');
    if (!seedInput.trim()) {
      return setError('Please enter your 12-word seed phrase.');
    }
    if (!/^\d{6}$/.test(pin)) {
      return setError('Please set a 6-digit numerical PIN.');
    }
    if (pin !== confirmPin) {
      return setError('PIN codes do not match.');
    }

    setIsSubmitting(true);
    try {
      await importWallet(seedInput.trim(), pin);
      showToast('Wallet imported successfully!', 'success');
      navigation.replace('Dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to import wallet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Wallet</Text>
      <Text style={styles.subtitle}>
        Enter your 12-word recovery seed phrase to restore your wallet.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Recovery Seed Phrase</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={3}
          placeholder="apple banana cherry..."
          value={seedInput}
          onChangeText={setSeedInput}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Set Security PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="6-digit PIN"
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          value={pin}
          onChangeText={setPin}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm 6-digit PIN"
          secureTextEntry
          keyboardType="number-pad"
          maxLength={6}
          value={confirmPin}
          onChangeText={setConfirmPin}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.btnImport, isSubmitting && styles.btnDisabled]}
          disabled={isSubmitting}
          onPress={handleImport}>
          <Text style={styles.btnText}>
            {isSubmitting ? 'Restoring Wallet...' : 'Restore Wallet'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f8f9fa'},
  title: {fontSize: 22, fontWeight: 'bold', color: '#1a202c', marginBottom: 6},
  subtitle: {fontSize: 14, color: '#718096', marginBottom: 20},
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {fontSize: 14, fontWeight: '600', color: '#2d3748', marginBottom: 6},
  textArea: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  errorText: {color: '#e53e3e', fontSize: 13, marginBottom: 12},
  btnImport: {
    backgroundColor: '#3182ce',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {backgroundColor: '#a0aec0'},
  btnText: {color: '#ffffff', fontWeight: 'bold', fontSize: 16},
});
