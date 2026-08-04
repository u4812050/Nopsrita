import React, { useState } from 'react';
import {
  Activity,
  Heart,
  ShieldAlert,
  Zap,
  CheckSquare,
  PlusCircle,
  ChevronRight,
  AlertTriangle,
  Plus,
  Clock,
  Check,
  Sparkles,
  Syringe,
  Lock,
} from 'lucide-react';
import {
  GuidelineTab,
  RhythmDecision,
  ShockableRhythmType,
  NonShockableRhythmType,
  StabilityStatus,
  RoscBPStatus,
  RoscSpO2Level,
  RoscStemiStatus,
  RoscComatoseStatus,
  PROCEDURE_PRESETS,
  FIVE_HS,
  FIVE_TS,
} from '../types';
import { VfEkgIcon, VtEkgIcon, AsystoleEkgIcon, PeaEkgIcon, TorsadesEkgIcon, FirstDegreeAvBlockIcon, MobitzTwoEkgIcon, CompleteHeartBlockEkgIcon } from './EkgIcons';

interface GuidancePanelProps {
  activeTab: GuidelineTab;
  setActiveTab: (tab: GuidelineTab) => void;
  guidanceMessage: string;
  lastRhythmDecision: RhythmDecision;
  selectedShockableRhythm: ShockableRhythmType;
  setSelectedShockableRhythm: (rhythm: ShockableRhythmType) => void;
  selectedNonShockableRhythm: NonShockableRhythmType;
  setSelectedNonShockableRhythm: (rhythm: NonShockableRhythmType) => void;
  handleDeliverShock: () => void;
  shockCount: number;
  handleAdministerEpinephrine: () => void;
  epiCount: number;
  handleAdministerAmiodarone: () => void;
  amioCount: number;
  handleAdministerLidocaine: () => void;
  lidoCount: number;
  stabilityStatus: StabilityStatus;
  setStabilityStatus: (status: StabilityStatus) => void;
  reassessWarningActive: boolean;
  setReassessWarningActive: (val: boolean) => void;
  tachyVagalFlashing: boolean;
  setTachyVagalFlashing: (val: boolean) => void;
  tachyAmioFlashing: boolean;
  setTachyAmioFlashing: (val: boolean) => void;
  tachyConsultFlashing: boolean;
  setTachyConsultFlashing: (val: boolean) => void;
  shockButtonFlashing: boolean;
  setShockButtonFlashing: (val: boolean) => void;
  atropineCount: number;
  adenosineCount: number;
  adrenalineInfCount: number;
  dopamineInfCount: number;
  noradrenalineCount: number;
  setNoradrenalineCount: React.Dispatch<React.SetStateAction<number>>;
  roscCheckedSteps: string[];
  setRoscCheckedSteps: React.Dispatch<React.SetStateAction<string[]>>;
  roscStemiStatus: RoscStemiStatus;
  setRoscStemiStatus: (st: RoscStemiStatus) => void;
  roscSpO2Level: RoscSpO2Level;
  setRoscSpO2Level: (sp: RoscSpO2Level) => void;
  roscBPStatus: RoscBPStatus;
  setRoscBPStatus: (bp: RoscBPStatus) => void;
  roscComatoseStatus: RoscComatoseStatus;
  setRoscComatoseStatus: (c: RoscComatoseStatus) => void;
  checked5H: string[];
  toggle5H: (item: string) => void;
  checked5T: string[];
  toggle5T: (item: string) => void;
  handleLogProcedure: (procName: string) => void;
  completedProcedures: string[];
  handleLogPresetMed: (medName: string, skipSpeech?: boolean, onSpeechEnd?: () => void) => void;
  triggerReassessmentAlert: (treatmentName: string, speechText?: string, skipLog?: boolean) => void;
  addLog: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  speakThai: (text: string, onEnd?: () => void, customRate?: number) => void;
  customNote: string;
  setCustomNote: (text: string) => void;
  handleLogCustomNote: (e: React.FormEvent) => void;
  ivAccessAlertActive?: boolean;
  setIvAccessAlertActive?: (active: boolean) => void;
  hasCompletedIvAccess?: boolean;
  airwayAlertActive?: boolean;
  etco2AlertActive?: boolean;
  showStabilityModal?: boolean;
  setShowStabilityModal?: (val: boolean) => void;
  showProceduresModal?: boolean;
  setShowProceduresModal?: (val: boolean) => void;
  setShowAltMedsModal?: (val: boolean) => void;
  mgSo4AlertActive?: boolean;
  onOpenUnstableBradyModal?: () => void;
  onOpenStableBradyModal?: () => void;
  onOpenStableTachyModal?: () => void;
  onOpenUnstableTachyModal?: () => void;
}

