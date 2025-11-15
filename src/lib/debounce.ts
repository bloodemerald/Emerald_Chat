/**
 * Create a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: TArgs) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a throttled function that only invokes func at most once per every wait milliseconds
 */
export function throttle<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
  let lastCall = 0;

  return function executedFunction(...args: TArgs) {
    const now = Date.now();

    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Rate limiter that tracks call frequency and enforces a minimum delay between calls
 */
export class RateLimiter {
  private lastCallTime = 0;
  private queue: Array<() => void> = [];
  private processing = false;

  constructor(private minDelay: number) {}

  async execute<T>(func: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await func();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;

        if (timeSinceLastCall < this.minDelay) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.minDelay - timeSinceLastCall)
          );
        }

        const task = this.queue.shift();
        if (task) {
          this.lastCallTime = Date.now();
          await task();
        }
      }
    } finally {
      this.processing = false;
    }
  }

  clear(): void {
    this.queue = [];
  }

  get queueLength(): number {
    return this.queue.length;
  }
}
