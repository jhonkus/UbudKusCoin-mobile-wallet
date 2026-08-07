import React, {useState} from 'react';
import {View, Text, Modal, Pressable, StyleSheet, FlatList, TextInput} from 'react-native';
import {useWallet} from '../context/WalletContext';
import {useToast} from '../context/ToastContext';

interface MultiAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MultiAccountModal: React.FC<MultiAccountModalProps> = ({visible, onClose}) => {
  const {walletState, activeAccount, switchAccount, addAccount, addWatchOnlyAccount} = useWallet();
  const {showToast} = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [pin, setPin] = useState('');
  const [accountName, setAccountName] = useState('');
  const [watchAddress, setWatchAddress] = useState('');
  const [isWatchOnly, setIsWatchOnly] = useState(false);

  const handleCreateAccount = async () => {
    try {
      if (isWatchOnly) {
        if (!watchAddress) return showToast('Please enter address', 'error');
        await addWatchOnlyAccount(watchAddress, accountName || 'Watch Account');
        showToast('Watch account added!', 'success');
      } else {
        if (!pin) return showToast('PIN is required to derive new account', 'error');
        await addAccount(pin, accountName);
        showToast('New HD account derived successfully!', 'success');
      }
      setShowAddForm(false);
      setPin('');
      setAccountName('');
      setWatchAddress('');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to derive account', 'error');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Manage Accounts</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {!showAddForm ? (
            <>
              <FlatList
                data={walletState.accounts}
                keyExtractor={item => item.address}
                renderItem={({item, index}) => {
                  const isActive = activeAccount?.address === item.address;
                  return (
                    <Pressable
                      style={[styles.accountRow, isActive && styles.accountRowActive]}
                      onPress={() => {
                        switchAccount(index);
                        showToast(`Switched to ${item.name}`, 'info');
                        onClose();
                      }}>
                      <View style={styles.accInfo}>
                        <Text style={styles.accName}>
                          {item.name} {item.isWatchOnly ? '👁️' : ''}
                        </Text>
                        <Text style={styles.accAddress} numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                      {isActive && <Text style={styles.checkIcon}>✓</Text>}
                    </Pressable>
                  );
                }}
              />
              <Pressable
                style={styles.btnAdd}
                onPress={() => setShowAddForm(true)}>
                <Text style={styles.btnAddText}>+ Derive New Account / Watch Address</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Add New Account</Text>

              <View style={styles.tabRow}>
                <Pressable
                  style={[styles.tab, !isWatchOnly && styles.tabActive]}
                  onPress={() => setIsWatchOnly(false)}>
                  <Text style={!isWatchOnly ? styles.tabTextActive : styles.tabText}>
                    HD Account
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.tab, isWatchOnly && styles.tabActive]}
                  onPress={() => setIsWatchOnly(true)}>
                  <Text style={isWatchOnly ? styles.tabTextActive : styles.tabText}>
                    Watch-Only
                  </Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Account Name (e.g. Savings)"
                value={accountName}
                onChangeText={setAccountName}
              />

              {!isWatchOnly ? (
                <TextInput
                  style={styles.input}
                  placeholder="6-digit PIN to derive key"
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pin}
                  onChangeText={setPin}
                />
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="UKC Public Address to Watch"
                  value={watchAddress}
                  onChangeText={setWatchAddress}
                  autoCapitalize="none"
                />
              )}

              <View style={styles.btnRow}>
                <Pressable
                  style={styles.btnConfirm}
                  onPress={handleCreateAccount}>
                  <Text style={styles.btnConfirmText}>Add Account</Text>
                </Pressable>
                <Pressable
                  style={styles.btnCancel}
                  onPress={() => setShowAddForm(false)}>
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {fontSize: 18, fontWeight: 'bold', color: '#1a202c'},
  closeBtn: {fontSize: 18, color: '#718096', padding: 4},
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#edf2f7',
    marginBottom: 8,
  },
  accountRowActive: {
    borderColor: '#3182ce',
    backgroundColor: '#ebf8ff',
  },
  accInfo: {flex: 1},
  accName: {fontSize: 15, fontWeight: 'bold', color: '#2d3748'},
  accAddress: {fontSize: 12, color: '#718096', marginTop: 2},
  checkIcon: {fontSize: 16, fontWeight: 'bold', color: '#3182ce'},
  btnAdd: {
    backgroundColor: '#edf2f7',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnAddText: {color: '#2b6cb0', fontWeight: 'bold', fontSize: 14},
  formContainer: {marginTop: 4},
  formTitle: {fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginBottom: 12},
  tabRow: {flexDirection: 'row', gap: 8, marginBottom: 12},
  tab: {flex: 1, paddingVertical: 8, borderRadius: 6, backgroundColor: '#edf2f7', alignItems: 'center'},
  tabActive: {backgroundColor: '#3182ce'},
  tabText: {fontSize: 13, color: '#4a5568'},
  tabTextActive: {fontSize: 13, color: '#ffffff', fontWeight: 'bold'},
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  btnRow: {flexDirection: 'row', gap: 10, marginTop: 8},
  btnConfirm: {flex: 1, backgroundColor: '#3182ce', padding: 12, borderRadius: 6, alignItems: 'center'},
  btnConfirmText: {color: '#fff', fontWeight: 'bold'},
  btnCancel: {padding: 12, borderRadius: 6, alignItems: 'center'},
  btnCancelText: {color: '#e53e3e', fontWeight: '600'},
});
