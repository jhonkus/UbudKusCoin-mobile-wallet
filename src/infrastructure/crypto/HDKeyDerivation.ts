import {ethers} from 'ethers';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function sha256(value: Uint8Array): Uint8Array {
  return ethers.utils.arrayify(ethers.utils.sha256(value));
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

export class HDKeyDerivation {
  static addressFromPublicKey(compressedPublicKey: string, chainId = 2): string {
    const compressed = ethers.utils.arrayify(compressedPublicKey);
    if (compressed.length !== 33) {
      throw new Error('A 33-byte compressed secp256k1 public key is required.');
    }
    const version = chainId === 1 ? 0x00 : 0x6f;
    const payload = sha256(compressed);
    const body = ethers.utils.concat([new Uint8Array([version]), payload]);
    return base58Encode(
      ethers.utils.concat([body, doubleSha256(body).slice(0, 4)])
    );
  }

  static deriveAccount(mnemonic: string, accountIndex = 0, chainId = 2) {
    const derivationPath = `m/44'/60'/0'/0/${accountIndex}`;
    const wallet = ethers.Wallet.fromMnemonic(mnemonic.trim(), derivationPath);
    const signingKey = new ethers.utils.SigningKey(wallet.privateKey);
    const compressedPublicKey = signingKey.compressedPublicKey;
    const address = this.addressFromPublicKey(compressedPublicKey, chainId);

    return {
      index: accountIndex,
      name: accountIndex === 0 ? 'Main Account' : `Account ${accountIndex + 1}`,
      address,
      publicKey: compressedPublicKey,
      privateKey: wallet.privateKey,
    };
  }
}
