import { useState } from 'react';

interface MissingDataModalProps {
  missingDates: string[];
  onContinue: () => void;
  onCancel: () => void;
}

export function MissingDataModal({ missingDates, onContinue, onCancel }: MissingDataModalProps) {
  const [closing, setClosing] = useState(false);

  const handleContinue = () => {
    setClosing(true);
    setTimeout(onContinue, 150);
  };

  const handleCancel = () => {
    setClosing(true);
    setTimeout(onCancel, 150);
  };

  const today = new Date();
  const twoWeeks: { date: string; label: string; missing: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    twoWeeks.push({
      date: dateStr,
      label: dayLabel,
      missing: missingDates.includes(dateStr),
    });
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-150 ${closing ? 'opacity-0' : 'opacity-100'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Missing data warning"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />

      {/* modal card */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <h2 className="text-lg font-semibold text-gray-900">Missing Data</h2>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          You are missing entries for <strong>{missingDates.length}</strong> of the past 14 days.
          For the most accurate insights, please go back and fill in the missing dates.
        </p>

        {/* 14-day timeline */}
        <div className="mb-4 rounded-xl bg-gray-50 p-4">
          <p className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Past 2 Weeks
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {twoWeeks.map((day) => (
              <div
                key={day.date}
                className={`flex h-12 w-12 flex-col items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  day.missing
                    ? 'border-2 border-red-400 bg-red-50 text-red-600'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
                title={day.missing ? `Missing: ${day.date}` : `Filled: ${day.date}`}
              >
                <span className="leading-tight">{day.label.split(' ')[0]}</span>
                <span className="leading-tight font-bold">{day.label.split(' ')[1]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-red-400 bg-red-50" />
              Missing
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border border-emerald-200 bg-emerald-50" />
              Filled
            </span>
          </div>
        </div>

        <p className="mb-5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          ⚡ Continuing without complete data will reduce the accuracy and usefulness of your insights.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Go Back & Fill Data
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
