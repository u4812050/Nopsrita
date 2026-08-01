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

// Mini EKG Waveform Component for Torsades de pointes (Polymorphic VT)
export function TorsadesEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded-lg border border-purple-900/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}>
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="15" y1="0" x2="15" y2="30" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="30" y1="0" x2="30" y2="30" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="45" y1="0" x2="45" y2="30" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-0 overflow-hidden">
        <defs>
          <filter id="torsadesGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 0 15 Q 3 2, 6 28 T 12 15 Q 15 9, 18 21 T 24 15 Q 27 13, 30 17 T 36 15 Q 39 5, 42 25 T 48 15 Q 51 2, 54 28 T 60 15"
          fill="none"
          stroke="#e879f9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#torsadesGlow)"
        />
      </svg>
    </div>
  );
}

// Mini EKG Waveform Component for 1st Degree AV Block (Prolonged PR Interval)
export function FirstDegreeAvBlockIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[7px] font-extrabold text-amber-300 bg-amber-950/90 border border-amber-500/60 px-1 py-0.5 rounded leading-none whitespace-nowrap shrink-0 shadow-xs">
        1° AV Block
      </span>
      <div
        className={`${className} bg-red-50 rounded-lg border border-red-500/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}
        title="1st Degree AV Block (Prolonged Constant PR Interval > 0.20s)"
      >
        <svg viewBox="0 0 240 50" className="w-full h-full relative z-0 overflow-hidden rounded">
          <defs>
            {/* Small ECG grid pattern (1mm equivalent) */}
            <pattern id="avBlockEcgSmallGrid" width="3" height="3" patternUnits="userSpaceOnUse">
              <path d="M 3 0 L 0 0 0 3" fill="none" stroke="#fca5a5" strokeWidth="0.4" opacity="0.85" />
            </pattern>
            {/* Large ECG grid pattern (5mm equivalent) */}
            <pattern id="avBlockEcgLargeGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <rect width="15" height="15" fill="url(#avBlockEcgSmallGrid)" />
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.9" />
            </pattern>
          </defs>
          {/* ECG Red Grid Paper Background */}
          <rect width="240" height="50" fill="#fff7f6" />
          <rect width="240" height="50" fill="url(#avBlockEcgLargeGrid)" />

          {/* Authentic 1st Degree AV Block ECG Line Trace matching reference image */}
          <path
            d="
              M 0 25
              L 3 25
              C 5 25, 6 19.5, 8 19.5 C 10 19.5, 11 25, 13 25
              L 21 25 L 22 28 L 23.5 5 L 25 32 L 26 25
              C 28 25, 30 17, 34 17 C 38 17, 39 25, 41 25
              L 43 25
              C 45 25, 46 19.5, 48 19.5 C 50 19.5, 51 25, 53 25
              L 61 25 L 62 28 L 63.5 5 L 65 32 L 66 25
              C 68 25, 70 17, 74 17 C 78 17, 79 25, 81 25
              L 83 25
              C 85 25, 86 19.5, 88 19.5 C 90 19.5, 91 25, 93 25
              L 101 25 L 102 28 L 103.5 5 L 105 32 L 106 25
              C 108 25, 110 17, 114 17 C 118 17, 119 25, 121 25
              L 123 25
              C 125 25, 126 19.5, 128 19.5 C 130 19.5, 131 25, 133 25
              L 141 25 L 142 28 L 143.5 5 L 145 32 L 146 25
              C 148 25, 150 17, 154 17 C 158 17, 159 25, 161 25
              L 163 25
              C 165 25, 166 19.5, 168 19.5 C 170 19.5, 171 25, 173 25
              L 181 25 L 182 28 L 183.5 5 L 185 32 L 186 25
              C 188 25, 190 17, 194 17 C 198 17, 199 25, 201 25
              L 203 25
              C 205 25, 206 19.5, 208 19.5 C 210 19.5, 211 25, 213 25
              L 221 25 L 222 28 L 223.5 5 L 225 32 L 226 25
              C 228 25, 230 17, 234 17 C 238 17, 239 25, 240 25
            "
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Mini EKG Waveform Component for 2nd Degree AV Block Mobitz II (Dropped QRS)
export function MobitzTwoEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[7px] font-extrabold text-amber-300 bg-amber-950/90 border border-amber-500/60 px-1 py-0.5 rounded leading-none whitespace-nowrap shrink-0 shadow-xs">
        2° Mobitz II
      </span>
      <div
        className={`${className} bg-red-50 rounded-lg border border-red-500/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}
        title="2nd Degree AV Block Mobitz II (Constant PR with Dropped QRS)"
      >
        <svg viewBox="0 0 240 50" className="w-full h-full relative z-0 overflow-hidden rounded">
          <defs>
            {/* Small ECG grid pattern (1mm equivalent) */}
            <pattern id="mobitz2EcgSmallGrid" width="3" height="3" patternUnits="userSpaceOnUse">
              <path d="M 3 0 L 0 0 0 3" fill="none" stroke="#fca5a5" strokeWidth="0.4" opacity="0.85" />
            </pattern>
            {/* Large ECG grid pattern (5mm equivalent) */}
            <pattern id="mobitz2EcgLargeGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <rect width="15" height="15" fill="url(#mobitz2EcgSmallGrid)" />
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.9" />
            </pattern>
          </defs>
          {/* ECG Red Grid Paper Background */}
          <rect width="240" height="50" fill="#fff7f6" />
          <rect width="240" height="50" fill="url(#mobitz2EcgLargeGrid)" />

          {/* Authentic Mobitz II ECG Line Trace matching reference image */}
          <path
            d="
              M 0 25
              L 2 25
              C 4 25, 5 19.5, 7 19.5 C 9 19.5, 10 25, 12 25
              L 13 25 L 14 28 L 15.5 5 L 17 32 L 18 25
              C 21 25, 23 18, 26 18 C 29 18, 30 25, 32 25
              L 36 25
              C 38 25, 39 19.5, 41 19.5 C 43 19.5, 44 25, 46 25
              L 47 25 L 48 28 L 49.5 5 L 51 32 L 52 25
              C 55 25, 57 18, 60 18 C 63 18, 64 25, 66 25
              L 70 25
              C 72 25, 73 19.5, 75 19.5 C 77 19.5, 78 25, 80 25
              L 81 25 L 82 28 L 83.5 5 L 85 32 L 86 25
              C 89 25, 91 18, 94 18 C 97 18, 98 25, 100 25
              L 110 25
              C 112 25, 113.5 19.5, 115.5 19.5 C 117.5 19.5, 119 25, 121 25
              L 142 25
              C 144 25, 145 19.5, 147 19.5 C 149 19.5, 150 25, 152 25
              L 153 25 L 154 28 L 155.5 5 L 157 32 L 158 25
              C 161 25, 163 18, 166 18 C 169 18, 170 25, 172 25
              L 176 25
              C 178 25, 179 19.5, 181 19.5 C 183 19.5, 184 25, 186 25
              L 187 25 L 188 28 L 189.5 5 L 191 32 L 192 25
              C 195 25, 197 18, 200 18 C 203 18, 204 25, 206 25
              L 210 25
              C 212 25, 213 19.5, 215 19.5 C 217 19.5, 218 25, 220 25
              L 221 25 L 222 28 L 223.5 5 L 225 32 L 226 25
              C 229 25, 231 18, 234 18 C 237 18, 238 25, 240 25
            "
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Mini EKG Waveform Component for 3rd Degree AV Block / Complete Heart Block (CHB)
export function CompleteHeartBlockEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[7px] font-extrabold text-amber-300 bg-amber-950/90 border border-amber-500/60 px-1 py-0.5 rounded leading-none whitespace-nowrap shrink-0 shadow-xs">
        3° AV Block / CHB
      </span>
      <div
        className={`${className} bg-red-50 rounded-lg border border-red-500/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}
        title="3rd Degree AV Block / Complete Heart Block (AV Dissociation)"
      >
        <svg viewBox="0 0 220 50" className="w-full h-full relative z-0 overflow-hidden rounded">
          <defs>
            {/* Small ECG grid pattern (1mm equivalent) */}
            <pattern id="chbEcgSmallGrid" width="3" height="3" patternUnits="userSpaceOnUse">
              <path d="M 3 0 L 0 0 0 3" fill="none" stroke="#fca5a5" strokeWidth="0.4" opacity="0.85" />
            </pattern>
            {/* Large ECG grid pattern (5mm equivalent) */}
            <pattern id="chbEcgLargeGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <rect width="15" height="15" fill="url(#chbEcgSmallGrid)" />
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.9" />
            </pattern>
          </defs>
          {/* ECG Red Grid Paper Background */}
          <rect width="220" height="50" fill="#fff7f6" />
          <rect width="220" height="50" fill="url(#chbEcgLargeGrid)" />

          {/* Authentic Complete Heart Block ECG Line Trace matching reference image */}
          <path
            d="
              M 0 25
              L 12 25
              C 14 25, 15 19.5, 17 19.5 C 19 19.5, 20 25, 22 25
              L 29 25
              L 31 27
              L 33 5
              L 36 38
              L 38 25
              C 40 25, 42 20.5, 44 20.5 C 46 20.5, 47 25, 48 25
              L 41 25
              C 43 25, 44.5 19.5, 46.5 19.5 C 48.5 19.5, 50 25, 52 25
              L 69 25
              C 71 25, 72.5 19.5, 74.5 19.5 C 76.5 19.5, 78 25, 80 25
              L 97 25
              C 99 25, 100.5 19.5, 102.5 19.5 C 104.5 19.5, 106 25, 108 25
              L 109 25
              L 110.5 27
              L 112 5
              L 115 38
              L 117 25
              C 119 25, 121 20.5, 123 20.5 C 125 20.5, 126 25, 127 25
              L 125 25
              C 127 25, 128.5 19.5, 130.5 19.5 C 132.5 19.5, 134 25, 136 25
              L 153 25
              C 155 25, 156.5 19.5, 158.5 19.5 C 160.5 19.5, 162 25, 164 25
              L 181 25
              C 183 25, 184.5 19.5, 186.5 19.5 C 188.5 19.5, 190 25, 192 25
              L 188 25
              L 189.5 27
              L 191 5
              L 194 38
              L 196 25
              C 198 25, 200 20.5, 202 20.5 C 204 20.5, 205 25, 206 25
              L 209 25
              C 211 25, 212.5 19.5, 214.5 19.5 C 216.5 19.5, 218 25, 220 25
            "
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Mini EKG Waveform Component for SVT (Supraventricular Tachycardia)
export function SvtEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[7px] font-extrabold text-cyan-300 bg-cyan-950/90 border border-cyan-500/60 px-1 py-0.5 rounded leading-none whitespace-nowrap shrink-0 shadow-xs">
        SVT
      </span>
      <div
        className={`${className} bg-red-50 rounded-lg border border-red-500/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}
        title="Supraventricular Tachycardia (SVT) - Narrow Regular Rapid Tachycardia"
      >
        <svg viewBox="0 0 240 50" className="w-full h-full relative z-0 overflow-hidden rounded">
          <defs>
            {/* Small ECG grid pattern (1mm equivalent) */}
            <pattern id="svtEcgSmallGrid" width="3" height="3" patternUnits="userSpaceOnUse">
              <path d="M 3 0 L 0 0 0 3" fill="none" stroke="#fca5a5" strokeWidth="0.4" opacity="0.85" />
            </pattern>
            {/* Large ECG grid pattern (5mm equivalent) */}
            <pattern id="svtEcgLargeGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <rect width="15" height="15" fill="url(#svtEcgSmallGrid)" />
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.9" />
            </pattern>
          </defs>
          {/* ECG Red Grid Paper Background */}
          <rect width="240" height="50" fill="#fff7f6" />
          <rect width="240" height="50" fill="url(#svtEcgLargeGrid)" />

          {/* Authentic SVT ECG Line Trace matching reference image */}
          <path
            d="
              M 0 31
              L 3 31 L 4 33 L 5 7 L 6.5 35 L 7.5 31
              C 9 31, 10 26, 12 26 C 14 26, 15 31, 17 31
              L 18 31 L 19 33 L 20 7 L 21.5 35 L 22.5 31
              C 24 31, 25 26, 27 26 C 29 26, 30 31, 32 31
              L 33 31 L 34 33 L 35 7 L 36.5 35 L 37.5 31
              C 39 31, 40 26, 42 26 C 44 26, 45 31, 47 31
              L 48 31 L 49 33 L 50 7 L 51.5 35 L 52.5 31
              C 54 31, 55 26, 57 26 C 59 26, 60 31, 62 31
              L 63 31 L 64 33 L 65 7 L 66.5 35 L 67.5 31
              C 69 31, 70 26, 72 26 C 74 26, 75 31, 77 31
              L 78 31 L 79 33 L 80 7 L 81.5 35 L 82.5 31
              C 84 31, 85 26, 87 26 C 89 26, 90 31, 92 31
              L 93 31 L 94 33 L 95 7 L 96.5 35 L 97.5 31
              C 99 31, 100 26, 102 26 C 104 26, 105 31, 107 31
              L 108 31 L 109 33 L 110 7 L 111.5 35 L 112.5 31
              C 114 31, 115 26, 117 26 C 119 26, 120 31, 122 31
              L 123 31 L 124 33 L 125 7 L 126.5 35 L 127.5 31
              C 129 31, 130 26, 132 26 C 134 26, 135 31, 137 31
              L 138 31 L 139 33 L 140 7 L 141.5 35 L 142.5 31
              C 144 31, 145 26, 147 26 C 149 26, 150 31, 152 31
              L 153 31 L 154 33 L 155 7 L 156.5 35 L 157.5 31
              C 159 31, 160 26, 162 26 C 164 26, 165 31, 167 31
              L 168 31 L 169 33 L 170 7 L 171.5 35 L 172.5 31
              C 174 31, 175 26, 177 26 C 179 26, 180 31, 182 31
              L 183 31 L 184 33 L 185 7 L 186.5 35 L 187.5 31
              C 189 31, 190 26, 192 26 C 194 26, 195 31, 197 31
              L 198 31 L 199 33 L 200 7 L 201.5 35 L 202.5 31
              C 204 31, 205 26, 207 26 C 209 26, 210 31, 212 31
              L 213 31 L 214 33 L 215 7 L 216.5 35 L 217.5 31
              C 219 31, 220 26, 222 26 C 224 26, 225 31, 227 31
              L 228 31 L 229 33 L 230 7 L 231.5 35 L 232.5 31
              C 234 31, 235 26, 237 26 L 240 31
            "
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Mini EKG Waveform Component for Atrial Flutter (AFlutt)
export function AflutterEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[7px] font-extrabold text-blue-300 bg-blue-950/90 border border-blue-500/60 px-1 py-0.5 rounded leading-none whitespace-nowrap shrink-0 shadow-xs">
        AFlutt
      </span>
      <div
        className={`${className} bg-red-50 rounded-lg border border-red-500/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}
        title="Atrial Flutter (AFlutt) - Sawtooth Flutter Waves"
      >
        <svg viewBox="0 0 240 50" className="w-full h-full relative z-0 overflow-hidden rounded">
          <defs>
            <pattern id="afluttEcgSmallGrid" width="3" height="3" patternUnits="userSpaceOnUse">
              <path d="M 3 0 L 0 0 0 3" fill="none" stroke="#fca5a5" strokeWidth="0.4" opacity="0.85" />
            </pattern>
            <pattern id="afluttEcgLargeGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <rect width="15" height="15" fill="url(#afluttEcgSmallGrid)" />
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.9" />
            </pattern>
          </defs>
          <rect width="240" height="50" fill="#fff7f6" />
          <rect width="240" height="50" fill="url(#afluttEcgLargeGrid)" />

          {/* Sawtooth F-waves with QRS complexes */}
          <path
            d="
              M 0 31
              L 2 31 L 3 33 L 4 7 L 5.5 35 L 6.5 31
              L 12 31 L 16 23 L 20 31 L 24 23 L 28 31 L 32 23 L 36 31 L 40 23 L 44 31 L 46 28
              L 47 31 L 48 33 L 49 7 L 50.5 35 L 51.5 31
              L 57 31 L 61 23 L 65 31 L 69 23 L 73 31 L 77 23 L 81 31 L 85 23 L 89 31 L 91 28
              L 92 31 L 93 33 L 94 7 L 95.5 35 L 96.5 31
              L 102 31 L 106 23 L 110 31 L 114 23 L 118 31 L 122 23 L 126 31 L 130 23 L 134 31 L 136 28
              L 137 31 L 138 33 L 139 7 L 140.5 35 L 141.5 31
              L 147 31 L 151 23 L 155 31 L 159 23 L 163 31 L 167 23 L 171 31 L 175 23 L 179 31 L 181 28
              L 182 31 L 183 33 L 184 7 L 185.5 35 L 186.5 31
              L 192 31 L 196 23 L 200 31 L 204 23 L 208 31 L 212 23 L 216 31 L 220 23 L 224 31 L 226 28
              L 227 31 L 228 33 L 229 7 L 230.5 35 L 231.5 31
              L 236 31 L 240 23
            "
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Mini EKG Waveform Component for Atrial Fibrillation (AFib)
export function AfibEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-[7px] font-extrabold text-purple-300 bg-purple-950/90 border border-purple-500/60 px-1 py-0.5 rounded leading-none whitespace-nowrap shrink-0 shadow-xs">
        AFib
      </span>
      <div
        className={`${className} bg-red-50 rounded-lg border border-red-500/80 p-0.5 relative overflow-hidden isolate flex items-center justify-center shrink-0 shadow-inner`}
        title="Atrial Fibrillation (AFib) - Irregularly Irregular Rhythm with Fibrillatory Baseline"
      >
        <svg viewBox="0 0 240 50" className="w-full h-full relative z-0 overflow-hidden rounded">
          <defs>
            <pattern id="afibEcgSmallGrid" width="3" height="3" patternUnits="userSpaceOnUse">
              <path d="M 3 0 L 0 0 0 3" fill="none" stroke="#fca5a5" strokeWidth="0.4" opacity="0.85" />
            </pattern>
            <pattern id="afibEcgLargeGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <rect width="15" height="15" fill="url(#afibEcgSmallGrid)" />
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.9" />
            </pattern>
          </defs>
          <rect width="240" height="50" fill="#fff7f6" />
          <rect width="240" height="50" fill="url(#afibEcgLargeGrid)" />

          {/* Irregular QRS with fine fibrillatory baseline undulations */}
          <path
            d="
              M 0 30
              C 2 28, 4 32, 6 29 C 8 30, 9 28, 11 30
              L 12 30 L 13 32 L 14 7 L 15.5 35 L 16.5 30
              C 18 28, 20 32, 22 29 C 24 31, 26 28, 28 30 C 30 28, 31 31, 33 29
              L 34 29 L 35 32 L 36 7 L 37.5 35 L 38.5 30
              C 41 28, 43 31, 45 29 C 47 30, 48 28, 50 31 C 52 28, 54 30, 56 28
              C 58 31, 60 28, 62 30 C 64 29, 66 31, 68 28 C 70 30, 71 28, 73 30
              L 74 30 L 75 32 L 76 7 L 77.5 35 L 78.5 30
              C 80 28, 82 31, 84 29 C 86 31, 88 28, 90 30
              L 91 30 L 92 32 L 93 7 L 94.5 35 L 95.5 30
              C 97 28, 99 31, 101 29 C 103 31, 105 28, 107 30 C 109 28, 111 31, 113 29
              C 115 31, 117 28, 119 30 C 121 28, 123 31, 125 29 C 127 30, 129 28, 131 30
              L 132 30 L 133 32 L 134 7 L 135.5 35 L 136.5 30
              C 138 28, 140 31, 142 29 C 144 31, 146 28, 148 30
              L 149 30 L 150 32 L 151 7 L 152.5 35 L 153.5 30
              C 155 28, 157 31, 159 29 C 161 31, 163 28, 165 30 C 167 28, 169 31, 171 29
              C 173 31, 175 28, 177 30 C 179 28, 181 31, 183 29
              L 184 29 L 185 32 L 186 7 L 187.5 35 L 188.5 30
              C 190 28, 192 31, 194 29 C 196 31, 198 28, 200 30
              L 201 30 L 202 32 L 203 7 L 204.5 35 L 205.5 30
              C 207 28, 209 31, 211 29 C 213 31, 215 28, 217 30 C 219 28, 221 31, 223 29
              L 224 29 L 225 32 L 226 7 L 227.5 35 L 228.5 30
              C 230 28, 232 31, 234 29 C 236 30, 238 28, 240 30
            "
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}


