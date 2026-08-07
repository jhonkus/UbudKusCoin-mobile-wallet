/* eslint-env jest */

// ─── Clipboard mock ──────────────────────────────────────────────────────────
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(async () => ''),
}));

// ─── Vision Camera mock ──────────────────────────────────────────────────────
jest.mock(
  'react-native-vision-camera',
  () => ({
    Camera: () => null,
    useCameraDevice: () => null,
    useCodeScanner: () => null,
    useCameraPermission: () => ({hasPermission: false, requestPermission: jest.fn()}),
  }),
  {virtual: true},
);

// ─── AsyncStorage mock ───────────────────────────────────────────────────────
// Variable must be prefixed with "mock" to satisfy Jest's out-of-scope variable rule.
const mockAsyncStorageMap = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key) => mockAsyncStorageMap.get(key) ?? null),
  setItem: jest.fn(async (key, val) => mockAsyncStorageMap.set(key, String(val))),
  removeItem: jest.fn(async (key) => mockAsyncStorageMap.delete(key)),
  clear: jest.fn(async () => mockAsyncStorageMap.clear()),
}));

// ─── Global fetch stub (tests that need fetch must set their own mock) ────────
if (!global.fetch) {
  global.fetch = jest.fn();
}

// ─── Reset between every test ────────────────────────────────────────────────
beforeEach(async () => {
  mockAsyncStorageMap.clear();

  const AsyncStorage = require('@react-native-async-storage/async-storage');
  AsyncStorage.getItem.mockImplementation(async (key) => mockAsyncStorageMap.get(key) ?? null);
  AsyncStorage.setItem.mockImplementation(async (key, val) => mockAsyncStorageMap.set(key, String(val)));
  AsyncStorage.removeItem.mockImplementation(async (key) => mockAsyncStorageMap.delete(key));
  AsyncStorage.clear.mockImplementation(async () => mockAsyncStorageMap.clear());
});
