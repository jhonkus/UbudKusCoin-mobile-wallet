import {ethers} from 'ethers';

let activeMnemonic = '';
let pinDigest = '';
let pendingMnemonic = '';
let locked = false;

/* eslint-disable no-bitwise */
/**
 * Compares two hex strings (e.g. hash digests) in constant time to avoid
 * timing side-channels during PIN verification. Both inputs are expected to
 * be the same length; if lengths differ the result is still computed over the
 * longer buffer so the timing stays uniform.
 */
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
/* eslint-enable no-bitwise */

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
    const valid = constantTimeEqual(
      ethers.utils.sha256(ethers.utils.toUtf8Bytes(pin)),
      pinDigest,
    );
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

  /** Returns true when a wallet has been set up, regardless of lock state. */
  hasActiveWallet(): boolean {
    return activeMnemonic.length > 0;
  },

  /** Resets all in-memory state. Intended for testing only. */
  __resetForTesting(): void {
    activeMnemonic = '';
    pinDigest = '';
    pendingMnemonic = '';
    locked = false;
  },
};
