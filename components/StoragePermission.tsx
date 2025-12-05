import React from 'react';

interface StoragePermissionProps {
  onAllow: () => void;
  onDeny: () => void;
}

const StoragePermission: React.FC<StoragePermissionProps> = ({ onAllow, onDeny }) => {
  return (
    <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-slide-up flex flex-col items-center text-center">
        
        {/* Premium Sun & Cloud Logo */}
        <div className="w-28 h-28 mb-6 relative drop-shadow-xl hover:scale-105 transition-transform duration-500">
           <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="sunGradient" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FDB813" />
                  <stop offset="1" stopColor="#F59E0B" />
                </linearGradient>
                <filter id="cloudShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1e293b" floodOpacity="0.15" />
                </filter>
              </defs>
              <circle cx="75" cy="45" r="28" fill="url(#sunGradient)" />
              <g filter="url(#cloudShadow)">
                 <path d="M35 82H85C97.1503 82 107 72.1503 107 60C107 47.8497 97.1503 38 85 38C83.9 38 82.8 38.1 81.8 38.3C78.9 26.6 68.4 18 56 18C41.1 18 28.8 29.3 27.2 43.8C18.1 45.4 11 53.3 11 63C11 73.4934 19.5066 82 30 82H35Z" fill="white" />
              </g>
           </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">Allow Storage Access?</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Atmolite needs permission to store generated city visuals on your device. This saves data and makes the app load instantly when you revisit a city.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onAllow}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg active:scale-95"
          >
            Allow Storage
          </button>
          <button
            onClick={onDeny}
            className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            Don't Allow
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-400 mt-4">
          You can change this anytime in the app's settings.
        </p>

      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(StoragePermission);