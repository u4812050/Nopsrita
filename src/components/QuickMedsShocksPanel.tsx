import React from 'react';
import { Zap, ShieldAlert, Heart, Check, Plus, AlertCircle, Clock } from 'lucide-react';
import { VfEkgIcon, VtEkgIcon, AsystoleEkgIcon, PeaEkgIcon } from './EkgIcons';

interface QuickMedsShocksPanelProps {
  hasCompletedIvAccess?: boolean;
  handleAdministerEpinephrine: () => void;
  epiCount: number;
  epiTimeRemaining: number;
  epiTimerStarted: boolean;
  epiAlertActive: boolean;
  handleDeliverShock: () => void;
  shockCount: number;
  handleAdministerAmiodarone: () => void;
  amioCount: number;
  amioAlertActive: boolean;
  handleAdministerLidocaine: () => void;
  lidoCount: number;
  lidoAlertActive: boolean;
  handleRhythmShockable: () => void;
  handleRhythmNonShockable: () => void;
  handleRhythmBradycardia: () => void;
  handleRhythmTachycardia: () => void;
  handleRhythmROSC: () => void;
  lastRhythmDecision: 'shockable' | 'non-shockable' | 'bradycardia' | 'tachycardia' | 'rosc' | null;
  formatMMSS: (sec: number) => string;
  shockButtonFlashing?: boolean;
}

