import {WalletAccount, WalletState} from '../entities/Wallet';
import {DomainContact} from '../entities/Contact';

export interface IWalletRepository {
  init(): Promise<WalletState>;
  createWallet(mnemonic: string, pin: string): Promise<WalletAccount>;
  importWallet(mnemonicOrPrivateKey: string, pin: string): Promise<WalletAccount>;
  addAccount(pin: string, name?: string): Promise<WalletAccount>;
  addWatchOnlyAccount(address: string, name: string): Promise<WalletAccount>;
  unlock(pin: string): Promise<boolean>;
  lock(): void;
  exportMnemonic(pin: string): Promise<string>;
  getContacts(): Promise<DomainContact[]>;
  saveContact(contact: Omit<DomainContact, 'id' | 'createdAt'>): Promise<DomainContact>;
  deleteContact(id: string): Promise<void>;
  setBiometricsEnabled(enabled: boolean): Promise<void>;
  setAutoLockMinutes(minutes: number): Promise<void>;
}
