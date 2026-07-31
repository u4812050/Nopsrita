export interface LogEntry {
  id: string;
  time: string;      // Actual system time (e.g., "14:25:01")
  elapsed: string;   // Case elapsed time (e.g., "02:15")
  text: string;      // Description of the action
  type: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system';
}

export interface SummaryStats {
  caseElapsedSeconds: number;
  cprCycle: number;
  cprSubCycle302: number;
  shockCount: number;
  epiCount: number;
  amioCount: number;
  lidoCount: number;
  atropineCount: number;
  adenosineCount: number;
  noradrenalineCount: number;
  checked5H: string[];
  checked5T: string[];
}

export type GuidelineTab = 'hsts' | 'trc_cardiac' | 'trc_tachy_brady' | 'trc_rosc' | 'medHistory';

export type RhythmDecision = 'shockable' | 'non-shockable' | 'bradycardia' | 'tachycardia' | 'rosc' | null;

export type ShockableRhythmType = 'VF' | 'Pulseless VT' | 'Torsades' | null;

export type NonShockableRhythmType = 'Asystole' | 'PEA' | null;

export type StabilityStatus = 'stable' | 'unstable' | null;

export type RoscBPStatus = 'hypotension' | 'adequate' | 'unknown';

export type RoscSpO2Level = 'low' | 'normal' | 'high' | 'unknown';

export type RoscStemiStatus = 'yes' | 'no' | 'unknown';

export type RoscComatoseStatus = 'yes' | 'no' | 'unknown';

export interface ProcedurePreset {
  name: string;
  short: string;
}

export const PROCEDURE_PRESETS: ProcedurePreset[] = [
  { name: 'Advanced Airway Secured (ET Tube)', short: 'Airway Secured' },
  { name: 'Intubation Confirmed by ETCO2', short: 'ETCO2 Confirmed' },
  { name: 'IV / IO Line Established', short: 'IV Access' },
  { name: 'Arterial Blood Gas (ABG) Drawn', short: 'ABG Drawn' },
  { name: 'Mechanical Chest Compressor Applied', short: 'Mechanical CPR' },
  { name: 'Needle Decompression & Chest Drain (ICD)', short: 'Needle Decompress+ICD' },
];

export const FIVE_HS = [
  { id: 'Hypovolemia', label: 'Hypovolemia (ภาวะปริมาตรเลือดต่ำ)', desc: 'ให้ Fluid bolus IV/IO' },
  { id: 'Hypoxia', label: 'Hypoxia (ภาวะพร่องออกซิเจน)', desc: 'ให้ออกซิเจน 100% / Advanced Airway' },
  { id: 'Hydrogen ion', label: 'Hydrogen Ion / Acidosis (ภาวะเป็นกรด)', desc: 'ระบายลมหายใจ / NaHCO3 หากจำเป็น' },
  { id: 'Hypo/Hyperkalemia', label: 'Hypo/Hyperkalemia (เกลือแร่ผิดปกติ)', desc: 'เจาะเลือดส่ง Lab / ให้ Ca Gluconate, NaHCO3, Insulin' },
  { id: 'Hypothermia', label: 'Hypothermia (อุณหภูมิกายต่ำ)', desc: 'ให้ความอบอุ่นแก่ร่างกาย' }
];

export const FIVE_TS = [
  { id: 'Tension pneumothorax', label: 'Tension Pneumothorax (ลมในโพรงเยื่อหุ้มปอด)', desc: 'เจาะระบายลม Needle Decompression / Chest Drain' },
  { id: 'Tamponade', label: 'Tamponade, Cardiac (การกดทับหัวใจ)', desc: 'เจาะระบายน้ำ Pericardiocentesis' },
  { id: 'Toxins', label: 'Toxins (สารพิษ / ยาเกินขนาด)', desc: 'ให้ Antidote สารต้านพิษเฉพาะ' },
  { id: 'Thrombosis, pulmonary', label: 'Thrombosis, Pulmonary (ลิ่มเลือดอุดกั้นปอด)', desc: 'พิจารณาให้ยาสลายลิ่มเลือด Thrombolytic' },
  { id: 'Thrombosis, coronary', label: 'Thrombosis, Coronary (กล้ามเนื้อหัวใจขาดเลือด)', desc: 'ส่งทำฉีดสีหลอดเลือดหัวใจ CAG / PCI' }
];
