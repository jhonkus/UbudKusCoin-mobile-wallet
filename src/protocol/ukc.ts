/* eslint-disable no-bitwise */
/**
 * UKC transaction protocol implementation.
 *
 * Binary encoding, hashing, and cryptographic helpers — bitwise operations
 * are intentional and required for byte-level serialization.
 */
import {ethers} from 'ethers';

export const UKC_BASE_UNITS = 100000000n;
export const UKC_TESTNET_CHAIN_ID = 2;
export const UKC_TX_VERSION = 1;
export const UKC_MIN_RELAY_FEE_BASE_UNITS = 10000n;

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function hexBytes(value: string): Uint8Array {
  return ethers.utils.arrayify(value);
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  return ethers.utils.concat(parts) as Uint8Array;
}

function u32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, true);
  return bytes;
}

function u64(value: bigint): Uint8Array {
  if (value < 0n || value > 0xffffffffffffffffn) {
    throw new Error('Unsigned 64-bit value is out of range.');
  }
  const bytes = new Uint8Array(8);
  let remaining = value;
  for (let index = 0; index < 8; index += 1) {
    bytes[index] = Number(remaining & 0xffn);
    remaining >>= 8n;
  }
  return bytes;
}

function lengthPrefixed(value: Uint8Array): Uint8Array {
  return concatBytes(u32(value.length), value);
}

function utf8(value: string): Uint8Array {
  return ethers.utils.toUtf8Bytes(value);
}

function sha256(value: Uint8Array): Uint8Array {
  return hexBytes(ethers.utils.sha256(value));
}

function doubleSha256(value: Uint8Array): Uint8Array {
  return sha256(sha256(value));
}

function base58Encode(value: Uint8Array): string {
  let number = 0n;
  for (const byte of value) {
    number = (number << 8n) | BigInt(byte);
  }

  let encoded = '';
  while (number > 0n) {
    const remainder = Number(number % 58n);
    encoded = ALPHABET[remainder] + encoded;
    number /= 58n;
  }

  for (const byte of value) {
    if (byte !== 0) break;
    encoded = `1${encoded}`;
  }
  return encoded || '1';
}

function base58Decode(value: string): Uint8Array {
  let number = 0n;
  for (const character of value) {
    const digit = ALPHABET.indexOf(character);
    if (digit < 0) throw new Error('Invalid Base58 character.');
    number = number * 58n + BigInt(digit);
  }
  const bytes: number[] = [];
  while (number > 0n) {
    bytes.unshift(Number(number & 0xffn));
    number >>= 8n;
  }
  for (const character of value) {
    if (character !== '1') break;
    bytes.unshift(0);
  }
  return new Uint8Array(bytes);
}

export function addressFromCompressedPublicKey(publicKey: string, chainId = UKC_TESTNET_CHAIN_ID): string {
  const compressed = hexBytes(publicKey);
  if (compressed.length !== 33) throw new Error('A compressed secp256k1 public key is required.');
  const version = chainId === 1 ? 0x00 : 0x6f;
  const payload = sha256(compressed);
  const body = concatBytes(new Uint8Array([version]), payload);
  return base58Encode(concatBytes(body, doubleSha256(body).slice(0, 4)));
}

export function isValidAddress(value: string, chainId = UKC_TESTNET_CHAIN_ID): boolean {
  try {
    const decoded = base58Decode(value);
    const expectedVersion = chainId === 1 ? 0x00 : 0x6f;
    if (decoded.length !== 37 || decoded[0] !== expectedVersion) return false;
    return ethers.utils.hexlify(decoded.slice(-4)) === ethers.utils.hexlify(doubleSha256(decoded.slice(0, -4)).slice(0, 4));
  } catch {
    return false;
  }
}

export function parseAmount(amount: string): bigint {
  const normalized = amount.trim();
  if (!/^\d+(\.\d{1,8})?$/.test(normalized)) throw new Error('Amount must be a decimal UKC value with up to 8 decimals.');
  const [whole, fraction = ''] = normalized.split('.');
  return BigInt(whole) * UKC_BASE_UNITS + BigInt(fraction.padEnd(8, '0'));
}

