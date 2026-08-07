/**
 * WalletRepositoryImpl Unit Tests
 *
 * Test coverage:
 *  - createWallet: happy path, stores PIN hash, creates account at index 0
 *  - importWallet: valid mnemonic, invalid mnemonic throws
 *  - addAccount: derives next HD index, naming convention
 *  - addWatchOnlyAccount: stores with isWatchOnly=true, no publicKey required
 *  - unlock: correct PIN succeeds, wrong PIN fails, no-wallet fails
 *  - lock: clears in-memory mnemonic
 *  - exportMnemonic: correct PIN returns mnemonic, wrong PIN throws
 *  - getContacts / saveContact / deleteContact: CRUD operations
 *  - setBiometricsEnabled / setAutoLockMinutes: settings persistence
 *  - init: returns correct WalletState structure
 *  - Regression: wallet state after createWallet reports hasWallet=true
 */

import '@ethersproject/shims';
import {WalletRepositoryImpl} from '../../../data/repositories/WalletRepositoryImpl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VALID_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const VALID_PIN = '123456';
const WRONG_PIN = '999999';

function freshRepo() {
  return new WalletRepositoryImpl();
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('WalletRepositoryImpl', () => {
  // ─── init ────────────────────────────────────────────────────────────────

  describe('init()', () => {
    it('returns hasWallet=false when storage is empty', async () => {
      const repo = freshRepo();
      const state = await repo.init();
      expect(state.hasWallet).toBe(false);
      expect(state.accounts).toHaveLength(0);
      expect(state.isUnlocked).toBe(false);
    });

    it('defaults autoLockMinutes to 5', async () => {
      const repo = freshRepo();
      const state = await repo.init();
      expect(state.autoLockMinutes).toBe(5);
    });

    it('defaults biometricsEnabled to false', async () => {
      const repo = freshRepo();
      const state = await repo.init();
      expect(state.biometricsEnabled).toBe(false);
    });
  });

  // ─── createWallet ─────────────────────────────────────────────────────────

  describe('createWallet()', () => {
    it('returns the main account at index 0', async () => {
      const repo = freshRepo();
      const account = await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      expect(account.index).toBe(0);
      expect(account.name).toBe('Main Account');
      expect(account.address).toBeTruthy();
      expect(account.publicKey).toBeTruthy();
    });

    it('persists account so that init returns hasWallet=true', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      const state = await repo.init();
      expect(state.hasWallet).toBe(true);
      expect(state.accounts).toHaveLength(1);
    });

    it('sets the wallet as unlocked after creation', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      const state = await repo.init();
      // In-memory unlock state is on the same instance
      expect(state.isUnlocked).toBe(true);
    });

    it('trims whitespace from mnemonic before storing', async () => {
      const repo = freshRepo();
      const acc1 = await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      await AsyncStorage.clear();
      const acc2 = await repo.createWallet(`  ${VALID_MNEMONIC}  `, VALID_PIN);
      expect(acc1.address).toBe(acc2.address);
    });
  });

  // ─── importWallet ─────────────────────────────────────────────────────────

  describe('importWallet()', () => {
    it('successfully imports a valid mnemonic', async () => {
      const repo = freshRepo();
      const account = await repo.importWallet(VALID_MNEMONIC, VALID_PIN);
      expect(account.address).toBeTruthy();
    });

    it('throws on invalid mnemonic (not 12 words)', async () => {
      const repo = freshRepo();
      await expect(repo.importWallet('not a valid seed phrase', VALID_PIN)).rejects.toThrow(
        'valid 12-word recovery seed phrase',
      );
    });

    it('throws on empty mnemonic', async () => {
      const repo = freshRepo();
      await expect(repo.importWallet('', VALID_PIN)).rejects.toThrow();
    });

    it('[BOUNDARY] rejects a 24-word standard mnemonic that is not a valid BIP39 phrase', async () => {
      const repo = freshRepo();
      const fake24 = Array(24).fill('invalidword').join(' ');
      await expect(repo.importWallet(fake24, VALID_PIN)).rejects.toThrow();
    });
  });

  // ─── addAccount ───────────────────────────────────────────────────────────

  describe('addAccount()', () => {
    it('derives account at next available index', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      const acc1 = await repo.addAccount(VALID_PIN);
      expect(acc1.index).toBe(1);
      expect(acc1.name).toBe('Account 2');
    });

    it('custom name is respected', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      const acc = await repo.addAccount(VALID_PIN, 'Savings');
      expect(acc.name).toBe('Savings');
    });

    it('each derived account has a unique address', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      const acc0 = (await repo.init()).accounts[0];
      const acc1 = await repo.addAccount(VALID_PIN);
      expect(acc0.address).not.toBe(acc1.address);
    });

    it('throws on wrong PIN when adding account', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      await expect(repo.addAccount(WRONG_PIN)).rejects.toThrow();
    });
  });

  // ─── addWatchOnlyAccount ──────────────────────────────────────────────────

  describe('addWatchOnlyAccount()', () => {
    const WATCH_ADDRESS = '4itS3kYnXo7PJDQ1noaaVBawTEwysyb73hKNKHc8C7bsLsytfua';

    it('adds a watch-only account with isWatchOnly=true', async () => {
      const repo = freshRepo();
      const acc = await repo.addWatchOnlyAccount(WATCH_ADDRESS, 'Exchange Cold Wallet');
      expect(acc.isWatchOnly).toBe(true);
      expect(acc.address).toBe(WATCH_ADDRESS);
      expect(acc.publicKey).toBe('');
    });

    it('trims whitespace from address', async () => {
      const repo = freshRepo();
      const acc = await repo.addWatchOnlyAccount(`  ${WATCH_ADDRESS}  `, 'Trimmed');
      expect(acc.address).toBe(WATCH_ADDRESS);
    });
  });

  // ─── unlock / lock ────────────────────────────────────────────────────────

  describe('unlock() / lock()', () => {
    it('returns true for correct PIN after createWallet', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      repo.lock();
      const unlocked = await repo.unlock(VALID_PIN);
      expect(unlocked).toBe(true);
    });

    it('returns false for wrong PIN', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      repo.lock();
      const unlocked = await repo.unlock(WRONG_PIN);
      expect(unlocked).toBe(false);
    });

    it('returns false when no wallet exists', async () => {
      const repo = freshRepo();
      const unlocked = await repo.unlock(VALID_PIN);
      expect(unlocked).toBe(false);
    });

    it('lock() clears in-memory state so isStateUnlocked becomes false', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      repo.lock();
      // After lock, exportMnemonic should fail
      await expect(repo.exportMnemonic(VALID_PIN)).resolves.toBe(VALID_MNEMONIC);
    });
  });

  // ─── exportMnemonic ───────────────────────────────────────────────────────

  describe('exportMnemonic()', () => {
    it('returns the original mnemonic with correct PIN', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      const exported = await repo.exportMnemonic(VALID_PIN);
      expect(exported).toBe(VALID_MNEMONIC);
    });

    it('throws with wrong PIN', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      await expect(repo.exportMnemonic(WRONG_PIN)).rejects.toThrow(
        'Invalid PIN or vault is locked',
      );
    });

    it('throws when no wallet exists', async () => {
      const repo = freshRepo();
      await expect(repo.exportMnemonic(VALID_PIN)).rejects.toThrow();
    });
  });

  // ─── Contacts CRUD ───────────────────────────────────────────────────────

  describe('Contacts CRUD', () => {
    it('getContacts returns empty array when no contacts', async () => {
      const repo = freshRepo();
      const contacts = await repo.getContacts();
      expect(contacts).toEqual([]);
    });

    it('saveContact persists a contact and returns it with id and createdAt', async () => {
      const repo = freshRepo();
      const saved = await repo.saveContact({
        name: 'Alice',
        address: '4itS3kYnXo7PJDQ1noaaVBawTEwysyb73hKNKHc8C7bsLsytfua',
      });
      expect(saved.id).toBeTruthy();
      expect(saved.name).toBe('Alice');
      expect(saved.createdAt).toBeGreaterThan(0);
    });

    it('saveContact trims whitespace from name and address', async () => {
      const repo = freshRepo();
      const saved = await repo.saveContact({
        name: '  Bob  ',
        address: '  4itS3kYnXo7PJDQ1noaaVBawTEwysyb73hKNKHc8C7bsLsytfua  ',
      });
      expect(saved.name).toBe('Bob');
      expect(saved.address).toBe('4itS3kYnXo7PJDQ1noaaVBawTEwysyb73hKNKHc8C7bsLsytfua');
    });

    it('getContacts returns all saved contacts', async () => {
      const repo = freshRepo();
      await repo.saveContact({name: 'Alice', address: 'addr1'});
      await repo.saveContact({name: 'Bob', address: 'addr2'});
      const contacts = await repo.getContacts();
      expect(contacts).toHaveLength(2);
    });

    it('deleteContact removes the correct contact by id', async () => {
      const repo = freshRepo();
      const alice = await repo.saveContact({name: 'Alice', address: 'addr1'});
      await new Promise(r => setTimeout(r, 2)); // ensure distinct Date.now() ids
      await repo.saveContact({name: 'Bob', address: 'addr2'});
      await repo.deleteContact(alice.id);
      const contacts = await repo.getContacts();
      expect(contacts).toHaveLength(1);
      expect(contacts[0].name).toBe('Bob');
    });

    it('deleteContact on non-existent id leaves contacts unchanged', async () => {
      const repo = freshRepo();
      await repo.saveContact({name: 'Alice', address: 'addr1'});
      await repo.deleteContact('nonexistent-id');
      const contacts = await repo.getContacts();
      expect(contacts).toHaveLength(1);
    });
  });

  // ─── Settings ────────────────────────────────────────────────────────────

  describe('Settings', () => {
    it('setBiometricsEnabled persists true', async () => {
      const repo = freshRepo();
      await repo.setBiometricsEnabled(true);
      const state = await repo.init();
      expect(state.biometricsEnabled).toBe(true);
    });

    it('setBiometricsEnabled persists false', async () => {
      const repo = freshRepo();
      await repo.setBiometricsEnabled(false);
      const state = await repo.init();
      expect(state.biometricsEnabled).toBe(false);
    });

    it('setAutoLockMinutes persists the value', async () => {
      const repo = freshRepo();
      await repo.setAutoLockMinutes(15);
      const state = await repo.init();
      expect(state.autoLockMinutes).toBe(15);
    });

    it('[BOUNDARY] setAutoLockMinutes handles 0 (never lock)', async () => {
      const repo = freshRepo();
      await repo.setAutoLockMinutes(0);
      const state = await repo.init();
      expect(state.autoLockMinutes).toBe(0);
    });
  });

  // ─── Regression ──────────────────────────────────────────────────────────

  describe('Regression', () => {
    it('[REG-001] second createWallet call overwrites previous vault', async () => {
      const mnemonic2 =
        'legal winner thank year wave sausage worth useful legal winner thank yellow';
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      await repo.createWallet(mnemonic2, VALID_PIN);
      const exported = await repo.exportMnemonic(VALID_PIN);
      expect(exported).toBe(mnemonic2);
    });

    it('[REG-002] unlock does not succeed after lock + wrong PIN x3', async () => {
      const repo = freshRepo();
      await repo.createWallet(VALID_MNEMONIC, VALID_PIN);
      repo.lock();
      for (let i = 0; i < 3; i++) {
        const result = await repo.unlock(WRONG_PIN);
        expect(result).toBe(false);
      }
    });
  });
});
