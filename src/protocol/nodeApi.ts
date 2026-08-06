export interface BroadcastResult {
  code: number;
  hash?: string;
  log?: string;
}

export interface AccountState {
  address: string;
  balanceBaseUnits: string | number;
  nonce: string | number;
  height: string | number;
}

export interface TransactionSummary {
  txId: string;
  height: string | number;
  timeStamp: string | number;
  from: string;
  to: string;
  amountBaseUnits: string | number;
  feeBaseUnits: string | number;
  nonce: string | number;
}

export interface TransactionStatus {
  txId: string;
  status: 'pending' | 'confirmed' | 'rejected';
  message: string;
  height?: string | number | null;
}

export function formatBaseUnits(value: string | number): string {
  const units = BigInt(value);
  const whole = units / 100000000n;
  const fraction = (units % 100000000n).toString().padStart(8, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export async function getAccount(apiBaseUrl: string, address: string): Promise<AccountState> {
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/accounts/${encodeURIComponent(address)}`);
  if (response.status === 404) throw new Error('Sender account was not found on this network.');
  if (!response.ok) throw new Error(`Node API returned HTTP ${response.status}.`);
  return response.json();
}

export async function getTransactions(apiBaseUrl: string, address: string, limit = 50): Promise<TransactionSummary[]> {
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/accounts/${encodeURIComponent(address)}/transactions?limit=${limit}`);
  if (!response.ok) throw new Error(`Node API returned HTTP ${response.status}.`);
  const transactions = await response.json();
  if (!Array.isArray(transactions)) throw new Error('Node API returned an invalid transaction list.');
  return transactions;
}

export async function getTransactionStatus(apiBaseUrl: string, txId: string): Promise<TransactionStatus> {
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/transactions/${encodeURIComponent(txId)}`);
  if (response.status === 404) throw new Error('Transaction status is not available yet.');
  if (!response.ok) throw new Error(`Node API returned HTTP ${response.status}.`);
  return response.json();
}

export async function waitForTransaction(
  apiBaseUrl: string,
  txId: string,
  timeoutMs = 30000,
  intervalMs = 1000,
): Promise<TransactionStatus> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() <= deadline) {
    try {
      const status = await getTransactionStatus(apiBaseUrl, txId);
      if (status.status !== 'pending') return status;
    } catch (error: any) {
      if (!String(error?.message).includes('not available yet')) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return {txId, status: 'pending', message: 'Transaction is still waiting for block confirmation.'};
}

export async function broadcastTransaction(nodeRpcUrl: string, txBytes: Uint8Array): Promise<BroadcastResult> {
  const hex = Array.from(txBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  const separator = nodeRpcUrl.includes('?') ? '&' : '?';
  const response = await fetch(`${nodeRpcUrl.replace(/\/$/, '')}/broadcast_tx_sync${separator}tx=0x${hex}`);
  if (!response.ok) throw new Error(`Node RPC returned HTTP ${response.status}.`);
  const payload = await response.json();
  const result = payload?.result;
  if (!result || typeof result.code !== 'number') throw new Error('Node RPC returned an invalid response.');
  return {code: result.code, hash: result.hash, log: result.log};
}
