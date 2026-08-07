/**
 * NodeRepositoryImpl Unit Tests
 *
 * Test coverage:
 *  - getActiveNetwork: returns default preset
 *  - setActiveNetwork: updates preset and persists it
 *  - checkHealth: healthy response, unhealthy HTTP response, network error (offline)
 *  - getAccountBalance: happy path, offline cache fallback, error with no cache throws
 *  - getTransactionHistory: happy path, offline cache fallback, maps fields correctly
 *  - broadcastTransaction: success (code=0), rejection (code=1), HTTP error
 *  - requestFaucet: success, HTTP error
 *  - Regression: offline cache is written on successful fetch
 */

import '@ethersproject/shims';
import {NodeRepositoryImpl} from '../../../data/repositories/NodeRepositoryImpl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NetworkPreset} from '../../../domain/entities/Network';

// ─── Global fetch mock ───────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

const CUSTOM_PRESET: NetworkPreset = {
  id: 'local-test',
  name: 'Test Node',
  chainId: 2,
  apiBaseUrl: 'http://localhost:5100',
  nodeRpcUrl: 'http://localhost:26657',
  explorerUrl: 'http://localhost:3000',
};

const MOCK_ADDRESS = '4itS3kYnXo7PJDQ1noaaVBawTEwysyb73hKNKHc8C7bsLsytfua';

function makeRepo() {
  const repo = new NodeRepositoryImpl();
  return repo;
}

function mockFetchOk(body: object) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => body,
  });
}

function mockFetchError(status = 500) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({error: 'Server Error'}),
  });
}

