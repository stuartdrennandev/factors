export interface DailyEntry {
  date: string; // ISO date string YYYY-MM-DD
  stress: number; // 1-5
  diet: number; // 1-5
  noiseExposure: number; // 1-5
  sleep: number; // 1-5
  tinnitus: number; // 1-5
}

export type FactorKey = 'stress' | 'diet' | 'noiseExposure' | 'sleep';

export interface FactorConfig {
  key: FactorKey;
  label: string;
  description: string;
  icon: string;
  color: string;
  chartColor: string;
  lowLabel: string;
  highLabel: string;
}
