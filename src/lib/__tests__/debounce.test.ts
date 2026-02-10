import { describe, expect, it, mock } from 'bun:test';
import { debounce, throttle } from '@/lib/debounce';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('debounce utilities', () => {
  it('debounce only invokes once with the last value', async () => {
    const fn = mock(() => {});
    const debounced = debounce(fn, 25);

    debounced('first');
    debounced('second');
    debounced('third');

    expect(fn).toHaveBeenCalledTimes(0);

    await sleep(40);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('throttle invokes at most once per wait window', async () => {
    const fn = mock(() => {});
    const throttled = throttle(fn, 25);

    throttled('a');
    throttled('b');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');

    await sleep(40);

    throttled('c');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
  });
});
