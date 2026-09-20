import React, { useMemo } from 'react';
import { Clock, RotateCcw, Heart, Activity, Check, Zap } from 'lucide-react';
import { ALT_RESUSCITATION_MEDS, AltMedItem } from '../data/altMeds';
import { LogEntry } from '../types';

export { ALT_RESUSCITATION_MEDS };
export type { AltMedItem };

interface CprTimerCardProps {
  cprTimeRemaining: number;
  cprActive: boolean;
  metronomeMode: '30:2' | 'continuous';
  setMetronomeMode: (mode: '30:2' | 'continuous') => void;
  cprSubCycle302: number;
  setCprSubCycle302: (sub: number) => void;
  cprSubCycleRef: React.MutableRefObject<number>;
  toggleCPR: () => void;
  resetCPRCycle: () => void;
  startPulseCheck: () => void;
  caseActive: boolean;
  cprButtonFlash: boolean;
  pulseCheckActive: boolean;
  formatMMSS: (sec: number) => string;
  addLog: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  speakThai: (text: string, onEnd?: () => void, customRate?: number) => void;
  metronomeOn: boolean;
  metronomeBeat: number;
  handleLogPresetMed?: (medName: string, skipSpeech?: boolean) => void;
  logs?: LogEntry[];

  // Resuscitation Meds (Left Side)
  hasCompletedIvAccess?: boolean;
  handleAdministerEpinephrine?: () => void;
  epiCount?: number;
  epiTimeRemaining?: number;
  epiTimerStarted?: boolean;
  epiAlertActive?: boolean;
  handleAdministerAmiodarone?: () => void;
  amioCount?: number;
  amioAlertActive?: boolean;
  handleAdministerLidocaine?: () => void;
  lidoCount?: number;
  lidoAlertActive?: boolean;

  // Rhythm Triggers & ROSC (Right Side)
  handleRhythmBradycardia?: () => void;
  handleRhythmTachycardia?: () => void;
  handleRhythmROSC?: () => void;
  lastRhythmDecision?: 'shockable' | 'non-shockable' | 'bradycardia' | 'tachycardia' | 'rosc' | null;
  shockCount?: number;
  shockButtonFlashing?: boolean;
}

