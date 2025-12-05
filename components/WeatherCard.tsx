import React from 'react';
import { WeatherData } from '../types';

interface WeatherCardProps {
  image: string;
  data: WeatherData;
}

// Icons separated by Day and Night variants where applicable
const WeatherIcons = {
  ClearDay: (
    <svg className="w-full h-full text-yellow-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
    </svg>
  ),
  ClearNight: (
    <svg className="w-full h-full text-indigo-200 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  ),
  CloudyDay: (
    <svg className="w-full h-full text-gray-200 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
       <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
       {/* Small Sun hint behind cloud */}
       <circle cx="14" cy="6" r="2" className="text-yellow-400" fill="currentColor" opacity="0.8"/>
    </svg>
  ),
  CloudyNight: (
    <svg className="w-full h-full text-slate-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
       <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" className="text-indigo-200" opacity="0.5" />
       <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" className="text-gray-200" />
    </svg>
  ),
  Rainy: (
    <svg className="w-full h-full text-blue-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
      <path d="M8 17l-1 3m5-3l-1 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Snowy: (
    <svg className="w-full h-full text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
       <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954-1.582 1.947 4.867-3.955 1.582 3.955 1.582-1.947 4.867L11 13.677V15a1 1 0 11-2 0v-1.323l-3.954 1.582-1.947-4.867 3.955-1.582-3.955-1.582 1.947-4.867L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  Stormy: (
     <svg className="w-full h-full text-slate-600 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
       <path d="M11 14l-3 6h4l-2 4" stroke="yellow" strokeWidth="2" />
       <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
     </svg>
  ),
  Default: (
    <svg className="w-full h-full text-orange-300 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
    </svg>
  )
};

const WeatherCard: React.FC<WeatherCardProps> = ({ image, data }) => {
  let Icon = WeatherIcons.Default;
  
  if (data.iconDescription.includes('Sunny') || data.iconDescription.includes('Clear')) {
    Icon = data.isDay ? WeatherIcons.ClearDay : WeatherIcons.ClearNight;
  }
  else if (data.iconDescription.includes('Cloud')) {
    Icon = data.isDay ? WeatherIcons.CloudyDay : WeatherIcons.CloudyNight;
  }
  else if (data.iconDescription.includes('Rain')) {
    Icon = WeatherIcons.Rainy;
  }
  else if (data.iconDescription.includes('Snow')) {
    Icon = WeatherIcons.Snowy;
  }
  else if (data.iconDescription.includes('Storm')) {
    Icon = WeatherIcons.Stormy;
  }

  const isSameName = data.cityNativeName.toLowerCase() === data.cityName.toLowerCase();

  return (
    <div className="relative w-full h-full overflow-hidden shadow-2xl bg-[#eef2f5] group">
      {/* 1. The Main Generated Visual */}
      <img 
        src={image} 
        alt={`Isometric view of ${data.cityName}`} 
        className="w-full h-full object-cover animate-fade-in"
      />

      {/* 2. Overlay Layout (Top Center) */}
      <div className="absolute top-0 left-0 w-full h-3/5 bg-gradient-to-b from-white/80 via-white/20 to-transparent pointer-events-none flex flex-col items-center pt-8 px-4">
        
        {/* City Name Group */}
        <div className="flex flex-wrap justify-center items-baseline gap-x-3 gap-y-0 mb-2 text-center w-full max-w-[90%]">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 drop-shadow-md tracking-tight leading-none">
              {data.cityNativeName}
            </h1>
            {!isSameName && (
                <h2 className="text-2xl md:text-3xl font-medium text-slate-600 drop-shadow-sm capitalize opacity-90 leading-none">
                  {data.cityName}
                </h2>
            )}
        </div>

        {/* Weather Icon */}
        <div className="w-16 h-16 md:w-20 md:h-20 mb-2 filter drop-shadow-xl animate-float">
          {Icon}
        </div>

        {/* Date */}
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm mb-1">
          {data.date}
        </p>

        {/* Temperature */}
        <p className="text-xl md:text-2xl font-bold text-slate-700 drop-shadow-sm">
          {data.temperature}
        </p>

      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; scale: 1.05; }
          to { opacity: 1; scale: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default React.memo(WeatherCard);