import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ClipboardCheck, 
  Star, 
  CheckCircle2, 
  Copy, 
  RotateCcw, 
  Sparkles, 
  Award, 
  FileSpreadsheet, 
  UserCheck, 
  ThumbsUp, 
  Info,
  ChevronRight,
  TrendingUp,
  Clock,
  History
} from 'lucide-react';

export interface SusQuestion {
  id: number;
  textTh: string;
  textEn: string;
  isNegative: boolean;
}

export const SUS_QUESTIONS: SusQuestion[] = [
  {
    id: 1,
    textTh: "1. ฉันคิดว่าจะต้องการใช้งานระบบ Smart ACLS Copilot นี้บ่อยครั้งในการปฏิบัติงานหรือฝึกซ้อม",
    textEn: "I think that I would like to use this system frequently.",
    isNegative: false,
  },
  {
    id: 2,
    textTh: "2. ฉันพบว่าระบบนี้มีความเรียบง่าย ไม่ซับซ้อน และตรงไปตรงมาต่อการใช้งาน",
    textEn: "I found the system to be simple and straightforward to use.",
    isNegative: false,
  },
  {
    id: 3,
    textTh: "3. ฉันคิดว่าระบบนี้ใช้งานได้ง่าย สะดวก และเข้าใจคำสั่งได้ชัดเจน",
    textEn: "I thought the system was easy to use.",
    isNegative: false,
  },
  {
    id: 4,
    textTh: "4. ฉันคิดว่าสามารถใช้งานระบบนี้ได้ด้วยตนเองอย่างราบรื่น โดยไม่จำเป็นต้องพึ่งพาผู้เชี่ยวชาญด้านเทคนิค",
    textEn: "I think that I could use the system without the support of a technical person.",
    isNegative: false,
  },
  {
    id: 5,
    textTh: "5. ฉันพบว่าฟังก์ชันต่าง ๆ ในระบบ (CPR, ยา, ช็อกไฟฟ้า, อัลกอริทึม) มีการบูรณาการเชื่อมโยงกันอย่างดีเยี่ยม",
    textEn: "I found the various functions in this system were well integrated.",
    isNegative: false,
  },
  {
    id: 6,
    textTh: "6. ฉันรู้สึกว่าระบบนี้มีความสม่ำเสมอและมีความกลมกลืนเป็นอันหนึ่งอันเดียวกันในการทำงาน",
    textEn: "I felt the system was very consistent.",
    isNegative: false,
  },
  {
    id: 7,
    textTh: "7. ฉันคิดว่าบุคลากรทางการแพทย์และทีมกู้ชีพส่วนใหญ่จะเรียนรู้การใช้งานระบบนี้ได้อย่างรวดเร็ว",
    textEn: "I would imagine that most people would learn to use this system very quickly.",
    isNegative: false,
  },
  {
    id: 8,
    textTh: "8. ฉันพบว่าระบบนี้ใช้งานได้คล่องตัว สะดวกสบาย และเหมาะสมอย่างยิ่งต่อการปฏิบัติการช่วยชีวิตจริง",
    textEn: "I found the system very comfortable and intuitive to use.",
    isNegative: false,
  },
  {
    id: 9,
    textTh: "9. ฉันรู้สึกมั่นใจมากเมื่อใช้งานระบบนี้เป็นผู้ช่วยนำทางในระหว่างการกู้ชีพชั้นสูง (ACLS)",
    textEn: "I felt very confident using the system.",
    isNegative: false,
  },
  {
    id: 10,
    textTh: "10. ฉันสามารถเริ่มต้นใช้งานระบบนี้ได้อย่างรวดเร็ว โดยไม่จำเป็นต้องเรียนรู้สิ่งใหม่มากมายก่อนเริ่มใช้",
    textEn: "I could easily use the system right away without having to learn a lot of things.",
    isNegative: false,
  },
];

export interface SusRecord {
  id: string;
  timestamp: string;
  score: number;
  grade: string;
  adjective: string;
  evaluatorName: string;
  evaluatorRole: string;
  department: string;
  comments: string;
  answers: Record<number, number>;
}

export interface SusResultData {
  score: number;
  grade: string;
  adjective: string;
  evaluatorName: string;
  evaluatorRole: string;
}

