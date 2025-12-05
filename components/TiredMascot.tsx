import React from 'react';
import { TIRED_MASCOT_URI } from '../assets/tiredMascotData';

interface TiredMascotProps {
  onReset: () => void;
}

const TiredMascot: React.FC<TiredMascotProps> = ({ onReset }) => {
  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden flex flex-col items-center justify-center">
      <img 
        src={TIRED_MASCOT_URI} 
        alt="I'm tired for the day" 
        className="w-full h-full object-cover animate-fade-in"
      />
      <div className="absolute bottom-16 w-full flex justify-center z-10">
        <button 
          onClick={onReset}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full shadow-lg transition-transform active:scale-95 text-sm uppercase tracking-wide"
        >
          Okay, Goodnight
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(TiredMascot);