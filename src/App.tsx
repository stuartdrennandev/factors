import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { TrackerPage } from './pages/TrackerPage';
import { InsightsPage } from './pages/InsightsPage';
import type { DailyEntry } from './types';

type View = 'landing' | 'tracker' | 'insights';

function App() {
  const [view, setView] = useState<View>('landing');
  const [insightsEntries, setInsightsEntries] = useState<DailyEntry[]>([]);

  const handleOpenInsights = (entries: DailyEntry[]) => {
    setInsightsEntries(entries);
    setView('insights');
  };

  return (
    <>
      {view === 'landing' && <LandingPage onEnter={() => setView('tracker')} />}
      {view === 'tracker' && (
        <TrackerPage
          onBack={() => setView('landing')}
          onOpenInsights={handleOpenInsights}
        />
      )}
      {view === 'insights' && (
        <InsightsPage
          entries={insightsEntries}
          onBack={() => setView('tracker')}
        />
      )}
    </>
  );
}

export default App;

