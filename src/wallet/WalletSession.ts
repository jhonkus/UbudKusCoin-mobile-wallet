import {ethers} from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UKC_API_BASE_URL, UKC_NODE_RPC_URL} from '../constants';

export interface Contact {
  id: string;
  name: string;
  address: string;
}

let activeMnemonic = '';
let pinDigest = '';
let pendingMnemonic = '';
let encryptedVaultData = '';
let locked = false;

let currentApiUrl = UKC_API_BASE_URL;
let currentRpcUrl = UKC_NODE_RPC_URL;
let contactsList: Contact[] = [];

const STORAGE_KEYS = {
  VAULT: '@ukc_wallet_vault',
  PIN_HASH: '@ukc_wallet_pin',
  NETWORK_API: '@ukc_net_api',
  NETWORK_RPC: '@ukc_net_rpc',
  CONTACTS: '@ukc_contacts',
};

/* eslint-disable no-bitwise */
function constantTimeEqual(a: string, b: string): boolean {
  const aBytes = ethers.utils.arrayify(a);
  const bBytes = ethers.utils.arrayify(b);
  const length = Math.max(aBytes.length, bBytes.length);
  let diff = Math.abs(aBytes.length - bBytes.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

function encryptText(text: string, pin: string): string {
  const key = ethers.utils.sha256(ethers.utils.toUtf8Bytes(`ukc-key-salt-${pin}`));
  const keyBytes = ethers.utils.arrayify(key);
  const textBytes = ethers.utils.toUtf8Bytes(text);
  const encrypted = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i += 1) {
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return ethers.utils.hexlify(encrypted);
}

function decryptText(hex: string, pin: string): string {
  const key = ethers.utils.sha256(ethers.utils.toUtf8Bytes(`ukc-key-salt-${pin}`));
  const keyBytes = ethers.utils.arrayify(key);
  const encryptedBytes = ethers.utils.arrayify(hex);
  const decrypted = new Uint8Array(encryptedBytes.length);
  for (let i = 0; i < encryptedBytes.length; i += 1) {
    decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return ethers.utils.toUtf8String(decrypted);
}
/* eslint-enable no-bitwise */

export const WalletSession = {
  async init(): Promise<void> {
    try {
      const [savedPin, savedVault, savedApi, savedRpc, savedContacts] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH),
        AsyncStorage.getItem(STORAGE_KEYS.VAULT),
        AsyncStorage.getItem(STORAGE_KEYS.NETWORK_API),
        AsyncStorage.getItem(STORAGE_KEYS.NETWORK_RPC),
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS),
      ]);
      if (savedPin) pinDigest = savedPin;
      if (savedVault) encryptedVaultData = savedVault;
      if (savedApi) currentApiUrl = savedApi;
      if (savedRpc) currentRpcUrl = savedRpc;
      if (savedContacts) {
        try { contactsList = JSON.parse(savedContacts); } catch {}
      }
      if (pinDigest && encryptedVaultData) {
        locked = true;
      }
    } catch {}
  },

  beginSetup(mnemonic: string): void {
    pendingMnemonic = mnemonic.trim();
  },

  completeSetup(pin: string): void {
    if (!/^\d{6}$/.test(pin) || !pendingMnemonic) {
      throw new Error('A wallet setup session and six-digit PIN are required.');
    }
    activeMnemonic = pendingMnemonic;
    pendingMnemonic = '';
    pinDigest = ethers.utils.sha256(ethers.utils.toUtf8Bytes(pin));
    encryptedVaultData = encryptText(activeMnemonic, pin);
    locked = false;

    // Persist to storage
    AsyncStorage.setItem(STORAGE_KEYS.PIN_HASH, pinDigest).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.VAULT, encryptedVaultData).catch(() => {});
  },

  unlock(pin: string): boolean {
    if (!/^\d{6}$/.test(pin) || !pinDigest) return false;
    const computedPinHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(pin));
    const valid = constantTimeEqual(computedPinHash, pinDigest);
    if (valid) {
      if (encryptedVaultData) {
        try {
          activeMnemonic = decryptText(encryptedVaultData, pin);
        } catch {
          return false;
        }
      }
      locked = false;
    }
    return valid;
  },

  getMnemonic(): string {
    if (!activeMnemonic || locked) throw new Error('Wallet is locked.');
    return activeMnemonic;
  },

  isUnlocked(): boolean {
    return activeMnemonic.length > 0 && !locked;
  },

  lock(): void {
    locked = true;
  },

  hasActiveWallet(): boolean {
    return activeMnemonic.length > 0 || (pinDigest.length > 0 && encryptedVaultData.length > 0);
  },

  // Network Settings
  getApiBaseUrl(): string {
    return currentApiUrl;
  },

  getNodeRpcUrl(): string {
    return currentRpcUrl;
  },

  setNetworkUrls(apiUrl: string, rpcUrl: string): void {
    currentApiUrl = apiUrl.trim();
    currentRpcUrl = rpcUrl.trim();
    AsyncStorage.setItem(STORAGE_KEYS.NETWORK_API, currentApiUrl).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEYS.NETWORK_RPC, currentRpcUrl).catch(() => {});
  },

  // Contacts / Address Book
  getContacts(): Contact[] {
    return [...contactsList];
  },

  addContact(name: string, address: string): Contact {
    const contact: Contact = {
      id: Date.now().toString(),
      name: name.trim(),
      address: address.trim(),
    };
    contactsList.push(contact);
    AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contactsList)).catch(() => {});
    return contact;
  },

  removeContact(id: string): void {
    contactsList = contactsList.filter(c => c.id !== id);
    AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contactsList)).catch(() => {});
  },

  __resetForTesting(): void {
    activeMnemonic = '';
    pinDigest = '';
    pendingMnemonic = '';
    encryptedVaultData = '';
    locked = false;
    currentApiUrl = UKC_API_BASE_URL;
    currentRpcUrl = UKC_NODE_RPC_URL;
    contactsList = [];
  },
};

