import React from 'react';
import { Volume2, RotateCcw, Heart, Sparkles, Sliders } from 'lucide-react';

interface ControlBarProps {
  testAudioSystem: () => void;
  audioTesting: boolean;
  voiceAlertsOn: boolean;
  setVoiceAlertsOn: (val: boolean) => void;
  metronomeOn: boolean;
  setMetronomeOn: (val: boolean) => void;
  metronomeTempo: number;
  setMetronomeTempo: (bpm: number) => void;
  metronomeMode: '30:2' | 'continuous';
  setMetronomeMode: (mode: '30:2' | 'continuous') => void;
  cprActive: boolean;
  metronomeBeat: number;
  confirmNewCase: () => void;
  addLog: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  speakThai: (text: string) => void;
}

export function ControlBar({
  testAudioSystem,
  audioTesting,
  voiceAlertsOn,
  setVoiceAlertsOn,
  metronomeOn,
  setMetronomeOn,
  metronomeTempo,
  setMetronomeTempo,
  metronomeMode,
  setMetronomeMode,
  cprActive,
  metronomeBeat,
  confirmNewCase,
  addLog,
  speakThai,
}: ControlBarProps) {
  return (
    <section className="bg-slate-900/90 border-b border-slate-800 py-1.5 px-2.5 sm:px-4 text-xs font-semibold text-slate-300 shrink-0 z-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left Side Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Thai Speech Verification */}
          <button
            id="btn_verify_thai_voice"
            onClick={testAudioSystem}
            disabled={audioTesting}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold transition-all cursor-pointer ${
              audioTesting
                ? 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-cyan-950/70 hover:bg-cyan-900/80 border-cyan-700/60 text-cyan-300 shadow-xs'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{audioTesting ? 'กำลังพูด...' : 'ทดสอบเสียงเตือน'}</span>
          </button>

          {/* Voice Alert Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800">
            <input
              id="chk_voice_alerts"
              type="checkbox"
              checked={voiceAlertsOn}
              onChange={(e) => {
                setVoiceAlertsOn(e.target.checked);
                addLog(`Thai Voice Alerts toggled ${e.target.checked ? 'ON' : 'OFF'}`, 'system');
              }}
              className="accent-cyan-500 cursor-pointer h-3.5 w-3.5 rounded"
            />
            <span className="text-slate-300 font-bold text-[11px]">เสียงไทย</span>
          </label>

          {/* Metronome Bar */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                id="chk_metronome"
                type="checkbox"
                checked={metronomeOn}
                onChange={(e) => setMetronomeOn(e.target.checked)}
                className="accent-cyan-500 cursor-pointer h-3.5 w-3.5 rounded"
              />
              <span className="flex items-center gap-1 text-slate-300 font-bold text-[11px]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    cprActive && metronomeOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                  }`}
                />
                Metronome ({metronomeTempo})
              </span>
            </label>

            {/* Mode Switch 30:2 vs Continuous */}
            <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded border border-slate-800 ml-1">
              <button
                id="btn_metronome_mode_30_2"
                onClick={() => {
                  setMetronomeMode('30:2');
                  speakThai('ตั้งค่าเมโทรนอม แบบ สามสิบ ต่อ สอง เรียบร้อยแล้วค่ะ');
                }}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                  metronomeMode === '30:2'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30:2
              </button>
              <button
                id="btn_metronome_mode_continuous"
                onClick={() => {
                  setMetronomeMode('continuous');
                  speakThai('ตั้งค่าเมโทรนอม แบบ ต่อเนื่อง เรียบร้อยแล้วค่ะ');
                }}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                  metronomeMode === 'continuous'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ต่อเนื่อง
              </button>
            </div>

            {/* BPM Presets */}
            <div className="hidden sm:flex items-center gap-1 ml-1">
              {[100, 110, 120].map((bpm) => (
                <button
                  key={bpm}
                  id={`btn_metronome_${bpm}`}
                  onClick={() => {
                    setMetronomeTempo(bpm);
                    speakThai(`ปรับจังหวะเมโทรนอมเป็น ${bpm} ครั้งต่อนาทีแล้วค่ะ`);
                  }}
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-black rounded border transition-all cursor-pointer ${
                    metronomeTempo === bpm
                      ? 'bg-cyan-700 text-white border-cyan-500'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  {bpm}
                </button>
              ))}
            </div>

            {/* Live Beat Badge */}
            {cprActive && metronomeOn && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-black text-[10px] border border-emerald-800 flex items-center gap-1 animate-pulse">
                <Heart className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                {metronomeMode === '30:2'
                  ? metronomeBeat >= 1 && metronomeBeat <= 30
                    ? `30:2 (${metronomeBeat})`
                    : `หายใจ (${metronomeBeat === 31 ? '1/2' : '2/2'})`
                  : `Beat ${metronomeBeat}`}
              </span>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <span
            id="badge_aha_guideline_2025"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wide bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            AHA GUIDELINE 2025
          </span>
          <button
            id="btn_new_case"
            onClick={confirmNewCase}
            className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Case</span>
          </button>
          <span className="hidden xl:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Offline Ready
          </span>
        </div>
      </div>
    </section>
  );
}
