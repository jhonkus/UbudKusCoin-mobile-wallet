/* eslint-env jest */
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(async () => ''),
}));
// Mock react-native-vision-camera before any screen that imports it is loaded.
// Uses {virtual: true} so the mock works even when the package isn't installed
// in node_modules (e.g. before `yarn install` is run after adding the dep).
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

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    getItem: jest.fn(async (key) => store.get(key) ?? null),
    setItem: jest.fn(async (key, val) => store.set(key, String(val))),
    removeItem: jest.fn(async (key) => store.delete(key)),
    clear: jest.fn(async () => store.clear()),
  };
});


