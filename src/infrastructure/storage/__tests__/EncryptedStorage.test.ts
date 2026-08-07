/**
 * EncryptedStorage Unit Tests
 *
 * Test coverage:
 *  - Happy Path: encrypt → decrypt round trip, set/get public items, set/get secure items
 *  - Wrong PIN: decryption with wrong PIN returns garbled data (not null) but should not crash
 *  - Edge Cases: empty string values, unicode content, very long content
 *  - Security: different PINs produce different cipher text
 *  - Boundary: setItem/getItem key namespacing (no cross-contamination)
 *  - Regression: removeItem deletes both encrypted and public namespaces
 */

import '@ethersproject/shims';
import {EncryptedStorage} from '../../../infrastructure/storage/EncryptedStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN = '123456';
const WRONG_PIN = '654321';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('EncryptedStorage', () => {
  // ─── encrypt / decrypt in-memory ─────────────────────────────────────────

  describe('encrypt / decrypt (in-memory)', () => {
    it('round-trips plain text correctly', () => {
      const plain = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const cipher = EncryptedStorage.encrypt(plain, PIN);
      const result = EncryptedStorage.decrypt(cipher, PIN);
      expect(result).toBe(plain);
    });

    it('encrypts to a hex string starting with 0x', () => {
      const cipher = EncryptedStorage.encrypt('hello world', PIN);
      expect(cipher).toMatch(/^0x[0-9a-f]+$/i);
    });

    it('cipher text differs from plain text', () => {
      const plain = 'hello world';
      const cipher = EncryptedStorage.encrypt(plain, PIN);
      expect(cipher).not.toBe(plain);
    });

    it('same PIN always produces same cipher text (deterministic key derivation)', () => {
      const cipher1 = EncryptedStorage.encrypt('hello', PIN);
      const cipher2 = EncryptedStorage.encrypt('hello', PIN);
      expect(cipher1).toBe(cipher2);
    });

    it('different PINs produce different cipher texts', () => {
      const cipher1 = EncryptedStorage.encrypt('hello', PIN);
      const cipher2 = EncryptedStorage.encrypt('hello', WRONG_PIN);
      expect(cipher1).not.toBe(cipher2);
    });

    it('round-trips unicode and emoji content', () => {
      const plain = '🔐 UbudKusCoin Wallet — Selamat Datang! 💰';
      const cipher = EncryptedStorage.encrypt(plain, PIN);
      const result = EncryptedStorage.decrypt(cipher, PIN);
      expect(result).toBe(plain);
    });

    it('round-trips empty string', () => {
      const cipher = EncryptedStorage.encrypt('', PIN);
      const result = EncryptedStorage.decrypt(cipher, PIN);
      expect(result).toBe('');
    });

    it('round-trips a very long seed phrase (512 words of text)', () => {
      const plain = Array(512).fill('abandon').join(' ');
      const cipher = EncryptedStorage.encrypt(plain, PIN);
      const result = EncryptedStorage.decrypt(cipher, PIN);
      expect(result).toBe(plain);
    });
  });

  // ─── Wrong PIN ───────────────────────────────────────────────────────────

  describe('Wrong PIN handling', () => {
    it('decrypting with wrong PIN either throws or returns different text', () => {
      // ethers toUtf8String throws on invalid codepoints produced by wrong XOR key
      const plain = 'my secret phrase';
      const cipher = EncryptedStorage.encrypt(plain, PIN);
      // Either throws an error OR returns garbled text — never the original
      let result: string | null = null;
      try {
        result = EncryptedStorage.decrypt(cipher, WRONG_PIN);
      } catch {
        // Expected: invalid UTF-8 sequence from XOR with wrong key
        result = null;
      }
      if (result !== null) {
        expect(result).not.toBe(plain);
      }
    });

    it('getSecureItem returns null if stored cipher cannot be retrieved', async () => {
      const result = await EncryptedStorage.getSecureItem('nonexistent_key', PIN);
      expect(result).toBeNull();
    });
  });

  // ─── Async setSecureItem / getSecureItem ─────────────────────────────────

  describe('setSecureItem / getSecureItem', () => {
    it('stores and retrieves a secure item correctly', async () => {
      await EncryptedStorage.setSecureItem('vault', 'my seed phrase', PIN);
      const result = await EncryptedStorage.getSecureItem('vault', PIN);
      expect(result).toBe('my seed phrase');
    });

    it('returns null for a key that was never set', async () => {
      const result = await EncryptedStorage.getSecureItem('does_not_exist', PIN);
      expect(result).toBeNull();
    });

    it('stores under @encrypted: namespace', async () => {
      await EncryptedStorage.setSecureItem('my_key', 'value', PIN);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@encrypted:my_key',
        expect.any(String),
      );
    });
  });

  // ─── Async setItem / getItem ──────────────────────────────────────────────

  describe('setItem / getItem (public)', () => {
    it('stores and retrieves a plain item', async () => {
      await EncryptedStorage.setItem('accounts', '[{"index":0}]');
      const result = await EncryptedStorage.getItem('accounts');
      expect(result).toBe('[{"index":0}]');
    });

    it('stores under @public: namespace', async () => {
      await EncryptedStorage.setItem('config', 'testnet');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@public:config', 'testnet');
    });

    it('returns null for a key that was never set', async () => {
      const result = await EncryptedStorage.getItem('unknown_key');
      expect(result).toBeNull();
    });
  });

  // ─── Boundary: namespace isolation ───────────────────────────────────────

  describe('Namespace isolation', () => {
    it('@encrypted and @public keys do not collide for the same key name', async () => {
      await EncryptedStorage.setItem('key', 'public_value');
      await EncryptedStorage.setSecureItem('key', 'secure_value', PIN);

      const publicResult = await EncryptedStorage.getItem('key');
      const secureResult = await EncryptedStorage.getSecureItem('key', PIN);

      expect(publicResult).toBe('public_value');
      expect(secureResult).toBe('secure_value');
    });
  });

  // ─── removeItem ──────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('removes both @encrypted and @public entries for the same key', async () => {
      await EncryptedStorage.setItem('target', 'plain');
      await EncryptedStorage.setSecureItem('target', 'secure', PIN);

      await EncryptedStorage.removeItem('target');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@encrypted:target');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@public:target');
    });

    it('after removeItem, getItem returns null', async () => {
      await EncryptedStorage.setItem('gone', 'value');
      await EncryptedStorage.removeItem('gone');
      const result = await EncryptedStorage.getItem('gone');
      expect(result).toBeNull();
    });
  });

  // ─── Regression ──────────────────────────────────────────────────────────

  describe('Regression', () => {
    it('[REG-001] PIN hash stored as public item is readable without PIN', async () => {
      // WalletRepositoryImpl stores PIN hash as a public item, must be accessible without PIN
      const pinHash = '0xdeadbeef';
      await EncryptedStorage.setItem('pin_hash', pinHash);
      const retrieved = await EncryptedStorage.getItem('pin_hash');
      expect(retrieved).toBe(pinHash);
    });
  });
});
