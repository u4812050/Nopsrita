import React from 'react';
import { Clock, Heart } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface HeaderBarProps {
  systemTime: string;
  caseActive: boolean;
  caseElapsedSeconds: number;
  cprCycle: number;
  cprSubCycle302: number;
  formatMMSS: (sec: number) => string;
}

export function HeaderBar({
  systemTime,
  caseActive,
  caseElapsedSeconds,
  cprCycle,
  cprSubCycle302,
  formatMMSS,
}: HeaderBarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between shadow-xl shrink-0 h-14 z-30 relative w-full max-w-full overflow-hidden">
      {/* Brand & Emblem */}
      <div className="flex items-center gap-1.5 sm:gap-3 bg-slate-950/40 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-slate-800/80 shadow-inner relative shrink min-w-0">
        <AppLogo size="md" />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h1 className="text-xs xs:text-sm sm:text-base font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 font-mono truncate">
              SMART ACLS COPILOT
            </h1>
          </div>
          <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5 hidden xs:block truncate">
            Critical Care Resuscitation System
          </p>
        </div>
      </div>

      {/* Right Side Key Clinical Counters */}
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        {/* Elapsed Case Time */}
        <div className="flex items-center gap-1 xs:gap-2 bg-slate-950/80 px-1.5 sm:px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
          <div className="text-left">
            <span className="text-[7.5px] sm:text-[8px] uppercase tracking-tight text-slate-400 font-bold block leading-none">
              Case Duration
            </span>
            <span id="total-time" className="text-xs sm:text-base font-mono font-black text-cyan-300 leading-none">
              {caseActive ? formatMMSS(caseElapsedSeconds) : '00:00'}
            </span>
          </div>
        </div>

        {/* CPR Round & Cycle counter */}
        <div className="flex items-center gap-1 xs:gap-2 bg-slate-950/80 px-1.5 sm:px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0 fill-rose-500/20" />
          <div className="text-left">
            <span className="text-[7.5px] sm:text-[8px] uppercase tracking-tight text-slate-400 font-bold block leading-none">
              CPR Cycle
            </span>
            <div className="flex items-baseline gap-0.5 sm:gap-1 leading-none">
              <span className="text-xs sm:text-base font-mono font-black text-rose-400">
                #{cprCycle}
              </span>
              <span className="text-[9px] sm:text-[10px] text-amber-300 font-mono font-bold">
                ({cprSubCycle302}/5)
              </span>
            </div>
          </div>
        </div>

        {/* System Time Clock */}
        <div className="hidden lg:flex items-center justify-center bg-slate-950 text-slate-300 font-mono text-sm px-2.5 py-1 rounded-lg border border-slate-800 font-bold shadow-inner">
          {systemTime || '00:00:00'}
        </div>
      </div>
    </header>
  );
}



