import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, FlatList, StyleSheet} from 'react-native';
import {WalletSession, Contact} from '../../wallet/WalletSession';
import {isValidAddress} from '../../protocol';

export const AddressBook = ({navigation, route}: any) => {
  const isPicker = route?.params?.mode === 'picker';
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const loadContacts = () => {
    setContacts(WalletSession.getContacts());
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAdd = () => {
    setError('');
    if (!name.trim()) return setError('Please enter a contact name.');
    if (!isValidAddress(address.trim())) {
      return setError('Please enter a valid UKC address.');
    }
    WalletSession.addContact(name, address);
    setName('');
    setAddress('');
    loadContacts();
  };

  const handleRemove = (id: string) => {
    WalletSession.removeContact(id);
    loadContacts();
  };

  const handleSelect = (contact: Contact) => {
    if (isPicker) {
      navigation.navigate({
        name: 'Send',
        params: {recipient: contact.address},
        merge: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isPicker ? 'Select Recipient' : 'Address Book'}</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add New Contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Contact Name (e.g. Alice)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="UKC Address"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable style={styles.btnAdd} onPress={handleAdd}>
          <Text style={styles.btnText}>Save Contact</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Saved Contacts ({contacts.length})</Text>
      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No contacts saved yet.</Text>
        }
        renderItem={({item}) => (
          <Pressable
            style={styles.contactRow}
            onPress={() => handleSelect(item)}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactAddress} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
            <Pressable
              style={styles.btnDelete}
              onPress={() => handleRemove(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f8f9fa'},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#1a1a1a'},
  subtitle: {fontSize: 16, fontWeight: '600', marginVertical: 12, color: '#333'},
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  cardTitle: {fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#4a5568'},
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  btnAdd: {
    backgroundColor: '#3182ce',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {color: '#fff', fontWeight: 'bold', fontSize: 14},
  errorText: {color: '#e53e3e', fontSize: 13, marginBottom: 8},
  emptyText: {textAlign: 'center', color: '#a0aec0', marginTop: 20},
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#edf2f7',
    marginBottom: 8,
  },
  contactInfo: {flex: 1},
  contactName: {fontSize: 15, fontWeight: 'bold', color: '#2d3748'},
  contactAddress: {fontSize: 12, color: '#718096', marginTop: 2},
  btnDelete: {padding: 6, backgroundColor: '#fed7d7', borderRadius: 4},
  deleteText: {color: '#c53030', fontSize: 12, fontWeight: '600'},
});
