import { describe, it, expect } from 'vitest';
import {
  spearmanCorrelation,
  assignRanks,
  computeInsights,
  buildLagPairs,
  getMissingDates,
} from '../insights';
import type { DailyEntry } from '../../types';

// ─── assignRanks ────────────────────────────────────────────────────────

describe('assignRanks', () => {
  it('assigns ranks to a simple ordered array', () => {
    expect(assignRanks([10, 20, 30])).toEqual([1, 2, 3]);
  });

  it('assigns ranks to a reverse-ordered array', () => {
    expect(assignRanks([30, 20, 10])).toEqual([3, 2, 1]);
  });

  it('assigns average ranks for ties', () => {
    // [10, 20, 20, 30] → ranks [1, 2.5, 2.5, 4]
    expect(assignRanks([10, 20, 20, 30])).toEqual([1, 2.5, 2.5, 4]);
  });

  it('assigns average ranks when all values are tied', () => {
    expect(assignRanks([5, 5, 5, 5])).toEqual([2.5, 2.5, 2.5, 2.5]);
  });

  it('handles a single element', () => {
    expect(assignRanks([42])).toEqual([1]);
  });
});

// ─── spearmanCorrelation ────────────────────────────────────────────────

describe('spearmanCorrelation', () => {
  it('returns 1.0 for perfectly correlated monotonic data', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(spearmanCorrelation(x, y)).toBeCloseTo(1.0, 10);
  });

  it('returns -1.0 for perfectly inversely correlated data', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [10, 8, 6, 4, 2];
    expect(spearmanCorrelation(x, y)).toBeCloseTo(-1.0, 10);
  });

  it('returns NaN for fewer than 3 data points', () => {
    expect(spearmanCorrelation([1, 2], [3, 4])).toBeNaN();
    expect(spearmanCorrelation([1], [2])).toBeNaN();
    expect(spearmanCorrelation([], [])).toBeNaN();
  });

  it('returns NaN when one variable has zero variance (all same)', () => {
    const x = [3, 3, 3, 3];
    const y = [1, 2, 3, 4];
    expect(spearmanCorrelation(x, y)).toBeNaN();
  });

  it('computes a known Spearman correlation value', () => {
    // Classic textbook example:
    // x = [86, 97, 99, 100, 101, 103, 106, 110, 112, 113]
    // y = [0, 20, 28, 27, 50, 29, 7, 17, 6, 12]
    // Expected Spearman ρ ≈ -0.1757575...
    const x = [86, 97, 99, 100, 101, 103, 106, 110, 112, 113];
    const y = [0, 20, 28, 27, 50, 29, 7, 17, 6, 12];
    const result = spearmanCorrelation(x, y);
    expect(result).toBeCloseTo(-0.1758, 2);
  });

  it('handles data with tied values correctly', () => {
    // With ties in x: [1, 2, 2, 3, 4]
    // With y:         [5, 6, 7, 8, 9]
    // Ranks of x: [1, 2.5, 2.5, 4, 5]
    // Ranks of y: [1, 2, 3, 4, 5]
    // Pearson of ranks ≈ 0.9747
    const x = [1, 2, 2, 3, 4];
    const y = [5, 6, 7, 8, 9];
    const result = spearmanCorrelation(x, y);
    expect(result).toBeCloseTo(0.9747, 2);
  });

  it('computes moderate positive correlation', () => {
    // Stress and next-day tinnitus: moderate positive
    const stress = [2, 4, 3, 5, 1, 4, 3];
    const tinnitus = [3, 4, 3, 5, 2, 3, 4];
    const result = spearmanCorrelation(stress, tinnitus);
    expect(result).toBeGreaterThan(0.3);
    expect(result).toBeLessThan(1.0);
  });
});

// ─── buildLagPairs ──────────────────────────────────────────────────────

describe('buildLagPairs', () => {
  const makeEntry = (date: string, vals: Partial<DailyEntry> = {}): DailyEntry => ({
    date,
    stress: 3,
    diet: 3,
    noiseExposure: 3,
    sleep: 3,
    tinnitus: 3,
    ...vals,
  });

  it('pairs consecutive days correctly', () => {
    const entries = [
      makeEntry('2024-01-01', { stress: 4, tinnitus: 2 }),
      makeEntry('2024-01-02', { stress: 2, tinnitus: 5 }),
      makeEntry('2024-01-03', { stress: 5, tinnitus: 1 }),
    ];
    const pairs = buildLagPairs(entries);
    expect(pairs).toHaveLength(2);
    // Day 1 stress → Day 2 tinnitus
    expect(pairs[0].factor.stress).toBe(4);
    expect(pairs[0].nextTinnitus).toBe(5);
    // Day 2 stress → Day 3 tinnitus
    expect(pairs[1].factor.stress).toBe(2);
    expect(pairs[1].nextTinnitus).toBe(1);
  });

  it('skips non-consecutive days', () => {
    const entries = [
      makeEntry('2024-01-01'),
      makeEntry('2024-01-03'), // gap: Jan 2 missing
      makeEntry('2024-01-04'),
    ];
    const pairs = buildLagPairs(entries);
    expect(pairs).toHaveLength(1); // only Jan 3→Jan 4
    expect(pairs[0].factor.date).toBe('2024-01-03');
  });

  it('returns empty for a single entry', () => {
    expect(buildLagPairs([makeEntry('2024-01-01')])).toEqual([]);
  });

  it('returns empty for no entries', () => {
    expect(buildLagPairs([])).toEqual([]);
  });
});

