import type { DailyEntry, FactorKey } from '../types';

/**
 * Compute Spearman rank‐order correlation between two numeric arrays.
 * Returns NaN when the input is too short (< 3 data points) or has
 * zero variance in either variable (all tied ranks).
 *
 * A minimum of 3 paired observations is required for a meaningful
 * rank correlation (with fewer points the correlation is either
 * undefined or trivially ±1, providing no statistical insight).
 */
export function spearmanCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return NaN;

  const ranksX = assignRanks(x.slice(0, n));
  const ranksY = assignRanks(y.slice(0, n));

  // Use the Pearson correlation of ranks (handles ties correctly)
  return pearson(ranksX, ranksY);
}

/**
 * Assign fractional ranks (average rank for ties) to an array.
 */
export function assignRanks(values: number[]): number[] {
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);

  const ranks = new Array<number>(values.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    // Find the end of the group of ties
    while (j < indexed.length && indexed[j].v === indexed[i].v) {
      j++;
    }
    // Average rank for this tied group (1-based)
    const avgRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      ranks[indexed[k].i] = avgRank;
    }
    i = j;
  }
  return ranks;
}

/**
 * Pearson correlation coefficient between two arrays of numbers.
 */
function pearson(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((s, v) => s + v, 0) / n;
  const meanY = y.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  if (denomX === 0 || denomY === 0) return NaN;
  return num / Math.sqrt(denomX * denomY);
}

export interface FactorInsight {
  key: FactorKey;
  label: string;
  correlation: number;
  direction: 'positive' | 'negative' | 'none';
  strength: 'strong' | 'moderate' | 'weak' | 'negligible';
}

/**
 * Given 14 days of entries, compute the Spearman correlation between each
 * factor and the NEXT day's tinnitus score (1-day lag).
 *
 * Returns factors sorted by absolute correlation (most impactful first).
 */
export function computeInsights(entries: DailyEntry[]): FactorInsight[] {
  // Sort entries by date
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const factorKeys: { key: FactorKey; label: string }[] = [
    { key: 'stress', label: 'Stress' },
    { key: 'diet', label: 'Diet' },
    { key: 'noiseExposure', label: 'Noise Exposure' },
    { key: 'sleep', label: 'Sleep Quality' },
  ];

  // Build consecutive-day pairs for lag analysis
  const pairs = buildLagPairs(sorted);

  return factorKeys
    .map(({ key, label }) => {
      const factorValues = pairs.map((p) => p.factor[key]);
      const tinnitusValues = pairs.map((p) => p.nextTinnitus);
      const corr = spearmanCorrelation(factorValues, tinnitusValues);
      return {
        key,
        label,
        correlation: isNaN(corr) ? 0 : corr,
        direction: classifyDirection(corr),
        strength: classifyStrength(corr),
      };
    })
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

/**
 * Build pairs of (entry[day N], tinnitus[day N+1]) for consecutive days only.
 * The 1-day lag means we pair each day's factor scores with the following
 * day's tinnitus score.
 */
export function buildLagPairs(
  sortedEntries: DailyEntry[]
): { factor: DailyEntry; nextTinnitus: number }[] {
  const pairs: { factor: DailyEntry; nextTinnitus: number }[] = [];
  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const currentDate = new Date(sortedEntries[i].date + 'T00:00:00');
    const nextDate = new Date(sortedEntries[i + 1].date + 'T00:00:00');
    const diffMs = nextDate.getTime() - currentDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    // Only include consecutive days
    if (diffDays === 1) {
      pairs.push({
        factor: sortedEntries[i],
        nextTinnitus: sortedEntries[i + 1].tinnitus,
      });
    }
  }
  return pairs;
}

function classifyDirection(corr: number): 'positive' | 'negative' | 'none' {
  if (isNaN(corr) || Math.abs(corr) < 0.1) return 'none';
  return corr > 0 ? 'positive' : 'negative';
}

function classifyStrength(corr: number): 'strong' | 'moderate' | 'weak' | 'negligible' {
  const abs = Math.abs(corr);
  if (isNaN(corr) || abs < 0.1) return 'negligible';
  if (abs < 0.3) return 'weak';
  if (abs < 0.6) return 'moderate';
  return 'strong';
}

/**
 * Get the list of dates in the past 14 days (including today) that are
 * missing from the entries array.
 */
export function getMissingDates(entries: DailyEntry[]): string[] {
  const today = new Date();
  const entryDates = new Set(entries.map((e) => e.date));
  const missing: string[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = toISODate(d);
    if (!entryDates.has(dateStr)) {
      missing.push(dateStr);
    }
  }
  return missing;
}

/**
 * Format date to YYYY-MM-DD.
 */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
