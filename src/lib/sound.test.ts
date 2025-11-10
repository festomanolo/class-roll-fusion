import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { playSound } from './sound';

describe('playSound smoke tests', () => {
  const originalAudio = (global as any).Audio;
  const originalLocalStorage = (global as any).localStorage;

  beforeEach(() => {
    // simple localStorage mock (default: no value -> enabled)
    const store: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: vi.fn((k: string) => (k in store ? store[k] : null)),
      setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
    };
    // Ensure window exists in the test environment and points to our mock
    (global as any).window = (global as any).window || {};
    (global as any).window.localStorage = mockLocalStorage;
  });

  afterEach(() => {
    (global as any).Audio = originalAudio;
    (global as any).localStorage = originalLocalStorage;
    vi.restoreAllMocks();
  });

  it('attempts to play when enabled (default)', async () => {
    // default localStorage.getItem returns null -> enabled
    // create Audio mock AFTER localStorage is in place
    const playMock = vi.fn().mockResolvedValue(undefined);
    (global as any).Audio = vi.fn().mockImplementation(() => ({ play: playMock }));

    await playSound('success');
    expect((global as any).Audio).toHaveBeenCalledTimes(1);
  });

  it('does not play when disabled', async () => {
    // make localStorage return 'false' BEFORE creating Audio mock
  (global as any).window.localStorage.getItem = vi.fn(() => 'false');

    // create Audio mock AFTER localStorage is set to disabled
    const playMock = vi.fn().mockResolvedValue(undefined);
  (global as any).Audio = vi.fn().mockImplementation(() => ({ play: playMock }));

    await playSound('success');

    // When disabled, Audio should not be constructed
    expect((global as any).Audio).toHaveBeenCalledTimes(0);
  });
});
