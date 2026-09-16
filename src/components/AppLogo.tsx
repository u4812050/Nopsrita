import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20 rounded-2xl',
    '2xl': 'w-36 h-36 sm:w-44 sm:h-44 rounded-3xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5.5 h-5.5',
    lg: 'w-7.5 h-7.5',
    xl: 'w-12 h-12',
    '2xl': 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const containerSize = sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-900 border border-cyan-300/70 shadow-[0_0_25px_rgba(20,184,166,0.6)] overflow-hidden ${size !== 'xl' && size !== '2xl' ? 'rounded-xl' : ''} ${containerSize} ${className}`}>
      {/* Glow backdrop behind logo */}
      <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-emerald-400/20 to-cyan-300/35 pointer-events-none" />
      
      {/* Radial highlight spot */}
      <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 bg-cyan-200/20 rounded-full blur-md pointer-events-none" />

      <svg className={`${iconSizes[size]} relative z-10`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glowing Red Heart */}
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          className="fill-rose-600/60 stroke-rose-400 animate-pulse"
          strokeWidth={size === '2xl' ? '1.5' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0px 0px 8px rgba(244, 63, 94, 0.95))' }}
        />
        {/* Glowing Golden Yellow ECG Waveform */}
        <path
          d="M2 12h4l1.5-3.5 2.5 7.5 2.5-10 2 6 1.5-2h6"
          className="stroke-amber-300"
          strokeWidth={size === '2xl' ? '1.9' : '2.2'}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0px 0px 8px rgba(251, 191, 36, 1))' }}
        />
      </svg>
    </div>
  );
};

