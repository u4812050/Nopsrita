import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Smartphone, Share2, PlusSquare, ArrowDown, CheckCircle2, Apple, ShieldCheck, Sparkles, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppLogo } from './AppLogo';
import { isIOSDevice, isAndroidDevice } from '../utils/deviceCompatibility';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [selectedTab, setSelectedTab] = useState<'ios' | 'android'>(() => {
    return isIOSDevice() ? 'ios' : 'android';
  });

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
              ติดตั้งแอปบน iOS & Android (ทุกรุ่น)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Mock Mobile Home Screen Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-950 to-slate-900 rounded-xl border border-slate-800 relative">
            <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Progressive Web App (PWA) Standalone
            </span>

            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 shadow-lg">
              <AppLogo size="xl" className="shadow-[0_8px_20px_rgba(20,184,166,0.4)]" />
              <span className="text-xs font-bold text-slate-100 font-mono tracking-tight mt-1">
                ACLS Copilot
              </span>
            </div>
            
            <p className="text-[11px] text-slate-300 text-center mt-3 max-w-xs leading-relaxed">
              รองรับ <strong>iPhone, iPad, Samsung, Xiaomi, Oppo, Vivo</strong> และสมาร์ตโฟน/แท็บเล็ตทุกรุ่น ทำงานเต็มหน้าจอ ไม่มีแถบเบราว์เซอร์กวนใจ และใช้งานออฟไลน์ได้
            </p>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-medium">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>หน้าจอไม่ดับขณะ CPR</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>ใช้งานได้แม้ออฟไลน์</span>
            </div>
          </div>

          {/* Installed State Banner */}
          {isInstalled ? (
            <div className="flex items-center gap-3 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">ติดตั้งบนอุปกรณ์นี้เรียบร้อยแล้ว</span>
                <span className="text-slate-400">แอปกำลังทำงานในโหมด Standalone บนหน้าจอหลัก</span>
              </div>
            </div>
          ) : (
            <>
              {/* Platform Switcher Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTab('ios')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTab === 'ios'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>iPhone / iPad (iOS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTab('android')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedTab === 'android'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android (ทุกรุ่น)</span>
                </button>
              </div>

              {/* Tab 1: iOS Instructions */}
              {selectedTab === 'ios' && (
                <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 animate-in fade-in">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    วิธีติดตั้งบน iPhone & iPad (Safari):
                  </span>

                  <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                    <li className="leading-relaxed">
                      เปิดหน้านี้ด้วยเบราว์เซอร์ <strong className="text-white">Safari</strong>
                    </li>
                    <li className="leading-relaxed">
                      กดปุ่ม <strong className="text-white">แชร์ (Share <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-cyan-400" />)</strong> ที่แถบเมนูด้านล่างหรือด้านบน
                    </li>
                    <li className="leading-relaxed">
                      เลื่อนลงมาแล้วแตะ <strong className="text-white">"เพิ่มไปยังหน้าจอโฮม"</strong> (<strong className="text-cyan-300">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-teal-400" /></strong>)
                    </li>
                    <li className="leading-relaxed">
                      กดปุ่ม <strong className="text-emerald-400">"เพิ่ม" (Add)</strong> ที่มุมขวาบน จะได้ไอคอนแอปบนหน้าจอทันที
                    </li>
                  </ol>
                </div>
              )}

              {/* Tab 2: Android Instructions */}
              {selectedTab === 'android' && (
                <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 animate-in fade-in">
                  {isInstallable ? (
                    <div className="space-y-2.5">
                      <button
                        onClick={async () => {
                          const success = await install();
                          if (success) onClose();
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <PlusSquare className="w-4 h-4" />
                        <span>แตะเพื่อติดตั้งบน Android ทันที (1-Click)</span>
                      </button>
                      <p className="text-[10.5px] text-slate-400 text-center">
                        เบราว์เซอร์รองรับการติดตั้งอัตโนมัติทันที
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        วิธีติดตั้งบน Android (Chrome / Samsung Internet):
                      </span>
                      <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                        <li className="leading-relaxed">
                          แตะปุ่มเมนู <strong className="text-white">จุดสามจุด (⋮)</strong> ที่มุมขวาบนของเบราว์เซอร์
                        </li>
                        <li className="leading-relaxed">
                          เลือก <strong className="text-white">"ติดตั้งแอป" (Install App)</strong> หรือ <strong className="text-cyan-300">"เพิ่มลงในหน้าจอหลัก" (Add to Home screen)</strong>
                        </li>
                        <li className="leading-relaxed">
                          กดยืนยัน <strong className="text-emerald-400">"ติดตั้ง"</strong> ไอคอนจะถูกสร้างบนหน้าจอหลักพร้อมเปิดใช้งาน
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/70">
          <span className="text-[10px] text-slate-400 font-mono">
            iOS Safari • Android Chrome • Samsung Internet
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
