import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import {useWallet} from '../context/WalletContext';
import {useToast} from '../context/ToastContext';
import {Card} from '../components/Card';
import {Badge} from '../components/Badge';
import {MultiAccountModal} from '../components/MultiAccountModal';
import Clipboard from '@react-native-clipboard/clipboard';
import IMAGES from '../../../assets';

export const PortfolioDashboardScreen = ({navigation}: any) => {
  const {
    activeAccount,
    balance,
    health,
    transactions,
    refreshAccountData,
    lockWallet,
  } = useWallet();
  const {showToast} = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAccountData();
    setRefreshing(false);
    showToast('Account synced with node', 'info');
  };

  const copyAddress = () => {
    if (activeAccount?.address) {
      Clipboard.setString(activeAccount.address);
      showToast('Address copied to clipboard!', 'success');
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'sent'
        ? tx.from === activeAccount?.address
        : tx.to === activeAccount?.address;
    const matchesSearch =
      searchQuery === '' ||
      tx.txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Network Health Header */}
      <View style={styles.networkHeader}>
        <View style={styles.healthStatus}>
          <Text style={styles.healthDot}>
            {health.isConnected ? '🟢' : '🔴'}
          </Text>
          <Text style={styles.healthText}>
            {health.isConnected ? `Connected (Block #${health.blockHeight})` : 'Offline'}
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsLink}>⚙️ Settings</Text>
        </Pressable>
      </View>

      {/* Main Account Portfolio Card */}
      <Card style={styles.portfolioCard}>
        <Pressable style={styles.accountSelector} onPress={() => setShowAccountModal(true)}>
          <Text style={styles.accountName}>
            {activeAccount?.name ?? 'Main Account'} {activeAccount?.isWatchOnly ? '👁️' : ''}
          </Text>
          <Text style={styles.switchText}>Switch ▾</Text>
        </Pressable>

        <Pressable onPress={copyAddress} style={styles.addressRow}>
          <Text style={styles.addressText} numberOfLines={1} ellipsisMode="middle">
            {activeAccount?.address ?? 'Loading...'}
          </Text>
          <Text style={styles.copyIcon}>📋</Text>
        </Pressable>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceValue}>
            {balance?.balanceFormatted ?? '0.00000000'} <Text style={styles.denom}>UKC</Text>
          </Text>
          <Text style={styles.subBalance}>
            Nonce: #{balance?.nonce ?? 0}
          </Text>
        </View>
      </Card>

      {/* Action Buttons Grid */}
      <View style={styles.actionGrid}>
        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Send')}>
          <View style={styles.iconCircle}><Image source={IMAGES.IconSend} style={styles.actionIcon} /></View>
          <Text style={styles.actionLabel}>Send</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Receive')}>
          <View style={styles.iconCircle}><Image source={IMAGES.IconReceive} style={styles.actionIcon} /></View>
          <Text style={styles.actionLabel}>Receive</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('Staking')}>
          <View style={styles.iconCircle}><Text style={{fontSize: 18}}>🥩</Text></View>
          <Text style={styles.actionLabel}>Staking</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('AddressBook')}>
          <View style={styles.iconCircle}><Text style={{fontSize: 18}}>📖</Text></View>
          <Text style={styles.actionLabel}>Contacts</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => { lockWallet(); navigation.replace('Home'); }}>
          <View style={styles.iconCircle}><Image source={IMAGES.IconExit} style={styles.actionIcon} /></View>
          <Text style={styles.actionLabel}>Lock</Text>
        </Pressable>
      </View>

      {/* Transaction History Section */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Activity History</Text>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by TxID or address..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterTabs}>
          <Pressable
            style={[styles.tab, filter === 'all' && styles.tabActive]}
            onPress={() => setFilter('all')}>
            <Text style={filter === 'all' ? styles.tabTextActive : styles.tabText}>All</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, filter === 'sent' && styles.tabActive]}
            onPress={() => setFilter('sent')}>
            <Text style={filter === 'sent' ? styles.tabTextActive : styles.tabText}>Sent</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, filter === 'received' && styles.tabActive]}
            onPress={() => setFilter('received')}>
            <Text style={filter === 'received' ? styles.tabTextActive : styles.tabText}>Received</Text>
          </Pressable>
        </View>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={item => item.txId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions recorded</Text>
          </View>
        }
        renderItem={({item}) => {
          const isSent = item.from === activeAccount?.address;
          return (
            <Pressable
              style={styles.txRow}
              onPress={() => navigation.navigate('TransactionDetail', {tx: item})}>
              <View style={styles.txLeft}>
                <Text style={styles.txIcon}>{isSent ? '📤' : '📥'}</Text>
                <View>
                  <Text style={styles.txIdText}>
                    {isSent ? 'Sent to ' : 'Received from '}
                    {(isSent ? item.to : item.from).substring(0, 10)}...
                  </Text>
                  <Text style={styles.txBlockText}>Block #{item.height}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmount, isSent ? styles.sentAmount : styles.recvAmount]}>
                  {isSent ? '-' : '+'}{item.amountFormatted} UKC
                </Text>
                <Badge label={item.status} variant={item.status === 'confirmed' ? 'success' : 'warning'} />
              </View>
            </Pressable>
          );
        }}
      />

      <MultiAccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa', padding: 16},
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthStatus: {flexDirection: 'row', alignItems: 'center', gap: 6},
  healthDot: {fontSize: 12},
  healthText: {fontSize: 12, color: '#4a5568', fontWeight: '600'},
  settingsLink: {fontSize: 13, color: '#3182ce', fontWeight: 'bold'},
  portfolioCard: {
    backgroundColor: '#1a202c',
    borderRadius: 14,
    padding: 20,
  },
  accountSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountName: {fontSize: 16, fontWeight: 'bold', color: '#ffffff'},
  switchText: {fontSize: 12, color: '#63b3ed', fontWeight: '600'},
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  addressText: {fontSize: 12, color: '#e2e8f0', maxWidth: 200},
  copyIcon: {fontSize: 12, marginLeft: 6},
  balanceContainer: {marginTop: 4},
  balanceValue: {fontSize: 28, fontWeight: 'bold', color: '#ffffff'},
  denom: {fontSize: 18, fontWeight: 'normal', color: '#a0aec0'},
  subBalance: {fontSize: 12, color: '#a0aec0', marginTop: 4},
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  actionBtn: {alignItems: 'center'},
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 4,
  },
  actionIcon: {width: 20, height: 20},
  actionLabel: {fontSize: 12, fontWeight: '600', color: '#2d3748'},
  historyHeader: {marginVertical: 8},
  historyTitle: {fontSize: 18, fontWeight: 'bold', color: '#1a202c'},
  filterContainer: {marginBottom: 12},
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filterTabs: {flexDirection: 'row', gap: 6},
  tab: {paddingVertical: 4, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#edf2f7'},
  tabActive: {backgroundColor: '#3182ce'},
  tabText: {fontSize: 12, color: '#4a5568'},
  tabTextActive: {fontSize: 12, color: '#ffffff', fontWeight: 'bold'},
  emptyContainer: {padding: 30, alignItems: 'center'},
  emptyText: {color: '#a0aec0', fontSize: 14},
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#edf2f7',
    marginBottom: 8,
  },
  txLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  txIcon: {fontSize: 20},
  txIdText: {fontSize: 14, fontWeight: 'bold', color: '#2d3748'},
  txBlockText: {fontSize: 12, color: '#718096'},
  txRight: {alignItems: 'flex-end'},
  txAmount: {fontSize: 14, fontWeight: 'bold', marginBottom: 4},
  sentAmount: {color: '#e53e3e'},
  recvAmount: {color: '#38a169'},
});
