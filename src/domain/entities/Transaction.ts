export type TransactionType = 'transfer' | 'bond' | 'unbond' | 'withdraw';

export interface DomainTransaction {
  txId: string;
  type: TransactionType;
  height: number;
  timeStamp: number;
  from: string;
  to: string;
  amountBaseUnits: string;
  amountFormatted: string;
  feeBaseUnits: string;
  feeFormatted: string;
  nonce: number;
  status: 'pending' | 'confirmed' | 'rejected';
  confirmations?: number;
}
