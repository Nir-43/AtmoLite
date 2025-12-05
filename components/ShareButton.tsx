import React, { useState } from 'react';
import { WeatherData } from '../types';

interface ShareButtonProps {
  weatherData: WeatherData;
  imageUri: string;
  username: string;
  isDarkBackground?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ weatherData, imageUri, username, isDarkBackground = false }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'with' | 'without'>('without');

  const handleShare = async () => {
    // 1. Close modal immediately to return UI control
    setShowModal(false);

    if (!navigator.share) {
      alert("Sharing is not supported on this browser.");
      return;
    }

    setIsSharing(true);

    try {
      // 2. Load Image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUri;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 3. Setup Canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error("Could not get canvas context");

      // 4. Draw Base Image
      ctx.drawImage(img, 0, 0);

      // --- COMPOSITION LAYOUT ---
      const w = canvas.width;
      const h = canvas.height;
      const padding = w * 0.05;

      // Calculate Max Width for text to prevent overlapping with signature
      const maxWidthText = signatureMode === 'with' ? w * 0.60 : w * 0.90;

      // 5. Draw Weather Details (Bottom Left) - Text Only (No Background)
      const boxHeight = h * 0.15;
      const boxX = padding;
      const boxY = h - boxHeight - padding;

      // Text Config
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      
      // Add Strong Drop Shadow to text for readability against complex backgrounds
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // City Name - GOLDEN AMBER
      const fontSizeCity = Math.floor(w * 0.085); 
      ctx.font = `800 ${fontSizeCity}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#FFD700'; 
      ctx.fillText(weatherData.cityNativeName, boxX + padding * 0.5, boxY + boxHeight * 0.3, maxWidthText);

      // Condition & Temp - PALE SKY BLUE
      const fontSizeDetail = Math.floor(w * 0.05);
      ctx.font = `600 ${fontSizeDetail}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#E0F2FE'; 
      ctx.fillText(`${weatherData.temperature} • ${weatherData.condition}`, boxX + padding * 0.5, boxY + boxHeight * 0.6, maxWidthText);
      
      // Date - LIGHT SLATE
      const fontSizeDate = Math.floor(w * 0.035);
      ctx.font = `500 ${fontSizeDate}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#CBD5E1'; 
      ctx.fillText(weatherData.date, boxX + padding * 0.5, boxY + boxHeight * 0.85, maxWidthText);

      // Reset Shadow for subsequent draws if any
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 6. Draw Signature / Branding (Bottom Right)
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const fontSizeSig = Math.floor(w * 0.045);
      ctx.font = `600 ${fontSizeSig}px 'Outfit', sans-serif`;
      
      // Shadow for signature
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#FFFFFF'; 

      if (signatureMode === 'with') {
        const userDisplay = username || "Atmolite user";
        const text = `Capture by ${userDisplay} on Atmolite`;
        ctx.fillText(text, w - padding, h - padding);
      } else {
        // Just the brand name if signature is off
        ctx.fillText("Atmolite", w - padding, h - padding);
      }

      // 7. Export to Blob
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) throw new Error("Failed to create image blob");

      // Sanitize Filename
      const safeCityName = weatherData.cityName.replace(/[^a-zA-Z0-9]/g, '_');
      const file = new File([blob], `Atmolite_${safeCityName}.png`, { type: 'image/png' });

      // 8. Share Payload (Image Only - No Text/Caption)
      const shareData = {
        files: [file]
      };

      // 9. Execute Share
      try {
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          await navigator.share(shareData);
        }
      } catch (shareError) {
        console.warn("Share flow cancelled or failed", shareError);
      }

    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate share image.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      {/* 1. Trigger Button (Below Account Menu) */}
      <div className="absolute top-20 right-4 z-40">
        <button
          onClick={() => setShowModal(true)}
          disabled={isSharing}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 border backdrop-blur-md ${
            isDarkBackground
              ? 'bg-white/20 border-white/40 text-white hover:bg-white/30'
              : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
          }`}
          aria-label="Share city visual"
        >
          {isSharing ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* 2. Modal Overlay */}
      {showModal && (
        <div className="absolute inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-6 animate-slide-up">
            
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Share Visual</h3>
            
            {/* Options */}
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="radio" 
                  name="signature" 
                  className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  checked={signatureMode === 'with'}
                  onChange={() => setSignatureMode('with')}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">With Name Sign</span>
                  <span className="text-[10px] text-slate-400">Adds "Capture by {username || 'User'}"</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="radio" 
                  name="signature" 
                  className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  checked={signatureMode === 'without'}
                  onChange={() => setSignatureMode('without')}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">Without Name Sign</span>
                  <span className="text-[10px] text-slate-400">Clean image only</span>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                Share
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default React.memo(ShareButton);