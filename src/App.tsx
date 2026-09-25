/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { generateResuscitationPDF } from './utils/pdfReport';
import { LogEntry, GuidelineTab, RhythmDecision, ShockableRhythmType, NonShockableRhythmType, StabilityStatus, RoscBPStatus, RoscSpO2Level, RoscStemiStatus, RoscComatoseStatus } from './types';
import { HeaderBar } from './components/HeaderBar';
import { ControlBar } from './components/ControlBar';
import { CprTimerCard } from './components/CprTimerCard';
import { QuickMedsShocksPanel } from './components/QuickMedsShocksPanel';
import { GuidancePanel } from './components/GuidancePanel';
import { LogsPanel } from './components/LogsPanel';
import { PulseCheckModal } from './components/PulseCheckModal';
import { QuickActionPromptModal } from './components/QuickActionPromptModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PalsCalcModal } from './components/PalsCalcModal';
import { ClinicalStabilityModal } from './components/ClinicalStabilityModal';
import { UnstableBradycardiaModal } from './components/UnstableBradycardiaModal';
import { StableBradycardiaModal } from './components/StableBradycardiaModal';
import { StableTachycardiaModal } from './components/StableTachycardiaModal';
import { UnstableTachycardiaModal } from './components/UnstableTachycardiaModal';
import { LogoModal } from './components/LogoModal';
import { InstallPromptModal } from './components/InstallPromptModal';
import { SystemUsabilityScaleModal, SusResultData } from './components/SystemUsabilityScaleModal';
import { MedDueModal } from './components/MedDueModal';
import { Clock, Zap, Activity, ListFilter, Heart, Power, RotateCcw } from 'lucide-react';

const SAVE_KEY = 'smart_acls_copilot_state_v2';

