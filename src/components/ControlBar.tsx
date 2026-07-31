import React, { useState } from 'react';
import { Volume2, RotateCcw, Heart, Baby, Syringe, ChevronDown, Sparkles, Check, Info, Stethoscope, Plus, AlertTriangle } from 'lucide-react';
import { ALT_RESUSCITATION_MEDS, AltMedItem } from '../data/altMeds';
import { PROCEDURE_PRESETS } from '../types';

interface ControlBarProps {
  testAudioSystem: () => void;
  audioTesting: boolean;
  voiceAlertsOn: boolean;
  setVoiceAlertsOn: (val: boolean) => void;
  metronomeOn: boolean;
  setMetronomeOn: (val: boolean) => void;
  metronomeTempo: number;
  setMetronomeTempo: (bpm: number) => void;
  metronomeMode: '30:2' | 'continuous';
  setMetronomeMode: (mode: '30:2' | 'continuous') => void;
  cprActive: boolean;
  metronomeBeat: number;
  confirmNewCase: () => void;
  addLog: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  speakThai: (text: string) => void;
  onOpenPalsModal: () => void;
  handleLogPresetMed?: (medName: string, skipSpeech?: boolean) => void;
  completedProcedures?: string[];
  handleLogProcedure?: (procName: string) => void;
  ivAccessAlertActive?: boolean;
  airwayAlertActive?: boolean;
  etco2AlertActive?: boolean;
  showProceduresModal?: boolean;
  setShowProceduresModal?: (val: boolean) => void;
  showAltMedsPopover?: boolean;
  setShowAltMedsPopover?: (val: boolean) => void;
  mgSo4AlertActive?: boolean;
  setMgSo4AlertActive?: (val: boolean) => void;
}

