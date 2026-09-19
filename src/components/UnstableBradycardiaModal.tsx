import React from 'react';
import { createPortal } from 'react-dom';
import { Activity, X, Zap, ShieldAlert, CheckCircle2, Syringe, PhoneCall } from 'lucide-react';
import { FirstDegreeAvBlockIcon, MobitzTwoEkgIcon, CompleteHeartBlockEkgIcon } from './EkgIcons';

interface UnstableBradycardiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  atropineCount: number;
  handleLogPresetMed: (medName: string, skipSpeech?: boolean, onSpeechEnd?: () => void) => void;
  handleLogProcedure: (procName: string) => void;
  triggerReassessmentAlert?: (procName: string, speechMsg?: string, skipLog?: boolean) => void;
  speakThai: (text: string, onEnd?: () => void, customRate?: number) => void;
  addLog?: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
}

export function UnstableBradycardiaModal({
  isOpen,
  onClose,
  atropineCount,
  handleLogPresetMed,
  handleLogProcedure,
  triggerReassessmentAlert,
  speakThai,
  addLog,
}: UnstableBradycardiaModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden relative text-white transform transition-all duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-amber-950/80 to-slate-950 px-3.5 py-2 sm:py-2.5 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Activity className="w-4.5 h-4.5 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-amber-100 tracking-wide flex items-center gap-1.5">
                  Unstable Bradycardia Management
                </h3>
                <span className="text-[8.5px] bg-rose-950 text-rose-200 border border-rose-600/80 px-1.5 py-0.2 rounded-full font-mono font-bold animate-pulse">
                  EMERGENCY
                </span>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-amber-300/90 font-medium leading-tight">
                <span>การรักษาผู้ป่วยชีพจรช้าไม่คงที่ (HR &lt; 50 bpm + Unstable Signs)</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-2.5 sm:p-3 space-y-2 max-h-[85vh] overflow-y-auto">
          {/* Action Choice Grid */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
              <span>เลือกการรักษาที่ต้องการบริหาร (Select Treatment)</span>
              <span className="text-[9.5px] text-slate-400 normal-case font-normal">AHA Guidelines 2025</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
              
              {/* 1. Atropine 1mg IV */}
              <button
                onClick={() => {
                  handleLogPresetMed('Atropine 1mg IV', false, () => {
                    triggerReassessmentAlert?.('Atropine 1mg IV', undefined, true);
                  });
                }}
                disabled={atropineCount >= 3}
                className={`py-2 px-3 border rounded-xl text-left transition-all flex flex-col justify-between gap-1 shadow-md ${
                  atropineCount >= 3
                    ? 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-slate-900 hover:from-amber-900 hover:to-amber-950 border-amber-600/80 hover:border-amber-400 cursor-pointer group'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Syringe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-amber-100 group-hover:text-amber-50 whitespace-nowrap">
                      1. Atropine 1mg IV Bolus
                    </span>
                    <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                      atropineCount >= 3
                        ? 'text-rose-400 bg-rose-950 border-rose-800'
                        : 'text-amber-200 bg-amber-900/80 border-amber-600'
                    }`}>
                      {atropineCount >= 3 ? 'MAX 3mg REACHED' : `DOSE #${atropineCount + 1}`}
                    </span>
                  </div>
                  <FirstDegreeAvBlockIcon className="w-8 h-4.5 shrink-0" />
                </div>
                <p className="text-[10px] sm:text-[10.5px] text-amber-200/80 font-normal leading-tight">
                  ยาอันดับแรก: 1 mg IV ทุก 3-5 นาที (ขนาดยารวมสูงสุด 3 mg)
                </p>
              </button>

              {/* 2. Transcutaneous Pacing (TCP) */}
              <button
                onClick={() => {
                  handleLogProcedure('Transcutaneous Pacing (TCP) Started');
                  triggerReassessmentAlert?.('Transcutaneous Pacing (TCP)', 'เริ่มทำเพ๊สซิ่งผ่านผิวหนัง เรียบร้อยค่ะ', true);
                }}
                className="py-2 px-3 bg-gradient-to-r from-amber-950 via-amber-900/90 to-amber-950 hover:from-amber-900 hover:to-amber-800 border-2 border-amber-500 hover:border-amber-400 text-amber-100 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-1 shadow-lg group relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-amber-50 group-hover:text-white whitespace-nowrap">
                      2. Transcutaneous Pacing (TCP)
                    </span>
                  </div>
                  <span className="text-[8.5px] bg-yellow-400 text-slate-950 font-black px-1.5 py-0.5 rounded border border-yellow-300 shrink-0">
                    IMMEDIATE PACING
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                  <p className="text-[10px] sm:text-[10.5px] text-amber-200/90 font-normal leading-tight">
                    เริ่มทำ Pacing ทันทีหาก Atropine ไม่ได้ผล หรือพบ:
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <MobitzTwoEkgIcon className="w-7 h-4.5 shrink-0" />
                    <CompleteHeartBlockEkgIcon className="w-7 h-4.5 shrink-0" />
                  </div>
                </div>
              </button>

              {/* Grid for Dopamine & Epinephrine Drips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                {/* 3. Dopamine Drip */}
                <button
                  onClick={() => {
                    handleLogPresetMed('Dopamine Drip 5-20 mcg/kg/min', false, () => {
                      triggerReassessmentAlert?.('Dopamine Drip', undefined, true);
                    });
                  }}
                  className="py-1.5 px-2.5 sm:py-2 sm:px-3 bg-slate-900 hover:bg-slate-800 border border-amber-600/50 hover:border-amber-400 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-md group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black text-slate-100 group-hover:text-amber-300">
                      3. Dopamine Drip
                    </span>
                    <span className="text-[8.5px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700 px-1.5 py-0.2 rounded">
                      IV Infusion
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-normal leading-tight">
                    อัตราหยด 5 - 20 mcg/kg/min (ปรับตามการตอบสนอง)
                  </p>
                </button>

                {/* 4. Epinephrine Drip */}
                <button
                  onClick={() => {
                    handleLogPresetMed('Epinephrine Drip 2-10 mcg/min', false, () => {
                      triggerReassessmentAlert?.('Epinephrine Drip', undefined, true);
                    });
                  }}
                  className="py-1.5 px-2.5 sm:py-2 sm:px-3 bg-slate-900 hover:bg-slate-800 border border-amber-600/50 hover:border-amber-400 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-md group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black text-slate-100 group-hover:text-amber-300">
                      4. Epinephrine Drip
                    </span>
                    <span className="text-[8.5px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700 px-1.5 py-0.2 rounded">
                      IV Infusion
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-normal leading-tight">
                    อัตราหยด 2 - 10 mcg/min (ปรับตามการตอบสนอง)
                  </p>
                </button>
              </div>

              {/* 5. Expert Consultation & Transvenous Pacing Prep */}
              <button
                onClick={() => {
                  handleLogProcedure('Expert Consultation & Transvenous Pacing Prep Requested');
                  speakThai('ปรึกษาผู้เชี่ยวชาญ และเตรียมทำ ทรานส์เวนัส เพ๊สซิ่ง เรียบร้อยค่ะ');
                }}
                className="py-1.5 px-2.5 sm:py-2 sm:px-3 bg-slate-950 hover:bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      5. Expert Consultation / Transvenous Pacing Prep
                    </span>
                    <span className="text-[9.5px] text-slate-400 block leading-tight">
                      ปรึกษาแพทย์เฉพาะทางโรคหัวใจ และเตรียมทำ Transvenous Pacing
                    </span>
                  </div>
                </div>
                <span className="text-[8.5px] font-mono text-amber-400 border border-slate-700 px-2 py-0.5 rounded bg-slate-900 shrink-0">
                  CONSULT
                </span>
              </button>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-3.5 py-2 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง (Close)
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
