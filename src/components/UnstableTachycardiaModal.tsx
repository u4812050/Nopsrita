import React from 'react';
import { Zap, AlertTriangle, X, Activity, ShieldAlert, CheckCircle2, Syringe, PhoneCall, HeartPulse } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(244,63,94,0.3)] overflow-hidden relative text-white transform transition-all duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-rose-950/90 to-slate-950 p-3.5 sm:p-4 border-b border-rose-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <Zap className="w-6 h-6 animate-pulse text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-rose-100 tracking-wide flex items-center gap-1.5">
                  Unstable Tachycardia Management
                </h3>
                <span className="text-[9px] bg-rose-950 text-rose-200 border border-rose-600/80 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  EMERGENCY PROTOCOL
                </span>
              </div>
              <p className="text-xs text-rose-300/90 font-medium mt-0.5 flex items-center gap-1">
                <span>การรักษาผู้ป่วยชีพจรเต้นเร็วสภาวะไม่คงที่ (HR ≥ 150 bpm + Unstable Signs)</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Critical Warning Signs Banner */}
          <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 text-rose-100 text-xs space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 text-rose-300 font-bold border-b border-rose-500/30 pb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>ข้อบ่งชี้ Unstable Tachycardia (มีอาการวิกฤตอย่างน้อย 1 ข้อ):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-rose-200/90 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                Hypotension / Shock
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                Altered Mental Status (ซึม/สับสน)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                Ischemic Chest Pain
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                Acute Heart Failure
              </span>
              <span className="flex items-center gap-1 col-span-2 sm:col-span-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                Poor Tissue Perfusion
              </span>
            </div>
          </div>

          {/* Action Choice Grid */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
              <span>เลือกการปฏิบัติการรักษา (Select Treatment Action)</span>
              <span className="text-[10px] text-slate-400 normal-case font-normal">AHA Guidelines 2025</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              
              {/* 1. Sedation */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogProcedure('Sedation (Midazolam 2.5mg)');
                    handleLogPresetMed('Midazolam 2.5mg IV (Sedation)', false, () => {
                      addLog?.('Administered Sedation (Midazolam 2.5mg IV) prior to cardioversion', 'med');
                    });
                  }}
                  className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                    completedProcedures.includes('Sedation (Midazolam 2.5mg)') || completedProcedures.includes('Midazolam 2.5mg IV (Sedation)')
                      ? 'bg-purple-950/60 border-purple-500 text-purple-100'
                      : 'bg-slate-900 hover:bg-slate-800 border-purple-800/80 hover:border-purple-500'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-purple-300">
                        1. Sedation (Midazolam 2.5mg IV)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-normal">
                      ให้ยาระงับประสาทก่อนทำ Synchronized Cardioversion หากผู้ป่วยรู้สึกตัวดี
                    </p>
                  </div>
                  {completedProcedures.includes('Sedation (Midazolam 2.5mg)') || completedProcedures.includes('Midazolam 2.5mg IV (Sedation)') ? (
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-purple-300 shrink-0">
                      SEDATIVE
                    </span>
                  )}
                </button>
              )}

              {/* 2. Sync. Cardiovertion 100J */}
              <button
                onClick={() => {
                  handleLogProcedure('Synchronized Cardioversion 100J Delivered');
                  triggerReassessmentAlert?.('Synchronized Cardioversion 100J', 'ทำคาดิโอเวอชั่น 100 จูน เรียบร้อยค่ะ', true);
                  addLog?.('Delivered Synchronized Cardioversion 100J for Unstable Tachycardia', 'shock');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Synchronized Cardioversion 100J Delivered') || completedProcedures.includes('Synchronized Cardioversion 100J')
                    ? 'bg-indigo-950/80 border-indigo-400 text-indigo-100'
                    : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 hover:from-indigo-900 hover:to-indigo-950 border-indigo-600/80 hover:border-indigo-400'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-300 shrink-0 animate-pulse" />
                    <span className="text-xs sm:text-sm font-black text-indigo-100 group-hover:text-white">
                      2. Sync. Cardiovertion 100J (Narrow/Wide Reg.)
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-200/90 font-normal">
                    การช็อกไฟฟ้าแบบสัมพันธ์กับคลื่น R สำหรับ SVT หรือ Monomorphic VT 100 Joules
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <SvtEkgIcon className="w-12 h-7 shrink-0" />
                  <span className="text-[9px] font-mono bg-indigo-950 border border-indigo-500 text-yellow-300 px-2 py-1 rounded font-bold">
                    CARDIOVERT 100J
                  </span>
                </div>
              </button>

              {/* 3. Sync. Cardiovertion 200J */}
              <button
                onClick={() => {
                  handleLogProcedure('Synchronized Cardioversion 200J Delivered');
                  triggerReassessmentAlert?.('Synchronized Cardioversion 200J', 'ทำคาดิโอเวอชั่น 200 จูน เรียบร้อยค่ะ', true);
                  addLog?.('Delivered Synchronized Cardioversion 200J for Unstable Tachycardia', 'shock');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Synchronized Cardioversion 200J Delivered') || completedProcedures.includes('Synchronized Cardioversion 200J')
                    ? 'bg-indigo-950/80 border-indigo-400 text-indigo-100'
                    : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 hover:from-indigo-900 hover:to-indigo-950 border-indigo-600/80 hover:border-indigo-400'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-300 shrink-0 animate-pulse" />
                    <span className="text-xs sm:text-sm font-black text-indigo-100 group-hover:text-white">
                      3. Sync. Cardiovertion 200J (Narrow Irreg.)
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-200/90 font-normal">
                    การช็อกไฟฟ้าพลังงานสูงแบบสัมพันธ์กับคลื่น R สำหรับ Atrial Fibrillation / Atrial Flutter 200 Joules
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                  <AfibEkgIcon className="w-12 h-7 shrink-0" />
                  <AflutterEkgIcon className="w-12 h-7 shrink-0" />
                  <span className="text-[9px] font-mono bg-indigo-950 border border-indigo-500 text-yellow-300 px-2 py-1 rounded font-bold">
                    CARDIOVERT 200J
                  </span>
                </div>
              </button>

              {/* 4. Defibrillation 200J (Unsynchronized) */}
              <button
                onClick={() => {
                  handleDeliverShock?.();
                  triggerReassessmentAlert?.('Defibrillation 200J', 'ช็อคเดฟิบบริลเลชั่น 200 จูน เรียบร้อยค่ะ');
                  addLog?.('Delivered Unsynchronized Defibrillation 200J for Polymorphic VT', 'shock');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Defibrillation 200J Delivered')
                    ? 'bg-rose-950/80 border-rose-400 text-rose-100'
                    : 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 hover:from-rose-900 hover:to-rose-950 border-rose-600/80 hover:border-rose-400'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-300 shrink-0 animate-pulse" />
                    <span className="text-xs sm:text-sm font-black text-rose-100 group-hover:text-white">
                      4. Defibrillation 200J (Unsynchronized)
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 font-normal">
                    การช็อกไฟฟ้าแบบทันทีสำหรับ Polymorphic VT / Torsades de Pointes หรือกรณีไม่สามารถ Sync ได้
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-mono bg-rose-950 border border-rose-500 text-yellow-300 px-2 py-1 rounded font-bold">
                    DEFIB 200J
                  </span>
                </div>
              </button>

              {/* 5. Amiodarone 150mg IV */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogProcedure('Amiodarone 150mg IV over 10 min');
                    handleLogPresetMed('Amiodarone 150mg IV over 10 min', false, () => {
                      addLog?.('Administered Amiodarone 150mg IV infusion over 10 min', 'med');
                      triggerReassessmentAlert?.('Amiodarone 150mg IV over 10 min', undefined, true);
                    });
                  }}
                  className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                    amioCount > 0 || completedProcedures.includes('Amiodarone 150mg IV over 10 min')
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-100'
                      : 'bg-slate-900 hover:bg-slate-800 border-cyan-800/80 hover:border-cyan-500'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-cyan-300">
                        5. Amiodarone 150mg IV over 10 min
                      </span>
                      <span className="text-[9px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300 px-1.5 py-0.5 rounded">
                        #{amioCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-normal">
                      ยาปฏิชีวนะหัวใจ/ต้านการเต้นผิดจังหวะ หยดเข้าทางหลอดเลือดดำนาน 10 นาที
                    </p>
                  </div>
                  {amioCount > 0 || completedProcedures.includes('Amiodarone 150mg IV over 10 min') ? (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-cyan-300 shrink-0">
                      INFUSE 150mg
                    </span>
                  )}
                </button>
              )}

              {/* 6. Expert Consult */}
              <button
                onClick={() => {
                  handleLogProcedure('Expert Consult');
                  speakThai('ปรึกษาแพทย์ผู้เชี่ยวชาญ เรียบร้อยค่ะ');
                  addLog?.('Expert Consult requested for Unstable Tachycardia', 'system');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Expert Consult') || completedProcedures.includes('Observe & Expert Consult')
                    ? 'bg-rose-950/60 border-rose-500 text-rose-100'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-rose-300">
                      6. Expert Consult / Cardiology
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal">
                    ปรึกษาแพทย์ผู้เชี่ยวชาญด้านโรคหัวใจหรืออายุรแพทย์วิกฤตโดยด่วน
                  </p>
                </div>
                <span className="text-[9px] font-mono text-rose-400 border border-slate-700 px-2 py-1 rounded bg-slate-900 shrink-0">
                  CONSULT
                </span>
              </button>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
