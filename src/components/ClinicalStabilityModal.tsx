import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, X, Activity, ShieldAlert, HeartPulse, Zap } from 'lucide-react';

interface ClinicalStabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  rhythmType?: 'brady' | 'tachy' | 'all' | string | null;
  onSelectStability: (status: 'stable' | 'unstable') => void;
  addLog: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  speakThai: (text: string, onEnd?: () => void, customRate?: number) => void;
}

export function ClinicalStabilityModal({
  isOpen,
  onClose,
  rhythmType,
  onSelectStability,
  addLog,
  speakThai,
}: ClinicalStabilityModalProps) {
  useEffect(() => {
    if (isOpen) {
      speakThai("ประเมินอาการคงที่และไม่คงที่ด้วยค่ะ");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (status: 'stable' | 'unstable') => {
    onSelectStability(status);
    if (status === 'stable') {
      addLog('Clinical Assessment: STABLE Patient (ประเมินแล้ว อาการคงที่)', 'system');
      speakThai('ประเมินแล้ว อาการคงที่ค่ะ');
    } else {
      addLog('Clinical Assessment: UNSTABLE Patient (ประเมินแล้ว อาการไม่คงที่)', 'system');
      speakThai('ประเมินแล้ว อาการไม่คงที่ค่ะ');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative transform transition-all duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2 tracking-wide">
                ประเมินสภาวะทางคลินิกผู้ป่วย
              </h3>
              <p className="text-xs text-amber-300/90 font-medium flex items-center gap-1 mt-0.5">
                {rhythmType === 'brady' || rhythmType === 'bradycardia' ? (
                  <>
                    <Activity className="w-3.5 h-3.5 text-amber-400 inline" />
                    <span>Bradycardia with Pulse (HR &lt; 50 bpm)</span>
                  </>
                ) : rhythmType === 'tachy' || rhythmType === 'tachycardia' ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-indigo-400 inline" />
                    <span>Tachycardia with Pulse (HR &ge; 150 bpm)</span>
                  </>
                ) : (
                  <>
                    <HeartPulse className="w-3.5 h-3.5 text-cyan-400 inline" />
                    <span>Bradycardia / Tachycardia Assessment</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">

          {/* Critical Signs Box */}
          <div className="bg-gradient-to-b from-amber-950/50 to-slate-950/90 border-2 border-amber-500/60 rounded-xl p-3.5 sm:p-4 text-amber-100 shadow-inner space-y-2.5">
            <div className="flex items-center gap-2 border-b border-amber-500/30 pb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
              <span className="font-black text-xs sm:text-sm text-amber-300 tracking-wide">
                รายการประเมินสัญญาณวิกฤต (Critical Warning Signs)
              </span>
            </div>
            
            <p className="text-[11px] text-amber-200/80 font-medium">
              หากมีอาการวิกฤตข้อใดข้อหนึ่งต่อไปนี้ ให้จัดอยู่ในกลุ่ม <span className="font-bold text-rose-400 underline decoration-rose-500/50 underline-offset-2">UNSTABLE (อาการไม่คงที่)</span> ทันที:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-semibold">
              <li className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                <div>
                  <span className="font-bold text-rose-300">Hypotension</span>
                  <span className="block text-[10px] text-slate-400 font-normal">ความดันโลหิตต่ำ (SBP &lt; 90 mmHg)</span>
                </div>
              </li>

              <li className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                <div>
                  <span className="font-bold text-rose-300">Altered Mental Status (AMS)</span>
                  <span className="block text-[10px] text-slate-400 font-normal">ระดับความรู้สึกตัวเปลี่ยนแปลง (สับสน/ซึม)</span>
                </div>
              </li>

              <li className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                <div>
                  <span className="font-bold text-rose-300">Signs of Shock</span>
                  <span className="block text-[10px] text-slate-400 font-normal">ภาวะช็อก (ปลายมือเท้าเย็น, CRT&gt;2s)</span>
                </div>
              </li>

              <li className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 text-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                <div>
                  <span className="font-bold text-rose-300">Ischemic Chest Pain</span>
                  <span className="block text-[10px] text-slate-400 font-normal">เจ็บหน้าอกขาดเลือด</span>
                </div>
              </li>

              <li className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 text-slate-200 sm:col-span-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                <div>
                  <span className="font-bold text-rose-300">Acute Heart Failure</span>
                  <span className="block text-[10px] text-slate-400 font-normal">ภาวะหัวใจล้มเหลวเฉียบพลัน (หายใจเหนื่อย ฟังปอดพบเสียง Crepitation, เส้นเลือดดำคอโป่งพอง)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* STABLE Button */}
            <button
              onClick={() => handleSelect('stable')}
              className="py-3.5 px-4 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border-2 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform shrink-0" />
              <span>STABLE (อาการคงที่)</span>
            </button>

            {/* UNSTABLE Button */}
            <button
              onClick={() => handleSelect('unstable')}
              className="py-3.5 px-4 rounded-xl font-black text-sm bg-rose-600 hover:bg-rose-500 active:bg-rose-700 border-2 border-rose-400 text-white shadow-lg shadow-rose-950/80 ring-2 ring-rose-500/50 animate-pulse hover:animate-none transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <AlertOctagon className="w-5 h-5 text-rose-200 group-hover:scale-110 transition-transform shrink-0" />
              <span>UNSTABLE (อาการไม่คงที่)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
