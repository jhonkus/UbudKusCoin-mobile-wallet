import {ethers} from 'ethers';
import {
  addressFromCompressedPublicKey,
  createSignedTransfer,
  parseAmount,
} from '../ukc';

describe('UKC transaction protocol', () => {
  const mnemonic = 'test test test test test test test test test test test junk';

  test('uses UKC Base58 address format instead of Ethereum address format', () => {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic, 'm/0');
    const address = addressFromCompressedPublicKey(
      new ethers.utils.SigningKey(wallet.privateKey).compressedPublicKey,
    );
    expect(address).not.toMatch(/^0x/);
    expect(address.length).toBeGreaterThan(20);
  });

  test('parses fixed-point amounts without floating point', () => {
    expect(parseAmount('1.00000001')).toBe(100000001n);
    expect(() => parseAmount('0.000000001')).toThrow();
  });

  test('creates a KTX2 transaction with a DER signature', () => {
    const recipientWallet = ethers.Wallet.fromMnemonic(mnemonic, 'm/1');
    const wallet = createSignedTransfer({
      mnemonic,
      to: addressFromCompressedPublicKey(
        new ethers.utils.SigningKey(recipientWallet.privateKey).compressedPublicKey,
      ),
      amount: '1.25',
      fee: '0.0001',
      nonce: 1n,
    });
    expect(wallet.bytes[0]).toBe(0x4b);
    expect(wallet.bytes[1]).toBe(0x58);
    expect(wallet.txId).toMatch(/^0x[0-9a-f]{64}$/);
  });
});
