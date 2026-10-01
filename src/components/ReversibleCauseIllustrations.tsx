import React from 'react';

/**
 * 5Hs Reversible Causes - High-fidelity clinical vector illustrations
 */

// 1. Hypovolemia: IV fluid bag + falling blood drop with low volume indicator
export function HypovolemiaIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#1a0a0f" />
      {/* IV Bag Pole hook */}
      <path d="M22 3V6M19 6H25" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      {/* IV Fluid Bag */}
      <path d="M15 8C15 7 16 6 17 6H27C28 6 29 7 29 8V24C29 26 26 27.5 22 27.5C18 27.5 15 26 15 24V8Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
      {/* Liquid inside IV Bag with volume scale */}
      <path d="M16 16C18 16 20 15 22 15C24 15 26 16 28 16V23.5C28 25 25.5 26.5 22 26.5C18.5 26.5 16 25 16 23.5V16Z" fill="#38bdf8" fillOpacity="0.25" />
      <line x1="18" y1="11" x2="21" y2="11" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="18" y1="14" x2="20" y2="14" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="18" y1="17" x2="21" y2="17" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      {/* Drip chamber */}
      <rect x="20.5" y="27.5" width="3" height="4.5" rx="1" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
      {/* Blood Droplet (Falling & Low Volume) */}
      <path d="M35 29C35 29 28 36.5 28 40C28 43.6 30.9 46.5 34.5 46.5C38.1 46.5 41 43.6 41 40C41 36.5 35 29 35 29Z" fill="url(#bloodGrad_h)" />
      {/* Droplet Highlight */}
      <ellipse cx="32.5" cy="40" rx="1.5" ry="2.8" fill="#ffffff" fillOpacity="0.45" transform="rotate(-25 32.5 40)" />
      {/* Downward Arrow for Volume Loss */}
      <path d="M10 33L10 43M10 43L7 40M10 43L13 40" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="bloodGrad_h" x1="34.5" y1="29" x2="34.5" y2="46.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f43f5e" />
          <stop offset="1" stopColor="#881337" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 2. Hypoxia: Anatomical lungs with bronchial tree + O2 deficit badge
export function HypoxiaIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#051b2c" />
      {/* Trachea */}
      <path d="M24 5V15M21 8H27M21 12H27" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bronchial branches */}
      <path d="M24 15C24 17 19 19 18 22M24 15C24 17 29 19 30 22" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Left Lung */}
      <path d="M19 22C13 23 10 27 10 34C10 39.5 14 41.5 19 40.5C21 40 22 37.5 21 33.5C20.5 28.5 21 23.5 19 22Z" fill="#0284c7" fillOpacity="0.45" stroke="#0ea5e9" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Right Lung */}
      <path d="M29 22C35 23 38 27 38 34C38 39.5 34 41.5 29 40.5C27 40 26 37.5 27 33.5C27.5 28.5 27 23.5 29 22Z" fill="#0284c7" fillOpacity="0.45" stroke="#0ea5e9" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Center O2 Low Badge */}
      <rect x="14" y="26" width="20" height="12" rx="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.3" />
      <text x="24" y="35" textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="900" fontFamily="sans-serif">O₂↓</text>
      {/* Airflow waves */}
      <path d="M5 13C8 12 10 15 13 14M35 14C38 15 40 12 43 13" stroke="#7dd3fc" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1.5 2" />
    </svg>
  );
}

