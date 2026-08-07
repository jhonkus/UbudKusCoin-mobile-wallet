import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView} from 'react-native';
import {WalletSession} from '../../wallet/WalletSession';
import {getHealthReady, NodeHealth} from '../../protocol';

export const Settings = ({navigation}: any) => {
  const [apiUrl, setApiUrl] = useState(WalletSession.getApiBaseUrl());
  const [rpcUrl, setRpcUrl] = useState(WalletSession.getNodeRpcUrl());
  const [health, setHealth] = useState<NodeHealth | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [seedText, setSeedText] = useState('');
  const [seedError, setSeedError] = useState('');
  const [message, setMessage] = useState('');

  const checkHealth = async (url: string) => {
    try {
      const res = await getHealthReady(url);
      setHealth(res);
    } catch {
      setHealth({
        ready: false,
        consensusReady: false,
        consensusEngine: 'offline',
        consensusMessage: 'Connection failed',
      });
    }
  };

  useEffect(() => {
    checkHealth(apiUrl);
  }, [apiUrl]);

  const handleSaveNetwork = () => {
    WalletSession.setNetworkUrls(apiUrl, rpcUrl);
    setMessage('Network settings saved successfully.');
    checkHealth(apiUrl);
  };

  const handlePresetDevnet = () => {
    const devApi = 'http://10.0.2.2:5100';
    const devRpc = 'http://10.0.2.2:26657';
    setApiUrl(devApi);
    setRpcUrl(devRpc);
    WalletSession.setNetworkUrls(devApi, devRpc);
    setMessage('Preset applied: Multi-validator Local Devnet');
  };

  const handleRevealSeed = () => {
    setSeedError('');
    if (!pinInput || !WalletSession.unlock(pinInput)) {
      setSeedError('Invalid PIN code.');
      return;
    }
    setSeedText(WalletSession.getMnemonic());
    setShowSeed(true);
    setPinInput('');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Settings</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Node API Base URL</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
        />

        <Text style={styles.label}>CometBFT RPC URL</Text>
        <TextInput
          style={styles.input}
          value={rpcUrl}
          onChangeText={setRpcUrl}
          autoCapitalize="none"
        />

        {message ? <Text style={styles.successText}>{message}</Text> : null}

        <View style={styles.btnRow}>
          <Pressable style={styles.btnSave} onPress={handleSaveNetwork}>
            <Text style={styles.btnText}>Save Network</Text>
          </Pressable>
          <Pressable style={styles.btnPreset} onPress={handlePresetDevnet}>
            <Text style={styles.btnTextPreset}>Local Devnet</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.title}>Node Health & Diagnostics</Text>
      <View style={styles.card}>
        <Text style={styles.healthStatus}>
          Status: {health?.ready ? '🟢 READY (Consensus Online)' : '🔴 NOT READY'}
        </Text>
        <Text style={styles.healthDetail}>Engine: {health?.consensusEngine ?? 'Checking...'}</Text>
        <Text style={styles.healthDetail}>Message: {health?.consensusMessage ?? 'N/A'}</Text>
      </View>

      <Text style={styles.title}>Security & Seed Backup</Text>
      <View style={styles.card}>
        {!showSeed ? (
          <>
            <Text style={styles.desc}>
              Enter your 6-digit PIN to export your wallet recovery phrase.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="6-digit PIN"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={pinInput}
              onChangeText={setPinInput}
            />
            {seedError ? <Text style={styles.errorText}>{seedError}</Text> : null}
            <Pressable style={styles.btnExport} onPress={handleRevealSeed}>
              <Text style={styles.btnText}>Export Seed Phrase</Text>
            </Pressable>
          </>
        ) : (
          <View>
            <Text style={styles.warningText}>⚠️ Do NOT share this seed phrase with anyone!</Text>
            <Text style={styles.seedBox}>{seedText}</Text>
            <Pressable style={styles.btnSave} onPress={() => setShowSeed(false)}>
              <Text style={styles.btnText}>Hide Seed Phrase</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable
        style={styles.btnLogout}
        onPress={() => {
          WalletSession.lock();
          navigation.replace('Home');
        }}>
        <Text style={styles.logoutText}>Lock Wallet</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f8f9fa'},
  title: {fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#1a202c'},
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  label: {fontSize: 13, fontWeight: '600', color: '#4a5568', marginBottom: 4},
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  btnRow: {flexDirection: 'row', gap: 10},
  btnSave: {flex: 1, backgroundColor: '#3182ce', padding: 12, borderRadius: 6, alignItems: 'center'},
  btnPreset: {backgroundColor: '#edf2f7', padding: 12, borderRadius: 6, alignItems: 'center'},
  btnText: {color: '#fff', fontWeight: 'bold'},
  btnTextPreset: {color: '#2d3748', fontWeight: '600'},
  btnExport: {backgroundColor: '#d69e2e', padding: 12, borderRadius: 6, alignItems: 'center'},
  btnLogout: {backgroundColor: '#e53e3e', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10, marginBottom: 30},
  logoutText: {color: '#fff', fontWeight: 'bold'},
  successText: {color: '#38a169', fontSize: 13, marginBottom: 8},
  errorText: {color: '#e53e3e', fontSize: 13, marginBottom: 8},
  warningText: {color: '#c05621', fontWeight: 'bold', marginBottom: 8},
  seedBox: {
    backgroundColor: '#feebc8',
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    color: '#742a2a',
    fontWeight: '500',
    marginBottom: 12,
  },
  desc: {fontSize: 13, color: '#718096', marginBottom: 8},
  healthStatus: {fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginBottom: 4},
  healthDetail: {fontSize: 13, color: '#4a5568', marginTop: 2},
});