interface SystemUsabilityScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  addLog?: (text: string, type?: 'cpr' | 'med' | 'shock' | 'rhythm' | 'note' | 'system') => void;
  isExportPending?: boolean;
  onSaveAndExportPDF?: (susData: SusResultData) => void;
  onDirectExportPDF?: () => void;
}

const SCALE_LABELS = [
  { val: 1, labelTh: 'ไม่เห็นด้วยอย่างยิ่ง', labelEn: 'Strongly Disagree', short: '1' },
  { val: 2, labelTh: 'ไม่เห็นด้วย', labelEn: 'Disagree', short: '2' },
  { val: 3, labelTh: 'ปานกลาง', labelEn: 'Neutral', short: '3' },
  { val: 4, labelTh: 'เห็นด้วย', labelEn: 'Agree', short: '4' },
  { val: 5, labelTh: 'เห็นด้วยอย่างยิ่ง', labelEn: 'Strongly Agree', short: '5' },
];

/**
 * คำนวณคะแนนตามมาตรฐานสากล All-Positive System Usability Scale (Sauro & Lewis, 2011)
 * ในแบบประเมินเชิงบวกทั้งหมด (All-Positive SUS):
 * - ทุกข้อเป็นคำถามเชิงบวก (Positive Statement)
 * - การแปลงคะแนนแต่ละข้อ: (คะแนนดิบที่เลือก - 1) ส่งผลให้แต่ละข้อมีคะแนนสะสม 0 ถึง 4 คะแนน
 *   (1 = 0 คะแนน, 2 = 1 คะแนน, 3 = 2 คะแนน, 4 = 3 คะแนน, 5 = 4 คะแนน)
 * - นำผลรวมคะแนนสะสมของทั้ง 10 ข้อ (สูงสุด 40 คะแนน) คูณด้วย 2.5 เพื่อปรับเป็นสเกล 0 - 100 คะแนนตามมาตรฐานสากล
 */
export function calculateSusScore(answers: Record<number, number>): number {
  let total = 0;
  for (let i = 1; i <= 10; i++) {
    const val = answers[i];
    if (val === undefined) continue;
    // All-Positive SUS: ทุกข้อเป็นเชิงบวก คะแนนสะสมคือ val - 1
    total += val - 1;
  }
  return total * 2.5;
}

export function getSusGradeInfo(score: number) {
  if (score >= 85) {
    return {
      grade: 'A+',
      adjective: 'Best Imaginable (ยอดเยี่ยมที่สุด)',
      adjectiveEn: 'Best Imaginable',
      colorBadge: 'bg-emerald-500 text-slate-950 font-black',
      textColor: 'text-emerald-400',
      bgBox: 'bg-emerald-950/70 border-emerald-500/80',
      barColor: 'bg-emerald-400',
      interpretation: 'ระดับยอดเยี่ยมสูงสุด (Top 10% Percentile) ผู้ใช้งานมีความพึงพอใจและแนะนำการใช้งานอย่างยิ่ง',
    };
  }
  if (score >= 80.3) {
    return {
      grade: 'A',
      adjective: 'Excellent (ยอดเยี่ยม)',
      adjectiveEn: 'Excellent',
      colorBadge: 'bg-cyan-400 text-slate-950 font-black',
      textColor: 'text-cyan-300',
      bgBox: 'bg-cyan-950/70 border-cyan-500/80',
      barColor: 'bg-cyan-400',
      interpretation: 'ระดับยอดเยี่ยมสูงกว่าเกณฑ์มาตรฐานสากล (Top 20% Percentile) ใช้งานง่ายและมีความน่าเชื่อถือสูง',
    };
  }
  if (score >= 68) {
    return {
      grade: 'B',
      adjective: 'Good (ผ่านเกณฑ์มาตรฐาน)',
      adjectiveEn: 'Good',
      colorBadge: 'bg-blue-500 text-white font-black',
      textColor: 'text-blue-300',
      bgBox: 'bg-blue-950/70 border-blue-500/80',
      barColor: 'bg-blue-400',
      interpretation: 'ผ่านเกณฑ์มาตรฐานความสามารถในการใช้งานสากล (Standard Benchmark Average = 68.0 คะแนน)',
    };
  }
  if (score >= 51) {
    return {
      grade: 'C (OK)',
      adjective: 'Marginal (พอใช้ / ระดับเริ่มต้น)',
      adjectiveEn: 'OK / Marginal',
      colorBadge: 'bg-amber-500 text-slate-950 font-black',
      textColor: 'text-amber-300',
      bgBox: 'bg-amber-950/70 border-amber-500/80',
      barColor: 'bg-amber-400',
      interpretation: 'อยู่ในเกณฑ์พอใช้ที่ยอมรับได้เบื้องต้น แต่มีบางฟังก์ชันที่ควรพัฒนาและปรับปรุงเพื่อความคล่องตัว',
    };
  }
  return {
    grade: 'F',
    adjective: 'Poor (ควรปรับปรุง)',
    adjectiveEn: 'Poor',
    colorBadge: 'bg-rose-500 text-white font-black',
    textColor: 'text-rose-400',
    bgBox: 'bg-rose-950/70 border-rose-500/80',
    barColor: 'bg-rose-500',
    interpretation: 'ต่ำกว่าเกณฑ์มาตรฐานการใช้งาน (Below Average) จำเป็นต้องปรับปรุงความง่ายและลดความซับซ้อน',
  };
}

