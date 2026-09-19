import React from 'react';
import { Zap, ShieldAlert, Heart, Check, Plus, AlertCircle, Clock } from 'lucide-react';
import { VfEkgIcon, VtEkgIcon, AsystoleEkgIcon, PeaEkgIcon } from './EkgIcons';
import { ShockableRhythmType, NonShockableRhythmType } from '../types';

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
  selectedShockableRhythm?: ShockableRhythmType;
  setSelectedShockableRhythm?: (val: ShockableRhythmType) => void;
  selectedNonShockableRhythm?: NonShockableRhythmType;
  setSelectedNonShockableRhythm?: (val: NonShockableRhythmType) => void;
  setShockButtonFlashing?: (val: boolean) => void;
  addLog?: (text: string, type?: any) => void;
  speakThai?: (text: string, onEnd?: () => void, rate?: number) => void;
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
  selectedShockableRhythm,
  setSelectedShockableRhythm,
  selectedNonShockableRhythm,
  setSelectedNonShockableRhythm,
  setShockButtonFlashing,
  addLog,
  speakThai,
  formatMMSS,
  shockButtonFlashing,
}: QuickMedsShocksPanelProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 sm:p-2.5 flex flex-col gap-1.5 sm:gap-2 shadow-xl w-full max-w-full h-[185px] min-h-0 overflow-y-auto">
      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className="text-[10px] sm:text-[11px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
          Quick Actions & Rhythm Triggers
        </span>
        <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-bold">AHA Protocol 2025</span>
      </div>

      {/* Rhythm Trigger Buttons */}
      <div className="grid grid-cols-3 gap-1 xs:gap-1.5 -mt-0.5">
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



      {/* SHOCK Status Display Banner when Shockable (Read-only status display, not clickable in this page) */}
      {lastRhythmDecision === 'shockable' && (
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="สถานะคลื่น: SHOCKABLE (แสดงสถานะ • ไม่สามารถกดใช้งานในหน้านี้ได้)"
          className={`w-full py-1.5 sm:py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-between cursor-default select-none pointer-events-none transition-all border shadow-md ${
            shockButtonFlashing
              ? 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/80 border-rose-500/80 text-white ring-2 ring-rose-500/50 shadow-[0_0_16px_rgba(244,63,94,0.35)] animate-pulse'
              : 'bg-gradient-to-r from-amber-950/85 via-slate-900 to-amber-950/75 border-amber-500/70 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 text-amber-400 fill-amber-400/30 shrink-0 ${shockButtonFlashing ? 'text-rose-400 fill-rose-400/40 animate-pulse' : ''}`} />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-[11px] sm:text-xs tracking-tight">DEFIBRILLATION (200J)</span>
                <span className="text-[7.5px] sm:text-[8px] px-1 py-0.2 rounded font-sans font-bold uppercase tracking-wider bg-slate-800/90 text-slate-300 border border-slate-700/80">
                  แสดงสถานะ
                </span>
              </div>
              <span className="text-[8px] sm:text-[8.5px] font-sans font-medium text-amber-300/80">
                สถานะคลื่น: SHOCKABLE (พร้อมช็อก)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[9.5px] sm:text-[10px] bg-black/60 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
              Shock #{shockCount + 1}
            </span>
          </div>
        </button>
      )}

      {/* Main Medication & Action Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {/* EPINEPHRINE 1mg */}
        {(() => {
          const isEpiPrepOnly = lastRhythmDecision === 'shockable' && shockCount < 2 && epiCount === 0;
          return (
            <button
              onClick={handleAdministerEpinephrine}
              className={`p-1.5 sm:p-2 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border relative overflow-hidden isolate ${
                epiAlertActive
                  ? isEpiPrepOnly
                    ? 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-300 text-white animate-pulse ring-4 ring-amber-500/80 shadow-[0_0_24px_rgba(245,158,11,0.9)]'
                    : 'bg-gradient-to-b from-rose-600 via-rose-700 to-red-900 border-2 border-rose-300 text-white animate-pulse ring-4 ring-rose-500/80 shadow-[0_0_24px_rgba(244,63,94,0.9)]'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              {/* แสงสะท้อนกลอสซี่ (Glossy top reflection) เมื่อเตือนให้ยาหรือเตรียมยา */}
              {epiAlertActive && (
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />
              )}
              <div className="flex items-center justify-between relative z-1">
                <span className={`text-[10.5px] sm:text-[12px] font-black font-mono leading-tight truncate ${
                  epiAlertActive ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]' : 'text-cyan-300'
                }`}>
                  EPINEPHRINE
                </span>
                <span className={`text-[9px] sm:text-[9.5px] font-mono font-bold px-1 rounded border ml-1 shrink-0 ${
                  epiAlertActive
                    ? isEpiPrepOnly
                      ? 'bg-amber-950 text-amber-200 border-amber-400 font-bold'
                      : 'bg-white text-rose-800 border-rose-200 shadow-xs font-black'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                }`}>
                  {isEpiPrepOnly && epiAlertActive ? 'รอ Shock #2' : `#${epiCount}`}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[8px] sm:text-[9px] font-mono font-semibold relative z-1">
                <span className={`truncate ${
                  epiAlertActive
                    ? isEpiPrepOnly
                      ? 'text-amber-100 font-bold'
                      : 'text-rose-100 font-bold'
                    : 'text-cyan-200/90 font-medium'
                }`}>
                  {epiAlertActive
                    ? isEpiPrepOnly
                      ? '⚠️ เตรียมยา (รอ Shock #2)'
                      : '⚡ ให้ยา 1mg ทันที'
                    : '1mg IV Every 3-5m'}
                </span>
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
          );
        })()}

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
