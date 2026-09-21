import React from 'react';
import { createPortal } from 'react-dom';
import { Syringe, Zap, X, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { RhythmDecision } from '../types';

interface MedDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Epinephrine
  epiAlertActive: boolean;
  epiCount: number;
  epiTimeRemaining: number;
  handleAdministerEpinephrine: () => void;
  isEpiPrepOnly?: boolean;
  // Amiodarone / Lidocaine
  amioAlertActive: boolean;
  amioCount: number;
  handleAdministerAmiodarone: () => void;
  lidoAlertActive: boolean;
  lidoCount: number;
  handleAdministerLidocaine: () => void;
  // Magnesium Sulfate
  mgSo4AlertActive?: boolean;
  handleLogPresetMed?: (medName: string) => void;
  // IV / IO access state
  hasCompletedIvAccess: boolean;
  handleLogProcedure?: (procName: string) => void;
  // Context
  shockCount?: number;
  lastRhythmDecision?: RhythmDecision;
  formatMMSS: (seconds: number) => string;
}

export function MedDueModal({
  isOpen,
  onClose,
  epiAlertActive,
  epiCount,
  epiTimeRemaining,
  handleAdministerEpinephrine,
  isEpiPrepOnly = false,
  amioAlertActive,
  amioCount,
  handleAdministerAmiodarone,
  lidoAlertActive,
  lidoCount,
  handleAdministerLidocaine,
  mgSo4AlertActive = false,
  handleLogPresetMed,
  hasCompletedIvAccess,
  handleLogProcedure,
  shockCount = 0,
  lastRhythmDecision,
  formatMMSS,
}: MedDueModalProps) {
  if (!isOpen) return null;

  // Determine which medications are currently due
  const isEpiDue = epiAlertActive && !isEpiPrepOnly;
  const isAntiarrhythmicDue = amioAlertActive || lidoAlertActive;
  const isMgDue = mgSo4AlertActive;

  const handleAdministerEpiAndClose = () => {
    if (!hasCompletedIvAccess && handleLogProcedure) {
      handleLogProcedure('IV / IO Access Established');
    }
    handleAdministerEpinephrine();
    onClose();
  };

  const handleAdministerAmioAndClose = () => {
    handleAdministerAmiodarone();
    onClose();
  };

  const handleAdministerLidoAndClose = () => {
    handleAdministerLidocaine();
    onClose();
  };

  const handleAdministerMgAndClose = () => {
    if (handleLogPresetMed) {
      handleLogPresetMed('Magnesium Sulfate 2g IV');
    }
    onClose();
  };

  const modalContent = (
    <div 
      id="med_due_modal_backdrop"
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none"
    >
      <div 
        id="med_due_modal_container"
        className="bg-slate-900 border-2 border-rose-500/90 rounded-2xl max-w-lg w-full p-4 sm:p-5 text-left shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col justify-between"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/80 shrink-0 shadow-lg shadow-rose-950/50">
              <Syringe className="w-5 h-5 text-rose-400 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-1.5 font-mono">
                  <span>⚡ ถึงเวลาให้ยา</span>
                  <span className="text-rose-400 text-xs sm:text-sm font-sans font-bold">(MEDICATION DUE)</span>
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                ตามแนวทางเวชปฏิบัติ ACLS — โปรดกดบริหารยาและบันทึกทันที
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn_close_med_due_modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="my-3 space-y-3 overflow-y-auto pr-1 flex-1">
          {/* 1. EPINEPHRINE CARD (IF DUE) */}
          {(isEpiDue || (!isAntiarrhythmicDue && !isMgDue)) && (
            <div 
              id="card_med_due_epinephrine"
              className="p-3.5 rounded-xl bg-gradient-to-b from-rose-950/70 via-slate-900 to-slate-950 border-2 border-rose-500/90 shadow-xl shadow-rose-950/40 space-y-2.5 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800 tracking-wider uppercase">
                      DOSE #{epiCount + 1}
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {epiCount === 0 ? 'เข็มแรก (Initial Dose - ให้ทันที)' : 'ครบกำหนดทุก 4 นาที (ทุก 3–5 นาที)'}
                    </span>
                    {lastRhythmDecision === 'non-shockable' && (
                      <span className="text-[9px] text-cyan-300 font-mono font-bold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                        กลุ่ม Non-Shock (นับเวลาทุก 4 นาที)
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight pt-1">
                    EPINEPHRINE 1 mg
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-300 font-semibold font-mono leading-snug">
                    1 mg + NSS up to 10 ml IV/IO Push
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-slate-400">สถานะตัวจับเวลา</div>
                  <div className="text-sm font-mono font-black text-rose-400 animate-pulse">
                    {epiTimeRemaining === 0 ? 'DUE NOW!' : `${formatMMSS(epiTimeRemaining)}`}
                  </div>
                </div>
              </div>

              {/* Warning if IV Access not recorded */}
              {!hasCompletedIvAccess && (
                <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-600/80 flex items-center gap-2 text-amber-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>ยังไม่ได้บันทึกการเปิดเส้น IV/IO — ระบบจะบันทึกเปิดเส้นและบริหารยาพร้อมกัน</span>
                </div>
              )}

              {/* Direct 1-Click Action Button */}
              <button
                type="button"
                id="btn_modal_administer_epinephrine"
                onClick={handleAdministerEpiAndClose}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm sm:text-base transition-all shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-rose-300 ring-2 ring-rose-500/50"
              >
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0 animate-pulse" />
                <span className="tracking-wide">กดให้ยา EPINEPHRINE 1mg ทันที</span>
                <span className="text-xs font-mono font-bold opacity-90">(Dose #{epiCount + 1})</span>
              </button>
            </div>
          )}

          {/* 2. AMIODARONE / LIDOCAINE CARD (IF DUE AFTER SHOCK #3+) */}
          {isAntiarrhythmicDue && (
            <div 
              id="card_med_due_antiarrhythmic"
              className="p-3.5 rounded-xl bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border-2 border-indigo-500/90 shadow-xl shadow-indigo-950/40 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800 tracking-wider uppercase">
                      SHOCK #{shockCount} COMPLETED
                    </span>
                    <span className="text-[10px] text-indigo-300 font-mono font-bold">
                      ACLS Antiarrhythmic Protocol
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white font-mono tracking-tight pt-1">
                    ยาต้านหัวใจเต้นผิดจังหวะ (Antiarrhythmic Agent)
                  </h4>
                  <p className="text-xs text-slate-300 font-sans leading-snug">
                    เลือกตัวยาที่พร้อมใช้ในทีม (Amiodarone หรือ Lidocaine อย่างใดอย่างหนึ่ง):
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Amiodarone Option */}
                <button
                  type="button"
                  id="btn_modal_administer_amiodarone"
                  onClick={handleAdministerAmioAndClose}
                  className="py-3 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm transition-all shadow-md flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 border border-indigo-400"
                >
                  <div className="flex items-center gap-1.5">
                    <Syringe className="w-4 h-4 text-indigo-200" />
                    <span>AMIODARONE {amioCount === 0 ? '300 mg' : '150 mg'} IV/IO</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-200 font-normal">
                    {amioCount === 0 ? '1st Dose: 300 mg+D5W up to 20ml IV/IO' : '2nd Dose: 150 mg+D5W up to 20ml IV/IO'}
                  </span>
                </button>

                {/* Lidocaine Option */}
                <button
                  type="button"
                  id="btn_modal_administer_lidocaine"
                  onClick={handleAdministerLidoAndClose}
                  className="py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm transition-all shadow-md flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 border border-purple-400"
                >
                  <div className="flex items-center gap-1.5">
                    <Syringe className="w-4 h-4 text-purple-200" />
                    <span>LIDOCAINE {lidoCount === 0 ? '1–1.5 mg/kg' : '0.5–0.75 mg/kg'} IV</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-200 font-normal">
                    {lidoCount === 0 ? 'Dose #1 (First Dose bolus)' : 'Dose #2 (Second Dose bolus)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 3. MAGNESIUM SULFATE CARD (IF TORSADES DUE) */}
          {isMgDue && (
            <div 
              id="card_med_due_mgso4"
              className="p-3.5 rounded-xl bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 border-2 border-amber-500/90 shadow-xl shadow-amber-950/40 space-y-2"
            >
              <div>
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800 tracking-wider uppercase">
                  TORSADES DE POINTES
                </span>
                <h4 className="text-base font-black text-white font-mono tracking-tight pt-1">
                  MAGNESIUM SULFATE 2 g (50% MgSO4)
                </h4>
                <p className="text-xs text-slate-300 leading-snug">
                  เจือจางใน 5% D/W หรือ NSS 10–20 ml ให้ทาง IV Push ช้าๆ 1–2 นาที
                </p>
              </div>

              <button
                type="button"
                id="btn_modal_administer_mgso4"
                onClick={handleAdministerMgAndClose}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-amber-400"
              >
                <Zap className="w-4 h-4 text-amber-200" />
                <span>กดให้ยา 50% MgSO4 2g IV ทันที</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500 font-mono">
            ระบบบันทึกเวลา Real-time ลงใน LiveResus Log อัตโนมัติ
          </span>
          <button
            type="button"
            id="btn_dismiss_med_due_modal"
            onClick={onClose}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer shrink-0 border border-slate-700"
          >
            ข้าม / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
