import type { FactorConfig } from '../types';

export const FACTOR_CONFIGS: FactorConfig[] = [
  {
    key: 'stress',
    label: 'Stress',
    description: 'How stressed did you feel today?',
    icon: '🧠',
    color: 'from-rose-50 to-rose-100 border-rose-200',
    chartColor: '#f43f5e',
    lowLabel: 'Very relaxed',
    highLabel: 'Extremely stressed',
  },
  {
    key: 'diet',
    label: 'Diet',
    description: 'How healthy was your diet today?',
    icon: '🥗',
    color: 'from-emerald-50 to-emerald-100 border-emerald-200',
    chartColor: '#10b981',
    lowLabel: 'Poor diet',
    highLabel: 'Excellent diet',
  },
  {
    key: 'noiseExposure',
    label: 'Noise Exposure',
    description: 'How much noise were you exposed to today?',
    icon: '🔊',
    color: 'from-amber-50 to-amber-100 border-amber-200',
    chartColor: '#f59e0b',
    lowLabel: 'Very quiet',
    highLabel: 'Very loud',
  },
  {
    key: 'sleep',
    label: 'Sleep Quality',
    description: 'How well did you sleep last night?',
    icon: '😴',
    color: 'from-indigo-50 to-indigo-100 border-indigo-200',
    chartColor: '#6366f1',
    lowLabel: 'Very poor sleep',
    highLabel: 'Excellent sleep',
  },
];

export const TINNITUS_CONFIG = {
  key: 'tinnitus' as const,
  label: 'Tinnitus Severity',
  description: 'How severe is your tinnitus today?',
  icon: '👂',
  color: 'from-violet-50 to-violet-100 border-violet-200',
  chartColor: '#8b5cf6',
  lowLabel: 'Barely noticeable',
  highLabel: 'Severely bothersome',
};
