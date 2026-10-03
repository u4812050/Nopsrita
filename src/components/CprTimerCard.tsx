import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Clock, RotateCcw, Heart, Activity, Check, Zap, HeartOff, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { ALT_RESUSCITATION_MEDS, AltMedItem } from '../data/altMeds';
import { LogEntry, NonShockableRhythmType } from '../types';

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
  startCPR?: () => void;
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

  // No Pulse Pre-requisite State
  noPulseConfirmed?: boolean;
  setNoPulseConfirmed?: React.Dispatch<React.SetStateAction<boolean>>;
  playAlertChime?: (type: 'cpr_expire' | 'pulse_check' | 'med_due' | 'vent_cue' | 'mode_switch' | 'test') => void;
  setGuidanceMessage?: (msg: string) => void;

  // Airway & Confirmation State for Continuous CPR
  hasCompletedAirway?: boolean;
  hasCompletedEtco2?: boolean;

  // Resuscitation Meds (Left Side)
  hasCompletedIvAccess?: boolean;
  handleAdministerEpinephrine?: () => void;
  epiCount?: number;
  shockableEpiCount?: number;
  nonShockableEpiCount?: number;
  epiTimeRemaining?: number;
  epiTimerStarted?: boolean;
  epiAlertActive?: boolean;
  onOpenMedDueModal?: () => void;
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
  selectedNonShockableRhythm?: NonShockableRhythmType;
  onSelectNonShockableRhythm?: (rhythm: NonShockableRhythmType) => void;
  onOpenQuickActionModal?: () => void;
  shockCount?: number;
  shockButtonFlashing?: boolean;
  pulseUnlocked?: boolean;
  setPulseUnlocked?: React.Dispatch<React.SetStateAction<boolean>>;
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
  startCPR,
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
  noPulseConfirmed = false,
  setNoPulseConfirmed,
  playAlertChime,
  setGuidanceMessage,

  hasCompletedAirway = false,
  hasCompletedEtco2 = false,

  hasCompletedIvAccess = false,
  handleAdministerEpinephrine,
  epiCount = 0,
  shockableEpiCount = 0,
  nonShockableEpiCount = 0,
  epiTimeRemaining = 0,
  epiTimerStarted = false,
  epiAlertActive = false,
  onOpenMedDueModal,
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
  selectedNonShockableRhythm = null,
  onSelectNonShockableRhythm,
  onOpenQuickActionModal,
  shockCount = 0,
  shockButtonFlashing = false,
  pulseUnlocked: propPulseUnlocked,
  setPulseUnlocked: propSetPulseUnlocked,
}: CprTimerCardProps) {
  // Real-time latest log for the mini LiveResus Log (newest first - 1 line)
  const latestLog = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    return logs[logs.length - 1];
  }, [logs]);

  const [highlightNoPulse, setHighlightNoPulse] = useState<boolean>(false);

  // Pulse Rhythm Cover state: ปกคลุมกลุ่มปุ่ม Bradycardia / Tachycardia / ROSC เพื่อป้องกันการกดใช้งานโดยไม่ตั้งใจ
  const [internalPulseUnlocked, setInternalPulseUnlocked] = useState<boolean>(() => {
    return lastRhythmDecision === 'bradycardia' || lastRhythmDecision === 'tachycardia' || lastRhythmDecision === 'rosc';
  });

  const pulseUnlocked = propPulseUnlocked !== undefined ? propPulseUnlocked : internalPulseUnlocked;
  const setPulseUnlocked = propSetPulseUnlocked || setInternalPulseUnlocked;

  // Auto-sync unlock state based on rhythm decision & case status:
  useEffect(() => {
    if (lastRhythmDecision === 'bradycardia' || lastRhythmDecision === 'tachycardia' || lastRhythmDecision === 'rosc') {
      setPulseUnlocked(true);
    } else {
      // เมื่อ lastRhythmDecision เป็น null (เช่น Reset case), shockable, non-shockable ให้กลับมาล็อก
      setPulseUnlocked(false);
    }
  }, [lastRhythmDecision, setPulseUnlocked]);

  // เมื่อรีเซ็ตเคส (!caseActive) หรือเริ่มทำ CPR (cprActive) ให้ล็อกกลุ่มปุ่ม Pulse Rhythm เสมอ
  useEffect(() => {
    if (!caseActive || cprActive) {
      setPulseUnlocked(false);
    }
  }, [caseActive, cprActive, setPulseUnlocked]);

  const cprActiveRef = useRef(cprActive);
  useEffect(() => {
    cprActiveRef.current = cprActive;
  }, [cprActive]);

  const noPulseConfirmedRef = useRef(noPulseConfirmed);
  useEffect(() => {
    noPulseConfirmedRef.current = noPulseConfirmed;
  }, [noPulseConfirmed]);

  const startCPRRef = useRef(startCPR || toggleCPR);
  useEffect(() => {
    startCPRRef.current = startCPR || toggleCPR;
  }, [startCPR, toggleCPR]);

  const handleToggleNoPulse = () => {
    if (cprActive) {
      speakThai("กำลังทำ ซีพีอา อยู่ค่ะ");
      return;
    }

    if (setNoPulseConfirmed) {
      setNoPulseConfirmed((prev) => {
        const nextVal = !prev;
        if (nextVal) {
          addLog("คลำชีพจร: ยืนยันไม่พบชีพจร (No Pulse) — พร้อมเริ่ม CPR", "rhythm");
          if (playAlertChime) playAlertChime('pulse_check');
          if (setGuidanceMessage) {
            setGuidanceMessage("⚡ ยืนยันตรวจไม่พบชีพจร (No Pulse) • กำลังเริ่ม CPR อัตโนมัติเมื่อเสียงพูดจบ...");
          }
          speakThai("ไม่พบชีพจรเริ่มซีพีอาได้ค่ะ", () => {
            // เมื่อพูดบทปุ่มนี้จบลง ให้เริ่ม start CPR อัตโนมัติ (หากยังยืนยันสถานะ No Pulse และยังไม่ได้เริ่ม CPR)
            if (noPulseConfirmedRef.current && !cprActiveRef.current) {
              if (startCPRRef.current) {
                startCPRRef.current();
              }
            }
          });
        } else {
          addLog("ยกเลิกการยืนยันสถานะ No Pulse", "system");
          speakThai("ยกเลิกสถานะ");
          if (setGuidanceMessage) {
            setGuidanceMessage("กรุณากดปุ่ม No Pulse สี่เหลี่ยมเพื่อยืนยันก่อนจึงจะกด START CPR ได้");
          }
        }
        return nextVal;
      });
    }
  };

  const handleStartBtnClick = () => {
    if (cprActive) {
      toggleCPR();
      return;
    }

    if (!noPulseConfirmed) {
      setHighlightNoPulse(true);
      setTimeout(() => setHighlightNoPulse(false), 1600);
      if (playAlertChime) playAlertChime('mode_switch');
      speakThai("กรุณากดปุ่ม No Pulse เพื่อยืนยันว่าไม่มีชีพจรก่อนเริ่ม CPR ค่ะ");
      if (setGuidanceMessage) {
        setGuidanceMessage("⚠️ ต้องกดปุ่ม 'No Pulse' สี่เหลี่ยมเพื่อยืนยันก่อน จึงจะกด START CPR ได้");
      }
      return;
    }

    toggleCPR();
  };

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
            }}
            className={`flex-1 w-1/2 min-w-[100px] py-1.5 px-1 sm:px-2 rounded-lg text-[8.5px] xs:text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${
              metronomeMode === '30:2'
                ? 'bg-emerald-600 text-white shadow-[0_0_14px_rgba(16,185,129,0.6)] border border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate whitespace-nowrap">30:2 (5 CYCLES)</span>
          </button>
        </div>
      </div>

      {/* LIVERESUS LOG ขนาดย่อ 1 บรรทัด (REAL-TIME) */}
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
          <span className="text-[8px] text-slate-500 font-normal">ล่าสุด • Real-time</span>
        </div>

        {/* 1 Line of most recent action */}
        <div className="flex flex-col gap-0.5 text-[9px] xs:text-[9.5px] font-mono leading-tight overflow-hidden">
          {!latestLog ? (
            <div className="flex items-center gap-1 text-slate-400 truncate">
              <span className="text-cyan-500 font-bold shrink-0">▸ 00:00</span>
              <span className="truncate">รอเริ่มการกู้ชีพ — ระบบพร้อมบันทึก Real-time</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-white font-medium truncate">
              <span className="text-emerald-400 font-bold shrink-0">▸ {latestLog.elapsed || '--:--'}</span>
              <span className={`px-1 py-0.2 rounded text-[7.5px] font-bold uppercase shrink-0 ${getTypeBadge(latestLog.type)}`}>
                {latestLog.type}
              </span>
              <span className="truncate text-slate-100">{latestLog.text || '—'}</span>
            </div>
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
            const isShockable = lastRhythmDecision === 'shockable';
            const isNonShockable = lastRhythmDecision === 'non-shockable';
            const isRosc = lastRhythmDecision === 'rosc';
            const currentRhythmEpiCount = isShockable ? shockableEpiCount : isNonShockable ? nonShockableEpiCount : epiCount;
            const isEpiPrepOnly = isShockable && (shockCount ?? 0) < 2 && currentRhythmEpiCount === 0;
            const isNonShockWithoutSubRhythm = isNonShockable && !selectedNonShockableRhythm;
            const isEpiActuallyAlerting = !isRosc && epiAlertActive && !isEpiPrepOnly && !isNonShockWithoutSubRhythm;
            return (
              <button
                type="button"
                id="btn_cpr_epinephrine"
                onClick={() => {
                  if (isRosc) {
                    speakThai("ผู้ป่วยมีชีพจรแล้วค่ะ สิ้นสุดการให้ยาในภาวะหัวใจหยุดเต้น");
                    return;
                  }
                  if (isNonShockWithoutSubRhythm) {
                    speakThai("โปรดเลือกชนิดคลื่นไฟฟ้าหัวใจ อะซิสโทลี หรือ พีอีเอ ก่อนนะคะ");
                    if (onOpenQuickActionModal) onOpenQuickActionModal();
                    return;
                  }
                  if (epiAlertActive && !isEpiPrepOnly && onOpenMedDueModal) {
                    onOpenMedDueModal();
                  } else if (handleAdministerEpinephrine) {
                    handleAdministerEpinephrine();
                  }
                }}
                className={`p-1 xs:p-1.5 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border relative overflow-hidden isolate h-[40px] xs:h-[45px] ${
                  isRosc
                    ? 'bg-slate-950/90 border-slate-800 text-slate-400 opacity-60'
                    : isEpiActuallyAlerting
                    ? 'bg-gradient-to-b from-rose-600 via-rose-700 to-red-900 border-2 border-rose-300 text-white animate-pulse ring-2 ring-rose-500/80 shadow-[0_0_16px_rgba(244,63,94,0.8)]'
                    : isEpiPrepOnly && epiAlertActive
                    ? 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-300 text-white animate-pulse ring-2 ring-amber-500/80 shadow-[0_0_16px_rgba(245,158,11,0.8)]'
                    : isNonShockWithoutSubRhythm
                    ? 'bg-slate-950 hover:bg-slate-800 border-cyan-800/80 text-cyan-200'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                }`}
              >
                {isEpiActuallyAlerting && (
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />
                )}
                <div className="flex items-center justify-between w-full relative z-1">
                  <span className={`text-[8.5px] xs:text-[9.5px] font-black font-mono leading-tight truncate ${
                    isRosc ? 'text-slate-400' : isEpiActuallyAlerting ? 'text-white' : 'text-cyan-300'
                  }`}>
                    EPINEPHRINE
                  </span>
                  <span className={`text-[7px] xs:text-[8px] font-mono font-bold px-1 rounded border ml-0.5 shrink-0 ${
                    isRosc
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700 font-bold'
                      : isEpiActuallyAlerting
                      ? 'bg-white text-rose-800 border-rose-200 font-black'
                      : isEpiPrepOnly && epiAlertActive
                      ? 'bg-amber-950 text-amber-200 border-amber-400'
                      : isNonShockWithoutSubRhythm
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  }`}>
                    {isRosc
                      ? 'ROSC'
                      : isEpiPrepOnly && epiAlertActive
                      ? 'รอ#2'
                      : isNonShockWithoutSubRhythm
                      ? 'เลือกคลื่น'
                      : isShockable
                      ? `Shk #${shockableEpiCount}`
                      : isNonShockable
                      ? `Non-Shk #${nonShockableEpiCount}`
                      : `#${epiCount}`}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full text-[6.5px] xs:text-[7.5px] font-mono relative z-1">
                  <span className="truncate opacity-90">
                    {isRosc
                      ? 'ยกเลิกยา (ROSC)'
                      : isEpiActuallyAlerting
                      ? '⚡ ให้ 1mg ทันที'
                      : isEpiPrepOnly && epiAlertActive
                      ? '⚠️ รอ Shock #2'
                      : isNonShockWithoutSubRhythm
                      ? '⚡ รอเลือก Asys/PEA'
                      : isShockable
                      ? 'Shk: 1mg/4น.'
                      : isNonShockable
                      ? 'Non-Shk: 1mg'
                      : '1mg ทุก 4น.'}
                  </span>
                  {isRosc ? (
                    <span className="text-[6.5px] text-emerald-400 font-bold shrink-0">
                      หยุดนับเวลา
                    </span>
                  ) : epiTimerStarted ? (
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
            onClick={() => {
              if (lastRhythmDecision === 'rosc') {
                speakThai("ผู้ป่วยมีชีพจรแล้วค่ะ สิ้นสุดการให้ยาในภาวะหัวใจหยุดเต้น");
                return;
              }
              if (handleAdministerAmiodarone) handleAdministerAmiodarone();
            }}
            className={`p-1 xs:p-1.5 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border h-[36px] xs:h-[40px] ${
              lastRhythmDecision === 'rosc'
                ? 'bg-slate-950/90 border-slate-800 text-slate-400 opacity-60'
                : amioAlertActive
                ? 'bg-indigo-900 border-indigo-400 text-white animate-pulse ring-2 ring-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-[8px] xs:text-[9px] font-black font-mono truncate ${
                lastRhythmDecision === 'rosc' ? 'text-slate-400' : 'text-indigo-300'
              }`}>
                AMIODARONE
              </span>
              <span className="text-[7px] xs:text-[8px] font-mono font-bold bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-800 shrink-0">
                {lastRhythmDecision === 'rosc' ? 'ROSC' : `#${amioCount ?? 0}`}
              </span>
            </div>
            <span
              className="text-[6.5px] xs:text-[7.5px] text-slate-400 font-semibold block truncate"
              title={(amioCount ?? 0) === 0 ? '1st Dose: 300 mg+D5W up to 20ml IV/IO' : '2nd Dose: 150 mg+D5W up to 20ml IV/IO'}
            >
              {lastRhythmDecision === 'rosc' ? 'ระงับยา CA' : (amioCount ?? 0) === 0 ? '300mg+D5W 20ml' : '150mg+D5W 20ml'}
            </span>
          </button>

          {/* 3. LIDOCAINE */}
          <button
            type="button"
            id="btn_cpr_lidocaine"
            onClick={() => {
              if (lastRhythmDecision === 'rosc') {
                speakThai("ผู้ป่วยมีชีพจรแล้วค่ะ สิ้นสุดการให้ยาในภาวะหัวใจหยุดเต้น");
                return;
              }
              if (handleAdministerLidocaine) handleAdministerLidocaine();
            }}
            className={`p-1 xs:p-1.5 rounded-lg text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between border h-[36px] xs:h-[40px] ${
              lastRhythmDecision === 'rosc'
                ? 'bg-slate-950/90 border-slate-800 text-slate-400 opacity-60'
                : lidoAlertActive
                ? 'bg-indigo-900 border-indigo-400 text-white animate-pulse ring-2 ring-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`text-[8px] xs:text-[9px] font-black font-mono truncate ${
                lastRhythmDecision === 'rosc' ? 'text-slate-400' : 'text-indigo-300'
              }`}>
                LIDOCAINE
              </span>
              <span className="text-[7px] xs:text-[8px] font-mono font-bold bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-800 shrink-0">
                {lastRhythmDecision === 'rosc' ? 'ROSC' : `#${lidoCount ?? 0}`}
              </span>
            </div>
            <span className="text-[6.5px] xs:text-[7.5px] text-slate-400 font-semibold block truncate">
              {lastRhythmDecision === 'rosc' ? 'ระงับยา CA' : (lidoCount ?? 0) === 0 ? '1-1.5 mg/kg' : '0.5-0.75 mg/kg'}
            </span>
          </button>
        </div>

        {/* CENTER: CIRCULAR CPR TIMER GAUGE */}
        <div className="relative flex items-center justify-center shrink-0 w-28 h-28 xs:w-36 xs:h-36 sm:w-44 sm:h-44 max-w-full">
          {/* SVG Circular Ring Gauge */}
          <svg
            className={`w-full h-full transform -rotate-90 transition-all duration-300 ${
              metronomeMode === '30:2'
                ? 'drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'drop-shadow-[0_0_20px_rgba(6,182,212,0.25)]'
            }`}
            viewBox="0 0 160 160"
          >
            {metronomeMode === '30:2' ? (
              <>
                {/* 5-Segment Track for 30:2 Mode (5 CYCLES) */}
                {/* Ambient Outer Track Glow */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-slate-950/90"
                  strokeWidth="12"
                  fill="transparent"
                />

                {/* 5 Segmented Tracks and Progress Arcs */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const circumference = 439.82;
                  const segmentTotal = circumference / 5; // ~87.964
                  const gap = 6; // 6px clean divider gap between cycles
                  const segmentLength = segmentTotal - gap; // ~81.964
                  const dashOffset = -(i * segmentTotal + gap / 2);
                  const cycleNum = i + 1;
                  const isPast = cprSubCycle302 > cycleNum;
                  const isCurrent = cprSubCycle302 === cycleNum;

                  // Active cycle progress calculation (0 to 32 beats: 30 compressions + 2 ventilations)
                  const beatProgress = cprActive ? Math.min(1, Math.max(0, (metronomeBeat || 1) / 32)) : 0;
                  const activeFillLength = Math.max(0.1, segmentLength * (beatProgress || 0.04));

                  return (
                    <g key={`cycle-segment-${i}`}>
                      {/* Background segment track */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        className="stroke-slate-800/90"
                        strokeWidth="10"
                        strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="butt"
                        fill="transparent"
                      />

                      {/* Active or Completed segment fill */}
                      {(isPast || isCurrent) && (
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          className={`transition-all duration-200 ease-linear ${
                            isPast
                              ? 'stroke-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : cycleNum === 5
                                ? 'stroke-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.9)] animate-pulse'
                                : 'stroke-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]'
                          }`}
                          strokeWidth="10"
                          strokeDasharray={
                            isPast
                              ? `${segmentLength} ${circumference - segmentLength}`
                              : `${activeFillLength} ${circumference - activeFillLength}`
                          }
                          strokeDashoffset={dashOffset}
                          strokeLinecap="butt"
                          fill="transparent"
                        />
                      )}
                    </g>
                  );
                })}

                {/* 5 Divider Lines cutting cleanly between each cycle segment */}
                {[0, 72, 144, 216, 288].map((deg) => (
                  <line
                    key={`divider-cycle-${deg}`}
                    x1={80 + 64 * Math.cos((deg * Math.PI) / 180)}
                    y1={80 + 64 * Math.sin((deg * Math.PI) / 180)}
                    x2={80 + 76 * Math.cos((deg * Math.PI) / 180)}
                    y2={80 + 76 * Math.sin((deg * Math.PI) / 180)}
                    stroke="#020617"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                ))}

                {/* Subtle Inner Cycle Indicator Dots for each of the 5 segments */}
                {[36, 108, 180, 252, 324].map((midDeg, idx) => {
                  const cycleNum = idx + 1;
                  const isPast = cprSubCycle302 > cycleNum;
                  const isCurrent = cprSubCycle302 === cycleNum;
                  return (
                    <circle
                      key={`dot-cycle-${idx}`}
                      cx={80 + 58 * Math.cos((midDeg * Math.PI) / 180)}
                      cy={80 + 58 * Math.sin((midDeg * Math.PI) / 180)}
                      r={isCurrent ? 2.5 : 1.8}
                      className={`transition-colors duration-200 ${
                        isPast
                          ? 'fill-emerald-400'
                          : isCurrent
                            ? cycleNum === 5
                              ? 'fill-amber-300 animate-ping'
                              : 'fill-emerald-300'
                            : 'fill-slate-700'
                      }`}
                    />
                  );
                })}
              </>
            ) : (
              <>
                {/* Continuous Mode (Single Unbroken Circle) */}
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
                  className={`transition-all duration-300 ease-linear ${
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
              </>
            )}
          </svg>

          {/* Centered Timer / Cycle Content inside the Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
            {metronomeMode === '30:2' ? (
              <>
                <span className="text-[7.5px] xs:text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  30:2 CPR
                </span>
                <div
                  id="timer-display"
                  className={`text-[25px] font-mono font-black leading-none tracking-tight tabular-nums mt-0.5 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] ${
                    cprSubCycle302 === 5 ? 'animate-pulse drop-shadow-[0_0_18px_rgba(251,191,36,0.85)]' : ''
                  }`}
                >
                  CYCLE {cprSubCycle302}/5
                </div>
                {cprActive && metronomeBeat > 0 ? (
                  <div className="text-[9px] xs:text-[10px] font-mono font-bold text-slate-200 tabular-nums mt-0.5">
                    {metronomeBeat <= 30 ? (
                      <span>กด: <span className="text-emerald-400 font-black">{metronomeBeat}</span>/30</span>
                    ) : (
                      <span className="text-cyan-300 font-black animate-pulse">ช่วยหายใจ {metronomeBeat - 30}/2</span>
                    )}
                  </div>
                ) : (
                  <div className="text-[8px] xs:text-[9px] font-mono text-slate-400 mt-0.5">
                    รอบละ 30:2
                  </div>
                )}
                <span
                  className={`text-[7px] xs:text-[8px] font-bold tracking-wider uppercase mt-1 px-1.5 py-0.5 rounded-full border transition-all ${
                    pulseCheckActive
                      ? 'text-rose-200 bg-rose-950/90 border-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : cprActive
                        ? cprSubCycle302 === 5
                          ? 'text-amber-200 bg-amber-950/90 border-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : 'text-emerald-300 bg-emerald-950/80 border-emerald-800'
                        : 'text-slate-400 bg-slate-950/80 border-slate-800'
                  }`}
                >
                  {pulseCheckActive
                    ? '🛑 หยุด CPR'
                    : cprActive
                      ? (cprSubCycle302 === 5 ? 'เตรียมเปลี่ยน' : '30:2 เคาะจังหวะ')
                      : 'PAUSED'}
                </span>
              </>
            ) : (
              <>
                <span className="text-[7.5px] xs:text-[8px] font-mono font-bold tracking-widest text-slate-400 uppercase flex items-center justify-center gap-1">
                  {hasCompletedAirway && hasCompletedEtco2 ? (
                    <span className="text-emerald-300 font-black px-1 py-0.2 bg-emerald-950/90 rounded border border-emerald-600/70 text-[6.5px] xs:text-[7.5px]">
                      ETT+ETCO₂
                    </span>
                  ) : null}
                  <span>2 MIN CPR</span>
                </span>
                <div
                  id="timer-display"
                  className={`text-[25px] font-mono font-black leading-none tracking-tight tabular-nums mt-0.5 ${
                    cprTimeRemaining <= 30 ? 'text-rose-400 animate-pulse glow-red' : 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  }`}
                >
                  {formatMMSS(cprTimeRemaining)}
                </div>
                {hasCompletedAirway && hasCompletedEtco2 ? (
                  <span className="text-[7px] xs:text-[8px] font-mono text-emerald-300 font-bold mt-0.5 text-center leading-tight">
                    ช่วยหายใจ 1 ครั้ง / 6 วิ
                  </span>
                ) : null}
                <span
                  className={`text-[7.5px] xs:text-[8.5px] font-bold tracking-wider uppercase mt-1 px-1.5 py-0.5 rounded-full border transition-all ${
                    pulseCheckActive
                      ? 'text-rose-200 bg-rose-950/90 border-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : cprActive
                        ? cprTimeRemaining <= 30
                          ? 'text-rose-300 bg-rose-950/80 border-rose-800/80 animate-pulse'
                          : 'text-cyan-300 bg-cyan-950/80 border-cyan-800/80'
                        : 'text-slate-400 bg-slate-950/80 border-slate-800'
                  }`}
                >
                  {pulseCheckActive
                    ? '🛑 หยุด CPR'
                    : cprActive
                      ? (cprTimeRemaining <= 30 ? 'CRITICAL' : 'ACTIVE')
                      : 'PAUSED'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RHYTHM TRIGGERS & ROSC */}
        <div className="flex-1 flex flex-col gap-1 xs:gap-1.5 min-w-0 max-w-[105px] xs:max-w-[125px] sm:max-w-[145px] relative">
          <div className="text-[7.5px] xs:text-[8.5px] font-mono font-black uppercase tracking-wider text-center border-b border-slate-800/80 pb-0.5 mb-0.5 flex items-center justify-between px-0.5">
            <span className={pulseUnlocked ? "text-emerald-400 font-bold" : "text-amber-400"}>
              {pulseUnlocked ? "PULSE RHYTHM" : "RHYTHM"}
            </span>
            {pulseUnlocked && (
              <button
                type="button"
                id="btn_relock_pulse"
                onClick={(e) => {
                  e.stopPropagation();
                  setPulseUnlocked(false);
                }}
                title="กดเพื่อล็อกกลุ่มปุ่มชีพจร (ป้องกันการกดโดยไม่ตั้งใจ)"
                className="text-[7px] font-mono px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span>ล็อก</span>
              </button>
            )}
          </div>

          <div className="relative flex flex-col gap-1 xs:gap-1.5 w-full flex-1">
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

            {/* PULSE COVER BUTTON: ปกคลุมกลุ่มปุ่มนี้เพื่อป้องกันการกดใช้งานโดยไม่ตั้งใจ ต้องกดเลือกก่อนหากจะใช้งานปุ่มกลุ่มนี้ */}
            {!pulseUnlocked && (
              <button
                type="button"
                id="btn_pulse_cover"
                onClick={() => {
                  setPulseUnlocked(true);
                  if (playAlertChime) playAlertChime('pulse_check');
                  speakThai("ตรวจพบชีพจร โปรดเลือกจังหวะหัวใจ หรือ อาร์โอเอสซีค่ะ");
                  if (setGuidanceMessage) {
                    setGuidanceMessage("⚡ คลำพบชีพจร (Pulse Present) • ปลดล็อกกลุ่มปุ่ม Bradycardia / Tachycardia / ROSC แล้ว");
                  }
                }}
                title="กดปุ่ม Pulse นี้ก่อนเพื่อปลดล็อกกลุ่มปุ่ม (ป้องกันการกดใช้งานโดยไม่ตั้งใจ)"
                className="absolute inset-0 z-20 w-full h-full rounded-xl bg-gradient-to-b from-teal-950/95 via-slate-900/95 to-emerald-950/95 border-2 border-emerald-500/80 hover:border-emerald-300 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/30 flex flex-col items-center justify-between p-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group backdrop-blur-[2px]"
              >
                {/* Top Badge */}
                <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/50 px-1.5 py-0.5 rounded-full shadow-inner">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[7px] xs:text-[8px] font-black uppercase tracking-wider text-emerald-300 font-mono">
                    PULSE
                  </span>
                </div>

                {/* Center Pulse Animation */}
                <div className="flex flex-col items-center justify-center my-0.5 relative">
                  <Heart className="w-6 h-6 xs:w-7 xs:h-7 text-emerald-400 fill-emerald-400/40 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <Activity className="w-3.5 h-3.5 text-teal-200 absolute -bottom-1" />
                </div>

                {/* Bottom Prompt */}
                <div className="flex flex-col items-center text-center leading-tight">
                  <span className="text-[8px] xs:text-[9px] font-bold text-white drop-shadow font-sans">
                    คลำพบชีพจร
                  </span>
                  <span className="text-[6.5px] xs:text-[7px] text-emerald-300/90 font-mono mt-0.5 bg-emerald-900/60 px-1 py-0.2 rounded border border-emerald-700/50">
                    กดเลือกใช้งาน
                  </span>
                </div>
              </button>
            )}
          </div>
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

      {/* NON-SHOCKABLE Status Display Banner & Sub-rhythm Selector */}
      {lastRhythmDecision === 'non-shockable' && (
        <div
          className={`w-full py-1 xs:py-1.5 px-2 rounded-lg font-black text-xs flex items-center justify-between transition-all border my-0.5 shadow-md shrink-0 ${
            !selectedNonShockableRhythm
              ? 'bg-gradient-to-r from-slate-950 via-cyan-950/90 to-slate-950 border-cyan-500/90 text-white ring-2 ring-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.35)] animate-pulse'
              : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldAlert className={`w-3.5 h-3.5 text-cyan-400 shrink-0 ${!selectedNonShockableRhythm ? 'animate-bounce' : ''}`} />
            <span className="font-mono font-black text-[10px] xs:text-[11px]">NON-SHOCKABLE</span>
            <span className={`text-[7px] px-1 py-0.2 rounded font-bold uppercase ${
              selectedNonShockableRhythm ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
            }`}>
              {selectedNonShockableRhythm ? selectedNonShockableRhythm : 'รอเลือกคลื่น'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onSelectNonShockableRhythm?.('Asystole')}
              className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold transition-all cursor-pointer border ${
                selectedNonShockableRhythm === 'Asystole'
                  ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm ring-1 ring-cyan-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Asystole
            </button>
            <button
              type="button"
              onClick={() => onSelectNonShockableRhythm?.('PEA')}
              className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold transition-all cursor-pointer border ${
                selectedNonShockableRhythm === 'PEA'
                  ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm ring-1 ring-cyan-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              PEA
            </button>
          </div>
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
                  🌬️ ช่วยหายใจ {metronomeBeat === 31 ? 'ครั้งที่ 1/2' : 'ครั้งที่ 2/2'} (1.75 วิ)
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
              30:2 CYCLE {cprSubCycle302}/5
            </span>
            <div className="flex items-center gap-0.5 xs:gap-1">
              {[1, 2, 3, 4, 5].map((cycleNum) => {
                const isActive = cprSubCycle302 === cycleNum;
                const isDone = cprSubCycle302 > cycleNum;
                return (
                  <button
                    key={cycleNum}
                    type="button"
                    onClick={() => {
                      setCprSubCycle302(cycleNum);
                      cprSubCycleRef.current = cycleNum;
                      if (!cprActive) {
                        if (setNoPulseConfirmed) {
                          setNoPulseConfirmed(true);
                        }
                        addLog(`เลือกและเริ่ม CPR 30:2 รอบ ${cycleNum}/5 ทันที`, 'cpr');
                        if (startCPR) {
                          startCPR();
                        } else {
                          toggleCPR();
                        }
                      } else {
                        addLog(`ปรับเปลี่ยนเป็น CPR 30:2 รอบ ${cycleNum}/5`, 'cpr');
                        if (cycleNum === 1) {
                          speakThai("รอบหนึ่ง", undefined, 1.05);
                        } else if (cycleNum === 2) {
                          speakThai("รอบสอง", undefined, 1.1);
                        } else if (cycleNum === 3) {
                          speakThai("รอบสาม", undefined, 1.1);
                        } else if (cycleNum === 4) {
                          speakThai("รอบสี่", undefined, 1.1);
                        } else if (cycleNum === 5) {
                          speakThai("รอบที่ห้า เตรียมเปลี่ยนค่ะ", undefined, 1.05);
                        }
                      }
                    }}
                    title={`กดเพื่อเริ่ม CPR 30:2 รอบที่ ${cycleNum}/5 ทันที`}
                    className={`px-1.5 xs:px-2 py-0.5 rounded text-[9px] xs:text-[10px] font-mono font-black transition-all cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? cprActive
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/50 ring-2 ring-cyan-300 animate-pulse'
                          : 'bg-cyan-600 text-white ring-1 ring-cyan-400'
                        : isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/60'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
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
        {/* Main Start / Pause CPR Button Container with Overlaid Rectangular No Pulse Button */}
        <div className="relative col-span-6 xs:col-span-7 sm:col-span-8 h-11 xs:h-12 flex items-center">
          {/* Overlaid Rectangular No Pulse Button covering Start CPR */}
          <button
            id="btn_no_pulse"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleNoPulse();
            }}
            title={
              noPulseConfirmed
                ? "ยืนยันตรวจไม่พบชีพจร (No Pulse) แล้ว (กดเพื่อยกเลิก)"
                : "กดเพื่อยืนยันตรวจไม่พบชีพจร (No Pulse) — เมื่อเสียงพูดจบจะเริ่ม START CPR อัตโนมัติ"
            }
            className={
              noPulseConfirmed
                ? 'absolute left-1 xs:left-1.5 top-1/2 -translate-y-1/2 z-20 h-7 xs:h-8 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer select-none transition-all duration-200 border shadow-md active:scale-90 bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-300 text-white shadow-[0_0_10px_rgba(16,185,129,0.7)] hover:scale-105'
                : `absolute inset-0 z-20 w-full h-full rounded-xl flex items-center justify-center gap-1.5 xs:gap-2 cursor-pointer select-none transition-all duration-200 border-2 shadow-lg active:scale-[0.98] ${
                    highlightNoPulse
                      ? 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 border-white text-white shadow-[0_0_20px_rgba(244,63,94,1)] ring-4 ring-rose-400 animate-bounce'
                      : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 border-white text-white shadow-[0_0_16px_rgba(244,63,94,0.85)] ring-2 ring-red-400/50 animate-pulse hover:scale-[1.01]'
                  }`
            }
          >
            {noPulseConfirmed ? (
              <div className="flex items-center gap-1 leading-none">
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-100 drop-shadow" />
                <span className="text-[7.5px] xs:text-[8.5px] font-black uppercase tracking-tighter text-emerald-100">
                  No Pulse
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 xs:gap-2 px-2 w-full truncate">
                <HeartOff className="w-4 h-4 xs:w-5 xs:h-5 stroke-[2.5] text-white drop-shadow shrink-0 animate-pulse" />
                <div className="flex flex-col items-center justify-center leading-none truncate">
                  <span className="text-xs xs:text-sm sm:text-base font-black uppercase tracking-tight text-white font-mono drop-shadow truncate">
                    NO PULSE (ตรวจไม่พบชีพจร)
                  </span>
                  <span className="text-[7px] xs:text-[8px] font-bold text-red-100 font-mono tracking-tighter mt-0.5 truncate">
                    แตะสี่เหลี่ยมนี้เพื่อยืนยัน &amp; เริ่ม CPR
                  </span>
                </div>
              </div>
            )}
          </button>

          {/* Main Start / Pause CPR Button */}
          <button
            id="start-btn"
            type="button"
            onClick={handleStartBtnClick}
            className={`w-full h-full text-white rounded-xl text-xs xs:text-sm sm:text-base font-bold flex items-center justify-center gap-1.5 xs:gap-2 shadow-md transition-all duration-200 active:scale-[0.98] border select-none cursor-pointer ${
              noPulseConfirmed ? 'pl-20 xs:pl-22 sm:pl-24 pr-2' : 'px-3'
            } ${
              cprActive
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 border-white/90 shadow-red-900/50 ring-2 ring-red-400/50 text-white'
                : !noPulseConfirmed
                  ? 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 border-slate-700/80 hover:border-blue-500/50 shadow-inner'
                  : cprButtonFlash
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-white animate-pulse ring-4 ring-red-500/50 text-white'
                    : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-white/90 shadow-[0_0_18px_rgba(37,99,235,0.5)] ring-2 ring-blue-400/50 animate-pulse text-white'
            }`}
          >
            {cprActive ? (
              <>
                <Activity className="w-4 h-4 xs:w-5 xs:h-5 animate-bounce text-white shrink-0" />
                <span className="tracking-wide font-black truncate text-white drop-shadow">PAUSE CPR</span>
              </>
            ) : !noPulseConfirmed ? (
              <div className="flex items-center gap-1 xs:gap-1.5 truncate">
                <span className="tracking-wide font-black truncate text-[11px] xs:text-xs sm:text-sm text-slate-200">
                  START CPR
                </span>
              </div>
            ) : (
              <>
                <Activity className="w-4 h-4 xs:w-5 xs:h-5 text-white shrink-0" />
                <span className="tracking-wide font-black truncate text-white drop-shadow">
                  START CPR
                </span>
              </>
            )}
          </button>
        </div>

        {/* Reset Timer Button */}
        <button
          id="reset-btn"
          onClick={resetCPRCycle}
          disabled={!caseActive}
          title="Reset CPR Timer to 02:00"
          className="col-span-3 xs:col-span-2 sm:col-span-2 h-11 xs:h-12 bg-slate-900/90 hover:bg-blue-950/80 text-slate-200 hover:text-white rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-[0.96] cursor-pointer border border-blue-900/40 hover:border-blue-500/60 backdrop-blur-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-400" />
          <span className="text-[8px] xs:text-[9px] font-mono mt-0.5 text-slate-300">Reset</span>
        </button>

        {/* Pulse & EKG Assessment Trigger Button (White, Red, Blue Theme) */}
        <button
          id="btn_pulse_check_trigger"
          onClick={startPulseCheck}
          title="Start 10-Second Pulse & EKG Check Timer"
          className={`col-span-3 xs:col-span-3 sm:col-span-2 h-11 xs:h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-[0.96] cursor-pointer border backdrop-blur-md shadow-sm group relative overflow-hidden ${
            pulseCheckActive
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-blue-700 text-white font-black border-2 border-white shadow-lg shadow-red-600/50 animate-pulse ring-2 ring-blue-400'
              : 'bg-gradient-to-b from-blue-950/80 via-slate-900/95 to-slate-950 hover:from-blue-900/70 hover:via-slate-850 hover:to-slate-900 border-blue-500/50 hover:border-red-500/80 ring-1 ring-blue-500/30 hover:ring-red-500/50 text-white shadow-md shadow-blue-950/50'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Clock className={`w-3.5 h-3.5 transition-all duration-200 ${pulseCheckActive ? 'text-white stroke-[2.5]' : 'text-blue-400 group-hover:text-blue-300 group-hover:scale-105'}`} />
            <Activity className={`w-3 h-3 transition-all duration-200 ${pulseCheckActive ? 'text-white stroke-[2.5]' : 'text-red-400 group-hover:text-red-300 group-hover:scale-110 animate-pulse'}`} />
          </div>
          <span className={`text-[8px] xs:text-[9px] font-mono font-bold tracking-tight mt-0.5 transition-colors duration-200 ${pulseCheckActive ? 'text-white font-black drop-shadow' : 'text-slate-100 group-hover:text-white'}`}>
            10s Check
          </span>
        </button>
      </div>
    </div>
  );
}