const STORAGE_KEY = 'smart_acls_sus_records';
const CURRENT_ANSWERS_KEY = 'smart_acls_sus_current_draft';

export function SystemUsabilityScaleModal({
  isOpen,
  onClose,
  addLog,
  isExportPending = false,
  onSaveAndExportPDF,
  onDirectExportPDF,
}: SystemUsabilityScaleModalProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [evaluatorName, setEvaluatorName] = useState<string>('');
  const [evaluatorRole, setEvaluatorRole] = useState<string>('แพทย์ (Physician)');
  const [department, setDepartment] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyRecords, setHistoryRecords] = useState<SusRecord[]>([]);

  // Load draft & history from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedDraft = localStorage.getItem(CURRENT_ANSWERS_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.evaluatorName) setEvaluatorName(parsed.evaluatorName);
        if (parsed.evaluatorRole) setEvaluatorRole(parsed.evaluatorRole);
        if (parsed.department) setDepartment(parsed.department);
        if (parsed.comments) setComments(parsed.comments);
      }

      const savedRecords = localStorage.getItem(STORAGE_KEY);
      if (savedRecords) {
        setHistoryRecords(JSON.parse(savedRecords));
      }
    } catch (e) {
      console.warn('Could not read SUS records from localStorage', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === 10;
  const currentScore = calculateSusScore(answers);
  const gradeInfo = getSusGradeInfo(currentScore);

  const handleSelectScore = (questionId: number, value: number) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    setSavedSuccess(false);
    try {
      localStorage.setItem(
        CURRENT_ANSWERS_KEY,
        JSON.stringify({
          answers: updated,
          evaluatorName,
          evaluatorRole,
          department,
          comments,
        })
      );
    } catch (e) {
      // ignore
    }
  };

  const handleSaveEvaluation = () => {
    const nowStr = new Date().toLocaleString('th-TH', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const newRecord: SusRecord = {
      id: `sus_${Date.now()}`,
      timestamp: nowStr,
      score: currentScore,
      grade: gradeInfo.grade,
      adjective: gradeInfo.adjective,
      evaluatorName: evaluatorName.trim() || 'บุคลากรทางการแพทย์ (Anonymous)',
      evaluatorRole,
      department: department.trim() || 'ฉุกเฉิน/ห้องกู้ชีพ (Resuscitation)',
      comments: comments.trim(),
      answers,
    };

    const updatedList = [newRecord, ...historyRecords];
    setHistoryRecords(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Could not persist SUS record', e);
    }

    if (addLog) {
      addLog(
        `ประเมินความพึงพอใจ SUS Score: ${currentScore.toFixed(1)}/100 (${gradeInfo.grade} - ${gradeInfo.adjective}) โดย ${newRecord.evaluatorName} [${newRecord.evaluatorRole}]`,
        'system'
      );
    }

    setSavedSuccess(true);
    if (onSaveAndExportPDF) {
      setTimeout(() => {
        onSaveAndExportPDF({
          score: currentScore,
          grade: gradeInfo.grade,
          adjective: gradeInfo.adjective,
          evaluatorName: newRecord.evaluatorName,
          evaluatorRole: newRecord.evaluatorRole,
        });
      }, 500);
    } else {
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  const handleResetForm = () => {
    if (confirm('คุณต้องการรีเซ็ตคำตอบแบบประเมิน SUS ทั้งหมดใช่หรือไม่?')) {
      setAnswers({});
      setComments('');
      setSavedSuccess(false);
      try {
        localStorage.removeItem(CURRENT_ANSWERS_KEY);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleCopySummary = () => {
    const summaryText = `=== แบบประเมินความพึงพอใจ ALL-POSITIVE SYSTEM USABILITY SCALE (SUS) ===
ระบบ: Smart ACLS Copilot (Critical Care Resuscitation System)
คะแนนรวม SUS Score: ${currentScore.toFixed(1)} / 100 คะแนน
ระดับเกรด (Grade): ${gradeInfo.grade} (${gradeInfo.adjective})
การแปลผล: ${gradeInfo.interpretation}

ผู้ประเมิน: ${evaluatorName || 'ไม่ระบุชื่อ'}
ตำแหน่ง: ${evaluatorRole}
หน่วยงาน/แผนก: ${department || 'ไม่ระบุ'}
ข้อคิดเห็น/ข้อเสนอแนะเพิ่มเติม: ${comments || '-'}
วันที่ประเมิน: ${new Date().toLocaleString('th-TH')}
เกณฑ์มาตรฐานอ้างอิง: All-Positive System Usability Scale (Sauro & Lewis, 2011) & ISO 9241-11
===================================================`;

    try {
      const el = document.createElement('textarea');
      el.value = summaryText;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert('ไม่สามารถคัดลอกข้อความได้');
    }
  };

  // Quick fill preset for testing
  const handleQuickPreset = (type: 'high' | 'neutral') => {
    const preset: Record<number, number> = {};
    SUS_QUESTIONS.forEach((q) => {
      if (type === 'high') {
        preset[q.id] = 5;
      } else {
        preset[q.id] = 3;
      }
    });
    setAnswers(preset);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 pt-safe pb-safe pl-safe pr-safe"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-amber-900/60 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black text-white font-mono tracking-tight">
                  แบบประเมินความพึงพอใจ System Usability Scale (SUS)
                </h2>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                  All-Positive SUS / Sauro & Lewis
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-200/80">
                แบบประเมินมาตรฐานสากล All-Positive SUS 10 ข้อ (คำถามเชิงบวกทั้งหมด) ตามมาตรฐาน Sauro & Lewis (2011) เพื่อความชัดเจนและลดความคลาดเคลื่อนในการประเมิน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHistory(!showHistory)}
              title="ดูประวัติการประเมินที่บันทึกไว้"
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                showHistory 
                  ? 'bg-amber-600 text-white border-amber-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <History className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">ประวัติ ({historyRecords.length})</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Export PDF Prerequisite Notice Banner */}
        {isExportPending && (
          <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-b border-amber-500/50 px-3.5 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-inner">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-200 font-bold">
              <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span>
                ขั้นตอนก่อนส่งออก <strong className="text-amber-300 font-black">PDF Flowsheet</strong>: กรุณาบันทึกการประเมิน SUS ระบบจะนำคะแนนไประบุในเอกสารและดาวน์โหลด PDF อัตโนมัติ
              </span>
            </div>
            {onDirectExportPDF && (
              <button
                type="button"
                onClick={onDirectExportPDF}
                className="text-[11px] font-bold text-amber-400 hover:text-white underline cursor-pointer shrink-0 ml-auto"
                title="ข้ามแบบประเมินและดาวน์โหลด PDF ทันทีสำหรับกรณีเร่งด่วน"
              >
                ข้ามไปส่งออก PDF ทันที (กรณีเร่งด่วน) &rarr;
              </button>
            )}
          </div>
        )}

        {/* Live Score Summary Banner */}
        <div className="px-3.5 sm:px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Score Gauge Circle / Box */}
              <div className={`px-3 py-1.5 rounded-xl border flex items-baseline gap-1.5 shadow-inner ${gradeInfo.bgBox}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  SUS Score:
                </span>
                <span className={`text-xl sm:text-2xl font-black font-mono leading-none ${gradeInfo.textColor}`}>
                  {currentScore.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">/ 100</span>
              </div>

              {/* Grade Badge */}
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-xs sm:text-sm font-black shadow-xs ${gradeInfo.colorBadge}`}>
                  GRADE {gradeInfo.grade}
                </span>
                <span className={`text-xs font-bold hidden xs:inline ${gradeInfo.textColor}`}>
                  {gradeInfo.adjective}
                </span>
              </div>
            </div>

            {/* Answered Progress Bar */}
            <div className="flex items-center gap-2 text-right">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400">
                ตอบแล้ว <strong className="text-amber-300 font-black">{answeredCount}</strong> / 10 ข้อ
              </span>
              <div className="w-20 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all duration-300 ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  style={{ width: `${(answeredCount / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interpretation text */}
          <div className="mt-1.5 pt-1.5 border-t border-slate-900 flex items-center justify-between text-[10.5px] text-slate-400">
            <span className="truncate">
              เกณฑ์ค่าเฉลี่ยสากล = <strong>68.0 คะแนน</strong> • {gradeInfo.interpretation}
            </span>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleQuickPreset('high')}
                className="text-[10px] text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
              >
                ใส่คำตอบตัวอย่าง (คะแนนสูง A+)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 text-left">
          {/* View History Drawer if toggled */}
          {showHistory ? (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  ประวัติผลการประเมิน SUS ที่บันทึกไว้ในอุปกรณ์นี้ ({historyRecords.length} รายการ)
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  กลับไปทำแบบประเมิน
                </button>
              </div>

              {historyRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
                  ยังไม่มีประวัติการบันทึกผลการประเมิน เมื่อตอบแบบสอบถามครบแล้วให้กดปุ่ม "บันทึกผลการประเมิน"
                </div>
              ) : (
                <div className="space-y-2">
                  {historyRecords.map((rec) => {
                    const recGrade = getSusGradeInfo(rec.score);
                    return (
                      <div
                        key={rec.id}
                        className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-black ${recGrade.colorBadge}`}>
                              {rec.score.toFixed(1)} ({recGrade.grade})
                            </span>
                            <span className="font-bold text-xs text-white">{rec.evaluatorName}</span>
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60">
                              {rec.evaluatorRole}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            หน่วยงาน: {rec.department} • บันทึกเมื่อ: {rec.timestamp}
                          </p>
                          {rec.comments && (
                            <p className="text-[11px] text-amber-200/90 mt-1 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                              "{rec.comments}"
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-[11px] font-bold block ${recGrade.textColor}`}>
                            {recGrade.adjective}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm('คุณต้องการลบประวัติการประเมิน SUS ทั้งหมดออกจากเครื่องหรือไม่?')) {
                          localStorage.removeItem(STORAGE_KEY);
                          setHistoryRecords([]);
                        }
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                    >
                      ลบประวัติทั้งหมด (Clear History)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Evaluator Profile Form (Optional but standard for clinical auditing) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-2.5">
                <span className="text-[10.5px] uppercase tracking-wider font-bold text-cyan-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  ข้อมูลผู้ประเมิน (Evaluator Information - ไม่บังคับ)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">ชื่อ หรือ รหัสผู้ประเมิน:</label>
                    <input
                      type="text"
                      value={evaluatorName}
                      onChange={(e) => setEvaluatorName(e.target.value)}
                      placeholder="เช่น นพ.สมชาย / รหัส 102"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">ตำแหน่ง / บทบาท:</label>
                    <select
                      value={evaluatorRole}
                      onChange={(e) => setEvaluatorRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="แพทย์ (Physician)">แพทย์ (Physician)</option>
                      <option value="พยาบาลวิชาชีพ (Registered Nurse)">พยาบาลวิชาชีพ (Registered Nurse)</option>
                      <option value="เจ้าหน้าที่กู้ชีพ/EMT/Paramedic">เจ้าหน้าที่กู้ชีพ / EMT / Paramedic</option>
                      <option value="นิสิต/นักศึกษาแพทย์ (Medical Student)">นิสิต/นักศึกษาแพทย์ (Medical Student)</option>
                      <option value="อาจารย์แพทย์/ผู้ฝึกสอน (Instructor)">อาจารย์แพทย์ / ผู้ฝึกสอน (Instructor)</option>
                      <option value="บุคลากรทางการแพทย์อื่นๆ (Other)">บุคลากรทางการแพทย์อื่นๆ (Other)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">แผนก / หน่วยงาน:</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="เช่น ER, ICU, Simulation Center"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions Banner */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  เกณฑ์การให้คะแนน: <strong className="text-slate-300">1 = ไม่เห็นด้วยอย่างยิ่ง</strong> ถึง <strong className="text-slate-300">5 = เห็นด้วยอย่างยิ่ง</strong>
                </span>
                <span className="hidden sm:inline font-mono text-[10px] text-emerald-300/90">
                  *แบบประเมินเชิงบวกมาตรฐาน (All-Positive SUS): แปลงคะแนนตามสูตรสากล (คะแนนดิบ - 1) × 2.5
                </span>
              </div>

              {/* 10 SUS Questions List */}
              <div className="space-y-2.5">
                {SUS_QUESTIONS.map((q) => {
                  const currentVal = answers[q.id];
                  const isAnswered = currentVal !== undefined;

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isAnswered
                          ? 'bg-slate-950/80 border-slate-800'
                          : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-[13px] text-white leading-snug">
                              {q.textTh}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 shrink-0">
                              เชิงบวก
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400/80 italic mt-0.5">
                            {q.textEn}
                          </p>
                        </div>

                        {isAnswered && (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0 self-start">
                            คะแนน: {currentVal}
                          </span>
                        )}
                      </div>

                      {/* 5-Point Likert Radio Buttons */}
                      <div className="grid grid-cols-5 gap-1 sm:gap-2 pt-1">
                        {SCALE_LABELS.map((opt) => {
                          const isSelected = currentVal === opt.val;
                          return (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => handleSelectScore(q.id, opt.val)}
                              className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                                isSelected
                                  ? 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-white font-black shadow-md ring-2 ring-amber-400/60'
                                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              <span className="text-xs sm:text-sm font-black font-mono leading-none">
                                {opt.val}
                              </span>
                              <span className="text-[8px] sm:text-[9.5px] leading-tight font-medium opacity-90 truncate max-w-full px-0.5">
                                {opt.labelTh}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Qualitative Comments Box */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                  ข้อเสนอแนะเพิ่มเติมสำหรับการพัฒนาระบบ Smart ACLS Copilot:
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="พิมพ์ความคิดเห็น ข้อเสนอแนะ หรือปัญหาที่พบขณะนำไปใช้งานจริง เช่น เสียงเตือน, ความชัดเจนของขั้นตอน, การกดปุ่ม..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-3.5 sm:px-5 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">ล้างคำตอบ</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/80 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copied ? 'คัดลอกผลแล้ว!' : 'คัดลอกผลคะแนน'}</span>
            </button>

            {isExportPending && onDirectExportPDF && (
              <button
                type="button"
                onClick={onDirectExportPDF}
                className="hidden md:flex px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300/90 hover:text-white bg-amber-950/50 hover:bg-amber-900/70 border border-amber-800/60 items-center gap-1 cursor-pointer transition-all"
                title="ข้ามการประเมินและส่งออก PDF เลย"
              >
                <span>ข้ามไปส่งออก PDF ทันที</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isExportPending ? 'บันทึกสำเร็จ! กำลังส่งออก PDF...' : 'บันทึกผลสำเร็จเรียบร้อยแล้ว'}
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveEvaluation}
              disabled={answeredCount === 0}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-lg cursor-pointer transition-all active:scale-95 ${
                answeredCount === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isComplete
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-amber-500/20 ring-2 ring-amber-400'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isExportPending ? (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                  <span>บันทึกคะแนน SUS & ส่งออก PDF ({currentScore.toFixed(1)})</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>บันทึกผลการประเมิน ({currentScore.toFixed(1)})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