// 3. Hydrogen Ion / Acidosis: Laboratory Erlenmeyer flask with bubbling acid and H+ badge
export function HydrogenIonAcidosisIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#170c24" />
      {/* Flask Neck and Rim */}
      <path d="M20 6H26M21 6V15L12 36C10.5 39.5 12.8 42.5 16.5 42.5H29.5C33.2 42.5 35.5 39.5 34 36L25 15V6" stroke="#c084fc" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Liquid Inside with Meniscus */}
      <path d="M14.5 34.5L17.5 29.5C19 30.5 21.5 28.8 23.5 29.8C25.5 30.8 28 29.2 29.5 29.8L32 34.5C33.5 38 31.8 41 28.5 41H17.5C14.2 41 12.8 38 14.5 34.5Z" fill="#9333ea" fillOpacity="0.5" stroke="#d946ef" strokeWidth="1" />
      {/* Bubbling acid dots */}
      <circle cx="20" cy="34" r="1.3" fill="#f5d0fe" />
      <circle cx="26" cy="32" r="1.1" fill="#f5d0fe" />
      <circle cx="22" cy="25" r="1.6" fill="#f5d0fe" />
      <circle cx="24" cy="18" r="1" fill="#f5d0fe" />
      {/* Chemical H+ badge */}
      <rect x="27" y="9" width="17" height="13" rx="3.5" fill="#4a044e" stroke="#f43f5e" strokeWidth="1.3" />
      <text x="35.5" y="19" textAnchor="middle" fill="#fbcfe8" fontSize="9" fontWeight="900" fontFamily="sans-serif">H⁺</text>
      {/* Low pH indicator */}
      <text x="11" y="17" textAnchor="middle" fill="#e879f9" fontSize="7" fontWeight="bold" fontFamily="monospace">pH↓</text>
    </svg>
  );
}

// 4. Hypo/Hyperkalemia: K+ potassium element block + ECG peaked T-wave & dual arrows
export function HypoHyperkalemiaIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#1f1205" />
      {/* Potassium K+ Periodic Badge */}
      <rect x="6" y="7" width="19" height="19" rx="3.5" fill="#451a03" stroke="#f59e0b" strokeWidth="1.4" />
      <text x="9.5" y="13" fill="#fbbf24" fontSize="5" fontWeight="bold" fontFamily="monospace">19</text>
      <text x="14" y="22.5" fill="#fef3c7" fontSize="11.5" fontWeight="900" fontFamily="sans-serif">K</text>
      <text x="21" y="15" fill="#f59e0b" fontSize="7.5" fontWeight="900" fontFamily="sans-serif">⁺</text>
      {/* Up/Down Arrow for Hypo/Hyper */}
      <path d="M29 8L29 16M29 8L26.5 11M29 8L31.5 11" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 16L36 8M36 16L33.5 13M36 16L38.5 13" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* ECG Rhythm Strip with Hyperkalemic peaked T wave */}
      <rect x="6" y="29" width="36" height="14" rx="2.5" fill="#0f172a" stroke="#78350f" strokeWidth="1" />
      {/* Baseline */}
      <line x1="6" y1="36" x2="42" y2="36" stroke="#334155" strokeWidth="0.5" strokeDasharray="1 1" />
      {/* P - QRS - Tall Tented T wave */}
      <path d="M7 36H11C12 34.5 13 34.5 14 36H15.5L17 38.5L18.5 31L20 41L21 36H24C25.5 36 27 29.5 28.5 29.5C30 29.5 31.5 36 33 36H41" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 5. Hypothermia: Thermometer with low mercury below 35°C + hexagonal ice crystal
export function HypothermiaIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#06182a" />
      {/* Clinical Thermometer Body */}
      <rect x="13" y="6" width="6" height="26" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
      {/* Bulb at bottom */}
      <circle cx="16" cy="35" r="5.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.4" />
      {/* Low Mercury Column (<35°C) */}
      <rect x="14.5" y="24" width="3" height="9" fill="#38bdf8" />
      <circle cx="16" cy="35" r="3.8" fill="#38bdf8" />
      {/* Graduations */}
      <line x1="19" y1="12" x2="21.5" y2="12" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="19" y1="17" x2="22.5" y2="17" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      <line x1="19" y1="22" x2="21.5" y2="22" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
      {/* Temperature readout badge */}
      <rect x="23" y="8" width="20" height="11" rx="3" fill="#082f49" stroke="#0284c7" strokeWidth="1" />
      <text x="33" y="16.5" textAnchor="middle" fill="#7dd3fc" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">&lt;35°C</text>
      {/* Snowflake / Ice Crystal Motif */}
      <g transform="translate(33, 33)">
        <line x1="0" y1="-7" x2="0" y2="7" stroke="#bae6fd" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="-7" y1="0" x2="7" y2="0" stroke="#bae6fd" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="-5" y1="-5" x2="5" y2="5" stroke="#bae6fd" strokeWidth="1.1" strokeLinecap="round" />
        <line x1="-5" y1="5" x2="5" y2="-5" stroke="#bae6fd" strokeWidth="1.1" strokeLinecap="round" />
        {/* Crystal tips */}
        <path d="M-2 -5L0 -7L2 -5M-2 5L0 7L2 5M-5 -2L-7 0L-5 2M5 -2L7 0L5 2" stroke="#e0f2fe" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="0" cy="0" r="1.4" fill="#ffffff" />
      </g>
    </svg>
  );
}

