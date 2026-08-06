import {ethers} from 'ethers';

let activeMnemonic = '';
let pinDigest = '';
let pendingMnemonic = '';
let locked = false;

export const WalletSession = {
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
    locked = false;
  },

  unlock(pin: string): boolean {
    if (!/^\d{6}$/.test(pin) || !pinDigest || !activeMnemonic) return false;
    const valid = ethers.utils.sha256(ethers.utils.toUtf8Bytes(pin)) === pinDigest;
    if (valid) locked = false;
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
};
