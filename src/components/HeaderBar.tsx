import React, { useState } from 'react';
import { Activity, Clock, Heart, Baby, Syringe, ChevronDown, Plus, Info, Sparkles, Check } from 'lucide-react';
import { ALT_RESUSCITATION_MEDS, AltMedItem } from '../data/altMeds';
import { AppLogo } from './AppLogo';

interface HeaderBarProps {
  systemTime: string;
  caseActive: boolean;
  caseElapsedSeconds: number;
  cprCycle: number;
  cprSubCycle302: number;
  formatMMSS: (sec: number) => string;
  onOpenPalsModal: () => void;
  handleLogPresetMed?: (medName: string, skipSpeech?: boolean) => void;
  addLog?: (text: string, type: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  speakThai?: (text: string, onEnd?: () => void, customRate?: number) => void;
}

export function HeaderBar({
  systemTime,
  caseActive,
  caseElapsedSeconds,
  cprCycle,
  cprSubCycle302,
  formatMMSS,
  onOpenPalsModal,
  handleLogPresetMed,
  addLog,
  speakThai,
}: HeaderBarProps) {
  const [showAltMedsPopover, setShowAltMedsPopover] = useState<boolean>(false);
  const [lastLoggedMed, setLastLoggedMed] = useState<string | null>(null);
  const [selectedMedDetail, setSelectedMedDetail] = useState<AltMedItem | null>(null);

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

    setLastLoggedMed(med.shortName);
    setTimeout(() => setLastLoggedMed(null), 3000);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-4 py-2 flex items-center justify-between shadow-xl shrink-0 h-14 z-30 relative">
      {/* Brand & Emblem */}
      <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/40 p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-slate-800/80 shadow-inner relative">
        <AppLogo size="md" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 font-mono">
              SMART ACLS COPILOT
            </h1>
          </div>
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5 hidden sm:block">
            Critical Care Resuscitation System
          </p>
        </div>

        {/* HEADER ACTIONS GROUP: PALS Calc + กลุ่มยาทางเลือก */}
        <div className="flex items-center gap-1.5 ml-1 sm:ml-2 relative">
          {/* PALS Pediatric Calculator Header Button */}
          <button
            id="btn_pals_calc_header"
            onClick={onOpenPalsModal}
            title="Open PALS Pediatric Emergency Calculator"
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 hover:to-slate-800 text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 group shrink-0"
          >
            <Baby className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black font-mono tracking-tight text-cyan-200">
              PALS Calc
            </span>
            <span className="hidden xl:inline-block px-1 py-0.2 rounded text-[8px] font-mono bg-cyan-900 text-cyan-300 border border-cyan-700">
              Pediatric
            </span>
          </button>

          {/* MED etc. ACLS/PALS Header Button */}
          <button
            id="btn_alt_meds_header"
            onClick={() => setShowAltMedsPopover(!showAltMedsPopover)}
            title="MED etc. ACLS/PALS (50%MgSO4, 7.5%NaHCO3, 10%Ca Gluconate, Naloxone, RI+50%Dext.)"
            className={`px-2 sm:px-2.5 py-1.5 rounded-lg font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shadow-md active:scale-95 shrink-0 ${
              showAltMedsPopover
                ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-gradient-to-r from-purple-950 to-slate-900 hover:from-purple-900 hover:to-slate-800 text-purple-300 hover:text-white border border-purple-500/50 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
            }`}
          >
            <Syringe className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
            <span className="tracking-tight text-purple-200">MED etc.</span>
            <ChevronDown className={`w-3.5 h-3.5 text-purple-300 transition-transform ${showAltMedsPopover ? 'rotate-180' : ''}`} />
          </button>

          {/* DROPDOWN POPOVER FOR ALTERNATIVE RESUSCITATION MEDS */}
          {showAltMedsPopover && (
            <div className="fixed top-14 inset-x-2 sm:absolute sm:top-full sm:left-0 sm:inset-x-auto w-auto sm:w-[520px] max-w-[95vw] sm:max-w-[520px] bg-slate-950/98 border border-purple-500/60 rounded-xl p-2 sm:p-2.5 shadow-2xl z-50 backdrop-blur-md animate-fadeIn">
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-black font-mono text-purple-200">
                    MED etc. ({ALT_RESUSCITATION_MEDS.length} รายการ)
                  </span>
                </div>
                {lastLoggedMed ? (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-800 animate-pulse flex items-center gap-1">
                    <Check className="w-3 h-3" /> ✓ {lastLoggedMed}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-400">
                    1-Click Administer
                  </span>
                )}
              </div>

              {/* 6 Alternative Drug Cards Grid */}
              <div className="grid grid-cols-2 gap-1.5 max-h-[65vh] sm:max-h-[380px] overflow-y-auto pr-0.5">
                {ALT_RESUSCITATION_MEDS.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center gap-1 bg-slate-900/90 border border-purple-900/50 rounded-lg p-1 hover:border-purple-500/60 transition-all shadow-sm"
                  >
                    <button
                      id={`btn_header_alt_med_${med.id}`}
                      onClick={() => handleAdministerAltMed(med)}
                      title={`คลิกเพื่อเลือกใช้ยา ${med.name} (${med.dose})`}
                      className={`flex-1 py-2 px-2.5 rounded-md text-[11px] sm:text-xs font-black font-mono transition-all cursor-pointer flex items-center justify-between gap-1 active:scale-95 text-left ${med.colorClass}`}
                    >
                      <span className="truncate">{med.shortName}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMedDetail(med);
                      }}
                      title="ดูรายละเอียดขนาดยาและข้อบ่งชี้ทางคลินิก"
                      className="p-2 rounded-md text-purple-300 hover:text-white hover:bg-purple-900/60 bg-slate-800/80 border border-purple-800/40 shrink-0 cursor-pointer active:scale-95 transition-all"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-purple-900/40 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>AHA ACLS/PALS Guideline 2025</span>
                <button
                  onClick={() => setShowAltMedsPopover(false)}
                  className="text-purple-300 hover:text-white font-bold underline cursor-pointer px-1 py-0.5"
                >
                  ปิด [✕]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Key Clinical Counters */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Elapsed Case Time */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div className="text-left">
            <span className="text-[8px] uppercase tracking-tight text-slate-400 font-bold block leading-none">
              Case Duration
            </span>
            <span id="total-time" className="text-sm sm:text-base font-mono font-black text-cyan-300 leading-none">
              {caseActive ? formatMMSS(caseElapsedSeconds) : '00:00'}
            </span>
          </div>
        </div>

        {/* CPR Round & Cycle counter */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
          <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 fill-rose-500/20" />
          <div className="text-left">
            <span className="text-[8px] uppercase tracking-tight text-slate-400 font-bold block leading-none">
              CPR Cycle
            </span>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-sm sm:text-base font-mono font-black text-rose-400">
                #{cprCycle}
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">
                ({cprSubCycle302}/5)
              </span>
            </div>
          </div>
        </div>

        {/* System Time Clock */}
        <div className="hidden lg:flex items-center justify-center bg-slate-950 text-slate-300 font-mono text-sm px-2.5 py-1 rounded-lg border border-slate-800 font-bold shadow-inner">
          {systemTime || '00:00:00'}
        </div>
      </div>

      {/* Drug Info Modal */}
      {selectedMedDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
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
    </header>
  );
}


