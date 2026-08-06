import {getNetwork} from '../nodeApi';

describe('node API network handshake', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('normalizes canonical chain and fee parameters', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({chainId: 2, height: '12', minRelayFeeBaseUnits: '10000'}),
    })) as unknown as typeof fetch;

    await expect(getNetwork('http://node/')).resolves.toEqual({
      chainId: 2,
      height: '12',
      minRelayFeeBaseUnits: '10000',
    });
  });

  test('rejects malformed network parameters', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({chainId: 0, minRelayFeeBaseUnits: '-1'}),
    })) as unknown as typeof fetch;

    await expect(getNetwork('http://node')).rejects.toThrow(
      'Node API returned invalid network parameters.',
    );
  });
});
