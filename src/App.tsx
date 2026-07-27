/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Clipboard, 
  Volume2, 
  AlertTriangle, 
  HeartHandshake, 
  Clock, 
  Zap, 
  CheckSquare, 
  FileSpreadsheet, 
  FileDown,
  Printer,
  Plus, 
  PlusCircle, 
  Settings, 
  Trash2,
  ListFilter,
  Activity,
  Heart,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateResuscitationPDF } from './utils/pdfReport';

interface LogEntry {
  id: string;
  time: string;      // Actual system time (e.g., "14:25:01")
  elapsed: string;   // Case elapsed time (e.g., "02:15")
  text: string;      // Description of the action
  type: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system';
}

const SAVE_KEY = 'smart_acls_copilot_state_v2';

const PROCEDURE_PRESETS = [
  { name: 'Advanced Airway Secured (ET Tube)', short: 'Airway Secured' },
  { name: 'Intubation Confirmed by ETCO2', short: 'ETCO2 Confirmed' },
  { name: 'IV / IO Line Established', short: 'IV Access' },
  { name: 'Arterial Blood Gas (ABG) Drawn', short: 'ABG Drawn' },
  { name: 'Mechanical Chest Compressor Applied', short: 'Mechanical CPR' },
  { name: 'ROSC Achieved (Return of Spontaneous Circulation)', short: 'ROSC' },
];

