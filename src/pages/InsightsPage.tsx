import type { DailyEntry } from '../types';
import { FACTOR_CONFIGS } from '../store/constants';
import { computeInsights, getMissingDates } from '../utils/insights';
import type { FactorInsight } from '../utils/insights';

interface InsightsPageProps {
  entries: DailyEntry[];
  onBack: () => void;
}

export function InsightsPage({ entries, onBack }: InsightsPageProps) {
  const insights = computeInsights(entries);
  const missingDates = getMissingDates(entries);
  const hasLimitedData = missingDates.length > 0;

  // Count usable lag pairs
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let pairCount = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const d1 = new Date(sorted[i].date + 'T00:00:00');
    const d2 = new Date(sorted[i + 1].date + 'T00:00:00');
    if (Math.round((d2.getTime() - d1.getTime()) / 86400000) === 1) pairCount++;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            ← Back to Tracker
          </button>
          <h1 className="text-lg font-bold text-gray-900">📊 2-Week Insights</h1>
          <div className="w-20" /> {/* spacer for centering */}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Data quality banner */}
        {hasLimitedData && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Limited Data — {missingDates.length} of 14 days missing
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Insights are based on {pairCount} consecutive day-pairs. Fill in missing days for more reliable results.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Methodology note */}
        <div className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">How This Works</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            We use <strong>Spearman rank correlation</strong> with a <strong>1-day lag</strong> to
            find which factors most influence your next-day tinnitus. A positive correlation means
            higher values of the factor predict worse tinnitus the following day. A negative
            correlation means higher values predict better tinnitus outcomes.
          </p>
        </div>

        {/* Factor rankings */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Factor Impact Ranking</h2>
          {insights.map((insight, index) => (
            <FactorInsightCard key={insight.key} insight={insight} rank={index + 1} />
          ))}
        </div>

        {/* Summary */}
        <InsightsSummary insights={insights} pairCount={pairCount} />
      </main>
    </div>
  );
}

function FactorInsightCard({ insight, rank }: { insight: FactorInsight; rank: number }) {
  const config = FACTOR_CONFIGS.find((c) => c.key === insight.key);
  const icon = config?.icon ?? '📊';

  const strengthBadgeColor = {
    strong: 'bg-red-100 text-red-700 border-red-200',
    moderate: 'bg-orange-100 text-orange-700 border-orange-200',
    weak: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    negligible: 'bg-gray-100 text-gray-500 border-gray-200',
  }[insight.strength];

  const directionIcon =
    insight.direction === 'positive' ? '↑' : insight.direction === 'negative' ? '↓' : '—';

  const directionLabel =
    insight.direction === 'positive'
      ? 'Increases tinnitus'
      : insight.direction === 'negative'
        ? 'Decreases tinnitus'
        : 'No clear effect';

  const barWidth = Math.min(Math.abs(insight.correlation) * 100, 100);
  const barColor = insight.direction === 'positive' ? 'bg-red-400' : insight.direction === 'negative' ? 'bg-emerald-400' : 'bg-gray-300';

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{icon}</span>
            <h3 className="font-semibold text-gray-900">{insight.label}</h3>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${strengthBadgeColor}`}>
              {insight.strength}
            </span>
          </div>

          {/* Correlation bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 w-12 text-right">
              {insight.correlation > 0 ? '+' : ''}{insight.correlation.toFixed(2)}
            </span>
          </div>

          {/* Direction label */}
          <p className="mt-1 text-xs text-gray-500">
            {directionIcon} {directionLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

function InsightsSummary({ insights, pairCount }: { insights: FactorInsight[]; pairCount: number }) {
  const topFactor = insights[0];
  const hasData = pairCount >= 3;

  if (!hasData) {
    return (
      <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm text-center">
        <span className="text-3xl">📉</span>
        <h3 className="mt-2 font-semibold text-gray-900">Not Enough Data Yet</h3>
        <p className="mt-1 text-sm text-gray-600">
          We need at least 4 consecutive days of entries (which yields 3 lag-pairs) to compute meaningful correlations.
          Keep tracking daily for better insights!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-2">📋 Summary</h3>
      <p className="text-sm text-gray-700 leading-relaxed">
        Based on {pairCount} day-pairs of data,{' '}
        {topFactor.strength !== 'negligible' ? (
          <>
            <strong>{topFactor.label}</strong> appears to be the factor with the strongest
            impact on your next-day tinnitus
            {topFactor.direction === 'positive' && (
              <> — higher {topFactor.label.toLowerCase()} levels tend to predict worse tinnitus the following day</>
            )}
            {topFactor.direction === 'negative' && (
              <> — higher {topFactor.label.toLowerCase()} tends to predict better tinnitus outcomes the following day</>
            )}
            . The correlation strength is <strong>{topFactor.strength}</strong> (ρ = {topFactor.correlation.toFixed(2)}).
          </>
        ) : (
          <>
            no factor shows a clear correlation with next-day tinnitus yet.
            Continue logging to build a clearer picture.
          </>
        )}
      </p>
      <p className="mt-3 text-xs text-gray-500">
        ℹ️ Correlations do not prove causation. Use these insights as clues to experiment with lifestyle changes.
      </p>
    </div>
  );
}
