import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5.5 h-5.5',
    lg: 'w-7.5 h-7.5',
  };

  const containerSize = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-900 rounded-xl border border-cyan-300/70 shadow-[0_0_20px_rgba(20,184,166,0.5)] overflow-hidden ${containerSize} ${className}`}>
      {/* Glow backdrop behind logo */}
      <div className="absolute inset-0 bg-gradient-to-t from-rose-500/15 via-emerald-400/20 to-cyan-300/30 rounded-xl pointer-events-none" />
      
      <svg className={`${iconSizes[size]} relative z-10`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glowing Red Heart */}
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          className="fill-rose-600/50 stroke-rose-400 animate-pulse"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0px 0px 7px rgba(244, 63, 94, 0.95))' }}
        />
        {/* Glowing Golden Yellow ECG Waveform */}
        <path
          d="M2 12h4l1.5-3.5 2.5 7.5 2.5-10 2 6 1.5-2h6"
          className="stroke-amber-300"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0px 0px 7px rgba(251, 191, 36, 1))' }}
        />
      </svg>
    </div>
  );
};

