import { describe, it, expect } from 'vitest';
import { generateSeedEntries } from '../seedData';
import { computeInsights, buildLagPairs } from '../insights';

// ─── generateSeedEntries ────────────────────────────────────────────────

describe('generateSeedEntries', () => {
  const fixedDate = new Date('2025-01-14T12:00:00');
  const entries = generateSeedEntries(fixedDate);

  it('returns exactly 14 entries', () => {
    expect(entries).toHaveLength(14);
  });

  it('covers 14 consecutive dates ending on the given day', () => {
    expect(entries[0].date).toBe('2025-01-01');
    expect(entries[13].date).toBe('2025-01-14');

    // All consecutive
    for (let i = 1; i < entries.length; i++) {
      const prev = new Date(entries[i - 1].date + 'T00:00:00');
      const curr = new Date(entries[i].date + 'T00:00:00');
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      expect(diffDays).toBe(1);
    }
  });

  it('all values are integers in the 1–5 range', () => {
    for (const e of entries) {
      for (const key of ['stress', 'diet', 'noiseExposure', 'sleep', 'tinnitus'] as const) {
        expect(e[key]).toBeGreaterThanOrEqual(1);
        expect(e[key]).toBeLessThanOrEqual(5);
        expect(Number.isInteger(e[key])).toBe(true);
      }
    }
  });

  it('produces 13 consecutive lag pairs (no gaps)', () => {
    const pairs = buildLagPairs(entries);
    expect(pairs).toHaveLength(13);
  });
});

// ─── seed data produces meaningful insights ─────────────────────────────

describe('seed data insights quality', () => {
  const entries = generateSeedEntries(new Date('2025-01-14T12:00:00'));
  const insights = computeInsights(entries);

  it('stress has a positive correlation with next-day tinnitus', () => {
    const stress = insights.find((i) => i.key === 'stress')!;
    expect(stress.correlation).toBeGreaterThan(0.3);
    expect(stress.direction).toBe('positive');
  });

  it('sleep has a negative correlation with next-day tinnitus', () => {
    const sleep = insights.find((i) => i.key === 'sleep')!;
    expect(sleep.correlation).toBeLessThan(-0.3);
    expect(sleep.direction).toBe('negative');
  });

  it('diet has negligible or weak correlation', () => {
    const diet = insights.find((i) => i.key === 'diet')!;
    expect(Math.abs(diet.correlation)).toBeLessThan(0.4);
  });

  it('stress or sleep is the top-ranked factor', () => {
    const topKey = insights[0].key;
    expect(['stress', 'sleep']).toContain(topKey);
  });
});