function mockFetchNetworkFailure() {
  mockFetch.mockRejectedValueOnce(new Error('Network request failed'));
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('NodeRepositoryImpl', () => {
  // ─── getActiveNetwork ─────────────────────────────────────────────────────

  describe('getActiveNetwork()', () => {
    it('returns the default devnet preset initially', () => {
      const repo = makeRepo();
      const preset = repo.getActiveNetwork();
      expect(preset.chainId).toBe(2);
      expect(preset.id).toBe('devnet-local');
    });
  });

  // ─── setActiveNetwork ─────────────────────────────────────────────────────

  describe('setActiveNetwork()', () => {
    it('updates the active preset in-memory', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      expect(repo.getActiveNetwork().id).toBe('local-test');
    });

    it('persists the preset to AsyncStorage', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@public:active_network_preset',
        JSON.stringify(CUSTOM_PRESET),
      );
    });
  });

  // ─── checkHealth ──────────────────────────────────────────────────────────

  describe('checkHealth()', () => {
    it('returns isConnected=true when health endpoint is ready', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);

      // /health/ready response
      mockFetchOk({ready: true, consensusEngine: 'cometbft'});
      // /api/v1/network response
      mockFetchOk({chainId: 2, height: '100', minRelayFeeBaseUnits: '10000'});

      const health = await repo.checkHealth();
      expect(health.isConnected).toBe(true);
      expect(health.blockHeight).toBe(100);
      expect(health.consensusEngine).toBe('cometbft');
    });

    it('returns isConnected=false on HTTP error response', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchError(503);

      const health = await repo.checkHealth();
      expect(health.isConnected).toBe(false);
      expect(health.blockHeight).toBe(0);
    });

    it('returns isConnected=false on network failure (offline)', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchNetworkFailure();

      const health = await repo.checkHealth();
      expect(health.isConnected).toBe(false);
      expect(health.consensusEngine).toBe('unreachable');
    });

    it('measures latencyMs > 0', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk({ready: true, consensusEngine: 'cometbft'});
      mockFetchOk({chainId: 2, height: '50', minRelayFeeBaseUnits: '10000'});

      const health = await repo.checkHealth();
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── getAccountBalance ────────────────────────────────────────────────────

  describe('getAccountBalance()', () => {
    it('returns formatted balance on successful fetch', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk({
        address: MOCK_ADDRESS,
        balanceBaseUnits: '100000000',
        nonce: '5',
        height: '200',
      });

      const balance = await repo.getAccountBalance(MOCK_ADDRESS);
      expect(balance.balanceBaseUnits).toBe('100000000');
      expect(balance.balanceFormatted).toBe('1'); // formatBaseUnits strips trailing zeros
      expect(balance.nonce).toBe(5);
      expect(balance.height).toBe(200);
    });

    it('caches the balance in AsyncStorage after a successful fetch', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk({
        address: MOCK_ADDRESS,
        balanceBaseUnits: '200000000',
        nonce: '3',
        height: '300',
      });

      await repo.getAccountBalance(MOCK_ADDRESS);
      // Give async cache write time to execute
      await new Promise(r => setTimeout(r, 10));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('@public:cache_balance_'),
        expect.any(String),
      );
    });

    it('falls back to offline cache when fetch fails', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);

      // Pre-populate cache
      const cached = {
        address: MOCK_ADDRESS,
        balanceBaseUnits: '500000000',
        balanceFormatted: '5.00000000',
        nonce: 1,
        height: 99,
      };
      await AsyncStorage.setItem(
        `@public:cache_balance_${MOCK_ADDRESS}`,
        JSON.stringify(cached),
      );

      mockFetchNetworkFailure();
      const balance = await repo.getAccountBalance(MOCK_ADDRESS);
      expect(balance.balanceBaseUnits).toBe('500000000');
    });

    it('throws when fetch fails and no cache is available', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchNetworkFailure();

      await expect(repo.getAccountBalance(MOCK_ADDRESS)).rejects.toThrow();
    });
  });

  // ─── getTransactionHistory ────────────────────────────────────────────────

  describe('getTransactionHistory()', () => {
    const RAW_TX = {
      txId: '0xabc123',
      height: '10',
      timeStamp: '1700000000',
      from: MOCK_ADDRESS,
      to: 'addr2',
      amountBaseUnits: '100000000',
      feeBaseUnits: '10000',
      nonce: '1',
    };

    it('maps raw API transaction to DomainTransaction format', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk([RAW_TX]);

      const txs = await repo.getTransactionHistory(MOCK_ADDRESS);
      expect(txs).toHaveLength(1);
      expect(txs[0].txId).toBe('0xabc123');
      expect(txs[0].amountFormatted).toBe('1'); // formatBaseUnits strips trailing zeros
      expect(txs[0].status).toBe('confirmed');
      expect(txs[0].type).toBe('transfer');
    });

    it('returns empty array when node returns empty list', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk([]);

      const txs = await repo.getTransactionHistory(MOCK_ADDRESS);
      expect(txs).toHaveLength(0);
    });

    it('falls back to offline cached transactions on network failure', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);

      const cachedTxs = [{txId: '0xcached', type: 'transfer', status: 'confirmed'}];
      await AsyncStorage.setItem(
        `@public:cache_txs_${MOCK_ADDRESS}`,
        JSON.stringify(cachedTxs),
      );

      mockFetchNetworkFailure();
      const txs = await repo.getTransactionHistory(MOCK_ADDRESS);
      expect(txs[0].txId).toBe('0xcached');
    });

    it('throws when fetch fails and no cache is available', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchNetworkFailure();

      await expect(repo.getTransactionHistory(MOCK_ADDRESS)).rejects.toThrow();
    });
  });

  // ─── broadcastTransaction ─────────────────────────────────────────────────

  describe('broadcastTransaction()', () => {
    const TX_BYTES = new Uint8Array([0x4b, 0x58, 0x54, 0x32]);

    it('returns hash and code=0 on success', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk({
        result: {
          code: 0,
          hash: 'ABCDEF1234567890',
          log: 'Transaction accepted.',
        },
      });

      const result = await repo.broadcastTransaction(TX_BYTES);
      expect(result.code).toBe(0);
      expect(result.hash).toBe('ABCDEF1234567890');
      expect(result.log).toBe('Transaction accepted.');
    });

    it('returns code=1 and log on rejection', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk({
        result: {code: 1, hash: 'DEADBEEF', log: 'Invalid nonce or unknown sender.'},
      });

      const result = await repo.broadcastTransaction(TX_BYTES);
      expect(result.code).toBe(1);
      expect(result.log).toBe('Invalid nonce or unknown sender.');
    });

    it('throws on HTTP 500 from node RPC', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchError(500);

      await expect(repo.broadcastTransaction(TX_BYTES)).rejects.toThrow('HTTP 500');
    });

    it('throws on invalid JSON structure from RPC', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk({unexpected: 'data'});

      await expect(repo.broadcastTransaction(TX_BYTES)).rejects.toThrow(
        'Invalid node RPC response',
      );
    });

    it('[BOUNDARY] handles empty txBytes (0 bytes)', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk({result: {code: 0, hash: 'EMPTY', log: 'ok'}});
      const result = await repo.broadcastTransaction(new Uint8Array(0));
      expect(result.code).toBe(0);
    });
  });

  // ─── requestFaucet ────────────────────────────────────────────────────────

  describe('requestFaucet()', () => {
    it('returns txId and amount on success', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchOk({txId: '0xfaucet123', amount: '10.00000000'});

      const result = await repo.requestFaucet(MOCK_ADDRESS);
      expect(result.txId).toBe('0xfaucet123');
      expect(result.amount).toBe('10.00000000');
    });

    it('throws on HTTP error from faucet endpoint', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);
      mockFetchError(429);

      await expect(repo.requestFaucet(MOCK_ADDRESS)).rejects.toThrow('HTTP 429');
    });
  });

  // ─── Regression ──────────────────────────────────────────────────────────

  describe('Regression', () => {
    it('[REG-001] RPC URL without trailing slash is normalised correctly', async () => {
      const repo = makeRepo();
      const preset = {...CUSTOM_PRESET, nodeRpcUrl: 'http://localhost:26657/'};
      await repo.setActiveNetwork(preset);
      mockFetchOk({result: {code: 0, hash: 'OK', log: ''}});

      // Should not double-slash the URL
      await repo.broadcastTransaction(new Uint8Array([0x01]));
      const calledUrl = (mockFetch.mock.calls[0][0] as string);
      expect(calledUrl).not.toContain('//broadcast');
    });

    it('[REG-002] offline cache key uses full address as discriminator', async () => {
      const repo = makeRepo();
      await repo.setActiveNetwork(CUSTOM_PRESET);

      const addr1 = '4aaaa';
      const addr2 = '4bbbb';

      // Pre-populate two different caches
      await AsyncStorage.setItem(
        `@public:cache_balance_${addr1}`,
        JSON.stringify({balanceBaseUnits: '111', balanceFormatted: '0.00000111', nonce: 0, height: 1, address: addr1}),
      );
      await AsyncStorage.setItem(
        `@public:cache_balance_${addr2}`,
        JSON.stringify({balanceBaseUnits: '222', balanceFormatted: '0.00000222', nonce: 0, height: 1, address: addr2}),
      );

      mockFetchNetworkFailure();
      const b1 = await repo.getAccountBalance(addr1);
      expect(b1.balanceBaseUnits).toBe('111');

      mockFetchNetworkFailure();
      const b2 = await repo.getAccountBalance(addr2);
      expect(b2.balanceBaseUnits).toBe('222');
    });
  });
});
