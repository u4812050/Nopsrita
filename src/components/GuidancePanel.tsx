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
import { AsystoleEkgIcon, PeaEkgIcon, FirstDegreeAvBlockIcon, MobitzTwoEkgIcon, CompleteHeartBlockEkgIcon } from './EkgIcons';

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
  epiAlertActive?: boolean;
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
  epiAlertActive = false,
  onOpenUnstableBradyModal,
  onOpenStableBradyModal,
  onOpenStableTachyModal,
  onOpenUnstableTachyModal,
}: GuidancePanelProps) {
  const isProceduresFlashing = ivAccessAlertActive || airwayAlertActive || etco2AlertActive;

  // ROSC sequential A > B > C > D > E > F configuration
  const ROSC_STEPS_LIST = [
    {
      id: 'A_Airway',
      letter: 'A',
      title: 'Airway Assessment & Management',
      subText: 'ET Tube & ETCO₂',
      textColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-700',
      activeRing: 'border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-950/25',
      logText: 'ROSC Step A Completed: Airway Assessment & Management (ET Tube & ETCO₂)',
      voiceText: 'ประเมินและดูแลทางเดินหายใจขั้นสูงเรียบร้อยค่ะ',
      detail: (
        <p className="text-[10px] text-slate-300">
          Assess airway patency, secure advanced airway (ET Tube) &amp; confirm placement with continuous waveform capnography (ETCO₂).
        </p>
      ),
    },
    {
      id: 'B_Breathing',
      letter: 'B',
      title: 'Breathing & Oxygenation',
      subText: 'SpO₂ 94-98% (AHA 92-98%)',
      textColor: 'text-teal-400',
      badgeBg: 'bg-teal-950 text-teal-300 border-teal-700',
      activeRing: 'border-teal-400 ring-2 ring-teal-400/50 bg-teal-950/25',
      logText: 'ROSC Step B Completed: Breathing & Oxygenation (SpO₂ 94-98%, PaCO₂ 35-45)',
      voiceText: 'ควบคุมการหายใจและระดับออกซิเจนเรียบร้อยค่ะ',
      detail: (
        <p className="text-[10px] text-slate-300">
          Maintain <strong className="text-teal-200">SpO₂ 94-98%</strong> (AHA target: 92-98%), maintain normal <strong className="text-teal-200">PaCO₂ 35-45 mmHg</strong>. Avoid hyperventilation (start 10 bpm).
        </p>
      ),
    },
    {
      id: 'C_Circulation',
      letter: 'C',
      title: 'Circulation & Hemodynamics',
      subText: 'SBP > 100 mmHg (AHA MAP ≥ 65)',
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      activeRing: 'border-emerald-400 ring-2 ring-emerald-400/50 bg-emerald-950/25',
      logText: 'ROSC Step C Completed: Circulation & Hemodynamics (Target SBP > 100 / MAP ≥ 65)',
      voiceText: 'ประเมินระบบไหลเวียนโลหิตและความดันโลหิตเรียบร้อยค่ะ',
      detail: (
        <p className="text-[10px] text-slate-300">
          Maintain <strong className="text-emerald-200">SBP &gt; 100 mmHg</strong> (AHA target: <strong className="text-emerald-200">MAP &ge; 65 mmHg</strong>). Treat hypotension with IV fluids &amp; vasopressor/inotrope infusions.
        </p>
      ),
    },
    {
      id: 'D_Diagnostics',
      letter: 'D',
      title: 'Diagnostic Workup & Imaging',
      subText: 'CT / Echo / POCUS',
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-950 text-amber-300 border-amber-700',
      activeRing: 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-950/25',
      logText: 'ROSC Step D Completed: Diagnostic Workup & Imaging (Head-to-pelvis CT, Echo, POCUS)',
      voiceText: 'ส่งตรวจวินิจฉัยหาสาเหตุเรียบร้อยค่ะ',
      detail: (
        <p className="text-[10px] text-slate-300">
          Perform diagnostic evaluations to identify treatable causes (Head-to-pelvis CT, Echocardiogram, POCUS).
        </p>
      ),
    },
    {
      id: 'E_ECG',
      letter: 'E',
      title: 'ECG 12-Leads (R/O STEMI)',
      subText: 'Immediate 12-Lead ECG',
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-700',
      activeRing: 'border-rose-400 ring-2 ring-rose-400/50 bg-rose-950/25',
      logText: 'ROSC Step E Completed: 12-Lead ECG screened for STEMI / Emergent CAG or PCI',
      voiceText: 'ตรวจคลื่นไฟฟ้าหัวใจสิบสองลีด',
      detail: (
        <p className="text-[10px] text-slate-300">
          Obtain 12-lead ECG immediately. If <strong className="text-rose-300">STEMI</strong> is present or high suspicion of ACS -&gt; Emergent Coronary Angiography (CAG) / PCI.
        </p>
      ),
    },
    {
      id: 'F_FollowCommands',
      letter: 'F',
      title: 'Follow Commands (Neurological Status)',
      subText: 'TM & EEG Management',
      textColor: 'text-purple-400',
      badgeBg: 'bg-purple-950 text-purple-300 border-purple-700',
      activeRing: 'border-purple-400 ring-2 ring-purple-400/50 bg-purple-950/25',
      logText: 'ROSC Step F Completed: Follow Commands & Neurological Care (TM 32-37.5°C & EEG)',
      voiceText: 'ประเมินการทำตามสั่งและควบคุมอุณหภูมิกายเรียบร้อย ครบทุกขั้นตอนแล้วค่ะ',
      detail: (
        <p className="text-[10px] text-slate-300">
          Assess responsiveness. If patient does <strong className="text-purple-300">NOT follow commands</strong> (Comatose) -&gt; Initiate Temperature Management (<strong className="text-purple-200">TM 32-37.5°C</strong>), continuous EEG monitoring, and brain CT.
        </p>
      ),
    },
  ];

  const isRoscStepDone = (id: string) => roscCheckedSteps.includes(id);
  const currentRoscStepIndex = ROSC_STEPS_LIST.findIndex((step) => !isRoscStepDone(step.id));
  const isAllRoscDone = currentRoscStepIndex === -1;

  const handleRoscStepClick = (index: number) => {
    const step = ROSC_STEPS_LIST[index];
    const isDone = isRoscStepDone(step.id);

    // เมื่อกดแล้วกดซ้ำไม่ได้
    if (isDone) {
      return;
    }

    // ต้องเรียงจาก A > B > C > D > E > F ตามลำดับ
    if (index !== currentRoscStepIndex) {
      const nextLetter = ROSC_STEPS_LIST[currentRoscStepIndex]?.letter;
      speakThai?.(`กรุณาทำกล่อง ${nextLetter} ตามลำดับก่อนค่ะ`);
      return;
    }

    // ทำรายการสำเร็จ
    setRoscCheckedSteps((prev) => [...prev, step.id]);
    addLog(step.logText, 'system');
    speakThai?.(step.voiceText);
  };

  const [abcCompletedSteps, setAbcCompletedSteps] = useState<string[]>([]);

  const isAbDone = abcCompletedSteps.includes('A-B');
  const isCDone = abcCompletedSteps.includes('C');
  const isIdentDone = abcCompletedSteps.includes('IDENT');

  const handleAbcStepClick = (step: 'A-B' | 'C' | 'IDENT') => {
    if (step === 'A-B') {
      if (!isAbDone) {
        setAbcCompletedSteps(prev => [...prev, 'A-B']);
        addLog('ABC Step 1 Completed: Airways (A)', 'system');
        speakThai?.('ดูแลทางเดินหายใจให้โล่ง');
      } else {
        setAbcCompletedSteps(prev => prev.filter(s => s !== 'A-B' && s !== 'C' && s !== 'IDENT'));
      }
    } else if (step === 'C') {
      if (!isAbDone) {
        speakThai?.('กรุณาทำขั้นตอน Airways (A) ก่อนนะคะ');
        return;
      }
      if (!isCDone) {
        setAbcCompletedSteps(prev => [...prev, 'C']);
        addLog('ABC Step 2 Completed: Breathing (B)', 'system');
        speakThai?.('ให้ออกซิเจน หรือ ช่วยเหลือการหายใจ');
      } else {
        setAbcCompletedSteps(prev => prev.filter(s => s !== 'C' && s !== 'IDENT'));
      }
    } else if (step === 'IDENT') {
      if (!isCDone) {
        speakThai?.('กรุณาทำขั้นตอน Breathing (B) ก่อนนะคะ');
        return;
      }
      if (!isIdentDone) {
        setAbcCompletedSteps(prev => [...prev, 'IDENT']);
        addLog('ABC Step 3 Completed: Circulation (C) (A-B-C Complete)', 'system');
      }
      speakThai?.('ประเมินไวทอลซาย อีเคจี เปิดเส้นเลือด ประเมินอีเคจีสิบสองลี๋ด', () => {
        setShowStabilityModal?.(true);
      });
    }
  };





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

      {/* Main Tab Content Body (Scrollable) */}
      <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5 text-slate-200 text-xs">
        {/* TAB 1: CARDIAC ARREST */}
        {activeTab === 'trc_cardiac' && (
          <div className="space-y-2">
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
                  <span className="text-[8.5px] text-slate-400 block leading-tight">Push Hard 5-6cm, Push Fast 100-120bpm, Fully Recoil, Avoid Hyperventilation, Minimize interruption &lt;10s, Change person every 2min.</span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/80">
                  <span className="text-rose-300 font-bold block text-[9.5px]">2. Shockable (VF/pVT)</span>
                  <span className="text-[8.5px] text-slate-400 block leading-tight">Shock 200J → CPR 2m → Shock 200J → CPR 2m+Epi 1mg → Shock 200J → CPR 2m+Amio300mg</span>
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
            {/* Clinical Stability Display Status (Read-only) */}
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-2 -mt-[6px]">
              <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 gap-2 min-h-[50px] -mt-[5px]">
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

              {/* Treat Cause & Ident.(A-B-C) Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/80 border-2 border-cyan-500/80 p-3 rounded-xl shadow-lg space-y-2 h-[233px] -mt-[5px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black text-cyan-300 uppercase tracking-tight flex items-center gap-1">
                        ⚡ Treat Cause &amp; Ident.(A-B-C)
                      </h4>
                      <p className="text-[10px] text-slate-300 font-medium">
                        กดจาก A &gt; B &gt; C เมื่อครบให้ประเมิน Stable/Unstable ต่อ
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
                        Airways (A)
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-300 leading-tight">จัดท่า เปิดทางเดินหายใจ (Head tilt-chin lift/Jaw thrust)</span>
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
                        Breathing (B)
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-300 leading-tight">ให้ออกซิเจน หรือช่วยเหลือการหายใจหากจำเป็น ถ้า O₂ sat &lt; 94%</span>
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
                        Circulation (C)
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-300 leading-tight">Monitor V/S, EKG ,IV/IO, 12-lead ECG</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STABLE SPECIFIC ACTIONS */}
            {stabilityStatus === 'stable' && (
              <div className="space-y-2">
                {/* Status Indicator */}
                <div className="bg-emerald-950/40 border border-emerald-800/80 p-2 rounded-lg flex items-center justify-between text-[10px]">
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    STABLE PROTOCOL: ยาและหัตถการสำหรับผู้ป่วยอาการคงที่ ({lastRhythmDecision === 'bradycardia' ? 'Bradycardia' : lastRhythmDecision === 'tachycardia' ? 'Tachycardia' : 'Brady / Tachy'})
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
                    UNSTABLE PROTOCOL: หัตถการและยาวิกฤตสำหรับผู้ป่วยไม่คงที่ ({lastRhythmDecision === 'bradycardia' ? 'Bradycardia' : lastRhythmDecision === 'tachycardia' ? 'Tachycardia' : 'Brady / Tachy'})
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
              <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 shrink-0">
                    <Heart className="w-4 h-4 fill-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider whitespace-nowrap">
                      Post-Cardiac Arrest Care Protocol
                    </h3>
                    <span className="text-[10px] text-emerald-300/80 font-mono block whitespace-nowrap">
                      ABCDEF Approach Guidelines
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-900/90 text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse whitespace-nowrap shrink-0 mt-[25px]">
                  ROSC Active
                </span>
              </div>



              {/* ABCDEF STEP CARDS (SEQUENTIAL: A > B > C > D > E > F) */}
              <div className="space-y-2.5 text-[11px]">
                {ROSC_STEPS_LIST.map((step, index) => {
                  const isDone = isRoscStepDone(step.id);
                  const isCurrent = index === currentRoscStepIndex;
                  const isLocked = !isDone && !isCurrent;

                  return (
                    <div
                      key={step.id}
                      id={`rosc_step_box_${step.letter.toLowerCase()}`}
                      onClick={() => handleRoscStepClick(index)}
                      className={`p-2.5 rounded-xl border transition-all space-y-2 select-none ${
                        isDone
                          ? 'bg-slate-950/90 border-emerald-800/80 cursor-default opacity-90'
                          : isCurrent
                          ? `bg-slate-900/90 ${step.activeRing} cursor-pointer hover:bg-slate-850 active:scale-[0.99] shadow-lg shadow-black/40`
                          : 'bg-slate-950/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                        <span
                          className={`font-black ${
                            isDone ? 'text-emerald-300' : isCurrent ? step.textColor : 'text-slate-400'
                          } flex items-center gap-1.5 text-xs whitespace-nowrap`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center font-mono text-[10px] font-bold ${
                              isDone
                                ? 'bg-emerald-900/90 text-emerald-300 border-emerald-600'
                                : isCurrent
                                ? `${step.badgeBg} ring-1 ring-emerald-400/80`
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}
                          >
                            {isDone ? <Check className="w-3 h-3 text-emerald-300 stroke-[3]" /> : step.letter}
                          </span>
                          {step.title}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-mono whitespace-nowrap ${
                              isDone ? 'text-emerald-400/70' : 'text-slate-400'
                            }`}
                          >
                            {step.subText}
                          </span>
                          {isDone && (
                            <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.2 rounded font-mono font-bold whitespace-nowrap flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5 text-emerald-400" /> Done
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.2 rounded font-mono font-bold whitespace-nowrap animate-pulse flex items-center gap-1">
                              แตะเลือก ({step.letter})
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[8px] text-slate-500 border border-slate-800/80 px-1 py-0.2 rounded font-mono whitespace-nowrap flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5 text-slate-500" /> รอ {ROSC_STEPS_LIST[currentRoscStepIndex]?.letter}
                            </span>
                          )}
                        </div>
                      </div>
                      {step.detail}
                    </div>
                  );
                })}
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
