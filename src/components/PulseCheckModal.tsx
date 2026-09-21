import React from 'react';
import { createPortal } from 'react-dom';
import { Activity, Play, X } from 'lucide-react';

interface PulseCheckModalProps {
  pulseCheckActive: boolean;
  pulseCheckTime: number;
  cancelPulseCheck: () => void;
  toggleCPR: () => void;
  cprActive: boolean;
  onCompletePulseCheck?: () => void;
}

export function PulseCheckModal({
  pulseCheckActive,
  pulseCheckTime,
  cancelPulseCheck,
  toggleCPR,
  cprActive,
  onCompletePulseCheck,
}: PulseCheckModalProps) {
  if (!pulseCheckActive) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
          <Activity className="w-7 h-7 text-rose-400" />
        </div>

        {/* Warning Banner: หยุด CPR ก่อนตรวจชีพจรและคลื่นไฟฟ้าหัวใจ */}
        <div className="inline-flex items-center gap-2 bg-rose-950/90 border-2 border-rose-500 text-rose-200 px-4 py-1.5 rounded-full text-xs xs:text-sm font-black tracking-wide mb-3 shadow-[0_0_16px_rgba(244,63,94,0.5)] animate-bounce">
          <span className="text-base">🛑</span>
          <span>หยุด CPR ก่อนตรวจชีพจรและคลื่นไฟฟ้าหัวใจ</span>
        </div>

        <h3 className="text-xl font-black text-amber-400 uppercase tracking-tight">
          ตรวจชีพจรและคลื่นไฟฟ้าหัวใจ (Pulse & EKG)
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          หยุดกดหน้าอกทันที จำกัดเวลาประเมินไม่เกิน 10 วินาที
        </p>

        {/* Big Countdown Number */}
        <div className="text-7xl font-mono font-black text-amber-400 my-4 animate-pulse">
          {pulseCheckTime}s
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              if (!cprActive) toggleCPR();
              onCompletePulseCheck?.();
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

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
