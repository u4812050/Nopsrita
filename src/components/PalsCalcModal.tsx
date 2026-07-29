import React, { useState } from 'react';
import { Baby, X, Zap, Syringe, Droplets, Heart, FileText, Check, ShieldAlert, Sparkles } from 'lucide-react';

interface PalsCalcModalProps {
  isOpen: boolean;
  onClose: () => void;
  addLog: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  speakThai: (text: string) => void;
}

export function PalsCalcModal({ isOpen, onClose, addLog, speakThai }: PalsCalcModalProps) {
  const [weightKg, setWeightKg] = useState<number>(10);
  const [ageYears, setAgeYears] = useState<number>(1);
  const [loggedSuccess, setLoggedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Weight preset updater
  const handleSelectPreset = (weight: number, age: number) => {
    setWeightKg(weight);
    setAgeYears(age);
    setLoggedSuccess(false);
  };

  // Helper when age changes: auto-estimate weight using Broselow / PALS formula (Age x 2 + 8) for > 1yr
  const handleAgeChange = (newAge: number) => {
    setAgeYears(newAge);
    setLoggedSuccess(false);
    if (newAge <= 0) {
      setWeightKg(3.5);
    } else if (newAge === 1) {
      setWeightKg(10);
    } else {
      setWeightKg(Math.round(newAge * 2 + 8));
    }
  };

  // CALCULATIONS
  // 1. Epinephrine 0.01 mg/kg (0.1 mL/kg of 1:10,000)
  const epiMgVal = Math.min(1.0, weightKg * 0.01);
  const epiMg = epiMgVal < 0.1 ? epiMgVal.toFixed(3) : epiMgVal.toFixed(2);
  const epiMl = Math.min(10.0, weightKg * 0.1).toFixed(1);

  // 2. Defibrillation Shocks: 2 J/kg -> 4 J/kg
  const defib1st = Math.min(200, Math.round(weightKg * 2));
  const defib2nd = Math.min(200, Math.round(weightKg * 4));
  const defibMax = Math.min(200, Math.round(weightKg * 10));

  // 3. Cardioversion: 0.5 - 1 J/kg
  const cardioInitialMin = Math.round(weightKg * 0.5);
  const cardioInitialMax = Math.round(weightKg * 1);

  // 4. Amiodarone: 5 mg/kg (max 300 mg)
  const amioMg = Math.min(300, Math.round(weightKg * 5));

  // 5. Lidocaine: 1 mg/kg (max 100 mg)
  const lidoMg = Math.min(100, Math.round(weightKg * 1));

  // 6. Atropine: 0.02 mg/kg (min 0.1 mg, max 0.5 mg)
  const atropineMgVal = Math.max(0.1, Math.min(0.5, weightKg * 0.02));
  const atropineMg = atropineMgVal.toFixed(2);

  // 7. Fluid Bolus: 20 mL/kg
  const fluidMl = Math.round(weightKg * 20);

  // 8. ETT Size & Depth
  const ettUncuffed = ageYears < 1 ? 3.5 : Number(((ageYears / 4) + 4).toFixed(1));
  const ettCuffed = ageYears < 1 ? 3.0 : Number(((ageYears / 4) + 3.5).toFixed(1));
  const ettDepth = Number((ettCuffed * 3).toFixed(1));
  const suctionFr = Math.round(ettCuffed * 2);

  // Handle logging calculated doses to patient case log
  const handleLogDoses = () => {
    const summaryLog = `PALS Calc (${weightKg} kg, ${ageYears} y/o): Epi ${epiMg}mg (${epiMl}mL 1:10k) | Defib 1st ${defib1st}J / 2nd ${defib2nd}J | Amio ${amioMg}mg | Lido ${lidoMg}mg | Fluid ${fluidMl}mL | ETT Cuffed ${ettCuffed}mm (Depth ${ettDepth}cm)`;
    
    addLog(summaryLog, 'system');
    speakThai(`บันทึกคำนวณขนาดยาเด็ก น้ำหนัก ${weightKg} กิโลกรัม เรียบร้อยแล้วค่ะ`);
    setLoggedSuccess(true);
    setTimeout(() => setLoggedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 p-3.5 sm:p-4 border-b border-cyan-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-900/80 border border-cyan-400/50 flex items-center justify-center shadow-md text-cyan-300">
              <Baby className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                  PALS PEDIATRIC CALCULATOR
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                  AHA 2025
                </span>
              </div>
              <p className="text-[10px] text-cyan-300/80 font-medium">
                Emergency Pediatric Dosing, Defibrillation & Airway Estimator
              </p>
            </div>
          </div>
          <button
            id="btn_close_pals_calc"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans">
          
          {/* Patient Weight & Age Selector */}
          <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Weight Input */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] uppercase font-bold text-cyan-400 mb-1">
                  Patient Weight (kg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input_pals_weight"
                    type="number"
                    min="1"
                    max="80"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => {
                      const val = Math.max(1, parseFloat(e.target.value) || 1);
                      setWeightKg(val);
                      setLoggedSuccess(false);
                    }}
                    className="w-24 px-3 py-1.5 bg-slate-900 border border-cyan-500/50 rounded-lg text-lg font-mono font-black text-cyan-200 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <span className="text-slate-400 font-bold text-sm">kg</span>
                </div>
              </div>

              {/* Age Input */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Age (Years)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input_pals_age"
                    type="number"
                    min="0"
                    max="18"
                    step="1"
                    value={ageYears}
                    onChange={(e) => handleAgeChange(parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-lg font-mono font-black text-white text-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <span className="text-slate-400 font-bold text-sm">y/o</span>
                </div>
              </div>

              {/* Weight Estimation Formula note */}
              <div className="text-right text-[10px] text-slate-400 font-mono hidden sm:block">
                <span>Est. Formula: </span>
                <span className="text-cyan-300 font-bold">(Age × 2) + 8 kg</span>
              </div>
            </div>

            {/* Quick Presets Pills */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Quick Weight Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { w: 3.5, a: 0, label: '3.5 kg (Infant)' },
                  { w: 5, a: 0.3, label: '5 kg (3 mo)' },
                  { w: 10, a: 1, label: '10 kg (1 yr)' },
                  { w: 15, a: 3, label: '15 kg (3 yr)' },
                  { w: 20, a: 5, label: '20 kg (5 yr)' },
                  { w: 30, a: 9, label: '30 kg (9 yr)' },
                  { w: 40, a: 12, label: '40 kg (12 yr)' },
                ].map((item) => (
                  <button
                    key={item.w}
                    onClick={() => handleSelectPreset(item.w, item.a)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer border ${
                      weightKg === item.w
                        ? 'bg-cyan-600 text-white border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CALCULATED RESULTS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* 1. EPINEPHRINE */}
            <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                  <Syringe className="w-3.5 h-3.5 text-rose-400" />
                  Epinephrine (Cardiac Arrest)
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400">0.01 mg/kg</span>
              </div>
              <div className="flex items-baseline justify-between bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-xl font-mono font-black text-rose-300">{epiMg}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">mg</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-black text-rose-400">{epiMl}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">mL (1:10,000)</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">IV/IO every 3-5 mins (Max 1 mg = 10 mL)</span>
            </div>

            {/* 2. DEFIBRILLATION SHOCKS */}
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Defibrillation Energy
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400">2 J/kg → 4 J/kg</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[9px] text-amber-300/80 font-bold">1st Shock (2 J/kg)</span>
                  <span className="text-xl font-mono font-black text-amber-300">{defib1st}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">Joules</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[9px] text-amber-400/80 font-bold">2nd Shock (4 J/kg)</span>
                  <span className="text-xl font-mono font-black text-amber-400">{defib2nd}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">Joules</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">Subsequent shocks ≥ 4 J/kg (Max 10 J/kg or adult 200J)</span>
            </div>

            {/* 3. AMIODARONE & LIDOCAINE */}
            <div className="bg-slate-950 p-3 rounded-xl border border-purple-900/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
                  <Syringe className="w-3.5 h-3.5 text-purple-400" />
                  Antiarrhythmics (VF/pVT)
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400">Amio 5mg/kg | Lido 1mg/kg</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[9px] text-purple-300 font-bold">Amiodarone</span>
                  <span className="text-xl font-mono font-black text-purple-300">{amioMg}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">mg</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[9px] text-purple-200 font-bold">Lidocaine</span>
                  <span className="text-xl font-mono font-black text-purple-200">{lidoMg}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">mg</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">Amio max 300 mg bolus | Lido max 100 mg</span>
            </div>

            {/* 4. FLUID BOLUS */}
            <div className="bg-slate-950 p-3 rounded-xl border border-cyan-900/60 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  Fluid Resuscitation (Bolus)
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400">20 mL/kg</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-mono font-black text-cyan-300">{fluidMl}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">mL (NS or LR)</span>
                </div>
                <span className="text-[10px] text-cyan-200 font-semibold bg-cyan-950 px-2 py-1 rounded border border-cyan-800">
                  Infuse over 5-20 min
                </span>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">Repeat as needed for hypovolemic/septic shock</span>
            </div>

            {/* 5. AIRWAY & ETT SIZE */}
            <div className="col-span-1 sm:col-span-2 bg-slate-950 p-3 rounded-xl border border-teal-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-teal-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                  Airway & Endotracheal Tube (ETT) Size
                </span>
                <span className="text-[9px] font-mono text-slate-400 font-bold">
                  Formula: (Age/4) + 3.5 Cuffed
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[9px] text-teal-300 font-bold">Cuffed ETT</span>
                  <span className="text-xl font-mono font-black text-teal-300">{ettCuffed}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">mm</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[9px] text-teal-200 font-bold">Uncuffed ETT</span>
                  <span className="text-xl font-mono font-black text-teal-200">{ettUncuffed}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">mm</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[9px] text-amber-300 font-bold">Lip Depth</span>
                  <span className="text-xl font-mono font-black text-amber-300">{ettDepth}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">cm</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[9px] text-slate-300 font-bold">Suction Size</span>
                  <span className="text-xl font-mono font-black text-slate-200">{suctionFr}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">Fr</span>
                </div>
              </div>
            </div>

            {/* 6. OTHER EMERGENCY DRUGS (Cardioversion, Atropine) */}
            <div className="col-span-1 sm:col-span-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Other Emergency Medications & Cardioversion
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Atropine (Bradycardia - 0.02 mg/kg):</span>
                  <span className="font-mono font-black text-amber-300 text-sm">{atropineMg} mg</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-semibold">Cardioversion (SVT/VT w/ pulse - 0.5-1 J/kg):</span>
                  <span className="font-mono font-black text-amber-300 text-sm">{cardioInitialMin} - {cardioInitialMax} J</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer with "Log Calculated Doses" Button */}
        <div className="bg-slate-950 p-3.5 sm:p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            Weight: <strong className="text-cyan-300">{weightKg} kg</strong> | Age: <strong className="text-white">{ageYears} y/o</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              id="btn_log_pals_calc"
              onClick={handleLogDoses}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-2 border shadow-md active:scale-95 ${
                loggedSuccess
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 border-cyan-300 shadow-cyan-500/25'
              }`}
            >
              {loggedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Logged to Case!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Log Calculated Doses</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
