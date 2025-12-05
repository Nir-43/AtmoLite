import React from 'react';

const GlassyLoader: React.FC<{ status: string }> = ({ status }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-indigo-50 overflow-hidden">
      
      {/* Background Cloud Elements */}
      <div className="absolute top-10 left-[-50px] w-64 h-64 bg-white/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-[-50px] w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* The "Glassy Balloon" Composition */}
      <div className="relative z-10 animate-bounce-slow">
        {/* Balloon Body */}
        <div className="w-48 h-60 relative">
           {/* Glass Layer */}
           <div className="absolute inset-0 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-br from-white/40 to-blue-500/10 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
              {/* Internal Weather Reflections (Simulated) */}
              <div className="absolute top-4 left-8 w-8 h-4 bg-white/60 rounded-full blur-sm"></div>
              <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl animate-spin-slow"></div>
           </div>
           
           {/* Basket Lines */}
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-12 flex justify-between px-2">
             <div className="w-[1px] h-full bg-slate-400/50"></div>
             <div className="w-[1px] h-full bg-slate-400/50"></div>
           </div>
        </div>

        {/* Basket & "Glassy Man" abstraction */}
        <div className="w-16 h-12 mx-auto mt-[-2px] bg-white/30 backdrop-blur-md rounded-lg border border-white/40 flex items-center justify-center shadow-lg relative">
           {/* Tiny figure representation */}
           <div className="w-4 h-4 bg-indigo-500/30 rounded-full blur-[1px]"></div>
        </div>
      </div>

      <div className="mt-12 text-center z-20">
        <h2 className="text-xl font-semibold text-slate-700 tracking-widest uppercase mb-2">
          Atmolite
        </h2>
        <div className="flex items-center gap-2 justify-center">
             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
        </div>
        <p className="text-sm text-slate-500 mt-2 font-light">{status}</p>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default React.memo(GlassyLoader);