import {IWalletRepository} from '../../domain/repositories/IWalletRepository';
import {WalletAccount, WalletState} from '../../domain/entities/Wallet';
import {DomainContact} from '../../domain/entities/Contact';
import {EncryptedStorage} from '../../infrastructure/storage/EncryptedStorage';
import {HDKeyDerivation} from '../../infrastructure/crypto/HDKeyDerivation';
import {ethers} from 'ethers';

const KEYS = {
  PIN_HASH: 'pin_hash',
  VAULT: 'mnemonic_vault',
  ACCOUNTS: 'accounts_list',
  CONTACTS: 'contacts_list',
  BIOMETRICS: 'biometrics_enabled',
  AUTOLOCK: 'autolock_minutes',
};

export class WalletRepositoryImpl implements IWalletRepository {
  private inMemoryMnemonic = '';
  private isStateUnlocked = false;

  async init(): Promise<WalletState> {
    const [pinHash, accountsJson, bio, autoLock] = await Promise.all([
      EncryptedStorage.getItem(KEYS.PIN_HASH),
      EncryptedStorage.getItem(KEYS.ACCOUNTS),
      EncryptedStorage.getItem(KEYS.BIOMETRICS),
      EncryptedStorage.getItem(KEYS.AUTOLOCK),
    ]);

    const accounts: WalletAccount[] = accountsJson ? JSON.parse(accountsJson) : [];
    const hasWallet = Boolean(pinHash && accounts.length > 0);

    return {
      hasWallet,
      isUnlocked: this.isStateUnlocked,
      activeAccountIndex: 0,
      accounts,
      biometricsEnabled: bio === 'true',
      autoLockMinutes: autoLock ? parseInt(autoLock, 10) : 5,
    };
  }

  async createWallet(mnemonic: string, pin: string): Promise<WalletAccount> {
    const pinHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(pin));
    await EncryptedStorage.setItem(KEYS.PIN_HASH, pinHash);
    await EncryptedStorage.setSecureItem(KEYS.VAULT, mnemonic.trim(), pin);

    const mainAccount = HDKeyDerivation.deriveAccount(mnemonic, 0);
    const accountEntity: WalletAccount = {
      index: 0,
      name: 'Main Account',
      address: mainAccount.address,
      publicKey: mainAccount.publicKey,
    };

    await EncryptedStorage.setItem(KEYS.ACCOUNTS, JSON.stringify([accountEntity]));
    this.inMemoryMnemonic = mnemonic.trim();
    this.isStateUnlocked = true;

    return accountEntity;
  }

  async importWallet(mnemonicOrPrivateKey: string, pin: string): Promise<WalletAccount> {
    const trimmed = mnemonicOrPrivateKey.trim();
    let mnemonic = trimmed;
    if (!ethers.utils.isValidMnemonic(trimmed)) {
      // If raw private key, wrap or generate derivation
      throw new Error('Please enter a valid 12-word recovery seed phrase.');
    }
    return this.createWallet(mnemonic, pin);
  }

  async addAccount(pin: string, name?: string): Promise<WalletAccount> {
    const mnemonic = await this.exportMnemonic(pin);
    const existingJson = await EncryptedStorage.getItem(KEYS.ACCOUNTS);
    const accounts: WalletAccount[] = existingJson ? JSON.parse(existingJson) : [];
    const nextIndex = accounts.length;

    const derived = HDKeyDerivation.deriveAccount(mnemonic, nextIndex);
    const newAcc: WalletAccount = {
      index: nextIndex,
      name: name || `Account ${nextIndex + 1}`,
      address: derived.address,
      publicKey: derived.publicKey,
    };

    accounts.push(newAcc);
    await EncryptedStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newAcc;
  }

  async addWatchOnlyAccount(address: string, name: string): Promise<WalletAccount> {
    const existingJson = await EncryptedStorage.getItem(KEYS.ACCOUNTS);
    const accounts: WalletAccount[] = existingJson ? JSON.parse(existingJson) : [];
    const newAcc: WalletAccount = {
      index: accounts.length,
      name: name.trim(),
      address: address.trim(),
      publicKey: '',
      isWatchOnly: true,
    };
    accounts.push(newAcc);
    await EncryptedStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newAcc;
  }

  async unlock(pin: string): Promise<boolean> {
    const storedPinHash = await EncryptedStorage.getItem(KEYS.PIN_HASH);
    if (!storedPinHash) return false;
    const computedHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(pin));
    if (computedHash !== storedPinHash) return false;

    const mnemonic = await EncryptedStorage.getSecureItem(KEYS.VAULT, pin);
    if (!mnemonic) return false;

    this.inMemoryMnemonic = mnemonic;
    this.isStateUnlocked = true;
    return true;
  }

  lock(): void {
    this.inMemoryMnemonic = '';
    this.isStateUnlocked = false;
  }

  async exportMnemonic(pin: string): Promise<string> {
    const mnemonic = await EncryptedStorage.getSecureItem(KEYS.VAULT, pin);
    if (!mnemonic) throw new Error('Invalid PIN or vault is locked.');
    return mnemonic;
  }

  async getContacts(): Promise<DomainContact[]> {
    const json = await EncryptedStorage.getItem(KEYS.CONTACTS);
    return json ? JSON.parse(json) : [];
  }

  async saveContact(contact: Omit<DomainContact, 'id' | 'createdAt'>): Promise<DomainContact> {
    const contacts = await this.getContacts();
    const newContact: DomainContact = {
      id: Date.now().toString(),
      name: contact.name.trim(),
      address: contact.address.trim(),
      notes: contact.notes?.trim(),
      createdAt: Date.now(),
    };
    contacts.push(newContact);
    await EncryptedStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
    return newContact;
  }

  async deleteContact(id: string): Promise<void> {
    const contacts = await this.getContacts();
    const filtered = contacts.filter(c => c.id !== id);
    await EncryptedStorage.setItem(KEYS.CONTACTS, JSON.stringify(filtered));
  }

  async setBiometricsEnabled(enabled: boolean): Promise<void> {
    await EncryptedStorage.setItem(KEYS.BIOMETRICS, String(enabled));
  }

  async setAutoLockMinutes(minutes: number): Promise<void> {
    await EncryptedStorage.setItem(KEYS.AUTOLOCK, String(minutes));
  }
}
