export interface WalletAccount {
  index: number;
  name: string;
  address: string;
  publicKey: string;
  isWatchOnly?: boolean;
}

export interface WalletState {
  hasWallet: boolean;
  isUnlocked: boolean;
  activeAccountIndex: number;
  accounts: WalletAccount[];
  biometricsEnabled: boolean;
  autoLockMinutes: number;
}
