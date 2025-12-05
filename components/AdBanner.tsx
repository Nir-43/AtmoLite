import React from 'react';

interface AdBannerProps {
  adUnitId?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ adUnitId = 'TEST-AD-UNIT-ID-12345' }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[50px] bg-slate-100 border-t border-slate-200 z-30 flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center opacity-40">
        <span className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-0.5">
          Advertisement
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          ID: {adUnitId}
        </span>
      </div>
    </div>
  );
};

export default React.memo(AdBanner);