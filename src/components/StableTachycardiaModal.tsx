import React from 'react';
import { Zap, CheckCircle2, X, Activity, PhoneCall, Stethoscope, Syringe, Heart, Shield, AlertCircle } from 'lucide-react';

interface StableTachycardiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedProcedures?: string[];
  adenosineCount?: number;
  amioCount?: number;
  handleLogProcedure: (procName: string) => void;
  handleLogPresetMed?: (medName: string, skipSpeech?: boolean, onSpeechEnd?: () => void) => void;
  triggerReassessmentAlert?: (procName: string, speechMsg: string, isCardioversion?: boolean) => void;
  speakThai: (text: string, onEnd?: () => void, customRate?: number) => void;
  addLog?: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
}

export function StableTachycardiaModal({
  isOpen,
  onClose,
  completedProcedures = [],
  adenosineCount = 0,
  amioCount = 0,
  handleLogProcedure,
  handleLogPresetMed,
  triggerReassessmentAlert,
  speakThai,
  addLog,
}: StableTachycardiaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-indigo-500/80 rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(99,102,241,0.25)] overflow-hidden relative text-white transform transition-all duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 p-3.5 sm:p-4 border-b border-indigo-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <Zap className="w-6 h-6 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-indigo-100 tracking-wide flex items-center gap-1.5">
                  Stable Tachycardia Management
                </h3>
                <span className="text-[9px] bg-indigo-950 text-indigo-200 border border-indigo-600/80 px-2 py-0.5 rounded-full font-mono font-bold">
                  STABLE PROTOCOL
                </span>
              </div>
              <p className="text-xs text-indigo-300/90 font-medium mt-0.5 flex items-center gap-1">
                <span>การรักษาผู้ป่วยชีพจรเต้นเร็วอาการคงที่ (HR ≥ 150 bpm)</span>
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
          
          {/* Assessment Criteria Banner */}
          <div className="bg-indigo-950/40 border border-indigo-500/50 rounded-xl p-3 text-indigo-100 text-xs space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 text-indigo-300 font-bold border-b border-indigo-500/30 pb-1">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>ประเมินชนิด EKG และอาการแสดง (Narrow vs Wide QRS):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-indigo-200/90 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                ไม่มีสัญญาณ Unstable (No Hypotension)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                Narrow Regular: Vagal / Adenosine
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                Narrow Irregular: Rate Control
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                Wide Regular: Amiodarone / Cardiovert
              </span>
              <span className="flex items-center gap-1 col-span-2 sm:col-span-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                ปรึกษาแพทย์ผู้เชี่ยวชาญหากจำเป็น
              </span>
            </div>
          </div>

          {/* Action Choice Grid */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
              <span>เลือกการปฏิบัติการรักษา (Select Treatment Action)</span>
              <span className="text-[10px] text-slate-400 normal-case font-normal">AHA Guidelines 2025</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              
              {/* 1. Vagal Maneuvers */}
              <button
                onClick={() => {
                  handleLogProcedure('Vagal Maneuvers Performed');
                  triggerReassessmentAlert?.('Vagal Maneuvers', 'ทำวาก้อมานูเว่อ เรียบร้อยค่ะ', true);
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Vagal Maneuvers Performed')
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-100'
                    : 'bg-slate-900 hover:bg-slate-800 border-indigo-800/80 hover:border-indigo-500'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-indigo-300">
                      1. Vagal Maneuvers (Modified Valsalva / Carotid Massage)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal">
                    อันดับแรกสำหรับ Narrow Regular QRS (SVT): Modified Valsalva maneuver หรือ Carotid sinus massage
                  </p>
                </div>
                {completedProcedures.includes('Vagal Maneuvers Performed') ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                ) : (
                  <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-indigo-300 shrink-0">
                    SELECT
                  </span>
                )}
              </button>

              {/* 2. Adenosine 6mg IV */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogProcedure('Adenosine 6mg IV rapid push');
                    handleLogPresetMed('Adenosine 6mg IV rapid push', false, () => {
                      triggerReassessmentAlert?.('Adenosine 6mg IV rapid push', undefined, true);
                    });
                  }}
                  disabled={adenosineCount >= 1}
                  className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md ${
                    adenosineCount >= 1 || completedProcedures.includes('Adenosine 6mg IV rapid push')
                      ? 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-slate-900 hover:bg-slate-800 border-indigo-600/80 hover:border-indigo-400 cursor-pointer group'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-indigo-300">
                        2. Adenosine 6mg IV rapid push (1st Dose)
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                        adenosineCount >= 1
                          ? 'text-indigo-300 bg-indigo-950 border-indigo-800'
                          : 'text-indigo-200 bg-indigo-900/80 border-indigo-600'
                      }`}>
                        {adenosineCount >= 1 ? '1ST DOSE GIVEN' : 'DOSE #1'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-normal">
                      ฉีดเข้าทางหลอดเลือดดำอย่างรวดเร็ว ตามด้วย NSS flush 20 mL สำหรับ Narrow Regular QRS
                    </p>
                  </div>
                  {adenosineCount >= 1 || completedProcedures.includes('Adenosine 6mg IV rapid push') ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-indigo-300 shrink-0">
                      PUSH 6mg
                    </span>
                  )}
                </button>
              )}

              {/* 3. Adenosine 12mg IV */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogProcedure('Adenosine 12mg IV rapid push');
                    handleLogPresetMed('Adenosine 12mg IV rapid push', false, () => {
                      triggerReassessmentAlert?.('Adenosine 12mg IV rapid push', undefined, true);
                    });
                  }}
                  disabled={adenosineCount >= 2}
                  className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md ${
                    adenosineCount >= 2 || completedProcedures.includes('Adenosine 12mg IV rapid push')
                      ? 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-slate-900 hover:bg-slate-800 border-indigo-600/80 hover:border-indigo-400 cursor-pointer group'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-indigo-300">
                        3. Adenosine 12mg IV rapid push (2nd Dose)
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                        adenosineCount >= 2
                          ? 'text-indigo-300 bg-indigo-950 border-indigo-800'
                          : 'text-indigo-200 bg-indigo-900/80 border-indigo-600'
                      }`}>
                        {adenosineCount >= 2 ? '2ND DOSE GIVEN' : 'DOSE #2'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-normal">
                      ให้ขนาดยาที่สอง 12 mg IV rapid push หากขนาด 6 mg แรกไม่ได้ผล
                    </p>
                  </div>
                  {adenosineCount >= 2 || completedProcedures.includes('Adenosine 12mg IV rapid push') ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-indigo-300 shrink-0">
                      PUSH 12mg
                    </span>
                  )}
                </button>
              )}

              {/* 4. Amiodarone 150mg IV */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogProcedure('Amiodarone 150mg IV over 10 min');
                    handleLogPresetMed('Amiodarone 150mg IV over 10 min', false, () => {
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
                        4. Amiodarone 150mg IV over 10 min (Stable Wide QRS / VT)
                      </span>
                      <span className="text-[9px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300 px-1.5 py-0.5 rounded">
                        #{amioCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-normal">
                      ยาปฏิชีวนะหัวใจสำหรับ Wide QRS Tachycardia (Monomorphic VT) ที่อาการคงที่ หยดนาน 10 นาที
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

              {/* 5. Sync. Cardiovertion 100J */}
              <button
                onClick={() => {
                  handleLogProcedure('Synchronized Cardioversion 100J Delivered');
                  triggerReassessmentAlert?.('Synchronized Cardioversion 100J', 'ทำคาดิโอเวอชั่น 100 จูน ค่ะ', true);
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
                      5. Sync. Cardiovertion 100J (Wide QRS ≥ 120ms Regular)
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-200/90 font-normal">
                    การช็อกไฟฟ้าแบบสัมพันธ์กับคลื่น R (Synchronized) เริ่มต้น 100 Joules
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-mono bg-indigo-950 border border-indigo-500 text-yellow-300 px-2 py-1 rounded font-bold">
                    CARDIOVERT 100J
                  </span>
                </div>
              </button>

              {/* 6. Sync. Cardiovertion 200J */}
              <button
                onClick={() => {
                  handleLogProcedure('Synchronized Cardioversion 200J Delivered');
                  triggerReassessmentAlert?.('Synchronized Cardioversion 200J', 'ทำคาดิโอเวอชั่น 200 จูน ค่ะ', true);
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
                      6. Sync. Cardiovertion 200J (Wide QRS ≥ 120ms Irregular)
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-200/90 font-normal">
                    การช็อกไฟฟ้าแบบสัมพันธ์กับคลื่น R เพิ่มพลังงาน 200 Joules
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-mono bg-indigo-950 border border-indigo-500 text-yellow-300 px-2 py-1 rounded font-bold">
                    CARDIOVERT 200J
                  </span>
                </div>
              </button>

              {/* 7. Rate Control (CCB / Beta Blocker) */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogProcedure('Rate Control (CCB / Beta Blocker)');
                    handleLogPresetMed('Diltiazem / Metoprolol IV', false, () => {
                      triggerReassessmentAlert?.('Diltiazem / Metoprolol IV', undefined, true);
                    });
                  }}
                  className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                    completedProcedures.includes('Rate Control (CCB / Beta Blocker)') || completedProcedures.includes('Diltiazem / Metoprolol IV')
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-100'
                      : 'bg-slate-900 hover:bg-slate-800 border-indigo-800/80 hover:border-indigo-500'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-indigo-300">
                        7. Rate Control (Diltiazem / Metoprolol IV)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-normal">
                      สำหรับ Narrow Irregular QRS (AFib / Atrial Flutter): Diltiazem 15-20mg IV หรือ Metoprolol 5mg IV
                    </p>
                  </div>
                  {completedProcedures.includes('Rate Control (CCB / Beta Blocker)') || completedProcedures.includes('Diltiazem / Metoprolol IV') ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  ) : (
                    <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-indigo-300 shrink-0">
                      RATE CONTROL
                    </span>
                  )}
                </button>
              )}

              {/* 8. Observe & Expert Consult */}
              <button
                onClick={() => {
                  handleLogProcedure('Observe & Expert Consult');
                  speakThai('เฝ้าระวังอาการ และปรึกษาแพทย์ผู้เชี่ยวชาญ เรียบร้อยค่ะ');
                  addLog?.('Observe & Expert Consult for Stable Tachycardia', 'system');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Observe & Expert Consult')
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-100'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-indigo-300">
                      8. Observe &amp; Expert Consult
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal">
                    เฝ้าติดตามอาการอย่างใกล้ชิด และปรึกษาแพทย์ผู้เชี่ยวชาญด้านโรคหัวใจ
                  </p>
                </div>
                <span className="text-[9px] font-mono text-indigo-400 border border-slate-700 px-2 py-1 rounded bg-slate-900 shrink-0">
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