// ─── computeInsights ────────────────────────────────────────────────────

describe('computeInsights', () => {
  it('returns insights sorted by absolute correlation (strongest first)', () => {
    // Create entries where stress has a strong positive correlation with
    // next-day tinnitus, and sleep has a strong negative correlation
    const entries: DailyEntry[] = [
      { date: '2024-01-01', stress: 1, diet: 3, noiseExposure: 3, sleep: 5, tinnitus: 3 },
      { date: '2024-01-02', stress: 2, diet: 3, noiseExposure: 3, sleep: 4, tinnitus: 2 },
      { date: '2024-01-03', stress: 3, diet: 3, noiseExposure: 3, sleep: 3, tinnitus: 3 },
      { date: '2024-01-04', stress: 4, diet: 3, noiseExposure: 3, sleep: 2, tinnitus: 4 },
      { date: '2024-01-05', stress: 5, diet: 3, noiseExposure: 3, sleep: 1, tinnitus: 5 },
      { date: '2024-01-06', stress: 4, diet: 3, noiseExposure: 3, sleep: 2, tinnitus: 4 },
      { date: '2024-01-07', stress: 3, diet: 3, noiseExposure: 3, sleep: 3, tinnitus: 3 },
    ];

    const insights = computeInsights(entries);
    expect(insights).toHaveLength(4);

    // Stress (varying positively) and sleep (varying negatively) should be
    // at the top (highest absolute correlation)
    const stressInsight = insights.find((i) => i.key === 'stress')!;
    const sleepInsight = insights.find((i) => i.key === 'sleep')!;
    const dietInsight = insights.find((i) => i.key === 'diet')!;

    expect(stressInsight.correlation).toBeGreaterThan(0.5);
    expect(stressInsight.direction).toBe('positive');
    expect(sleepInsight.correlation).toBeLessThan(-0.5);
    expect(sleepInsight.direction).toBe('negative');

    // Diet is constant → correlation 0
    expect(dietInsight.correlation).toBe(0);
    expect(dietInsight.strength).toBe('negligible');

    // First result should have highest absolute correlation
    expect(Math.abs(insights[0].correlation)).toBeGreaterThanOrEqual(
      Math.abs(insights[1].correlation)
    );
    expect(Math.abs(insights[1].correlation)).toBeGreaterThanOrEqual(
      Math.abs(insights[2].correlation)
    );
  });

  it('handles too few entries gracefully (returns zero correlations)', () => {
    const entries: DailyEntry[] = [
      { date: '2024-01-01', stress: 3, diet: 3, noiseExposure: 3, sleep: 3, tinnitus: 3 },
      { date: '2024-01-02', stress: 4, diet: 2, noiseExposure: 4, sleep: 2, tinnitus: 4 },
    ];
    const insights = computeInsights(entries);
    // Only 1 lag pair → below 3 minimum → NaN → mapped to 0
    insights.forEach((insight) => {
      expect(insight.correlation).toBe(0);
      expect(insight.strength).toBe('negligible');
    });
  });

  it('returns all 4 factors always', () => {
    const insights = computeInsights([]);
    expect(insights).toHaveLength(4);
    const keys = insights.map((i) => i.key);
    expect(keys).toContain('stress');
    expect(keys).toContain('diet');
    expect(keys).toContain('noiseExposure');
    expect(keys).toContain('sleep');
  });
});

// ─── getMissingDates ────────────────────────────────────────────────────

describe('getMissingDates', () => {
  it('returns all 14 dates when no entries exist', () => {
    const missing = getMissingDates([]);
    expect(missing).toHaveLength(14);
  });

  it('returns empty when all 14 days have entries', () => {
    const today = new Date();
    const entries: DailyEntry[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      entries.push({
        date: dateStr,
        stress: 3,
        diet: 3,
        noiseExposure: 3,
        sleep: 3,
        tinnitus: 3,
      });
    }
    const missing = getMissingDates(entries);
    expect(missing).toHaveLength(0);
  });

  it('correctly identifies specific missing dates', () => {
    const today = new Date();
    const entries: DailyEntry[] = [];
    // Fill all except day -5 and day -10
    for (let i = 13; i >= 0; i--) {
      if (i === 5 || i === 10) continue;
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      entries.push({
        date: dateStr,
        stress: 3,
        diet: 3,
        noiseExposure: 3,
        sleep: 3,
        tinnitus: 3,
      });
    }
    const missing = getMissingDates(entries);
    expect(missing).toHaveLength(2);
  });
});
