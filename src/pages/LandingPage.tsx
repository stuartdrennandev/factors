interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-indigo-800 flex flex-col items-center justify-center px-4 text-white">
      {/* Hero */}
      <div className="max-w-2xl text-center mb-12">
        <div className="text-7xl mb-6">👂</div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Tinnitus Tracker
        </h1>
        <p className="text-xl text-indigo-200 leading-relaxed mb-2">
          Understand what's driving your tinnitus — and take back control.
        </p>
      </div>

      {/* Four factors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full mb-12">
        {[
          { icon: '🧠', label: 'Stress', desc: 'Track how stress levels affect your ringing' },
          { icon: '🥗', label: 'Diet', desc: 'See how food choices influence your symptoms' },
          { icon: '🔊', label: 'Noise Exposure', desc: 'Monitor loud environments over time' },
          { icon: '😴', label: 'Sleep', desc: 'Discover how rest impacts your tinnitus' },
        ].map(({ icon, label, desc }) => (
          <div
            key={label}
            className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/20 hover:bg-white/15 transition-colors"
          >
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="font-semibold text-sm mb-1">{label}</h3>
            <p className="text-xs text-indigo-200 leading-snug">{desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4 text-center">How it works</h2>
        <ol className="space-y-3">
          {[
            'Log your daily scores for stress, diet, noise exposure, and sleep — all on a simple 1–5 scale.',
            'Record your tinnitus severity for the day.',
            'View 2-week trend graphs to spot patterns and correlations.',
            'Use your insights to make informed lifestyle changes that reduce your symptoms.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-400/40 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-indigo-100 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <button
        onClick={onEnter}
        className="bg-white text-indigo-900 font-bold text-lg px-10 py-4 rounded-full shadow-xl hover:bg-indigo-50 active:scale-95 transition-all duration-150"
      >
        Start Tracking →
      </button>

      <p className="text-xs text-indigo-300 mt-6">
        Your data is stored locally on your device — nothing is sent to any server.
      </p>
    </div>
  );
}