export function ControlBar({
  testAudioSystem,
  audioTesting,
  voiceAlertsOn,
  setVoiceAlertsOn,
  metronomeOn,
  setMetronomeOn,
  metronomeTempo,
  setMetronomeTempo,
  metronomeMode,
  setMetronomeMode,
  cprActive,
  metronomeBeat,
  confirmNewCase,
  addLog,
  speakThai,
  onOpenPalsModal,
  handleLogPresetMed,
  completedProcedures = [],
  handleLogProcedure,
  ivAccessAlertActive = false,
  airwayAlertActive = false,
  etco2AlertActive = false,
  showProceduresModal = false,
  setShowProceduresModal,
  showAltMedsPopover: showAltMedsProp,
  setShowAltMedsPopover: setShowAltMedsProp,
  mgSo4AlertActive = false,
  setMgSo4AlertActive,
}: ControlBarProps) {
  const [localShowAltMeds, setLocalShowAltMeds] = useState<boolean>(false);
  const showAltMedsPopover = showAltMedsProp !== undefined ? showAltMedsProp : localShowAltMeds;
  const setShowAltMedsPopover = setShowAltMedsProp || setLocalShowAltMeds;

  const [lastLoggedMed, setLastLoggedMed] = useState<string | null>(null);
  const [selectedMedDetail, setSelectedMedDetail] = useState<AltMedItem | null>(null);

  const isProceduresFlashing = ivAccessAlertActive || airwayAlertActive || etco2AlertActive;

  const handleAdministerAltMed = (med: AltMedItem) => {
    if (handleLogPresetMed) {
      handleLogPresetMed(`${med.name} (${med.dose})`, true);
    } else if (addLog) {
      addLog(`Medication: ${med.name} (${med.dose}) administered`, 'med');
    }

    if (speakThai) {
      if (med.speechText.startsWith('ให้ยา') || med.speechText.includes('เรียบร้อยแล้ว')) {
        speakThai(med.speechText);
      } else {
        speakThai(`ให้ยา ${med.speechText} เรียบร้อยแล้วค่ะ`);
      }
    }

    if (med.id === 'mgso4' && setMgSo4AlertActive) {
      setMgSo4AlertActive(false);
    }

    setLastLoggedMed(med.shortName);
    setTimeout(() => setLastLoggedMed(null), 3000);
  };

  return (
    <section className="bg-slate-900/90 border-b border-slate-800 py-1.5 px-1.5 sm:px-4 text-xs font-semibold text-slate-300 shrink-0 z-10 w-full max-w-full overflow-x-auto no-scrollbar">
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Left Side Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-full">
          {/* Thai Speech Verification */}
          <button
            id="btn_verify_thai_voice"
            onClick={testAudioSystem}
            disabled={audioTesting}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md border text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
              audioTesting
                ? 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-cyan-950/70 hover:bg-cyan-900/80 border-cyan-700/60 text-cyan-300 shadow-xs'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{audioTesting ? 'กำลังพูด...' : 'ทดสอบเสียงเตือน'}</span>
          </button>

          {/* Voice Alert Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950/60 px-2 sm:px-2.5 py-1 rounded-md border border-slate-800">
            <input
              id="chk_voice_alerts"
              type="checkbox"
              checked={voiceAlertsOn}
              onChange={(e) => {
                setVoiceAlertsOn(e.target.checked);
                addLog(`Thai Voice Alerts toggled ${e.target.checked ? 'ON' : 'OFF'}`, 'system');
              }}
              className="accent-cyan-500 cursor-pointer h-3.5 w-3.5 rounded"
            />
            <span className="text-slate-300 font-bold text-[10px] sm:text-[11px]">เสียงไทย</span>
          </label>

          {/* Metronome Bar */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800 max-w-full">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                id="chk_metronome"
                type="checkbox"
                checked={metronomeOn}
                onChange={(e) => setMetronomeOn(e.target.checked)}
                className="accent-cyan-500 cursor-pointer h-3.5 w-3.5 rounded"
              />
              <span className="flex items-center gap-1 text-slate-300 font-bold text-[10px] sm:text-[11px]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    cprActive && metronomeOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                Metronome ({metronomeTempo})
              </span>
            </label>

            {/* Mode Switch 30:2 vs Continuous */}
            <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-800 ml-1">
              <button
                id="btn_metronome_mode_30_2"
                onClick={() => {
                  setMetronomeMode('30:2');
                  speakThai('ตั้งค่าเมโทรนอม แบบ สามสิบ ต่อ สอง เรียบร้อยแล้วค่ะ');
                }}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                  metronomeMode === '30:2'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30:2
              </button>
              <button
                id="btn_metronome_mode_continuous"
                onClick={() => {
                  setMetronomeMode('continuous');
                  speakThai('ตั้งค่าเมโทรนอม แบบ ต่อเนื่อง เรียบร้อยแล้วค่ะ');
                }}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                  metronomeMode === 'continuous'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ต่อเนื่อง
              </button>
            </div>

            {/* BPM Presets */}
            <div className="hidden sm:flex items-center gap-1 ml-1">
              {[100, 110, 120].map((bpm) => (
                <button
                  key={bpm}
                  id={`btn_metronome_${bpm}`}
                  onClick={() => {
                    setMetronomeTempo(bpm);
                    speakThai(`ปรับจังหวะเมโทรนอมเป็น ${bpm} ครั้งต่อนาทีแล้วค่ะ`);
                  }}
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-black rounded border transition-all cursor-pointer ${
                    metronomeTempo === bpm
                      ? 'bg-cyan-700 text-white border-cyan-500'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  {bpm}
                </button>
              ))}
            </div>

            {/* Live Beat Badge */}
            {cprActive && metronomeOn && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-black text-[10px] border border-emerald-800 flex items-center gap-1 animate-pulse">
                <Heart className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                {metronomeMode === '30:2'
                  ? metronomeBeat >= 1 && metronomeBeat <= 30
                    ? `30:2 (${metronomeBeat})`
                    : `หายใจ (${metronomeBeat === 31 ? '1/2' : '2/2'})`
                  : `Beat ${metronomeBeat}`}
              </span>
            )}
          </div>

          {/* PALS Pediatric Calculator Button */}
          <button
            id="btn_pals_calc_control"
            onClick={onOpenPalsModal}
            title="Open PALS Pediatric Emergency Calculator"
            className="px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 hover:to-slate-800 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 group shrink-0"
          >
            <Baby className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-black font-mono tracking-tight text-cyan-200">
              PALS Calc.
            </span>
            <span className="hidden xl:inline-block px-1 py-0.2 rounded text-[8px] font-mono bg-cyan-900 text-cyan-300 border border-cyan-700">
              Pediatric
            </span>
          </button>

          {/* Med etc. ACLS/PALS Button */}
          <div className="relative">
            <button
              id="btn_alt_meds_control"
              onClick={() => setShowAltMedsPopover(!showAltMedsPopover)}
              title="Med etc. ACLS/PALS (50%MgSO4, 7.5%NaHCO3, 10%Ca Gluconate, Naloxone, RI+50%Dext.)"
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 border shadow-md active:scale-95 shrink-0 ${
                mgSo4AlertActive
                  ? 'bg-gradient-to-r from-purple-800 to-pink-900 text-amber-200 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse ring-2 ring-amber-400'
                  : showAltMedsPopover
                  ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-gradient-to-r from-purple-950 to-slate-900 hover:from-purple-900 hover:to-slate-800 text-purple-300 hover:text-white border border-purple-500/50 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
              }`}
            >
              <Syringe className="w-3.5 h-3.5 text-purple-400 animate-pulse shrink-0" />
              <span className="tracking-tight text-purple-200">
                {mgSo4AlertActive ? 'Med etc. (MgSO4 ⚠️)' : 'Med etc.'}
              </span>
              <ChevronDown className={`w-3 h-3 text-purple-300 transition-transform ${showAltMedsPopover ? 'rotate-180' : ''}`} />
            </button>

            {/* MODAL DIALOG FOR ALTERNATIVE RESUSCITATION MEDS (Rendered in foreground) */}
            {showAltMedsPopover && (
              <div
                className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
                onClick={() => setShowAltMedsPopover(false)}
              >
                <div
                  className="bg-slate-900 border border-purple-500/60 rounded-2xl w-full max-w-lg sm:max-w-xl p-3.5 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 text-left relative z-10 my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-purple-900/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      <h3 className="text-sm sm:text-base font-black font-mono text-purple-200">
                        Med etc. ({ALT_RESUSCITATION_MEDS.length} รายการ)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastLoggedMed ? (
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-800 animate-pulse flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> ✓ ให้ยา {lastLoggedMed} แล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                          1-Click Administer
                        </span>
                      )}
                      <button
                        onClick={() => setShowAltMedsPopover(false)}
                        className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-purple-300/80 font-medium -mt-1">
                    ยาช่วยชีวิตเสริมและยารักษาภาวะฉุกเฉินทางคลินิก (AHA ACLS/PALS 2025)
                  </p>

                  {/* 6 Alternative Drug Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] sm:max-h-[380px] overflow-y-auto pr-1">
                    {ALT_RESUSCITATION_MEDS.map((med) => {
                      const isMgHighlight = med.id === 'mgso4' && mgSo4AlertActive;
                      return (
                        <div
                          key={med.id}
                          className={`flex items-center gap-1.5 bg-slate-950/90 border rounded-xl p-1.5 transition-all shadow-md group ${
                            isMgHighlight
                              ? 'border-amber-400 ring-2 ring-amber-400/80 bg-purple-950/90 animate-pulse'
                              : 'border-purple-900/60 hover:border-purple-500/80'
                          }`}
                        >
                          <button
                            id={`btn_alt_med_${med.id}`}
                            onClick={() => handleAdministerAltMed(med)}
                            title={`คลิกเพื่อเลือกใช้ยา ${med.name} (${med.dose})`}
                            className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-black font-mono transition-all cursor-pointer flex items-center justify-between gap-1 active:scale-95 text-left ${med.colorClass}`}
                          >
                            <span className="truncate">{med.shortName}</span>
                            {isMgHighlight && (
                              <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5 shrink-0 animate-bounce">
                                ⭐ Recommended
                              </span>
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedDetail(med);
                            }}
                            title="ดูรายละเอียดขนาดยาและข้อบ่งชี้ทางคลินิก"
                            className="p-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/60 bg-slate-800/80 border border-purple-800/50 shrink-0 cursor-pointer active:scale-95 transition-all"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-400">
                    <span>AHA ACLS/PALS Guideline 2025</span>
                    <button
                      onClick={() => setShowAltMedsPopover(false)}
                      className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200 font-bold cursor-pointer transition-colors text-xs"
                    >
                      ปิดหน้าต่าง
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Procedures Button & Pop-up Modal */}
          <div className="relative">
            <button
              id="btn_procedures_control"
              onClick={() => setShowProceduresModal && setShowProceduresModal(!showProceduresModal)}
              title="Procedures & Critical Interventions (IV/IO Access, Advanced Airway, ETCO2, etc.)"
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 border shadow-md active:scale-95 shrink-0 ${
                showProceduresModal
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : isProceduresFlashing
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-300 animate-pulse ring-2 ring-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                  : 'bg-gradient-to-r from-amber-950 to-slate-900 hover:from-amber-900 hover:to-slate-800 text-amber-300 hover:text-white border border-amber-500/50 hover:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
              }`}
            >
              <Stethoscope className={`w-3.5 h-3.5 text-amber-400 shrink-0 ${isProceduresFlashing ? 'animate-bounce' : ''}`} />
              <span className="tracking-tight text-amber-200">Procedures</span>
              {isProceduresFlashing && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            {/* PROCEDURES MODAL POP-UP */}
            {showProceduresModal && (
              <div
                className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
                onClick={() => setShowProceduresModal && setShowProceduresModal(false)}
              >
                <div
                  className="bg-slate-900 border border-amber-500/60 rounded-2xl w-full max-w-lg sm:max-w-xl p-3.5 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 text-left relative z-10 my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-amber-900/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-amber-400 shrink-0" />
                      <h3 className="text-sm sm:text-base font-black font-mono text-amber-200">
                        Procedures & Interventions (บันทึกหัตถการ)
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowProceduresModal && setShowProceduresModal(false)}
                      className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* ACTIVE ALERT GUIDANCE NOTICE */}
                  {isProceduresFlashing && (
                    <div className="bg-amber-950/90 border border-amber-500/80 rounded-xl p-3 text-amber-200 text-xs space-y-1.5 animate-pulse shadow-md">
                      <div className="flex items-center gap-1.5 font-black text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>⚡ แจ้งเตือนหัตถการแนะนำตามเกณฑ์ ACLS:</span>
                      </div>
                      <div className="text-[11px] text-amber-100/90 space-y-0.5 pl-5">
                        {ivAccessAlertActive && (
                          <p>• <strong>IV / IO Access:</strong> เปิดเส้นทางให้ยาก่อนบริหารยา Epinephrine</p>
                        )}
                        {airwayAlertActive && (
                          <p>• <strong>Advanced Airway:</strong> ใส่ท่อช่วยหายใจขั้นสูง (ET Tube)</p>
                        )}
                        {etco2AlertActive && (
                          <p>• <strong>ETCO2 Capnography:</strong> ติดตามตำแหน่งท่อช่วยหายใจ (ปรับ CPR แบบต่อเนื่อง)</p>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-amber-300/80 font-medium -mt-1">
                    คลิกเพื่อบันทึกหัตถการฉุกเฉินและการรักษาขั้นสูง (AHA ACLS 2025)
                  </p>

                  {/* PROCEDURE PRESETS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] sm:max-h-[380px] overflow-y-auto pr-1">
                    {PROCEDURE_PRESETS.map((proc) => {
                      const isDone = completedProcedures?.includes(proc.name);

                      const isIvProc = proc.name.includes('IV / IO') || proc.short === 'IV Access';
                      const isAirwayProc = proc.name.includes('Advanced Airway') || proc.short === 'Airway Secured';
                      const isEtco2Proc = proc.name.includes('Intubation Confirmed') || proc.short === 'ETCO2 Confirmed';

                      const isFlashIv = isIvProc && ivAccessAlertActive && !isDone;
                      const isFlashAirway = isAirwayProc && airwayAlertActive && !isDone;
                      const isFlashEtco2 = isEtco2Proc && etco2AlertActive && !isDone && !airwayAlertActive;
                      const isFlashing = isFlashIv || isFlashAirway || isFlashEtco2;

                      let btnStyle = isDone
                        ? 'bg-emerald-950/90 border-emerald-700 text-emerald-300'
                        : isFlashing
                        ? 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-white font-black animate-pulse ring-2 ring-amber-400 shadow-md'
                        : 'bg-slate-950/90 hover:bg-slate-800 border-amber-900/40 text-slate-200';

                      return (
                        <button
                          key={proc.name}
                          onClick={() => {
                            if (handleLogProcedure) handleLogProcedure(proc.name);
                          }}
                          className={`p-3 rounded-xl text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between border active:scale-95 shadow-md ${btnStyle}`}
                        >
                          <div>
                            <span className="block font-black font-mono text-sm">{proc.short}</span>
                            <span className="text-[10px] opacity-80 block font-sans font-normal">{proc.name}</span>
                            {isFlashing && (
                              <span className="text-[9px] font-mono text-amber-200 block font-bold mt-1">
                                ⚡ แนะนำให้บันทึกหัตถการนี้
                              </span>
                            )}
                          </div>
                          {isDone ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-2 py-1 rounded-md border border-emerald-700 shrink-0 ml-1">
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> ทำแล้ว
                            </span>
                          ) : isFlashing ? (
                            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0 ml-1 animate-bounce" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-mono text-slate-400">
                    <span>AHA ACLS/PALS Guideline 2025</span>
                    <button
                      onClick={() => setShowProceduresModal && setShowProceduresModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-200 font-bold cursor-pointer transition-colors text-xs"
                    >
                      ปิดหน้าต่าง
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <span
            id="badge_aha_guideline_2025"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wide bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            AHA GUIDELINE 2025
          </span>
          <button
            id="btn_new_case"
            onClick={confirmNewCase}
            className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Case</span>
          </button>
          <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Offline Ready
          </span>
        </div>
      </div>

      {/* Drug Info Modal */}
      {selectedMedDetail && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/50 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black text-purple-200 font-mono">
                  {selectedMedDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMedDetail(null)}
                className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-mono">ขนาดยามาตรฐาน (Standard Dose):</span>
                <span className="text-amber-300 font-mono font-bold text-sm block mt-0.5">
                  {selectedMedDetail.dose}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-mono">ข้อบ่งชี้ทางคลินิก (Indication):</span>
                <span className="text-purple-200 font-semibold block mt-0.5">
                  {selectedMedDetail.indication}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedMedDetail(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => {
                  handleAdministerAltMed(selectedMedDetail);
                  setSelectedMedDetail(null);
                }}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/50 flex items-center justify-center gap-1 active:scale-95"
              >
                <span>ให้ยา {selectedMedDetail.shortName}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