export function walletAddressFromMnemonic(mnemonic: string, chainId = UKC_TESTNET_CHAIN_ID): string {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic.trim(), 'm/0');
  return addressFromCompressedPublicKey(
    new ethers.utils.SigningKey(wallet.privateKey).compressedPublicKey,
    chainId,
  );
}

function derSignature(r: string, s: string): Uint8Array {
  const integer = (hex: string): Uint8Array => {
    let bytes = hexBytes(hex);
    let first = 0;
    while (first < bytes.length - 1 && bytes[first] === 0) first += 1;
    bytes = bytes.slice(first);
    if ((bytes[0] & 0x80) !== 0) bytes = concatBytes(new Uint8Array([0]), bytes);
    return concatBytes(new Uint8Array([0x02, bytes.length]), bytes);
  };
  const body = concatBytes(integer(r), integer(s));
  return concatBytes(new Uint8Array([0x30, body.length]), body);
}

export interface TransferInput {
  mnemonic: string;
  to: string;
  amount: string;
  fee: string;
  nonce: bigint;
  chainId?: number;
  minFeeBaseUnits?: bigint;
  validFrom?: number;
  validUntil?: number;
}

export interface SignedTransfer {
  bytes: Uint8Array;
  txId: string;
  sender: string;
  recipient: string;
  nonce: bigint;
  amountBaseUnits: bigint;
  feeBaseUnits: bigint;
}

export function createSignedTransfer(input: TransferInput): SignedTransfer {
  const chainId = input.chainId ?? UKC_TESTNET_CHAIN_ID;
  const wallet = ethers.Wallet.fromMnemonic(input.mnemonic.trim(), 'm/0');
  const signingKey = new ethers.utils.SigningKey(wallet.privateKey);
  const publicKey = signingKey.compressedPublicKey;
  const sender = addressFromCompressedPublicKey(publicKey, chainId);
  const amount = parseAmount(input.amount);
  const fee = parseAmount(input.fee);
  if (amount <= 0n) throw new Error('Amount must be greater than zero.');
  if (fee < (input.minFeeBaseUnits ?? UKC_MIN_RELAY_FEE_BASE_UNITS)) {
    throw new Error('Fee is below the network minimum.');
  }

  const recipient = input.to.trim();
  if (!isValidAddress(recipient, chainId)) throw new Error('Recipient is not a valid UKC address.');
  const validFrom = BigInt(input.validFrom ?? 0);
  const validUntil = BigInt(input.validUntil ?? 0);
  const digest = concatBytes(
    u32(UKC_TX_VERSION),
    u32(chainId),
    u32(0),
    u64(input.nonce),
    lengthPrefixed(utf8(sender)),
    lengthPrefixed(utf8(recipient)),
    u64(amount),
    u64(fee),
    u64(0n),
    u64(validFrom),
    u64(validUntil),
    lengthPrefixed(publicKeyBytes(publicKey)),
    lengthPrefixed(new Uint8Array()),
  );
  const txIdBytes = doubleSha256(digest);
  const signed = signingKey.signDigest(ethers.utils.hexlify(txIdBytes));
  const signature = derSignature(signed.r, signed.s);
  const encoded = concatBytes(
    u32(0x3258544b),
    u32(UKC_TX_VERSION),
    u32(chainId),
    u32(0),
    u64(input.nonce),
    lengthPrefixed(utf8(sender)),
    lengthPrefixed(utf8(recipient)),
    u64(amount),
    u64(fee),
    u64(0n),
    u64(validFrom),
    u64(validUntil),
    lengthPrefixed(publicKeyBytes(publicKey)),
    lengthPrefixed(new Uint8Array()),
    lengthPrefixed(signature),
  );
  return {
    bytes: encoded,
    txId: ethers.utils.hexlify(doubleSha256(digest)),
    sender,
    recipient,
    nonce: input.nonce,
    amountBaseUnits: amount,
    feeBaseUnits: fee,
  };
}

function publicKeyBytes(publicKey: string): Uint8Array {
  return hexBytes(publicKey);
}
