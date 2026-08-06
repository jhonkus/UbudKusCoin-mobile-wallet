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

export async function getAccount(apiBaseUrl: string, address: string): Promise<AccountState> {
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/accounts/${encodeURIComponent(address)}`);
  if (response.status === 404) throw new Error('Sender account was not found on this network.');
  if (!response.ok) throw new Error(`Node API returned HTTP ${response.status}.`);
  return response.json();
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