export default function App() {
  // --- SYSTEM STATES ---
  const [systemTime, setSystemTime] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [metronomeOn, setMetronomeOn] = useState<boolean>(true);
  const [metronomeTempo, setMetronomeTempo] = useState<number>(100);
  const [metronomeMode, setMetronomeMode] = useState<'30:2' | 'continuous'>('30:2');
  const [metronomeBeat, setMetronomeBeat] = useState<number>(0);
  const metronomeBeatRef = useRef<number>(0);
  const cprSubCycleRef = useRef<number>(1);
  const lastPulseCheckedCycleRef = useRef<number>(0);
  const guidelineToCprTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [voiceAlertsOn, setVoiceAlertsOn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<GuidelineTab>('trc_cardiac');
  const [mobileViewTab, setMobileViewTab] = useState<'cpr' | 'meds' | 'guidelines' | 'logs'>('cpr');
  const [audioTesting, setAudioTesting] = useState<boolean>(false);

  const handleSelectMobileTab = (tab: 'cpr' | 'meds' | 'guidelines' | 'logs') => {
    if (guidelineToCprTimeoutRef.current) {
      clearTimeout(guidelineToCprTimeoutRef.current);
    }
    setMobileViewTab(tab);
  };

  // --- CORE CLINICAL STATES ---
  const [caseActive, setCaseActive] = useState<boolean>(false);
  const [caseStartTime, setCaseStartTime] = useState<number | null>(null);
  const [caseElapsedSeconds, setCaseElapsedSeconds] = useState<number>(0);

  // Timers
  const [cprTimeRemaining, setCprTimeRemaining] = useState<number>(120); // 120s (2 minutes)
  const [cprActive, setCprActive] = useState<boolean>(false);
  const [noPulseConfirmed, setNoPulseConfirmed] = useState<boolean>(false);
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
  const [showProceduresModal, setShowProceduresModal] = useState<boolean>(false);
  const [completedProcedures, setCompletedProcedures] = useState<string[]>([]);
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Auto-open procedures pop-up modal when a procedure alert is triggered according to ACLS protocol
  useEffect(() => {
    if (ivAccessAlertActive || airwayAlertActive || etco2AlertActive) {
      setShowProceduresModal(true);
    }
  }, [ivAccessAlertActive, airwayAlertActive, etco2AlertActive]);

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
  const [lastRhythmDecision, setLastRhythmDecision] = useState<RhythmDecision>(null);
  const [selectedShockableRhythm, setSelectedShockableRhythm] = useState<ShockableRhythmType>(null);
  const [selectedNonShockableRhythm, setSelectedNonShockableRhythm] = useState<NonShockableRhythmType>(null);
  const [stabilityStatus, setStabilityStatus] = useState<StabilityStatus>(null);

  // ROSC Post-Cardiac Arrest Care State
  const [noradrenalineCount, setNoradrenalineCount] = useState<number>(0);
  const [roscCheckedSteps, setRoscCheckedSteps] = useState<string[]>([]);
  const [roscStemiStatus, setRoscStemiStatus] = useState<RoscStemiStatus>('unknown');
  const [roscSpO2Level, setRoscSpO2Level] = useState<RoscSpO2Level>('unknown');
  const [roscBPStatus, setRoscBPStatus] = useState<RoscBPStatus>('unknown');
  const [roscComatoseStatus, setRoscComatoseStatus] = useState<RoscComatoseStatus>('unknown');
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
  const [showPalsModal, setShowPalsModal] = useState<boolean>(false);
  const [showStabilityModal, setShowStabilityModal] = useState<boolean>(false);
  const [showUnstableBradyModal, setShowUnstableBradyModal] = useState<boolean>(false);
  const [showStableBradyModal, setShowStableBradyModal] = useState<boolean>(false);
  const [showStableTachyModal, setShowStableTachyModal] = useState<boolean>(false);
  const [showUnstableTachyModal, setShowUnstableTachyModal] = useState<boolean>(false);
  const [showAltMedsModal, setShowAltMedsModal] = useState<boolean>(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState<boolean>(false);
  const [showSusModal, setShowSusModal] = useState<boolean>(false);
  const [showMedDueModal, setShowMedDueModal] = useState<boolean>(false);
  const [isExportPending, setIsExportPending] = useState<boolean>(false);
  const [lastSusScore, setLastSusScore] = useState<{ score: number; grade: string; evaluator: string } | null>(null);
  const [mgSo4AlertActive, setMgSo4AlertActive] = useState<boolean>(false);
  const [isAppClosed, setIsAppClosed] = useState<boolean>(false);

  // 10-Second Pulse & EKG assessment timer states
  const [pulseCheckActive, setPulseCheckActive] = useState<boolean>(false);
  const [pulseCheckTime, setPulseCheckTime] = useState<number>(10);
  const [cprButtonFlash, setCprButtonFlash] = useState<boolean>(false);
  const [shockButtonFlashing, setShockButtonFlashing] = useState<boolean>(false);

  // Auto-open Medication Due pop-up modal when medication is due according to ACLS protocol
  useEffect(() => {
    const isEpiPrepOnly = lastRhythmDecision === 'shockable' && shockCount < 2 && epiCount === 0;
    if (
      (epiAlertActive && !isEpiPrepOnly) ||
      amioAlertActive ||
      lidoAlertActive ||
      mgSo4AlertActive
    ) {
      setShowMedDueModal(true);
    }
  }, [epiAlertActive, amioAlertActive, lidoAlertActive, mgSo4AlertActive, lastRhythmDecision, shockCount, epiCount]);

  // Transition helper: Show Guidelines, speak High Quality CPR reminder, then auto-switch to CPR Timer
  const isSpeakingThaiRef = useRef<boolean>(false);

  const speakHighQualityCpr = () => {
    if (!voiceAlertsOn) return;
    const phrase = "เน้นกานทำไฮควอลิตี้ซีพีอาด้วยค่ะ";
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeakingThaiRef.current || window.speechSynthesis.speaking) {
        const checkInterval = setInterval(() => {
          if (!isSpeakingThaiRef.current && !window.speechSynthesis.speaking) {
            clearInterval(checkInterval);
            speakThai(phrase);
          }
        }, 150);
        setTimeout(() => clearInterval(checkInterval), 10000);
        return;
      }
    }
    speakThai(phrase);
  };

  const triggerGuidelineToCprTransition = (guidelineMsg?: string) => {
    setShowProceduresModal(false);
    setShowQuickActionModal(false);
    setMobileViewTab('guidelines');
    setActiveTab('trc_cardiac');
    setGuidanceMessage(guidelineMsg || "คำแนะนำ: กำลังแสดง Guidelines (ACLS Algorithm) ก่อนสลับไปหน้า CPR Timer อัตโนมัติ");
    if (guidelineToCprTimeoutRef.current) {
      clearTimeout(guidelineToCprTimeoutRef.current);
    }
    guidelineToCprTimeoutRef.current = setTimeout(() => {
      setMobileViewTab('cpr');
      setGuidanceMessage("สลับสู่หน้า CPR Timer อัตโนมัติ เพื่อติดตามรอบการกดหน้าอก 2 นาที");
    }, 6500);

    // ทุกครั้งที่สลับมาแท็บ Guidelines อัตโนมัติในกลุ่ม Cardiac Arrest ให้พูดเตือนเน้น High-Quality CPR
    speakHighQualityCpr();
  };

  // Web Audio Context reference for synthesiser metronome
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
          if (parsed.noPulseConfirmed !== undefined) setNoPulseConfirmed(parsed.noPulseConfirmed);
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
        noPulseConfirmed,
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

  // --- CLINICAL ALARM & AUDIO CHIME GENERATOR ---
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

  // --- VOICE SPEECH HELPER ---
  const speakThai = (text: string, onEnd?: () => void, customRate?: number) => {
    if (!voiceAlertsOn) {
      if (onEnd) onEnd();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        let spokenText = text;
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
          "CYCLE": "ไซเคิล",
          "Cycle": "ไซเคิล",
          "Blood": "บลัด",
          "ICD": "ไอซีดี"
        };

        Object.keys(phoneticMap).forEach(key => {
          const regex = new RegExp(key, 'gi');
          spokenText = spokenText.replace(regex, phoneticMap[key]);
        });

        const isCountdown = ["สิบ", "เก้า", "แปด", "เจ็ด", "เหจ็ด", "หก", "ห้า", "สี่", "สาม", "สอง", "หนึ่ง", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"].includes(spokenText.trim());
        const isCycleNoSuffix = /^((CYCLE|Cycle|ไซเคิล|ไซเคิ่น|รอบ)\s*.*)$/i.test(spokenText.trim()) || spokenText.includes("รอบ") || spokenText.includes("ไซเคิล") || spokenText.includes("ครบ 5 ไซเคิล") || spokenText.includes("ครบ 5 CYCLE");

        if (!isCountdown) {
          window.speechSynthesis.cancel();
        }

        if (!isCountdown && !isCycleNoSuffix && !spokenText.endsWith("ค่ะ") && !spokenText.endsWith("ครับ") && !spokenText.endsWith("นะคะ")) {
          spokenText = spokenText.trim().replace(/[.!?]+$/, '') + " ค่ะ";
        }

        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = 'th-TH';
        utterance.volume = 1.0;
        utterance.rate = customRate !== undefined ? customRate : 1.1;
        utterance.pitch = 1.05;

        isSpeakingThaiRef.current = true;
        let hasCalledEnd = false;
        const handleSpeechDone = () => {
          if (!hasCalledEnd) {
            hasCalledEnd = true;
            isSpeakingThaiRef.current = false;
            if (onEnd) onEnd();
          }
        };

        utterance.onend = handleSpeechDone;
        utterance.onerror = handleSpeechDone;
        const fallbackTimeoutMs = Math.max(6000, spokenText.length * 80);
        setTimeout(handleSpeechDone, fallbackTimeoutMs);

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
        isSpeakingThaiRef.current = false;
        if (onEnd) onEnd();
      }
    } else {
      isSpeakingThaiRef.current = false;
      if (onEnd) onEnd();
    }
  };

  const checkIsBradyTachyGroup = () => {
    if (lastRhythmDecision === 'bradycardia' || lastRhythmDecision === 'tachycardia') {
      return true;
    }
    if (activeTab === 'trc_tachy_brady' && lastRhythmDecision !== 'shockable' && lastRhythmDecision !== 'non-shockable' && lastRhythmDecision !== 'rosc') {
      return true;
    }
    if (showStableTachyModal || showUnstableTachyModal || showStableBradyModal || showUnstableBradyModal) {
      return true;
    }
    return false;
  };

  const triggerReassessmentAlert = (treatmentName: string, speechText?: string, skipLog: boolean = false) => {
    setReassessWarningActive(true);
    if (!skipLog) {
      addLog(`ALERT: ${treatmentName} administered. Reassess patient stable vs unstable status immediately (ประเมินอาการคงที่ และไม่คงที่ ซ้ำอีกครั้ง)!`, "system");
    }
    playAlertChime('med_due');

    const shouldShowPopup = checkIsBradyTachyGroup();

    if (speechText) {
      speakThai(speechText, () => {
        if (shouldShowPopup) {
          setShowStableTachyModal(false);
          setShowUnstableTachyModal(false);
          setShowStableBradyModal(false);
          setShowUnstableBradyModal(false);
          setShowStabilityModal(true);
        }
      });
    } else {
      if (shouldShowPopup) {
        setShowStableTachyModal(false);
        setShowUnstableTachyModal(false);
        setShowStableBradyModal(false);
        setShowUnstableBradyModal(false);
        setShowStabilityModal(true);
      }
    }
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

  // --- METRONOME SYNTH (Web Audio) ---
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

  // Metronome Clock Trigger
  useEffect(() => {
    let timerId: any = null;

    if (cprActive && metronomeOn) {
      const scheduleNextTick = () => {
        const intervalMs = (60 / metronomeTempo) * 1000;

        if (metronomeMode === '30:2') {
          metronomeBeatRef.current = (metronomeBeatRef.current % 32) + 1;
          const currentBeat = metronomeBeatRef.current;
          setMetronomeBeat(currentBeat);

          let nextDelayMs = intervalMs;
          if (currentBeat <= 30) {
            playSynthesizedTick(currentBeat === 30);
            nextDelayMs = currentBeat === 30 ? 1200 : intervalMs;
          } else if (currentBeat === 31) {
            playAlertChime('vent_cue');
            nextDelayMs = 1500;
          } else if (currentBeat === 32) {
            playAlertChime('vent_cue');
            nextDelayMs = 1500;

            const completedCycle = cprSubCycleRef.current;
            if (completedCycle === 5) {
              // ครบ 5 CYCLE ของ 30:2 -> สิ้นสุดรอบ CPR และเริ่มจับเวลาประเมินชีพจร 10 วินาที
              cprSubCycleRef.current = 1;
              setCprSubCycle302(1);
              setCprActive(false);
              metronomeBeatRef.current = 0;
              setMetronomeBeat(0);

              const currentCycleNumber = cprCycle;
              lastPulseCheckedCycleRef.current = currentCycleNumber;
              setCprCycle(c => c + 1);
              addLog(`CPR 30:2 ครบ 5 CYCLE (CYCLE ${currentCycleNumber}) - หยุด CPR ก่อนตรวจชีพจรและคลื่นไฟฟ้าหัวใจ`, 'cpr');
              playAlertChime('cpr_expire');
              speakThai("หยุดCPR ขอตรวจชีพจรและคลื่นไฟฟ้าหัวใจค่ะ", () => {
                setPulseCheckActive(true);
                setPulseCheckTime(10);
              }, 1.15);
              return;
            } else {
              const nextCycle = completedCycle + 1;
              cprSubCycleRef.current = nextCycle;
              setCprSubCycle302(nextCycle);
              const remainingSeconds = calculateRemainingFrom302(nextCycle, 0);
              setCprTimeRemaining(remainingSeconds);

              if (nextCycle === 5) {
                // แจ้งเตือนเมื่อขึ้น CYCLE 5
                speakThai("รอบที่ห้า เตรียมเปลี่ยนค่ะ", undefined, 1.05);
                addLog(`CPR 30:2 ขึ้น CYCLE 5 - เตรียมเปลี่ยนผู้กดหน้าอก`, 'cpr');
              } else if (nextCycle === 4) {
                speakThai("รอบสี่");
              } else if (nextCycle === 3) {
                speakThai("รอบสาม");
              } else if (nextCycle === 2) {
                speakThai("รอบสอง");
              } else if (nextCycle === 1) {
                speakThai("รอบหนึ่ง");
              } else {
                speakThai(`รอบ${nextCycle}`);
              }
            }
          }

          timerId = setTimeout(scheduleNextTick, nextDelayMs);
        } else {
          metronomeBeatRef.current = (metronomeBeatRef.current % 30) + 1;
          const currentBeat = metronomeBeatRef.current;
          setMetronomeBeat(currentBeat);
          playSynthesizedTick(currentBeat === 30);

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
        setCaseElapsedSeconds(prev => prev + 1);

        // Continuous mode uses the 2-minute CPR countdown timer
        // 30:2 mode uses cycle & metronome rhythm beats, while keeping cprTimeRemaining synchronized
        if (cprActive) {
          if (metronomeMode === 'continuous') {
            setCprTimeRemaining(prev => {
              const nextValue = prev - 1;

              if (nextValue === 30) {
                playAlertChime('med_due');
                speakThai("เหลือเวลา 30 วินาที เตรียมเช็คริทึ่ม และเตรียมยา");
              }

              if (nextValue <= 0) {
                setCprActive(false);
                setCprSubCycle302(1);
                cprSubCycleRef.current = 1;
                metronomeBeatRef.current = 0;
                setMetronomeBeat(0);

                const currentCycleNumber = cprCycle;
                if (lastPulseCheckedCycleRef.current !== currentCycleNumber) {
                  lastPulseCheckedCycleRef.current = currentCycleNumber;
                  setCprCycle(c => c + 1);
                  addLog(`CPR ต่อเนื่องครบ 2 นาที (CYCLE ${currentCycleNumber}) - หยุด CPR ก่อนตรวจชีพจรและคลื่นไฟฟ้าหัวใจ`, 'cpr');
                  playAlertChime('cpr_expire');
                  speakThai("หยุดCPR ขอตรวจชีพจรและคลื่นไฟฟ้าหัวใจค่ะ", () => {
                    setPulseCheckActive(true);
                    setPulseCheckTime(10);
                  }, 1.15);
                }
                return 120;
              }
              return nextValue;
            });
          } else {
            // Keep cprTimeRemaining synchronized with 30:2 cycles in real time
            const currentCycle = cprSubCycleRef.current || cprSubCycle302 || 1;
            const currentBeat = metronomeBeatRef.current || 0;
            const calculatedRemaining = calculateRemainingFrom302(currentCycle, currentBeat);
            setCprTimeRemaining(calculatedRemaining);
          }
        }

        if (epiTimerStarted) {
          setEpiTimeRemaining(prev => {
            if (prev <= 1) {
              if (prev === 1) {
                playAlertChime('med_due');
                speakThai("ครบกำหนดสี่นาที ถึงเวลาให้ยาเอพิเนฟริน หนึ่งมิลลิกรัมค่ะ");
                setEpiAlertActive(true);
                setShowMedDueModal(true);
                setGuidanceMessage(
                  "⚡ ครบกำหนด 4 นาที! ถึงเวลาบริหารยา EPINEPHRINE 1mg IV/IO"
                );
              }
              return 0;
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

  // --- PULSE & EKG CHECK TIMER EFFECT ---
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

  useEffect(() => {
    if (pulseCheckActive && pulseCheckTime === 0) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
      setCprButtonFlash(true);
      setShowQuickActionModal(true);

      playAlertChime('pulse_check');
      speakThai("หมดเวลาประเมินรีบซีพีอาต่อค่ะ", () => {
        if (!caseActive) {
          setCaseActive(true);
          setCaseStartTime(Date.now());
        }
        setCprActive(true);
        setCprButtonFlash(false);
      }, 1.1);
    }
  }, [pulseCheckTime, pulseCheckActive]);

  useEffect(() => {
    if (pulseCheckActive) {
      if (pulseCheckTime === 10) speakThai("สิบ");
      else if (pulseCheckTime === 9) speakThai("เก้า");
      else if (pulseCheckTime === 8) speakThai("แปด");
      else if (pulseCheckTime === 7) speakThai("เหจ็ด");
      else if (pulseCheckTime === 6) speakThai("หก");
      else if (pulseCheckTime === 5) speakThai("ห้า");
      else if (pulseCheckTime === 4) speakThai("สี่");
      else if (pulseCheckTime === 3) speakThai("สาม");
      else if (pulseCheckTime === 2) speakThai("สอง");
      else if (pulseCheckTime === 1) speakThai("หนึ่ง");
    }
  }, [pulseCheckTime, pulseCheckActive]);

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
    if (cprActive) {
      setCprActive(false);
    }
    addLog("ตรวจชีพจรและคลื่นไฟฟ้าหัวใจ - หยุด CPR ทันที (จำกัดเวลา 10 วินาที)", "cpr");
    playAlertChime('cpr_expire');
    speakThai("หยุดCPR ขอตรวจชีพจรและคลื่นไฟฟ้าหัวใจค่ะ", () => {
      setPulseCheckActive(true);
      setPulseCheckTime(10);
    }, 1.15);
  };

  const cancelPulseCheck = () => {
    setPulseCheckActive(false);
    setPulseCheckTime(10);
    addLog("Pulse & EKG Assessment Timer stopped manually", "system");
    speakThai("ยกเลิกจับเวลาประเมินชีพจร");
  };

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
      speakThai("หยุดซีพีอาชั่วคราวค่ะ", undefined, 1.1);
      addLog("หยุด CPR ชั่วคราว (Pause CPR)", "cpr");
    } else {
      setNoPulseConfirmed(true);
      setCprActive(true);
      if (metronomeMode === '30:2') {
        const cycleNum = cprSubCycleRef.current || cprSubCycle302;
        if (cycleNum === 1) {
          speakThai("เริ่ม ซีพีอา  รอบหนึ่งค่ะ", undefined, 1.05);
        } else if (cycleNum === 2) {
          speakThai("รอบสอง", undefined, 1.1);
        } else if (cycleNum === 3) {
          speakThai("รอบสาม", undefined, 1.1);
        } else if (cycleNum === 4) {
          speakThai("รอบสี่", undefined, 1.1);
        } else if (cycleNum === 5) {
          speakThai("รอบที่ห้า เตรียมเปลี่ยนค่ะ", undefined, 1.05);
        } else {
          speakThai("เริ่ม ซีพีอาค่ะ", undefined, 1.1);
        }
      } else {
        speakThai("เริ่ม ซีพีอาค่ะ", undefined, 1.1);
      }
    }
  };

  const resetCPRCycle = () => {
    setCprTimeRemaining(120);
    setCprSubCycle302(1);
    cprSubCycleRef.current = 1;
    setNoPulseConfirmed(false);
    addLog(`CPR CYCLE ${cprCycle} Timer reset back to 02:00`, "cpr");
  };

  // Helper: คำนวณเวลาที่เหลือจาก CYCLES 30:2 (5 Cycles = 120 วินาที, Cycle ละ 24 วินาที)
  const calculateRemainingFrom302 = (currentCycle: number, currentBeat: number): number => {
    const safeCycle = Math.max(1, Math.min(5, currentCycle));
    const safeBeat = Math.max(0, Math.min(30, currentBeat));
    // 5 cycles total = 120 seconds (24 seconds per 30:2 cycle)
    const remainingInCurrentCycle = Math.max(0, 24 - Math.round((safeBeat / 30) * 24));
    const remainingCycles = Math.max(0, 5 - safeCycle);
    const totalRemaining = (remainingCycles * 24) + remainingInCurrentCycle;
    return Math.max(10, Math.min(120, totalRemaining));
  };

  // เชื่อมโยงการสลับโหมด: 30:2 -> ต่อเนื่อง (คำนวณเวลานับต่อจาก 30:2) หรือ ต่อเนื่อง -> 30:2
  const changeMetronomeMode = (newMode: '30:2' | 'continuous', isFromIntubation: boolean = false): number => {
    if (newMode === 'continuous') {
      if (metronomeMode === '30:2') {
        const currentCycle = cprSubCycleRef.current || cprSubCycle302 || 1;
        const currentBeat = metronomeBeatRef.current || 0;
        const calculatedRemaining = calculateRemainingFrom302(currentCycle, currentBeat);

        setCprTimeRemaining(calculatedRemaining);
        setMetronomeMode('continuous');
        playAlertChime('mode_switch');

        if (metronomeBeatRef.current > 30) {
          metronomeBeatRef.current = 1;
          setMetronomeBeat(1);
        }

        if (isFromIntubation) {
          addLog("ปรับเป็น CPR 2 นาทีต่อเนื่อง และนับเวลาต่อจนครบ 2 นาที", 'cpr');
          setGuidanceMessage(
            `⚡ ปรับเป็น CPR 2 นาทีต่อเนื่อง และนับเวลาต่อจนครบ 2 นาที (เหลือเวลาอีก ${formatMMSS(calculatedRemaining)} • ช่วยหายใจ 1 ครั้งทุก 6 วินาที)`
          );
        } else {
          addLog("CPR 2นาที ต่อเนื่อง", 'cpr');
          setGuidanceMessage(
            `⚡ CPR 2นาที ต่อเนื่อง (เหลือเวลาอีก ${formatMMSS(calculatedRemaining)} • ช่วยหายใจ 1 ครั้งทุก 6 วินาที)`
          );
          speakThai("ซีพีอา สองนาที ต่อเนื่อง");
        }

        return calculatedRemaining;
      } else {
        if (!isFromIntubation) {
          addLog("CPR 2นาที ต่อเนื่อง", 'cpr');
          playAlertChime('mode_switch');
          speakThai("ซีพีอา สองนาที ต่อเนื่อง");
        }
      }
      return cprTimeRemaining;
    } else {
      // Switching to 30:2
      if (metronomeMode === 'continuous') {
        const elapsedSeconds = Math.max(0, 120 - cprTimeRemaining);
        const calculatedCycle = Math.min(5, Math.max(1, Math.floor(elapsedSeconds / 24) + 1));
        cprSubCycleRef.current = calculatedCycle;
        setCprSubCycle302(calculatedCycle);
        setMetronomeMode('30:2');
        playAlertChime('mode_switch');
        addLog("CPR 30:2 x 5 Cycles", 'cpr');
        setGuidanceMessage(`⚡ CPR 30:2 x 5 Cycles (รอบที่ ${calculatedCycle}/5)`);
        speakThai("ซีพีอา 30 ต่อ 2 5รอบ");
        return calculatedCycle;
      } else {
        addLog("CPR 30:2 x 5 Cycles", 'cpr');
        playAlertChime('mode_switch');
        speakThai("ซีพีอา 30 ต่อ 2 5รอบ");
      }
      return cprSubCycle302;
    }
  };

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
      "พบคลื่นไฟฟ้าหัวใจ SHOCKABLE! โปรดเลือกชนิดคลื่น (VF, Pulseless VT หรือ Torsades de pointes) แล้วกดปุ่มปล่อยช็อกหัวใจตรงกลางหน้าจอค่ะ"
    );
    speakThai("คลื่นไฟฟ้าหัวใจต้องการการช๊อก เลือกชนิดคลื่นไฟฟ้าหัวใจ วีเอฟ วีที หรือทอสาด และกดปุ่มปล่อยช๊อกตรงกลางค่ะ");
    setActiveTab('trc_cardiac');
    setMobileViewTab('guidelines');
  };

  const handleDeliverShock = () => {
    setShockButtonFlashing(false);
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (pulseCheckActive) {
      setPulseCheckActive(false);
      setPulseCheckTime(10);
    }

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

    const currentRhythm = selectedShockableRhythm;

    if (currentRhythm === 'Torsades') {
      setMgSo4AlertActive(true);
      setShowAltMedsModal(true);
      if (nextShock === 1) {
        setGuidanceMessage(
          "SHOCK DELIVERED! Defibrillation #1 complete (Torsades de pointes). IMMEDIATELY ADMINISTER MAGNESIUM SULFATE (50% MgSO4 2g IV/IO) in Med etc.!"
        );
        addLog(`Defibrillation #1 Delivered (200J) [Torsades de pointes]`, "shock");
        speakThai("ปล่อยช็อกครั้งที่หนึ่ง สำหรับ ทอสาดเดอปัว เรียบร้อยแล้วค่ะ แนะนำให้ยา ห้าสิบเปอเซ็นแมกนีเซียมซัลเฟ็ต สองกรัม นะคะ");
      } else {
        setGuidanceMessage(
          `SHOCK DELIVERED! Defibrillation #${nextShock} complete (Torsades de pointes). Resume CPR for 2 min. ADMINISTER MAGNESIUM SULFATE (50% MgSO4 2g IV/IO)!`
        );
        addLog(`Defibrillation #${nextShock} Delivered (200J) [Torsades de pointes]`, "shock");
        speakThai(`ปล่อยช็อกครั้งที่ ${nextShock} สำหรับ ทอสาด เรียบร้อยแล้วค่ะ แนะนำให้ยา ห้าสิบเปอเซ็นแมกนีเซียมซัลเฟ็ต สองกรัม ค่ะ`);
      }
    } else if (nextShock === 1) {
      if (!hasCompletedIvAccess) {
        setIvAccessAlertActive(true);
        setGuidanceMessage(
          "SHOCK DELIVERED! Defibrillation #1 complete. เปิดเส้น IV/IO ตรวจเลือดครบชุด และเตรียมยา EPINEPHRINE 1mg (ให้ยาหลัง Shock #2) เริ่มกดหน้าอก 2 นาที!"
        );
        addLog(`Defibrillation #1 Delivered (200J)`, "shock");
        speakThai("ปล่อยช็อกครั้งที่หนึ่ง เรียบร้อยแล้วค่ะ ขอเปิดเส้นตรวจเลือดครบชุด เตรียมให้ยาเอพิเนฟริน หนึ่งมิลลิกรัม แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ", () => {
          setEpiAlertActive(true);
          setMobileViewTab('meds');
          setGuidanceMessage("⚠️ เตรียมยา EPINEPHRINE 1mg (กะพริบเตือนเตรียมยา • กดบริหารยาได้หลัง Shock #2)");
          playAlertChime('med_due');
        });
      } else {
        setIvAccessAlertActive(false);
        setGuidanceMessage(
          "SHOCK DELIVERED! Defibrillation #1 complete. เตรียมยา EPINEPHRINE 1mg (ให้ยาหลัง Shock #2) เริ่มกดหน้าอก 2 นาที!"
        );
        addLog(`Defibrillation #1 Delivered (200J)`, "shock");
        speakThai("ปล่อยช็อกครั้งที่หนึ่ง เรียบร้อยแล้วค่ะ ขอเปิดเส้นตรวจเลือดครบชุด เตรียมให้ยาเอพิเนฟริน หนึ่งมิลลิกรัม แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ", () => {
          setEpiAlertActive(true);
          triggerGuidelineToCprTransition();
          playAlertChime('med_due');
        });
      }
    } else if (nextShock === 2) {
      setGuidanceMessage(
        "SHOCK DELIVERED! Defibrillation #2 complete. ถึงเวลาให้ยา EPINEPHRINE 1mg IV/IO ตามเกณฑ์ ACLS!"
      );
      addLog(`Defibrillation #2 Delivered (200J)`, "shock");
      setEpiAlertActive(false);
      speakThai("ปล่อยช็อกครั้งที่สอง เรียบร้อยแล้วค่ะ ให้ยาเอพิเนฟริน หนึ่งมิลลิกรัม แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ", () => {
        // เมื่อพูดจบ ให้กระพริบเตือน Epinephrine เพื่อให้กดบริหารยาได้ทันที ในแถบ Quick Meds
        setEpiAlertActive(true);
        setShowMedDueModal(true);
        setMobileViewTab('meds');
        setGuidanceMessage("⚡ กรุณากดบริหารยา EPINEPHRINE 1mg IV/IO ทันที!");
        playAlertChime('med_due');
      });
    } else if (nextShock === 3) {
      setAmioAlertActive(true);
      setLidoAlertActive(true);
      setGuidanceMessage(
        "SHOCK DELIVERED! Defibrillation #3 complete. ADMINISTER AMIODARONE 300mg OR LIDOCAINE 1-1.5mg/kg IV/IO IMMEDIATELY!"
      );
      addLog(`Defibrillation #3 Delivered (200J)`, "shock");
      speakThai(
        "ปล่อยช็อกครั้งที่สาม เรียบร้อยแล้วค่ะ พิจารณาให้ยาอะมิโอดาโรน สามร้อยมิลลิกรัม หรือยาลิโดเคน แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ",
        () => {
          setShowQuickActionModal(false);
          setShowProceduresModal(false);
          setMobileViewTab('meds');
          setGuidanceMessage("⚡ โปรดเลือกและกดบริหารยา AMIODARONE หรือ LIDOCAINE ในหน้า Quick Actions");
          playAlertChime('med_due');
        }
      );
    } else if (nextShock === 4) {
      setAmioAlertActive(true);
      setLidoAlertActive(true);
      setGuidanceMessage(
        "SHOCK DELIVERED! Defibrillation #4 complete. แนะนำให้ยา AMIODARONE หรือ LIDOCAINE IV/IO ทันที!"
      );
      addLog(`Defibrillation #4 Delivered (200J)`, "shock");
      speakThai(
        "ปล่อยช็อกครั้งที่สี่ เรียบร้อยแล้วค่ะ แนะนำให้ยาอะมิโอดาโรน หรือยาลิโดเคน แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ",
        () => {
          setShowQuickActionModal(false);
          setShowProceduresModal(false);
          setMobileViewTab('meds');
          setGuidanceMessage("⚡ โปรดเลือกและกดบริหารยา AMIODARONE หรือ LIDOCAINE ในหน้า Quick Actions");
          playAlertChime('med_due');
        }
      );
    } else if (nextShock === 5) {
      setAmioAlertActive(true);
      setLidoAlertActive(true);
      setGuidanceMessage(
        "SHOCK DELIVERED! Defibrillation #5 complete. ADMINISTER AMIODARONE 150mg OR LIDOCAINE 0.5-0.75mg/kg IV/IO!"
      );
      addLog(`Defibrillation #5 Delivered (200J)`, "shock");
      speakThai(
        "ปล่อยช็อกครั้งที่ห้า เรียบร้อยแล้วค่ะ พิจารณาให้ยาอะมิโอดาโรน ร้อยห้าสิบมิลลิกรัม หรือยาลิโดเคน แล้วเริ่มกดหน้าอกต่อทันที สองนาทีค่ะ",
        () => {
          setShowQuickActionModal(false);
          setShowProceduresModal(false);
          setMobileViewTab('meds');
          setGuidanceMessage("⚡ โปรดเลือกและกดบริหารยา AMIODARONE หรือ LIDOCAINE ในหน้า Quick Actions");
          playAlertChime('med_due');
        }
      );
    } else {
      setGuidanceMessage(
        `SHOCK DELIVERED! Defibrillation #${nextShock} complete. Immediately resume chest compressions.`
      );
      addLog(`Defibrillation #${nextShock} Delivered (200J)`, "shock");
      speakThai(`ปล่อยช็อกครั้งที่ ${nextShock} เรียบร้อยแล้วค่ะ เริ่มกดหน้าอกต่อทันที สองนาทีค่ะ`);
    }

    setSelectedShockableRhythm(null);
  };

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

    if (epiCount === 0) {
      if (!hasCompletedIvAccess) {
        setGuidanceMessage(
          "พบคลื่นไฟฟ้าหัวใจ NON-SHOCKABLE! โปรดเลือกชนิดคลื่น (Asystole/PEA) และเปิดเส้น IV/IO เพื่อให้ยา Epinephrine 1mg ทันที (นับ 4 นาทีหลังให้ยา)"
        );
        speakThai("คลื่นไฟฟ้าหัวใจช็อกไม่ได้ โปรดเลือกชนิดคลื่นไฟฟ้าหัวใจ อะซิสโทลี หรือ พีอีเอ และเปิดเส้นให้ยานะคะ", () => {
          speakHighQualityCpr();
        });
      } else {
        setGuidanceMessage(
          "พบคลื่นไฟฟ้าหัวใจ NON-SHOCKABLE! บริหารยา EPINEPHRINE 1mg ทันที (เข็มแรก) และเริ่มนับเวลาให้ยาซ้ำทุก 4 นาที"
        );
        setEpiAlertActive(true);
        setShowMedDueModal(true);
        speakThai("คลื่นไฟฟ้าหัวใจช็อกไม่ได้ ให้ยาเอพิเนฟริน เข็มแรก หนึ่งมิลลิกรัม ทันทีค่ะ", () => {
          speakHighQualityCpr();
        });
      }
    } else {
      if (epiTimeRemaining <= 0 || epiAlertActive) {
        setGuidanceMessage(
          "พบคลื่นไฟฟ้าหัวใจ NON-SHOCKABLE! ครบกำหนด 4 นาที ถึงเวลาบริหารยา EPINEPHRINE 1mg IV/IO"
        );
        setEpiAlertActive(true);
        setShowMedDueModal(true);
        speakThai("คลื่นไฟฟ้าหัวใจช็อกไม่ได้ ครบกำหนดสี่นาที ถึงเวลาให้ยาเอพิเนฟริน หนึ่งมิลลิกรัมค่ะ", () => {
          speakHighQualityCpr();
        });
      } else {
        const remainingMinutes = Math.ceil(epiTimeRemaining / 60);
        setGuidanceMessage(
          `พบคลื่นไฟฟ้าหัวใจ NON-SHOCKABLE! กดหน้าอก CPR ต่อเนื่อง 2 นาที • นับเวลาบริหารยา Epinephrine 1mg ทุก 4 นาที (เหลืออีก ${formatMMSS(epiTimeRemaining)})`
        );
        speakThai("คลื่นไฟฟ้าหัวใจช็อกไม่ได้ เริ่มกดหน้าอกต่อทันที สองนาทีค่ะ และนับเวลาให้ยาเอพิเนฟรินทุกสี่นาทีนะคะ", () => {
          speakHighQualityCpr();
        });
      }
    }

    setActiveTab('trc_cardiac');
    setMobileViewTab('guidelines');
  };

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

    if (cprActive) {
      setCprActive(false);
      addLog("CPR Paused automatically as patient has a pulse (ยังมีชีพจร)", "cpr");
    }

    setGuidanceMessage(
      "BRADYCARDIA WITH PULSE (HR < 50 bpm)! Maintain airway, support breathing & O2, monitor V/S, ECG & IV access. Treat underlying cause & Identify causes (ABC principles)."
    );

    addLog("Rhythm Checked: Bradycardia - Treat underlying cause (ABC principles)", "rhythm");
    speakThai("ชีพจรช้าผิดปกติ ดูแลทางเดินหายใจ การหายใจ ระบบไหลเวียน และหาสาเหตุนะคะ");
    setActiveTab('trc_tachy_brady');
    setMobileViewTab('guidelines');
  };

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

    if (cprActive) {
      setCprActive(false);
      addLog("CPR Paused automatically as patient has a pulse (ยังมีชีพจร)", "cpr");
    }

    setGuidanceMessage(
      "TACHYCARDIA WITH PULSE (HR >= 150 bpm)! Maintain airway, support breathing & O2, monitor V/S, ECG & IV access. Treat underlying cause & Identify causes (ABC principles)."
    );

    addLog("Rhythm Checked: Tachycardia - Treat underlying cause (ABC principles)", "rhythm");
    speakThai("ชีพจรเร็วผิดปกติ ดูแลทางเดินหายใจ การหายใจ ระบบไหลเวียน และหาสาเหตุนะคะ");
    setActiveTab('trc_tachy_brady');
    setMobileViewTab('guidelines');
  };

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

    if (cprActive) {
      setCprActive(false);
    }

    setNoPulseConfirmed(false);
    setEpiTimerStarted(false);
    setEpiAlertActive(false);
    setAmioAlertActive(false);
    setLidoAlertActive(false);
    setIvAccessAlertActive(false);
    setAirwayAlertActive(false);
    setEtco2AlertActive(false);
    setReassessWarningActive(false);

    setGuidanceMessage(
      "RETURN OF SPONTANEOUS CIRCULATION (ROSC) ACHIEVED! Initiate Post-Cardiac Arrest Care Protocol immediately."
    );

    addLog("ROSC ACHIEVED!-> Switched to Post-Cardiac Arrest Care Protocol", "system");
    speakThai("ยินดีด้วยนะคะ คนไข้กลับมามีชีพจรแล้วค่ะ สิ้นสุดกระบวนการฟื้นคืนชีพ และเริ่มทำตามแนวทางการดูแลหลังกู้ชีพจรสำเร็จทันทีค่ะ");
    setActiveTab('trc_rosc');
    setMobileViewTab('guidelines');
  };

  const handleAdministerEpinephrine = () => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    if (!hasCompletedIvAccess) {
      setIvAccessAlertActive(true);
      setGuidanceMessage("โปรดเปิดเส้นให้ยาก่อน (IV/IO Access) จึงจะสามารถบริหารยา EPINEPHRINE ได้!");
      speakThai("กรุณาเปิดเส้นให้ยา IV หรือ IO ก่อนบริหารยาเอพิเนฟรินนะคะ");
      return;
    }

    if (lastRhythmDecision === 'shockable' && shockCount < 2 && epiCount === 0) {
      setGuidanceMessage("⚠️ ยาเอพิเนฟรินเตรียมพร้อมแล้ว (โปรดรอให้ยาหลังช็อกครั้งที่ 2 ตามแนวทาง ACLS)");
      speakThai("ยาเอพิเนฟรินเตรียมพร้อมแล้วค่ะ ตามแนวทาง ACLS ให้บริหารยาหลังช็อกครั้งที่สองนะคะ");
      return;
    }

    const nextEpi = epiCount + 1;
    setEpiCount(nextEpi);
    setEpiTimeRemaining(240);
    setEpiAlertActive(false);
    setEpiTimerStarted(true);
    setShowMedDueModal(false);

    addLog(`Medication: Epinephrine 1mg + NSS up to 10ml IV/IO Push administered (Total Dose #${nextEpi})`, "med");
    
    // Close any other open modals to prevent popup collision or bleed-through
    setShowQuickActionModal(false);
    setShowAltMedsModal(false);
    setShowStabilityModal(false);
    setShowUnstableBradyModal(false);
    setShowStableBradyModal(false);
    setShowStableTachyModal(false);
    setShowUnstableTachyModal(false);
    setShowPalsModal(false);

    if (nextEpi === 1) {
      // เชื่อมโยงใส่ท่อช่วยหายใจเฉพาะเข็มที่ 1 (Link to Advanced Airway ET-Tube on Dose #1 only)
      setAirwayAlertActive(true);
      setEtco2AlertActive(true);
      setShowProceduresModal(true);

      setGuidanceMessage(
        `EPINEPHRINE #1 GIVEN! เริ่มนับเวลาให้ยาซ้ำทุก 4 นาที • พิจารณาใส่ท่อช่วยหายใจขั้นสูง (Advanced Airway / ET-Tube) และติดตาม ETCO2`
      );
      speakThai(`ให้ยาเอพิเนฟริน เข็มที่หนึ่ง เรียบร้อยแล้วค่ะ เริ่มนับเวลาให้ยาซ้ำทุกสี่นาทีนะคะ พิจารณาใส่ท่อช่วยหายใจขั้นสูงค่ะ`);
    } else {
      // เข็มถัดไป (Dose #2, #3, …): ไม่ต้อง pop up เพื่อเลือกการใส่ท่อช่วยหายใจอีก
      setAirwayAlertActive(false);
      setEtco2AlertActive(false);
      setShowProceduresModal(false);

      const thaiNumbers = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า", "สิบ"];
      const epiDoseThai = nextEpi <= 10 ? `เข็มที่${thaiNumbers[nextEpi]}` : `เข็มที่ ${nextEpi}`;
      setGuidanceMessage(
        `EPINEPHRINE #${nextEpi} GIVEN! บริหารยาเอพิเนฟริน 1mg เรียบร้อยแล้ว (เริ่มนับเวลารอบถัดไปทุก 4 นาที)`
      );
      speakThai(`ให้ยาเอพิเนฟริน ${epiDoseThai} เรียบร้อยแล้วค่ะ เริ่มนับเวลารอบถัดไปทุกสี่นาทีนะคะ`);
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
    setShowMedDueModal(false);

    const doseText = nextAmio === 1 ? "1st Dose: 300 mg+D5W up to 20ml IV/IO" : nextAmio === 2 ? "2nd Dose: 150 mg+D5W up to 20ml IV/IO" : "IV/IO";
    addLog(`Medication: Amiodarone (${doseText}) administered (Total Dose #${nextAmio})`, "med");
    if (nextAmio === 1) {
      speakThai(`ให้ยาอะมิโอดาโรน สามร้อยมิลลิกรัม เข็มที่ ${nextAmio} เรียบร้อยแล้วค่ะ`);
    } else {
      speakThai(`ให้ยาอะมิโอดาโรน ร้อยห้าสิบมิลลิกรัม เข็มที่ ${nextAmio} เรียบร้อยแล้วค่ะ`);
    }

    // สลับไปแท็บ Guidelines ทันที เพื่อแสดงแนวทางการรักษาตาม ACLS Algorithm ค้างไว้ 5 วินาที แล้วสลับกลับหน้า CPR Timer อัตโนมัติ
    triggerGuidelineToCprTransition(
      "คำแนะนำ: บริหารยา Amiodarone เรียบร้อยแล้ว! กำลังแสดงแนวทางการรักษาตาม ACLS Algorithm 5 วินาที ก่อนสลับกลับหน้า CPR Timer อัตโนมัติ"
    );
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
    setShowMedDueModal(false);

    let doseText = nextLido === 1 ? "1-1.5 mg/kg bolus" : nextLido === 2 ? "0.5-0.75 mg/kg bolus" : "bolus";
    addLog(`Medication: Lidocaine ${doseText} IV/IO administered (Total Dose #${nextLido})`, "med");
    speakThai(`ให้ยาลิโดเคน เข็มที่ ${nextLido} เรียบร้อยแล้วค่ะ`);

    // สลับไปแท็บ Guidelines ทันที เพื่อแสดงแนวทางการรักษาตาม ACLS Algorithm ค้างไว้ 5 วินาที แล้วสลับกลับหน้า CPR Timer อัตโนมัติ
    triggerGuidelineToCprTransition(
      "คำแนะนำ: บริหารยา Lidocaine เรียบร้อยแล้ว! กำลังแสดงแนวทางการรักษาตาม ACLS Algorithm 5 วินาที ก่อนสลับกลับหน้า CPR Timer อัตโนมัติ"
    );
  };

  const handleLogPresetMed = (medName: string, skipSpeech?: boolean, onSpeechEnd?: () => void) => {
    if (!caseActive) {
      setCaseActive(true);
      setCaseStartTime(Date.now());
    }

    const lower = medName.toLowerCase();

    if (lower.includes('amiodarone')) {
      setAmioCount(prev => prev + 1);
      setAmioAlertActive(false);
      setLidoAlertActive(false);
    } else if (lower.includes('lidocaine')) {
      setLidoCount(prev => prev + 1);
      setAmioAlertActive(false);
      setLidoAlertActive(false);
    } else if (lower.includes('atropine')) {
      setAtropineCount(prev => prev + 1);
    } else if (lower.includes('adenosine')) {
      setAdenosineCount(prev => prev + 1);
    }

    addLog(`Medication: ${medName} administered`, "med");

    if (!skipSpeech) {
      if (lower.includes('atropine')) {
        speakThai('ให้ยาอะโทพีน หนึ่งมิลลิกำค่ะ', onSpeechEnd);
      } else if (lower.includes('dopamine')) {
        speakThai('ให้ยาโดพามีน ดิบค่ะ', onSpeechEnd);
      } else if (lower.includes('epinephrine') && lower.includes('drip')) {
        speakThai('ให้ยาอีพิเน๊ฟริน ดิบค่ะ', onSpeechEnd);
      } else if (lower.includes('adenosine') && lower.includes('6mg')) {
        speakThai('ให้ยาอะดีโนซีน หกมิลลิกำ doubleไซริ๊งค่ะ', onSpeechEnd);
      } else if (lower.includes('adenosine') && lower.includes('12mg')) {
        speakThai('ให้ยาอะดีโนซีน สิบสองมิลลิกำ doubleไซริ๊งค่ะ', onSpeechEnd);
      } else if (lower.includes('amiodarone') && lower.includes('150')) {
        speakThai('ให้ยาอะมิโอดาโรน หนึ่งร้อยห้าสิบมิลลิกำ ค่ะ', onSpeechEnd);
      } else if (lower.includes('diltiazem') || lower.includes('metoprolol') || lower.includes('rate control')) {
        speakThai('ให้ยาควบคุมการเต้นของหัวใจค่ะ', onSpeechEnd);
      } else if (lower.includes('midazolam') || lower.includes('sedation')) {
        speakThai('ให้ยาก่อมประสาดค่ะ', onSpeechEnd);
      } else {
        speakThai(`ให้ยา ${medName.split(' ')[0]} เรียบร้อยแล้วค่ะ`, onSpeechEnd);
      }
    } else if (onSpeechEnd) {
      onSpeechEnd();
    }
  };

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
      setShowProceduresModal(false);
      setShowQuickActionModal(false);

      if (lastRhythmDecision === 'non-shockable' || shockCount >= 2 || epiCount > 0) {
        setShowMedDueModal(true);
        speakThai("เปิดเส้นให้ยาเรียบร้อยแล้วค่ะ ให้ยาเอพิเนฟริน หนึ่งมิลลิกรัม ทันทีค่ะ");
      } else {
        speakThai("เปิดเส้นให้ยาเรียบร้อยแล้ว เตรียมให้ยาเอพิเนฟรินค่ะ", () => {
          if (shockCount >= 1) {
            triggerGuidelineToCprTransition();
          }
        });
      }
      setGuidanceMessage("เปิดเส้นทาง IV/IO Access สำเร็จ! โปรดกดบริหารยา EPINEPHRINE 1mg IV/IO");
    }

    if (
      procName.includes('Advanced Airway') ||
      procName.includes('ET Tube') ||
      procName.includes('ET-Tube')
    ) {
      setAirwayAlertActive(false);
      // ตรวจสอบว่ายืนยัน ETCO2 ไปแล้วหรือยัง
      const isEtco2Done = completedProcedures.some(p => 
        p.includes('Intubation Confirmed') || p.includes('ETCO2') || p.includes('Capnography') || p.includes('PETCO2')
      );

      if (isEtco2Done) {
        let closed = false;
        const onConfirmTubeDone = () => {
          if (!closed) {
            closed = true;
            setShowProceduresModal(false);
            triggerGuidelineToCprTransition("คำแนะนำ: ยืนยันตำแหน่งท่อช่วยหายใจสำเร็จ! กำลังแสดง Guidelines (ACLS Algorithm) 5 วินาที ก่อนสลับไปหน้า CPR Timer อัตโนมัติ");
          }
        };

        changeMetronomeMode('continuous', true);
        speakThai("ปรับเป็น CPR 2 นาทีต่อเนื่อง และนับเวลาต่อจนครบ 2 นาที", onConfirmTubeDone);
        setTimeout(onConfirmTubeDone, 5000);
      } else {
        setEtco2AlertActive(true);
        speakThai("ใส่ท่อช่วยหายใจเรียบร้อยแล้วค่ะ โปรดยืนยันตำแหน่งท่อด้วยอีทีซีโอทูนะคะ");
        setGuidanceMessage("ใส่ท่อช่วยหายใจแล้ว! โปรดยืนยันตำแหน่งด้วย ETCO2 Capnography จึงจะปิดหน้าต่างอัตโนมัติ");
      }
    }

    if (
      procName.includes('Intubation Confirmed') ||
      procName.includes('ETCO2') ||
      procName.includes('Capnography') ||
      procName.includes('PETCO2')
    ) {
      setEtco2AlertActive(false);
      setAirwayAlertActive(false);

      // ตรวจสอบว่าใส่ท่อช่วยหายใจแล้วหรือยัง หากยังไม่ได้บันทึก ให้บันทึกคู่กันให้สมบูรณ์
      const isAirwayDone = completedProcedures.some(p => 
        p.includes('Advanced Airway') || p.includes('ET Tube') || p.includes('ET-Tube')
      );
      if (!isAirwayDone) {
        setCompletedProcedures(prev => prev.includes('Advanced Airway Secured (ET Tube)') ? prev : [...prev, 'Advanced Airway Secured (ET Tube)']);
      }

      // เมื่อยืนยันตำแหน่งท่อช่วยหายใจ (Confirm Tube) จบลง และปิด pop up:
      // สลับไปหน้า Guidelines 5 วินาที แล้วสลับกลับหน้า CPR Timer อัตโนมัติ
      let closed = false;
      const onConfirmTubeDone = () => {
        if (!closed) {
          closed = true;
          setShowProceduresModal(false);
          triggerGuidelineToCprTransition("คำแนะนำ: ยืนยันตำแหน่งท่อช่วยหายใจสำเร็จ! กำลังแสดง Guidelines (ACLS Algorithm) 5 วินาที ก่อนสลับไปหน้า CPR Timer อัตโนมัติ");
        }
      };

      changeMetronomeMode('continuous', true);
      speakThai("ปรับเป็น CPR 2 นาทีต่อเนื่อง และนับเวลาต่อจนครบ 2 นาที", onConfirmTubeDone);
      setTimeout(onConfirmTubeDone, 5000);
    }

    if (
      procName.includes('Arterial Blood Gas') ||
      procName.includes('ABG')
    ) {
      speakThai("เจาะ Blood แก๊ส");
    }

    if (
      procName.includes('Mechanical Chest Compressor') ||
      procName.includes('Mechanical CPR')
    ) {
      speakThai("ใส่เครื่องช่วยซีพีอา");
    }

    if (
      procName.includes('Needle Decompression') ||
      procName.includes('Chest Drain') ||
      procName.includes('ICD')
    ) {
      speakThai("ใส่ไอซีดี");
    }

    if (
      procName.includes('12-lead') ||
      procName.includes('12-Lead') ||
      procName.includes('12 leads') ||
      procName.includes('ECG 12') ||
      procName.includes('EKG 12')
    ) {
      speakThai("ตรวจคลื่นไฟฟ้าหัวใจสิบสองลีด");
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

    if (isLoggingAirway && hasCompletedEtco2 && metronomeMode === '30:2') {
      changeMetronomeMode('continuous', true);
      speakThai("ปรับเป็น CPR 2 นาทีต่อเนื่อง และนับเวลาต่อจนครบ 2 นาที");
    }

    const excludedProcedures = [
      'Adenosine 6mg IV rapid push',
      'Adenosine 12mg IV rapid push',
      'Amiodarone 150mg IV over 10 min',
      'Sedation (Midazolam 2.5mg)',
      'Expert Consultation & Transvenous Pacing Prep Requested',
    ];

    if (!excludedProcedures.includes(procName)) {
      addLog(`Procedure: ${procName}`, procName.includes('Cardioversion') ? "shock" : "system");
    }
  };

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
    setNoPulseConfirmed(false);
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
    setMetronomeTempo(100);
    setShowResetConfirm(false);
    setShowMedDueModal(false);
    if (guidelineToCprTimeoutRef.current) {
      clearTimeout(guidelineToCprTimeoutRef.current);
    }
    setMobileViewTab('cpr');

    setTimeout(() => {
      speakThai("เริ่มต้นใหม่ค่ะ", undefined, 1.1);
    }, 50);
  };

  const executeExportPDF = async (susOverride?: { score: number; grade: string; evaluator: string }) => {
    const effectiveSus = susOverride || lastSusScore;
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
      checked5T,
      susScore: effectiveSus?.score,
      susGrade: effectiveSus?.grade,
      susEvaluator: effectiveSus?.evaluator,
    });
  };

  const handleExportPDF = () => {
    // When user requests PDF flowsheet export, automatically open SUS evaluation modal first
    setIsExportPending(true);
    setShowSusModal(true);
  };

  const handleSaveAndExportPDF = async (susData: SusResultData) => {
    const susInfo = {
      score: susData.score,
      grade: susData.grade,
      evaluator: susData.evaluatorName,
    };
    setLastSusScore(susInfo);
    setIsExportPending(false);
    setShowSusModal(false);
    await executeExportPDF(susInfo);
    addLog(`ส่งออกเอกสาร PDF Resuscitation Flowsheet เรียบร้อยแล้ว (คะแนน SUS: ${susData.score.toFixed(1)}/100)`, 'system');
  };

  const handleDirectExportPDF = async () => {
    setIsExportPending(false);
    setShowSusModal(false);
    await executeExportPDF();
    addLog('ส่งออกเอกสาร PDF Resuscitation Flowsheet เรียบร้อยแล้ว', 'system');
  };

  const handleCloseSusModal = () => {
    setIsExportPending(false);
    setShowSusModal(false);
  };

  const copyLogsToClipboard = () => {
    const header = `SMART ACLS COPILOT REPORT\n=========================\nDate: ${new Date().toLocaleDateString()}\nTotal Resuscitation Time: ${formatMMSS(caseElapsedSeconds)}\nCPR CYCLES Completed: ${cprCycle - 1}\nDefibrillations Delivered: ${shockCount}\nEpinephrine Administered: ${epiCount} doses\nAmiodarone Administered: ${amioCount} doses\nLidocaine Administered: ${lidoCount} doses\n\nDETAILED TIMESTAMP LOGS:\n-------------------------\n`;
    const logBody = logs.map(l => `[${l.time}] (Elapsed: ${l.elapsed}) - ${l.text}`).join('\n');
    const fullText = header + logBody;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
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
      alert("Error copying logs.");
    }
  };

  const formatMMSS = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCloseApp = () => {
    setCprActive(false);
    setCaseActive(false);
    setPulseCheckActive(false);
    setMetronomeOn(false);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        // ignore
      }
    }

    addLog('ปิดแอปพลิเคชัน: ผู้ใช้งานสั่งปิดระบบเรียบร้อยแล้ว', 'system');

    try {
      window.opener = null;
      window.open('', '_self', '');
      window.close();
    } catch (e) {
      // ignore
    }

    try {
      window.close();
    } catch (e) {
      // ignore
    }

    setIsAppClosed(true);
  };

  if (isAppClosed) {
    return (
      <div 
        id="smart_acls_closed_screen"
        className="min-h-[100dvh] h-[100dvh] w-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-950/70 border border-rose-800/80 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
            <Power className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              ปิดแอปพลิเคชันเรียบร้อยแล้ว
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              ระบบ SMART ACLS COPILOT ได้หยุดการทำงานและเก็บบันทึกข้อมูลอย่างปลอดภัยแล้ว ท่านสามารถปิดแท็บเบราว์เซอร์นี้ได้ทันที
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2.5">
            <button
              id="btn_restart_app_after_close"
              onClick={() => {
                setIsAppClosed(false);
                window.location.reload();
              }}
              className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>เปิดใช้งานใหม่อีกครั้ง (Restart App)</span>
            </button>
            <button
              type="button"
              id="btn_close_tab_final"
              onClick={() => {
                try {
                  window.opener = null;
                  window.open('', '_self', '');
                  window.close();
                } catch (e) {
                  // ignore
                }
                try {
                  window.close();
                } catch (e) {
                  // ignore
                }
                setTimeout(() => {
                  try {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      window.location.href = 'about:blank';
                    }
                  } catch (e) {}
                }, 150);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง / แท็บทันที (Close Tab)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="smart_acls_root" 
      className="min-h-[100dvh] h-[100dvh] w-screen max-w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased pb-safe pl-safe pr-safe"
      style={{
        height: '100dvh',
        minHeight: '-webkit-fill-available'
      }}
    >
      {/* 1. HEADER BAR */}
      <HeaderBar
        systemTime={systemTime}
        caseActive={caseActive}
        caseElapsedSeconds={caseElapsedSeconds}
        cprCycle={cprCycle}
        cprSubCycle302={cprSubCycle302}
        formatMMSS={formatMMSS}
        onOpenLogoModal={() => setShowLogoModal(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
        onOpenSusModal={() => {
          setIsExportPending(false);
          setShowSusModal(true);
        }}
      />

      {/* 2. CONTROL BAR */}
      <ControlBar
        testAudioSystem={testAudioSystem}
        audioTesting={audioTesting}
        voiceAlertsOn={voiceAlertsOn}
        setVoiceAlertsOn={setVoiceAlertsOn}
        metronomeOn={metronomeOn}
        setMetronomeOn={setMetronomeOn}
        metronomeTempo={metronomeTempo}
        setMetronomeTempo={setMetronomeTempo}
        metronomeMode={metronomeMode}
        setMetronomeMode={changeMetronomeMode}
        cprActive={cprActive}
        caseActive={caseActive}
        onCloseApp={handleCloseApp}
        metronomeBeat={metronomeBeat}
        confirmNewCase={confirmNewCase}
        addLog={addLog}
        speakThai={speakThai}
        onOpenPalsModal={() => setShowPalsModal(true)}
        handleLogPresetMed={handleLogPresetMed}
        completedProcedures={completedProcedures}
        handleLogProcedure={handleLogProcedure}
        ivAccessAlertActive={ivAccessAlertActive}
        airwayAlertActive={airwayAlertActive}
        etco2AlertActive={etco2AlertActive}
        showProceduresModal={showProceduresModal}
        setShowProceduresModal={setShowProceduresModal}
        showAltMedsPopover={showAltMedsModal}
        setShowAltMedsPopover={setShowAltMedsModal}
        mgSo4AlertActive={mgSo4AlertActive}
        setMgSo4AlertActive={setMgSo4AlertActive}
        onOpenSusModal={() => {
          setIsExportPending(false);
          setShowSusModal(true);
        }}
      />

      {/* 3. MAIN WORKSPACE (Side-by-side on Tablet/Desktop md+, Tabbed full screen on Mobile) */}
      <main className="flex-1 overflow-y-auto md:overflow-hidden p-1 sm:p-2 md:p-2.5 flex flex-col md:flex-row gap-1.5 sm:gap-2 max-w-full h-full min-h-0">
        {/* Mobile View Tab Selector Header (Hidden on Tablet md and Desktop lg) */}
        <div className="flex md:hidden items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-1 shrink-0 gap-1 overflow-x-auto no-scrollbar shadow-md w-full">
          <button
            id="tab_mobile_cpr"
            onClick={() => handleSelectMobileTab('cpr')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-black rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              mobileViewTab === 'cpr' || mobileViewTab === 'meds' ? 'bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0 -ml-0.5" />
            <span className="truncate">CPR & Actions</span>
          </button>

          <button
            id="tab_mobile_guidelines"
            onClick={() => handleSelectMobileTab('guidelines')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-black rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              mobileViewTab === 'guidelines' ? 'bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Guidelines</span>
          </button>

          <button
            id="tab_mobile_logs"
            onClick={() => handleSelectMobileTab('logs')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-black rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              mobileViewTab === 'logs' ? 'bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Logs ({logs.length})</span>
          </button>
        </div>

        {/* LEFT COLUMN: TIMERS & QUICK ACTIONS (50% width on tablet md & desktop lg, unified on mobile) */}
        <div className={`flex-1 md:w-1/2 flex flex-col gap-1.5 sm:gap-2 overflow-y-auto h-full w-full ${
          mobileViewTab === 'cpr' || mobileViewTab === 'meds' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* CPR Timer Card with Integrated Left (Meds) and Right (Rhythms) Actions */}
          <div className="flex flex-col w-full shrink-0">
            <CprTimerCard
              cprTimeRemaining={cprTimeRemaining}
              cprActive={cprActive}
              metronomeMode={metronomeMode}
              setMetronomeMode={changeMetronomeMode}
              cprSubCycle302={cprSubCycle302}
              setCprSubCycle302={setCprSubCycle302}
              cprSubCycleRef={cprSubCycleRef}
              toggleCPR={toggleCPR}
              resetCPRCycle={resetCPRCycle}
              startPulseCheck={startPulseCheck}
              caseActive={caseActive}
              cprButtonFlash={cprButtonFlash}
              pulseCheckActive={pulseCheckActive}
              formatMMSS={formatMMSS}
              addLog={addLog}
              speakThai={speakThai}
              metronomeOn={metronomeOn}
              metronomeBeat={metronomeBeat}
              handleLogPresetMed={handleLogPresetMed}
              logs={logs}
              noPulseConfirmed={noPulseConfirmed}
              setNoPulseConfirmed={setNoPulseConfirmed}
              playAlertChime={playAlertChime}
              setGuidanceMessage={setGuidanceMessage}
              hasCompletedAirway={hasCompletedAirway}
              hasCompletedEtco2={hasCompletedEtco2}
              hasCompletedIvAccess={hasCompletedIvAccess}
              handleAdministerEpinephrine={handleAdministerEpinephrine}
              epiCount={epiCount}
              epiTimeRemaining={epiTimeRemaining}
              epiTimerStarted={epiTimerStarted}
              epiAlertActive={epiAlertActive}
              onOpenMedDueModal={() => setShowMedDueModal(true)}
              handleAdministerAmiodarone={handleAdministerAmiodarone}
              amioCount={amioCount}
              amioAlertActive={amioAlertActive}
              handleAdministerLidocaine={handleAdministerLidocaine}
              lidoCount={lidoCount}
              lidoAlertActive={lidoAlertActive}
              handleRhythmBradycardia={handleRhythmBradycardia}
              handleRhythmTachycardia={handleRhythmTachycardia}
              handleRhythmROSC={handleRhythmROSC}
              lastRhythmDecision={lastRhythmDecision}
              shockCount={shockCount}
              shockButtonFlashing={shockButtonFlashing}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: GUIDANCE & LOGS FEED (50% width on tablet md & desktop lg) */}
        <div className={`flex-1 md:w-1/2 flex-col gap-1.5 sm:gap-2 overflow-hidden md:overflow-y-auto h-full w-full ${
          mobileViewTab === 'guidelines' || mobileViewTab === 'logs' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Interactive Protocol Guidance */}
          <div className={`flex-1 flex flex-col overflow-hidden h-full w-full ${
            mobileViewTab === 'guidelines' ? 'flex' : 'hidden md:flex md:h-1/2'
          }`}>
            <GuidancePanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              guidanceMessage={guidanceMessage}
              lastRhythmDecision={lastRhythmDecision}
              selectedShockableRhythm={selectedShockableRhythm}
              setSelectedShockableRhythm={setSelectedShockableRhythm}
              selectedNonShockableRhythm={selectedNonShockableRhythm}
              setSelectedNonShockableRhythm={setSelectedNonShockableRhythm}
              handleDeliverShock={handleDeliverShock}
              shockCount={shockCount}
              handleAdministerEpinephrine={handleAdministerEpinephrine}
              epiCount={epiCount}
              handleAdministerAmiodarone={handleAdministerAmiodarone}
              amioCount={amioCount}
              handleAdministerLidocaine={handleAdministerLidocaine}
              lidoCount={lidoCount}
              stabilityStatus={stabilityStatus}
              setStabilityStatus={setStabilityStatus}
              reassessWarningActive={reassessWarningActive}
              setReassessWarningActive={setReassessWarningActive}
              tachyVagalFlashing={tachyVagalFlashing}
              setTachyVagalFlashing={setTachyVagalFlashing}
              tachyAmioFlashing={tachyAmioFlashing}
              setTachyAmioFlashing={setTachyAmioFlashing}
              tachyConsultFlashing={tachyConsultFlashing}
              setTachyConsultFlashing={setTachyConsultFlashing}
              shockButtonFlashing={shockButtonFlashing}
              setShockButtonFlashing={setShockButtonFlashing}
              atropineCount={atropineCount}
              adenosineCount={adenosineCount}
              adrenalineInfCount={adrenalineInfCount}
              dopamineInfCount={dopamineInfCount}
              noradrenalineCount={noradrenalineCount}
              setNoradrenalineCount={setNoradrenalineCount}
              roscCheckedSteps={roscCheckedSteps}
              setRoscCheckedSteps={setRoscCheckedSteps}
              roscStemiStatus={roscStemiStatus}
              setRoscStemiStatus={setRoscStemiStatus}
              roscSpO2Level={roscSpO2Level}
              setRoscSpO2Level={setRoscSpO2Level}
              roscBPStatus={roscBPStatus}
              setRoscBPStatus={setRoscBPStatus}
              roscComatoseStatus={roscComatoseStatus}
              setRoscComatoseStatus={setRoscComatoseStatus}
              checked5H={checked5H}
              toggle5H={toggle5H}
              checked5T={checked5T}
              toggle5T={toggle5T}
              handleLogProcedure={handleLogProcedure}
              completedProcedures={completedProcedures}
              handleLogPresetMed={handleLogPresetMed}
              triggerReassessmentAlert={triggerReassessmentAlert}
              addLog={addLog}
              speakThai={speakThai}
              customNote={customNote}
              setCustomNote={setCustomNote}
              handleLogCustomNote={handleLogCustomNote}
              ivAccessAlertActive={ivAccessAlertActive}
              setIvAccessAlertActive={setIvAccessAlertActive}
              hasCompletedIvAccess={hasCompletedIvAccess}
              airwayAlertActive={airwayAlertActive}
              etco2AlertActive={etco2AlertActive}
              showStabilityModal={showStabilityModal}
              setShowStabilityModal={setShowStabilityModal}
              showProceduresModal={showProceduresModal}
              setShowProceduresModal={setShowProceduresModal}
              setShowAltMedsModal={setShowAltMedsModal}
              mgSo4AlertActive={mgSo4AlertActive}
              epiAlertActive={epiAlertActive}
              onOpenUnstableBradyModal={() => setShowUnstableBradyModal(true)}
              onOpenStableBradyModal={() => setShowStableBradyModal(true)}
              onOpenStableTachyModal={() => setShowStableTachyModal(true)}
              onOpenUnstableTachyModal={() => setShowUnstableTachyModal(true)}
            />
          </div>

          {/* Live Timestamped Flowsheet Log */}
          <div className={`flex-1 flex flex-col overflow-hidden h-full w-full ${
            mobileViewTab === 'logs' ? 'flex' : 'hidden md:flex md:h-1/2'
          }`}>
            <LogsPanel
              logs={logs}
              logEndRef={logEndRef}
              copyLogsToClipboard={copyLogsToClipboard}
              copied={copied}
              handleExportPDF={handleExportPDF}
              formatMMSS={formatMMSS}
              caseElapsedSeconds={caseElapsedSeconds}
              customNote={customNote}
              setCustomNote={setCustomNote}
              handleLogCustomNote={handleLogCustomNote}
              onOpenSusModal={() => {
                setIsExportPending(false);
                setShowSusModal(true);
              }}
            />
          </div>
        </div>
      </main>

      {/* 4. MODALS */}
      <PulseCheckModal
        pulseCheckActive={pulseCheckActive}
        pulseCheckTime={pulseCheckTime}
        cancelPulseCheck={cancelPulseCheck}
        toggleCPR={toggleCPR}
        cprActive={cprActive}
        onCompletePulseCheck={() => {
          setNoPulseConfirmed(true);
          setShowQuickActionModal(true);
        }}
      />

      <QuickActionPromptModal
        isOpen={showQuickActionModal}
        onClose={() => setShowQuickActionModal(false)}
        lastRhythmDecision={lastRhythmDecision}
        selectedShockableRhythm={selectedShockableRhythm}
        setSelectedShockableRhythm={setSelectedShockableRhythm}
        selectedNonShockableRhythm={selectedNonShockableRhythm}
        setSelectedNonShockableRhythm={setSelectedNonShockableRhythm}
        handleRhythmShockable={handleRhythmShockable}
        handleRhythmNonShockable={handleRhythmNonShockable}
        handleRhythmBradycardia={handleRhythmBradycardia}
        handleRhythmTachycardia={handleRhythmTachycardia}
        handleRhythmROSC={handleRhythmROSC}
        handleDeliverShock={handleDeliverShock}
        shockCount={shockCount}
        shockButtonFlashing={shockButtonFlashing}
        setShockButtonFlashing={setShockButtonFlashing}
        handleAdministerEpinephrine={handleAdministerEpinephrine}
        epiCount={epiCount}
        epiTimeRemaining={epiTimeRemaining}
        epiTimerStarted={epiTimerStarted}
        formatMMSS={formatMMSS}
        handleAdministerAmiodarone={handleAdministerAmiodarone}
        amioCount={amioCount}
        handleAdministerLidocaine={handleAdministerLidocaine}
        lidoCount={lidoCount}
        addLog={addLog}
        speakThai={speakThai}
        cprActive={cprActive}
        toggleCPR={toggleCPR}
        hasCompletedIvAccess={hasCompletedIvAccess}
        handleLogProcedure={handleLogProcedure}
        setShowProceduresModal={setShowProceduresModal}
        setShowMedDueModal={setShowMedDueModal}
        setIvAccessAlertActive={setIvAccessAlertActive}
        setEpiAlertActive={setEpiAlertActive}
      />

      <ResetConfirmModal
        showResetConfirm={showResetConfirm}
        setShowResetConfirm={setShowResetConfirm}
        executeReset={executeReset}
      />

      <PalsCalcModal
        isOpen={showPalsModal}
        onClose={() => setShowPalsModal(false)}
        addLog={addLog}
        speakThai={speakThai}
      />

      <ClinicalStabilityModal
        isOpen={showStabilityModal}
        onClose={() => setShowStabilityModal(false)}
        rhythmType={lastRhythmDecision}
        onSelectStability={(status) => setStabilityStatus(status)}
        addLog={addLog}
        speakThai={speakThai}
        onOpenUnstableBradyModal={() => setShowUnstableBradyModal(true)}
        onOpenStableBradyModal={() => setShowStableBradyModal(true)}
        onOpenStableTachyModal={() => setShowStableTachyModal(true)}
        onOpenUnstableTachyModal={() => setShowUnstableTachyModal(true)}
      />

      <UnstableBradycardiaModal
        isOpen={showUnstableBradyModal}
        onClose={() => setShowUnstableBradyModal(false)}
        atropineCount={atropineCount}
        handleLogPresetMed={handleLogPresetMed}
        handleLogProcedure={handleLogProcedure}
        triggerReassessmentAlert={triggerReassessmentAlert}
        speakThai={speakThai}
        addLog={addLog}
      />

      <StableBradycardiaModal
        isOpen={showStableBradyModal}
        onClose={() => setShowStableBradyModal(false)}
        completedProcedures={completedProcedures}
        atropineCount={atropineCount}
        handleLogProcedure={handleLogProcedure}
        handleLogPresetMed={handleLogPresetMed}
        triggerReassessmentAlert={triggerReassessmentAlert}
        speakThai={speakThai}
        addLog={addLog}
      />

      <StableTachycardiaModal
        isOpen={showStableTachyModal}
        onClose={() => setShowStableTachyModal(false)}
        completedProcedures={completedProcedures}
        adenosineCount={adenosineCount}
        amioCount={amioCount}
        handleLogProcedure={handleLogProcedure}
        handleLogPresetMed={handleLogPresetMed}
        triggerReassessmentAlert={triggerReassessmentAlert}
        speakThai={speakThai}
        addLog={addLog}
      />

      <UnstableTachycardiaModal
        isOpen={showUnstableTachyModal}
        onClose={() => setShowUnstableTachyModal(false)}
        completedProcedures={completedProcedures}
        amioCount={amioCount}
        handleLogProcedure={handleLogProcedure}
        handleLogPresetMed={handleLogPresetMed}
        handleDeliverShock={handleDeliverShock}
        triggerReassessmentAlert={triggerReassessmentAlert}
        speakThai={speakThai}
        addLog={addLog}
      />

      <LogoModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        onOpenInstallModal={() => setShowInstallModal(true)}
      />

      <InstallPromptModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      <SystemUsabilityScaleModal
        isOpen={showSusModal}
        onClose={handleCloseSusModal}
        addLog={addLog}
        isExportPending={isExportPending}
        onSaveAndExportPDF={handleSaveAndExportPDF}
        onDirectExportPDF={handleDirectExportPDF}
      />

      <MedDueModal
        isOpen={showMedDueModal}
        onClose={() => setShowMedDueModal(false)}
        epiAlertActive={epiAlertActive}
        epiCount={epiCount}
        epiTimeRemaining={epiTimeRemaining}
        handleAdministerEpinephrine={handleAdministerEpinephrine}
        isEpiPrepOnly={lastRhythmDecision === 'shockable' && shockCount < 2 && epiCount === 0}
        amioAlertActive={amioAlertActive}
        amioCount={amioCount}
        handleAdministerAmiodarone={handleAdministerAmiodarone}
        lidoAlertActive={lidoAlertActive}
        lidoCount={lidoCount}
        handleAdministerLidocaine={handleAdministerLidocaine}
        mgSo4AlertActive={mgSo4AlertActive}
        handleLogPresetMed={handleLogPresetMed}
        hasCompletedIvAccess={hasCompletedIvAccess}
        handleLogProcedure={handleLogProcedure}
        shockCount={shockCount}
        lastRhythmDecision={lastRhythmDecision}
        formatMMSS={formatMMSS}
      />
    </div>
  );
}
