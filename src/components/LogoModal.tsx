import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Sparkles, Heart, Activity, Shield, Smartphone } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstallModal?: () => void;
}

export const LogoModal: React.FC<LogoModalProps> = ({ isOpen, onClose, onOpenInstallModal }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const svgCode = `<svg width="128" height="128" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#164e63"/>
    </linearGradient>
  </defs>
  <rect width="24" height="24" rx="6" fill="url(#bgGrad)" stroke="#67e8f9" stroke-width="0.8"/>
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="#e11d48" fill-opacity="0.6" stroke="#fb7185" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 12h4l1.5-3.5 2.5 7.5 2.5-10 2 6 1.5-2h6" stroke="#fcd34d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const handleCopySvg = () => {
    navigator.clipboard?.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 pt-safe pb-safe pl-safe pr-safe">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm sm:text-base text-white tracking-wide">
              App Logo & Brand Identity
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Logo Display Canvas */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-slate-950/90 to-slate-900/90 rounded-2xl border border-slate-800/80 relative overflow-hidden group">
            {/* Ambient Background Aura */}
            <div className="absolute w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none -bottom-4" />

            {/* Enlarged Master Logo */}
            <div className="relative mb-5 transition-transform duration-300 group-hover:scale-105">
              <AppLogo size="2xl" />
            </div>

            {/* App Title in Brand Typography */}
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 font-mono tracking-wider">
              SMART ACLS COPILOT
            </h2>
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase mt-1">
              Critical Care Resuscitation System
            </p>
          </div>

          {/* Design Symbolism & Meaning */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-rose-900/30 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                <Heart className="w-4 h-4 fill-rose-500/30" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-rose-300 block">Pulsing Heart</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                  หัวใจและเป้าหมาย High-Quality CPR กู้ชีพฟื้นคืนชีพ
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-amber-900/30 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-amber-300 block">Golden ECG</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                  คลื่นหัวใจ QRS Complex วิเคราะห์จังหวะและช็อคไฟฟ้า
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-teal-900/30 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-teal-300 block">Clinical Shield</span>
                <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                  ความแม่นยำ ปลอดภัย และระบบ AI Resuscitation Copilot
                </span>
              </div>
            </div>
          </div>

          {/* Scale Variants */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs font-bold text-slate-300 block mb-3">
              Logo Scales & Contexts
            </span>
            <div className="flex items-center justify-around gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <AppLogo size="sm" />
                <span className="text-[9px] text-slate-500 font-mono">28px (Status)</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <AppLogo size="md" />
                <span className="text-[9px] text-slate-500 font-mono">36px (Header)</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <AppLogo size="lg" />
                <span className="text-[9px] text-slate-500 font-mono">48px (Icon)</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <AppLogo size="xl" />
                <span className="text-[9px] text-slate-500 font-mono">80px (Badge)</span>
              </div>
            </div>
          </div>

          {/* Color System */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Color Palette
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" />
                Teal
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Rose
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                Amber
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySvg}
              className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 px-3 py-1.5 rounded-lg border border-cyan-800/60 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอก SVG แล้ว' : 'Copy Vector SVG'}</span>
            </button>

            {onOpenInstallModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-teal-200 bg-teal-950/60 hover:bg-teal-900/60 px-3 py-1.5 rounded-lg border border-teal-800/60 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                <span>เพิ่มลงหน้าจอโฮม</span>
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors ml-auto"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
