export interface NetworkPreset {
  id: string;
  name: string;
  chainId: number;
  apiBaseUrl: string;
  nodeRpcUrl: string;
  explorerUrl: string;
  isCustom?: boolean;
}

export interface NetworkHealthStatus {
  isConnected: boolean;
  blockHeight: number;
  consensusEngine: string;
  latencyMs: number;
}
