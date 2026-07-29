export interface AltMedItem {
  id: string;
  name: string;
  shortName: string;
  dose: string;
  indication: string;
  colorClass: string;
  badgeClass: string;
  speechText: string;
}

export const ALT_RESUSCITATION_MEDS: AltMedItem[] = [
  {
    id: 'mgso4',
    name: 'Magnesium Sulfate 50%',
    shortName: '50%MgSO4 2g',
    dose: '2 g IV/IO over 1-2 min',
    indication: 'Torsades de Pointes / Severe Asthma',
    colorClass: 'border-purple-500/70 bg-purple-950/80 hover:bg-purple-900 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.25)]',
    badgeClass: 'bg-purple-900 text-purple-200 border-purple-700',
    speechText: 'ให้ยาห้าสิบเปอเซ็นแม๊กนีเซี่ยมซัลเฟ็ต สองกรำเรียบร้อยแล้วค่ะ',
  },
  {
    id: 'nahco3',
    name: 'Sodium Bicarbonate 7.5%',
    shortName: '7.5%NaHCO3 50mEq',
    dose: '50 mEq (1 mEq/kg) IV/IO slow push',
    indication: 'Metabolic Acidosis / Hyperkalemia / TCA Overdose',
    colorClass: 'border-sky-500/70 bg-sky-950/80 hover:bg-sky-900 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.25)]',
    badgeClass: 'bg-sky-900 text-sky-200 border-sky-700',
    speechText: 'ให้ยาเหจ็ดจุดห้าเปอเซ็นโซวเดี้ยม ไบคาบอเหน็ต ห้าสิบมิลลิควิวาเลน เรียบร้อยแล้วค่ะ',
  },
  {
    id: 'cagluconate',
    name: 'Calcium Gluconate 10%',
    shortName: '10%Ca Gluconate',
    dose: '10-20 mL (1-2 g) IV/IO over 5-10 min',
    indication: 'Hyperkalemia / CCB Toxicity',
    colorClass: 'border-amber-500/70 bg-amber-950/80 hover:bg-amber-900 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]',
    badgeClass: 'bg-amber-900 text-amber-200 border-amber-700',
    speechText: 'ให้ยาสิบเปอเซ็นแคลเซี่ยมกลูโคเหน็ตเรียบร้อยแล้วค่ะ',
  },
  {
    id: 'naloxone',
    name: 'Naloxone (Narcan)',
    shortName: 'Naloxone 0.4mg',
    dose: '0.4-2 mg IV/IO/IM every 2-3 min',
    indication: 'Opioid Toxicity',
    colorClass: 'border-emerald-500/70 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
    badgeClass: 'bg-emerald-900 text-emerald-200 border-emerald-700',
    speechText: 'นาล็อกโซน 0.4 มิลลิกรัม',
  },
  {
    id: 'ri_d50',
    name: 'RI 10U + Dextrose 50%',
    shortName: 'RI10U+50%Dext.',
    dose: 'RI 10 Units + 50% Dextrose 50 mL IV',
    indication: 'Hyperkalemia',
    colorClass: 'border-rose-500/70 bg-rose-950/80 hover:bg-rose-900 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.25)]',
    badgeClass: 'bg-rose-900 text-rose-200 border-rose-700',
    speechText: 'อาไอสิบยูหนิด บวกห้าสิบเปอเซ็นเด๊กโต๊ส',
  },
  {
    id: 'rtpa',
    name: 'Alteplase (rtPA)',
    shortName: 'Alteplase 50mg',
    dose: '50 mg IV bolus over 2 min',
    indication: 'Massive Pulmonary Embolism / PE Arrest',
    colorClass: 'border-pink-500/70 bg-pink-950/80 hover:bg-pink-900 text-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.25)]',
    badgeClass: 'bg-pink-900 text-pink-200 border-pink-700',
    speechText: 'อัลเตเพลส 50 มิลลิกรัม',
  },
];
