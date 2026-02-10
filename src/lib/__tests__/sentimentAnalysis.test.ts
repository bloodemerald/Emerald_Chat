import { describe, expect, it, beforeEach } from 'bun:test';
import {
  analyzeSentiment,
  batchAnalyzeSentiment,
  clearSentimentCache,
  getCacheStats,
} from '@/lib/sentimentAnalysis';

describe('sentimentAnalysis', () => {
  beforeEach(() => {
    clearSentimentCache();
  });

  it('returns neutral sentiment for empty message', () => {
    const result = analyzeSentiment('   ');

    expect(result.label).toBe('neutral');
    expect(result.score).toBe(0);
    expect(result.magnitude).toBe(0);
  });

  it('detects positive sentiment and caches normalized key', () => {
    const first = analyzeSentiment('Amazing play GG');
    const second = analyzeSentiment('  amazing play gg  ');

    expect(first.label).toBe('positive');
    expect(second).toEqual(first);
    expect(getCacheStats().size).toBe(1);
  });

  it('handles negation by reducing/flipping sentiment', () => {
    const positive = analyzeSentiment('good');
    const negated = analyzeSentiment('not good');

    expect(positive.score).toBeGreaterThan(0);
    expect(negated.score).toBeLessThan(positive.score);
    expect(negated.label).toBe('negative');
  });

  it('batch analyzes multiple messages in order', () => {
    const results = batchAnalyzeSentiment([
      'love this stream',
      'this is terrible',
      'just watching',
    ]);

    expect(results).toHaveLength(3);
    expect(results[0].label).toBe('positive');
    expect(results[1].label).toBe('negative');
    expect(results[2].label).toBe('neutral');
  });
});