export function GuidancePanel({
  activeTab,
  setActiveTab,
  guidanceMessage,
  lastRhythmDecision,
  selectedShockableRhythm,
  setSelectedShockableRhythm,
  selectedNonShockableRhythm,
  setSelectedNonShockableRhythm,
  handleDeliverShock,
  shockCount,
  handleAdministerEpinephrine,
  epiCount,
  handleAdministerAmiodarone,
  amioCount,
  handleAdministerLidocaine,
  lidoCount,
  stabilityStatus,
  setStabilityStatus,
  reassessWarningActive,
  setReassessWarningActive,
  tachyVagalFlashing,
  setTachyVagalFlashing,
  tachyAmioFlashing,
  setTachyAmioFlashing,
  tachyConsultFlashing,
  setTachyConsultFlashing,
  shockButtonFlashing,
  setShockButtonFlashing,
  atropineCount,
  adenosineCount,
  adrenalineInfCount,
  dopamineInfCount,
  noradrenalineCount,
  setNoradrenalineCount,
  roscCheckedSteps,
  setRoscCheckedSteps,
  roscStemiStatus,
  setRoscStemiStatus,
  roscSpO2Level,
  setRoscSpO2Level,
  roscBPStatus,
  setRoscBPStatus,
  roscComatoseStatus,
  setRoscComatoseStatus,
  checked5H,
  toggle5H,
  checked5T,
  toggle5T,
  handleLogProcedure,
  completedProcedures,
  handleLogPresetMed,
  triggerReassessmentAlert,
  addLog,
  speakThai,
  customNote,
  setCustomNote,
  handleLogCustomNote,
  ivAccessAlertActive = false,
  setIvAccessAlertActive,
  hasCompletedIvAccess = false,
  airwayAlertActive = false,
  etco2AlertActive = false,
  setShowStabilityModal,
  setShowProceduresModal,
  setShowAltMedsModal,
  mgSo4AlertActive = false,
  onOpenUnstableBradyModal,
  onOpenStableBradyModal,
  onOpenStableTachyModal,
  onOpenUnstableTachyModal,
}: GuidancePanelProps) {
  const isProceduresFlashing = ivAccessAlertActive || airwayAlertActive || etco2AlertActive;

  const toggleRoscStep = (step: string) => {
    if (roscCheckedSteps.includes(step)) {
      setRoscCheckedSteps((prev) => prev.filter((s) => s !== step));
    } else {
      setRoscCheckedSteps((prev) => [...prev, step]);
    }
  };

  const [tachyBradyFilter, setTachyBradyFilter] = useState<'brady' | 'tachy' | 'all'>('all');
  const [abcCompletedSteps, setAbcCompletedSteps] = useState<string[]>([]);

  const isAbDone = abcCompletedSteps.includes('A-B');
  const isCDone = abcCompletedSteps.includes('C');
  const isIdentDone = abcCompletedSteps.includes('IDENT');

  const handleAbcStepClick = (step: 'A-B' | 'C' | 'IDENT') => {
    if (step === 'A-B') {
      if (!isAbDone) {
        setAbcCompletedSteps(prev => [...prev, 'A-B']);
        addLog('ABC Step 1 Completed: Airway & Breathing (A-B)', 'system');
        speakThai?.('ดูแลทางเดินหายใจและการหายใจเรียบร้อยแล้วค่ะ');
      } else {
        setAbcCompletedSteps(prev => prev.filter(s => s !== 'A-B' && s !== 'C' && s !== 'IDENT'));
      }
    } else if (step === 'C') {
      if (!isAbDone) {
        speakThai?.('กรุณาทำขั้นตอน Airway & Breathing (A-B) ก่อนนะคะ');
        return;
      }
      if (!isCDone) {
        setAbcCompletedSteps(prev => [...prev, 'C']);
        addLog('ABC Step 2 Completed: Circulation & Monitor (C)', 'system');
        speakThai?.('ติดเครื่องติดตามสัญญาณชีพ ประเมินคลื่นไฟฟ้าหัวใจ และเปิดเส้นให้ยาเรียบร้อยแล้วค่ะ');
      } else {
        setAbcCompletedSteps(prev => prev.filter(s => s !== 'C' && s !== 'IDENT'));
      }
    } else if (step === 'IDENT') {
      if (!isCDone) {
        speakThai?.('กรุณาทำขั้นตอน Circulation & Monitor (C) ก่อนนะคะ');
        return;
      }
      if (!isIdentDone) {
        setAbcCompletedSteps(prev => [...prev, 'IDENT']);
        addLog('ABC Step 3 Completed: Identify & Treat Causes (A-B-C Complete)', 'system');
      }
      speakThai?.('ประเมินตามหลักเอบีซีแล้ว ค้นหาสาเหตุอื่นเพิ่มเติมด้วยค่ะ', () => {
        setShowStabilityModal?.(true);
      });
    }
  };



  React.useEffect(() => {
    if (lastRhythmDecision === 'bradycardia') {
      setTachyBradyFilter('brady');
    } else if (lastRhythmDecision === 'tachycardia') {
      setTachyBradyFilter('tachy');
    }
  }, [lastRhythmDecision]);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-xl">
      {/* Tab Navigation Header */}
      <div className="bg-slate-950 p-1 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab('trc_cardiac')}
          className={`shrink-0 w-[100px] py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
            activeTab === 'trc_cardiac'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Cardiac Arrest</span>
        </button>

        <button
          onClick={() => setActiveTab('trc_tachy_brady')}
          className={`shrink-0 w-[100px] py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
            activeTab === 'trc_tachy_brady'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Tachy/Brady</span>
        </button>

        <button
          onClick={() => setActiveTab('trc_rosc')}
          className={`shrink-0 w-[62px] py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
            activeTab === 'trc_rosc'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">ROSC</span>
        </button>

        <button
          onClick={() => setActiveTab('hsts')}
          className={`shrink-0 w-[82px] py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
            activeTab === 'hsts'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">5Hs & 5Ts</span>
        </button>
      </div>

      {/* Dynamic Guidance Banner */}
      {guidanceMessage && (
        <div className="bg-cyan-950/80 border-b border-cyan-800 px-3 py-1.5 text-xs text-cyan-200 font-semibold shrink-0 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-snug">{guidanceMessage}</p>
        </div>
      )}

      {/* Main Tab Content Body (Scrollable) */}
      <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5 text-slate-200 text-xs">
        {/* TAB 1: CARDIAC ARREST */}
        {activeTab === 'trc_cardiac' && (
          <div className="space-y-2">
            {/* Shockable VF/pVT Workflow */}
            {lastRhythmDecision === 'shockable' && (
              <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Shockable Protocol (VF / Pulseless VT / Torsades)
                  </span>
                  <span className="text-[10px] bg-rose-900 text-rose-200 px-1.5 py-0.5 rounded font-mono font-bold">
                    Shock #{shockCount + 1} Pending
                  </span>
                </div>

                {/* Sub-rhythm selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedShockableRhythm('VF');
                      setShockButtonFlashing(true);
                      addLog('Selected Rhythm Type: VF (Ventricular Fibrillation)', 'rhythm');
                      speakThai('เลือกวีเอฟ เตรียมช็อคนะคะ');
                    }}
                    className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                      selectedShockableRhythm === 'VF'
                        ? 'bg-rose-900 border-rose-400 text-white ring-2 ring-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <VfEkgIcon className="w-9 h-6 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-xs block leading-tight truncate">VF</span>
                      <span className="text-[8px] text-slate-400 block leading-tight truncate">Ventricular Fibrillation</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedShockableRhythm('Pulseless VT');
                      setShockButtonFlashing(true);
                      addLog('Selected Rhythm Type: Pulseless VT', 'rhythm');
                      speakThai('เลือกเพ้าเหล็สวีที เตรียมช็อคนะคะ');
                    }}
                    className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                      selectedShockableRhythm === 'Pulseless VT'
                        ? 'bg-rose-900 border-rose-400 text-white ring-2 ring-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <VtEkgIcon className="w-9 h-6 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-xs block leading-tight truncate">Pulseless VT</span>
                      <span className="text-[8px] text-slate-400 block leading-tight truncate">Ventricular Tachycardia</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedShockableRhythm('Torsades');
                      setShockButtonFlashing(true);
                      addLog('Selected Rhythm Type: Torsades de pointes (Polymorphic VT)', 'rhythm');
                      speakThai('เลือกทอสาดเดอปัว เตรียมช็อคนะคะ');
                    }}
                    className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                      selectedShockableRhythm === 'Torsades'
                        ? 'bg-rose-900 border-rose-400 text-white ring-2 ring-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <TorsadesEkgIcon className="w-9 h-6 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-xs block leading-tight truncate">TdP</span>
                      <span className="text-[8px] text-slate-400 block leading-tight truncate">Polymorphic VT</span>
                    </div>
                  </button>
                </div>

                {/* Primary Action Button */}
                <button
                  onClick={() => {
                    setShockButtonFlashing(false);
                    handleDeliverShock();
                  }}
                  className={`w-full py-2.5 px-3 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 border transition-all ${
                    shockButtonFlashing
                      ? 'bg-rose-600 hover:bg-rose-500 border-rose-300 ring-4 ring-rose-500/80 shadow-rose-500/50 animate-pulse'
                      : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border-amber-300'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${shockButtonFlashing ? 'text-yellow-300 fill-yellow-300 animate-bounce' : 'text-yellow-200 fill-yellow-200 animate-bounce'}`} />
                  <span>DELIVER DEFIBRILLATION SHOCK (200J)</span>
                </button>
              </div>
            )}

            {/* Non-Shockable Asystole/PEA Workflow */}
            {lastRhythmDecision === 'non-shockable' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    Non-Shockable Protocol (Asystole / PEA)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    Epi Dose #{epiCount + 1}
                  </span>
                </div>

                {/* Sub-rhythm selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedNonShockableRhythm('Asystole');
                      addLog('Selected Rhythm Type: Asystole', 'rhythm');
                      speakThai('เลือก คลื่นไฟฟ้าหัวใจ อะซิสโทลี');
                      if (!hasCompletedIvAccess) {
                        if (setIvAccessAlertActive) setIvAccessAlertActive(true);
                        if (setShowProceduresModal) setShowProceduresModal(true);
                      }
                    }}
                    className={`p-1.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      selectedNonShockableRhythm === 'Asystole'
                        ? 'bg-slate-800 border-cyan-400 text-white ring-2 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <AsystoleEkgIcon className="w-10 h-6 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block leading-tight">Asystole</span>
                      <span className="text-[8.5px] text-slate-400 block leading-tight">Flatline</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedNonShockableRhythm('PEA');
                      addLog('Selected Rhythm Type: PEA', 'rhythm');
                      speakThai('เลือก คลื่นไฟฟ้าหัวใจ พีอีเอ');
                      if (!hasCompletedIvAccess) {
                        if (setIvAccessAlertActive) setIvAccessAlertActive(true);
                        if (setShowProceduresModal) setShowProceduresModal(true);
                      }
                    }}
                    className={`p-1.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      selectedNonShockableRhythm === 'PEA'
                        ? 'bg-slate-800 border-cyan-400 text-white ring-2 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <PeaEkgIcon className="w-10 h-6 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block leading-tight">PEA</span>
                      <span className="text-[8.5px] text-slate-400 block leading-tight">Pulseless Elec. Act.</span>
                    </div>
                  </button>
                </div>

                <button
                  onClick={handleAdministerEpinephrine}
                  className="w-full py-2.5 px-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 border border-cyan-500"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>ADMINISTER EPINEPHRINE 1mg IV/IO IMMEDIATELY</span>
                </button>
              </div>
            )}

            {/* General Cardiac Arrest Steps Reference */}
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 space-y-1 text-[10px]">
              <h4 className="font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1 text-[10px]">
                AHA Cardiac Arrest Protocol Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-slate-300">
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
                  <span className="text-white font-bold block text-[9.5px]">1. High Quality CPR</span>
                  <span className="text-[8.5px] text-slate-400 block">100-120 bpm, depth 5-6 cm, recoil</span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
                  <span className="text-rose-300 font-bold block text-[9.5px]">2. Shockable (VF/pVT)</span>
                  <span className="text-[8.5px] text-slate-400 block">Shock 200J → CPR 2m → Epi 1mg / Amio</span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
                  <span className="text-cyan-300 font-bold block text-[9.5px]">3. Non-Shockable</span>
                  <span className="text-[8.5px] text-slate-400 block">Epi 1mg ASAP → CPR 2m → Reassess</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TACHYCARDIA / BRADYCARDIA */}
        {activeTab === 'trc_tachy_brady' && (
          <div className="space-y-2 text-[11px]">
            {/* Combined Compact Control Bar for Mode & Clinical Stability */}
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Protocol Sub-Filter Header (Brady vs Tachy) */}
                <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 h-[60px]">
                  <span className="text-[10px] font-black uppercase text-slate-300 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    โหมดหัวใจ:
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setTachyBradyFilter('brady')}
                      className={`py-1 px-2 rounded text-[9.5px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                        tachyBradyFilter === 'brady'
                          ? 'bg-amber-600 border-amber-400 text-white shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Activity className="w-3 h-3 text-amber-300" />
                      <span>BRADY</span>
                    </button>

                    <button
                      onClick={() => setTachyBradyFilter('tachy')}
                      className={`py-1 px-2 rounded text-[9.5px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                        tachyBradyFilter === 'tachy'
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-indigo-300" />
                      <span>TACHY</span>
                    </button>
                  </div>
                </div>

                {/* 1. Clinical Stability Display Status (Read-only) */}
                <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 gap-2 min-h-[60px]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-black uppercase text-slate-300">
                      สภาวะทางคลินิก:
                    </span>
                  </div>

                  <div className="text-xs font-black">
                    {stabilityStatus === 'stable' && (
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 shadow-xs">
                        <Check className="w-4 h-4 text-emerald-400" /> STABLE
                      </span>
                    )}
                    {stabilityStatus === 'unstable' && (
                      <span className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center gap-1.5 shadow-xs animate-pulse">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> UNSTABLE
                      </span>
                    )}
                    {!stabilityStatus && (
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-default animate-pulse">
                        <Activity className="w-4 h-4 text-amber-400" />
                        <span>ประเมินสภาวะ(A-B-C)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Treat Cause & Ident.(A-B-C) Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/80 border-2 border-cyan-500/80 p-3 rounded-xl shadow-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-cyan-300 uppercase tracking-tight flex items-center gap-1">
                        ⚡ Treat Cause &amp; Ident.(A-B-C)
                      </h4>
                      <p className="text-[10px] text-slate-300 font-medium">
                        กดทำขั้นตอนเรียงตามลำดับ 1 → 2 → 3 เมื่อทำครบระบบจะแสดง Pop-up ให้ประเมิน Stable / Unstable
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                  {/* Step 1: A-B */}
                  <button
                    onClick={() => handleAbcStepClick('A-B')}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isAbDone
                        ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                        : 'bg-slate-900 hover:bg-slate-850 border-amber-500/60 text-slate-200 animate-pulse active:scale-95'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                        {isAbDone ? (
                          <Check className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center text-[9px] font-black shrink-0">1</span>
                        )}
                        Airway &amp; Breathing (A-B)
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-300 leading-tight">ดูแลทางเดินหายใจ ให้ O2 (ถ้า SpO2 &lt; 94%)</span>
                  </button>

                  {/* Step 2: C */}
                  <button
                    onClick={() => handleAbcStepClick('C')}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isCDone
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 cursor-pointer'
                        : isAbDone
                        ? 'bg-slate-900 hover:bg-slate-850 border-cyan-500/60 text-slate-200 animate-pulse cursor-pointer active:scale-95'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`font-bold flex items-center gap-1 text-[11px] ${isCDone ? 'text-cyan-300' : isAbDone ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {isCDone ? (
                          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : isAbDone ? (
                          <span className="w-4 h-4 rounded-full bg-cyan-500/30 text-cyan-300 flex items-center justify-center text-[9px] font-black shrink-0">2</span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        Circulation &amp; Monitor (C)
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 leading-tight">ติดเครื่องติดตาม V/S, BP, EKG &amp; เปิดเส้น IV/IO</span>
                  </button>

                  {/* Step 3: Identify & Treat Causes */}
                  <button
                    onClick={() => handleAbcStepClick('IDENT')}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isIdentDone
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 cursor-pointer'
                        : isCDone
                        ? 'bg-slate-900 hover:bg-slate-850 border-emerald-500/60 text-slate-200 animate-pulse cursor-pointer active:scale-95'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`font-bold flex items-center gap-1 text-[11px] ${isIdentDone ? 'text-emerald-300' : isCDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {isIdentDone ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isCDone ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[9px] font-black shrink-0">3</span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        )}
                        Identify &amp; Treat Causes
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 leading-tight">หาสาเหตุและแก้ไข (Ischemia, Electrolytes, Drugs)</span>
                  </button>
                </div>
              </div>

              <div className="text-[8.5px] text-slate-400 px-1 leading-tight">
                * สัญญาณวิกฤต: Hypotension, AMS (สับสน/ซึม), Signs of Shock, Ischemic Chest Pain, Acute Heart Failure
              </div>
            </div>

            {/* STABLE SPECIFIC ACTIONS */}
            {stabilityStatus === 'stable' && (
              <div className="space-y-2">
                {/* Status Indicator */}
                <div className="bg-emerald-950/40 border border-emerald-800/80 p-2 rounded-lg flex items-center justify-between text-[10px]">
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    STABLE PROTOCOL: ยาและหัตถการสำหรับผู้ป่วยอาการคงที่ ({tachyBradyFilter === 'brady' ? 'Bradycardia' : tachyBradyFilter === 'tachy' ? 'Tachycardia' : 'Brady / Tachy'})
                  </span>
                  <span className="text-[9px] bg-emerald-900/80 text-emerald-200 border border-emerald-700 px-1.5 py-0.2 rounded font-mono">
                    Observe & Drug Therapy
                  </span>
                </div>

                {/* Stable Bradycardia */}


                {/* Stable Tachycardia */}

              </div>
            )}

            {/* UNSTABLE SPECIFIC ACTIONS */}
            {stabilityStatus === 'unstable' && (
              <div className="space-y-2">
                {/* Status Indicator */}
                <div className="bg-rose-950/50 border border-rose-800 p-2 rounded-lg flex items-center justify-between text-[10px]">
                  <span className="text-rose-300 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    UNSTABLE PROTOCOL: หัตถการและยาวิกฤตสำหรับผู้ป่วยไม่คงที่ ({tachyBradyFilter === 'brady' ? 'Bradycardia' : tachyBradyFilter === 'tachy' ? 'Tachycardia' : 'Brady / Tachy'})
                  </span>
                  <span className="text-[9px] bg-rose-900 text-rose-100 border border-rose-700 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">
                    EMERGENCY
                  </span>
                </div>




              </div>
            )}
          </div>
        )}

        {/* TAB 3: ROSC POST-CARDIAC ARREST CARE (ABCDEF APPROACH) */}
        {activeTab === 'trc_rosc' && (
          <div className="space-y-3">
            <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                    <Heart className="w-4 h-4 fill-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      Post-Cardiac Arrest Care Protocol
                    </h3>
                    <span className="text-[10px] text-emerald-300/80 font-mono">
                      ABCDEF Approach Guidelines
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-900/90 text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  ROSC Active
                </span>
              </div>



              {/* ABCDEF STEP CARDS */}
              <div className="space-y-2.5 text-[11px]">

                {/* A - AIRWAY */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-cyan-400 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center justify-center font-mono text-[10px] font-bold">A</span>
                      Airway Assessment & Management
                    </span>
                    {roscCheckedSteps.includes('A_Airway') && (
                      <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded font-mono">Done</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Assess airway patency, secure advanced airway (ET Tube) & confirm placement with continuous waveform capnography (ETCO₂).
                  </p>
                  <button
                    onClick={() => {
                      toggleRoscStep('A_Airway');
                      if (!roscCheckedSteps.includes('A_Airway')) {
                        handleLogProcedure('Advanced Airway Secured & Assessed (ROSC)');
                        speakThai('จัดการทางเดินหายใจ และประเมินท่อช่วยหายใจเรียบร้อยแล้วค่ะ');
                      }
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      roscCheckedSteps.includes('A_Airway')
                        ? 'bg-cyan-950 text-cyan-200 border-cyan-600 shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${roscCheckedSteps.includes('A_Airway') ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{roscCheckedSteps.includes('A_Airway') ? 'Airway Management Completed' : 'Mark Airway Assessed / Advanced Airway Secured'}</span>
                  </button>
                </div>

                {/* B - BREATHING */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-teal-400 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-teal-950 text-teal-300 border border-teal-700 flex items-center justify-center font-mono text-[10px] font-bold">B</span>
                      Breathing & Oxygenation
                    </span>
                    <span className="text-[9px] text-teal-300/80 font-mono">SpO₂ 94-98% (AHA 92-98%)</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Maintain <strong className="text-teal-200">SpO₂ 94-98%</strong> (AHA target: 92-98%), maintain normal <strong className="text-teal-200">PaCO₂ 35-45 mmHg</strong>. Avoid hyperventilation (start 10 bpm).
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {/* SpO2 Level Selector */}
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">SpO₂ Target</span>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => {
                            setRoscSpO2Level('low');
                            addLog('ROSC Assessment: SpO2 < 92-94% (Low)', 'system');
                            speakThai('ออกซิเจนต่ำกว่าเกณฑ์ ปรับเพิ่มออกซิเจน');
                          }}
                          className={`py-1 px-1 rounded text-[9px] font-bold border transition-all ${
                            roscSpO2Level === 'low'
                              ? 'bg-amber-600 border-amber-400 text-white shadow-xs'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          &lt; 92% (Low)
                        </button>
                        <button
                          onClick={() => {
                            setRoscSpO2Level('normal');
                            addLog('ROSC Assessment: SpO2 94-98% (Target Reached)', 'system');
                            speakThai('ออกซิเจนอยู่ในเกณฑ์เป้าหมาย 94 ถึง 98 เปอร์เซ็นต์');
                          }}
                          className={`py-1 px-1 rounded text-[9px] font-bold border transition-all ${
                            roscSpO2Level === 'normal'
                              ? 'bg-teal-600 border-teal-400 text-white shadow-xs'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          94-98% (Target)
                        </button>
                      </div>
                    </div>

                    {/* PaCO2 Status Toggle */}
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">PaCO₂ (Capnography)</span>
                      <button
                        onClick={() => {
                          toggleRoscStep('PaCO2_Normal');
                          if (!roscCheckedSteps.includes('PaCO2_Normal')) {
                            addLog('ROSC Assessment: PaCO2 Normal (35-45 mmHg)', 'system');
                          }
                        }}
                        className={`w-full py-1 px-1 rounded text-[9px] font-bold border transition-all mt-0.5 ${
                          roscCheckedSteps.includes('PaCO2_Normal')
                            ? 'bg-teal-600 border-teal-400 text-white shadow-xs'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {roscCheckedSteps.includes('PaCO2_Normal') ? 'Normal PaCO₂ (35-45)' : 'Target PaCO₂ 35-45 mmHg'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* C - CIRCULATION */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-400 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center justify-center font-mono text-[10px] font-bold">C</span>
                      Circulation & Hemodynamics
                    </span>
                    <span className="text-[9px] text-emerald-300/80 font-mono">SBP &gt; 100 mmHg (AHA MAP &ge; 65)</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Maintain <strong className="text-emerald-200">SBP &gt; 100 mmHg</strong> (AHA target: <strong className="text-emerald-200">MAP &ge; 65 mmHg</strong>). Treat hypotension with IV fluids & vasopressor/inotrope infusions.
                  </p>

                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Blood Pressure / MAP Target</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setRoscBPStatus('hypotension');
                          addLog('ROSC Hemodynamics: Hypotension (SBP < 100 mmHg / MAP < 65)', 'system');
                          speakThai('ความดันโลหิตต่ำกว่าเกน แนะนำให้ยานออีพิเน๊ฟฟีนค่ะ');
                        }}
                        className={`py-1.5 px-2 rounded text-[10px] font-bold border transition-all ${
                          roscBPStatus === 'hypotension'
                            ? 'bg-rose-600 border-rose-400 text-white shadow-xs animate-pulse'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        SBP &lt; 100 / MAP &lt; 65
                      </button>

                      <button
                        onClick={() => {
                          setRoscBPStatus('adequate');
                          addLog('ROSC Hemodynamics: Adequate BP (SBP > 100 mmHg / MAP >= 65)', 'system');
                          speakThai('ความดันโลหิดอยู่ในเกนเป้าหมาย ซิสโตหลิกมากกว่าหนึ่งร้อยค่ะ');
                        }}
                        className={`py-1.5 px-2 rounded text-[10px] font-bold border transition-all ${
                          roscBPStatus === 'adequate'
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        SBP &gt; 100 / MAP &ge; 65 (Goal)
                      </button>
                    </div>

                    {/* Vasopressor Drip Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 mt-1 pt-1.5 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setNoradrenalineCount((prev) => prev + 1);
                          addLog('ROSC Medication: Norepinephrine Drip (0.1-0.5 mcg/kg/min)', 'med');
                          speakThai('เริ่มให้ยานออีพิเน๊ฟฟีน ดิบค่ะ');
                        }}
                        className="py-1.5 px-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 rounded text-[10px] font-bold flex items-center justify-between cursor-pointer"
                      >
                        <span>Norepinephrine Drip</span>
                        <span className="font-mono bg-emerald-900 px-1 rounded text-[9px]">#{noradrenalineCount}</span>
                      </button>

                      <button
                        onClick={() => {
                          handleLogPresetMed('Dopamine Drip 5-20 mcg/kg/min');
                        }}
                        className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[10px] font-bold flex items-center justify-between cursor-pointer"
                      >
                        <span>Dopamine Drip</span>
                        <span className="text-[9px] font-mono text-slate-400">5-20 mcg</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* D - DIAGNOSTICS */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-400 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-300 border border-amber-700 flex items-center justify-center font-mono text-[10px] font-bold">D</span>
                      Diagnostic Workup & Imaging
                    </span>
                    <span className="text-[9px] text-amber-300/80 font-mono">CT / Echo / POCUS</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Perform diagnostic evaluations to identify treatable causes (Head-to-pelvis CT, Echocardiogram, POCUS).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        toggleRoscStep('CT_Scan');
                        if (!roscCheckedSteps.includes('CT_Scan')) {
                          addLog('ROSC Diagnostic: Head-to-pelvis CT Scan Ordered/Done', 'system');
                          speakThai('ส่งตรวจ เอกซเรย์คอมพิวเตอร์ เรียบร้อยแล้วค่ะ');
                        }
                      }}
                      className={`p-1.5 rounded-lg border text-left font-bold text-[10px] cursor-pointer flex items-center justify-between transition-all ${
                        roscCheckedSteps.includes('CT_Scan')
                          ? 'bg-amber-950 border-amber-500 text-amber-200'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>Head-to-Pelvis CT</span>
                      {roscCheckedSteps.includes('CT_Scan') ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
                    </button>

                    <button
                      onClick={() => {
                        toggleRoscStep('Echocardiogram');
                        if (!roscCheckedSteps.includes('Echocardiogram')) {
                          addLog('ROSC Diagnostic: Echocardiogram Done', 'system');
                          speakThai('ส่งทำเอ๊กโค่คาดิโอแกมค่ะ');
                        }
                      }}
                      className={`p-1.5 rounded-lg border text-left font-bold text-[10px] cursor-pointer flex items-center justify-between transition-all ${
                        roscCheckedSteps.includes('Echocardiogram')
                          ? 'bg-amber-950 border-amber-500 text-amber-200'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>Echocardiogram</span>
                      {roscCheckedSteps.includes('Echocardiogram') ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
                    </button>

                    <button
                      onClick={() => {
                        toggleRoscStep('POCUS');
                        if (!roscCheckedSteps.includes('POCUS')) {
                          addLog('ROSC Diagnostic: POCUS Bedside Assessment Performed', 'system');
                          speakThai('ประเมินพ๊อยอ๊อฟแค อัลตร้าซาวค่ะ');
                        }
                      }}
                      className={`p-1.5 rounded-lg border text-left font-bold text-[10px] cursor-pointer flex items-center justify-between transition-all ${
                        roscCheckedSteps.includes('POCUS')
                          ? 'bg-amber-950 border-amber-500 text-amber-200'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>POCUS Ultrasound</span>
                      {roscCheckedSteps.includes('POCUS') ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                </div>

                {/* E - ECG 12 LEADS & STEMI SCREENING */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-rose-400 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-rose-950 text-rose-300 border border-rose-700 flex items-center justify-center font-mono text-[10px] font-bold">E</span>
                      ECG 12-Leads (R/O STEMI)
                    </span>
                    <span className="text-[9px] text-rose-300/80 font-mono">Immediate 12-Lead ECG</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Obtain 12-lead ECG immediately. If <strong className="text-rose-300">STEMI</strong> is present or high suspicion of ACS -&gt; Emergent Coronary Angiography (CAG) / PCI.
                  </p>

                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">ECG 12-Lead STEMI Result</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setRoscStemiStatus('yes');
                          addLog('ROSC 12-Lead ECG: STEMI Confirmed -> Consult Cath Lab for CAG/PCI', 'system');
                          speakThai('พบคลื่นไฟฟ้าหัวใจ กราฟยก สเตมี่ ให้เตรียมส่งทำฉีดสีหลอดเลือดหัวใจ หรือ พีซีไอ ทันทีค่ะ');
                        }}
                        className={`p-2 rounded-lg font-bold text-[10px] border transition-all text-left flex items-center justify-between ${
                          roscStemiStatus === 'yes'
                            ? 'bg-rose-600 border-rose-400 text-white shadow-xs ring-2 ring-rose-400/40'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span className="block font-black text-xs">STEMI Positive</span>
                          <span className="block text-[9px] opacity-90">Emergent CAG / PCI</span>
                        </div>
                        <AlertTriangle className="w-4 h-4 text-yellow-300 shrink-0" />
                      </button>

                      <button
                        onClick={() => {
                          setRoscStemiStatus('no');
                          addLog('ROSC 12-Lead ECG: No STEMI Elevation detected', 'system');
                          speakThai('คลื่นไฟฟ้าหัวใจ ไม่พบSTEMIค่ะ');
                        }}
                        className={`p-2 rounded-lg font-bold text-[10px] border transition-all text-left flex items-center justify-between ${
                          roscStemiStatus === 'no'
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span className="block font-black text-xs">No STEMI</span>
                          <span className="block text-[9px] opacity-90">ICU Care / Workup</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* F - FOLLOW COMMANDS & NEUROLOGICAL CARE */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-purple-400 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-purple-950 text-purple-300 border border-purple-700 flex items-center justify-center font-mono text-[10px] font-bold">F</span>
                      Follow Commands ?? (Neurological Status)
                    </span>
                    <span className="text-[9px] text-purple-300/80 font-mono">TM & EEG Management</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Assess responsiveness. If patient does <strong className="text-purple-300">NOT follow commands</strong> (Comatose) -&gt; Initiate Targeted Temperature Management (<strong className="text-purple-200">TM 32-37.5°C</strong>), continuous EEG monitoring, and brain CT.
                  </p>

                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Patient Follows Verbal Commands?</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setRoscComatoseStatus('no');
                          addLog('ROSC Neuro Status: Patient Follows Commands (Awake/Responsive)', 'system');
                          speakThai('ผู้ป่วยรู้สึกตัวและทำตามสั่งได้ค่ะ ให้การดูแลปกติในไอซียูค่ะ');
                        }}
                        className={`p-2 rounded-lg font-bold text-[10px] border transition-all text-left flex items-center justify-between ${
                          roscComatoseStatus === 'no'
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span className="block font-black text-xs">YES (Responsive)</span>
                          <span className="block text-[9px] opacity-90">Routine ICU Care</span>
                        </div>
                        <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                      </button>

                      <button
                        onClick={() => {
                          setRoscComatoseStatus('yes');
                          addLog('ROSC Neuro Status: Patient DOES NOT Follow Commands (Comatose) -> TM 32-37.5°C & EEG Protocol Initiated', 'system');
                          speakThai('ผู้ป่วยไม่รู้สึกตัว ไม่ทำตามสั่ง เริ่มการควบคุมอุณหภูมิกาย ทีเอ็ม 32 ถึง 37.5 องศา และติดคลื่นไฟฟ้าสมอง อีอีจี ทันทีค่ะ');
                        }}
                        className={`p-2 rounded-lg font-bold text-[10px] border transition-all text-left flex items-center justify-between ${
                          roscComatoseStatus === 'yes'
                            ? 'bg-purple-600 border-purple-400 text-white shadow-xs ring-2 ring-purple-400/40'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <span className="block font-black text-xs">NOT (Comatose)</span>
                          <span className="block text-[9px] opacity-90">TM 32-37.5°C & EEG</span>
                        </div>
                        <ShieldAlert className="w-4 h-4 text-purple-200 shrink-0" />
                      </button>
                    </div>

                    {/* TM and EEG Action Buttons when Comatose */}
                    {roscComatoseStatus === 'yes' && (
                      <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            toggleRoscStep('TM_32_37_5');
                            if (!roscCheckedSteps.includes('TM_32_37_5') && !roscCheckedSteps.includes('TTM_32_36')) {
                              addLog('ROSC Protocol: Temperature Control (TM 32-37.5°C) Started', 'system');
                              speakThai('เริ่มการควบคุมอุณหภูมิกาย 32 ถึง 37.5 องศาเซลเซียส แล้วค่ะ');
                            }
                          }}
                          className={`p-1.5 rounded-lg border text-left font-bold text-[10px] cursor-pointer flex items-center justify-between transition-all ${
                            roscCheckedSteps.includes('TM_32_37_5') || roscCheckedSteps.includes('TTM_32_36')
                              ? 'bg-purple-950 border-purple-500 text-purple-200'
                              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="block font-bold">Temperature Control</span>
                            <span className="block text-[8px] text-purple-300">TM 32 - 37.5°C</span>
                          </div>
                          {roscCheckedSteps.includes('TM_32_37_5') || roscCheckedSteps.includes('TTM_32_36') ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
                        </button>

                        <button
                          onClick={() => {
                            toggleRoscStep('EEG_Monitoring');
                            if (!roscCheckedSteps.includes('EEG_Monitoring')) {
                              addLog('ROSC Protocol: Continuous EEG Monitoring Started', 'system');
                              speakThai('ติดเฝ้าระวังคลื่นไฟฟ้าสมอง อีอีจี เรียบร้อยแล้วค่ะ');
                            }
                          }}
                          className={`p-1.5 rounded-lg border text-left font-bold text-[10px] cursor-pointer flex items-center justify-between transition-all ${
                            roscCheckedSteps.includes('EEG_Monitoring')
                              ? 'bg-purple-950 border-purple-500 text-purple-200'
                              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <span className="block font-bold">EEG Monitoring</span>
                            <span className="block text-[8px] text-purple-300">Brainwave monitoring</span>
                          </div>
                          {roscCheckedSteps.includes('EEG_Monitoring') ? <Check className="w-3.5 h-3.5 text-purple-400" /> : <Plus className="w-3.5 h-3.5 text-slate-500" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 5Hs & 5Ts REVERSIBLE CAUSES */}
        {activeTab === 'hsts' && (
          <div className="space-y-3">
            {/* 5Hs Column */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-cyan-400 text-xs uppercase tracking-wider">
                5Hs Reversible Causes (สาเหตุทางสรีรวิทยา)
              </h4>
              <div className="space-y-1.5">
                {FIVE_HS.map((item) => {
                  const isChecked = checked5H.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle5H(item.id)}
                      className={`w-full p-2 rounded-lg text-left transition-all cursor-pointer flex items-start gap-2 border ${
                        isChecked
                          ? 'bg-cyan-950/80 border-cyan-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="accent-cyan-500 h-4 w-4 rounded mt-0.5 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-xs block leading-tight">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5Ts Column */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-black text-amber-400 text-xs uppercase tracking-wider">
                5Ts Reversible Causes (สาเหตุทางพยาธิสภาพ)
              </h4>
              <div className="space-y-1.5">
                {FIVE_TS.map((item) => {
                  const isChecked = checked5T.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle5T(item.id)}
                      className={`w-full p-2 rounded-lg text-left transition-all cursor-pointer flex items-start gap-2 border ${
                        isChecked
                          ? 'bg-amber-950/80 border-amber-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="accent-amber-500 h-4 w-4 rounded mt-0.5 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-xs block leading-tight">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