// Mini EKG Waveform Component for VF (Ventricular Fibrillation)
function VfEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded border border-red-900/60 p-0.5 relative overflow-hidden flex items-center justify-center shrink-0 shadow-inner`}>
      {/* AHA Red Grid Background */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="12" y1="0" x2="12" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="24" y1="0" x2="24" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="36" y1="0" x2="36" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="48" y1="0" x2="48" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      {/* High-Contrast Chaotic Coarse VF Waveform */}
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-10 overflow-visible">
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
function VtEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded border border-slate-700/80 p-0.5 relative overflow-hidden flex items-center justify-center shrink-0 shadow-inner`}>
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="15" y1="0" x2="15" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="30" y1="0" x2="30" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="45" y1="0" x2="45" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-10">
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
function AsystoleEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded border border-slate-700/80 p-0.5 relative overflow-hidden flex items-center justify-center shrink-0 shadow-inner`}>
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="15" y1="0" x2="15" y2="30" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="30" y1="0" x2="30" y2="30" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="45" y1="0" x2="45" y2="30" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-10">
        <path
          d="M0 15 L22 15 L24 14 L26 16 L28 15 L60 15"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// Mini EKG Waveform Component for PEA (Pulseless Electrical Activity)
function PeaEkgIcon({ className = "w-14 h-8" }: { className?: string }) {
  return (
    <div className={`${className} bg-slate-950 rounded border border-amber-500/60 p-0.5 relative overflow-hidden flex items-center justify-center shrink-0 shadow-inner`}>
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 60 30">
        <line x1="0" y1="7.5" x2="60" y2="7.5" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="15" x2="60" y2="15" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="0" y1="22.5" x2="60" y2="22.5" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="15" y1="0" x2="15" y2="30" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="30" y1="0" x2="30" y2="30" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
        <line x1="45" y1="0" x2="45" y2="30" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1,1" />
      </svg>
      <svg viewBox="0 0 60 30" className="w-full h-full relative z-10">
        <path
          d="M0 18 L6 18 Q8 15 10 18 L12 18 L14 22 L16 2 L18 26 L20 18 L24 18 Q28 12 32 18 L60 18"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* NO PULSE Badge Overlay inside EKG preview image */}
      <div className="absolute bottom-0.5 right-0.5 bg-red-600 text-white font-black text-[6.5px] px-1 rounded-[2px] leading-tight z-20 uppercase tracking-tighter border border-red-400 shadow-xs">
        NO PULSE
      </div>
    </div>
  );
}

export default function App() {
  // --- SYSTEM STATES ---
  const [systemTime, setSystemTime] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [metronomeOn, setMetronomeOn] = useState<boolean>(true);
  const [metronomeTempo, setMetronomeTempo] = useState<number>(110);
  const [metronomeMode, setMetronomeMode] = useState<'30:2' | 'continuous'>('30:2');
  const [metronomeBeat, setMetronomeBeat] = useState<number>(0);
  const metronomeBeatRef = useRef<number>(0);
  const cprSubCycleRef = useRef<number>(1);
  const lastPulseCheckedCycleRef = useRef<number>(0);
  const [voiceAlertsOn, setVoiceAlertsOn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'hsts' | 'trc_cardiac' | 'trc_tachy_brady' | 'trc_rosc' | 'medHistory'>('trc_cardiac');
  const [audioTesting, setAudioTesting] = useState<boolean>(false);

  // --- CORE CLINICAL STATES ---
  const [caseActive, setCaseActive] = useState<boolean>(false);
  const [caseStartTime, setCaseStartTime] = useState<number | null>(null);
  const [caseElapsedSeconds, setCaseElapsedSeconds] = useState<number>(0);
  
  // Timers
  const [cprTimeRemaining, setCprTimeRemaining] = useState<number>(120); // 120s (2 minutes)
  const [cprActive, setCprActive] = useState<boolean>(false);
  const [cprCycle, setCprCycle] = useState<number>(1);
  const [cprSubCycle302, setCprSubCycle302] = useState<number>(1); // 30:2 x 5 Cycles
  
  const [epiTimeRemaining, setEpiTimeRemaining] = useState<number>(240); // 240s (4 minutes)
  const [epiAlertActive, setEpiAlertActive] = useState<boolean>(false);
  const [epiTimerStarted, setEpiTimerStarted] = useState<boolean>(false);
  const [amioAlertActive, setAmioAlertActive] = useState<boolean>(false);
  const [lidoAlertActive, setLidoAlertActive] = useState<boolean>(false);
  const [ivAccessAlertActive, setIvAccessAlertActive] = useState<boolean>(false);
  const [airwayAlertActive, setAirwayAlertActive] = useState<boolean>(false);
  const [etco2AlertActive, setEtco2AlertActive] = useState<boolean>(false);
  const [completedProcedures, setCompletedProcedures] = useState<string[]>([]);

  const hasCompletedIvAccess = completedProcedures.some(p => p.includes('IV / IO') || p.includes('IV Access') || p.includes('IV Line'));
  const hasCompletedAirway = completedProcedures.some(p => p.includes('Advanced Airway') || p.includes('ET Tube') || p.includes('ET-Tube'));
  const hasCompletedEtco2 = completedProcedures.some(p => p.includes('Intubation Confirmed') || p.includes('ETCO2') || p.includes('Capnography') || p.includes('PETCO2'));
  
  // Counters
  const [epiCount, setEpiCount] = useState<number>(0);
  const [shockCount, setShockCount] = useState<number>(0);
  const [amioCount, setAmioCount] = useState<number>(0);
  const [lidoCount, setLidoCount] = useState<number>(0);
  const [atropineCount, setAtropineCount] = useState<number>(0);
  const [adenosineCount, setAdenosineCount] = useState<number>(0);
  const [adrenalineInfCount, setAdrenalineInfCount] = useState<number>(0);
  const [dopamineInfCount, setDopamineInfCount] = useState<number>(0);
  const [reassessWarningActive, setReassessWarningActive] = useState<boolean>(false);
  
  // Tachycardia Flashing Button Flow States
  const [tachyVagalFlashing, setTachyVagalFlashing] = useState<boolean>(false);
  const [tachyAmioFlashing, setTachyAmioFlashing] = useState<boolean>(false);
  const [tachyConsultFlashing, setTachyConsultFlashing] = useState<boolean>(false);
  
  // Decision guiding text and history
  const [lastRhythmDecision, setLastRhythmDecision] = useState<'shockable' | 'non-shockable' | 'bradycardia' | 'tachycardia' | 'rosc' | null>(null);
  const [selectedShockableRhythm, setSelectedShockableRhythm] = useState<'VF' | 'Pulseless VT' | null>(null);
  const [selectedNonShockableRhythm, setSelectedNonShockableRhythm] = useState<'Asystole' | 'PEA' | null>(null);
  const [stabilityStatus, setStabilityStatus] = useState<'stable' | 'unstable' | null>(null);

  // ROSC Post-Cardiac Arrest Care State
  const [noradrenalineCount, setNoradrenalineCount] = useState<number>(0);
  const [roscCheckedSteps, setRoscCheckedSteps] = useState<string[]>([]);
  const [roscStemiStatus, setRoscStemiStatus] = useState<'yes' | 'no' | 'unknown'>('unknown');
  const [roscSpO2Level, setRoscSpO2Level] = useState<'low' | 'normal' | 'high' | 'unknown'>('unknown');
  const [roscBPStatus, setRoscBPStatus] = useState<'hypotension' | 'adequate' | 'unknown'>('unknown');
  const [roscComatoseStatus, setRoscComatoseStatus] = useState<'yes' | 'no' | 'unknown'>('unknown');
  const [guidanceMessage, setGuidanceMessage] = useState<string>(
    "Initiate CPR immediately. Tap SHOCKABLE or NON-SHOCKABLE to log rhythms and receive AHA Guideline support."
  );

  // Lists and Checklists
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [customNote, setCustomNote] = useState<string>('');
  const [checked5H, setChecked5H] = useState<string[]>([]);
  const [checked5T, setChecked5T] = useState<string[]>([]);

  // Dialog / Warning state
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // 10-Second Pulse & EKG assessment timer states
  const [pulseCheckActive, setPulseCheckActive] = useState<boolean>(false);
  const [pulseCheckTime, setPulseCheckTime] = useState<number>(10);
  const [cprButtonFlash, setCprButtonFlash] = useState<boolean>(false);

  // Web Audio Context reference for synthesiser metronome (110 BPM)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  // --- SYSTEM TIME CLOCK ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- SCROLL TO LOG END ---
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // --- LOCAL STORAGE CORE STATE LOADER ---
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.caseActive) {
          setCaseActive(parsed.caseActive);
          setCaseStartTime(parsed.caseStartTime);
          setCaseElapsedSeconds(parsed.caseElapsedSeconds || 0);
          setCprTimeRemaining(parsed.cprTimeRemaining ?? 120);
          setCprActive(false); // Pause timers initially for safety on page reload
          setCprCycle(parsed.cprCycle || 1);
          setCprSubCycle302(parsed.cprSubCycle302 || 1);
          cprSubCycleRef.current = parsed.cprSubCycle302 || 1;
          setEpiTimeRemaining(parsed.epiTimeRemaining ?? 240);
          setEpiTimerStarted(parsed.epiTimerStarted || false);
          setEpiCount(parsed.epiCount || 0);
          setShockCount(parsed.shockCount || 0);
          setAmioCount(parsed.amioCount || 0);
          setAmioAlertActive(parsed.amioAlertActive || false);
          setLidoCount(parsed.lidoCount || 0);
          setLidoAlertActive(parsed.lidoAlertActive || false);
          setIvAccessAlertActive(parsed.ivAccessAlertActive || false);
          setAirwayAlertActive(parsed.airwayAlertActive || false);
          setEtco2AlertActive(parsed.etco2AlertActive || false);
          setCompletedProcedures(parsed.completedProcedures || []);
          setAtropineCount(parsed.atropineCount || 0);
          setAdenosineCount(parsed.adenosineCount || 0);
          setAdrenalineInfCount(parsed.adrenalineInfCount || 0);
          setDopamineInfCount(parsed.dopamineInfCount || 0);
          setReassessWarningActive(parsed.reassessWarningActive || false);
          setLogs(parsed.logs || []);
          setChecked5H(parsed.checked5H || []);
          setChecked5T(parsed.checked5T || []);
          setLastRhythmDecision(parsed.lastRhythmDecision || null);
          setSelectedShockableRhythm(parsed.selectedShockableRhythm || null);
          setSelectedNonShockableRhythm(parsed.selectedNonShockableRhythm || null);
          setStabilityStatus(parsed.stabilityStatus || null);
          setGuidanceMessage(parsed.guidanceMessage || "");
          
          setNoradrenalineCount(parsed.noradrenalineCount || 0);
          setRoscCheckedSteps(parsed.roscCheckedSteps || []);
          setRoscStemiStatus(parsed.roscStemiStatus || 'unknown');
          setRoscSpO2Level(parsed.roscSpO2Level || 'unknown');
          setRoscBPStatus(parsed.roscBPStatus || 'unknown');
          setRoscComatoseStatus(parsed.roscComatoseStatus || 'unknown');
          setMetronomeOn(parsed.metronomeOn !== undefined ? parsed.metronomeOn : true);
        }
      } catch (e) {
        console.error("Failed to load ACLS state from localStorage:", e);
      }
    }
  }, []);

  // --- LOCAL STORAGE CORE STATE WRITER ---
  useEffect(() => {
    if (caseActive) {
      const stateToSave = {
        caseActive,
        caseStartTime,
        caseElapsedSeconds,
        cprTimeRemaining,
        cprActive,
        cprCycle,
        cprSubCycle302,
        epiTimeRemaining,
        epiTimerStarted,
        epiCount,
        shockCount,
        amioCount,
        amioAlertActive,
        lidoCount,
        lidoAlertActive,
        atropineCount,
        adenosineCount,
        adrenalineInfCount,
        dopamineInfCount,
        reassessWarningActive,
        logs,
        checked5H,
        checked5T,
        lastRhythmDecision,
        selectedShockableRhythm,
        selectedNonShockableRhythm,
        stabilityStatus,
        guidanceMessage,
        ivAccessAlertActive,
        airwayAlertActive,
        etco2AlertActive,
        completedProcedures,
        noradrenalineCount,
        roscCheckedSteps,
        roscStemiStatus,
        roscSpO2Level,
        roscBPStatus,
        roscComatoseStatus,
        metronomeOn
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
    }
  }, [
    caseActive,
    caseStartTime,
    caseElapsedSeconds,
    cprTimeRemaining,
    cprActive,
    cprCycle,
    cprSubCycle302,
    epiTimeRemaining,
    epiTimerStarted,
    epiCount,
    shockCount,
    amioCount,
    amioAlertActive,
    lidoCount,
    lidoAlertActive,
    ivAccessAlertActive,
    airwayAlertActive,
    etco2AlertActive,
    atropineCount,
    adenosineCount,
    adrenalineInfCount,
    dopamineInfCount,
    reassessWarningActive,
    logs,
    checked5H,
    checked5T,
    lastRhythmDecision,
    selectedShockableRhythm,
    selectedNonShockableRhythm,
    stabilityStatus,
    guidanceMessage,
    noradrenalineCount,
    roscCheckedSteps,
    roscStemiStatus,
    roscSpO2Level,
    roscBPStatus,
    roscComatoseStatus,
    metronomeOn
  ]);

  const thaiVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const thaiVoices = voices.filter(v => 
          v.lang === 'th-TH' || 
          v.lang.toLowerCase().includes('th')
        );
        if (thaiVoices.length > 0) {
          let selectedVoice = thaiVoices.find(v => v.name.includes('Narisa'));
          if (!selectedVoice) {
            selectedVoice = thaiVoices.find(v => v.name.toLowerCase().includes('google'));
          }
          if (!selectedVoice) {
            selectedVoice = thaiVoices.find(v => v.name.toLowerCase().includes('kanya'));
          }
          if (!selectedVoice) {
            selectedVoice = thaiVoices.find(v => 
              v.name.toLowerCase().includes('premium') || 
              v.name.toLowerCase().includes('enhanced')
            );
          }
          if (!selectedVoice) {
            selectedVoice = thaiVoices[0];
          }
          thaiVoiceRef.current = selectedVoice;
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // --- UNLOCK WEB AUDIO API ON FIRST USER INTERACTION ---
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // --- CLINICAL ALARM & AUDIO CHIME GENERATOR (Web Audio API) ---
  const playAlertChime = (type: 'cpr_expire' | 'pulse_check' | 'med_due' | 'vent_cue' | 'mode_switch' | 'test') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      if (type === 'cpr_expire') {
        // 3-tone urgent clinical bell chime (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.25, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.36);
        });
      } else if (type === 'pulse_check') {
        // 2-tone pulse ping
        [880, 1174.66].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.22, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.26);
        });
      } else if (type === 'med_due') {
        // Attention double-beep chime for Epinephrine & Medication Due
        [750, 750].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          gain.gain.setValueAtTime(0.25, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.13);
        });
      } else if (type === 'vent_cue') {
        // Gentle 2-stage ventilation cue sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.22);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.33);
      } else if (type === 'mode_switch') {
        // Ascending chord chime for mode switch
        [440, 554.37, 659.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.2, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.31);
        });
      } else if (type === 'test') {
        // Full test chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.2, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.26);
        });
      }
    } catch (err) {
      console.warn("Audio Chime API error:", err);
    }
  };

  // --- VOICE SPEECH HELPER (Thai Language) ---
  const speakThai = (text: string, onEnd?: () => void, customRate?: number) => {
    if (!voiceAlertsOn) {
      if (onEnd) onEnd();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        // Convert text to beautiful phonetic Thai and append polite words
        let spokenText = text;

        // Map English medical words and acronyms to highly accurate phonetic Thai pronunciation
        const phoneticMap: { [key: string]: string } = {
          "Amiodarone": "อะมิโอดาโรน",
          "Lidocaine": "ลิโดเคน",
          "Epinephrine": "เอพิเนฟริน",
          "Magnesium": "แมกนีเซียม",
          "Atropine": "อะโทรพีน",
          "Sodium": "โซเดียม",
          "Bicarbonate": "ไบคาร์บอเนต",
          "Calcium": "แคลเซียม",
          "Gluconate": "กลูโคเนต",
          "CPR": "ซีพีอาร์",
          "EKG": "อีเคจี",
          "ECG": "อีซีจี",
          "Shockable": "ช็อคได้",
          "Non-Shockable": "ช็อคไม่ได้",
          "VF/pVT": "วีเอฟ หรือ พีวีที",
          "PEA/Asystole": "พีอีเอ หรือ อะซิสโทลี",
          "Cycle": "ไซเคิล"
        };

        // Replace English medical terminology with Thai pronunciation to prevent spelling-out or distortion
        Object.keys(phoneticMap).forEach(key => {
          const regex = new RegExp(key, 'gi');
          spokenText = spokenText.replace(regex, phoneticMap[key]);
        });

        // Check if this is a countdown number or a Cycle 1..4 alert that should NOT have "ค่ะ" appended
        const isCountdown = ["สิบ", "เก้า", "แปด", "เจ็ด", "หก", "ห้า", "สี่", "สาม", "สอง", "หนึ่ง", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"].includes(spokenText.trim());
        const isCycleNoSuffix = /^((Cycle|ไซเคิล)\s*\d+)$/i.test(spokenText.trim()) || spokenText.includes("ครบ 5 ไซเคิล");

        // Cancel any ongoing speech unless it's a tight countdown beat to ensure immediate alert delivery
        if (!isCountdown) {
          window.speechSynthesis.cancel();
        }

        if (!isCountdown && !isCycleNoSuffix && !spokenText.endsWith("ค่ะ") && !spokenText.endsWith("ครับ") && !spokenText.endsWith("นะคะ")) {
          // Clean up any trailing spaces or punctuation before appending polite particle
          spokenText = spokenText.trim().replace(/[.!?]+$/, '') + " ค่ะ";
        }

        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = 'th-TH';
        utterance.volume = 1.0; // Maximum clarity for noisy clinical resuscitation rooms
        utterance.rate = customRate !== undefined ? customRate : 1.1; // Default rate 1.1 for all system voice alerts
        utterance.pitch = 1.05; // Slightly sweet, clear, friendly feminine tone
        
        if (onEnd) {
          let hasCalledEnd = false;
          utterance.onend = () => {
            if (!hasCalledEnd) {
              hasCalledEnd = true;
              onEnd();
            }
          };
        }
        
        // Use cached voice if possible, otherwise query fallback
        let selectedVoice = thaiVoiceRef.current;
        if (!selectedVoice) {
          const voices = window.speechSynthesis.getVoices();
          const thaiVoices = voices.filter(v => 
            v.lang === 'th-TH' || 
            v.lang.toLowerCase().includes('th')
          );
          if (thaiVoices.length > 0) {
            selectedVoice = thaiVoices.find(v => v.name.includes('Narisa')) ||
                            thaiVoices.find(v => v.name.toLowerCase().includes('google')) ||
                            thaiVoices.find(v => v.name.toLowerCase().includes('kanya')) ||
                            thaiVoices[0];
            thaiVoiceRef.current = selectedVoice;
          }
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Speech Synthesis error:", err);
        if (onEnd) onEnd();
      }
    } else {
      if (onEnd) onEnd();
    }
  };

  const triggerReassessmentAlert = (treatmentName: string, speechText: string, skipLog: boolean = false) => {
    setReassessWarningActive(true);
    if (!skipLog) {
      addLog(`ALERT: ${treatmentName} administered. Reassess patient stable vs unstable status immediately (ประเมินอาการคงที่ และไม่คงที่ ซ้ำอีกครั้ง)!`, "system");
    }
    playAlertChime('med_due');
    speakThai(speechText);
  };

  // --- AUDIO TESTER ---
  const testAudioSystem = () => {
    setAudioTesting(true);
    playAlertChime('test');
    setTimeout(() => {
      playAlertChime('vent_cue');
    }, 400);
    setTimeout(() => {
      speakThai("ระบบเสียงเตือนและสัญญาณเสียงการช่วยชีวิตขั้นสูง พร้อมใช้งานแล้วนะคะ");
    }, 900);
    setTimeout(() => setAudioTesting(false), 3800);
  };

  // --- METRONOME SYNTH (110 BPM, Web Audio) ---
  const playSynthesizedTick = (isAccent: boolean = false) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1200 : 900, ctx.currentTime);
      
      gain.gain.setValueAtTime(isAccent ? 0.22 : 0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isAccent ? 0.08 : 0.05));
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + (isAccent ? 0.09 : 0.06));
    } catch (err) {
      console.warn("Metronome Audio API error:", err);
    }
  };

  // Metronome Clock Trigger (Dynamic BPM for CPR, 1 second (1000ms) per silent ventilation in 30:2)
  useEffect(() => {
    let timerId: any = null;

    if (cprActive && metronomeOn) {
      const scheduleNextTick = () => {
        const intervalMs = (60 / metronomeTempo) * 1000;

        if (metronomeMode === '30:2') {
          // Cycle of 32 steps: 1..30 compressions (sound), 31..32 ventilations (silent, 1 sec each)
          metronomeBeatRef.current = (metronomeBeatRef.current % 32) + 1;
          const currentBeat = metronomeBeatRef.current;
          setMetronomeBeat(currentBeat);

          let nextDelayMs = intervalMs;
          if (currentBeat <= 30) {
            // Chest compression sound tick (accent on beat 30)
            playSynthesizedTick(currentBeat === 30);
            // After beat 30, pause 1000ms before showing Breath 1
            nextDelayMs = currentBeat === 30 ? 1000 : intervalMs;
          } else if (currentBeat === 31) {
            // Breath 1/2: SILENT. Pause 1000ms before showing Breath 2
            nextDelayMs = 1000;
          } else if (currentBeat === 32) {
            // Breath 2/2: SILENT. Pause 1000ms before returning to Beat 1
            nextDelayMs = 1000;

            // Increment 30:2 sub-cycle count (1 to 5)
            const completedCycle = cprSubCycleRef.current;
            if (completedCycle === 5) {
              cprSubCycleRef.current = 1;
              setCprSubCycle302(1);
              setCprActive(false);
              setCprTimeRemaining(120);
              metronomeBeatRef.current = 0;
              setMetronomeBeat(0);

              const currentCycleNumber = cprCycle;
              if (lastPulseCheckedCycleRef.current !== currentCycleNumber) {
                lastPulseCheckedCycleRef.current = currentCycleNumber;
                setCprCycle(c => c + 1);
                playAlertChime('cpr_expire');
                speakThai("ครบ 5 ไซเคิล รีบประเมินชีพจรและอีเคจี", () => {
                  setPulseCheckActive(true);
                  setPulseCheckTime(10);
                }, 1.1);
              }
              return;
            } else {
              const nextCycle = completedCycle + 1;
              cprSubCycleRef.current = nextCycle;
              setCprSubCycle302(nextCycle);

              speakThai(`${completedCycle}`);
            }
          }

          timerId = setTimeout(scheduleNextTick, nextDelayMs);
        } else {
          // Continuous compression ticks (110 BPM)
          metronomeBeatRef.current = (metronomeBeatRef.current % 30) + 1;
          const currentBeat = metronomeBeatRef.current;
          setMetronomeBeat(currentBeat);
          playSynthesizedTick(currentBeat === 30);

          // Ventilation audio cue sound every 11 beats (≈ 6.0 seconds at 110 BPM)
          if (currentBeat % 11 === 0) {
            playAlertChime('vent_cue');
          }

          timerId = setTimeout(scheduleNextTick, intervalMs);
        }
      };

      scheduleNextTick();
    } else {
      metronomeBeatRef.current = 0;
      setMetronomeBeat(0);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [cprActive, metronomeOn, metronomeTempo, metronomeMode, cprCycle]);

  // --- UNIFIED CLOCK & ALERTS TICKER ---
  useEffect(() => {
    let mainTicker: any = null;
    if (caseActive) {
      mainTicker = setInterval(() => {
        // 1. Increment Elapsed Time
        setCaseElapsedSeconds(prev => prev + 1);

        // 2. Main CPR Timer (120 seconds cycle)
        if (cprActive) {
          setCprTimeRemaining(prev => {
            const nextValue = prev - 1;
            
            // Warnings (Only in Continuous CPR mode)
            if (nextValue === 30 && metronomeMode !== '30:2') {
              playAlertChime('med_due');
              speakThai("เหลือเวลา 30 วินาที เตรียมเช็คริทึ่ม และเตรียมยา");
            }
            
            if (nextValue <= 0) {
              setCprActive(false);
              setCprSubCycle302(1);
              cprSubCycleRef.current = 1;

              const currentCycleNumber = cprCycle;
              if (lastPulseCheckedCycleRef.current !== currentCycleNumber) {
                lastPulseCheckedCycleRef.current = currentCycleNumber;
                setCprCycle(c => c + 1);
                playAlertChime('cpr_expire');
                speakThai("ครบ 2 นาที รีบประเมินชีพจรและอีเคจี ค่ะ", () => {
                  setPulseCheckActive(true);
                  setPulseCheckTime(10);
                });
              }
              return 120; // reset for next cycle
            }
            return nextValue;
          });
        }

        // 3. Epinephrine Tracker (240 seconds / 4 mins cycle)
        if (epiTimerStarted) {
          setEpiTimeRemaining(prev => {
            if (prev <= 1) {
              if (prev === 1) {
                playAlertChime('med_due');
                speakThai("ถึงเวลาให้ยาเอพิเนฟริน");
                setEpiAlertActive(true);
              }
              return 0; // lock at 0 and display warning badge
            }
            return prev - 1;
          });
        }

      }, 1000);
    }
    return () => {
      if (mainTicker) clearInterval(mainTicker);
    };
  }, [caseActive, cprActive, cprCycle, voiceAlertsOn, epiTimerStarted, metronomeMode]);

  // --- PULSE & EKG CHECK TIMER EFFECT (10 Seconds Max) ---
  useEffect(() => {
    let pulseTicker: any = null;
    if (pulseCheckActive) {
      pulseTicker = setInterval(() => {
        setPulseCheckTime(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (pulseTicker) clearInterval(pulseTicker);
    };
  }, [pulseCheckActive]);

  // --- PULSE & EKG CHECK TIMEOUT EFFECT (Fires exactly 1 time on expiration) ---
  useEffect(() => {
    if (pulseCheckActive && pulseCheckTime === 0) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
      setCprButtonFlash(true);

      playAlertChime('pulse_check');
      speakThai("หมดเวลาประเมินชีพจรและอีเคจีรีบซีพีอาต่อค่ะ", () => {
        if (!caseActive) {
          setCaseActive(true);
          setCaseStartTime(Date.now());
        }
        setCprActive(true);
        setCprButtonFlash(false);
      }, 1.1);
    }
  }, [pulseCheckTime, pulseCheckActive]);

  // --- PULSE & EKG VOICE COUNTDOWN EFFECT ---
  useEffect(() => {
    if (pulseCheckActive) {
      if (pulseCheckTime === 10) {
        speakThai("สิบ");
      } else if (pulseCheckTime === 9) {
        speakThai("เก้า");
      } else if (pulseCheckTime === 8) {
        speakThai("แปด");
      } else if (pulseCheckTime === 7) {
        speakThai("เจ็ด");
      } else if (pulseCheckTime === 6) {
        speakThai("หก");
      } else if (pulseCheckTime === 5) {
        speakThai("ห้า");
      } else if (pulseCheckTime === 4) {
        speakThai("สี่");
      } else if (pulseCheckTime === 3) {
        speakThai("สาม");
      } else if (pulseCheckTime === 2) {
        speakThai("สอง");
      } else if (pulseCheckTime === 1) {
        speakThai("หนึ่ง");
      }
    }
  }, [pulseCheckTime, pulseCheckActive]);

  // --- DISABLE CPR BUTTON FLASH WHEN CPR ACTIVE OR PULSE CHECK ACTIVE ---
  useEffect(() => {
    if (cprActive || pulseCheckActive) {
      setCprButtonFlash(false);
    }
  }, [cprActive, pulseCheckActive]);

  const startPulseCheck = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
      addLog("Case Started / Code Blue Resuscitation Activated", "system");
    }
    // Pause CPR automatically during pulse check
    if (cprActive) {
      setCprActive(false);
    }
    setPulseCheckActive(true);
    setPulseCheckTime(10);
  };

  const cancelPulseCheck = () => {
    setPulseCheckActive(false);
    setPulseCheckTime(10);
    addLog("Pulse & EKG Assessment Timer stopped manually", "system");
    speakThai("ยกเลิกการจับเวลาประเมินชีพจร");
  };

  // --- LOG WRITING FUNCTION ---
  const addLog = (text: string, type: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system' = 'note') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    
    const minutes = Math.floor(caseElapsedSeconds / 60);
    const seconds = caseElapsedSeconds % 60;
    const elapsedStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      time: timeStr,
      elapsed: elapsedStr,
      text,
      type
    };

    setLogs(prev => [...prev, newEntry]);
  };

  // --- ACTION HANDLERS ---
  
  // Start / Pause CPR Timer
  const toggleCPR = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
      addLog("Case Started / Code Blue Resuscitation Activated", "system");
    }
    
    if (pulseCheckActive) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
      addLog("Pulse check cancelled by manually starting CPR", "system");
    }

    if (cprActive) {
      setCprActive(false);
    } else {
      setCprActive(true);
      speakThai("เริ่ม CPR", undefined, 1.1);
    }
  };

  // Reset current CPR Cycle manually
  const resetCPRCycle = () => {
    setCprTimeRemaining(120);
    setCprSubCycle302(1);
    cprSubCycleRef.current = 1;
    addLog(`CPR Cycle ${cprCycle} Timer reset back to 02:00`, "cpr");
  };

  // Log Defibrillation Shock (Shockable: VF/pVT)
  const handleRhythmShockable = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (pulseCheckActive) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
    }

    setLastRhythmDecision('shockable');
    setSelectedShockableRhythm(null);
    
    addLog("Rhythm Checked: Shockable", "rhythm");

    setGuidanceMessage(
      "พบคลื่นไฟฟ้าหัวใจ SHOCKABLE! โปรดเลือกชนิดคลื่น (VF หรือ Pulseless VT) แล้วกดปุ่มปล่อยช็อกหัวใจตรงกลางหน้าจอค่ะ"
    );
    speakThai("คลื่นไฟฟ้าหัวใจต้องการการช๊อกโปรดเลือกชนิดคลื่นไฟฟ้าหัวใจ วีเอฟ หรือ วีที และกดปุ่มปล่อยช๊อกตรงกลางนะคะ");
    setActiveTab('trc_cardiac');
  };

  // Perform the actual Defibrillation Shock
  const handleDeliverShock = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (pulseCheckActive) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
    }

    // Automatically start CPR for 2 minutes (120s) and reset sub-cycle to Cycle 1 on shock delivery
    setCprActive(true);
    setCprTimeRemaining(120);
    setCprCycle(1);
    setCprSubCycle302(1);
    cprSubCycleRef.current = 1;
    metronomeBeatRef.current = 0;
    setMetronomeBeat(0);
    lastPulseCheckedCycleRef.current = 0;

    const nextShock = shockCount + 1;
    setShockCount(nextShock);

    const rhythmTag = selectedShockableRhythm ? ` (${selectedShockableRhythm})` : '';

    if (nextShock === 1) {
      if (!hasCompletedIvAccess) {
        setIvAccessAlertActive(true);
        setGuidanceMessage(
          "SHOCK DELIVERED! Defibrillation #1 complete. Immediately resume chest compressions for 2 minutes. Establish IV/IO line!"
        );
        addLog(`Defibrillation #1 Delivered (200J)`, "shock");
        speakThai("ปล่อยช็อกครั้งที่หนึ่ง เรียบร้อยแล้วค่ะ เริ่มกดหน้าอกต่อทันที สองนาทีค่ะ");
      } else {
        setIvAccessAlertActive(false);
        setGuidanceMessage(
          "SHOCK DELIVERED! Defibrillation #1 complete. Immediately resume chest compressions for 2 minutes."
        );
        addLog(`Defibrillation #1 Delivered (200J)`, "shock");
        speakThai("ปล่อยช็อกครั้งที่หนึ่ง เรียบร้อยแล้วค่ะ เริ่มกดหน้าอกต่อทันที สองนาทีค่ะ");
      }
    } else if (nextShock === 2) {
      setEpiAlertActive(true);
      setGuidanceMessage(
        "SHOCK DELIVERED! Defibrillation #2 complete. ADMINISTER EPINEPHRINE 1mg IV/IO IMMEDIATELY according to ACLS Protocol!"
      );
      addLog(`Defibrillation #2 Delivered (200J)`, "shock");
      speakThai("ปล่อยช็อกครั้งที่สอง เรียบร้อยแล้วค่ะ เตรียมให้ยาเอพิเนฟริน หนึ่งมิลลิกรัม แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ");
    } else if (nextShock === 3) {
      setAmioAlertActive(true);
      setLidoAlertActive(true);
      setGuidanceMessage(
        "SHOCK DELIVERED! Defibrillation #3 complete. ADMINISTER AMIODARONE 300mg OR LIDOCAINE 1-1.5mg/kg IV/IO IMMEDIATELY!"
      );
      addLog(`Defibrillation #3 Delivered (200J)`, "shock");
      speakThai("ปล่อยช็อกครั้งที่สาม เรียบร้อยแล้วค่ะ พิจารณาให้ยาอะมิโอดาโรน สามร้อยมิลลิกรัม หรือยาลิโดเคน แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ");
    } else if (nextShock === 5) {
      setAmioAlertActive(true);
      setLidoAlertActive(true);
      setGuidanceMessage(
        "SHOCK DELIVERED! Defibrillation #5 complete. ADMINISTER AMIODARONE 150mg OR LIDOCAINE 0.5-0.75mg/kg IV/IO!"
      );
      addLog(`Defibrillation #5 Delivered (200J)`, "shock");
      speakThai("ปล่อยช็อกครั้งที่ห้า เรียบร้อยแล้วค่ะ พิจารณาให้ยาอะมิโอดาโรน ร้อยห้าสิบมิลลิกรัม หรือยาลิโดเคน แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ");
    } else {
      setGuidanceMessage(
        `SHOCK DELIVERED! Defibrillation #${nextShock} complete. Immediately resume chest compressions.`
      );
      addLog(`Defibrillation #${nextShock} Delivered (200J)`, "shock");
      speakThai(`ปล่อยช็อกครั้งที่ ${nextShock} เรียบร้อยแล้วค่ะ เริ่มกดหน้าอกต่อทันที สองนาทีค่ะ`);
    }

    setSelectedShockableRhythm(null);
  };

  // Log Non-Shockable (PEA/Asystole)
  const handleRhythmNonShockable = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (pulseCheckActive) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
    }

    setLastRhythmDecision('non-shockable');
    setSelectedNonShockableRhythm(null);
    
    setCprActive(true);
    setCprTimeRemaining(120);

    addLog("Rhythm Checked: Non-Shockable", "rhythm");

    setGuidanceMessage(
      "พบคลื่นไฟฟ้าหัวใจ NON-SHOCKABLE! โปรดเลือกชนิดคลื่น (Asystole หรือ PEA)"
    );

    speakThai("คลื่นไฟฟ้าหัวใจช็อกไม่ได้ โปรดเลือกชนิดคลื่นไฟฟ้าหัวใจ อะซิสโทลี หรือ พีอีเอ นะคะ");
    setActiveTab('trc_cardiac');
  };

  // Log Bradycardia with Pulse (HR < 50)
  const handleRhythmBradycardia = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (pulseCheckActive) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
    }

    setLastRhythmDecision('bradycardia');
    setStabilityStatus(null);
    
    // Pulse is present, so pause active CPR
    if (cprActive) {
      setCprActive(false);
      addLog("CPR Paused automatically as patient has a pulse (ยังมีชีพจร)", "cpr");
    }

    setGuidanceMessage(
      "BRADYCARDIA WITH PULSE (HR < 50 bpm)! Assess clinical stability - stable or unstable (ประเมินอาการคงที่ และไม่คงที่: hypotension, altered mental status, signs of shock, chest pain, acute heart failure). If UNSTABLE: Administer Atropine 1 mg IV/IO immediately. If STABLE: Monitor and observe."
    );

    addLog("Rhythm Checked: Bradycardia", "rhythm");
    speakThai("ชีพจรช้าผิดปกติค่ะ ช่วยประเมินอาการคงที่และไม่คงที่ด้วยนะคะ หากมีอาการไม่คงที่ แนะนำให้ยาอะโทรพีน หนึ่งมิลลิกรัมทันทีค่ะ");
    setActiveTab('trc_tachy_brady');
  };

  // Log Tachycardia with Pulse (HR >= 150)
  const handleRhythmTachycardia = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (pulseCheckActive) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
    }

    setLastRhythmDecision('tachycardia');
    setStabilityStatus(null);
    
    // Pulse is present, so pause active CPR
    if (cprActive) {
      setCprActive(false);
      addLog("CPR Paused automatically as patient has a pulse (ยังมีชีพจร)", "cpr");
    }

    setGuidanceMessage(
      "TACHYCARDIA WITH PULSE (HR >= 150 bpm)! Assess clinical stability - stable or unstable (ประเมินอาการคงที่ และไม่คงที่: hypotension, altered mental status, signs of shock, chest pain, acute heart failure). If UNSTABLE: Perform Synchronized Cardioversion immediately. If STABLE: Evaluate QRS width."
    );

    addLog("Rhythm Checked: Tachycardia", "rhythm");
    speakThai("คนไข้ชีพจรเร็วผิดปกติค่ะ ช่วยประเมินอาการคงที่และไม่คงที่ด้วยนะคะ หากมีอาการไม่คงที่ แนะนำทำคาดิโอเวอชั่นทันทีค่ะ");
    setActiveTab('trc_tachy_brady');
  };

  // Log Return of Spontaneous Circulation (ROSC)
  const handleRhythmROSC = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (pulseCheckActive) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
    }

    setLastRhythmDecision('rosc');
    setStabilityStatus(null);
    
    // Stop CPR and CPR timer
    if (cprActive) {
      setCprActive(false);
    }

    // Stop all continuous drug timers and clear alerts
    setEpiTimerStarted(false);
    setEpiAlertActive(false);
    setAmioAlertActive(false);
    setLidoAlertActive(false);
    setIvAccessAlertActive(false);
    setAirwayAlertActive(false);
    setEtco2AlertActive(false);
    setReassessWarningActive(false);

    setGuidanceMessage(
      "RETURN OF SPONTANEOUS CIRCULATION (ROSC) ACHIEVED! Initiate Post-Cardiac Arrest Care Protocol immediately: 1. Airway & Ventilation: Target SpO2 92-98%, PETCO2 35-45 mmHg. 2. Hemodynamics: Target SBP >= 90 mmHg, MAP >= 65 mmHg (use Norepinephrine/Epinephrine/Dopamine drip). 3. STEMI diagnostics: 12-Lead ECG. 4. Neurological Care: Temperature Control 32-37.5°C if comatose."
    );

    addLog("ROSC ACHIEVED!-> Switched to Post-Cardiac Arrest Care Protocol", "system");
    speakThai("ยินดีด้วยนะคะ คนไข้กลับมามีชีพจรแล้วค่ะ สิ้นสุดกระบวนการฟื้นคืนชีพ และเริ่มทำตามแนวทางการดูแลหลังกู้ชีพจรสำเร็จทันทีค่ะ");
    setActiveTab('trc_rosc');
  };

  // Log Medication: Epinephrine
  const handleAdministerEpinephrine = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    const nextEpi = epiCount + 1;
    setEpiCount(nextEpi);
    setEpiTimeRemaining(240); // Reset the 4-minute timer (240s)
    setEpiAlertActive(false);
    setEpiTimerStarted(true);

    addLog(`Medication: Epinephrine 1mg IV/IO administered (Total Dose #${nextEpi})`, "med");
    if (nextEpi === 1) {
      if (!hasCompletedAirway || !hasCompletedEtco2) {
        if (!hasCompletedAirway) setAirwayAlertActive(true);
        if (!hasCompletedEtco2) setEtco2AlertActive(true);
        setGuidanceMessage(
          "EPINEPHRINE #1 GIVEN! Please consider Advanced Airway & Capnography (ETCO2 monitoring)."
        );
        speakThai("ให้ยาเอพิเนฟริน เข็มที่หนึ่ง เรียบร้อยแล้วค่ะ");
      } else {
        setAirwayAlertActive(false);
        setEtco2AlertActive(false);
        setGuidanceMessage("EPINEPHRINE #1 GIVEN! Resume CPR immediately.");
        speakThai("ให้ยาเอพิเนฟริน เข็มที่หนึ่ง เรียบร้อยแล้วค่ะ");
      }
    } else {
      speakThai(`ให้ยาเอพิเนฟริน หนึ่งมิลลิกรัม เข็มที่ ${nextEpi} เรียบร้อยแล้วค่ะ`);
    }
  };

  const handleAdministerAmiodarone = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }
    const nextAmio = amioCount + 1;
    setAmioCount(nextAmio);
    setAmioAlertActive(false);
    setLidoAlertActive(false);
    
    let doseText = nextAmio === 1 ? "300 mg bolus" : nextAmio === 2 ? "150 mg bolus" : "bolus";
    addLog(`Medication: Amiodarone ${doseText} IV/IO administered (Total Dose #${nextAmio})`, "med");
    if (nextAmio === 1) {
      speakThai(`ให้ยาอะมิโอดาโรน สามร้อยมิลลิกรัม เข็มที่ ${nextAmio} เรียบร้อยแล้วค่ะ`);
    } else {
      speakThai(`ให้ยาอะมิโอดาโรน ร้อยห้าสิบมิลลิกรัม เข็มที่ ${nextAmio} เรียบร้อยแล้วค่ะ`);
    }
  };

  const handleAdministerLidocaine = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }
    const nextLido = lidoCount + 1;
    setLidoCount(nextLido);
    setAmioAlertActive(false);
    setLidoAlertActive(false);

    let doseText = nextLido === 1 ? "1-1.5 mg/kg bolus" : nextLido === 2 ? "0.5-0.75 mg/kg bolus" : "bolus";
    addLog(`Medication: Lidocaine ${doseText} IV/IO administered (Total Dose #${nextLido})`, "med");
    speakThai(`ให้ยาลิโดเคน เข็มที่ ${nextLido} เรียบร้อยแล้วค่ะ`);
  };

  // Log other medication presets
  const handleLogPresetMed = (medName: string, skipSpeech?: boolean) => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (medName.toLowerCase().includes('amiodarone')) {
      setAmioCount(prev => prev + 1);
      setAmioAlertActive(false);
      setLidoAlertActive(false);
    } else if (medName.toLowerCase().includes('lidocaine')) {
      setLidoCount(prev => prev + 1);
      setAmioAlertActive(false);
      setLidoAlertActive(false);
    } else if (medName.toLowerCase().includes('atropine')) {
      setAtropineCount(prev => prev + 1);
    } else if (medName.toLowerCase().includes('adenosine')) {
      setAdenosineCount(prev => prev + 1);
    }
    
    addLog(`Medication: ${medName} administered`, "med");
    if (!skipSpeech) {
      speakThai(`ให้ยา ${medName.split(' ')[0]} เรียบร้อย`);
    }
  };

  // Log other procedure presets
  const handleLogProcedure = (procName: string) => {
    if (completedProcedures.includes(procName)) return;

    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    setCompletedProcedures(prev => prev.includes(procName) ? prev : [...prev, procName]);

    if (procName.includes('IV / IO') || procName.includes('IV Access') || procName.includes('IV Line')) {
      setIvAccessAlertActive(false);
      setEpiAlertActive(true);
    }

    if (
      procName.includes('Advanced Airway') ||
      procName.includes('ET Tube') ||
      procName.includes('ET-Tube')
    ) {
      setAirwayAlertActive(false);
    }

    if (
      procName.includes('Intubation Confirmed') ||
      procName.includes('ETCO2') ||
      procName.includes('Capnography') ||
      procName.includes('PETCO2')
    ) {
      setEtco2AlertActive(false);
    }

    const isLoggingAirway =
      procName.includes('Advanced Airway') ||
      procName.includes('ET Tube') ||
      procName.includes('ET-Tube');

    const isLoggingEtco2 =
      procName.includes('Intubation Confirmed') ||
      procName.includes('ETCO2') ||
      procName.includes('Capnography') ||
      procName.includes('PETCO2');

    // Auto-switch CPR mode to Continuous 2-Min and voice alert when both Advanced Airway Secured AND Intubation Confirmed by ETCO2 are completed in sequence
    if (
      (isLoggingEtco2 && hasCompletedAirway) ||
      (isLoggingAirway && hasCompletedEtco2)
    ) {
      setMetronomeMode('continuous');
      playAlertChime('mode_switch');
      speakThai("เปลี่ยนการซีพีอา เป็นแบบสองนาทีต่อเนื่อง และเปลี่ยนการช่วยหายใจทุกหกวินาทีค่ะ");
    }

    addLog(`Procedure: ${procName}`, "system");
  };

  // Log custom text intervention
  const handleLogCustomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    addLog(`Manual Entry: ${customNote}`, "note");
    setCustomNote('');
  };

  // --- CHECKLISTS & 5Hs/5Ts HANDLERS ---
  const toggle5H = (item: string) => {
    let nextChecked: string[];
    if (checked5H.includes(item)) {
      nextChecked = checked5H.filter(i => i !== item);
      addLog(`Re-evaluating Reversible Cause: ${item}`, "system");
    } else {
      nextChecked = [...checked5H, item];
      addLog(`Addressed / Investigated: ${item}`, "system");
    }
    setChecked5H(nextChecked);
  };

  const toggle5T = (item: string) => {
    let nextChecked: string[];
    if (checked5T.includes(item)) {
      nextChecked = checked5T.filter(i => i !== item);
      addLog(`Re-evaluating Reversible Cause: ${item}`, "system");
    } else {
      nextChecked = [...checked5T, item];
      addLog(`Addressed / Investigated: ${item}`, "system");
    }
    setChecked5T(nextChecked);
  };

  // --- RESET / END CASE ---
  const confirmNewCase = () => {
    setShowResetConfirm(true);
  };

  const executeReset = () => {
    localStorage.removeItem(SAVE_KEY);
    setCaseActive(false);
    setCaseStartTime(null);
    setCaseElapsedSeconds(0);
    setCprTimeRemaining(120);
    setCprActive(false);
    setCprCycle(1);
    setCprSubCycle302(1);
    cprSubCycleRef.current = 1;
    setEpiTimeRemaining(240);
    setEpiAlertActive(false);
    setEpiTimerStarted(false);
    setAmioAlertActive(false);
    setLidoAlertActive(false);
    setIvAccessAlertActive(false);
    setAirwayAlertActive(false);
    setEtco2AlertActive(false);
    setCompletedProcedures([]);
    setEpiCount(0);
    setShockCount(0);
    setAmioCount(0);
    setLidoCount(0);
    setAtropineCount(0);
    setAdenosineCount(0);
    setAdrenalineInfCount(0);
    setDopamineInfCount(0);
    setReassessWarningActive(false);
    setTachyVagalFlashing(false);
    setTachyAmioFlashing(false);
    setTachyConsultFlashing(false);
    setLastRhythmDecision(null);
    setSelectedShockableRhythm(null);
    setSelectedNonShockableRhythm(null);
    setStabilityStatus(null);
    setNoradrenalineCount(0);
    setRoscCheckedSteps([]);
    setRoscStemiStatus('unknown');
    setRoscSpO2Level('unknown');
    setRoscBPStatus('unknown');
    setRoscComatoseStatus('unknown');
    setGuidanceMessage("Initiate CPR immediately. Tap SHOCKABLE or NON-SHOCKABLE to log rhythms and receive AHA Guideline support.");
    setLogs([]);
    setChecked5H([]);
    setChecked5T([]);
    setPulseCheckActive(false);
    setPulseCheckTime(10);
    lastPulseCheckedCycleRef.current = 0;
    setMetronomeOn(true);
    setShowResetConfirm(false);
    
    setTimeout(() => {
      speakThai("เริ่มต้นใหม่ค่ะ", undefined, 1.0);
    }, 50);
  };

  // --- EXPORT & COPY ---
  const handleExportPDF = async () => {
    await generateResuscitationPDF(logs, {
      caseElapsedSeconds,
      cprCycle,
      cprSubCycle302,
      shockCount,
      epiCount,
      amioCount,
      lidoCount,
      atropineCount,
      adenosineCount,
      noradrenalineCount,
      checked5H,
      checked5T
    });
  };

  const copyLogsToClipboard = () => {
    const header = `SMART ACLS COPILOT REPORT\n=========================\nDate: ${new Date().toLocaleDateString()}\nTotal Resuscitation Time: ${formatMMSS(caseElapsedSeconds)}\nCPR Cycles Completed: ${cprCycle - 1}\nDefibrillations Delivered: ${shockCount}\nEpinephrine Administered: ${epiCount} doses\nAmiodarone Administered: ${amioCount} doses\nLidocaine Administered: ${lidoCount} doses\n\nDETAILED TIMESTAMP LOGS:\n-------------------------\n`;
    const logBody = logs.map(l => `[${l.time}] (Elapsed: ${l.elapsed}) - ${l.text}`).join('\n');
    const fullText = header + logBody;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.warn("Clipboard API failed, using fallback:", err);
          fallbackCopyText(fullText);
        });
    } else {
      fallbackCopyText(fullText);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert("Error copying logs. Please review logs on screen.");
    }
  };

  // Timer helpers
  const formatMMSS = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="smart_acls_root" className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col selection:bg-cyan-500 selection:text-white pb-6">
      
      {/* HEADER BAR (bg-cyan-800 Theme) */}
      <header id="acls_header" className="bg-cyan-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center h-auto min-h-[60px] shadow-xl relative z-10 gap-2.5 sm:gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2.5">
            {/* Medical Red Cross emblem container */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded flex items-center justify-center shadow shrink-0">
              <div className="w-4 sm:w-5 h-1 bg-red-600 relative after:content-[''] after:absolute after:w-1 after:h-4 sm:after:h-5 after:bg-red-600 after:left-[6px] sm:after:left-[8px] after:top-[-6px] sm:after:top-[-8px]"></div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight leading-none text-white">SMART ACLS COPILOT</h1>
              <p className="text-[8.5px] sm:text-[9px] uppercase tracking-widest text-cyan-300 font-bold opacity-90 mt-0.5">Critical Care Resuscitation Interface</p>
            </div>
          </div>

          <div id="clock_mobile" className="sm:hidden text-lg font-mono bg-cyan-950 text-cyan-400 px-2.5 py-1 rounded border border-cyan-700/60 shadow-inner">
            {systemTime || '00:00:00'}
          </div>
        </div>

        {/* Live dynamic statistics on header */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-cyan-700/50">
          <div className="text-left sm:text-right">
            <p className="text-[8.5px] sm:text-[9px] opacity-70 uppercase font-bold tracking-tighter">Case Time</p>
            <p id="total-time" className="text-xl sm:text-2xl font-mono leading-none font-bold text-white tracking-wide">
              {caseActive ? formatMMSS(caseElapsedSeconds) : '00:00'}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-[8.5px] sm:text-[9px] opacity-70 uppercase font-bold tracking-tighter">CPR Round / 30:2</p>
            <p className="text-xl sm:text-2xl font-mono leading-none font-bold text-cyan-300 flex items-center justify-end gap-1">
              <span>#{cprCycle}</span>
              <span className="text-[10px] sm:text-xs text-amber-300 font-sans font-black bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-700/60">
                ({cprSubCycle302}/5)
              </span>
            </p>
          </div>

          <div id="clock" className="hidden sm:block text-2xl font-mono bg-cyan-950 text-cyan-400 px-3 py-1.5 rounded border border-cyan-700/60 shadow-inner">
            {systemTime || '00:00:00'}
          </div>
        </div>
      </header>

      {/* SYSTEM CONTROLS & VOICE TOGGLES ROW */}
      <section id="acls_controls_bar" className="bg-slate-200/80 border-b border-slate-300/80 py-2 px-3 sm:px-4 text-xs font-bold text-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Thai Speech Synthesis Verification */}
            <button
              id="btn_verify_thai_voice"
              onClick={testAudioSystem}
              disabled={audioTesting}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border text-[11px] font-bold ${
                audioTesting 
                  ? 'bg-slate-300 border-slate-400 text-slate-500' 
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-cyan-800'
              } transition-colors cursor-pointer shadow-sm active:scale-95`}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-700" />
              <span>{audioTesting ? 'กำลังพูด...' : 'ทดสอบเสียงเตือนภาษาไทย'}</span>
            </button>

            {/* Toggle Audio Voice */}
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 min-h-[36px] rounded-lg border border-slate-300 shadow-sm">
              <input 
                id="chk_voice_alerts"
                type="checkbox" 
                checked={voiceAlertsOn} 
                onChange={(e) => {
                  setVoiceAlertsOn(e.target.checked);
                  addLog(`Thai Voice Alerts toggled ${e.target.checked ? 'ON' : 'OFF'}`, 'system');
                }}
                className="accent-cyan-700 cursor-pointer h-4 w-4 rounded"
              />
              <span className="text-slate-700 font-bold text-[11px] sm:text-xs">เสียงแจ้งเตือนภาษาไทย</span>
            </label>

            {/* Metronome Control block with Mode (30:2 / Continuous) & 100, 110, 120 BPM presets */}
            <div className="flex flex-wrap items-center gap-2 bg-white px-3 py-1.5 min-h-[36px] rounded-lg border border-slate-300 shadow-sm w-full sm:w-auto">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  id="chk_metronome"
                  type="checkbox" 
                  checked={metronomeOn} 
                  onChange={(e) => {
                    setMetronomeOn(e.target.checked);
                  }}
                  className="accent-cyan-700 cursor-pointer h-4 w-4 rounded"
                />
                <span className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] sm:text-xs whitespace-nowrap">
                  <span className={`h-2.5 w-2.5 rounded-full ${cprActive && metronomeOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  Metronome ({metronomeTempo} BPM)
                </span>
              </label>

              {/* Mode Selector: 30:2 vs Continuous */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200" id="metronome_mode_selector">
                <button
                  id="btn_metronome_mode_30_2"
                  onClick={() => {
                    setMetronomeMode('30:2');
                    speakThai("ตั้งค่าเมโทรนอม แบบ สามสิบ ต่อ สอง เรียบร้อยแล้วค่ะ");
                  }}
                  className={`px-2 py-1 text-[10px] font-black rounded transition-all cursor-pointer ${
                    metronomeMode === '30:2'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  30 : 2
                </button>
                <button
                  id="btn_metronome_mode_continuous"
                  onClick={() => {
                    setMetronomeMode('continuous');
                    speakThai("ตั้งค่าเมโทรนอม แบบ ต่อเนื่อง เรียบร้อยแล้วค่ะ");
                  }}
                  className={`px-2 py-1 text-[10px] font-black rounded transition-all cursor-pointer ${
                    metronomeMode === 'continuous'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ต่อเนื่อง
                </button>
              </div>

              <div className="h-4 w-px bg-slate-300 mx-0.5 hidden sm:block" />
              
              <div className="flex items-center gap-1" id="metronome_presets">
                {[100, 110, 120].map((bpm) => (
                  <button
                    key={bpm}
                    id={`btn_metronome_${bpm}`}
                    onClick={() => {
                      setMetronomeTempo(bpm);
                      speakThai(`ปรับจังหวะเมโทรนอมเป็น ${bpm} ครั้งต่อนาทีแล้วค่ะ`);
                    }}
                    className={`px-2 py-1 text-[10px] font-black rounded border transition-all cursor-pointer ${
                      metronomeTempo === bpm
                        ? 'bg-cyan-700 text-white border-cyan-700 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    {bpm}
                  </button>
                ))}
              </div>

              {/* Live Metronome Status Badge */}
              {cprActive && metronomeOn && (
                <div className="ml-1 flex items-center">
                  {metronomeMode === '30:2' ? (
                    metronomeBeat >= 1 && metronomeBeat <= 30 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black text-[10px] animate-pulse flex items-center gap-1 shadow-xs">
                        <Heart className="w-3 h-3 fill-white text-white" />
                        กด: {metronomeBeat}/30
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-black text-[10px] animate-pulse flex items-center gap-1 shadow-xs">
                        🌬️ ช่วยหายใจ {metronomeBeat === 31 ? '1/2' : '2/2'} (เงียบ)
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-cyan-700 text-white font-black text-[10px] animate-pulse flex items-center gap-1 shadow-xs">
                      <Heart className="w-3 h-3 fill-white text-white" />
                      จังหวะ: {metronomeBeat}
                    </span>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
            <button 
              id="btn_new_case"
              onClick={confirmNewCase}
              className="px-3 py-1.5 min-h-[36px] bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Offline Cache Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main id="acls_main_content" className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 overflow-hidden">
        
        {/* LEFT COLUMN: PRIMARY TIMERS & DRUGS BOARD (8 Columns on lg, 7 Columns on md) */}
        <div className="col-span-1 md:col-span-7 lg:col-span-8 flex flex-col gap-3 sm:gap-4">
          
          {/* PRIMARY TIMER CONTAINER (bg-white rounded-[20px]) */}
          <div className="bg-white rounded-[16px] sm:rounded-[20px] shadow-xl border border-slate-200 p-3.5 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden min-h-[190px] sm:min-h-[220px]">
            
            {/* Countdown progress line at top */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-200">
              <div 
                id="timer-progress" 
                className={`h-full transition-all duration-1000 ${cprTimeRemaining <= 30 ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} 
                style={{ width: `${(cprTimeRemaining / 120) * 100}%` }}
              ></div>
            </div>

            {/* CPR Mode Selector Tabs (Separate 2-Min Continuous vs 30:2 Mode) */}
            <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl border border-slate-200 mb-2.5 sm:mb-3 w-full max-w-xl shadow-inner">
              <button
                id="tab_cpr_continuous"
                onClick={() => {
                  setMetronomeMode('continuous');
                  speakThai("เลือกการนับ ซีพีอา สองนาทีแบบต่อเนื่อง");
                }}
                className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
                  metronomeMode === 'continuous'
                    ? 'bg-cyan-700 text-white shadow-md ring-1 ring-cyan-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>CPR 2 นาที (ต่อเนื่อง)</span>
              </button>

              <button
                id="tab_cpr_30_2"
                onClick={() => {
                  setMetronomeMode('30:2');
                  addLog("Switched CPR Mode to 30:2 CPR (5 Cycles)", "cpr");
                  speakThai("เลือกการนับ CPR แบบ 30 ต่อ 2");
                }}
                className={`flex-1 py-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 ${
                  metronomeMode === '30:2'
                    ? 'bg-cyan-700 text-white shadow-md ring-1 ring-cyan-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>CPR แบบ 30:2 (5 รอบ)</span>
              </button>
            </div>

            {/* HEADER & STATUS BADGES */}
            <div className="flex items-center justify-between w-full max-w-xl mb-1 relative">
              <h2 className="text-slate-500 uppercase text-[10px] sm:text-xs font-black tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-cyan-600 fill-cyan-600" />
                {metronomeMode === 'continuous' ? 'CPR 2 นาที แบบต่อเนื่อง' : 'CPR 30:2 x 5 รอบ'}
              </h2>

              {cprActive && (
                <div className="flex items-center gap-1.5">
                  {metronomeOn && (
                    metronomeMode === '30:2' ? (
                      metronomeBeat >= 1 && metronomeBeat <= 30 ? (
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black border border-emerald-400 animate-pulse flex items-center gap-1 shadow-xs">
                          <Heart className="w-3 h-3 fill-white text-white" />
                          กดหน้าอก {metronomeBeat} / 30
                        </span>
                      ) : (
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] sm:text-[10px] font-black border border-amber-300 animate-pulse flex items-center gap-1 shadow-xs">
                          🌬️ ช่วยหายใจ {metronomeBeat === 31 ? '1 / 2' : '2 / 2'}
                        </span>
                      )
                    ) : (
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-cyan-600 text-white text-[9px] sm:text-[10px] font-black border border-cyan-400 animate-pulse flex items-center gap-1 shadow-xs">
                        <Heart className="w-3 h-3 fill-white text-white" />
                        จังหวะกด {metronomeBeat}
                      </span>
                    )
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300 animate-pulse hidden sm:inline-block">
                    ACTIVE CPR
                  </span>
                </div>
              )}
            </div>

            {/* MODE 1 DISPLAY: CONTINUOUS CPR 2 MINUTES */}
            {metronomeMode === 'continuous' && (
              <div className="flex flex-col items-center justify-center w-full my-1">
                <div id="timer-display" className={`text-[48px] xs:text-[68px] sm:text-[90px] md:text-[80px] lg:text-[100px] font-mono font-black leading-none my-1 tracking-tighter tabular-nums ${cprTimeRemaining <= 30 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                  {formatMMSS(cprTimeRemaining)}
                </div>
                <div className="text-[9.5px] sm:text-[11px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 text-center mb-2">
                  ⏱️ นับถอยหลัง CPR 2 นาทีแบบต่อเนื่อง (สำหรับผู้ป่วยใส่ท่อช่วยหายใจ หรือ CPR ต่อเนื่อง)
                </div>
              </div>
            )}

            {/* MODE 2 DISPLAY: 30:2 CPR x 5 CYCLES */}
            {metronomeMode === '30:2' && (
              <div className="flex flex-col items-center justify-center w-full my-1">
                {/* BIG DISPLAY NUMBERS & LIVE BEAT DISPLAY */}
                <div className="flex items-baseline justify-center gap-3 my-1">
                  <div id="timer-display" className={`text-[46px] xs:text-[64px] sm:text-[80px] md:text-[72px] lg:text-[90px] font-mono font-black leading-none tracking-tighter tabular-nums ${cprTimeRemaining <= 30 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
                    {formatMMSS(cprTimeRemaining)}
                  </div>
                </div>

                {/* 30:2 x 5 CYCLE TRACKER WIDGET */}
                <div className="w-full max-w-xl my-2 bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-cyan-800 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                      30:2 CPR
                    </span>
                    <span className="text-[10.5px] sm:text-[11px] font-black text-slate-700">
                      30:2 x 5 Cycles
                    </span>
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                      รอบที่ {cprSubCycle302} / 5
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center">
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
                          title={`30:2 Cycle ${cycleNum} of 5`}
                          className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 min-w-[42px] sm:min-w-[50px] ${
                            isActive
                              ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-300 scale-105'
                              : isDone
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-3 h-3 text-emerald-600 inline" />
                          ) : (
                            <span>{cycleNum}/5</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[9.5px] sm:text-[11px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 text-center mb-2">
                  🔄 กดหน้าอก 30 ครั้ง สลับช่วยหายใจ 2 ครั้ง ทำซ้ำ 5 รอบ (ประมาณ 2 นาที)
                </div>
              </div>
            )}

            {/* BUTTON CONTROLS */}
            <div className="flex gap-2.5 sm:gap-3 w-full max-w-xl">
              <button 
                id="start-btn" 
                onClick={toggleCPR}
                className={`medical-btn flex-1 h-[52px] sm:h-[60px] text-white rounded-[16px] text-lg sm:text-2xl font-black flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer ${
                  cprActive 
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-900/10' 
                    : cprButtonFlash
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/35 ring-4 ring-rose-400 animate-pulse'
                      : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-900/20'
                }`}
              >
                {cprActive ? 'PAUSE CPR' : 'START CPR'}
              </button>

              <button 
                id="reset-btn"
                onClick={resetCPRCycle}
                disabled={!caseActive}
                title="Reset timer to 2:00"
                className="medical-btn w-[52px] sm:w-[60px] h-[52px] sm:h-[60px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[16px] flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-slate-300 disabled:opacity-50 shrink-0"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </button>
            </div>

            <div className="mt-2 text-[9.5px] sm:text-[10px] text-slate-500 font-bold flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span>Guideline Target: 100-120 BPM</span>
              <span className="hidden sm:inline">•</span>
              <span>Depth: 5-6 cm</span>
            </div>
          </div>

          {/* DECISION-GUIDED CENTER INTERVENE PROTOCOL PANEL */}
          <div className="bg-white rounded-[20px] shadow-lg border border-slate-200 p-3.5 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
                เมนูยาและหัตถการเฉพาะทางตรงกลาง (Center Active Protocol Area)
              </h3>
              {lastRhythmDecision && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  lastRhythmDecision === 'shockable' 
                    ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
                    : lastRhythmDecision === 'non-shockable'
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : lastRhythmDecision === 'bradycardia'
                    ? 'bg-emerald-100 text-emerald-750 border border-emerald-200'
                    : lastRhythmDecision === 'tachycardia'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-teal-100 text-teal-800 border border-teal-300 animate-bounce'
                }`}>
                  {lastRhythmDecision === 'shockable' && 'VF / pVT Protocol'}
                  {lastRhythmDecision === 'non-shockable' && 'Asystole / PEA Protocol'}
                  {lastRhythmDecision === 'bradycardia' && 'Symptomatic Bradycardia'}
                  {lastRhythmDecision === 'tachycardia' && 'Symptomatic Tachycardia'}
                  {lastRhythmDecision === 'rosc' && 'Post-Cardiac Arrest Care (ROSC)'}
                </span>
              )}
            </div>

            {lastRhythmDecision === null ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-[16px] p-4 flex flex-col items-center justify-center text-center h-[160px]">
                <Activity className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wide">
                  รอนิยามสภาวะผู้ป่วย (Awaiting Patient Status Decision)
                </h3>
                <p className="text-[11px] text-slate-500 max-w-md mt-1 leading-relaxed">
                  โปรดเริ่มจับเวลาหรือประเมินคลื่นไฟฟ้าหัวใจและชีพจร จากนั้นกดเลือกสภาวะ <span className="font-bold text-red-600">SHOCKABLE</span>, <span className="font-bold text-slate-800">NON-SHOCKABLE</span>, <span className="font-bold text-emerald-600">BRADYCARDIA</span> หรือ <span className="font-bold text-amber-600">TACHYCARDIA</span> ในแถบเครื่องมือด้านขวา เพื่อเริ่มต้นแสดงยาและหัตถการเฉพาะทางตรงนี้ค่ะ
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. SHOCKABLE PANEL */}
                {lastRhythmDecision === 'shockable' && (
                  <div className="space-y-4">
                    {/* Hatthakan Chaphor (Specific Procedure) */}
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">1. หัตถการเฉพาะทาง (Specific Procedure)</div>

                      {/* EKG Rhythm Selection (VF / Pulseless VT) */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-3 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-red-600 animate-pulse" />
                            เลือกชนิดคลื่นไฟฟ้าหัวใจ (Select Rhythm)
                          </span>
                          {selectedShockableRhythm && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-black border border-red-200">
                              {selectedShockableRhythm}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            id="btn_select_rhythm_vf"
                            onClick={() => {
                              setSelectedShockableRhythm('VF');
                              addLog("Selected Rhythm Type: VF", "rhythm");
                              setGuidanceMessage("พบคลื่นไฟฟ้าหัวใจ VF! พร้อมกดปุ่ม Defibrillation (SHOCK) เพื่อปล่อยช็อกไฟฟ้า 200J");
                              speakThai("เลือกคลื่นไฟฟ้าหัวใจ วีเอฟ เรียบร้อยแล้วค่ะ โปรดกดปุ่มช็อกเพื่อปล่อยพลังงานสองร้อยจูลนะคะ");
                            }}
                            className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-2 border ${
                              selectedShockableRhythm === 'VF'
                                ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                                : !selectedShockableRhythm
                                ? 'bg-red-600 text-white border-2 border-yellow-300 ring-4 ring-yellow-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-[1.01]'
                                : 'bg-white hover:bg-red-50 text-slate-800 border-slate-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <VfEkgIcon className="w-11 h-7 sm:w-13 sm:h-8" />
                              <div className="flex flex-col text-left min-w-0">
                                <span className="text-sm font-black leading-tight">VF</span>
                                <span className={`text-[9px] font-normal truncate ${selectedShockableRhythm === 'VF' || !selectedShockableRhythm ? 'text-red-100' : 'text-slate-500'}`}>Ventricular Fibrillation</span>
                              </div>
                            </div>
                            {selectedShockableRhythm === 'VF' && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                          </button>

                          <button
                            id="btn_select_rhythm_pvt"
                            onClick={() => {
                              setSelectedShockableRhythm('Pulseless VT');
                              addLog("Selected Rhythm Type: Pulseless VT", "rhythm");
                              setGuidanceMessage("พบคลื่นไฟฟ้าหัวใจ Pulseless VT! พร้อมกดปุ่ม Defibrillation (SHOCK) เพื่อปล่อยช็อกไฟฟ้า 200J");
                              speakThai("เลือกคลื่นไฟฟ้าหัวใจ เพ๊าเหล็ด วีที เรียบร้อยแล้วค่ะ โปรดกดปุ่มช็อกเพื่อปล่อยพลังงานสองร้อยจูลนะคะ");
                            }}
                            className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-2 border ${
                              selectedShockableRhythm === 'Pulseless VT'
                                ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                                : !selectedShockableRhythm
                                ? 'bg-red-600 text-white border-2 border-yellow-300 ring-4 ring-yellow-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-[1.01]'
                                : 'bg-white hover:bg-red-50 text-slate-800 border-slate-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <VtEkgIcon className="w-11 h-7 sm:w-13 sm:h-8" />
                              <div className="flex flex-col text-left min-w-0">
                                <span className="text-sm font-black leading-tight">Pulseless VT</span>
                                <span className={`text-[9px] font-normal truncate ${selectedShockableRhythm === 'Pulseless VT' || !selectedShockableRhythm ? 'text-red-100' : 'text-slate-500'}`}>Pulseless VT</span>
                              </div>
                            </div>
                            {selectedShockableRhythm === 'Pulseless VT' && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                          </button>
                        </div>
                      </div>

                      <button 
                        id="btn_deliver_shock"
                        onClick={handleDeliverShock}
                        className={`w-full medical-btn bg-gradient-to-br from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl p-5 flex items-center justify-between shadow-lg transition-all active:scale-95 cursor-pointer border-t border-red-400 ${
                          selectedShockableRhythm 
                            ? 'animate-pulse ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_35px_rgba(239,68,68,0.9)] border-2 border-yellow-300 scale-[1.01]' 
                            : 'hover:shadow-red-600/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Zap className={`w-8 h-8 shrink-0 ${selectedShockableRhythm ? 'fill-yellow-300 text-yellow-300 animate-bounce' : 'fill-white text-white animate-bounce'}`} />
                          <div className="text-left">
                            <span className="text-xl sm:text-2xl font-black block leading-none">Defibrillation (SHOCK)</span>
                            <span className="text-[10px] font-extrabold opacity-95 block mt-1 uppercase tracking-wider">
                              {selectedShockableRhythm ? `⚡ พร้อมปล่อยช็อก ${selectedShockableRhythm} (200J) • ` : 'ปล่อยพลังงานไฟฟ้า 200J (Biphasic) • '}ช็อกแล้ว {shockCount} ครั้ง
                            </span>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase shrink-0 transition-all ${
                          selectedShockableRhythm
                            ? 'bg-yellow-400 text-slate-950 shadow-md animate-bounce ring-2 ring-yellow-200'
                            : 'bg-white/20 text-white font-bold'
                        }`}>
                          {selectedShockableRhythm ? '⚡ SHOCK NOW ⚡' : 'SHOCK NOW'}
                        </div>
                      </button>
                    </div>

                    {/* Medications */}
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">2. ยาเฉพาะทาง (Specific Medications)</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* Epinephrine */}
                        <button 
                          onClick={handleAdministerEpinephrine}
                          className={`medical-btn bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[100px] transition-all active:scale-95 cursor-pointer border-t border-orange-300 relative overflow-hidden col-span-1 ${
                            epiAlertActive || (epiTimerStarted && epiTimeRemaining === 0)
                              ? 'ring-4 ring-yellow-400 border-2 border-yellow-300 animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-[1.01]'
                              : ''
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="text-base font-black tracking-tight">EPINEPHRINE</span>
                            {epiAlertActive ? (
                              <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded-md text-[9px] font-black animate-pulse shadow-sm border border-orange-200">READY</span>
                            ) : !epiTimerStarted ? (
                              <span className="bg-slate-950/20 text-white px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold">--:--</span>
                            ) : epiTimeRemaining === 0 ? (
                              <span className="bg-white text-red-600 px-1.5 py-0.5 rounded-md text-[9px] font-black animate-pulse shadow-sm border border-red-100">DUE</span>
                            ) : (
                              <span className="bg-slate-950/20 text-white px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold">{formatMMSS(epiTimeRemaining)}</span>
                            )}
                          </div>
                          <span className="text-[10px] uppercase font-bold opacity-90 text-left mt-2">1 mg IV/IO Push (ให้เร็วที่สุด ทุก 3-5 นาที) • {epiCount} given</span>
                        </button>

                        {/* Amiodarone */}
                        <button 
                          onClick={handleAdministerAmiodarone}
                          className="medical-btn bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[100px] transition-all active:scale-95 cursor-pointer border-t border-indigo-300 col-span-1"
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="text-base font-black tracking-tight">AMIODARONE</span>
                            <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">Given: {amioCount}</span>
                          </div>
                          <div className="flex flex-col gap-1 mt-2 text-left w-full">
                            <span className="text-[10px] uppercase font-bold opacity-90">First: 300 mg bolus • Second: 150 mg bolus</span>
                          </div>
                        </button>

                        {/* Lidocaine */}
                        <button 
                          onClick={handleAdministerLidocaine}
                          className="medical-btn bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[100px] transition-all active:scale-95 cursor-pointer border-t border-indigo-300 col-span-1"
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="text-base font-black tracking-tight">LIDOCAINE</span>
                            <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">Given: {lidoCount}</span>
                          </div>
                          <div className="flex flex-col gap-1 mt-2 text-left w-full">
                            <span className="text-[10px] uppercase font-bold opacity-90">IV/IO Bolus (1-1.5 mg/kg or 0.5-0.75 mg/kg)</span>
                          </div>
                        </button>

                      </div>
                    </div>
                  </div>
                )}

                {/* 2. NON-SHOCKABLE PANEL */}
                {lastRhythmDecision === 'non-shockable' && (
                  <div className="space-y-4">
                    {/* EKG Rhythm Selection (Asystole / PEA) */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-slate-700 animate-pulse" />
                          เลือกชนิดคลื่นไฟฟ้าหัวใจ (Select Rhythm)
                        </span>
                        {selectedNonShockableRhythm && (
                          <span className="text-[10px] bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full font-black border border-slate-300">
                            {selectedNonShockableRhythm}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          id="btn_select_rhythm_asystole"
                          onClick={() => {
                            setSelectedNonShockableRhythm('Asystole');
                            addLog("Selected Rhythm Type: Asystole", "rhythm");
                            if (!hasCompletedIvAccess) {
                              setIvAccessAlertActive(true);
                              speakThai("เลือกคลื่นไฟฟ้าหัวใจ อะซิสโทลี เรียบร้อยแล้วค่ะ โปรดเปิดเส้นหลอดเลือดดำในแถบหัตถการนะคะ");
                            } else {
                              speakThai("เลือกคลื่นไฟฟ้าหัวใจ อะซิสโทลี เรียบร้อยแล้วค่ะ");
                            }
                          }}
                          className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-2 border ${
                            selectedNonShockableRhythm === 'Asystole'
                              ? 'bg-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-500'
                              : !selectedNonShockableRhythm
                              ? 'bg-slate-800 text-white border-2 border-yellow-300 ring-4 ring-yellow-400 animate-pulse shadow-[0_0_20px_rgba(30,41,59,0.8)] scale-[1.01]'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AsystoleEkgIcon className="w-11 h-7 sm:w-13 sm:h-8" />
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-sm font-black leading-tight">Asystole</span>
                              <span className={`text-[9px] font-normal truncate ${selectedNonShockableRhythm === 'Asystole' || !selectedNonShockableRhythm ? 'text-slate-300' : 'text-slate-500'}`}>Flatline / No Activity</span>
                            </div>
                          </div>
                          {selectedNonShockableRhythm === 'Asystole' && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                        </button>

                        <button
                          id="btn_select_rhythm_pea"
                          onClick={() => {
                            setSelectedNonShockableRhythm('PEA');
                            addLog("Selected Rhythm Type: PEA", "rhythm");
                            if (!hasCompletedIvAccess) {
                              setIvAccessAlertActive(true);
                              speakThai("เลือกคลื่นไฟฟ้าหัวใจ พีอีเอ เรียบร้อยแล้วค่ะ โปรดเปิดเส้นหลอดเลือดดำในแถบหัตถการนะคะ");
                            } else {
                              speakThai("เลือกคลื่นไฟฟ้าหัวใจ พีอีเอ เรียบร้อยแล้วค่ะ");
                            }
                          }}
                          className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-2 border ${
                            selectedNonShockableRhythm === 'PEA'
                              ? 'bg-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-500'
                              : !selectedNonShockableRhythm
                              ? 'bg-slate-800 text-white border-2 border-yellow-300 ring-4 ring-yellow-400 animate-pulse shadow-[0_0_20px_rgba(30,41,59,0.8)] scale-[1.01]'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <PeaEkgIcon className="w-11 h-7 sm:w-13 sm:h-8" />
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-sm font-black leading-tight">PEA</span>
                              <span className={`text-[9px] font-normal truncate ${selectedNonShockableRhythm === 'PEA' || !selectedNonShockableRhythm ? 'text-slate-300' : 'text-slate-500'}`}>Pulseless Electrical Activity (No Pulse)</span>
                            </div>
                          </div>
                          {selectedNonShockableRhythm === 'PEA' && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                        </button>
                      </div>
                    </div>

                    {/* 1. Epinephrine */}
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider flex items-center justify-between">
                        <span>1. ยาเฉพาะทาง (Epinephrine 1mg IV/IO)</span>
                        {epiAlertActive && (
                          <span className="text-[9px] font-black text-amber-900 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded animate-pulse">
                            ⚡ พร้อมให้ยา EPINEPHRINE
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={handleAdministerEpinephrine}
                        className={`w-full medical-btn bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[90px] transition-all active:scale-95 cursor-pointer border-t border-orange-300 relative overflow-hidden ${
                          epiAlertActive || (epiTimerStarted && epiTimeRemaining === 0)
                            ? 'ring-4 ring-yellow-400 border-2 border-yellow-300 animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.8)] scale-[1.01]'
                            : ''
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-base font-black tracking-tight">EPINEPHRINE</span>
                          {epiAlertActive ? (
                            <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded-md text-[9px] font-black animate-pulse shadow-sm border border-orange-200">READY</span>
                          ) : !epiTimerStarted ? (
                            <span className="bg-slate-950/20 text-white px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold">--:--</span>
                          ) : epiTimeRemaining === 0 ? (
                            <span className="bg-white text-red-600 px-1.5 py-0.5 rounded-md text-[9px] font-black animate-pulse shadow-sm border border-red-100">DUE</span>
                          ) : (
                            <span className="bg-slate-950/20 text-white px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold">{formatMMSS(epiTimeRemaining)}</span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-bold opacity-90 text-left mt-2">1 mg IV/IO Push (ให้เร็วที่สุด ทุก 3-5 นาที) • {epiCount} given</span>
                      </button>
                    </div>

                    {/* 2. Reversible Causes Prompt */}
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">2. ค้นหาสาเหตุที่รักษาได้ (Reversible Causes)</div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center text-left">
                        <strong className="text-slate-700 text-xs block font-bold">⚠️ ค้นหาสาเหตุที่รักษาได้ (H's & T's)</strong>
                        <div className="text-[10px] text-slate-500 leading-snug mt-1 bg-white p-2.5 rounded-lg border border-slate-150">
                          เน้นหาภาวะ Hypovolemia, Hypoxia, Hydrogen Ion (Acidosis), Hypo/Hyperkalemia, Hypothermia, Tension Pneumothorax, Tamponade, Toxins, Thrombosis.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BRADYCARDIA PANEL */}
                {lastRhythmDecision === 'bradycardia' && (
                  <div className="space-y-4">
                    {/* Clinical Stability Assessment Buttons */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-emerald-600" />
                          ขั้นตอนที่ 1: ประเมินอาการคงที่ และไม่คงที่ (Stability Assessment)
                        </span>
                        {stabilityStatus && (
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black font-mono uppercase ${
                            stabilityStatus === 'stable' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}>
                            {stabilityStatus}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setStabilityStatus('stable');
                            setReassessWarningActive(false);
                            addLog("Clinical Assessment: STABLE Bradycardia", "system");
                            speakThai("ประเมินแล้ว อาการคงที่ค่ะ");
                          }}
                          className={`py-3 px-4 rounded-xl font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border-2 text-center ${
                            stabilityStatus === 'stable'
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-md ring-2 ring-emerald-500/50'
                              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          <span className="text-sm font-black">อาการคงที่ (Stable)</span>
                          <span className="text-[10px] opacity-80 font-normal">ไม่มีสัญญาณอันตราย 5 ข้อ</span>
                        </button>
                        <button
                          onClick={() => {
                            setStabilityStatus('unstable');
                            setReassessWarningActive(false);
                            addLog("Clinical Assessment: UNSTABLE Bradycardia", "system");
                            speakThai("ประเมินแล้ว อาการไม่คงที่ค่ะ");
                          }}
                          className={`py-3 px-4 rounded-xl font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border-2 text-center ${
                            stabilityStatus === 'unstable'
                              ? 'bg-rose-600 border-rose-700 text-white shadow-md animate-pulse ring-2 ring-rose-500/50'
                              : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span className="text-sm font-black">อาการไม่คงที่ (Unstable)</span>
                          <span className="text-[10px] opacity-80 font-normal">มีอาการสัญญาณอันตราย</span>
                        </button>
                      </div>

                      {/* Reassessment warning box in Bradycardia Section */}
                      {reassessWarningActive && (
                        <div className="bg-amber-500/10 border-2 border-amber-500 p-4 rounded-xl flex items-start gap-3 animate-pulse mt-2">
                          <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-800 block text-xs sm:text-sm text-left">
                              ⚠️ โปรดประเมินอาการคงที่ และไม่คงที่ ซ้ำอีกครั้ง!
                            </strong>
                            <span className="text-[11px] text-amber-700 block mt-0.5 text-left">
                              หลังให้การรักษา (ยา/TCP/Cardioversion) กรุณากดปุ่มประเมิน "อาการคงที่" หรือ "อาการไม่คงที่" ด้านบนซ้ำอีกครั้ง
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 leading-snug mt-1 bg-white p-2 rounded-lg border border-slate-150">
                        <span className="font-bold text-rose-600">⚠️ สัญญาณอันตราย (Clinical Indicators of Instability):</span> 
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 mt-1 font-semibold">
                          <div>• ความดันโลหิตต่ำ (SBP &lt; 90 mmHg)</div>
                          <div>• มีอาการซึมลง สับสนเฉียบพลัน</div>
                          <div>• มีภาวะช็อก (ตัวเย็น ตัวซีด เหงื่อออก)</div>
                          <div>• แน่นหน้าอกจากการขาดเลือดไปเลี้ยง</div>
                          <div>• ภาวะหัวใจล้มเหลวเฉียบพลัน / หอบเหนื่อย</div>
                        </div>
                      </div>
                    </div>

                    {/* Grouped Interventions based on Stability Status */}
                    {stabilityStatus === null && (
                      <div className="p-5 bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl text-center">
                        <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2 animate-bounce" />
                        <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">
                          โปรดเลือกสถานะความคงที่ของผู้ป่วยด้านบน
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">
                          กดเลือก [อาการคงที่] หรือ [อาการไม่คงที่] เพื่อเริ่มต้นจัดการแนวทางการให้ยา การทำหัตถการ และการตัดสินใจช่วยเหลือที่ถูกต้องเหมาะสมตามไกด์ไลน์ค่ะ
                        </p>
                      </div>
                    )}

                    {stabilityStatus === 'unstable' && (
                      <div className="space-y-4">
                        {/* Medications */}
                        <div>
                          <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">
                            1. ยาเพิ่มความถี่ชีพจรและความดันโลหิต (First-Line Medications)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Atropine */}
                            <button 
                              onClick={() => {
                                if (atropineCount >= 3) {
                                  speakThai("ให้ยาอะโทรพีนครบสามมิลลิกรัม ซึ่งเป็นขนาดสูงสุดแล้วค่ะ ไม่สามารถให้เพิ่มได้แล้วนะคะ");
                                  return;
                                }
                                handleLogPresetMed('Atropine 1mg IV', true);
                                triggerReassessmentAlert('Atropine 1mg IV', 'ให้ยาอะโทรพีนหนึ่งมิลลิกรัม เรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                              }}
                              disabled={atropineCount >= 3}
                              className={`medical-btn bg-gradient-to-br text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[100px] transition-all cursor-pointer border-t ${
                                atropineCount >= 3 
                                  ? 'from-slate-400 to-slate-500 border-slate-300 opacity-60 cursor-not-allowed' 
                                  : 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-emerald-400 active:scale-95'
                              }`}
                            >
                              <div className="flex justify-between items-start w-full">
                                <span className="text-base font-black tracking-tight">ATROPINE</span>
                                <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                                  {atropineCount >= 3 ? 'MAX DOSE' : `Given: ${atropineCount}`}
                                </span>
                              </div>
                              <span className="text-[10px] uppercase font-bold opacity-90 text-left mt-2">1 mg IV bolus (สูงสุด 3 mg)</span>
                            </button>

                            {/* Adrenaline Infusion */}
                            <button 
                              onClick={() => {
                                const nextCount = adrenalineInfCount + 1;
                                setAdrenalineInfCount(nextCount);
                                addLog(`Medication: Adrenaline Infusion (2-10 mcg/min) started (Dose #${nextCount})`, "med");
                                triggerReassessmentAlert('Adrenaline Infusion', 'เริ่มให้ ยา อีพิเนฟริน ไอวี เรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                              }}
                              className="medical-btn bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[100px] transition-all active:scale-95 cursor-pointer border-t border-cyan-400"
                            >
                              <div className="flex justify-between items-start w-full">
                                <span className="text-base font-black tracking-tight">EPINEPHRENE INF</span>
                                <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">Dose: #{adrenalineInfCount}</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold opacity-90 text-left mt-2">Drip 2 - 10 mcg/min กระตุ้นหัวใจ</span>
                            </button>

                            {/* Dopamine Infusion */}
                            <button 
                              onClick={() => {
                                const nextCount = dopamineInfCount + 1;
                                setDopamineInfCount(nextCount);
                                addLog(`Medication: Dopamine Infusion (5-20 mcg/kg/min) started (Dose #${nextCount})`, "med");
                                triggerReassessmentAlert('Dopamine Infusion', 'เริ่มให้ ยา โดปามีน ไอวี เรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                              }}
                              className="medical-btn bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[100px] transition-all active:scale-95 cursor-pointer border-t border-amber-400"
                            >
                              <div className="flex justify-between items-start w-full">
                                <span className="text-base font-black tracking-tight">DOPAMINE INF</span>
                                <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">Dose: #{dopamineInfCount}</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold opacity-90 text-left mt-2">Drip 5 - 20 mcg/kg/min เพิ่มความดัน</span>
                            </button>
                          </div>
                        </div>

                        {/* Hatthakan (Procedures) */}
                        <div>
                          <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">
                            2. หัตถการช่วยชีวิตด่วนสำหรับ Unstable Bradycardia
                          </div>
                          <button 
                            onClick={() => {
                              handleLogProcedure('Transcutaneous Pacing (TCP) Applied');
                              triggerReassessmentAlert('Transcutaneous Pacing (TCP)', 'ทำการเริ่มบีบกระตุ้นหัวใจด้วยไฟฟ้าชั่วคราว เรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                            }}
                            className="w-full medical-btn bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-md transition-all active:scale-95 cursor-pointer border-t border-slate-500"
                          >
                            <div className="flex items-center gap-3">
                              <Zap className="w-5 h-5 text-emerald-400" />
                              <div className="text-left">
                                <span className="text-sm font-black block">Transcutaneous Pacing (TCP)</span>
                                <span className="text-[9px] opacity-90 block">เริ่มทันทีเนื่องจากคนไข้ Unstable (ไม่คงที่) และให้ยาไม่ได้ผล</span>
                              </div>
                            </div>
                            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">START TCP</span>
                          </button>
                        </div>

                        {/* Other Urgent Decisions & Care for Unstable */}
                        <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl space-y-2">
                          <div className="text-[11px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-700 animate-pulse" />
                            การตัดสินใจช่วยในรูปแบบอื่น ๆ (Urgent Decision Pathways)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                handleLogProcedure('Urgent decision: Activated Medical Emergency Team');
                                speakThai('ตามทีมช่วยชีวิตฉุกเฉินเฉพาะทาง ด่วนที่สุดเรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>1. เปิดใช้ระบบทีมกู้ชีพเร่งด่วน</span>
                              <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Urgent decision: Coordinated with Cardiac Cath Lab for Emergency Pacing');
                                speakThai('ประสานแจ้งเตรียมห้องสวนหัวใจ ด่วนเรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>2. เตรียมห้องปฏิบัติการสวนหัวใจด่วน</span>
                              <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Urgent decision: Coordinated ICU/CCU bed for transfer');
                                speakThai('ประสานเตรียมเตียงไอซียูโรคหัวใจ เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>3. ประสานย้ายเข้าไอซียู / CCU ด่วน</span>
                              <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Urgent decision: Prepared bedside Transvenous Pacing (TVP) equipment');
                                speakThai('เตรียมอุปกรณ์ใส่สายกระตุ้นหัวใจชั่วคราว ด่วนเรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>4. เตรียมใส่สายกระตุ้นหัวใจชั่วคราว</span>
                              <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {stabilityStatus === 'stable' && (
                      <div className="space-y-4">
                        {/* Safe Monitor & Cause Identification */}
                        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-3">
                          <div className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                            แผนการดูแลรักษาผู้ป่วยอาการคงที่ (Stable Bradycardia Guidance)
                          </div>
                          
                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            เนื่องจากคนไข้มีอาการคงที่ (Stable) ตามแนวทางปฏิบัติของ ACLS ให้เน้นการเฝ้าสังเกต เฝ้าระวังติดตามสัญญาณชีพอย่างต่อเนื่อง ค้นหาสาเหตุของการเกิดชีพจรช้า (เช่น 5H & 5T, การได้รับยา Beta-blockers / Calcium Channel Blockers เกินขนาด) และเตรียมอุปกรณ์ช่วยชีวิตเผื่อผู้ป่วยมีสภาวะแย่ลง (เช่น Atropine / Pacing Pads) ไว้ที่ข้างเตียงค่ะ
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                            <button
                              onClick={() => {
                                handleLogProcedure('Performed 12-Lead ECG for Bradycardia diagnostics');
                                speakThai('ทำอีเคจี 12 lead เพื่อวินิจฉัยสภาวะชีพจรช้า เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-3 px-4 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-left text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between shadow-sm"
                            >
                              <div>
                                <span className="block font-black">ทำ 12-Lead ECG</span>
                                <span className="block text-[9px] text-slate-500 font-semibold mt-0.5">วิเคราะห์หาบล็อคในหัวใจ AV Block</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-emerald-600" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Continuous Vital Signs & ECG monitoring established');
                                speakThai('เฝ้าระวังคลื่นไฟฟ้าหัวใจ และสัญญาณเตือนฉุกเฉินอย่างต่อเนื่อง เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-3 px-4 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-left text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between shadow-sm"
                            >
                              <div>
                                <span className="block font-black">เฝ้าระวังคลื่นไฟฟ้าหัวใจต่อเนื่อง</span>
                                <span className="block text-[9px] text-slate-500 font-semibold mt-0.5">ติด EKG Monitor และวัด BP, SpO2</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-emerald-600" />
                            </button>
                          </div>
                        </div>

                        {/* Other Decisions & Care for Stable */}
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl space-y-2">
                          <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-slate-600" />
                            การตัดสินใจช่วยในรูปแบบอื่น ๆ (Decision Support Pathways)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                handleLogProcedure('Decision: Consulted Cardiology for outpatient or elective pacing evaluation');
                                speakThai('ปรึกษาอายุรแพทย์โรคหัวใจ เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>1. ปรึกษาแพทย์เฉพาะทางโรคหัวใจ</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Decision: Ordered Echocardiogram to evaluate structural heart integrity');
                                speakThai('ส่งตรวจเอ๊กโค่ เพื่อประเมินการทำงานของหัวใจค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>2. ส่งตรวจเอคโค่หัวใจ (Echocardiogram)</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Decision: Checked blood panels for electrolytes, thyroid profile, drug levels');
                                speakThai('ส่งเจาะเลือดตรวจเกลือแร่ ไทรอย และสานพิดตกค้างค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>3. ส่งตรวจ Lab เกลือแร่ และหาสาเหตุยาเกินขนาด</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Decision: Planned 24-hour Holter Monitor for continuous outpatient EKG telemetry');
                                speakThai('วางแผนส่งติดตามคลื่นไฟฟ้าหัวใจ ตลอดยี่สิบสี่ชั่วโมง เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>4. วางแผนตรวจคลื่นหัวใจ 24 ชั่วโมง</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. TACHYCARDIA PANEL */}
                {lastRhythmDecision === 'tachycardia' && (
                  <div className="space-y-4">
                    {/* Clinical Stability Assessment Buttons */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          ขั้นตอนที่ 1: ประเมินอาการคงที่ และไม่คงที่ (Stability Assessment)
                        </span>
                        {stabilityStatus && (
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black font-mono uppercase ${
                            stabilityStatus === 'stable' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}>
                            {stabilityStatus}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setStabilityStatus('stable');
                            setReassessWarningActive(false);
                            setTachyVagalFlashing(true);
                            setTachyAmioFlashing(true);
                            setTachyConsultFlashing(false);
                            addLog("Clinical Assessment: STABLE Tachycardia", "system");
                            speakThai("ประเมินแล้ว อาการคงที่ค่ะ");
                          }}
                          className={`py-3 px-4 rounded-xl font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border-2 text-center ${
                            stabilityStatus === 'stable'
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-md ring-2 ring-emerald-500/50'
                              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          <span className="text-sm font-black">อาการคงที่ (Stable)</span>
                          <span className="text-[10px] opacity-80 font-normal">ไม่มีสัญญาณอันตราย 5 ข้อ</span>
                        </button>
                        <button
                          onClick={() => {
                            setStabilityStatus('unstable');
                            setReassessWarningActive(false);
                            setTachyVagalFlashing(false);
                            setTachyAmioFlashing(false);
                            setTachyConsultFlashing(false);
                            addLog("Clinical Assessment: UNSTABLE Tachycardia", "system");
                            speakThai("ประเมินแล้ว อาการไม่คงที่ค่ะ");
                          }}
                          className={`py-3 px-4 rounded-xl font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border-2 text-center ${
                            stabilityStatus === 'unstable'
                              ? 'bg-rose-600 border-rose-700 text-white shadow-md animate-pulse ring-2 ring-rose-500/50'
                              : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span className="text-sm font-black">อาการไม่คงที่ (Unstable)</span>
                          <span className="text-[10px] opacity-80 font-normal">มีอาการสัญญาณอันตราย</span>
                        </button>
                      </div>

                      {/* Reassessment warning box in Tachycardia Section */}
                      {reassessWarningActive && (
                        <div className="bg-amber-500/10 border-2 border-amber-500 p-4 rounded-xl flex items-start gap-3 animate-pulse mt-2">
                          <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-800 block text-xs sm:text-sm text-left">
                              ⚠️ โปรดประเมินอาการคงที่ และไม่คงที่ ซ้ำอีกครั้ง!
                            </strong>
                            <span className="text-[11px] text-amber-700 block mt-0.5 text-left">
                              หลังให้การรักษา (ยา/TCP/Cardioversion) กรุณากดปุ่มประเมิน "อาการคงที่" หรือ "อาการไม่คงที่" ด้านบนซ้ำอีกครั้ง
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 leading-snug mt-1 bg-white p-2 rounded-lg border border-slate-150">
                        <span className="font-bold text-rose-600">⚠️ สัญญาณอันตราย (Clinical Indicators of Instability):</span> 
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 mt-1 font-semibold">
                          <div>• ความดันโลหิตต่ำ (SBP &lt; 90 mmHg)</div>
                          <div>• มีอาการซึมลง สับสนเฉียบพลัน</div>
                          <div>• มีภาวะช็อก (ตัวเย็น ตัวซีด เหงื่อออก)</div>
                          <div>• แน่นหน้าอกจากการขาดเลือดไปเลี้ยง</div>
                          <div>• ภาวะหัวใจล้มเหลวเฉียบพลัน / หอบเหนื่อย</div>
                        </div>
                      </div>
                    </div>

                    {/* Grouped Interventions based on Stability Status */}
                    {stabilityStatus === null && (
                      <div className="p-5 bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl text-center">
                        <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2 animate-bounce" />
                        <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">
                          โปรดเลือกสถานะความคงที่ของผู้ป่วยด้านบน
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">
                          กดเลือก [อาการคงที่] หรือ [อาการไม่คงที่] เพื่อเริ่มต้นจัดการแนวทางการให้ยา การทำหัตถการ และการตัดสินใจช่วยเหลือที่ถูกต้องเหมาะสมตามไกด์ไลน์ค่ะ
                        </p>
                      </div>
                    )}

                    {stabilityStatus === 'unstable' && (
                      <div className="space-y-4">
                        {/* Hatthakan (Procedures) */}
                        <div>
                          <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">
                            1. หัตถการช่วยชีวิตด่วนสำหรับ Unstable Tachycardia (Synchronized Cardioversion)
                          </div>

                          <button 
                            onClick={() => {
                              handleLogProcedure('Prepared and administered conscious sedation for cardioversion');
                              speakThai('ให้ยาบรรเทาปวดและยาระงับความรู้สึก ก่อนทำคาดิโอเวอชั่น เรียบร้อยแล้วค่ะ');
                            }}
                            className="w-full medical-btn bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl p-3 mb-3 flex items-center justify-between transition-all active:scale-95 cursor-pointer"
                          >
                            <span className="text-xs font-black">💊 ให้ยาบรรเทาปวด/ยาสลบก่อนทำ (Sedation)</span>
                            <span className="text-[10px] text-slate-500 font-bold">ทำเมื่อผู้ป่วยยังรู้สึกตัวดี</span>
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button 
                              onClick={() => {
                                handleLogProcedure('Synchronized Cardioversion Delivered (100J)');
                                triggerReassessmentAlert('Synchronized Cardioversion 100J', 'ทำการปล่อยช็อคคาดิโอเวอชั่น ขนาดหนึ่งร้อยจูล เรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                              }}
                              className="medical-btn bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl p-4 flex items-center justify-between shadow-md transition-all active:scale-95 cursor-pointer border-t border-amber-400"
                            >
                              <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-yellow-300" />
                                <div className="text-left">
                                  <span className="text-xs font-black block">Cardioversion 100J (Narrow Reg)</span>
                                </div>
                              </div>
                              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase">100J</span>
                            </button>

                            <button 
                              onClick={() => {
                                handleLogProcedure('Synchronized Cardioversion Delivered (200J)');
                                triggerReassessmentAlert('Synchronized Cardioversion 200J', 'ทำการปล่อยช็อคคาดิโอเวอชั่น ขนาดสองร้อยจูล เรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                              }}
                              className="medical-btn bg-gradient-to-br from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white rounded-xl p-4 flex items-center justify-between shadow-md transition-all active:scale-95 cursor-pointer border-t border-amber-500"
                            >
                              <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-red-300 animate-pulse" />
                                <div className="text-left">
                                  <span className="text-xs font-black block">Cardioversion 200J (Wide Irreg)</span>
                                </div>
                              </div>
                              <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase">200J</span>
                            </button>
                          </div>
                        </div>

                        {/* Medications */}
                        <div>
                          <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">
                            2. ยาเฉพาะทางเพิ่มเติม (หากคลื่น QRS แคบและสม่ำเสมอ อาจให้ในขณะรอทำช็อก)
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {/* Adenosine 6mg */}
                            <button 
                              onClick={() => {
                                if (adenosineCount >= 1) {
                                  speakThai("ให้ยาอะดีโนซีนขนาดหกมิลลิกรัม โดสแรกไปแล้วค่ะ ไม่สามารถให้ซ้ำได้นะคะ");
                                  return;
                                }
                                handleLogPresetMed('Adenosine 6mg IV rapid push', true);
                                triggerReassessmentAlert('Adenosine 6mg IV', 'ให้ยาอะดีโนซีน ขนาด 6 มิลลิกรัม ดับเบิ้นไซริ๊งเรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                              }}
                              disabled={adenosineCount >= 1}
                              className={`medical-btn bg-gradient-to-br text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[100px] transition-all cursor-pointer border-t ${
                                adenosineCount >= 1
                                  ? 'from-slate-400 to-slate-500 border-slate-300 opacity-60 cursor-not-allowed'
                                  : 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 border-indigo-400 active:scale-95'
                              }`}
                            >
                              <div className="flex justify-between items-start w-full">
                                <span className="text-base font-black tracking-tight">ADENOSINE 6mg</span>
                                <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                                  {adenosineCount >= 1 ? 'Given (1/1)' : `Given: ${adenosineCount}`}
                                </span>
                              </div>
                              <span className="text-[10px] uppercase font-bold opacity-90 text-left mt-2">6 mg Rapid IV Push (สำหรับ QRS แคบสม่ำเสมอ เช่น SVT)</span>
                            </button>

                            {/* Adenosine 12mg */}
                            <button 
                              onClick={() => {
                                if (adenosineCount === 0) {
                                  speakThai("กรุณาให้ยาอะดีโนซีน ขนาดหกมิลลิกรัม เป็นโดสแรกก่อนนะคะ");
                                  return;
                                }
                                if (adenosineCount >= 2) {
                                  speakThai("ให้ยาอะดีโนซีนครบสองโดส สูงสุดตามแนวทางแล้วค่ะ ไม่สามารถให้เพิ่มได้แล้วนะคะ");
                                  return;
                                }
                                handleLogPresetMed('Adenosine 12mg IV rapid push', true);
                                triggerReassessmentAlert('Adenosine 12mg IV', 'ให้ยาอะดีโนซีน ขนาด 12 มิลลิกรัม ดับเบิ้นไซริ๊งเรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                              }}
                              disabled={adenosineCount !== 1}
                              className={`medical-btn bg-gradient-to-br text-white rounded-xl p-4 flex flex-col justify-between shadow-md min-h-[100px] transition-all cursor-pointer border-t ${
                                adenosineCount !== 1
                                  ? 'from-slate-400 to-slate-500 border-slate-300 opacity-60 cursor-not-allowed'
                                  : 'from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-indigo-500 active:scale-95'
                              }`}
                            >
                              <div className="flex justify-between items-start w-full">
                                <span className="text-base font-black tracking-tight">ADENOSINE 12mg</span>
                                <span className="bg-white/10 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                                  {adenosineCount === 0 ? 'N/A' : adenosineCount >= 2 ? 'Given (1/1)' : 'Ready'}
                                </span>
                              </div>
                              <span className="text-[10px] uppercase font-bold opacity-90 text-left mt-2">12 mg Rapid IV Push (ให้ถ้าขนาด 6mg แรกไม่ได้ผล)</span>
                            </button>
                          </div>
                        </div>

                        {/* Other Urgent Decisions & Care for Unstable Tachycardia */}
                        <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl space-y-2">
                          <div className="text-[11px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-700 animate-pulse" />
                            การตัดสินใจช่วยในรูปแบบอื่น ๆ (Urgent Decision Pathways)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                handleLogProcedure('Urgent decision: Activated Critical Care Response Team');
                                speakThai('ตามทีมช่วยชีวิตวิกฤตเฉพาะทาง มาสนับสนุนด่วนเรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>1. เปิดเรียกทีมช่วยฟื้นคืนชีพขั้นสูงด่วน</span>
                              <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Urgent decision: Prepared emergency vasoactive infusions (Norepinephrine / Epinephrine)');
                                speakThai('เตรียมดิบยา กระตุ้นความดัน เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>2. เตรียมยาดริปปรับความดัน (Vasoactive)</span>
                              <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Urgent decision: Placed Advanced Airway intubation kit at bedside');
                                speakThai('เตรียมชุดอุปกรณ์สำหรับใส่ท่อช่วยหายใจขั้นสูง ไว้ข้างเตียงเรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>3. เตรียมอุปกรณ์ใส่ท่อช่วยหายใจขั้นสูง</span>
                              <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Urgent decision: Coordinated direct transfer to CCU');
                                speakThai('ประสานเตรียมเตียงไอซียูโรคหัวใจ ด่วนที่สุดเรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>4. ประสานย้ายหอผู้ป่วยวิกฤต CCU ด่วน</span>
                              <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {stabilityStatus === 'stable' && (
                      <div className="space-y-4">
                        {/* 1. NARROW QRS (< 0.12s) */}
                        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl space-y-3">
                          <div className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                            1. กรณีคลื่นไฟฟ้าหัวใจ QRS แคบ (Narrow QRS &lt; 0.12s)
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                handleLogProcedure('Vagal Maneuvers performed (Carotid Massage / Valsalva)');
                                triggerReassessmentAlert('Vagal Maneuvers', 'ทำวาก้อเมนูเว่อ เรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำอีกครั้งค่ะ', true);
                                setTachyVagalFlashing(false);
                              }}
                              className={`py-3 px-4 rounded-xl text-left text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between border ${
                                tachyVagalFlashing
                                  ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-500 text-emerald-950 shadow-lg ring-2 ring-emerald-500 animate-pulse'
                                  : 'bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
                              }`}
                            >
                              <div>
                                <span className="block font-black">Vagal Maneuvers</span>
                                <span className="block text-[9px] text-slate-500 font-semibold mt-0.5">กระตุ้นระบบประสาทเวกัส (SVT)</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-emerald-600" />
                            </button>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  if (adenosineCount >= 1) {
                                    speakThai("ให้ยาอะดีโนซีนขนาดหกมิลลิกรัม โดสแรกไปแล้วค่ะ ไม่สามารถให้ซ้ำได้นะคะ");
                                    return;
                                  }
                                  handleLogPresetMed('Adenosine 6mg IV rapid push', true);
                                  triggerReassessmentAlert('Adenosine 6mg IV', 'ให้ยาอะดีโนซีน ขนาด 6 มิลลิกรัม ดับเบิ้นไซริ๊งเรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                                }}
                                disabled={adenosineCount >= 1}
                                className={`flex-1 medical-btn bg-gradient-to-br text-white rounded-xl p-2.5 flex flex-col justify-between shadow-md transition-all cursor-pointer border-t ${
                                  adenosineCount >= 1
                                    ? 'from-slate-400 to-slate-500 border-slate-300 opacity-60 cursor-not-allowed'
                                    : 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 border-indigo-400 active:scale-95'
                                }`}
                              >
                                <span className="text-xs font-black">Adenosine 6mg</span>
                                <span className="text-[9px] bg-white/20 px-1 py-0.5 rounded font-mono block mt-1 w-max font-bold">
                                  {adenosineCount >= 1 ? 'Given (1/1)' : `Given: ${adenosineCount}`}
                                </span>
                              </button>
                              
                              <button 
                                onClick={() => {
                                  if (adenosineCount === 0) {
                                    speakThai("กรุณาให้ยาอะดีโนซีน ขนาดหกมิลลิกรัม เป็นโดสแรกก่อนนะคะ");
                                    return;
                                  }
                                  if (adenosineCount >= 2) {
                                    speakThai("ให้ยาอะดีโนซีนครบสองโดส สูงสุดตามแนวทางแล้วค่ะ ไม่สามารถให้เพิ่มได้แล้วนะคะ");
                                    return;
                                  }
                                  handleLogPresetMed('Adenosine 12mg IV rapid push', true);
                                  triggerReassessmentAlert('Adenosine 12mg IV', 'ให้ยาอะดีโนซีน ขนาด 12 มิลลิกรัม ดับเบิ้นไซริ๊งเรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                                }}
                                disabled={adenosineCount !== 1}
                                className={`flex-1 medical-btn bg-gradient-to-br text-white rounded-xl p-2.5 flex flex-col justify-between shadow-md transition-all cursor-pointer border-t ${
                                  adenosineCount !== 1
                                    ? 'from-slate-400 to-slate-500 border-slate-300 opacity-60 cursor-not-allowed'
                                    : 'from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-indigo-500 active:scale-95'
                                }`}
                              >
                                <span className="text-xs font-black">Adenosine 12mg</span>
                                <span className="text-[9px] bg-white/20 px-1 py-0.5 rounded font-mono block mt-1 w-max font-bold">
                                  {adenosineCount === 0 ? 'N/A' : adenosineCount >= 2 ? 'Given (1/1)' : '2nd Dose'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 2. WIDE QRS (>= 0.12s) */}
                        <div className="bg-indigo-50/50 border border-indigo-200 p-4 rounded-xl space-y-3">
                          <div className="text-[11px] font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-indigo-700 animate-pulse" />
                            2. กรณีคลื่นไฟฟ้าหัวใจ QRS กว้าง (Wide QRS &ge; 0.12s)
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => {
                                handleLogPresetMed('Amiodarone 150mg IV Infusion', true);
                                triggerReassessmentAlert('Amiodarone 150mg Infusion', 'เริ่มดิบยาอะมิโอดาโรน ร้อยห้าสิบมิลลิกรัม เรียบร้อยแล้วค่ะ อย่าลืมประเมินอาการคนไข้ซ้ำนะคะ', true);
                                setTachyAmioFlashing(false);
                                setTachyConsultFlashing(true);
                              }}
                              className={`py-3 px-4 text-white rounded-xl text-left text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between border-t border-slate-400 ${
                                tachyAmioFlashing
                                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 ring-2 ring-indigo-400 animate-pulse shadow-lg'
                                  : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-sm'
                              }`}
                            >
                              <div>
                                <span className="block font-black text-white">Amiodarone 150mg Drip</span>
                                <span className="block text-[9px] text-slate-200 font-semibold mt-0.5">ดริปทางหลอดเลือดดำนาน 10 นาที</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Consulted expert Cardiologist for wide-complex tachycardia');
                                speakThai('ส่งปรึกษาแพทย์เฉพาะทางโรคหัวใจ เพื่อประเมินแผนการจี้หัวใจ เรียบร้อยแล้วค่ะ');
                                setTachyConsultFlashing(false);
                              }}
                              className={`py-3 px-4 rounded-xl text-left text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between border ${
                                tachyConsultFlashing
                                  ? 'bg-indigo-100 hover:bg-indigo-200 border-indigo-500 text-indigo-950 shadow-lg ring-2 ring-indigo-500 animate-pulse'
                                  : 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-900 shadow-sm'
                              }`}
                            >
                              <div>
                                <span className="block font-black">ปรึกษาแพทย์เฉพาะทางโรคหัวใจ</span>
                                <span className="block text-[9px] text-slate-500 font-semibold mt-0.5">วินิจฉัยเพื่อรักษาแบบ Elective</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-indigo-600" />
                            </button>
                          </div>
                        </div>

                        {/* Other Decisions & Care for Stable Tachycardia */}
                        <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl space-y-2">
                          <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-slate-600" />
                            การตัดสินใจช่วยในรูปแบบอื่น ๆ (Decision Support Pathways)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                handleLogProcedure('Decision: Ordered Urgent 12-Lead ECG for diagnostic confirmation of tachycardia type');
                                speakThai('ทำอีเคจี 12 lead เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>1. ทำคลื่นไฟฟ้าหัวใจ 12-Lead ECG ด่วน</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Decision: Checked Serum Electrolytes, Calcium, and Magnesium levels');
                                speakThai('เจาะเลือดส่งตรวจเกลือแร่ และระดับแมกนีเซียม โพแทสเซียม เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>2. ส่งตรวจ Serum Electrolytes & Mg/K</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Decision: Arranged consultation with Cardiac Electrophysiologist (EP) for catheter ablation plan');
                                speakThai('ส่งปรึกษาแพทย์ไฟฟ้าหัวใจ เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>3. ส่งอายุรศาสตร์หัวใจสรีรวิทยาไฟฟ้า (EP)</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>

                            <button
                              onClick={() => {
                                handleLogProcedure('Decision: Ordered Thyroid Function Panel (TSH/FT3/FT4) to evaluate hyperthyroidism risk');
                                speakThai('ส่งตรวจการทำงานของไทรอยด์ เรียบร้อยแล้วค่ะ');
                              }}
                              className="py-2.5 px-3 bg-white hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-lg text-left text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center justify-between"
                            >
                              <span>4. ส่งตรวจการทำงานของต่อมไทรอยด์</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. ROSC (POST-CARDIAC ARREST CARE) PANEL */}
                {lastRhythmDecision === 'rosc' && (
                  <div className="space-y-4">
                    {/* Status Selectors Header */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                      <span className="text-xs font-black text-slate-700 uppercase block">1. ประเมินและเลือกสภาวะคนไข้หลังกลับมามีชีพจร (Initial Assessment)</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* BP SBP Status Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase block">ความดันโลหิต (Blood Pressure)</label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setRoscBPStatus('hypotension');
                                addLog("ROSC Assessment: BP is Hypotensive (SBP < 90 mmHg / MAP < 65 mmHg)", "system");
                                speakThai("ตรวจพบความดันโลหิตต่ำนะคะ ต้องช่วยเพิ่มความดันโลหิตทันทีค่ะ");
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                                roscBPStatus === 'hypotension'
                                  ? 'bg-rose-100 text-rose-700 border-rose-300 ring-1 ring-rose-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              SBP &lt; 90
                            </button>
                            <button
                              onClick={() => {
                                setRoscBPStatus('adequate');
                                addLog("ROSC Assessment: BP is Adequate (SBP >= 90 mmHg)", "system");
                                speakThai("ความดันโลหิตปกติดีแล้วค่ะ");
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                                roscBPStatus === 'adequate'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              SBP &ge; 90
                            </button>
                          </div>
                        </div>

                        {/* SpO2 Level Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase block">ความอิ่มตัวออกซิเจน (SpO2)</label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setRoscSpO2Level('low');
                                addLog("ROSC Assessment: Oxygen level is Low (SpO2 < 92%)", "system");
                                speakThai("ระวังนะคะ ค่าออกซิเจนปลายนิ้วต่ำกว่าเก้าสิบสองเปอร์เซ็นต์ค่ะ กรุณาปรับเพิ่มออกซิเจนนะคะ");
                              }}
                              className={`flex-1 py-1.5 px-1 rounded-lg text-[9px] font-bold text-center border transition-all cursor-pointer ${
                                roscSpO2Level === 'low'
                                  ? 'bg-red-100 text-red-700 border-red-300 ring-1 ring-red-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              &lt; 92%
                            </button>
                            <button
                              onClick={() => {
                                setRoscSpO2Level('normal');
                                addLog("ROSC Assessment: Oxygen level is Optimal (SpO2 92-98%)", "system");
                                speakThai("ค่าออกซิเจนปลายนิ้วปกติดีแล้วค่ะ");
                              }}
                              className={`flex-1 py-1.5 px-1 rounded-lg text-[9px] font-bold text-center border transition-all cursor-pointer ${
                                roscSpO2Level === 'normal'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              92-98%
                            </button>
                            <button
                              onClick={() => {
                                setRoscSpO2Level('high');
                                addLog("ROSC Assessment: Oxygen level is Hyperoxic (SpO2 > 98%)", "system");
                                speakThai("ออกซิเจนสูงเกินไปแล้วค่ะ ระวังภาวะพิษจากออกซิเจนนะคะ กรุณาปรับลดออกซิเจนลง ให้ได้เก้าสิบสองถึงเก้าสิบแปดเปอร์เซ็นต์ค่ะ");
                              }}
                              className={`flex-1 py-1.5 px-1 rounded-lg text-[9px] font-bold text-center border transition-all cursor-pointer ${
                                roscSpO2Level === 'high'
                                  ? 'bg-amber-100 text-amber-700 border-amber-300 ring-1 ring-amber-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              &gt; 98%
                            </button>
                          </div>
                        </div>

                        {/* STEMI Status */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase block">คลื่นไฟฟ้าหัวใจ (12-Lead ECG)</label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setRoscStemiStatus('yes');
                                addLog("ROSC Assessment: ECG reveals STEMI / Acute Myocardial Infarction", "system");
                                speakThai("ระวังนะคะ พบคลื่นหัวใจขาดเลือดเฉียบพลันชนิดสเตมี่ กรุณาเปิดระบบทางด่วนสวนหัวใจ ด่วนที่สุดค่ะ");
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                                roscStemiStatus === 'yes'
                                  ? 'bg-red-100 text-red-700 border-red-300 ring-1 ring-red-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              STEMI
                            </button>
                            <button
                              onClick={() => {
                                setRoscStemiStatus('no');
                                addLog("ROSC Assessment: ECG shows No STEMI", "system");
                                speakThai("ไม่พบคลื่นหัวใจขาดเลือดเฉียบพลันแบบสเตมี่นะคะ");
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                                roscStemiStatus === 'no'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              No STEMI
                            </button>
                          </div>
                        </div>

                        {/* Consciousness Status */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase block">การทำตามสั่ง (Neurological)</label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setRoscComatoseStatus('no');
                                addLog("ROSC Assessment: Patient is Conscious / Follows commands", "system");
                                speakThai("คนไข้รู้สึกตัวดี และทำตามสั่งได้แล้วค่ะ");
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                                roscComatoseStatus === 'no'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              ทำตามสั่งได้
                            </button>
                            <button
                              onClick={() => {
                                setRoscComatoseStatus('yes');
                                addLog("ROSC Assessment: Patient is Comatose / Does not follow commands", "system");
                                speakThai("คนไข้ไม่รู้สึกตัว และทำตามสั่งไม่ได้นะคะ กรุณาเริ่มทำ Temperature Control ควบคุมอุณหภูมิทันที เพื่อประคองสมองคนไข้ค่ะ");
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                                roscComatoseStatus === 'yes'
                                  ? 'bg-purple-100 text-purple-700 border-purple-300 ring-1 ring-purple-300'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              ไม่รู้สึกตัว
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC GUIDELINE RECOMMENDATIONS */}
                    {roscBPStatus === 'hypotension' && (
                      <div className="bg-red-500/10 border-2 border-red-500 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-pulse">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-red-800 block text-xs sm:text-sm">
                              🚨 ตรวจพบภาวะความดันโลหิตต่ำ (SBP &lt; 90 mmHg / MAP &lt; 65 mmHg)
                            </strong>
                            <span className="text-[11px] text-red-700 block mt-0.5">
                              แก้ไขภาวะความดันต่ำทันที: ดริปสารน้ำ 1-2 ลิตร และเริ่มให้ยากระตุ้นความดันโลหิต (Norepinephrine / Epinephrine ดริป)
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                          <button
                            onClick={() => {
                              handleLogPresetMed('IV Fluid Bolus 1L');
                              speakThai('ให้สารน้ำ ไอวี ฟลูอิด เรียบร้อยแล้วค่ะ');
                            }}
                            className="flex-1 sm:flex-initial py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black text-[10px] cursor-pointer shadow-sm transition-all"
                          >
                            + ให้ IV Fluid Bolus
                          </button>
                          <button
                            onClick={() => {
                              setNoradrenalineCount(prev => prev + 1);
                              handleLogPresetMed(`Norepinephrine Infusion started (0.1-2.0 mcg/kg/min)`);
                              speakThai('เริ่มดริปยานอร์อะดรีนาลีน เรียบร้อยแล้วค่ะ');
                            }}
                            className="flex-1 sm:flex-initial py-1.5 px-3 bg-red-800 hover:bg-red-900 text-white rounded-lg font-black text-[10px] cursor-pointer shadow-sm transition-all"
                          >
                            + ดริป Norepinephrine ({noradrenalineCount})
                          </button>
                        </div>
                      </div>
                    )}

                    {roscSpO2Level === 'low' && (
                      <div className="bg-red-500/10 border border-red-500 p-3.5 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-red-800 block text-xs">
                            ⚠️ ตรวจพบระดับออกซิเจนในเลือดต่ำเกินไป (SpO2 &lt; 92%)
                          </strong>
                          <span className="text-[11px] text-red-700 block mt-0.5">
                            กรุณาปรับเพิ่มออกซิเจน และตรวจสอบท่อช่วยหายใจ (ET-Tube / SGA) และประเมิน Capnography (เป้าหมาย PETCO2 35-45 mmHg)
                          </span>
                        </div>
                      </div>
                    )}

                    {roscSpO2Level === 'high' && (
                      <div className="bg-amber-500/10 border border-amber-500 p-3.5 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-800 block text-xs">
                            ⚠️ ออกซิเจนในเลือดสูงเกินไป (SpO2 &gt; 98%)
                          </strong>
                          <span className="text-[11px] text-amber-700 block mt-0.5">
                            ระวังภาวะพิษจากออกซิเจนและสารอนุมูลอิสระ (Hyperoxia) กรุณาปรับลดความเข้มข้นของออกซิเจนลง (Wean FiO2) ให้เป้าหมายคงอยู่ที่ 92% - 98%
                          </span>
                        </div>
                      </div>
                    )}

                    {roscStemiStatus === 'yes' && (
                      <div className="bg-red-600 text-white p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-4 border-red-900 shadow-md">
                        <div className="flex items-start gap-3">
                          <Zap className="w-6 h-6 shrink-0 mt-0.5 animate-bounce fill-white text-white" />
                          <div>
                            <strong className="block text-xs sm:text-sm uppercase tracking-wider">
                              🚨 12-LEAD ECG: STEMI / ACUTE CORONARY INFARCTION DETECTED!
                            </strong>
                            <span className="text-[11px] text-white/90 block mt-0.5 font-medium">
                              ส่งผู้ป่วยไปสวนหลอดเลือดหัวใจด่วนที่สุด เพื่อเปิดหลอดเลือดทันที (Coronary Reperfusion / Emergency PCI)
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleLogProcedure("Activated Coronary Reperfusion (Coronary Angiography & PCI) / Called Cath Lab");
                            speakThai("ประสานห้องปฏิบัติการสวนหัวใจ เรียบร้อยแล้วค่ะ");
                          }}
                          className="w-full sm:w-auto py-2 px-4 bg-white hover:bg-slate-100 text-red-700 rounded-lg font-black text-xs cursor-pointer shadow transition-all shrink-0 uppercase tracking-widest active:scale-95"
                        >
                          เปิดระบบด่วน (Activate Cath Lab)
                        </button>
                      </div>
                    )}

                    {roscComatoseStatus === 'yes' && (
                      <div className="bg-purple-500/10 border-2 border-purple-500 p-4 rounded-xl space-y-3">
                        <div className="flex items-start gap-3">
                          <Activity className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-purple-800 block text-xs sm:text-sm">
                              ❄️ คนไข้ไม่รู้สึกตัว (Comatose): ทำ Temperature Control / ควบคุมอุณหภูมิทันที
                            </strong>
                            <span className="text-[11px] text-purple-700 block mt-0.5">
                              ควบคุมอุณหภูมิร่างกายเป้าหมายคงที่ 32°C - 37.5°C เป็นเวลานานอย่างน้อย 36 ชั่วโมง เพื่อปกป้องสมองเสียหายจากภาวะขาดเลือด
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-black text-purple-800 mr-2">เลือกอุณหภูมิเป้าหมาย:</span>
                          {['32°C', '33°C', '34°C', '35°C', '36°C', '37°C', '37.5°C'].map((temp) => (
                            <button
                              key={temp}
                              onClick={() => {
                                handleLogProcedure(`Temperature Control target set to ${temp}`);
                                speakThai(`ตั้งค่าอุณหภูมิเป้าหมายประคองสมองที่ ${temp.replace('°C', ' องศาเซลเซียส')} เรียบร้อยแล้วค่ะ`);
                              }}
                              className="py-1 px-2.5 bg-white hover:bg-purple-100 border border-purple-300 rounded-md text-[10px] font-black text-purple-700 transition-all cursor-pointer active:scale-95"
                            >
                              {temp}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE PROCEDURES CHECKLIST */}
                    <div>
                      <div className="text-[11px] font-black text-slate-400 uppercase mb-2 tracking-wider">2. แผนการดูแลและหัตถการหลังมีชีพจร (Interactive Care Checklist)</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          {
                            key: 'airway',
                            title: 'ใส่ท่อช่วยหายใจและติดตามคลื่นคาร์บอน',
                            desc: 'Secure Advanced Airway (ET-Tube / SGA) & Check Waveform Capnography',
                            speak: 'ตรวจสอบท่อช่วยหายใจ และต่อเครื่องวัดคาร์บอนไดออกไซด์ เรียบร้อยแล้วค่ะ'
                          },
                          {
                            key: 'ecg12',
                            title: 'ทำคลื่นไฟฟ้าหัวใจ 12-Lead ECG ทันที',
                            desc: 'Perform 12-Lead ECG to rule out STEMI or other acute ischemia',
                            speak: 'ทำอีเคจี 12 lead เรียบร้อยแล้วค่ะ'
                          },
                          {
                            key: 'labs',
                            title: 'ส่งเจาะเลือดตรวจหา Electrolyte & น้ำตาล',
                            desc: 'Check Serum Potassium, Magnesium, and Blood Glucose levels (target 140-180 mg/dL)',
                            speak: 'เจาะเลือดส่งตรวจเกลือแร่ และระดับน้ำตาล เรียบร้อยแล้วค่ะ'
                          },
                          {
                            key: 'ct_brain',
                            title: 'ประเมินเพื่อส่งตรวจเอกซเรย์คอมพิวเตอร์สมอง',
                            desc: 'Consider Head CT scan for neuro-prognostication or intracranial cause',
                            speak: 'ส่งประเมินและเอ็กซเรย์คอมพิวเตอร์สมอง เรียบร้อยแล้วค่ะ'
                          }
                        ].map((item) => {
                          const checked = roscCheckedSteps.includes(item.key);
                          return (
                            <button
                              key={item.key}
                              onClick={() => {
                                let nextChecked = [];
                                if (checked) {
                                  nextChecked = roscCheckedSteps.filter(x => x !== item.key);
                                  addLog(`ROSC: Deselected "${item.title}"`, "system");
                                } else {
                                  nextChecked = [...roscCheckedSteps, item.key];
                                  addLog(`ROSC Completed: ${item.title} (${item.desc})`, "system");
                                  speakThai(item.speak);
                                }
                                setRoscCheckedSteps(nextChecked);
                              }}
                              className={`medical-btn p-3.5 rounded-xl border text-left transition-all active:scale-95 cursor-pointer flex items-start gap-3 shadow-sm ${
                                checked 
                                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900' 
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div>
                                <span className="text-[11px] font-black block leading-snug">{item.title}</span>
                                <span className={`text-[9px] block mt-0.5 leading-relaxed ${checked ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                                  {item.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* EVENT LOG MODULE (bg-slate-900) */}
          <div className="bg-slate-900 rounded-[14px] flex flex-col overflow-hidden shadow-2xl border border-slate-850 min-h-[120px]">
            
            {/* Header section with report copy */}
            <div className="px-2.5 py-1.5 bg-slate-800/60 flex justify-between items-center border-b border-slate-800/80">
              <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                Event Log (บันทึกและรายงานเคส)
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  id="pdf-report-btn"
                  onClick={handleExportPDF}
                  disabled={logs.length === 0}
                  className="text-[8px] font-black px-2 py-0.5 rounded-md border border-emerald-600/80 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-sm"
                  title="Download Resuscitation Flowsheet PDF based on clinical record format"
                >
                  <FileDown className="w-2.5 h-2.5 text-emerald-300" />
                  PDF FLOWSHEET
                </button>
                <button 
                  id="copy-report-btn"
                  onClick={copyLogsToClipboard}
                  disabled={logs.length === 0}
                  className={`text-[8px] font-black px-2 py-0.5 rounded-md border transition-all active:scale-95 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                      : 'bg-cyan-900/50 hover:bg-cyan-900 text-cyan-400 border-cyan-800/60 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {copied ? 'COPIED!' : 'COPY REPORT'}
                </button>
              </div>
            </div>

            {/* Scrollable event log screen */}
            <div id="log-container" className="flex-1 overflow-y-auto p-2 font-mono text-[10px] text-emerald-400 leading-snug scrollbar-hide flex flex-col gap-1 h-[90px] max-h-[110px]">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-650 text-center select-none py-4">
                  <Activity className="w-5 h-5 mb-1 opacity-25 text-slate-500 animate-pulse" />
                  <span className="text-[9px] font-bold">[SYSTEM IDLE]</span>
                  <span className="text-[8px] opacity-60">CPR logs will trigger automatic reports here.</span>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-slate-950/20 pb-0.5 flex items-start gap-1"
                    >
                      <span className="opacity-50">[{log.time}]</span>
                      <span className="text-cyan-300 font-bold">({log.elapsed})</span>
                      <span className="text-slate-500">&rarr;</span>
                      <span className={`flex-1 leading-none ${
                        log.type === 'shock' 
                          ? 'text-red-400 font-extrabold' 
                          : log.type === 'med' 
                          ? 'text-yellow-400 font-bold' 
                          : log.type === 'cpr' 
                          ? 'text-white' 
                          : 'text-emerald-400'
                      }`}>
                        {log.text}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={logEndRef} />
            </div>

            {/* Manual entry note block inside logs */}
            <form onSubmit={handleLogCustomNote} className="p-1.5 bg-slate-950 border-t border-slate-850 flex gap-1.5">
              <input
                type="text"
                placeholder="Add custom note (e.g., Intubated)..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-[9.5px] text-white placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="bg-cyan-800 hover:bg-cyan-700 text-white font-black text-[9.5px] px-2 py-1 rounded-md active:scale-95 transition-all cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* LOWER EXPANDED UTILITY TABS */}
          <section id="guideline_checklists" className="bg-white border border-slate-200 rounded-[16px] p-2.5 shadow-md flex flex-col">
            <div className="flex border-b border-slate-200 pb-1.5 gap-1.5 overflow-x-auto scrollbar-thin">
              <button
                id="tab_btn_trc_cardiac"
                onClick={() => setActiveTab('trc_cardiac')}
                className={`px-2 py-0.5 rounded-md font-black text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'trc_cardiac' 
                    ? 'bg-rose-50 text-rose-800 border border-rose-200/80' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                TRC 2025 (Cardiac) 🇹🇭
              </button>
              <button
                id="tab_btn_trc_tachy_brady"
                onClick={() => setActiveTab('trc_tachy_brady')}
                className={`px-2 py-0.5 rounded-md font-black text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'trc_tachy_brady' 
                    ? 'bg-rose-50 text-rose-800 border border-rose-200/80' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                TRC 2025 (Tachy/Brady) 🇹🇭
              </button>
              <button
                id="tab_btn_trc_rosc"
                onClick={() => setActiveTab('trc_rosc')}
                className={`px-2 py-0.5 rounded-md font-black text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'trc_rosc' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ROSC Care 🇹🇭
              </button>
              <button
                id="tab_btn_procedures"
                onClick={() => setActiveTab('medHistory')}
                className={`px-2 py-0.5 rounded-md font-black text-[10px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'medHistory' 
                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/80' 
                    : ((ivAccessAlertActive && !hasCompletedIvAccess) || (airwayAlertActive && !hasCompletedAirway) || (etco2AlertActive && !hasCompletedEtco2))
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-yellow-400 animate-pulse font-black shadow-md'
                      : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Procedures ({PROCEDURE_PRESETS.length})
                {ivAccessAlertActive && !hasCompletedIvAccess && (
                  <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[8px] font-black animate-pulse">
                    ⚡ IV/IO
                  </span>
                )}
                {((airwayAlertActive && !hasCompletedAirway) || (etco2AlertActive && !hasCompletedEtco2)) && (
                  <span className="px-1.5 py-0.2 bg-purple-700 text-white rounded text-[8px] font-black animate-pulse">
                    ⚡ Airway/ETCO2
                  </span>
                )}
              </button>
              <button
                id="tab_btn_hsts"
                onClick={() => setActiveTab('hsts')}
                className={`px-2 py-0.5 rounded-md font-black text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'hsts' 
                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/80' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                5H & 5T
              </button>
            </div>

            <div className="mt-2">
              {activeTab === 'hsts' && (
                <div className="space-y-1.5 text-[10px]">
                  <p className="text-[9px] text-slate-500 font-bold leading-tight">
                    Check reversible causes to record logs:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    
                    {/* 5 Hs */}
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/80">
                      <span className="text-[8.5px] font-black text-rose-600 tracking-wider uppercase block mb-1">5 H's (Hypo/Hyper)</span>
                      <div className="space-y-0.5">
                        {[
                          { key: 'hypovolemia', label: 'Hypovolemia', detail: 'IV fluids/blood' },
                          { key: 'hypoxia', label: 'Hypoxia', detail: 'O2 & airway check' },
                          { key: 'hydrogen_ion', label: 'Hydrogen ion (Acidosis)', detail: 'Ventilation/NaHCO3' },
                          { key: 'hypo_hyperkalemia', label: 'Hypo/HyperK', detail: 'Ca Gluconate' },
                          { key: 'hypothermia', label: 'Hypothermia', detail: 'Active warming' },
                        ].map((h) => (
                          <label key={h.key} className="flex items-center gap-1 p-0.5 hover:bg-slate-200/50 rounded cursor-pointer transition-colors text-[8.5px]">
                            <input
                              type="checkbox"
                              checked={checked5H.includes(h.key)}
                              onChange={() => toggle5H(h.key)}
                              className="accent-rose-600 h-2.5 w-2.5 rounded cursor-pointer shrink-0"
                            />
                            <span className={`truncate leading-none ${checked5H.includes(h.key) ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-bold'}`}>
                              {h.label} <span className="font-normal text-[7.5px] text-slate-400">({h.detail})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 5 Ts */}
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/80">
                      <span className="text-[8.5px] font-black text-cyan-700 tracking-wider uppercase block mb-1">5 T's (Obstruction/Toxins)</span>
                      <div className="space-y-0.5">
                        {[
                          { key: 'tension_pneumothorax', label: 'Tension Pneumothorax', detail: 'Needle decomp' },
                          { key: 'tamponade_cardiac', label: 'Tamponade (Cardiac)', detail: 'Pericardio' },
                          { key: 'toxins', label: 'Toxins', detail: 'Antidotes/Lavage' },
                          { key: 'thrombosis_pulmonary', label: 'Thrombosis (Pulmonary)', detail: 'Thrombolytics' },
                          { key: 'thrombosis_coronary', label: 'Thrombosis (Coronary)', detail: 'PCI/Angiography' },
                        ].map((t) => (
                          <label key={t.key} className="flex items-center gap-1 p-0.5 hover:bg-slate-200/50 rounded cursor-pointer transition-colors text-[8.5px]">
                            <input
                              type="checkbox"
                              checked={checked5T.includes(t.key)}
                              onChange={() => toggle5T(t.key)}
                              className="accent-cyan-600 h-2.5 w-2.5 rounded cursor-pointer shrink-0"
                            />
                            <span className={`truncate leading-none ${checked5T.includes(t.key) ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-bold'}`}>
                              {t.label} <span className="font-normal text-[7.5px] text-slate-400">({t.detail})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'trc_cardiac' && (
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                      Cardiac Arrest - TRC 2025 🇹🇭
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {/* Left path: Shockable */}
                    <div className="bg-white p-2 rounded-lg border border-rose-100 shadow-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        <span className="text-[9px] font-black text-red-600 uppercase">VF / Pulseless VT (ช็อกไฟฟ้า)</span>
                      </div>
                      <ol className="list-decimal pl-3.5 text-[8.5px] text-slate-600 space-y-0.5 leading-tight">
                        <li><strong>ช็อกไฟฟ้า 1 ครั้งทันที</strong> &rarr; CPR 2 นาที (เปิด IV/IO)</li>
                        <li>คลำชีพจร/ดูคลื่น EKG <strong>ไม่เกิน 10 วินาที</strong></li>
                        <li>หากช็อกต่อได้: ช็อกครั้ง 2 &rarr; CPR 2 นาที + <strong>Adrenaline 1 mg IV ทุก 3-5 นาที</strong></li>
                        <li>หากช็อกต่อได้: ช็อกครั้ง 3 &rarr; CPR 2 นาที + <strong>Amiodarone 300 mg IV</strong></li>
                      </ol>
                    </div>

                    {/* Right path: Non-shockable */}
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-slate-800 rounded-full"></span>
                        <span className="text-[9px] font-black text-slate-800 uppercase">PEA / Asystole (ไม่ช็อก)</span>
                      </div>
                      <ol className="list-decimal pl-3.5 text-[8.5px] text-slate-600 space-y-0.5 leading-tight">
                        <li><strong>ให้ Adrenaline 1 mg IV/IO โดยด่วนที่สุด!</strong> &rarr; CPR 2 นาที</li>
                        <li>ประเมินซ้ำทุก 2 นาที / ให้ Adrenaline ทุก 3-5 นาที</li>
                        <li>พิจารณาใส่ Advanced Airway + Capnography • หาเหตุ 5H/5T</li>
                      </ol>
                    </div>
                  </div>

                  {/* CPR Quality Box */}
                  <div className="bg-rose-50/60 p-1.5 rounded-lg border border-rose-100 text-[8px] leading-tight">
                    <span className="font-bold text-rose-950 block">High-Quality CPR (TRC):</span>
                    <span className="text-slate-600 block mt-0.5">
                      กดลึก 5-6 ซม. • เร็ว 100-120 ครั้ง/นาที • Chest recoil สุด • สลับคนปั๊มทุก 2 นาที
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'trc_tachy_brady' && (
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-cyan-600" />
                      Tachy/Brady - TRC 2025 🇹🇭
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Tachycardia Card */}
                    <div className="bg-white p-2 rounded-lg border border-cyan-100 shadow-xs flex flex-col justify-between leading-tight">
                      <div>
                        <span className="text-[9px] font-black text-rose-600 uppercase block mb-0.5">1. Tachycardia (&ge; 150/min with pulse)</span>
                        <span className="text-[7.5px] text-slate-500 block mb-1">Assess clinical status (SBP &lt;90, Shock, Chest pain, HF, ซึม)</span>
                      </div>
                      <div className="space-y-1 text-[8px] mt-1">
                        <div className="bg-emerald-50/70 p-1 rounded border border-emerald-100/80">
                          <strong className="text-emerald-700 block">Stable:</strong>
                          <span>QRS แคบ: Adenosine 6 &rarr; 12 mg<br/>QRS กว้าง: Amiodarone 150 mg</span>
                        </div>
                        <div className="bg-rose-50/70 p-1 rounded border border-rose-100/80">
                          <strong className="text-rose-700 block">Unstable:</strong>
                          <span>Cardioversion (SVT: 50-100J, AF: 120-200J, VT: 100J)</span>
                        </div>
                      </div>
                    </div>

                    {/* Bradycardia Card */}
                    <div className="bg-white p-2 rounded-lg border border-cyan-100 shadow-xs flex flex-col justify-between leading-tight">
                      <div>
                        <span className="text-[9px] font-black text-slate-800 uppercase block mb-0.5">2. Bradycardia (&lt; 50/min with pulse)</span>
                        <span className="text-[7.5px] text-slate-500 block mb-1">Assess clinical status (SBP &lt;90, Shock, Chest pain, HF, ซึม)</span>
                      </div>
                      <div className="space-y-1 text-[8px] mt-1">
                        <div className="bg-emerald-50/70 p-1 rounded border border-emerald-100/80">
                          <strong className="text-emerald-700 block">Stable:</strong>
                          <span>ติดตามอาการใกล้ชิด • ขอคำปรึกษา</span>
                        </div>
                        <div className="bg-rose-50/70 p-1 rounded border border-rose-100/80">
                          <strong className="text-rose-700 block">Unstable:</strong>
                          <span>Atropine 1 mg IV (สูงสุด 3 mg) • TCP • Dopamine (5-20 mcg/kg/m) • Adrenaline (2-10 mcg/m)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trc_rosc' && (
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      Post-Cardiac Arrest Care (ROSC) - TRC 2025 🇹🇭
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Airway & Ventilation */}
                    <div className="bg-white p-2 rounded-lg border border-emerald-200 shadow-xs flex flex-col justify-between leading-tight">
                      <div>
                        <span className="text-[9px] font-black text-emerald-700 uppercase block mb-0.5">1. Airway & Ventilation</span>
                        <span className="text-[7.5px] text-slate-500 block mb-1">การจัดการทางเดินหายใจและการระบายอากาศ</span>
                      </div>
                      <div className="space-y-1 text-[8px] mt-1">
                        <div className="bg-emerald-50/60 p-1 rounded border border-emerald-100">
                          <strong className="text-emerald-800 block">• SpO2 Target:</strong>
                          <span>92-98% (ป้องกัน Hypoxia และ Hyperoxia)</span>
                        </div>
                        <div className="bg-emerald-50/60 p-1 rounded border border-emerald-100">
                          <strong className="text-emerald-800 block">• PaCO2 / PETCO2:</strong>
                          <span>PaCO2 35-45 mmHg (PETCO2 35-40 mmHg)</span>
                        </div>
                        <div className="bg-amber-50 p-1 rounded border border-amber-200 text-amber-900 font-semibold">
                          ⚠️ หลีกเลี่ยง Hyperventilation (เริ่ม 10 ครั้ง/นาที)
                        </div>
                      </div>
                    </div>

                    {/* Hemodynamics & BP */}
                    <div className="bg-white p-2 rounded-lg border border-cyan-200 shadow-xs flex flex-col justify-between leading-tight">
                      <div>
                        <span className="text-[9px] font-black text-cyan-800 uppercase block mb-0.5">2. Hemodynamics & BP</span>
                        <span className="text-[7.5px] text-slate-500 block mb-1">การดูแลระบบไหลเวียนโลหิตและความดัน</span>
                      </div>
                      <div className="space-y-1 text-[8px] mt-1">
                        <div className="bg-cyan-50/60 p-1 rounded border border-cyan-100">
                          <strong className="text-cyan-800 block">• Target BP:</strong>
                          <span>SBP &ge; 90 mmHg / MAP &ge; 65 mmHg</span>
                        </div>
                        <div className="bg-cyan-50/60 p-1 rounded border border-cyan-100">
                          <strong className="text-cyan-800 block">• Fluid Bolus:</strong>
                          <span>ให้ IV Crystalloid ชดเชยปริมาตรเลือด</span>
                        </div>
                        <div className="bg-cyan-50/60 p-1 rounded border border-cyan-100">
                          <strong className="text-cyan-800 block">• Vasopressor Drip:</strong>
                          <span>Norepinephrine / Epinephrine / Dopamine</span>
                        </div>
                      </div>
                    </div>

                    {/* ECG, STEMI & TTM */}
                    <div className="bg-white p-2 rounded-lg border border-purple-200 shadow-xs flex flex-col justify-between leading-tight">
                      <div>
                        <span className="text-[9px] font-black text-purple-800 uppercase block mb-0.5">3. STEMI & Temperature (TTM)</span>
                        <span className="text-[7.5px] text-slate-500 block mb-1">การสวนหัวใจและการประคองสมอง</span>
                      </div>
                      <div className="space-y-1 text-[8px] mt-1">
                        <div className="bg-purple-50/60 p-1 rounded border border-purple-100">
                          <strong className="text-purple-800 block">• 12-Lead ECG / PCI:</strong>
                          <span>ทำ ECG ด่วน หากพบ STEMI ส่งสวนหัวใจ PCI ทันที</span>
                        </div>
                        <div className="bg-purple-50/60 p-1 rounded border border-purple-100">
                          <strong className="text-purple-800 block">• Temperature Control:</strong>
                          <span>32-37.5&deg;C อย่างน้อย 36 ชม. หากไม่รู้สึกตัว</span>
                        </div>
                        <div className="bg-purple-50/60 p-1 rounded border border-purple-100">
                          <strong className="text-purple-800 block">• Neuro Evaluation:</strong>
                          <span>ส่ง Head CT, ตรวจระดับน้ำตาล & เกลือแร่</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'medHistory' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Log Advanced Medical Interventions:</span>
                    {((ivAccessAlertActive && !hasCompletedIvAccess) || (airwayAlertActive && !hasCompletedAirway) || (etco2AlertActive && !hasCompletedEtco2)) && (
                      <span className="text-[8.5px] font-black text-amber-900 bg-amber-200 border border-amber-400 px-2 py-0.5 rounded animate-pulse">
                        ⚠️ กรุณากดเลือกหัตถการกระพริบที่ต้องดำเนินการ
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PROCEDURE_PRESETS.map((proc, idx) => {
                      const isCompleted = completedProcedures.includes(proc.name);
                      const isIvTarget = !isCompleted && ivAccessAlertActive && proc.name.includes('IV / IO');
                      const isAirwayTarget = !isCompleted && airwayAlertActive && proc.name.includes('Advanced Airway');
                      const isEtco2Target = !isCompleted && etco2AlertActive && (
                        proc.name.includes('Intubation Confirmed') || 
                        proc.name.includes('ETCO2')
                      );
                      const isPurpleTarget = isAirwayTarget || isEtco2Target;
                      const isFlashing = isIvTarget || isPurpleTarget;

                      return (
                        <button
                          key={idx}
                          id={`btn_proc_${idx}`}
                          disabled={isCompleted}
                          onClick={() => handleLogProcedure(proc.name)}
                          className={`h-[34px] px-2 rounded text-left text-[9px] font-bold flex items-center justify-between transition-all shadow-sm ${
                            isCompleted
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 font-semibold cursor-not-allowed opacity-75'
                              : isIvTarget && isFlashing
                              ? 'bg-amber-400 text-slate-950 border-2 border-amber-600 ring-2 ring-yellow-300 animate-pulse font-black shadow-lg scale-[1.02] cursor-pointer active:scale-95'
                              : isPurpleTarget && isFlashing
                              ? 'bg-purple-600 text-white border-2 border-purple-800 ring-2 ring-purple-300 animate-pulse font-black shadow-lg scale-[1.02] cursor-pointer active:scale-95'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 cursor-pointer active:scale-95'
                          }`}
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : isFlashing ? (
                              <span className="shrink-0 text-[10px] animate-bounce">⚡</span>
                            ) : null}
                            <span className={`truncate mr-1 ${isCompleted ? 'line-through text-slate-400' : ''}`}>{proc.name}</span>
                          </div>
                          {isCompleted ? (
                            <span className="text-[8px] font-black text-slate-500 bg-slate-200/80 px-1 py-0.5 rounded shrink-0">ทำแล้ว</span>
                          ) : (
                            <Plus className={`w-3.5 h-3.5 shrink-0 ${isFlashing ? 'text-current animate-bounce' : 'text-cyan-700'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: ASSESSMENT DECISION & LIVE INTERACTION LOG (4 Columns) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
          
          {/* ASSESSMENT CARDS */}
          <div className="bg-white rounded-[20px] shadow-lg border border-slate-200 p-3.5 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Rhythm & Pulse Assessment</h3>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">Max 10s</span>
            </div>

            {/* 10-Second Pulse Check Interactive Module */}
            <div className={`p-3 rounded-xl border transition-all ${
              pulseCheckActive 
                ? 'bg-rose-50 border-rose-300 ring-4 ring-rose-500/10' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Clock className={`w-3.5 h-3.5 ${pulseCheckActive ? 'text-rose-600 animate-spin' : 'text-slate-400'}`} />
                  จับเวลาประเมินชีพจร & EKG
                </span>
                {pulseCheckActive && (
                  <span className="text-xs font-mono font-black text-rose-600 animate-pulse">
                    {pulseCheckTime} วินาที
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                <motion.div 
                  className={`h-full ${
                    pulseCheckTime <= 3 
                      ? 'bg-red-600' 
                      : pulseCheckTime <= 5 
                      ? 'bg-orange-500' 
                      : 'bg-rose-500'
                  }`}
                  animate={{ width: `${(pulseCheckTime / 10) * 100}%` }}
                  transition={{ duration: pulseCheckActive ? 1 : 0.2, ease: "linear" }}
                />
              </div>

              <div className="flex gap-2">
                {!pulseCheckActive ? (
                  <button
                    id="btn_start_pulse_check"
                    onClick={startPulseCheck}
                    className="flex-1 py-1.5 px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-500/80 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-2.5 h-2.5 fill-amber-950 text-amber-950" />
                    เริ่มจับเวลา 10 วินาที
                  </button>
                ) : (
                  <button
                    id="btn_cancel_pulse_check"
                    onClick={cancelPulseCheck}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-950 text-white rounded-lg text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 text-center flex items-center justify-center gap-1"
                  >
                    <Pause className="w-2.5 h-2.5 fill-white" />
                    หยุดจับเวลา
                  </button>
                )}
              </div>
            </div>

            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider mt-0.5">Cardiac Arrest (ไม่มีชีพจร)</div>
            <div className="grid grid-cols-2 gap-2">
              {/* SHOCKABLE BUTTON */}
              <button 
                id="btn_rhythm_shockable"
                onClick={handleRhythmShockable}
                className={`medical-btn h-[52px] bg-red-600 hover:bg-red-700 text-white rounded-[12px] font-black flex flex-col items-center justify-center shadow-md border-b-2 border-red-800 transition-all active:scale-95 cursor-pointer ${
                  lastRhythmDecision === 'shockable' ? 'ring-2 ring-red-400' : ''
                }`}
              >
                <span className="text-xs sm:text-sm">SHOCKABLE</span>
              </button>

              {/* NON-SHOCKABLE BUTTON */}
              <button 
                id="btn_rhythm_non_shockable"
                onClick={handleRhythmNonShockable}
                className={`medical-btn h-[52px] bg-slate-800 hover:bg-slate-900 text-white rounded-[12px] font-black flex flex-col items-center justify-center shadow-md border-b-2 border-black transition-all active:scale-95 cursor-pointer ${
                  lastRhythmDecision === 'non-shockable' ? 'ring-2 ring-slate-400' : ''
                }`}
              >
                <span className="text-xs sm:text-sm">NON-SHOCKABLE</span>
              </button>
            </div>

            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider mt-0.5">With Pulse (ยังมีชีพจร)</div>
            <div className="grid grid-cols-2 gap-2">
              {/* BRADYCARDIA BUTTON */}
              <button 
                id="btn_rhythm_bradycardia"
                onClick={handleRhythmBradycardia}
                className={`medical-btn h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-[12px] font-black flex flex-col items-center justify-center shadow-md border-b-2 border-emerald-800 transition-all active:scale-95 cursor-pointer ${
                  lastRhythmDecision === 'bradycardia' ? 'ring-2 ring-emerald-400' : ''
                }`}
              >
                <span className="text-xs sm:text-sm">BRADYCARDIA</span>
                <span className="text-[8px] font-mono tracking-wider opacity-85">HR &lt; 50 bpm</span>
              </button>

              {/* TACHYCARDIA BUTTON */}
              <button 
                id="btn_rhythm_tachycardia"
                onClick={handleRhythmTachycardia}
                className={`medical-btn h-[52px] bg-amber-600 hover:bg-amber-700 text-white rounded-[12px] font-black flex flex-col items-center justify-center shadow-md border-b-2 border-amber-800 transition-all active:scale-95 cursor-pointer ${
                  lastRhythmDecision === 'tachycardia' ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <span className="text-xs sm:text-sm">TACHYCARDIA</span>
                <span className="text-[8px] font-mono tracking-wider opacity-85">HR &ge; 150 bpm</span>
              </button>
            </div>

            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider mt-0.5">ROSC (กู้ชีพจรสำเร็จ)</div>
            <button 
              id="btn_rhythm_rosc"
              onClick={handleRhythmROSC}
              className={`medical-btn w-full h-[48px] bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-[12px] font-black flex flex-col items-center justify-center shadow-md border-b-2 border-cyan-800 transition-all active:scale-95 cursor-pointer ${
                lastRhythmDecision === 'rosc' ? 'ring-2 ring-cyan-300' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
                <span className="text-xs sm:text-sm uppercase tracking-wider">ROSC</span>
              </div>
              <span className="text-[8px] font-mono tracking-wider opacity-85 uppercase">Post-Cardiac Arrest Care Protocol</span>
            </button>

            {/* Reassessment warning box moved directly under Stable/Unstable buttons inside panels */}

            {/* Dynamic visual instruction alert box */}
            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 flex items-start gap-3">
              <div className="w-1.5 h-12 bg-cyan-500 rounded-full shrink-0"></div>
              <p id="instruction-text" className="text-cyan-900 text-xs sm:text-sm font-semibold leading-relaxed">
                {guidanceMessage}
              </p>
            </div>
          </div>

          {/* OTHER MEDS BOARD (Grids of custom medications) */}
          <div className="bg-white rounded-[18px] shadow-md border border-slate-200 p-4 flex-1 flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Other Drug Interventions</h3>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* GROUP 1: 5 H's Management */}
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-wide block mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  5 H's (แก้ไขภาวะ 5H)
                </span>
                <div className="flex-1 flex flex-col gap-1.5">
                  {[
                    { name: 'IV Fluid 1L', desc: 'Hypovolemia', action: 'IV Fluid Bolus 1L', speakText: 'ให้ ไอวี ฟลูอิด เรียบร้อยแล้วค่ะ', rate: 1.1 },
                    { name: 'NaHCO3 50mEq', desc: 'Hydrogen ion (Acidosis)', action: '7.5%NaHCO3 50 mEq V', speakText: 'ให้ยา โซเดี้ยม ไบคาบอเนท เรียบร้อยแล้วค่ะ', rate: 1.1 },
                    { name: 'Ca Gluconate 1g', desc: 'HyperK', action: '10%Cal Gluconate 1g V', speakText: 'ให้ยา แคลเซี่ยม กลูโคเนท เรียบร้อยแล้วค่ะ', rate: 1.1 },
                    { name: 'Mag Sulfate 2g', desc: 'HypoK/Torsades', action: '50%MgSO4 2g V', speakText: 'ให้ยา แม้กนีเซี่ยม ซันเฟด เรียบร้อยแล้วค่ะ', rate: 1.1 },
                    { name: 'Insulin 10U+D50', desc: 'HyperK', action: 'RI 10U + 50%Dextose V', speakText: 'ให้ยา อาไอบวกเด๊กโต๊ส เรียบร้อยแล้วค่ะ', rate: 1.1 }
                  ].map((med, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleLogPresetMed(med.action, true);
                        speakThai(med.speakText, undefined, med.rate);
                      }}
                      className="flex-1 py-1 px-2 bg-slate-50 hover:bg-rose-50/40 border border-slate-200 hover:border-rose-200 rounded-lg text-[10px] sm:text-[10.5px] font-black text-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-1 leading-none shadow-xs min-h-[32px]"
                    >
                      <span className="truncate">{med.name}</span>
                      <span className="text-[7.5px] sm:text-[8px] text-rose-500/80 font-semibold truncate">({med.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* GROUP 2: 5 T's Management */}
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-cyan-700 uppercase tracking-wide block mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                  5 T's (แก้ไขภาวะ 5T)
                </span>
                <div className="flex-1 flex flex-col gap-1.5">
                  {[
                    { name: 'Alteplase(rtPA) 50mg', desc: 'PE/MI', action: 'Alteplase (rtPA) 50mg IV', speakText: 'ให้ยา อาทีพีเอ เรียบร้อยแล้วค่ะ', rate: 1.1 },
                    { name: 'Naloxone 2mg', desc: 'Opioid Tox', action: 'Naloxone 2mg IV', speakText: 'ให้ยา นาล้อกโซน เรียบร้อยแล้วค่ะ', rate: 1.1 },
                    { name: 'Needle Decompress', desc: 'Tension Pneumothorax', action: 'Needle Chest Decompression', speakText: 'ทำ นี้ดเดิ้ล ดีคอมเพ๊ซ เรียบร้อยแล้วค่ะ', rate: 1.1 }
                  ].map((med, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (med.action === 'Needle Chest Decompression') {
                          if (!caseActive) {
                            setCaseActive(true);
                            setCaseStartTime(Date.now());
                          }
                          addLog('Procedures: Needle Chest Decompression administered', 'system');
                        } else {
                          handleLogPresetMed(med.action, true);
                        }
                        speakThai(med.speakText, undefined, med.rate);
                      }}
                      className="flex-1 py-1 px-2 bg-slate-50 hover:bg-cyan-50/40 border border-slate-200 hover:border-cyan-200 rounded-lg text-[10px] sm:text-[10.5px] font-black text-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-1 leading-none shadow-xs min-h-[32px]"
                    >
                      <span className="truncate">{med.name}</span>
                      <span className="text-[7.5px] sm:text-[8px] text-cyan-600/80 font-semibold truncate">({med.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 text-center text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-6">
        Smart ACLS Copilot MVP • Adheres strictly to Adult AHA Cardiac Arrest Algorithms
      </footer>

      {/* CONFIRM RESET MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 p-6 rounded-[24px] max-w-md w-full shadow-2xl text-slate-800">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h3 className="text-xl font-black uppercase tracking-wider">Reset Resuscitation Case?</h3>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              WARNING: Resetting will permanently clear all logs, drug counters, timestamps, and active CPR clocks. Ensure you have copied logs if needed!
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeReset}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
