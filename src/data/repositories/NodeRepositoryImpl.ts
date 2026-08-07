import {INodeRepository} from '../../domain/repositories/INodeRepository';
import {AccountBalance} from '../../domain/entities/Account';
import {DomainTransaction} from '../../domain/entities/Transaction';
import {NetworkHealthStatus, NetworkPreset} from '../../domain/entities/Network';
import {EncryptedStorage} from '../../infrastructure/storage/EncryptedStorage';
import {formatBaseUnits, getAccount, getNetwork, getTransactions} from '../../protocol';

const DEFAULT_PRESET: NetworkPreset = {
  id: 'devnet-local',
  name: 'Local Devnet',
  chainId: 2,
  apiBaseUrl: 'http://10.0.2.2:5100',
  nodeRpcUrl: 'http://10.0.2.2:26657',
  explorerUrl: 'http://localhost:3000',
};

const KEYS = {
  ACTIVE_PRESET: 'active_network_preset',
  CACHE_BALANCE: 'cache_balance_',
  CACHE_TXS: 'cache_txs_',
};

export class NodeRepositoryImpl implements INodeRepository {
  private currentPreset: NetworkPreset = DEFAULT_PRESET;

  getActiveNetwork(): NetworkPreset {
    return this.currentPreset;
  }

  async setActiveNetwork(preset: NetworkPreset): Promise<void> {
    this.currentPreset = preset;
    await EncryptedStorage.setItem(KEYS.ACTIVE_PRESET, JSON.stringify(preset));
  }

  async checkHealth(): Promise<NetworkHealthStatus> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.currentPreset.apiBaseUrl}/health/ready`);
      const latencyMs = Date.now() - start;
      if (!response.ok) {
        return {isConnected: false, blockHeight: 0, consensusEngine: 'offline', latencyMs};
      }
      const json = await response.json();
      const net = await getNetwork(this.currentPreset.apiBaseUrl).catch(() => null);
      return {
        isConnected: Boolean(json.ready),
        blockHeight: Number(net?.height ?? 0),
        consensusEngine: String(json.consensusEngine ?? 'cometbft'),
        latencyMs,
      };
    } catch {
      return {isConnected: false, blockHeight: 0, consensusEngine: 'unreachable', latencyMs: Date.now() - start};
    }
  }

  async getAccountBalance(address: string): Promise<AccountBalance> {
    try {
      const acc = await getAccount(this.currentPreset.apiBaseUrl, address);
      const balance: AccountBalance = {
        address,
        balanceBaseUnits: String(acc.balanceBaseUnits),
        balanceFormatted: formatBaseUnits(acc.balanceBaseUnits),
        nonce: Number(acc.nonce),
        height: Number(acc.height),
      };
      // Cache offline
      EncryptedStorage.setItem(KEYS.CACHE_BALANCE + address, JSON.stringify(balance)).catch(() => {});
      return balance;
    } catch (error) {
      // Offline fallback
      const cached = await EncryptedStorage.getItem(KEYS.CACHE_BALANCE + address);
      if (cached) return JSON.parse(cached);
      throw error;
    }
  }

  async getTransactionHistory(address: string, limit = 50): Promise<DomainTransaction[]> {
    try {
      const txs = await getTransactions(this.currentPreset.apiBaseUrl, address, limit);
      const mapped: DomainTransaction[] = txs.map(t => ({
        txId: t.txId,
        type: 'transfer',
        height: Number(t.height),
        timeStamp: Number(t.timeStamp),
        from: t.from,
        to: t.to,
        amountBaseUnits: String(t.amountBaseUnits),
        amountFormatted: formatBaseUnits(t.amountBaseUnits),
        feeBaseUnits: String(t.feeBaseUnits),
        feeFormatted: formatBaseUnits(t.feeBaseUnits),
        nonce: Number(t.nonce),
        status: 'confirmed',
      }));
      EncryptedStorage.setItem(KEYS.CACHE_TXS + address, JSON.stringify(mapped)).catch(() => {});
      return mapped;
    } catch (error) {
      const cached = await EncryptedStorage.getItem(KEYS.CACHE_TXS + address);
      if (cached) return JSON.parse(cached);
      throw error;
    }
  }

  async broadcastTransaction(txBytes: Uint8Array): Promise<{hash: string; code: number; log?: string}> {
    const hex = Array.from(txBytes, b => b.toString(16).padStart(2, '0')).join('');
    const separator = this.currentPreset.nodeRpcUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${this.currentPreset.nodeRpcUrl.replace(/\/$/, '')}/broadcast_tx_sync${separator}tx=0x${hex}`);
    if (!response.ok) throw new Error(`Node RPC returned HTTP ${response.status}`);
    const payload = await response.json();
    const res = payload?.result;
    if (!res || typeof res.code !== 'number') throw new Error('Invalid node RPC response');
    return {hash: String(res.hash ?? ''), code: res.code, log: res.log};
  }

  async requestFaucet(address: string): Promise<{txId: string; amount: string}> {
    const response = await fetch(`${this.currentPreset.apiBaseUrl}/api/v1/faucet`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({address}),
    });
    if (!response.ok) throw new Error(`Faucet request failed (HTTP ${response.status})`);
    return response.json();
  }
}
