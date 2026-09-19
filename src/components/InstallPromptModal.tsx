import React from 'react';
import { createPortal } from 'react-dom';
import { X, Smartphone, Share2, PlusSquare, ArrowDown, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppLogo } from './AppLogo';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 pt-safe pb-safe pl-safe pr-safe">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-cyan-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-white tracking-wide">
              เพิ่มแอปไปยังหน้าจอโฮม (Add to Home Screen)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Mock Mobile Home Screen Preview */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-slate-800 relative">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-3">
              ตัวอย่างไอคอนบนหน้าจอโฮม (Home Screen Preview)
            </span>

            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-lg">
              <AppLogo size="xl" className="shadow-[0_8px_20px_rgba(20,184,166,0.4)]" />
              <span className="text-xs font-bold text-slate-100 font-mono tracking-tight mt-1">
                ACLS Copilot
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 text-center mt-3 max-w-xs leading-relaxed">
              เมื่อติดตั้งแล้ว สามารถกดเปิดใช้งานได้ทันทีจากหน้าจอหลัก โดยไม่ต้องพิมพ์ URL สะดวก รวดเร็วขณะปฏิบัติการช่วยฟื้นคืนชีพ
            </p>
          </div>

          {/* Installed State */}
          {isInstalled ? (
            <div className="flex items-center gap-3 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">ติดตั้งบนอุปกรณ์เรียบร้อยแล้ว</span>
                <span className="text-slate-400">แอปกำลังทำงานในโหมด Standalone บนหน้าจอโฮม</span>
              </div>
            </div>
          ) : isInstallable ? (
            /* Android / Chromium One-click Install */
            <div className="space-y-3">
              <button
                onClick={async () => {
                  const success = await install();
                  if (success) onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all"
              >
                <PlusSquare className="w-4 h-4" />
                <span>แตะเพื่อติดตั้งบนหน้าจอโฮมทันที</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center">
                เบราว์เซอร์รองรับการติดตั้งอัตโนมัติ 1-Click PWA Install
              </p>
            </div>
          ) : (
            /* iOS Safari & General Manual Instructions */
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                วิธีติดตั้งสำหรับ iPhone / iPad (Safari) หรือเบราว์เซอร์มือถือ:
              </span>

              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                <li className="leading-relaxed">
                  กดปุ่ม <strong className="text-white">แชร์ (Share <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-cyan-400" />)</strong> ที่แถบเมนูด้านล่างหรือด้านบนของ Safari
                </li>
                <li className="leading-relaxed">
                  เลื่อนลงมาแล้วเลือก <strong className="text-white">"เพิ่มไปยังหน้าจอโฮม"</strong> หรือ <strong className="text-white">"Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-teal-400" />"</strong>
                </li>
                <li className="leading-relaxed">
                  กดปุ่ม <strong className="text-emerald-400">"เพิ่ม" (Add)</strong> มุมขวาบน เพื่อสร้างไอคอนบนหน้าจอหลัก
                </li>
              </ol>

              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                <ArrowDown className="w-3.5 h-3.5 text-teal-400 animate-bounce" />
                <span>สำหรับ Chrome บน Android: แตะปุ่มจุดสามจุด (⋮) แล้วเลือก "เพิ่มลงในหน้าจอหลัก"</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-3 border-t border-slate-800 bg-slate-950/70">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            เข้าใจแล้ว / ปิด
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
