import React from 'react';

// Mini EKG Waveform Component for VF (Ventricular Fibrillation)
export function VfEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded-lg border border-red-900/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}>
      {/* AHA Red Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="12" y1="0" x2="12" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="24" y1="0" x2="24" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="36" y1="0" x2="36" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="48" y1="0" x2="48" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      {/* High-Contrast Chaotic Coarse VF Waveform */}
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-0 overflow-hidden">
        <defs>
          <filter id="vfGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M0 15 C2 5, 4 25, 7 8 C10 27, 13 2, 16 28 C19 11, 22 23, 25 5 C28 26, 31 12, 34 25 C37 3, 40 27, 43 9 C46 23, 49 10, 52 26 C55 12, 58 20, 60 15"
          fill="none"
          stroke="#ff4d4d"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#vfGlow)"
        />
      </svg>
    </div>
  );
}

// Mini EKG Waveform Component for Pulseless VT (Ventricular Tachycardia)
export function VtEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded-lg border border-slate-700/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}>
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="15" y1="0" x2="15" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="30" y1="0" x2="30" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="45" y1="0" x2="45" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-0 overflow-hidden">
        <path
          d="M0 15 L3 3 L7 27 L11 3 L15 27 L19 3 L23 27 L27 3 L31 27 L35 3 L39 27 L43 3 L47 27 L51 3 L55 27 L60 15"
          fill="none"
          stroke="#f87171"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// Mini EKG Waveform Component for Asystole (Flatline)
export function AsystoleEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded-lg border border-rose-500/60 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-lg shadow-slate-950/50`}>
      {/* Cardiac Monitor Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="10" y1="0" x2="10" y2="30" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="20" y1="0" x2="20" y2="30" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="30" y1="0" x2="30" y2="30" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="40" y1="0" x2="40" y2="30" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="50" y1="0" x2="50" y2="30" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      
      {/* High-Definition Asystole Flatline Waveform with Glow */}
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-0 overflow-hidden">
        <defs>
          <filter id="asystoleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 0 15 L 20 15 Q 23 13.5 26 16.5 L 29 15 L 60 15"
          fill="none"
          stroke="#fb7185"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#asystoleGlow)"
        />
      </svg>
    </div>
  );
}

// Mini EKG Waveform Component for PEA (Pulseless Electrical Activity)
export function PeaEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded-lg border border-cyan-500/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-lg shadow-cyan-950/50`}>
      {/* Cardiac Monitor Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="10" y1="0" x2="10" y2="30" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="20" y1="0" x2="20" y2="30" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="30" y1="0" x2="30" y2="30" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="40" y1="0" x2="40" y2="30" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="50" y1="0" x2="50" y2="30" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      
      {/* High Definition 2-Cycle PEA Waveform with Neon Glow */}
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-0 overflow-hidden">
        <defs>
          <filter id="peaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 0 17 L 3 17 Q 5 12.5 7 17 L 9 17 L 10 19 L 12 2 L 14 26 L 16 17 Q 20 10.5 24 17 L 30 17 Q 32 12.5 34 17 L 36 17 L 37 19 L 39 2 L 41 26 L 43 17 Q 47 10.5 51 17 L 60 17"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#peaGlow)"
        />
      </svg>
      
      {/* High-visibility NO PULSE badge - compact size and position so EKG waveform is clearly visible */}
      <div className="absolute bottom-[2px] right-[2px] bg-rose-600/90 text-white font-black text-[5px] px-0.5 py-[0.5px] rounded-[2px] leading-none z-10 uppercase tracking-tighter border border-rose-400/80 shadow-xs pointer-events-none">
        NO PULSE
      </div>
    </div>
  );
}
