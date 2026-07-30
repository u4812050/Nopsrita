import React from 'react';
import { Clock, RotateCcw, Heart, Activity, Check } from 'lucide-react';
import { ALT_RESUSCITATION_MEDS, AltMedItem } from '../data/altMeds';

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
}: CprTimerCardProps) {
  return (
    <div
      className="bg-slate-900 rounded-xl border border-slate-800 p-2 sm:p-3 md:p-4 flex flex-col items-center justify-between relative overflow-hidden shadow-xl flex-1 w-full max-w-full h-full min-h-[350px]"
    >
      {/* Top Countdown Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
        <div
          id="timer-progress"
          className={`h-full transition-all duration-1000 ${
            cprTimeRemaining <= 30 ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'
          }`}
          style={{ width: `${(cprTimeRemaining / 120) * 100}%` }}
        />
      </div>

      {/* METRONOME CPR MODE SWITCHER TABS */}
      <div className="w-full mb-1.5 sm:mb-3">
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

      {/* Timer Digits Display with Circular Progress Gauge */}
      <div className="flex flex-col items-center justify-center my-0.5 w-full max-w-full overflow-hidden flex-1">
        <div className="relative flex items-center justify-center w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 my-1 sm:my-2 max-w-full">
          {/* SVG Circular Ring Gauge */}
          <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(6,182,212,0.25)]" viewBox="0 0 160 160">
            {/* Ambient Outer Track Glow/Background Circle (12px outer shadow ring) */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-slate-950/90"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Background Track Circle (10px track width) */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-slate-800/90"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Dynamic Progress Circle (10px stroke width, depletes as countdown approaches 0) */}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <div
              id="timer-display"
              className={`text-2xl xs:text-4xl sm:text-5xl font-mono font-black leading-none tracking-tight tabular-nums ${
                cprTimeRemaining <= 30 ? 'text-rose-400 animate-pulse glow-red' : 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]'
              }`}
            >
              {formatMMSS(cprTimeRemaining)}
            </div>
            <span
              className={`text-[8.5px] xs:text-[9.5px] font-bold tracking-wider uppercase mt-1 xs:mt-1.5 px-2 py-0.5 rounded-full border transition-all ${
                cprActive
                  ? cprTimeRemaining <= 30
                    ? 'text-rose-300 bg-rose-950/80 border-rose-800/80 animate-pulse'
                    : 'text-cyan-300 bg-cyan-950/80 border-cyan-800/80'
                  : 'text-slate-400 bg-slate-950/80 border-slate-800'
              }`}
            >
              {cprActive ? (cprTimeRemaining <= 30 ? 'TIME CRITICAL' : 'CPR ACTIVE') : 'CPR PAUSED'}
            </span>
          </div>
        </div>

        {/* Live Beat Feedback Line */}
        <div className="h-5 flex items-center justify-center my-0.5 max-w-full px-1">
          {cprActive && metronomeOn ? (
            metronomeMode === '30:2' ? (
              metronomeBeat >= 1 && metronomeBeat <= 30 ? (
                <span className="text-[10px] xs:text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1 truncate">
                  <Heart className="w-3.5 h-3.5 fill-emerald-400 animate-ping shrink-0" />
                  กดหน้าอก: {metronomeBeat} / 30
                </span>
              ) : (
                <span className="text-[10px] xs:text-[11px] font-bold text-amber-400 animate-pulse flex items-center gap-1 truncate">
                  🌬️ ช่วยหายใจ {metronomeBeat === 31 ? 'ครั้งที่ 1/2' : 'ครั้งที่ 2/2'}
                </span>
              )
            ) : (
              <span className="text-[10px] xs:text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1 truncate">
                <Heart className="w-3.5 h-3.5 fill-cyan-400 animate-ping shrink-0" />
                จังหวะ CPR: {metronomeBeat}
              </span>
            )
          ) : (
            <span className="text-[9px] xs:text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center truncate">
              Target: 100-120 BPM • Depth: 5-6 cm
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
              ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black border-amber-300 shadow-amber-500/30 animate-pulse ring-2 ring-amber-300/80'
              : 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 hover:from-slate-750 hover:to-slate-800 text-cyan-300 border-cyan-500/30 hover:border-cyan-400/70 shadow-cyan-950/20 hover:shadow-cyan-500/10'
          }`}
        >
          <div className="flex items-center justify-center gap-0.5">
            <Clock className={`w-3 h-3 xs:w-3.5 xs:h-3.5 transition-transform duration-200 ${pulseCheckActive ? 'text-slate-950 stroke-[2.5]' : 'text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)] group-hover:scale-110'}`} />
            <Activity className={`w-2.5 h-2.5 xs:w-3 xs:h-3 transition-transform duration-200 ${pulseCheckActive ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] group-hover:scale-110'}`} />
          </div>
          <span className={`text-[8px] xs:text-[9px] font-mono tracking-tight mt-0.5 ${pulseCheckActive ? 'text-slate-950 font-black' : 'text-cyan-200/90 font-bold group-hover:text-cyan-100'}`}>
            10s Check
          </span>
        </button>
      </div>
    </div>
  );
}