/**
 * 5Ts Reversible Causes - High-fidelity clinical vector illustrations
 */

// 1. Tension Pneumothorax: Collapsed lung, pleural air, needle decompression
export function TensionPneumothoraxIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#1f1105" />
      {/* Thorax / Ribcage outline */}
      <rect x="8" y="7" width="32" height="34" rx="4" fill="#0f172a" stroke="#78350f" strokeWidth="1.2" />
      {/* Normal Left Lung */}
      <path d="M14 18C14 14 18 12 21 15V37C17 37 14 34 14 28V18Z" fill="#0284c7" fillOpacity="0.4" stroke="#0ea5e9" strokeWidth="1.2" />
      {/* Collapsed Right Lung (shrunken) */}
      <path d="M27 22C27 20 29 19 31 20V31C29 31 27 30 27 27V22Z" fill="#e11d48" fillOpacity="0.5" stroke="#f43f5e" strokeWidth="1.2" />
      {/* Trapped Air in Pleura */}
      <path d="M33 16C37 19 37 28 35 34" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
      {/* Needle Decompression Cannula entering from top right */}
      <line x1="39" y1="8" x2="31" y2="18" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <polygon points="31,18 35,16 33,20" fill="#f59e0b" />
      {/* Decompression Air Jet */}
      <path d="M39 8L44 4M41 10L45 8" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// 2. Cardiac Tamponade: Distended pericardial sac with fluid compressing heart
export function CardiacTamponadeIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#1f0a0d" />
      {/* Pericardial Effusion Sac (outer distended fluid ring) */}
      <path d="M24 7C14 7 8 16 8 26C8 36 17 42 24 43C31 42 40 36 40 26C40 16 34 7 24 7Z" fill="#450a0a" fillOpacity="0.7" stroke="#f43f5e" strokeWidth="1.5" />
      {/* Trapped Pericardial Fluid Hatching */}
      <path d="M12 24C12 30 16 36 24 38C32 36 36 30 36 24" stroke="#f87171" strokeWidth="1" strokeDasharray="1.5 2" />
      {/* Compressed Heart Myocardium */}
      <path d="M24 15C21 11 16 12 15 17C14 22 20 27 24 31C28 27 34 22 33 17C32 12 27 11 24 15Z" fill="#991b1b" stroke="#fca5a5" strokeWidth="1.3" />
      {/* Pericardiocentesis Drainage Needle */}
      <line x1="12" y1="44" x2="21" y2="33" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <polygon points="21,33 18,36 22,36" fill="#38bdf8" />
    </svg>
  );
}

// 3. Toxins: Poison bottle with skull / antidote syringe
export function ToxinsIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#160824" />
      {/* Medicine Bottle */}
      <rect x="8" y="15" width="18" height="26" rx="3" fill="#2e1065" stroke="#c084fc" strokeWidth="1.4" />
      <rect x="11" y="9" width="12" height="6" rx="1.5" fill="#581c87" stroke="#c084fc" strokeWidth="1.2" />
      {/* Hazard Skull on Bottle */}
      <circle cx="17" cy="25" r="4.5" fill="#f5d0fe" />
      <rect x="15" y="28" width="4" height="3" rx="0.5" fill="#f5d0fe" />
      <circle cx="15.5" cy="24.5" r="1.1" fill="#2e1065" />
      <circle cx="18.5" cy="24.5" r="1.1" fill="#2e1065" />
      {/* Antidote Syringe */}
      <rect x="29" y="16" width="6" height="17" rx="1" transform="rotate(-30 29 16)" fill="#0f172a" stroke="#22c55e" strokeWidth="1.4" />
      <line x1="28" y1="34" x2="24" y2="41" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M37 7L41 9" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="39" y1="8" x2="35" y2="15" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 4. Thrombosis (Pulmonary): Pulmonary arterial bifurcation occluded by saddle embolus
export function ThrombosisPulmonaryIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#081c2e" />
      {/* Main Pulmonary Trunk */}
      <path d="M21 42V26C21 21 16 17 9 16V9C19 10 24 16 24 22C24 16 29 10 39 9V16C32 17 27 21 27 26V42H21Z" fill="#1e3a8a" fillOpacity="0.5" stroke="#38bdf8" strokeWidth="1.4" />
      {/* Red Thrombus / Saddle Embolus at Bifurcation */}
      <ellipse cx="24" cy="21" rx="5" ry="3.5" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.3" />
      <circle cx="21.5" cy="19.5" r="1.2" fill="#881337" />
      <circle cx="26" cy="21" r="1" fill="#881337" />
      {/* Ischemic warning pulse */}
      <path d="M9 22L13 22M35 22L39 22" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
      <text x="24" y="37" textAnchor="middle" fill="#67e8f9" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">PE</text>
    </svg>
  );
}

// 5. Thrombosis (Coronary): Coronary arterial occlusion & acute STEMI wave
export function ThrombosisCoronaryIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="8" fill="#21080b" />
      {/* Coronary Artery Vessel */}
      <path d="M7 11C16 11 20 22 28 22C34 22 37 14 41 14" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
      <path d="M7 11C16 11 20 22 28 22C34 22 37 14 41 14" stroke="#450a0a" strokeWidth="3" strokeLinecap="round" />
      {/* Plaque rupture & Red Clot Thrombus */}
      <circle cx="23" cy="18" r="4.5" fill="#e11d48" stroke="#fecdd3" strokeWidth="1.3" />
      <circle cx="24" cy="17" r="1.3" fill="#881337" />
      {/* STEMI ST-Elevation ECG Wave */}
      <rect x="7" y="27" width="34" height="15" rx="2.5" fill="#0f172a" stroke="#7f1d1d" strokeWidth="1" />
      <line x1="7" y1="36" x2="41" y2="36" stroke="#334155" strokeWidth="0.5" strokeDasharray="1 1" />
      {/* Acute Tombstone ST Elevation Wave */}
      <path d="M8 36H13L14 38L15.5 32L17 36H18C19 36 19.5 29 23 29C26.5 29 28 36 32 36H40" stroke="#f43f5e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Universal dynamic dispatcher for 5Hs and 5Ts illustrations
 */
export function ReversibleCauseIcon({ id, className = "w-10 h-10" }: { id: string; className?: string }) {
  switch (id) {
    // 5Hs
    case 'Hypovolemia':
      return <HypovolemiaIllustration className={className} />;
    case 'Hypoxia':
      return <HypoxiaIllustration className={className} />;
    case 'Hydrogen ion':
      return <HydrogenIonAcidosisIllustration className={className} />;
    case 'Hypo/Hyperkalemia':
      return <HypoHyperkalemiaIllustration className={className} />;
    case 'Hypothermia':
      return <HypothermiaIllustration className={className} />;

    // 5Ts
    case 'Tension pneumothorax':
      return <TensionPneumothoraxIllustration className={className} />;
    case 'Tamponade':
      return <CardiacTamponadeIllustration className={className} />;
    case 'Toxins':
      return <ToxinsIllustration className={className} />;
    case 'Thrombosis, pulmonary':
      return <ThrombosisPulmonaryIllustration className={className} />;
    case 'Thrombosis, coronary':
      return <ThrombosisCoronaryIllustration className={className} />;

    default:
      return null;
  }
}
