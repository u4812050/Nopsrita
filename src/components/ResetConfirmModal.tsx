import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  showResetConfirm: boolean;
  setShowResetConfirm: (val: boolean) => void;
  executeReset: () => void;
}

export function ResetConfirmModal({
  showResetConfirm,
  setShowResetConfirm,
  executeReset,
}: ResetConfirmModalProps) {
  if (!showResetConfirm) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-500/80 rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl relative overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>

        <h3 className="text-lg font-black text-white uppercase tracking-tight">
          ยืนยันการเริ่มต้นเคสใหม่ (Reset Case)?
        </h3>
        <p className="text-xs text-slate-400 mt-2">
          ข้อมูลการกู้ชีพจร ยาที่ให้ และบันทึกเวลาทั้งหมดในเคสปัจจุบันจะถูกล้าง
        </p>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setShowResetConfirm(false)}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer border border-slate-700"
          >
            ยกเลิก
          </button>
          <button
            onClick={executeReset}
            className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ยืนยัน ล้างข้อมูล</span>
          </button>
        </div>
      </div>
    </div>
  );
}
