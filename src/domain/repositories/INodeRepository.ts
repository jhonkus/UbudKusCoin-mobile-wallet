import {AccountBalance} from '../entities/Account';
import {DomainTransaction} from '../entities/Transaction';
import {NetworkHealthStatus, NetworkPreset} from '../entities/Network';

export interface INodeRepository {
  getActiveNetwork(): NetworkPreset;
  setActiveNetwork(preset: NetworkPreset): Promise<void>;
  checkHealth(): Promise<NetworkHealthStatus>;
  getAccountBalance(address: string): Promise<AccountBalance>;
  getTransactionHistory(address: string, limit?: number): Promise<DomainTransaction[]>;
  broadcastTransaction(txBytes: Uint8Array): Promise<{hash: string; code: number; log?: string}>;
  requestFaucet(address: string): Promise<{txId: string; amount: string}>;
}
