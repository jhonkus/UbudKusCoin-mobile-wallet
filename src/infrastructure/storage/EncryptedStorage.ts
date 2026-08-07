import AsyncStorage from '@react-native-async-storage/async-storage';
import {ethers} from 'ethers';

export class EncryptedStorage {
  private static deriveKey(pin: string, salt = 'ukc-salt-v1'): Uint8Array {
    const hash = ethers.utils.sha256(
      ethers.utils.toUtf8Bytes(`${salt}:${pin}`)
    );
    return ethers.utils.arrayify(hash);
  }

  /* eslint-disable no-bitwise */
  static encrypt(plainText: string, pin: string): string {
    const key = this.deriveKey(pin);
    const textBytes = ethers.utils.toUtf8Bytes(plainText);
    const encrypted = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i += 1) {
      encrypted[i] = textBytes[i] ^ key[i % key.length];
    }
    return ethers.utils.hexlify(encrypted);
  }

  static decrypt(cipherHex: string, pin: string): string {
    const key = this.deriveKey(pin);
    const encryptedBytes = ethers.utils.arrayify(cipherHex);
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i += 1) {
      decrypted[i] = encryptedBytes[i] ^ key[i % key.length];
    }
    return ethers.utils.toUtf8String(decrypted);
  }
  /* eslint-enable no-bitwise */

  static async setSecureItem(key: string, value: string, pin: string): Promise<void> {
    const encrypted = this.encrypt(value, pin);
    await AsyncStorage.setItem(`@encrypted:${key}`, encrypted);
  }

  static async getSecureItem(key: string, pin: string): Promise<string | null> {
    const cipher = await AsyncStorage.getItem(`@encrypted:${key}`);
    if (!cipher) return null;
    try {
      return this.decrypt(cipher, pin);
    } catch {
      return null;
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(`@public:${key}`, value);
  }

  static async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`@public:${key}`);
  }

  static async removeItem(key: string): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(`@encrypted:${key}`),
      AsyncStorage.removeItem(`@public:${key}`),
    ]);
  }
}
