import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SARABUN_REGULAR_BASE64, SARABUN_BOLD_BASE64 } from './sarabunFonts';

export interface LogEntry {
  id: string;
  time: string;
  elapsed: string;
  text: string;
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

/**
 * Translates Thai log phrases to professional clinical English terminology for PDF rendering
 */
function translateLogTextToEnglish(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Common phrases mapping
  const replacements: [RegExp, string][] = [
    [/เริ่ม CPR/gi, 'CPR Started'],
    [/หยุด CPR|หยุดกดหน้าอก/gi, 'CPR Paused'],
    [/กดหน้าอกต่อ/gi, 'Resume CPR'],
    [/เลือกการนับ CPR 2 นาทีแบบต่อเนื่อง|เลือกการนับเวลา CPR 2 นาที แบบต่อเนื่อง/gi, 'Mode: 2-Min Continuous CPR'],
    [/เลือกการนับ CPR แบบ 30 ต่อ 2|เลือกการนับ 30 ต่อ 2/gi, 'Mode: 30:2 CPR (5 Cycles)'],
    [/CPR 30:2 ครบ 5 Cycle|CPR 30:2 ครบ 5 รอบ|ครบ 5 รอบ สามสิบต่อสอง|ครบ 5 ไซเคิล/gi, 'Completed 5 Cycles of 30:2 CPR'],
    [/CPR ต่อเนื่องครบ 2 นาที|CPR ครบ 2 นาที/gi, 'Completed 2-Min Continuous CPR'],
    [/ประเมินชีพจรและ EKG|ประเมินชีพจรและอีเคจี/gi, 'Assess Pulse & Rhythm (EKG)'],
    [/ครบรอบที่ (\d+)/gi, 'Completed 30:2 Cycle $1'],
    [/รอบที่ (\d+) จาก 5/gi, '30:2 Cycle $1 of 5'],
    [/รอบที่ (\d+)/gi, 'Cycle $1'],
    [/ปล่อยช็อกครั้งที่ (\d+)/gi, 'Defibrillation #$1 Delivered'],
    [/ช็อคได้/gi, 'Shockable Rhythm'],
    [/ช็อคไม่ได้/gi, 'Non-Shockable Rhythm'],
    [/เรียบร้อยแล้วค่ะ|เรียบร้อยแล้ว|แล้วค่ะ|ค่ะ|ครับ/gi, ''],
    [/ให้ยานอร์เอพิเนฟริน|ให้ยานอร์อดรีนาลีน/gi, 'Administer Norepinephrine'],
    [/ให้ยาเอพิเนฟริน|ให้ยาอดรีนาลีน/gi, 'Administer Epinephrine'],
    [/เปิดเส้นหลอดเลือดดำ|เปิดเส้น IV/gi, 'IV/IO Line Established'],
    [/ท่อช่วยหายใจ|ใส่ท่อช่วยหายใจ/gi, 'Advanced Airway Intubation (ET Tube)'],
    [/ตรวจ ETCO2|เช็ค ETCO2/gi, 'ETCO2 Capnography Monitored'],
    [/สแกน 5H 5T|สาเหตุที่แก้ไขได้/gi, 'Reversible Causes Evaluated (5Hs & 5Ts)'],
    [/ROSC สำเร็จ|สัญญาณชีพกลับมา/gi, 'ROSC Achieved (Return of Spontaneous Circulation)'],
    [/เริ่มต้นใหม่/gi, 'Case Reset']
  ];

  for (const [regex, replacement] of replacements) {
    cleaned = cleaned.replace(regex, replacement);
  }

  return cleaned.trim();
}

/**
 * Parses a single log entry into row columns matching the Clinical Resuscitation Flowsheet
 */
function parseLogRow(entry: LogEntry) {
  const text = entry.text || '';
  const textLower = text.toLowerCase();

  // 1. Time (ระบุ)
  const timeStr = `${entry.time}\n(${entry.elapsed})`;

  // 2. EKG Flags
  let vf = '';
  let pvt = '';
  let pea = '';
  let asystole = '';
  let bradycardia = '';
  let tachycardia = '';

  const markSymbol = 'X'; // Use 'X' (กากบาท) for universal compatibility with Sarabun font in PDF

  const isNonRhythmCheck =
    textLower === 'rhythm checked: shockable' ||
    textLower === 'rhythm checked: non-shockable' ||
    textLower.includes('clinical assessment') ||
    textLower.includes('reassess') ||
    textLower.includes('alert:') ||
    textLower.includes('procedure:') ||
    textLower.includes('manual entry:') ||
    textLower.includes('12-lead ecg') ||
    textLower.includes('diagnostics') ||
    textLower.includes('consulted');

  if (!isNonRhythmCheck) {
    if (
      textLower.includes('selected rhythm type: vf') ||
      textLower.includes('rhythm: vf') ||
      (textLower.includes('type: vf') && !textLower.includes('pulseless vt'))
    ) {
      vf = markSymbol;
    } else if (
      textLower.includes('selected rhythm type: pulseless vt') ||
      textLower.includes('rhythm: pulseless vt') ||
      textLower.includes('type: pulseless vt')
    ) {
      pvt = markSymbol;
    } else if (
      textLower.includes('selected rhythm type: asystole') ||
      textLower.includes('rhythm: asystole') ||
      textLower.includes('type: asystole')
    ) {
      asystole = markSymbol;
    } else if (
      textLower.includes('selected rhythm type: pea') ||
      textLower.includes('rhythm: pea') ||
      textLower.includes('type: pea')
    ) {
      pea = markSymbol;
    } else if (textLower.includes('vf / pulseless vt') || textLower.includes('vf/pvt')) {
      vf = markSymbol;
      pvt = markSymbol;
    } else if (
      textLower.includes('pulseless vt') ||
      textLower.includes('(pvt)') ||
      textLower.includes('(pulseless vt)')
    ) {
      pvt = markSymbol;
    } else if (
      textLower.includes('ventricular fibrillation') ||
      textLower.includes('(vf)') ||
      textLower.endsWith('vf')
    ) {
      vf = markSymbol;
    } else if (textLower.includes('asystole')) {
      asystole = markSymbol;
    } else if (textLower.includes('pea') || textLower.includes('pulseless electrical activity')) {
      pea = markSymbol;
    } else if (
      textLower === 'rhythm checked: bradycardia' ||
      textLower.includes('selected rhythm type: bradycardia') ||
      (textLower.includes('rhythm') && textLower.includes('bradycardia')) ||
      (entry.type === 'rhythm' && textLower.includes('bradycardia'))
    ) {
      bradycardia = markSymbol;
    } else if (
      textLower === 'rhythm checked: tachycardia' ||
      textLower.includes('selected rhythm type: tachycardia') ||
      (textLower.includes('rhythm') && textLower.includes('tachycardia')) ||
      (entry.type === 'rhythm' && textLower.includes('tachycardia'))
    ) {
      tachycardia = markSymbol;
    }
  }

  // 3. Defibrillation (J) / Cardioversion (J)
  let defibJ = '';
  if (!textLower.includes('sedation') && entry.type !== 'rhythm' && !textLower.includes('rhythm checked')) {
    const defibMatch = text.match(/(\d+)\s*J/i) || text.match(/defibrillation.*?(\d+)/i) || text.match(/cardioversion.*?(\d+)/i);
    if (
      entry.type === 'shock' ||
      textLower.includes('defibrillation') ||
      textLower.includes('cardioversion') ||
      textLower.includes('200j') ||
      textLower.includes('100j') ||
      textLower.includes('50j')
    ) {
      defibJ = defibMatch ? `${defibMatch[1]}` : (textLower.includes('cardioversion') ? '100' : '200');
    }
  }

  // 4. Drugs (9 items in exact requested order)
  let adrenaline = '';
  let amiodarone = '';
  let lidocaine = '';
  let atropine = '';
  let dopamine = '';
  let adenosine = '';
  let mgso4 = '';
  let caGluconate = '';
  let nahco3 = '';

  const isLabOrProcedureCheck =
    textLower.includes('เจาะเลือด') ||
    textLower.includes('ตรวจหา') ||
    textLower.includes('check serum') ||
    textLower.includes('checked serum') ||
    textLower.includes('electrolyte') ||
    textLower.includes('blood glucose') ||
    textLower.includes('labs') ||
    textLower.includes('investigated') ||
    textLower.includes('addressed') ||
    textLower.includes('deselected');

  const isMedicationLog =
    !isLabOrProcedureCheck &&
    (entry.type === 'med' ||
     textLower.includes('administered') ||
     textLower.includes('given') ||
     textLower.includes('started') ||
     textLower.includes('medication') ||
     textLower.includes('ให้ยา'));

  if (isMedicationLog) {
    const isNorEpi =
      textLower.includes('norepinephrine') ||
      textLower.includes('noradrenaline') ||
      textLower.includes('นอร์เอพิเนฟริน') ||
      textLower.includes('นอร์อดรีนาลีน') ||
      textLower.includes('nor-epinephrine') ||
      textLower.includes('nor-adrenaline');

    // 1. Adrenaline / Epinephrine (Exclude Norepinephrine/Noradrenaline)
    if (
      !isNorEpi &&
      (textLower.includes('epinephrine') ||
       textLower.includes('adrenaline') ||
       textLower.includes('เอพิเนฟริน') ||
       textLower.includes('อดรีนาลีน'))
    ) {
      const mgMatch = text.match(/(\d+(\.\d+)?)\s*mg/i);
      const mcgMatch = text.match(/(\d+-\d+)\s*mcg/i) || text.match(/(\d+)\s*mcg/i);
      if (mgMatch) {
        adrenaline = `${mgMatch[1]} mg`;
      } else if (mcgMatch) {
        adrenaline = `${mcgMatch[1]} mcg`;
      } else {
        adrenaline = '1 mg';
      }
    }

    // 2. Amiodarone
    if (textLower.includes('amiodarone') || textLower.includes('อะมิโอดาโรน')) {
      const mgMatch = text.match(/(\d+)\s*mg/i);
      amiodarone = mgMatch ? `${mgMatch[1]} mg` : (textLower.includes('150') ? '150 mg' : '300 mg');
    }

    // 3. Lidocaine
    if (textLower.includes('lidocaine') || textLower.includes('ลิโดเคน')) {
      const mgMatch = text.match(/(\d+(\.\d+)?)\s*mg/i);
      if (mgMatch) {
        lidocaine = `${mgMatch[1]} mg`;
      } else if (textLower.includes('1-1.5')) {
        lidocaine = '1-1.5 mg/kg';
      } else if (textLower.includes('0.5-0.75')) {
        lidocaine = '0.5-0.75 mg/kg';
      } else {
        lidocaine = '1 mg/kg';
      }
    }

    // 4. Atropine
    if (textLower.includes('atropine') || textLower.includes('อะโทรปีน') || textLower.includes('อะโทรพีน')) {
      const mgMatch = text.match(/(\d+(\.\d+)?)\s*mg/i);
      atropine = mgMatch ? `${mgMatch[1]} mg` : '1 mg';
    }

    // 5. Dopamine
    if (textLower.includes('dopamine') || textLower.includes('ดอปปามีน')) {
      const mcgMatch = text.match(/(\d+-\d+)\s*mcg/i) || text.match(/(\d+)\s*mcg/i);
      dopamine = mcgMatch ? `${mcgMatch[1]} mcg` : '5-20 mcg';
    }

    // 6. Adenosine
    if (textLower.includes('adenosine') || textLower.includes('อะดีโนซีน')) {
      const mgMatch = text.match(/(\d+)\s*mg/i);
      adenosine = mgMatch ? `${mgMatch[1]} mg` : '6 mg';
    }

    // 7. 50% MgSO4
    if (textLower.includes('mgso4') || textLower.includes('magnesium') || textLower.includes('แมกนีเซียม') || textLower.includes('mag sulfate')) {
      const gMatch = text.match(/(\d+(\.\d+)?)\s*g/i);
      mgso4 = gMatch ? `${gMatch[1]} g` : '2 g';
    }

    // 8. 10% Ca gluconate
    if (textLower.includes('ca gluconate') || textLower.includes('cal gluconate') || textLower.includes('gluconate') || textLower.includes('calcium') || textLower.includes('แคลเซียม')) {
      const gMatch = text.match(/(\d+(\.\d+)?)\s*g/i);
      const mlMatch = text.match(/(\d+)\s*ml/i);
      caGluconate = gMatch ? `${gMatch[1]} g` : (mlMatch ? `${mlMatch[1]} mL` : '1 g');
    }

    // 9. 7.5% NaHCO3
    if (textLower.includes('nahco3') || textLower.includes('bicarbonate') || textLower.includes('ไบคาบ') || textLower.includes('sodium bicarbonate')) {
      const meqMatch = text.match(/(\d+)\s*meq/i);
      const mlMatch = text.match(/(\d+)\s*ml/i);
      nahco3 = meqMatch ? `${meqMatch[1]} mEq` : (mlMatch ? `${mlMatch[1]} mL` : '50 mEq');
    }
  }

  // 5. Nurse's Note
  let nurseNote = translateLogTextToEnglish(text);

  if (textLower.includes('alteplase') || textLower.includes('rtpa') || textLower.includes('อัลเตเพลส')) {
    nurseNote = `Administered Alteplase (rtPA) 50mg IV bolus`;
  } else if (textLower.includes('naloxone') || textLower.includes('นาล็อกโซน')) {
    nurseNote = `Administered Naloxone 0.4mg IV`;
  } else if (textLower.includes('d50') || textLower.includes('insulin') || textLower.includes('อินซูลิน')) {
    nurseNote = `Administered Regular Insulin 10U + 50%Dextose IV`;
  } else if (textLower.includes('mgso4') || textLower.includes('magnesium') || textLower.includes('แมกนีเซียม')) {
    nurseNote = `Administered 50%MgSO4 2g IV`;
  } else if (textLower.includes('gluconate') || textLower.includes('calcium') || textLower.includes('แคลเซียม')) {
    nurseNote = `Administered 10%Ca Gluconate IV`;
  } else if (textLower.includes('nahco3') || textLower.includes('bicarbonate') || textLower.includes('ไบคาบ') || textLower.includes('ไบคาร์บอเนต')) {
    nurseNote = `Administered 7.5%NaHCO3 50mEq`;
  } else if (textLower.includes('noradrenaline') || textLower.includes('norepinephrine') || textLower.includes('นอร์อดรีนาลีน') || textLower.includes('นอร์เอพิเนฟริน')) {
    if (!nurseNote.toLowerCase().includes('norepinephrine') && !nurseNote.toLowerCase().includes('noradrenaline')) {
      nurseNote = `Norepinephrine Infusion (${nurseNote})`;
    }
  }

  return {
    timeStr,
    vf,
    pvt,
    pea,
    asystole,
    bradycardia,
    tachycardia,
    defibJ,
    adrenaline,
    amiodarone,
    lidocaine,
    atropine,
    dopamine,
    adenosine,
    mgso4,
    caGluconate,
    nahco3,
    nurseNote
  };
}

/**
 * Format MM:SS helper
 */
function formatMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper to load Thai Sarabun font into jsPDF instance for full UTF-8 Thai character support
 */
async function loadSarabunFonts(doc: jsPDF): Promise<boolean> {
  try {
    if (SARABUN_REGULAR_BASE64 && SARABUN_BOLD_BASE64) {
      doc.addFileToVFS('Sarabun-Regular.ttf', SARABUN_REGULAR_BASE64);
      doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');

      doc.addFileToVFS('Sarabun-Bold.ttf', SARABUN_BOLD_BASE64);
      doc.addFont('Sarabun-Bold.ttf', 'Sarabun', 'bold');

      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to load Thai font for PDF, falling back to Helvetica:', err);
    return false;
  }
}

/**
 * Generate and download a PDF Clinical Resuscitation Flowsheet based on the user's provided picture form
 */
export async function generateResuscitationPDF(logs: LogEntry[], stats: SummaryStats) {
  // Create jsPDF instance in A4 Landscape mode
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const fontLoaded = await loadSarabunFonts(doc);
  const activeFont = fontLoaded ? 'Sarabun' : 'helvetica';

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

  // --- HEADER TITLE BANNER ---
  doc.setFillColor(15, 118, 110); // Cyan-800 / Medical Teal
  doc.rect(10, 8, pageWidth - 20, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont(activeFont, 'bold');
  doc.setFontSize(14);
  doc.text('RESUSCITATION FLOWSHEET RECORD (บันทึกการฟื้นคืนชีพ)', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont(activeFont, 'normal');
  doc.text('SMART ACLS COPILOT - CLINICAL ADVANCED LIFE SUPPORT RECORD', pageWidth / 2, 20, { align: 'center' });

  // --- CASE PATIENT / SUMMARY METADATA BLOCK ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.rect(10, 26, pageWidth - 20, 18, 'FD');

  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(8.5);
  doc.setFont(activeFont, 'bold');

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const totalTimeStr = formatMMSS(stats.caseElapsedSeconds);

  // Column 1
  doc.text(`Date / Time: ${todayStr} ${new Date().toLocaleTimeString('en-US', { hour12: false })}`, 14, 31);
  doc.text(`Total Duration: ${totalTimeStr}`, 14, 36);
  doc.text(`CPR Cycles Completed: ${stats.cprCycle > 1 ? stats.cprCycle - 1 : 0} Cycles`, 14, 41);

  // Column 2
  doc.text(`Defibrillations Delivered: ${stats.shockCount} Shocks`, 85, 31);
  doc.text(`Epinephrine (Adrenaline): ${stats.epiCount} Doses (${stats.epiCount} mg)`, 85, 36);
  doc.text(`Amiodarone: ${stats.amioCount} Doses`, 85, 41);

  // Column 3
  doc.text(`Atropine: ${stats.atropineCount} Doses | Adenosine: ${stats.adenosineCount} Doses`, 165, 31);
  doc.text(`Reversible Causes Evaluated: 5Hs (${stats.checked5H.length}/5) | 5Ts (${stats.checked5T.length}/5)`, 165, 36);
  doc.text(`Case ID: ACLS-${Date.now().toString().slice(-6)}`, 165, 41);

  // --- BUILD FLOWSHEET TABLE MATCHING PICTURE FORM ---
  // Headers layout (18 columns total, including 9 Drug columns in exact requested order)
  const head = [
    [
      { content: 'Time\n(ระบุ)', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'EKG', colSpan: 6, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Defibrillation\n(J)', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Drugs', colSpan: 9, styles: { halign: 'center', valign: 'middle' } },
      { content: "Nurse's Note", rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
    ],
    [
      'VF',
      'Pulseless\nVT',
      'PEA',
      'Asystole',
      'Brady-\ncardia',
      'Tachy-\ncardia',
      'Adrenaline\n(mg)',
      'Amiodarone\n(mg)',
      'Lidocaine\n(mg)',
      'Atropine\n(mg)',
      'Dopamine\n(mcg)',
      'Adenosine\n(mg)',
      '50% MgSO4\n(g)',
      '10% Ca\ngluconate\n(g)',
      '7.5%\nNaHCO3\n(mEq)'
    ]
  ];

  // Convert logs to table rows (excluding mode switch log entries, 30s warnings, etc.)
  const filteredLogs = logs.filter(entry => {
    const txt = entry.text || '';
    return !txt.includes('Switched CPR Mode to') &&
           !txt.includes('30 seconds left in CPR Cycle') &&
           !txt.includes('Rhythm evaluation required immediately!');
  });

  const bodyRows = filteredLogs.map(entry => {
    const row = parseLogRow(entry);
    return [
      row.timeStr,
      row.vf,
      row.pvt,
      row.pea,
      row.asystole,
      row.bradycardia,
      row.tachycardia,
      row.defibJ,
      row.adrenaline,
      row.amiodarone,
      row.lidocaine,
      row.atropine,
      row.dopamine,
      row.adenosine,
      row.mgso4,
      row.caGluconate,
      row.nahco3,
      row.nurseNote
    ];
  });

  // If logs are few, append blank rows so the flowsheet looks like a complete hospital form
  const minRows = 12;
  while (bodyRows.length < minRows) {
    bodyRows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  }

  // Generate AutoTable
  autoTable(doc, {
    startY: 47,
    margin: { left: 10, right: 10, bottom: 25 },
    head: head as any,
    body: bodyRows,
    theme: 'grid',
    styles: {
      font: activeFont,
      fontSize: 6.5,
      cellPadding: 1,
      valign: 'middle',
      halign: 'center',
      textColor: [30, 41, 59],
      lineColor: [148, 163, 184], // Slate-400 crisp gridlines
      lineWidth: 0.2
    },
    headStyles: {
      font: activeFont,
      fillColor: [226, 232, 240], // Slate-200 light header background matching image
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 6.5,
      lineColor: [100, 116, 139],
      lineWidth: 0.3
    },
    columnStyles: {
      0: { cellWidth: 15, fontStyle: 'bold' }, // Time
      1: { cellWidth: 7 }, // VF
      2: { cellWidth: 10 }, // Pulseless VT
      3: { cellWidth: 8 }, // PEA
      4: { cellWidth: 9.5 }, // Asystole
      5: { cellWidth: 11 }, // Bradycardia
      6: { cellWidth: 11 }, // Tachycardia
      7: { cellWidth: 13, fontStyle: 'bold' }, // Defibrillation (J)
      8: { cellWidth: 12.5 }, // Adrenaline
      9: { cellWidth: 12.5 }, // Amiodarone
      10: { cellWidth: 12 }, // Lidocaine
      11: { cellWidth: 11.5 }, // Atropine
      12: { cellWidth: 12 }, // Dopamine
      13: { cellWidth: 12 }, // Adenosine
      14: { cellWidth: 12 }, // 50% MgSO4
      15: { cellWidth: 12.5 }, // 10% Ca gluconate
      16: { cellWidth: 12.5 }, // 7.5% NaHCO3
      17: { cellWidth: 'auto', halign: 'left' } // Nurse's Note
    },
    didDrawPage: (data) => {
      // --- FOOTER SIGNATURES & PAGE NUMBERS ---
      const footerY = pageHeight - 18;

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(10, footerY - 2, pageWidth - 10, footerY - 2);

      doc.setFontSize(8);
      doc.setFont(activeFont, 'bold');
      doc.setTextColor(71, 85, 105);

      // Signatures
      doc.text('Code Team Leader / Physician: ________________________', 14, footerY + 3);
      doc.text('Primary Nurse / Recorder: ________________________', 125, footerY + 3);
      doc.text(`Page ${data.pageNumber}`, pageWidth - 25, footerY + 3, { align: 'right' });

      doc.setFontSize(7);
      doc.setFont(activeFont, 'normal');
      doc.text('Verified Clinical Record - Smart ACLS Copilot (ACLS Guidelines)', 14, footerY + 8);
    }
  });

  // Save the generated PDF document
  doc.save(`ACLS_Resuscitation_Record_${todayStr.replace(/\s+/g, '_')}.pdf`);
}
