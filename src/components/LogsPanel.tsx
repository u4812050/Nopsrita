import React from 'react';
import { Clipboard, FileDown, Check, ListFilter, ShieldAlert, Plus } from 'lucide-react';
import { LogEntry } from '../types';

interface LogsPanelProps {
  logs: LogEntry[];
  logEndRef: React.RefObject<HTMLDivElement | null>;
  copyLogsToClipboard: () => void;
  copied: boolean;
  handleExportPDF: () => void;
  formatMMSS: (sec: number) => string;
  caseElapsedSeconds: number;
  customNote?: string;
  setCustomNote?: (text: string) => void;
  handleLogCustomNote?: (e: React.FormEvent) => void;
}

export function LogsPanel({
  logs,
  logEndRef,
  copyLogsToClipboard,
  copied,
  handleExportPDF,
  formatMMSS,
  caseElapsedSeconds,
  customNote = '',
  setCustomNote,
  handleLogCustomNote,
}: LogsPanelProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">
            Live Resuscitation Flowsheet Log
          </h3>
          <span className="text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded border border-slate-700">
            {logs.length} Entries
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyLogsToClipboard}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[11px] font-black flex items-center gap-1 border border-cyan-500 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <FileDown className="w-3.5 h-3.5 text-white" />
            <span>PDF Flowsheet</span>
          </button>
        </div>
      </div>

      {/* Scrollable Logs Feed */}
      <div className="flex-1 p-2 sm:p-3 overflow-y-auto space-y-1.5 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8 text-center">
            <ShieldAlert className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs font-bold text-slate-400">ยังไม่มีประวัติการบันทึก (No Logs Registered)</p>
            <p className="text-[10px] text-slate-600 mt-1 max-w-xs">
              เริ่ม CPR หรือเลือกช็อกไฟฟ้าเพื่อเริ่มบันทึกเวลากู้ชีพจรโดยอัตโนมัติ
            </p>
          </div>
        ) : (
          logs.map((log) => {
            let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
            if (log.type === 'cpr') badgeBg = 'bg-cyan-950 text-cyan-300 border-cyan-800';
            if (log.type === 'med') badgeBg = 'bg-indigo-950 text-indigo-300 border-indigo-800';
            if (log.type === 'shock') badgeBg = 'bg-amber-950 text-amber-300 border-amber-800';
            if (log.type === 'rhythm') badgeBg = 'bg-rose-950 text-rose-300 border-rose-800';
            if (log.type === 'system') badgeBg = 'bg-slate-950 text-emerald-300 border-emerald-900';

            return (
              <div
                key={log.id}
                className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-2 text-[11px] leading-snug"
              >
                <div className="flex items-start gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider shrink-0 mt-0.5 ${badgeBg}`}>
                    {log.type}
                  </span>
                  <span className="text-slate-200 font-sans font-semibold break-words">
                    {log.text}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-cyan-400 font-bold block leading-none">{log.time}</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">({log.elapsed})</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>

      {/* Custom Entry / Nurse's Note Form inside Flowsheet Log */}
      {handleLogCustomNote && setCustomNote && (
        <form onSubmit={handleLogCustomNote} className="bg-slate-950 p-2 border-t border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="พิมพ์บันทึกข้อความ Custom Entry / Nurse's Note..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-black text-xs cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log</span>
          </button>
        </form>
      )}
    </div>
  );
}

