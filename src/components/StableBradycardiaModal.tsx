import React from 'react';
import { Activity, CheckCircle2, X, Shield, PhoneCall, Stethoscope, Syringe, HeartPulse, Search, FileText } from 'lucide-react';
import { FirstDegreeAvBlockIcon } from './EkgIcons';

interface StableBradycardiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedProcedures?: string[];
  atropineCount?: number;
  handleLogProcedure: (procName: string) => void;
  handleLogPresetMed?: (medName: string, skipSpeech?: boolean, onSpeechEnd?: () => void) => void;
  triggerReassessmentAlert?: (procName: string, speechMsg?: string, skipLog?: boolean) => void;
  speakThai: (text: string, onEnd?: () => void, customRate?: number) => void;
  addLog?: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
}

export function StableBradycardiaModal({
  isOpen,
  onClose,
  completedProcedures = [],
  atropineCount = 0,
  handleLogProcedure,
  handleLogPresetMed,
  speakThai,
  addLog,
}: StableBradycardiaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl max-w-2xl w-full shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden relative text-white transform transition-all duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950/80 to-slate-950 p-3.5 sm:p-4 border-b border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Activity className="w-6 h-6 animate-pulse text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-emerald-100 tracking-wide flex items-center gap-1.5">
                  Stable Bradycardia Management
                </h3>
                <span className="text-[9px] bg-emerald-950 text-emerald-200 border border-emerald-600/80 px-2 py-0.5 rounded-full font-mono font-bold">
                  STABLE PROTOCOL
                </span>
              </div>
              <p className="text-xs text-emerald-300/90 font-medium mt-0.5 flex items-center gap-1">
                <span>การรักษาผู้ป่วยชีพจรช้าอาการคงที่ (HR &lt; 50 bpm)</span>
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
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 text-emerald-100 text-xs space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 text-emerald-300 font-bold border-b border-emerald-500/30 pb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>เกณฑ์ประเมิน Stable Bradycardia (ไม่มีสัญญาณวิกฤต):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-emerald-200/90 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                ความดันโลหิตปกติ (No Hypotension)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                รู้สติร่วมมือดี (Normal Mental)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                ไม่มีเจ็บหน้าอกขาดเลือด
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                ไม่มีภาวะหัวใจล้มเหลวเฉียบพลัน
              </span>
              <span className="flex items-center gap-1 col-span-2 sm:col-span-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                การไหลเวียนโลหิตส่วนปลายดี
              </span>
            </div>
          </div>

          {/* Action Choice Grid */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
              <span>เลือกการปฏิบัติการดูแล (Select Action)</span>
              <span className="text-[10px] text-slate-400 normal-case font-normal">AHA Guidelines 2025</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              
              {/* 1. Support ABCs & Monitor V/S */}
              <button
                onClick={() => {
                  handleLogProcedure('Monitor V/S & Support ABCs');
                  speakThai('เฝ้าระวังอาการ และประเมินสัญญาณชีพเรียบร้อยค่ะ');
                  addLog?.('Monitored V/S & Supported ABCs for Stable Bradycardia', 'system');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Monitor V/S & Support ABCs')
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                    : 'bg-slate-900 hover:bg-slate-800 border-emerald-800/80 hover:border-emerald-500'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-emerald-300">
                      1. Monitor V/S &amp; Support ABCs
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal">
                    เปิดทางเดินหายใจ ให้ให้ออกซิเจนหาก SpO2 &lt; 94% เฝ้าระวังความดันโลหิต และอัตราหัวใจ
                  </p>
                </div>
                {completedProcedures.includes('Monitor V/S & Support ABCs') ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-emerald-300 shrink-0">
                    SELECT
                  </span>
                )}
              </button>

              {/* 2. Obtain 12-lead EKG */}
              <button
                onClick={() => {
                  handleLogProcedure('Obtain 12-lead EKG');
                  speakThai('ทำการตรวจคลื่นไฟฟ้าหัวใจ 12 หลีด เรียบร้อยค่ะ');
                  addLog?.('Obtained 12-lead EKG for Bradycardia assessment', 'system');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Obtain 12-lead EKG')
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                    : 'bg-slate-900 hover:bg-slate-800 border-emerald-800/80 hover:border-emerald-500'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-emerald-300">
                      2. Obtain 12-lead EKG
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal">
                    ตรวจ EKG 12 leads เพื่อประเมินชนิดของการนำไฟฟ้าผิดปกติ (First-degree AV block, Mobitz I ฯลฯ)
                  </p>
                </div>
                {completedProcedures.includes('Obtain 12-lead EKG') ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-emerald-300 shrink-0">
                    SELECT
                  </span>
                )}
              </button>

              {/* 3. Identify & Treat Reversible Causes */}
              <button
                onClick={() => {
                  handleLogProcedure('Identify & Treat Reversible Causes');
                  speakThai('ค้นหาและแก้ไขสาเหตุที่ย้อนกลับได้ เรียบร้อยค่ะ');
                  addLog?.('Identify & Treat Reversible Causes for Bradycardia', 'system');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Identify & Treat Reversible Causes')
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                    : 'bg-slate-900 hover:bg-slate-800 border-emerald-800/80 hover:border-emerald-500'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-emerald-300">
                      3. Identify &amp; Treat Reversible Causes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal">
                    ค้นหาสาเหตุ: Hypoxia, Electrolyte (Hyperkalemia), Drug toxicity (Beta-blockers, CCB, Digoxin)
                  </p>
                </div>
                {completedProcedures.includes('Identify & Treat Reversible Causes') ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 px-2 py-1 rounded text-emerald-300 shrink-0">
                    SELECT
                  </span>
                )}
              </button>

              {/* 4. Trial Atropine (Optional if symptomatic) */}
              {handleLogPresetMed && (
                <button
                  onClick={() => {
                    handleLogPresetMed('Atropine 1mg IV', false, () => {
                      addLog?.('Administered Atropine 1mg IV trial for Bradycardia', 'med');
                    });
                  }}
                  disabled={atropineCount >= 3}
                  className={`p-3 border rounded-xl text-left transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 shadow-md ${
                    atropineCount >= 3
                      ? 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-slate-900 hover:bg-slate-800 border-amber-600/60 hover:border-amber-400 cursor-pointer group'
                  }`}
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-amber-300">
                        4. Atropine 1mg IV (Trial if mild symptoms)
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                        atropineCount >= 3
                          ? 'text-rose-400 bg-rose-950 border-rose-800'
                          : 'text-amber-200 bg-amber-900/80 border-amber-600'
                      }`}>
                        {atropineCount >= 3 ? 'MAX 3mg REACHED' : `DOSE #${atropineCount + 1}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-normal">
                      พิจารณา Atropine 1 mg IV หากมีอาการเล็กน้อยหรือต้องการทดลองรักษา (ขนาดยารวมสูงสุด 3 mg)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <FirstDegreeAvBlockIcon className="w-10 h-6 shrink-0" />
                  </div>
                </button>
              )}

              {/* 5. Observe & Expert Consult */}
              <button
                onClick={() => {
                  handleLogProcedure('Observe & Expert Consult');
                  speakThai('เฝ้าระวังอาการ และปรึกษาแพทย์ผู้เชี่ยวชาญ เรียบร้อยค่ะ');
                  addLog?.('Observe & Expert Consult for Stable Bradycardia', 'system');
                }}
                className={`p-3 border rounded-xl text-left transition-all flex justify-between items-center gap-2.5 shadow-md cursor-pointer group ${
                  completedProcedures.includes('Observe & Expert Consult')
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-emerald-300">
                      5. Observe &amp; Expert Consult
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-normal">
                    เฝ้าติดตามอาการอย่างใกล้ชิด และปรึกษาแพทย์ผู้เชี่ยวชาญด้านโรคหัวใจ
                  </p>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 border border-slate-700 px-2 py-1 rounded bg-slate-900 shrink-0">
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
