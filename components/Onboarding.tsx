import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }
    onComplete(name.trim());
  };

  return (
    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      
      {/* Brand Logo */}
      <div className="w-28 h-28 mb-4 relative drop-shadow-lg">
         <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="sunGradientOnboard" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDB813" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
              <filter id="cloudShadowOnboard" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1e293b" floodOpacity="0.15" />
              </filter>
            </defs>
            <circle cx="75" cy="45" r="28" fill="url(#sunGradientOnboard)" />
            <g filter="url(#cloudShadowOnboard)">
               <path d="M35 82H85C97.1503 82 107 72.1503 107 60C107 47.8497 97.1503 38 85 38C83.9 38 82.8 38.1 81.8 38.3C78.9 26.6 68.4 18 56 18C41.1 18 28.8 29.3 27.2 43.8C18.1 45.4 11 53.3 11 63C11 73.4934 19.5066 82 30 82H35Z" fill="white" />
            </g>
         </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Atmolite</h1>
      <p className="text-slate-500 mb-8 max-w-[250px]">
        Your personal atmospheric world generator.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="text-left">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
            What should we call you?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full mt-1 px-5 py-3 rounded-xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 text-lg transition-all"
            autoFocus
          />
          {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Start Exploring
        </button>
      </form>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(Onboarding);