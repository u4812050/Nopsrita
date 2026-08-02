import React from 'react';
import { Zap, ShieldAlert, Heart, Activity, X, Play, Check, AlertCircle } from 'lucide-react';
import { RhythmDecision, ShockableRhythmType, NonShockableRhythmType } from '../types';
import { VfEkgIcon, VtEkgIcon, AsystoleEkgIcon, PeaEkgIcon } from './EkgIcons';

interface QuickActionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastRhythmDecision: RhythmDecision;
  selectedShockableRhythm: ShockableRhythmType;
  setSelectedShockableRhythm: (val: ShockableRhythmType) => void;
  selectedNonShockableRhythm: NonShockableRhythmType;
  setSelectedNonShockableRhythm: (val: NonShockableRhythmType) => void;
  handleRhythmShockable: () => void;
  handleRhythmNonShockable: () => void;
  handleRhythmBradycardia: () => void;
  handleRhythmTachycardia: () => void;
  handleRhythmROSC: () => void;
  handleDeliverShock: () => void;
  shockCount: number;
  shockButtonFlashing?: boolean;
  setShockButtonFlashing?: (val: boolean) => void;
  handleAdministerEpinephrine: () => void;
  epiCount: number;
  handleAdministerAmiodarone: () => void;
  amioCount: number;
  handleAdministerLidocaine: () => void;
  lidoCount: number;
  addLog: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  speakThai: (text: string, onEnd?: () => void, rate?: number) => void;
  cprActive: boolean;
  toggleCPR: () => void;
}

