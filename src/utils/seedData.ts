import type { DailyEntry } from '../types';
import { toDateString } from './date';

/**
 * Seed-data generator for the Tinnitus Tracker.
 *
 * Generates 14 consecutive daily entries ending on `today` with realistic,
 * deterministic patterns designed to produce meaningful Spearman correlations:
 *
 *  • Stress  — moderately increases next-day tinnitus  (positive correlation)
 *  • Sleep   — moderately decreases next-day tinnitus  (negative correlation)
 *  • Noise   — weakly increases next-day tinnitus       (weak positive)
 *  • Diet    — near-random, little correlation           (negligible)
 *
 * All values are clamped to the 1–5 integer scale.
 */
export function generateSeedEntries(today: Date = new Date()): DailyEntry[] {
  // Hand-crafted 14-day sequences that produce clear lag correlations.
  //
  // Stress rises over the first week then drops → tinnitus follows a day later.
  // Sleep mirrors stress inversely.
  // Noise has a mild upward trend mid-period.
  // Diet bounces around with no strong pattern.
  const stress =         [2, 3, 4, 5, 4, 5, 4, 3, 2, 1, 2, 3, 4, 3];
  const sleep =          [4, 4, 3, 2, 2, 1, 2, 3, 4, 5, 4, 3, 2, 3];
  const noiseExposure =  [2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 3, 3, 4, 3];
  const diet =           [3, 4, 2, 3, 5, 2, 4, 3, 2, 4, 3, 5, 2, 3];
  // Tinnitus: high when previous-day stress was high / sleep was low.
  const tinnitus =       [3, 3, 4, 4, 5, 5, 4, 4, 3, 2, 2, 3, 4, 4];

  const entries: DailyEntry[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    entries.push({
      date: toDateString(d),
      stress: stress[i],
      sleep: sleep[i],
      noiseExposure: noiseExposure[i],
      diet: diet[i],
      tinnitus: tinnitus[i],
    });
  }
  return entries;
}
