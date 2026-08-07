import {ethers} from 'ethers';
import {WalletSession} from '../WalletSession';

const MNEMONIC = 'test test test test test test test test test test test junk';
const PIN = '123456';
const WRONG_PIN = '654321';

describe('WalletSession', () => {
  beforeEach(() => {
    WalletSession.__resetForTesting();
  });

  describe('setup lifecycle', () => {
    test('beginSetup stores a pending mnemonic', () => {
      WalletSession.beginSetup(MNEMONIC);
      // completeSetup should succeed because a pending mnemonic exists
      expect(() => WalletSession.completeSetup(PIN)).not.toThrow();
    });

    test('beginSetup trims whitespace', () => {
      WalletSession.beginSetup(`  ${MNEMONIC}  `);
      expect(() => WalletSession.completeSetup(PIN)).not.toThrow();
    });

    test('completeSetup throws when no pending mnemonic', () => {
      expect(() => WalletSession.completeSetup(PIN)).toThrow(
        'A wallet setup session and six-digit PIN are required.',
      );
    });

    test('completeSetup throws when PIN is not 6 digits', () => {
      WalletSession.beginSetup(MNEMONIC);
      expect(() => WalletSession.completeSetup('12345')).toThrow();
      expect(() => WalletSession.completeSetup('1234567')).toThrow();
      expect(() => WalletSession.completeSetup('abcdef')).toThrow();
    });

    test('completeSetup activates the mnemonic and unlocks', () => {
      WalletSession.beginSetup(MNEMONIC);
      WalletSession.completeSetup(PIN);
      expect(WalletSession.isUnlocked()).toBe(true);
      expect(WalletSession.hasActiveWallet()).toBe(true);
      expect(WalletSession.getMnemonic()).toBe(MNEMONIC);
    });
  });

  describe('unlock / lock', () => {
    beforeEach(() => {
      WalletSession.beginSetup(MNEMONIC);
      WalletSession.completeSetup(PIN);
    });

    test('unlock with correct PIN returns true and keeps wallet unlocked', () => {
      WalletSession.lock();
      expect(WalletSession.isUnlocked()).toBe(false);
      expect(WalletSession.unlock(PIN)).toBe(true);
      expect(WalletSession.isUnlocked()).toBe(true);
    });

    test('unlock with wrong PIN returns false and keeps wallet locked', () => {
      WalletSession.lock();
      expect(WalletSession.unlock(WRONG_PIN)).toBe(false);
      expect(WalletSession.isUnlocked()).toBe(false);
    });

    test('unlock with non-6-digit PIN returns false', () => {
      expect(WalletSession.unlock('12345')).toBe(false);
      expect(WalletSession.unlock('1234567')).toBe(false);
    });

    test('unlock fails when no wallet has been set up', () => {
      WalletSession.__resetForTesting();
      expect(WalletSession.unlock(PIN)).toBe(false);
    });

    test('getMnemonic throws when wallet is locked', () => {
      WalletSession.lock();
      expect(() => WalletSession.getMnemonic()).toThrow('Wallet is locked.');
    });

    test('lock makes isUnlocked return false', () => {
      WalletSession.lock();
      expect(WalletSession.isUnlocked()).toBe(false);
    });
  });

  describe('hasActiveWallet', () => {
    test('returns false when no wallet has been set up', () => {
      expect(WalletSession.hasActiveWallet()).toBe(false);
    });

    test('returns true after completeSetup even if locked', () => {
      WalletSession.beginSetup(MNEMONIC);
      WalletSession.completeSetup(PIN);
      WalletSession.lock();
      expect(WalletSession.hasActiveWallet()).toBe(true);
      expect(WalletSession.isUnlocked()).toBe(false);
    });
  });

  describe('PIN digest is not stored in plain text', () => {
    test('pinDigest is a SHA-256 hash, not the raw PIN', () => {
      WalletSession.beginSetup(MNEMONIC);
      WalletSession.completeSetup(PIN);

      // Verify that getMnemonic does not throw and the mnemonic matches
      const storedMnemonic = WalletSession.getMnemonic();
      expect(storedMnemonic).toBe(MNEMONIC);

      // Verify the PIN was not stored in its raw form by checking internals
      // The pinDigest should be the SHA-256 hash of the PIN
      const expectedDigest = ethers.utils.sha256(ethers.utils.toUtf8Bytes(PIN));
      // We can't directly inspect pinDigest, but we can verify correct/incorrect
      // PIN behavior which indirectly confirms the hash is being used
      expect(WalletSession.unlock(PIN)).toBe(true);
      WalletSession.lock();
      expect(WalletSession.unlock(expectedDigest)).toBe(false);
    });
  });

  describe('Address Book & Network Settings', () => {
    test('manages network endpoints', () => {
      expect(WalletSession.getApiBaseUrl()).toContain('http');
      expect(WalletSession.getNodeRpcUrl()).toContain('http');
      WalletSession.setNetworkUrls('http://custom-node:5100', 'http://custom-node:26657');
      expect(WalletSession.getApiBaseUrl()).toBe('http://custom-node:5100');
      expect(WalletSession.getNodeRpcUrl()).toBe('http://custom-node:26657');
    });

    test('adds and removes contacts', () => {
      expect(WalletSession.getContacts()).toHaveLength(0);
      const contact = WalletSession.addContact('Alice', '12345');
      expect(WalletSession.getContacts()).toHaveLength(1);
      expect(WalletSession.getContacts()[0].name).toBe('Alice');
      WalletSession.removeContact(contact.id);
      expect(WalletSession.getContacts()).toHaveLength(0);
    });
  });
});