export function QuickActionPromptModal({
  isOpen,
  onClose,
  lastRhythmDecision,
  selectedShockableRhythm,
  setSelectedShockableRhythm,
  selectedNonShockableRhythm,
  setSelectedNonShockableRhythm,
  handleRhythmShockable,
  handleRhythmNonShockable,
  handleRhythmBradycardia,
  handleRhythmTachycardia,
  handleRhythmROSC,
  handleDeliverShock,
  shockCount,
  shockButtonFlashing,
  setShockButtonFlashing,
  handleAdministerEpinephrine,
  epiCount,
  handleAdministerAmiodarone,
  amioCount,
  handleAdministerLidocaine,
  lidoCount,
  addLog,
  speakThai,
  cprActive,
  toggleCPR,
}: QuickActionPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/80 rounded-2xl max-w-xl w-full p-4 sm:p-5 text-left shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-cyan-300 uppercase tracking-tight flex items-center gap-2">
                เลือกคลื่นไฟฟ้าหัวใจ &amp; Quick Actions
              </h3>
              <p className="text-[11px] text-slate-400 leading-tight">
                ประเมินชีพจรครบ 10 วินาทีแล้ว โปรดเลือกกลุ่มคลื่นไฟฟ้าหัวใจเพื่อปฏิบัติตามแนวทาง ACLS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="my-3 space-y-3 overflow-y-auto pr-1 flex-1">
          {/* Main 5 Rhythm Group Trigger Buttons */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 block">
              1. เลือกกลุ่มคลื่นไฟฟ้าหัวใจ (Rhythm Group)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {/* SHOCKABLE */}
              <button
                onClick={() => {
                  handleRhythmShockable();
                }}
                className={`p-2 rounded-xl text-center font-black transition-all cursor-pointer border flex flex-col items-center justify-center ${
                  lastRhythmDecision === 'shockable'
                    ? 'bg-rose-600 text-white border-rose-300 ring-4 ring-rose-500/80 shadow-lg'
                    : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500 hover:border-rose-400'
                }`}
              >
                <Zap className="w-4 h-4 mb-0.5 fill-rose-300 text-rose-300" />
                <span className="text-xs uppercase font-mono block leading-none">SHOCKABLE</span>
                <span className="text-[9px] opacity-80 mt-1">VF/pVT/Torsades</span>
              </button>

              {/* NON-SHOCKABLE */}
              <button
                onClick={() => {
                  handleRhythmNonShockable();
                }}
                className={`p-2 rounded-xl text-center font-black transition-all cursor-pointer border flex flex-col items-center justify-center ${
                  lastRhythmDecision === 'non-shockable'
                    ? 'bg-slate-700 text-white border-white ring-4 ring-white/80 shadow-lg'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-white/60 hover:border-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 mb-0.5 text-cyan-300" />
                <span className="text-xs uppercase font-mono block leading-none">NON-SHOCK</span>
                <span className="text-[9px] opacity-80 mt-1">Asystole/PEA</span>
              </button>

              {/* BRADYCARDIA */}
              <button
                onClick={() => {
                  handleRhythmBradycardia();
                }}
                className={`p-2 rounded-xl text-center font-black transition-all cursor-pointer border flex flex-col items-center justify-center ${
                  lastRhythmDecision === 'bradycardia'
                    ? 'bg-amber-600 text-white border-amber-300 ring-4 ring-amber-400 shadow-lg'
                    : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-400 hover:border-amber-300'
                }`}
              >
                <Activity className="w-4 h-4 mb-0.5 text-amber-300" />
                <span className="text-xs uppercase font-mono block leading-none">BRADY</span>
                <span className="text-[9px] opacity-80 mt-1">HR &lt; 50</span>
              </button>

              {/* TACHYCARDIA */}
              <button
                onClick={() => {
                  handleRhythmTachycardia();
                }}
                className={`p-2 rounded-xl text-center font-black transition-all cursor-pointer border flex flex-col items-center justify-center ${
                  lastRhythmDecision === 'tachycardia'
                    ? 'bg-purple-600 text-white border-purple-300 ring-4 ring-purple-400 shadow-lg'
                    : 'bg-purple-950/60 hover:bg-purple-900 text-purple-300 border-purple-400 hover:border-purple-300'
                }`}
              >
                <Activity className="w-4 h-4 mb-0.5 text-purple-300" />
                <span className="text-xs uppercase font-mono block leading-none">TACHY</span>
                <span className="text-[9px] opacity-80 mt-1">HR &ge; 150</span>
              </button>

              {/* ROSC */}
              <button
                onClick={() => {
                  handleRhythmROSC();
                  onClose();
                }}
                className={`p-2 rounded-xl text-center font-black transition-all cursor-pointer border flex flex-col items-center justify-center col-span-2 sm:col-span-1 ${
                  lastRhythmDecision === 'rosc'
                    ? 'bg-emerald-600 text-white border-emerald-300 ring-4 ring-emerald-400 shadow-lg'
                    : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-400 hover:border-emerald-300'
                }`}
              >
                <Heart className="w-4 h-4 mb-0.5 text-emerald-300 fill-emerald-300/40" />
                <span className="text-xs uppercase font-mono block leading-none">ROSC</span>
                <span className="text-[9px] opacity-80 mt-1">Pulse Return</span>
              </button>
            </div>
          </div>

          {/* Sub-rhythm Selection & Fast Actions */}
          {lastRhythmDecision === 'shockable' && (
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-2.5 space-y-2 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">
                ระบุชนิดคลื่นหัวใจ Shockable (VF / Pulseless VT / Torsades)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    setSelectedShockableRhythm('VF');
                    if (setShockButtonFlashing) setShockButtonFlashing(true);
                    addLog('Selected Rhythm Type: VF (Ventricular Fibrillation)', 'rhythm');
                    speakThai('เลือกวีเอฟ เตรียมช็อคนะคะ');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                    selectedShockableRhythm === 'VF'
                      ? 'bg-rose-900 border-rose-400 text-white ring-2 ring-rose-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <VfEkgIcon className="w-8 h-5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-xs block leading-none">VF</span>
                    <span className="text-[8px] text-slate-400 block truncate">Ventricular Fib.</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedShockableRhythm('Pulseless VT');
                    if (setShockButtonFlashing) setShockButtonFlashing(true);
                    addLog('Selected Rhythm Type: Pulseless VT', 'rhythm');
                    speakThai('เลือกเพ้าเหล็สวีที เตรียมช็อคนะคะ');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                    selectedShockableRhythm === 'Pulseless VT'
                      ? 'bg-rose-900 border-rose-400 text-white ring-2 ring-rose-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <VtEkgIcon className="w-8 h-5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-xs block leading-none">pVT</span>
                    <span className="text-[8px] text-slate-400 block truncate">Pulseless VT</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedShockableRhythm('Torsades');
                    if (setShockButtonFlashing) setShockButtonFlashing(true);
                    addLog('Selected Rhythm Type: Torsades de pointes (Polymorphic VT)', 'rhythm');
                    speakThai('เลือกทอสาดเดอปัว เตรียมช็อคนะคะ');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                    selectedShockableRhythm === 'Torsades'
                      ? 'bg-rose-900 border-rose-400 text-white ring-2 ring-rose-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs block leading-none">TdP</span>
                    <span className="text-[8px] text-slate-400 block truncate">Torsades</span>
                  </div>
                </button>
              </div>

              {/* Primary Action: Deliver Shock */}
              <button
                onClick={() => {
                  handleDeliverShock();
                  onClose();
                }}
                className={`w-full py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border shadow-lg ${
                  shockButtonFlashing
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-300 animate-pulse ring-4 ring-rose-500/80'
                    : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-300'
                }`}
              >
                <Zap className="w-4 h-4 fill-yellow-200 text-yellow-200 animate-bounce" />
                <span>ปล่อยช็อกหัวใจ (DEFIBRILLATE 200J) • Shock #{shockCount + 1}</span>
              </button>
            </div>
          )}

          {lastRhythmDecision === 'non-shockable' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                ระบุชนิดคลื่นหัวใจ Non-Shockable (Asystole / PEA)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setSelectedNonShockableRhythm('Asystole');
                    addLog('Selected Rhythm Type: Asystole', 'rhythm');
                    speakThai('เลือก คลื่นไฟฟ้าหัวใจ อะซิสโทลี');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    selectedNonShockableRhythm === 'Asystole'
                      ? 'bg-slate-800 border-cyan-400 text-white ring-2 ring-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <AsystoleEkgIcon className="w-8 h-5 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block leading-tight">Asystole</span>
                    <span className="text-[8px] text-slate-400 block">Flatline</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedNonShockableRhythm('PEA');
                    addLog('Selected Rhythm Type: PEA', 'rhythm');
                    speakThai('เลือก คลื่นไฟฟ้าหัวใจ พีอีเอ');
                  }}
                  className={`p-1.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                    selectedNonShockableRhythm === 'PEA'
                      ? 'bg-slate-800 border-cyan-400 text-white ring-2 ring-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <PeaEkgIcon className="w-8 h-5 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block leading-tight">PEA</span>
                    <span className="text-[8px] text-slate-400 block">Pulseless Elec.</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => {
                  handleAdministerEpinephrine();
                }}
                className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all border border-cyan-400"
              >
                <span>💉 บริหารยา EPINEPHRINE 1mg IV/IO (Dose #{epiCount + 1})</span>
              </button>
            </div>
          )}

          {/* Direct Medication Quick Actions Grid */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5 block">
              2. ทางลัดสั่งการยาหลัก (Quick Medication Admin)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={handleAdministerEpinephrine}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-300 font-mono">EPINEPHRINE</span>
                  <span className="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-800">
                    #{epiCount}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">1mg IV Every 3-5m</span>
              </button>

              <button
                onClick={handleAdministerAmiodarone}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-300 font-mono">AMIODARONE</span>
                  <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-800">
                    #{amioCount}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  {amioCount === 0 ? '300mg IV' : '150mg IV'}
                </span>
              </button>

              <button
                onClick={handleAdministerLidocaine}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-300 font-mono">LIDOCAINE</span>
                  <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-800">
                    #{lidoCount}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  {lidoCount === 0 ? '1-1.5 mg/kg' : '0.5-0.75 mg/kg'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-slate-800 flex gap-2">
          {!cprActive && (
            <button
              onClick={() => {
                toggleCPR();
              }}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>เริ่ม CPR ต่อ</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-all"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>ตกลง &amp; ปิดหน้าต่างนี้</span>
          </button>
        </div>

      </div>
    </div>
  );
}
