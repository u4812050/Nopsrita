import { SusRecord } from '../types';

export const GOOGLE_SHEET_WEBHOOK_KEY = 'smart_acls_sus_sheet_webhook_url';
export const GOOGLE_SHEET_AUTOSYNC_KEY = 'smart_acls_sus_sheet_autosync';

/**
 * URL ส่วนกลางของแอดมิน: เมื่อนำ URL ที่ได้จาก Google Apps Script มาใส่ตรงนี้
 * ทุก User จากทุกเครื่อง ทุกอุปกรณ์ที่เปิดเว็บแอป จะส่งผลการประเมินมาที่ Google Sheet นี้อัตโนมัติ 100%
 */
export const DEFAULT_CENTRAL_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwreI7mw27OHwSTVN4UZ2WNnLOLKet_HtaUAz26ml2uFpjuKuSCfsyYS3bD68OzxU39/exec';

/**
 * Standard Apps Script template to paste into Google Sheets
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// === Google Apps Script for Smart ACLS - SUS Score Collector ===
// 1. ไปที่ Google Sheet ของคุณ -> เมนู Extensions (ส่วนขยาย) -> Apps Script
// 2. ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดนี้ลงไป
// 3. กดบันทึก (Ctrl+S หรือ Cmd+S)
// 4. กดปุ่ม Deploy (ทำให้ใช้งานได้) -> New deployment (การทำให้ใช้งานได้ใหม่)
// 5. เลือกประเภท: Web app (เว็บแอป)
//    - Description: Smart ACLS SUS Collector
//    - Execute as: Me (ฉัน)
//    - Who has access: Anyone (ทุกคน) ***สำคัญมาก เพื่อให้ส่งข้อมูลได้โดยไม่ต้องล็อกอิน
// 6. กด Deploy แล้วคัดลอก Web App URL (ที่ลงท้ายด้วย /exec) มาวางในระบบ Smart ACLS

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("SUS_Scores") || ss.getActiveSheet();
    
    // ตั้งชื่อ Sheet เป็น SUS_Scores
    if (sheet.getName() !== "SUS_Scores" && ss.getSheets().length === 1 && sheet.getLastRow() === 0) {
      sheet.setName("SUS_Scores");
    }

    var contents = e.postData ? e.postData.contents : "";
    var data = JSON.parse(contents);

    // สร้าง Header อัตโนมัติในแถวแรกหากยังว่างอยู่
    if (sheet.getLastRow() === 0) {
      var headers = [
        "วัน-เวลาบันทึก (Timestamp)",
        "ชื่อผู้ประเมิน (Evaluator)",
        "ตำแหน่ง (Role)",
        "แผนก/หน่วยงาน (Department)",
        "คะแนนรวม (SUS Score)",
        "เกรด (Grade)",
        "ระดับความพึงพอใจ (Adjective)",
        "การยอมรับ (Acceptability)",
        "Q1 (บ่อยครั้ง)",
        "Q2 (ไม่ซับซ้อน)",
        "Q3 (ใช้ง่าย)",
        "Q4 (เรียนรู้เร็ว)",
        "Q5 (ฟังก์ชันสอดคล้อง)",
        "Q6 (มั่นใจในการใช้)",
        "Q7 (เข้าใจได้ไว)",
        "Q8 (สะดวกไม่ยุ่งยาก)",
        "Q9 (คล่องแคล่ว)",
        "Q10 (เข้าใจง่ายไม่ต้องพึ่งคู่มือ)",
        "ข้อเสนอแนะเพิ่มเติม (Comments)",
        "แหล่งที่มา (Source)",
        "Record ID"
      ];
      sheet.appendRow(headers);
      
      // จัดรูปแบบหัวตาราง
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#38bdf8");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // เตรียมแถวข้อมูล
    var answers = data.answers || {};
    var row = [
      data.timestamp || new Date().toLocaleString("th-TH"),
      data.evaluatorName || "Anonymous",
      data.evaluatorRole || "-",
      data.department || "-",
      typeof data.score === "number" ? Number(data.score.toFixed(1)) : (data.score || 0),
      data.grade || "-",
      data.adjective || "-",
      data.acceptability || "-",
      answers[1] || "",
      answers[2] || "",
      answers[3] || "",
      answers[4] || "",
      answers[5] || "",
      answers[6] || "",
      answers[7] || "",
      answers[8] || "",
      answers[9] || "",
      answers[10] || "",
      data.comments || "-",
      data.source || "Smart ACLS Copilot",
      data.id || ""
    ];

    sheet.appendRow(row);

    // Auto-fit คอลัมน์สำคัญ
    try {
      sheet.autoResizeColumns(1, 8);
    } catch(err) {}

    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      message: "บันทึกคะแนน SUS Score ลง Google Sheet สำเร็จแล้ว",
      row: sheet.getLastRow() 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      error: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Smart ACLS - SUS Score Webhook Endpoint",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Send a single SUS record to Google Sheets webhook
 */
