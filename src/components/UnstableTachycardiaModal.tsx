import React from 'react';
import { createPortal } from 'react-dom';
import { Zap, X, Activity, ShieldAlert, CheckCircle2, Syringe, PhoneCall, HeartPulse } from 'lucide-react';
import { SvtEkgIcon, AfibEkgIcon, AflutterEkgIcon } from './EkgIcons';

interface UnstableTachycardiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedProcedures?: string[];
  amioCount?: number;
  handleLogProcedure: (procName: string) => void;
  handleLogPresetMed?: (medName: string, skipSpeech?: boolean, onSpeechEnd?: () => void) => void;
  handleDeliverShock?: () => void;
  triggerReassessmentAlert?: (procName: string, speechMsg: string, isCardioversion?: boolean) => void;
  speakThai: (text: string, onEnd?: () => void, customRate?: number) => void;
  addLog?: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
}

export function UnstableTachycardiaModal({
  isOpen,
  onClose,
  completedProcedures = [],
  amioCount = 0,
  handleLogProcedure,
  handleLogPresetMed,
  handleDeliverShock,
  triggerReassessmentAlert,
  speakThai,
  addLog,
}: UnstableTachycardiaModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(244,63,94,0.3)] overflow-hidden relative text-white transform transition-all duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-rose-950/90 to-slate-950 px-3.5 py-2 sm:py-2.5 border-b border-rose-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <Zap className="w-4.5 h-4.5 animate-pulse text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-rose-100 tracking-wide flex items-center gap-1.5">
                  Unstable Tachycardia Management
                </h3>
                <span className="text-[8.5px] bg-rose-950 text-rose-200 border border-rose-600/80 px-1.5 py-0.2 rounded-full font-mono font-bold animate-pulse">
                  EMERGENCY PROTOCOL
                </span>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-rose-300/90 font-medium leading-tight">
                <span>การรักษาผู้ป่วยชีพจรเต้นเร็วสภาวะไม่คงที่ (HR ≥ 150 bpm + Unstable Signs)</span>
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
            <div className="text-[11px] font-black uppercase text-rose-400 tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
              <span>เลือกการปฏิบัติการรักษา (Select Treatment Action)</span>
              <span className="text-[9.5px] text-slate-400 normal-case font-normal">AHA Guidelines 2025</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
              
              {/* 1. Sedation */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogProcedure('Sedation (Midazolam 2.5mg)');
                    handleLogPresetMed('Midazolam 2.5mg IV (Sedation)', false);
                  }}
                  className={`py-1.5 px-2.5 sm:py-2 sm:px-3 border rounded-xl text-left transition-all flex flex-col justify-between gap-1 shadow-md cursor-pointer group w-full ${
                    completedProcedures.includes('Sedation (Midazolam 2.5mg)') || completedProcedures.includes('Midazolam 2.5mg IV (Sedation)')
                      ? 'bg-purple-950/60 border-purple-500 text-purple-100'
                      : 'bg-slate-900 hover:bg-slate-850 border-purple-800/80 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Syringe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-purple-300">
                        1. Sedation (Midazolam 2.5mg IV)
                      </span>
                    </div>
                    {completedProcedures.includes('Sedation (Midazolam 2.5mg)') || completedProcedures.includes('Midazolam 2.5mg IV (Sedation)') ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                    ) : (
                      <span className="text-[8.5px] font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-purple-300 shrink-0">
                        SEDATIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[10.5px] text-slate-300 font-normal leading-tight w-full">
                    ให้ยาระงับประสาทก่อนทำ Synchronized Cardioversion หากผู้ป่วยรู้สึกตัวดี
                  </p>
                </button>
              )}

              {/* 2. Sync. Cardiovertion 100J */}
              <button
                onClick={() => {
                  handleLogProcedure('Synchronized Cardioversion 100J Delivered');
                  triggerReassessmentAlert?.('Synchronized Cardioversion 100J', 'ทำคาดิโอเวอชั่น 100 จูน เรียบร้อยค่ะ', true);
                }}
                className={`py-1.5 px-2.5 sm:py-2 sm:px-3 border rounded-xl text-left transition-all flex flex-col justify-between gap-1 shadow-md cursor-pointer group w-full ${
                  completedProcedures.includes('Synchronized Cardioversion 100J Delivered') || completedProcedures.includes('Synchronized Cardioversion 100J')
                    ? 'bg-indigo-950/80 border-indigo-400 text-indigo-100'
                    : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 hover:from-indigo-900 hover:to-indigo-950 border-indigo-600/80 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Zap className="w-3.5 h-3.5 text-yellow-300 shrink-0 animate-pulse" />
                    <span className="text-xs sm:text-sm font-black text-indigo-100 group-hover:text-white whitespace-nowrap">
                      2. Sync. Cardiovertion 100J
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono bg-indigo-950 border border-indigo-500 text-yellow-300 px-1.5 py-0.5 rounded font-bold shrink-0">
                    CARDIOVERT 100J
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                  <p className="text-[10px] sm:text-[10.5px] text-indigo-200/90 font-normal leading-tight">
                    SVT, Monomorphic VT (Narrow/Wide Reg.)
                  </p>
                  <SvtEkgIcon className="w-8 h-4.5 shrink-0" />
                </div>
              </button>

              {/* 3. Sync. Cardiovertion 200J */}
              <button
                onClick={() => {
                  handleLogProcedure('Synchronized Cardioversion 200J Delivered');
                  triggerReassessmentAlert?.('Synchronized Cardioversion 200J', 'ทำคาดิโอเวอชั่น 200 จูน เรียบร้อยค่ะ', true);
                }}
                className={`py-1.5 px-2.5 sm:py-2 sm:px-3 border rounded-xl text-left transition-all flex flex-col justify-between gap-1 shadow-md cursor-pointer group w-full ${
                  completedProcedures.includes('Synchronized Cardioversion 200J Delivered') || completedProcedures.includes('Synchronized Cardioversion 200J')
                    ? 'bg-indigo-950/80 border-indigo-400 text-indigo-100'
                    : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 hover:from-indigo-900 hover:to-indigo-950 border-indigo-600/80 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Zap className="w-3.5 h-3.5 text-yellow-300 shrink-0 animate-pulse" />
                    <span className="text-xs sm:text-sm font-black text-indigo-100 group-hover:text-white whitespace-nowrap">
                      3. Sync. Cardiovertion 200J
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono bg-indigo-950 border border-indigo-500 text-yellow-300 px-1.5 py-0.5 rounded font-bold shrink-0">
                    CARDIOVERT 200J
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                  <p className="text-[10px] sm:text-[10.5px] text-indigo-200/90 font-normal leading-tight">
                    AF(Atrail Fibrillation), AFlutt(Atrail Flutter) (Narrow Irreg.)
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <AfibEkgIcon className="w-7 h-4.5 shrink-0" />
                    <AflutterEkgIcon className="w-7 h-4.5 shrink-0" />
                  </div>
                </div>
              </button>

              {/* 4. Defibrillation 200J (Unsynchronized) */}
              <button
                onClick={() => {
                  handleDeliverShock?.();
                  triggerReassessmentAlert?.('Defibrillation 200J', 'ช็อคเดฟิบบริลเลชั่น 200 จูน เรียบร้อยค่ะ');
                  addLog?.('Delivered Unsynchronized Defibrillation 200J for Polymorphic VT', 'shock');
                }}
                className={`py-1.5 px-2.5 sm:py-2 sm:px-3 border rounded-xl text-left transition-all flex flex-col justify-between gap-1 shadow-md cursor-pointer group w-full ${
                  completedProcedures.includes('Defibrillation 200J Delivered')
                    ? 'bg-rose-950/80 border-rose-400 text-rose-100'
                    : 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 hover:from-rose-900 hover:to-rose-950 border-rose-600/80 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Zap className="w-3.5 h-3.5 text-yellow-300 shrink-0 animate-pulse" />
                    <span className="text-xs sm:text-sm font-black text-rose-100 group-hover:text-white">
                      4. Defibrillation 200J (Unsynchronized)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[8.5px] font-mono bg-rose-950 border border-rose-500 text-yellow-300 px-1.5 py-0.5 rounded font-bold">
                      DEFIB 200J
                    </span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-[10.5px] text-rose-200/90 font-normal leading-tight w-full">
                  Polymorphic VT / Torsades de Pointes หรือกรณีไม่สามารถ Sync ได้
                </p>
              </button>

              {/* 5. Amiodarone 150mg IV */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogProcedure('Amiodarone 150mg IV over 10 min');
                    handleLogPresetMed('Amiodarone 150mg IV over 10 min', false, () => {
                      triggerReassessmentAlert?.('Amiodarone 150mg IV over 10 min', undefined, true);
                    });
                  }}
                  className={`py-1.5 px-2.5 sm:py-2 sm:px-3 border rounded-xl text-left transition-all flex flex-col justify-between gap-1 shadow-md cursor-pointer group w-full ${
                    amioCount > 0 || completedProcedures.includes('Amiodarone 150mg IV over 10 min')
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-100'
                      : 'bg-slate-900 hover:bg-slate-850 border-cyan-800/80 hover:border-cyan-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Syringe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-cyan-300">
                        5. Amiodarone 150mg IV over 10 min
                      </span>
                      <span className="text-[8.5px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300 px-1.5 py-0.2 rounded shrink-0">
                        #{amioCount}
                      </span>
                    </div>
                    {amioCount > 0 || completedProcedures.includes('Amiodarone 150mg IV over 10 min') ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
                    ) : (
                      <span className="text-[8.5px] font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-cyan-300 shrink-0">
                        INFUSE 150mg
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[10.5px] text-slate-300 font-normal leading-tight w-full">
                    หยดเข้าทางหลอดเลือดดำนาน 10 นาที
                  </p>
                </button>
              )}

              {/* 6. Expert Consult */}
              <button
                onClick={() => {
                  handleLogProcedure('Expert Consult');
                  speakThai('ปรึกษาแพทย์ผู้เชี่ยวชาญ เรียบร้อยค่ะ');
                }}
                className={`py-1.5 px-2.5 sm:py-2 sm:px-3 border rounded-xl text-left transition-all flex flex-col justify-between gap-1 shadow-md cursor-pointer group w-full ${
                  completedProcedures.includes('Expert Consult') || completedProcedures.includes('Observe & Expert Consult')
                    ? 'bg-rose-950/60 border-rose-500 text-rose-100'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <PhoneCall className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-rose-300">
                      6. Expert Consult / Cardiology
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono text-rose-400 border border-slate-700 px-1.5 py-0.5 rounded bg-slate-900 shrink-0">
                    CONSULT
                  </span>
                </div>
                <p className="text-[10px] sm:text-[10.5px] text-slate-300 font-normal leading-tight w-full">
                  ปรึกษาแพทย์ผู้เชี่ยวชาญด้านโรคหัวใจหรืออายุรแพทย์วิกฤตโดยด่วน
                </p>
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