export function QuickMedsShocksPanel({
  hasCompletedIvAccess = false,
  handleAdministerEpinephrine,
  epiCount,
  epiTimeRemaining,
  epiTimerStarted,
  epiAlertActive,
  handleDeliverShock,
  shockCount,
  handleAdministerAmiodarone,
  amioCount,
  amioAlertActive,
  handleAdministerLidocaine,
  lidoCount,
  lidoAlertActive,
  handleRhythmShockable,
  handleRhythmNonShockable,
  handleRhythmBradycardia,
  handleRhythmTachycardia,
  handleRhythmROSC,
  lastRhythmDecision,
  formatMMSS,
  shockButtonFlashing,
}: QuickMedsShocksPanelProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2 shadow-xl shrink-0 sm:-mt-1 max-w-full">
      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className="text-[10px] sm:text-[11px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          Quick Actions & Rhythm Triggers
        </span>
        <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold">AHA Protocol 2025</span>
      </div>

      {/* Rhythm Trigger Buttons */}
      <div className="grid grid-cols-5 gap-1 xs:gap-1.5 -mt-0.5">
        {/* SHOCKABLE Button */}
        <button
          onClick={handleRhythmShockable}
          className={`py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-lg text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center border min-w-0 -mt-1 sm:mt-0 ${
            lastRhythmDecision === 'shockable'
              ? shockButtonFlashing
                ? 'bg-rose-600 text-white border-rose-300 ring-4 ring-rose-500/80 animate-pulse shadow-md'
                : 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400 shadow-md'
              : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] hover:border-rose-400 hover:shadow-[0_0_14px_rgba(244,63,94,0.8)]'
          }`}
        >
          <span className="text-[8px] xs:text-[9px] sm:text-[10px] uppercase font-mono block leading-none truncate w-full">SHOCKABLE</span>
          <span className="text-[7.5px] xs:text-[8.5px] opacity-80 mt-0.5 truncate w-full">VF / pVT</span>
        </button>

        {/* NON-SHOCKABLE Button */}
        <button
          onClick={handleRhythmNonShockable}
          className={`py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-lg text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center border min-w-0 -mt-1 sm:mt-0 ${
            lastRhythmDecision === 'non-shockable'
              ? 'bg-slate-700 text-white border-white ring-2 ring-white/90 shadow-[0_0_16px_rgba(255,255,255,0.85)] animate-pulse'
              : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-white/60 shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:border-white hover:shadow-[0_0_14px_rgba(255,255,255,0.6)]'
          }`}
        >
          <span className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] uppercase font-mono block leading-none tracking-tighter truncate w-full">NON-SHOCKABLE</span>
          <span className="text-[7.5px] xs:text-[8.5px] opacity-80 mt-0.5 truncate w-full">Asystole/PEA</span>
        </button>

        {/* BRADYCARDIA Button */}
        <button
          onClick={handleRhythmBradycardia}
          className={`py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-lg text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center border min-w-0 -mt-1 sm:mt-0 ${
            lastRhythmDecision === 'bradycardia'
              ? 'bg-amber-600 text-white border-amber-300 ring-2 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.9)] animate-pulse'
              : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] hover:border-amber-300 hover:shadow-[0_0_16px_rgba(251,191,36,0.85)]'
          }`}
        >
          <span className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] uppercase font-mono block leading-none tracking-tighter truncate w-full">BRADYCARDIA</span>
          <span className="text-[7.5px] xs:text-[8.5px] opacity-80 mt-0.5 truncate w-full">HR &lt; 50</span>
        </button>

        {/* TACHYCARDIA Button */}
        <button
          onClick={handleRhythmTachycardia}
          className={`py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-lg text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center border min-w-0 -mt-1 sm:mt-0 ${
            lastRhythmDecision === 'tachycardia'
              ? 'bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.9)] animate-pulse'
              : 'bg-purple-950/60 hover:bg-purple-900 text-purple-300 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.6)] hover:border-purple-300 hover:shadow-[0_0_16px_rgba(168,85,247,0.85)]'
          }`}
        >
          <span className="text-[6.5px] xs:text-[7.5px] sm:text-[9px] uppercase font-mono block leading-none tracking-tighter truncate w-full">TACHYCARDIA</span>
          <span className="text-[7.5px] xs:text-[8.5px] opacity-80 mt-0.5 truncate w-full">HR &ge; 150</span>
        </button>

        {/* ROSC Button */}
        <button
          onClick={handleRhythmROSC}
          className={`py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-lg text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center border min-w-0 -mt-1 sm:mt-0 ${
            lastRhythmDecision === 'rosc'
              ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)] animate-pulse'
              : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] hover:border-emerald-300 hover:shadow-[0_0_16px_rgba(52,211,153,0.85)]'
          }`}
        >
          <span className="text-[8px] xs:text-[9px] sm:text-[10px] uppercase font-mono block leading-none truncate w-full">ROSC</span>
          <span className="text-[7.5px] xs:text-[8.5px] opacity-80 mt-0.5 truncate w-full">Pulse Back</span>
        </button>
      </div>

      {/* SHOCK Action Banner when Shockable */}
      {lastRhythmDecision === 'shockable' && (
        <button
          onClick={handleDeliverShock}
          className={`w-full py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-between cursor-pointer transition-all border shadow-lg active:scale-95 ${
            shockButtonFlashing
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-300 animate-pulse ring-4 ring-rose-500/80 shadow-rose-500/50'
              : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white border-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 text-yellow-200 fill-yellow-200 ${shockButtonFlashing ? 'animate-bounce' : ''}`} />
            <span>ปล่อยช็อกหัวใจ (DEFIBRILLATE 200J)</span>
          </div>
          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono font-bold">
            Shock #{shockCount + 1}
          </span>
        </button>
      )}

      {/* Main Medication & Action Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {/* EPINEPHRINE 1mg */}
        <button
          onClick={handleAdministerEpinephrine}
          className={`p-1.5 sm:p-2 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border ${
            epiAlertActive
              ? 'bg-rose-900 border-rose-400 text-white animate-pulse ring-2 ring-rose-400 shadow-lg'
              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] sm:text-[12px] font-black text-cyan-300 font-mono leading-tight truncate">EPINEPHRINE</span>
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-800 ml-1 shrink-0">
              #{epiCount}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[8.5px] sm:text-[9.5px] font-mono font-semibold">
            <span className="text-cyan-200/90 font-medium truncate">1mg IV Every 3-5m</span>
            {epiTimerStarted ? (
              <span className={`font-black ml-1 shrink-0 ${epiTimeRemaining === 0 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                {epiTimeRemaining === 0 ? 'DUE NOW!' : formatMMSS(epiTimeRemaining)}
              </span>
            ) : !hasCompletedIvAccess ? (
              <span className="text-[7.5px] sm:text-[8px] bg-amber-950/80 text-amber-300/90 px-1 rounded border border-amber-800/80 shrink-0 font-sans truncate">
                Req. IV
              </span>
            ) : null}
          </div>
        </button>

        {/* AMIODARONE */}
        <button
          onClick={handleAdministerAmiodarone}
          className={`p-1.5 sm:p-2 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border ${
            amioAlertActive
              ? 'bg-indigo-900 border-indigo-400 text-white animate-pulse ring-2 ring-indigo-400'
              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] sm:text-[11px] font-black text-indigo-300 font-mono truncate">AMIODARONE</span>
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-800">
              #{amioCount}
            </span>
          </div>
          <span className="text-[8.5px] sm:text-[9px] text-slate-400 font-semibold block mt-1 truncate">
            {amioCount === 0 ? '300mg IV Bolus' : '150mg IV Bolus'}
          </span>
        </button>

        {/* LIDOCAINE */}
        <button
          onClick={handleAdministerLidocaine}
          className={`p-1.5 sm:p-2 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border ${
            lidoAlertActive
              ? 'bg-indigo-900 border-indigo-400 text-white animate-pulse ring-2 ring-indigo-400'
              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] sm:text-[11px] font-black text-indigo-300 font-mono truncate">LIDOCAINE</span>
            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-800">
              #{lidoCount}
            </span>
          </div>
          <span className="text-[8.5px] sm:text-[9px] text-slate-400 font-semibold block mt-1 truncate">
            {lidoCount === 0 ? '1-1.5 mg/kg' : '0.5-0.75 mg/kg'}
          </span>
        </button>
      </div>
    </div>
  );
}