export async function sendSusRecordToGoogleSheet(
  record: SusRecord,
  webhookUrl: string,
  extra?: { acceptability?: string; percentile?: string }
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return { success: false, message: 'Google Sheets Webhook URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย https://script.google.com/)' };
  }

  const cleanUrl = webhookUrl.trim();

  const payload = {
    id: record.id,
    timestamp: record.timestamp,
    evaluatorName: record.evaluatorName,
    evaluatorRole: record.evaluatorRole,
    department: record.department,
    score: record.score,
    grade: record.grade,
    adjective: record.adjective,
    acceptability: extra?.acceptability || (record.score >= 70 ? 'Acceptable' : record.score >= 50 ? 'Marginal' : 'Not Acceptable'),
    percentile: extra?.percentile || '',
    answers: record.answers,
    comments: record.comments,
    source: 'Smart ACLS Copilot Web App',
  };

  try {
    // Send as text/plain with no-cors to avoid CORS preflight rejection from Google Apps Script redirect
    await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return { success: true, message: 'ส่งข้อมูลไปยัง Google Sheet สำเร็จแล้ว' };
  } catch (err: any) {
    console.error('Failed to post to Google Sheets webhook', err);
    return { 
      success: false, 
      message: `ไม่สามารถส่งข้อมูลได้: ${err.message || 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'}` 
    };
  }
}

/**
 * Ping / Test the Google Sheets webhook URL
 */
export async function testPingGoogleSheet(
  webhookUrl: string
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('https://script.google.com/')) {
    return { 
      success: false, 
      message: 'กรุณาใส่ Web App URL ที่ได้จาก Google Apps Script (ขึ้นต้นด้วย https://script.google.com/.../exec)' 
    };
  }

  const cleanUrl = webhookUrl.trim();

  const testPayload = {
    id: `test_${Date.now()}`,
    timestamp: new Date().toLocaleString('th-TH'),
    evaluatorName: 'ทดสอบระบบการเชื่อมต่อ (Connection Test)',
    evaluatorRole: 'System Test',
    department: 'Smart ACLS Verification',
    score: 85.0,
    grade: 'A',
    adjective: 'Excellent (ทดสอบ)',
    acceptability: 'Acceptable',
    answers: { 1: 5, 2: 5, 3: 4, 4: 5, 5: 4, 6: 5, 7: 4, 8: 5, 9: 4, 10: 5 },
    comments: 'ข้อความทดสอบการเชื่อมต่ออัตโนมัติจาก Smart ACLS Copilot',
    source: 'Smart ACLS Test Ping',
  };

  try {
    await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(testPayload),
      mode: 'no-cors',
    });

    return { 
      success: true, 
      message: 'ทดสอบส่งข้อมูลสำเร็จ! กรุณาเปิดดูใน Google Sheet ว่ามีแถวข้อมูลทดสอบเพิ่มเข้ามาหรือไม่' 
    };
  } catch (err: any) {
    return { 
      success: false, 
      message: `เชื่อมต่อไม่สำเร็จ: ${err.message || 'ตรวจสอบการตั้งค่า Anyone บน Google Apps Script'}` 
    };
  }
}
