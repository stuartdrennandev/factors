import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailyEntry } from '../types';

interface ChartDataPoint {
  date: string;
  value: number | undefined;
}

interface MiniChartProps {
  history: DailyEntry[];
  dataKey: keyof DailyEntry;
  color: string;
}

function formatChartDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildChartData(history: DailyEntry[], dataKey: keyof DailyEntry): ChartDataPoint[] {
  const today = new Date();
  const data: ChartDataPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry = history.find((e) => e.date === dateStr);
    data.push({
      date: formatChartDate(dateStr),
      value: entry ? (entry[dataKey] as number) : undefined,
    });
  }
  return data;
}

export function MiniChart({ history, dataKey, color }: MiniChartProps) {
  const data = buildChartData(history, dataKey);
  const hasData = data.some((d) => d.value !== undefined);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm italic">
        No data yet — start tracking to see your trend
      </div>
    );
  }

  return (
    <div className="h-28 w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            interval={6}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [value, '']}
            labelStyle={{ fontSize: 11 }}
            contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            connectNulls={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