export function CprTimerCard({
  cprTimeRemaining,
  cprActive,
  metronomeMode,
  setMetronomeMode,
  cprSubCycle302,
  setCprSubCycle302,
  cprSubCycleRef,
  toggleCPR,
  resetCPRCycle,
  startPulseCheck,
  caseActive,
  cprButtonFlash,
  pulseCheckActive,
  formatMMSS,
  addLog,
  speakThai,
  metronomeOn,
  metronomeBeat,
  handleLogPresetMed,
  logs = [],

  hasCompletedIvAccess = false,
  handleAdministerEpinephrine,
  epiCount = 0,
  epiTimeRemaining = 0,
  epiTimerStarted = false,
  epiAlertActive = false,
  handleAdministerAmiodarone,
  amioCount = 0,
  amioAlertActive = false,
  handleAdministerLidocaine,
  lidoCount = 0,
  lidoAlertActive = false,

  handleRhythmBradycardia,
  handleRhythmTachycardia,
  handleRhythmROSC,
  lastRhythmDecision = null,
  shockCount = 0,
  shockButtonFlashing = false,
}: CprTimerCardProps) {
  // Real-time latest 2 logs for the mini LiveResus Log (newest first)
  const latestTwoLogs = useMemo(() => {
    if (!logs || logs.length === 0) return [];
    return logs.slice(-2).reverse();
  }, [logs]);

  const getTypeBadge = (type?: LogEntry['type']) => {
    switch (type) {
      case 'shock':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'med':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
      case 'cpr':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
      case 'rhythm':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div
      className="bg-slate-900 rounded-xl border border-slate-800 p-2 sm:p-3 md:p-4 flex flex-col items-center justify-between relative overflow-hidden shadow-xl w-full max-w-full min-h-[418px] h-full"
    >


      {/* METRONOME CPR MODE SWITCHER TABS */}
      <div className="w-full mb-1">
        <div className="flex items-center justify-center p-1 bg-slate-950 rounded-xl border border-slate-800 w-full shadow-inner gap-1">
          <button
            id="tab_cpr_continuous"
            onClick={() => {
              setMetronomeMode('continuous');
              speakThai('เลือกการนับ ซีพีอา สองนาทีแบบต่อเนื่อง');
            }}
            className={`flex-1 w-1/2 min-w-[100px] py-1.5 px-1 sm:px-2 rounded-lg text-[8.5px] xs:text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${
              metronomeMode === 'continuous'
                ? 'bg-emerald-600 text-white shadow-[0_0_14px_rgba(16,185,129,0.6)] border border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate whitespace-nowrap">2 นาที (ต่อเนื่อง)</span>
          </button>

          <button
            id="tab_cpr_30_2"
            onClick={() => {
              setMetronomeMode('30:2');
              addLog('Switched CPR Mode to 30:2 CPR (5 Cycles)', 'cpr');
              speakThai('เลือกการนับ CPR แบบ 30 ต่อ 2');
            }}
            className={`flex-1 w-1/2 min-w-[100px] py-1.5 px-1 sm:px-2 rounded-lg text-[8.5px] xs:text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${
              metronomeMode === '30:2'
                ? 'bg-emerald-600 text-white shadow-[0_0_14px_rgba(16,185,129,0.6)] border border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate whitespace-nowrap">30:2 (5 รอบ)</span>
          </button>
        </div>
      </div>

      {/* LIVERESUS LOG ขนาดย่อ 2 บรรทัด (REAL-TIME) */}
      <div
        id="mini_liveresus_log"
        className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-inner flex flex-col justify-center gap-0.5 my-0.5 shrink-0"
      >
        <div className="flex items-center justify-between text-[9px] font-mono leading-none border-b border-slate-800/80 pb-1 mb-0.5">
          <span className="flex items-center gap-1.5 font-bold text-cyan-400 uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            LiveResus Log
          </span>
          <span className="text-[8px] text-slate-500 font-normal">ล่าสุด 2 รายการ • Real-time</span>
        </div>

        {/* 2 Lines of most recent actions */}
        <div className="flex flex-col gap-0.5 text-[9px] xs:text-[9.5px] font-mono leading-tight overflow-hidden">
          {latestTwoLogs.length === 0 ? (
            <>
              <div className="flex items-center gap-1 text-slate-400 truncate">
                <span className="text-cyan-500 font-bold shrink-0">▸ 00:00</span>
                <span className="truncate">รอเริ่มการกู้ชีพ — ระบบพร้อมบันทึก Real-time</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 truncate text-[8.5px]">
                <span className="text-slate-600 shrink-0">&nbsp;&nbsp;--:--</span>
                <span className="truncate">กด START CPR หรือบันทึกยา/ช็อกเพื่อเริ่มรายการ</span>
              </div>
            </>
          ) : (
            <>
              {/* Line 1: Latest action */}
              <div className="flex items-center gap-1 text-white font-medium truncate">
                <span className="text-emerald-400 font-bold shrink-0">▸ {latestTwoLogs[0]?.elapsed || '--:--'}</span>
                {latestTwoLogs[0] && (
                  <span className={`px-1 py-0.2 rounded text-[7.5px] font-bold uppercase shrink-0 ${getTypeBadge(latestTwoLogs[0].type)}`}>
                    {latestTwoLogs[0].type}
                  </span>
                )}
                <span className="truncate text-slate-100">{latestTwoLogs[0]?.text || '—'}</span>
              </div>

              {/* Line 2: Second latest action */}
              <div className="flex items-center gap-1 text-slate-400 truncate text-[8.5px] xs:text-[9px]">
                <span className="text-slate-500 font-normal shrink-0">&nbsp;&nbsp;{latestTwoLogs[1]?.elapsed || '--:--'}</span>
                {latestTwoLogs[1] ? (
                  <>
                    <span className={`px-1 py-0.2 rounded text-[7.5px] font-medium uppercase shrink-0 opacity-80 ${getTypeBadge(latestTwoLogs[1].type)}`}>
                      {latestTwoLogs[1].type}
                    </span>
                    <span className="truncate text-slate-400">{latestTwoLogs[1].text}</span>
                  </>
                ) : (
                  <span className="truncate text-slate-600">— รอรายการถัดไป —</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cockpit Row: [Resus Meds (Left)] | [Circular CPR Timer (Center)] | [Rhythm Decisions (Right)] */}
      <div className="w-full flex items-center justify-between gap-1 xs:gap-1.5 sm:gap-2 my-1 px-0.5 shrink-0">
        {/* LEFT COLUMN: RESUS MEDS (EPINEPHRINE, AMIODARONE, LIDOCAINE) */}
        <div className="flex-1 flex flex-col gap-1 xs:gap-1.5 min-w-0 max-w-[105px] xs:max-w-[125px] sm:max-w-[145px]">
          <div className="text-[7.5px] xs:text-[8.5px] font-mono font-black text-cyan-400 uppercase tracking-wider text-center border-b border-slate-800/80 pb-0.5 mb-0.5 flex items-center justify-center gap-1">
            <span>MEDS</span>
          </div>

          {/* 1. EPINEPHRINE */}
          {(() => {
            const isEpiPrepOnly = lastRhythmDecision === 'shockable' && (shockCount ?? 0) < 2 && (epiCount ?? 0) === 0;
            return (
              <button
                type="button"
                id="btn_cpr_epinephrine"
                onClick={handleAdministerEpinephrine}
                className={`p-1 xs:p-1.5 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border relative overflow-hidden isolate h-[40px] xs:h-[45px] ${
                  epiAlertActive
                    ? isEpiPrepOnly
                      ? 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-300 text-white animate-pulse ring-2 ring-amber-500/80 shadow-[0_0_16px_rgba(245,158,11,0.8)]'
                      : 'bg-gradient-to-b from-rose-600 via-rose-700 to-red-900 border-2 border-rose-300 text-white animate-pulse ring-2 ring-rose-500/80 shadow-[0_0_16px_rgba(244,63,94,0.8)]'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                {epiAlertActive && (
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />
                )}
                <div className="flex items-center justify-between w-full relative z-1">
                  <span className={`text-[8.5px] xs:text-[9.5px] font-black font-mono leading-tight truncate ${
                    epiAlertActive ? 'text-white' : 'text-cyan-300'
                  }`}>
                    EPINEPHRINE
                  </span>
                  <span className={`text-[7px] xs:text-[8px] font-mono font-bold px-1 rounded border ml-0.5 shrink-0 ${
                    epiAlertActive
                      ? isEpiPrepOnly ? 'bg-amber-950 text-amber-200 border-amber-400' : 'bg-white text-rose-800 border-rose-200'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  }`}>
                    {isEpiPrepOnly && epiAlertActive ? 'รอ#2' : `#${epiCount ?? 0}`}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full text-[6.5px] xs:text-[7.5px] font-mono relative z-1">
                  <span className="truncate opacity-90">
                    {epiAlertActive
                      ? isEpiPrepOnly ? '⚠️ เตรียมยา' : '⚡ ให้ 1mg'
                      : '1mg IV'}
                  </span>
                  {epiTimerStarted ? (
                    <span className={`font-black ml-0.5 shrink-0 ${epiTimeRemaining === 0 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                      {epiTimeRemaining === 0 ? 'DUE!' : formatMMSS(epiTimeRemaining ?? 0)}
                    </span>
                  ) : !hasCompletedIvAccess ? (
                    <span className="text-[6.5px] bg-amber-950/80 text-amber-300 px-0.5 rounded border border-amber-800 shrink-0">
                      IV
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })()}

          {/* 2. AMIODARONE */}
          <button
            type="button"
            id="btn_cpr_amiodarone"
            onClick={handleAdministerAmiodarone}
            className={`p-1 xs:p-1.5 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border h-[36px] xs:h-[40px] ${
              amioAlertActive
                ? 'bg-indigo-900 border-indigo-400 text-white animate-pulse ring-2 ring-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[8px] xs:text-[9px] font-black text-indigo-300 font-mono truncate">
                AMIODARONE
              </span>
              <span className="text-[7px] xs:text-[8px] font-mono font-bold bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-800 shrink-0">
                #{amioCount ?? 0}
              </span>
            </div>
            <span className="text-[6.5px] xs:text-[7.5px] text-slate-400 font-semibold block truncate">
              {(amioCount ?? 0) === 0 ? '300mg IV' : '150mg IV'}
            </span>
          </button>

          {/* 3. LIDOCAINE */}
          <button
            type="button"
            id="btn_cpr_lidocaine"
            onClick={handleAdministerLidocaine}
            className={`p-1 xs:p-1.5 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border h-[36px] xs:h-[40px] ${
              lidoAlertActive
                ? 'bg-indigo-900 border-indigo-400 text-white animate-pulse ring-2 ring-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[8px] xs:text-[9px] font-black text-indigo-300 font-mono truncate">
                LIDOCAINE
              </span>
              <span className="text-[7px] xs:text-[8px] font-mono font-bold bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-800 shrink-0">
                #{lidoCount ?? 0}
              </span>
            </div>
            <span className="text-[6.5px] xs:text-[7.5px] text-slate-400 font-semibold block truncate">
              {(lidoCount ?? 0) === 0 ? '1-1.5 mg/kg' : '0.5-0.75 mg/kg'}
            </span>
          </button>
        </div>

        {/* CENTER: CIRCULAR CPR TIMER GAUGE */}
        <div className="relative flex items-center justify-center shrink-0 w-28 h-28 xs:w-36 xs:h-36 sm:w-44 sm:h-44 max-w-full">
          {/* SVG Circular Ring Gauge */}
          <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(6,182,212,0.25)]" viewBox="0 0 160 160">
            {/* Ambient Outer Track Glow */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-slate-950/90"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Background Track Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-slate-800/90"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Dynamic Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className={`transition-all duration-1000 ease-linear ${
                cprTimeRemaining <= 30
                  ? 'stroke-rose-500 drop-shadow-[0_0_18px_rgba(244,63,94,0.85)] animate-pulse'
                  : 'stroke-cyan-400 drop-shadow-[0_0_14px_rgba(34,211,238,0.65)]'
              }`}
              strokeWidth="10"
              strokeDasharray={439.82}
              strokeDashoffset={439.82 * (1 - Math.max(0, Math.min(1, cprTimeRemaining / 120)))}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Centered Timer Content inside the Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
            <div
              id="timer-display"
              className={`text-xl xs:text-3xl sm:text-4xl font-mono font-black leading-none tracking-tight tabular-nums ${
                cprTimeRemaining <= 30 ? 'text-rose-400 animate-pulse glow-red' : 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]'
              }`}
            >
              {formatMMSS(cprTimeRemaining)}
            </div>
            <span
              className={`text-[7.5px] xs:text-[8.5px] font-bold tracking-wider uppercase mt-1 px-1.5 py-0.5 rounded-full border transition-all ${
                cprActive
                  ? cprTimeRemaining <= 30
                    ? 'text-rose-300 bg-rose-950/80 border-rose-800/80 animate-pulse'
                    : 'text-cyan-300 bg-cyan-950/80 border-cyan-800/80'
                  : 'text-slate-400 bg-slate-950/80 border-slate-800'
              }`}
            >
              {cprActive ? (cprTimeRemaining <= 30 ? 'CRITICAL' : 'ACTIVE') : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: RHYTHM TRIGGERS & ROSC */}
        <div className="flex-1 flex flex-col gap-1 xs:gap-1.5 min-w-0 max-w-[105px] xs:max-w-[125px] sm:max-w-[145px]">
          <div className="text-[7.5px] xs:text-[8.5px] font-mono font-black text-amber-400 uppercase tracking-wider text-center border-b border-slate-800/80 pb-0.5 mb-0.5 flex items-center justify-center gap-1">
            <span>RHYTHM</span>
          </div>

          {/* 1. BRADYCARDIA */}
          <button
            type="button"
            id="btn_cpr_bradycardia"
            onClick={handleRhythmBradycardia}
            className={`p-1 xs:p-1.5 rounded-lg text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center border h-[36px] xs:h-[40px] ${
              lastRhythmDecision === 'bradycardia'
                ? 'bg-amber-600 text-white border-amber-300 ring-2 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.9)] animate-pulse'
                : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
            }`}
          >
            <span className="text-[7.5px] xs:text-[8.5px] uppercase font-mono block leading-none tracking-tight truncate w-full">
              BRADYCARDIA
            </span>
            <span className="text-[6.5px] xs:text-[7px] opacity-80 mt-0.5 truncate w-full">
              HR &lt; 50
            </span>
          </button>

          {/* 2. TACHYCARDIA */}
          <button
            type="button"
            id="btn_cpr_tachycardia"
            onClick={handleRhythmTachycardia}
            className={`p-1 xs:p-1.5 rounded-lg text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center border h-[36px] xs:h-[40px] ${
              lastRhythmDecision === 'tachycardia'
                ? 'bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.9)] animate-pulse'
                : 'bg-purple-950/60 hover:bg-purple-900 text-purple-300 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
            }`}
          >
            <span className="text-[7.5px] xs:text-[8.5px] uppercase font-mono block leading-none tracking-tight truncate w-full">
              TACHYCARDIA
            </span>
            <span className="text-[6.5px] xs:text-[7px] opacity-80 mt-0.5 truncate w-full">
              HR &ge; 150
            </span>
          </button>

          {/* 3. ROSC */}
          <button
            type="button"
            id="btn_cpr_rosc"
            onClick={handleRhythmROSC}
            className={`p-1 xs:p-1.5 rounded-lg text-center font-black transition-all cursor-pointer flex flex-col items-center justify-center border h-[40px] xs:h-[45px] ${
              lastRhythmDecision === 'rosc'
                ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.95)] animate-pulse'
                : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
            }`}
          >
            <span className="text-[8.5px] xs:text-[9.5px] uppercase font-mono block leading-none truncate w-full">
              ROSC
            </span>
            <span className="text-[6.5px] xs:text-[7.5px] opacity-90 mt-0.5 truncate w-full text-emerald-200 font-bold">
              Pulse Back
            </span>
          </button>
        </div>
      </div>

      {/* SHOCK Status Display Banner when Shockable */}
      {lastRhythmDecision === 'shockable' && (
        <div
          className={`w-full py-1 xs:py-1.5 px-2 rounded-lg font-black text-xs flex items-center justify-between transition-all border my-0.5 shadow-md shrink-0 ${
            shockButtonFlashing
              ? 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/80 border-rose-500/80 text-white ring-2 ring-rose-500/50 shadow-[0_0_16px_rgba(244,63,94,0.35)] animate-pulse'
              : 'bg-gradient-to-r from-amber-950/85 via-slate-900 to-amber-950/75 border-amber-500/70 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 text-amber-400 fill-amber-400/30 shrink-0 ${shockButtonFlashing ? 'text-rose-400 fill-rose-400/40 animate-pulse' : ''}`} />
            <span className="font-mono font-black text-[10px] xs:text-[11px]">DEFIBRILLATION (200J)</span>
            <span className="text-[7px] px-1 py-0.2 rounded font-bold uppercase bg-slate-800 text-slate-300">
              SHOCKABLE
            </span>
          </div>
          <span className="text-[8.5px] bg-black/60 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
            Shock #{(shockCount ?? 0) + 1}
          </span>
        </div>
      )}

      {/* Below Cockpit: Beat Feedback / Guideline Specs */}
      <div className="flex flex-col items-center justify-center w-full max-w-full overflow-hidden shrink-0">

        {/* Live Beat Feedback Line */}
        <div className="h-5 flex items-center justify-center my-0.5 max-w-full px-1">
          {cprActive && metronomeOn ? (
            metronomeMode === '30:2' ? (
              metronomeBeat >= 1 && metronomeBeat <= 30 ? (
                <span className="text-[10px] xs:text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 truncate">
                  <span className="relative flex h-3 w-3 items-center justify-center shrink-0">
                    <Heart className="absolute h-2.5 w-2.5 fill-rose-500 text-rose-500 animate-ping opacity-75" />
                    <Heart className="relative h-2.5 w-2.5 fill-rose-500 text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]" />
                  </span>
                  กดหน้าอก: {metronomeBeat} / 30
                </span>
              ) : (
                <span className="text-[10px] xs:text-[11px] font-bold text-amber-400 animate-pulse flex items-center gap-1 truncate">
                  🌬️ ช่วยหายใจ {metronomeBeat === 31 ? 'ครั้งที่ 1/2' : 'ครั้งที่ 2/2'} (1.5 วิ)
                </span>
              )
            ) : (
              <span className="text-[10px] xs:text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 truncate">
                <span className="relative flex h-3 w-3 items-center justify-center shrink-0">
                  <Heart className="absolute h-2.5 w-2.5 fill-rose-500 text-rose-500 animate-ping opacity-75" />
                  <Heart className="relative h-2.5 w-2.5 fill-rose-500 text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]" />
                </span>
                จังหวะ CPR: {metronomeBeat}
              </span>
            )
          ) : (
            <span
              id="cpr_guideline_specs"
              className="text-[7.5px] xs:text-[9px] sm:text-[10px] text-slate-300 font-mono font-bold uppercase tracking-tight text-center truncate px-2 py-0.5 rounded-full bg-slate-950/70 border border-slate-800/90 shadow-inner flex items-center justify-center gap-1 sm:gap-1.5 max-w-full"
            >
              <span className="text-cyan-400 font-black">FAST:</span>
              <span className="text-slate-200 font-bold">100-120BPM</span>
              <span className="text-slate-600 font-normal">/</span>
              <span className="text-amber-400 font-black">DEPTH:</span>
              <span className="text-slate-200 font-bold">5-6CM</span>
              <span className="text-slate-600 font-normal">/</span>
              <span className="text-emerald-400 font-black">FULLY RECOIL</span>
            </span>
          )}
        </div>

        {/* 30:2 Cycle Tracker Buttons */}
        {metronomeMode === '30:2' && (
          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-1 sm:p-1.5 flex flex-wrap items-center justify-between gap-1 my-1">
            <span className="text-[9px] xs:text-[10px] font-bold text-cyan-400 shrink-0 pl-1 truncate">
              30:2 รอบที่ {cprSubCycle302}/5
            </span>
            <div className="flex items-center gap-0.5 xs:gap-1">
              {[1, 2, 3, 4, 5].map((cycleNum) => {
                const isActive = cprSubCycle302 === cycleNum;
                const isDone = cprSubCycle302 > cycleNum;
                return (
                  <button
                    key={cycleNum}
                    onClick={() => {
                      setCprSubCycle302(cycleNum);
                      cprSubCycleRef.current = cycleNum;
                      addLog(`Manually set 30:2 CPR Cycle to ${cycleNum}/5`, 'cpr');
                      speakThai(`${cycleNum}`, undefined, 1.0);
                    }}
                    className={`px-1.5 xs:px-2 py-0.5 rounded text-[9px] xs:text-[10px] font-mono font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600 text-white ring-1 ring-cyan-400'
                        : isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : `${cycleNum}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Actions Row */}
      <div className="grid grid-cols-12 gap-1.5 xs:gap-2 w-full mt-1 shrink-0">
        {/* Main Start / Pause CPR Button */}
        <button
          id="start-btn"
          onClick={toggleCPR}
          className={`col-span-6 xs:col-span-7 sm:col-span-8 h-11 xs:h-12 text-white rounded-xl text-xs xs:text-sm sm:text-base font-bold flex items-center justify-center gap-1.5 xs:gap-2 shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer border ${
            cprActive
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border-amber-400/80 shadow-amber-900/30 ring-2 ring-amber-500/20'
              : cprButtonFlash
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 border-rose-400 animate-pulse ring-4 ring-rose-500/50'
                : 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 hover:from-cyan-500 hover:to-teal-400 border-cyan-400/60 shadow-cyan-950/40'
          }`}
        >
          <Activity className={`w-4 h-4 xs:w-5 xs:h-5 ${cprActive ? 'animate-bounce' : ''}`} />
          <span className="tracking-wide font-black truncate">{cprActive ? 'PAUSE CPR' : 'START CPR'}</span>
        </button>

        {/* Reset Timer Button */}
        <button
          id="reset-btn"
          onClick={resetCPRCycle}
          disabled={!caseActive}
          title="Reset CPR Timer to 02:00"
          className="col-span-3 xs:col-span-2 sm:col-span-2 h-11 xs:h-12 bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-[0.96] cursor-pointer border border-slate-700/80 backdrop-blur-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
          <span className="text-[8px] xs:text-[9px] font-mono mt-0.5 text-slate-400">Reset</span>
        </button>

        {/* Pulse & EKG Assessment Trigger Button */}
        <button
          id="btn_pulse_check_trigger"
          onClick={startPulseCheck}
          title="Start 10-Second Pulse & EKG Check Timer"
          className={`col-span-3 xs:col-span-3 sm:col-span-2 h-11 xs:h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-[0.95] cursor-pointer border backdrop-blur-md shadow-md group relative overflow-hidden ${
            pulseCheckActive
              ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-500 text-slate-950 font-black border-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.95)] animate-pulse ring-4 ring-amber-300/90'
              : 'bg-gradient-to-b from-amber-950/70 via-slate-900/90 to-amber-950/50 hover:from-amber-900/80 hover:to-slate-900 text-amber-300 border-amber-400/80 hover:border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.65)] hover:shadow-[0_0_24px_rgba(251,191,36,0.85)] glow-gold ring-1 ring-amber-400/50'
          }`}
        >
          <div className="flex items-center justify-center gap-0.5">
            <Clock className={`w-3 h-3 xs:w-3.5 xs:h-3.5 transition-transform duration-200 ${pulseCheckActive ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.85)] group-hover:scale-110'}`} />
            <Activity className={`w-2.5 h-2.5 xs:w-3 xs:h-3 transition-transform duration-200 ${pulseCheckActive ? 'text-slate-950 stroke-[2.5]' : 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)] group-hover:scale-110'}`} />
          </div>
          <span className={`text-[8px] xs:text-[9px] font-mono tracking-tight mt-0.5 ${pulseCheckActive ? 'text-slate-950 font-black' : 'text-amber-200 font-bold drop-shadow-[0_0_6px_rgba(245,158,11,0.7)] group-hover:text-amber-100'}`}>
            10s Check
          </span>
        </button>
      </div>
    </div>
  );
}
