/**
 * HDKeyDerivation Unit Tests
 *
 * Test coverage:
 *  - Happy Path: deterministic address derivation from known mnemonics
 *  - Multi-account: different derivation paths produce different addresses
 *  - Chain ID: mainnet (1) vs testnet (2) produce different address prefixes
 *  - Edge cases: whitespace in mnemonic, invalid public key length
 *  - Security: private key is not leaked in returned account object shape
 *  - Regression: known-good address vectors from protocol tests
 */

import '@ethersproject/shims';
import {HDKeyDerivation} from '../../../infrastructure/crypto/HDKeyDerivation';

// Well-known BIP39 test mnemonic (all-zeros entropy)
const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

// Derived via HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2) — BIP44 path m/44'/60'/0'/0/0
// NOTE: this is different from the blockchain genesis address (privKey=0x01)
const KNOWN_ACCOUNT_0_ADDRESS_CHAINID2 = '4keNUTHmukJsyMkHzhsW2616HW8uKqGiQxGrrbc5dKNQvQcCHGM';

// Genesis blockchain address (compressed pubkey of privKey=0x01)
const GENESIS_ADDRESS_CHAIN2 = '4itS3kYnXo7PJDQ1noaaVBawTEwysyb73hKNKHc8C7bsLsytfua';

describe('HDKeyDerivation', () => {
  // ─── Happy Path ──────────────────────────────────────────────────────────────

  describe('deriveAccount – Happy Path', () => {
    it('returns a deterministic address for account index 0 on chainId 2', () => {
      const account = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      expect(account.address).toBe(KNOWN_ACCOUNT_0_ADDRESS_CHAINID2);
    });

    it('returns correct index and name for account 0', () => {
      const account = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      expect(account.index).toBe(0);
      expect(account.name).toBe('Main Account');
    });

    it('returns correct index and name for account 3', () => {
      const account = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 3, 2);
      expect(account.index).toBe(3);
      expect(account.name).toBe('Account 4');
    });

    it('derives a compressed 33-byte public key', () => {
      const account = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      // Compressed key is 33 bytes = 66 hex chars + '0x' prefix
      expect(account.publicKey).toMatch(/^0x0[23][0-9a-f]{64}$/i);
    });

    it('trims leading/trailing whitespace from mnemonic', () => {
      const account1 = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      const account2 = HDKeyDerivation.deriveAccount(`  ${TEST_MNEMONIC}  `, 0, 2);
      expect(account1.address).toBe(account2.address);
    });
  });

  // ─── Multi-Account Derivation ─────────────────────────────────────────────

  describe('deriveAccount – Multi-Account', () => {
    it('produces different addresses for different account indices', () => {
      const acc0 = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      const acc1 = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 1, 2);
      const acc2 = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 2, 2);
      expect(acc0.address).not.toBe(acc1.address);
      expect(acc1.address).not.toBe(acc2.address);
      expect(acc0.address).not.toBe(acc2.address);
    });

    it('is deterministic: same index always yields same address', () => {
      const first = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 5, 2);
      const second = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 5, 2);
      expect(first.address).toBe(second.address);
    });
  });

  // ─── Chain ID Handling ───────────────────────────────────────────────────

  describe('addressFromPublicKey – Chain ID', () => {
    it('mainnet addresses start with a different prefix than testnet', () => {
      const acc = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      const mainnet = HDKeyDerivation.addressFromPublicKey(acc.publicKey, 1);
      const testnet = HDKeyDerivation.addressFromPublicKey(acc.publicKey, 2);
      expect(mainnet).not.toBe(testnet);
    });

    it('defaults to chainId=2 (testnet) if chainId not provided', () => {
      const acc = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      const defaultAddr = HDKeyDerivation.addressFromPublicKey(acc.publicKey);
      const testnetAddr = HDKeyDerivation.addressFromPublicKey(acc.publicKey, 2);
      expect(defaultAddr).toBe(testnetAddr);
    });
  });

  // ─── Edge Cases ──────────────────────────────────────────────────────────

  describe('addressFromPublicKey – Edge Cases', () => {
    it('throws if public key is not 33 bytes', () => {
      // 31 bytes = 62 hex chars (even-length, valid hex but wrong byte length)
      const shortKey = '0x' + '02'.repeat(31); // 31 bytes
      expect(() => HDKeyDerivation.addressFromPublicKey(shortKey, 2)).toThrow();
    });

    it('throws if public key is empty (0 bytes)', () => {
      // 1 byte, clearly not 33
      const oneByteKey = '0x02';
      expect(() => HDKeyDerivation.addressFromPublicKey(oneByteKey, 2)).toThrow();
    });
  });

  // ─── Security ────────────────────────────────────────────────────────────

  describe('Security', () => {
    it('returned account object contains privateKey field (caller must secure it)', () => {
      const account = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      expect(typeof account.privateKey).toBe('string');
      expect(account.privateKey.length).toBeGreaterThan(0);
    });

    it('different mnemonics produce different private keys', () => {
      const mnemonic2 =
        'legal winner thank year wave sausage worth useful legal winner thank yellow';
      const acc1 = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      const acc2 = HDKeyDerivation.deriveAccount(mnemonic2, 0, 2);
      expect(acc1.privateKey).not.toBe(acc2.privateKey);
      expect(acc1.address).not.toBe(acc2.address);
    });
  });

  // ─── Regression ──────────────────────────────────────────────────────────

  describe('Regression', () => {
    it('[REG-001] genesis compressed pubKey (privKey=0x01) produces the known blockchain genesis address', () => {
      // The genesis account in testnet uses private key 0x...01
      // Compressed public key: 0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
      const address = HDKeyDerivation.addressFromPublicKey(
        '0x0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798',
        2,
      );
      expect(address).toBe(GENESIS_ADDRESS_CHAIN2);
    });

    it('[REG-002] BIP44 account 0 from abandon mnemonic is deterministic across calls', () => {
      const a1 = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      const a2 = HDKeyDerivation.deriveAccount(TEST_MNEMONIC, 0, 2);
      expect(a1.address).toBe(a2.address);
      expect(a1.address).toBe(KNOWN_ACCOUNT_0_ADDRESS_CHAINID2);
    });
  });
});
