import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import type { DailyEntry } from '../types';
import { ScoreCard } from '../components/ScoreCard';
import { MissingDataModal } from '../components/MissingDataModal';
import { saveEntry, getEntryForDate, getLast14Days } from '../store/storage';
import { FACTOR_CONFIGS, TINNITUS_CONFIG } from '../store/constants';
import { toDateString } from '../utils/date';
import { getMissingDates } from '../utils/insights';

function defaultEntry(date: string): DailyEntry {
  return { date, stress: 3, diet: 3, noiseExposure: 3, sleep: 3, tinnitus: 3 };
}

interface TrackerPageProps {
  onBack: () => void;
  onOpenInsights: (entries: DailyEntry[]) => void;
}

export function TrackerPage({ onBack, onOpenInsights }: TrackerPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entry, setEntry] = useState<DailyEntry>(() =>
    getEntryForDate(toDateString(new Date())) ?? defaultEntry(toDateString(new Date()))
  );
  const [history, setHistory] = useState<DailyEntry[]>(() => getLast14Days());
  const [saved, setSaved] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [missingDates, setMissingDates] = useState<string[]>([]);

  function handleDateChange(date: Date | null) {
    if (!date) return;
    setSelectedDate(date);
    const dateStr = toDateString(date);
    setEntry(getEntryForDate(dateStr) ?? defaultEntry(dateStr));
    setSaved(false);
  }

  const updateField = useCallback((field: keyof DailyEntry, value: number) => {
    setEntry((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  function handleSave() {
    saveEntry(entry);
    setHistory(getLast14Days());
    setSaved(true);
  }

  function handleGenerateInsights() {
    const currentEntries = getLast14Days();
    const missing = getMissingDates(currentEntries);
    if (missing.length > 0) {
      setMissingDates(missing);
      setShowMissingModal(true);
    } else {
      onOpenInsights(currentEntries);
    }
  }

  const dateStr = toDateString(selectedDate);
  const isToday = dateStr === toDateString(new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-800 transition-colors text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-xl">👂</span>
            <h1 className="font-bold text-gray-800 text-lg">Tinnitus Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateInsights}
              className="px-4 py-2 rounded-full font-semibold text-sm bg-violet-100 text-violet-700 border border-violet-200 hover:bg-violet-200 transition-all duration-200 cursor-pointer"
            >
              📊 2-Week Insights
            </button>
            <button
              onClick={handleSave}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 cursor-pointer ${
                saved
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md'
              }`}
            >
              {saved ? '✓ Saved' : 'Save Entry'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Date picker section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 mb-1">Select Date</h2>
            <p className="text-sm text-gray-500">
              {isToday ? "Today's entry" : `Entry for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
            </p>
          </div>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              dateFormat="dd MMM yyyy"
              className="border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer bg-gray-50 hover:bg-white transition-colors"
              calendarClassName="shadow-xl rounded-xl border-0"
            />
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              Go to today
            </button>
          )}
        </div>

        {/* Factor cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {FACTOR_CONFIGS.map((config) => (
            <ScoreCard
              key={config.key}
              icon={config.icon}
              label={config.label}
              description={config.description}
              colorClass={config.color}
              chartColor={config.chartColor}
              value={entry[config.key]}
              onChange={(v) => updateField(config.key, v)}
              dataKey={config.key}
              history={history}
              lowLabel={config.lowLabel}
              highLabel={config.highLabel}
            />
          ))}
        </div>

        {/* Tinnitus severity card — full width */}
        <div className="mb-6">
          <ScoreCard
            icon={TINNITUS_CONFIG.icon}
            label={TINNITUS_CONFIG.label}
            description={TINNITUS_CONFIG.description}
            colorClass={TINNITUS_CONFIG.color}
            chartColor={TINNITUS_CONFIG.chartColor}
            value={entry.tinnitus}
            onChange={(v) => updateField('tinnitus', v)}
            dataKey="tinnitus"
            history={history}
            lowLabel={TINNITUS_CONFIG.lowLabel}
            highLabel={TINNITUS_CONFIG.highLabel}
          />
        </div>

        {/* Save button (bottom) */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className={`px-10 py-3 rounded-full font-bold text-base transition-all duration-200 ${
              saved
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg'
            }`}
          >
            {saved ? '✓ Entry Saved!' : 'Save Entry'}
          </button>
        </div>
      </main>

      {/* Missing data modal */}
      {showMissingModal && (
        <MissingDataModal
          missingDates={missingDates}
          onContinue={() => {
            setShowMissingModal(false);
            onOpenInsights(getLast14Days());
          }}
          onCancel={() => setShowMissingModal(false)}
        />
      )}
    </div>
  );
}
