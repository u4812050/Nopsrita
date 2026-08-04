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
import { Clock, Zap, Activity, ListFilter, Heart } from 'lucide-react';

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
  const [voiceAlertsOn, setVoiceAlertsOn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<GuidelineTab>('trc_cardiac');
  const [mobileViewTab, setMobileViewTab] = useState<'cpr' | 'meds' | 'guidelines' | 'logs'>('cpr');
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
  const [showProceduresModal, setShowProceduresModal] = useState<boolean>(false);
  const [completedProcedures, setCompletedProcedures] = useState<string[]>([]);

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
  const [mgSo4AlertActive, setMgSo4AlertActive] = useState<boolean>(false);

  // 10-Second Pulse & EKG assessment timer states
  const [pulseCheckActive, setPulseCheckActive] = useState<boolean>(false);
  const [pulseCheckTime, setPulseCheckTime] = useState<number>(10);
  const [cprButtonFlash, setCprButtonFlash] = useState<boolean>(false);
  const [shockButtonFlashing, setShockButtonFlashing] = useState<boolean>(false);

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
          "Cycle": "ไซเคิล"
        };

        Object.keys(phoneticMap).forEach(key => {
          const regex = new RegExp(key, 'gi');
          spokenText = spokenText.replace(regex, phoneticMap[key]);
        });

        const isCountdown = ["สิบ", "เก้า", "แปด", "เจ็ด", "เหจ็ด", "หก", "ห้า", "สี่", "สาม", "สอง", "หนึ่ง", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"].includes(spokenText.trim());
        const isCycleNoSuffix = /^((Cycle|ไซเคิล)\s*\d+)$/i.test(spokenText.trim()) || spokenText.includes("ครบ 5 ไซเคิล");

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

        if (onEnd) {
          let hasCalledEnd = false;
          utterance.onend = () => {
            if (!hasCalledEnd) {
              hasCalledEnd = true;
              onEnd();
            }
          };
        }

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
            nextDelayMs = currentBeat === 30 ? 1000 : intervalMs;
          } else if (currentBeat === 31) {
            nextDelayMs = 1000;
          } else if (currentBeat === 32) {
            nextDelayMs = 1000;

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
                addLog(`CPR 30:2 ครบ 5 Cycle (รอบที่ ${currentCycleNumber}) - ประเมินชีพจรและ EKG`, 'cpr');
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

        if (cprActive) {
          setCprTimeRemaining(prev => {
            const nextValue = prev - 1;

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
                if (metronomeMode === '30:2') {
                  addLog(`CPR 30:2 ครบ 5 Cycle (รอบที่ ${currentCycleNumber}) - ประเมินชีพจรและ EKG`, 'cpr');
                } else {
                  addLog(`CPR ต่อเนื่องครบ 2 นาที (รอบที่ ${currentCycleNumber}) - ประเมินชีพจรและ EKG`, 'cpr');
                }
                playAlertChime('cpr_expire');
                speakThai(metronomeMode === '30:2' ? "ครบ 5 ไซเคิล รีบประเมินชีพจรและอีเคจี" : "ครบ 2 นาที รีบประเมินชีพจรและอีเคจี ค่ะ", () => {
                  setPulseCheckActive(true);
                  setPulseCheckTime(10);
                });
              }
              return 120;
            }
            return nextValue;
          });
        }

        if (epiTimerStarted) {
          setEpiTimeRemaining(prev => {
            if (prev <= 1) {
              if (prev === 1) {
                playAlertChime('med_due');
                speakThai("ถึงเวลาให้ยาเอพิเนฟริน");
                setEpiAlertActive(true);
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
    setPulseCheckActive(true);
    setPulseCheckTime(10);
  };

  const cancelPulseCheck = () => {
    setPulseCheckActive(false);
    setPulseCheckTime(10);
    addLog("Pulse & EKG Assessment Timer stopped manually", "system");
    speakThai("ยกเลิกการจับเวลาประเมินชีพจร");
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
    } else {
      setCprActive(true);
      speakThai("เริ่ม CPR", undefined, 1.1);
    }
  };

  const resetCPRCycle = () => {
    setCprTimeRemaining(120);
    setCprSubCycle302(1);
    cprSubCycleRef.current = 1;
    addLog(`CPR Cycle ${cprCycle} Timer reset back to 02:00`, "cpr");
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
      "พบคลื่นไฟฟ้าหัวใจ NON-SHOCKABLE! โปรดเลือกชนิดคลื่น (Asystole/PEA) และทำ IV Access เพื่อเปิดเส้นทางบริหารยา"
    );

    speakThai("คลื่นไฟฟ้าหัวใจช็อกไม่ได้ โปรดเลือกชนิดคลื่นไฟฟ้าหัวใจ อะซิสโทลี หรือ พีอีเอ และเปิดเส้นให้ยานะคะ");
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

    const nextEpi = epiCount + 1;
    setEpiCount(nextEpi);
    setEpiTimeRemaining(240);
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
      speakThai("เปิดเส้นให้ยาเรียบร้อยแล้ว เตรียมให้ยาเอพิเนฟรินค่ะ");
      setGuidanceMessage("เปิดเส้นทาง IV/IO Access สำเร็จ! โปรดกดบริหารยา EPINEPHRINE 1mg IV/IO");
    }

    if (
      procName.includes('Advanced Airway') ||
      procName.includes('ET Tube') ||
      procName.includes('ET-Tube')
    ) {
      setAirwayAlertActive(false);
      speakThai("ใส่ท่อช่วยหายใจแล้วค่ะ");
    }

    if (
      procName.includes('Intubation Confirmed') ||
      procName.includes('ETCO2') ||
      procName.includes('Capnography') ||
      procName.includes('PETCO2')
    ) {
      setEtco2AlertActive(false);
      speakThai("ประเมินท่อช่วยหายใจอยู่ในตำแหน่ง ขอติดแค๊บโนกราฟฟี่ค่ะ", () => {
        setMetronomeMode('continuous');
        playAlertChime('mode_switch');
        speakThai("เปลี่ยนการซีพีอา เป็นแบบสองนาทีต่อเนื่อง และเปลี่ยนการช่วยหายใจทุกหกวินาทีค่ะ");
      });
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

    if (
      (isLoggingEtco2 && hasCompletedAirway) ||
      (isLoggingAirway && hasCompletedEtco2)
    ) {
      setMetronomeMode('continuous');
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

    setTimeout(() => {
      speakThai("เริ่มต้นใหม่ค่ะ", undefined, 1.1);
    }, 50);
  };

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

  return (
    <div id="smart_acls_root" className="min-h-[100dvh] h-[100dvh] w-screen max-w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* 1. HEADER BAR */}
      <HeaderBar
        systemTime={systemTime}
        caseActive={caseActive}
        caseElapsedSeconds={caseElapsedSeconds}
        cprCycle={cprCycle}
        cprSubCycle302={cprSubCycle302}
        formatMMSS={formatMMSS}
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
        setMetronomeMode={setMetronomeMode}
        cprActive={cprActive}
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
      />

      {/* 3. MAIN WORKSPACE (Side-by-side on Tablet/Desktop md+, Tabbed full screen on Mobile) */}
      <main className="flex-1 overflow-y-auto md:overflow-hidden p-1 sm:p-2 md:p-2.5 flex flex-col md:flex-row gap-1.5 sm:gap-2 max-w-full h-full min-h-0">
        {/* Mobile View Tab Selector Header (Hidden on Tablet md and Desktop lg) */}
        <div className="flex md:hidden items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-1 shrink-0 gap-1 overflow-x-auto no-scrollbar shadow-md w-full">
          <button
            onClick={() => setMobileViewTab('cpr')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-black rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              mobileViewTab === 'cpr' ? 'bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">CPR Timer</span>
          </button>

          <button
            onClick={() => setMobileViewTab('meds')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-black rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              mobileViewTab === 'meds' ? 'bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Actions & Meds</span>
          </button>

          <button
            onClick={() => setMobileViewTab('guidelines')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-black rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              mobileViewTab === 'guidelines' ? 'bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Guidelines</span>
          </button>

          <button
            onClick={() => setMobileViewTab('logs')}
            className={`flex-1 min-w-0 py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-black rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              mobileViewTab === 'logs' ? 'bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Logs ({logs.length})</span>
          </button>
        </div>

        {/* LEFT COLUMN: TIMERS & QUICK ACTIONS (50% width on tablet md & desktop lg) */}
        <div className={`flex-1 md:w-1/2 flex-col gap-1.5 sm:gap-2 overflow-hidden md:overflow-y-auto h-full w-full ${
          mobileViewTab === 'cpr' || mobileViewTab === 'meds' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* CPR Timer Card */}
          <div className={`flex flex-col h-[418px] w-full shrink-0 ${mobileViewTab === 'cpr' ? 'flex' : 'hidden md:flex'}`}>
            <CprTimerCard
              cprTimeRemaining={cprTimeRemaining}
              cprActive={cprActive}
              metronomeMode={metronomeMode}
              setMetronomeMode={setMetronomeMode}
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
            />
          </div>

          {/* Quick Meds and Shocks Panel */}
          <div className={`flex flex-col h-[185px] w-full shrink-0 ${mobileViewTab === 'meds' ? 'flex' : 'hidden md:flex'}`}>
            <QuickMedsShocksPanel
              hasCompletedIvAccess={hasCompletedIvAccess}
              handleAdministerEpinephrine={handleAdministerEpinephrine}
              epiCount={epiCount}
              epiTimeRemaining={epiTimeRemaining}
              epiTimerStarted={epiTimerStarted}
              epiAlertActive={epiAlertActive}
              handleDeliverShock={handleDeliverShock}
              shockCount={shockCount}
              handleAdministerAmiodarone={handleAdministerAmiodarone}
              amioCount={amioCount}
              amioAlertActive={amioAlertActive}
              handleAdministerLidocaine={handleAdministerLidocaine}
              lidoCount={lidoCount}
              lidoAlertActive={lidoAlertActive}
              handleRhythmShockable={handleRhythmShockable}
              handleRhythmNonShockable={handleRhythmNonShockable}
              handleRhythmBradycardia={handleRhythmBradycardia}
              handleRhythmTachycardia={handleRhythmTachycardia}
              handleRhythmROSC={handleRhythmROSC}
              lastRhythmDecision={lastRhythmDecision}
              selectedShockableRhythm={selectedShockableRhythm}
              setSelectedShockableRhythm={setSelectedShockableRhythm}
              selectedNonShockableRhythm={selectedNonShockableRhythm}
              setSelectedNonShockableRhythm={setSelectedNonShockableRhythm}
              setShockButtonFlashing={setShockButtonFlashing}
              addLog={addLog}
              speakThai={speakThai}
              formatMMSS={formatMMSS}
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
        onCompletePulseCheck={() => setShowQuickActionModal(true)}
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
    </div>
  );
}
