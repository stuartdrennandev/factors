import type { DailyEntry } from '../types';
import { MiniChart } from './MiniChart';

interface ScoreCardProps {
  icon: string;
  label: string;
  description: string;
  colorClass: string;
  chartColor: string;
  value: number;
  onChange: (value: number) => void;
  dataKey: keyof DailyEntry;
  history: DailyEntry[];
  lowLabel: string;
  highLabel: string;
}

const SCORE_LABELS: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
};

export function ScoreCard({
  icon,
  label,
  description,
  colorClass,
  chartColor,
  value,
  onChange,
  dataKey,
  history,
  lowLabel,
  highLabel,
}: ScoreCardProps) {
  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  function handleNumber(e: React.ChangeEvent<HTMLInputElement>) {
    const n = Math.min(5, Math.max(1, Number(e.target.value)));
    if (!isNaN(n)) onChange(n);
  }

  const sliderStyle = {
    background: `linear-gradient(to right, ${chartColor} 0%, ${chartColor} ${((value - 1) / 4) * 100}%, #e5e7eb ${((value - 1) / 4) * 100}%, #e5e7eb 100%)`,
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${colorClass} p-5 shadow-sm flex flex-col gap-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-base leading-tight">{label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
        {/* Score badge */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0"
          style={{ backgroundColor: chartColor }}
        >
          {SCORE_LABELS[value]}
        </div>
      </div>

      {/* Slider + number input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20 text-right leading-tight">{lowLabel}</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={value}
            onChange={handleSlider}
            style={sliderStyle}
            className="flex-1 h-1.5 rounded-full cursor-pointer"
          />
          <span className="text-xs text-gray-500 w-20 leading-tight">{highLabel}</span>
        </div>
        <div className="flex justify-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`w-9 h-9 rounded-full font-semibold text-sm transition-all duration-150 border-2 ${
                value === n
                  ? 'text-white border-transparent shadow-md scale-110'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
              style={value === n ? { backgroundColor: chartColor, borderColor: chartColor } : {}}
            >
              {n}
            </button>
          ))}
        </div>
        {/* Hidden number input for accessibility */}
        <input
          type="number"
          min={1}
          max={5}
          value={value}
          onChange={handleNumber}
          className="sr-only"
          aria-label={`${label} score`}
        />
      </div>

      {/* 2-week chart */}
      <div className="border-t border-white/60 pt-3">
        <p className="text-xs font-medium text-gray-500 mb-1">Past 2 weeks</p>
        <MiniChart history={history} dataKey={dataKey} color={chartColor} />
      </div>
    </div>
  );
}
