import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {WalletAccount, WalletState} from '../../domain/entities/Wallet';
import {AccountBalance} from '../../domain/entities/Account';
import {NetworkHealthStatus, NetworkPreset} from '../../domain/entities/Network';
import {DomainTransaction} from '../../domain/entities/Transaction';
import {DomainContact} from '../../domain/entities/Contact';
import {WalletRepositoryImpl} from '../../data/repositories/WalletRepositoryImpl';
import {NodeRepositoryImpl} from '../../data/repositories/NodeRepositoryImpl';

interface WalletContextType {
  walletState: WalletState;
  activeAccount: WalletAccount | null;
  balance: AccountBalance | null;
  network: NetworkPreset;
  health: NetworkHealthStatus;
  transactions: DomainTransaction[];
  contacts: DomainContact[];
  isLoading: boolean;
  error: string;
  refreshAccountData: () => Promise<void>;
  createWallet: (mnemonic: string, pin: string) => Promise<void>;
  importWallet: (mnemonic: string, pin: string) => Promise<void>;
  addAccount: (pin: string, name?: string) => Promise<void>;
  switchAccount: (index: number) => void;
  unlockWallet: (pin: string) => Promise<boolean>;
  lockWallet: () => void;
  exportMnemonic: (pin: string) => Promise<string>;
  saveContact: (name: string, address: string) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  changeNetwork: (preset: NetworkPreset) => Promise<void>;
}

const walletRepo = new WalletRepositoryImpl();
const nodeRepo = new NodeRepositoryImpl();

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const WalletProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [walletState, setWalletState] = useState<WalletState>({
    hasWallet: false,
    isUnlocked: false,
    activeAccountIndex: 0,
    accounts: [],
    biometricsEnabled: false,
    autoLockMinutes: 5,
  });
  const [activeAccount, setActiveAccount] = useState<WalletAccount | null>(null);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [network, setNetwork] = useState<NetworkPreset>(nodeRepo.getActiveNetwork());
  const [health, setHealth] = useState<NetworkHealthStatus>({
    isConnected: false,
    blockHeight: 0,
    consensusEngine: 'initializing',
    latencyMs: 0,
  });
  const [transactions, setTransactions] = useState<DomainTransaction[]>([]);
  const [contacts, setContacts] = useState<DomainContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const init = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await walletRepo.init();
      setWalletState(state);
      if (state.accounts.length > 0) {
        setActiveAccount(state.accounts[state.activeAccountIndex] ?? state.accounts[0]);
      }
      const loadedContacts = await walletRepo.getContacts();
      setContacts(loadedContacts);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to initialize wallet session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const refreshAccountData = useCallback(async () => {
    if (!activeAccount?.address) return;
    try {
      const [accBalance, txHistory, netHealth] = await Promise.all([
        nodeRepo.getAccountBalance(activeAccount.address),
        nodeRepo.getTransactionHistory(activeAccount.address),
        nodeRepo.checkHealth(),
      ]);
      setBalance(accBalance);
      setTransactions(txHistory);
      setHealth(netHealth);
      setError('');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch node data');
    }
  }, [activeAccount?.address]);

  useEffect(() => {
    if (activeAccount?.address) {
      refreshAccountData();
    }
  }, [activeAccount?.address, refreshAccountData]);

  const createWallet = async (mnemonic: string, pin: string) => {
    const acc = await walletRepo.createWallet(mnemonic, pin);
    const state = await walletRepo.init();
    setWalletState(state);
    setActiveAccount(acc);
  };

  const importWallet = async (mnemonic: string, pin: string) => {
    const acc = await walletRepo.importWallet(mnemonic, pin);
    const state = await walletRepo.init();
    setWalletState(state);
    setActiveAccount(acc);
  };

  const addAccount = async (pin: string, name?: string) => {
    const newAcc = await walletRepo.addAccount(pin, name);
    const state = await walletRepo.init();
    setWalletState(state);
    setActiveAccount(newAcc);
  };

  const switchAccount = (index: number) => {
    if (walletState.accounts[index]) {
      setWalletState(prev => ({...prev, activeAccountIndex: index}));
      setActiveAccount(walletState.accounts[index]);
    }
  };

  const unlockWallet = async (pin: string): Promise<boolean> => {
    const unlocked = await walletRepo.unlock(pin);
    if (unlocked) {
      const state = await walletRepo.init();
      setWalletState({...state, isUnlocked: true});
      if (state.accounts.length > 0) {
        setActiveAccount(state.accounts[0]);
      }
    }
    return unlocked;
  };

  const lockWallet = () => {
    walletRepo.lock();
    setWalletState(prev => ({...prev, isUnlocked: false}));
  };

  const exportMnemonic = async (pin: string): Promise<string> => {
    return walletRepo.exportMnemonic(pin);
  };

  const saveContact = async (name: string, address: string) => {
    const newC = await walletRepo.saveContact({name, address});
    setContacts(prev => [...prev, newC]);
  };

  const deleteContact = async (id: string) => {
    await walletRepo.deleteContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const changeNetwork = async (preset: NetworkPreset) => {
    await nodeRepo.setActiveNetwork(preset);
    setNetwork(preset);
    await refreshAccountData();
  };

  return (
    <WalletContext.Provider
      value={{
        walletState,
        activeAccount,
        balance,
        network,
        health,
        transactions,
        contacts,
        isLoading,
        error,
        refreshAccountData,
        createWallet,
        importWallet,
        addAccount,
        switchAccount,
        unlockWallet,
        lockWallet,
        exportMnemonic,
        saveContact,
        deleteContact,
        changeNetwork,
      }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
