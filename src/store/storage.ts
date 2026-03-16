import type { DailyEntry } from '../types';

const STORAGE_KEY = 'tinnitus-tracker-entries';

export function loadEntries(): DailyEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DailyEntry[];
  } catch {
    return [];
  }
}

export function saveEntry(entry: DailyEntry): void {
  const entries = loadEntries();
  const idx = entries.findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  entries.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getEntryForDate(date: string): DailyEntry | undefined {
  return loadEntries().find((e) => e.date === date);
}

export function getLast14Days(): DailyEntry[] {
  const entries = loadEntries();
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - 13);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return entries.filter((e) => e.date >= cutoffStr);
}
