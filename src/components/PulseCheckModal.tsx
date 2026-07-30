import React from 'react';
import { Activity, Play, X } from 'lucide-react';

interface PulseCheckModalProps {
  pulseCheckActive: boolean;
  pulseCheckTime: number;
  cancelPulseCheck: () => void;
  toggleCPR: () => void;
  cprActive: boolean;
}

export function PulseCheckModal({
  pulseCheckActive,
  pulseCheckTime,
  cancelPulseCheck,
  toggleCPR,
  cprActive,
}: PulseCheckModalProps) {
  if (!pulseCheckActive) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center mx-auto mb-3">
          <Activity className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>

        <h3 className="text-xl font-black text-amber-400 uppercase tracking-tight">
          ประเมินชีพจรและคลื่นหัวใจ (Pulse & EKG)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          จำกัดเวลาไม่เกิน 10 วินาทีตามแนวทางการช่วยชีวิตขั้นสูง
        </p>

        {/* Big Countdown Number */}
        <div className="text-7xl font-mono font-black text-amber-400 my-4 animate-pulse">
          {pulseCheckTime}s
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              if (!cprActive) toggleCPR();
            }}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>พบไม่มีชีพจร • กด CPR ต่อ</span>
          </button>

          <button
            onClick={cancelPulseCheck}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
