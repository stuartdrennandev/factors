import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { TrackerPage } from './pages/TrackerPage';

type View = 'landing' | 'tracker';

function App() {
  const [view, setView] = useState<View>('landing');

  return (
    <>
      {view === 'landing' && <LandingPage onEnter={() => setView('tracker')} />}
      {view === 'tracker' && <TrackerPage onBack={() => setView('landing')} />}
    </>
  );
}

export default App;

