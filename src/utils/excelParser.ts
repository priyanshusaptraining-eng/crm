import { Lead, CallStatus } from '../types/crm';
import { normalizePhoneNumber } from './phoneUtils';

export interface ParsedLeadRow {
  id: string;
  rowNumber: number;
  name: string;
  phone: string;
  email: string;
  location: string;
  course: string;
  source: string;
  status: CallStatus;
  feedback: string;
  followUpDate: string;
  demoDate: string;
  scheduledCallDate: string;
  scheduledCallTime: string;
  dealValue: number;
  amountPaid: number;
  assignedTo: string;
  assignedUserName: string;
  
  // Validation status
  isValid: boolean;
  isDuplicate: boolean;
  duplicateMatchedLeadId?: string;
  duplicateMatchedLeadName?: string;
  duplicateField?: 'phone' | 'email';
  errors: string[];
}

export interface ColumnMapping {
  nameCol: number;
  phoneCol: number;
  emailCol: number;
  locationCol: number;
  courseCol: number;
  sourceCol: number;
  statusCol: number;
  notesCol: number;
  followUpDateCol: number;
  demoDateCol: number;
  callDateCol: number;
  callTimeCol: number;
  feeCol: number;
  paidCol: number;
}

// Normalize CallStatus from text
export function parseStatusFromText(text: string): CallStatus {
  if (!text) return 'new';
  const clean = text.trim().toLowerCase().replace(/[\s-_]+/g, '_');
  
  if (clean.includes('interested') && !clean.includes('not')) return 'interested';
  if (clean.includes('demo') && (clean.includes('sched') || clean.includes('book'))) return 'demo_scheduled';
  if (clean.includes('call_later') || clean.includes('callback') || clean.includes('follow')) return 'call_later';
  if (clean.includes('admit') || clean.includes('join') || clean.includes('enrolled')) return 'admission_joined';
  if (clean.includes('not_int') || clean.includes('ni') || clean.includes('lost') || clean.includes('reject')) return 'not_interested';
  if (clean.includes('npu') || clean.includes('no_pick') || clean.includes('not_pick') || clean.includes('unreach')) return 'npu';
  if (clean.includes('hot')) return 'hot';
  if (clean.includes('warm')) return 'warm';
  if (clean.includes('cold')) return 'cold';
  return 'new';
}

// Split text into grid respecting quoted values
export function splitClipboardIntoGrid(text: string): string[][] {
  if (!text) return [];

  // Determine primary row separator
  const rawRows = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const grid: string[][] = [];

  for (const rawRow of rawRows) {
    if (!rawRow.trim()) continue; // skip blank empty lines
    
    // Check delimiter: tab vs comma
    if (rawRow.includes('\t')) {
      // Excel & Google Sheets copy-paste always uses TAB
      const cells = rawRow.split('\t').map(c => c.trim().replace(/^["']|["']$/g, ''));
      grid.push(cells);
    } else if (rawRow.includes(',')) {
      // CSV format parser
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < rawRow.length; i++) {
        const char = rawRow[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      grid.push(cells);
    } else {
      // Single cell or whitespace
      grid.push([rawRow.trim()]);
    }
  }

  return grid;
}

// Detect header column indices from row 0
export function detectColumnMapping(headerRow: string[]): { mapping: ColumnMapping; hasHeaders: boolean } {
  const normalized = headerRow.map(h => h.toLowerCase().trim());
  
  const mapping: ColumnMapping = {
    nameCol: -1,
    phoneCol: -1,
    emailCol: -1,
    locationCol: -1,
    courseCol: -1,
    sourceCol: -1,
    statusCol: -1,
    notesCol: -1,
    followUpDateCol: -1,
    demoDateCol: -1,
    callDateCol: -1,
    callTimeCol: -1,
    feeCol: -1,
    paidCol: -1,
  };

  let recognizedHeaders = 0;

  normalized.forEach((header, idx) => {
    if (/(student|candidate|full\s*name|^name$|lead\s*name)/i.test(header) && mapping.nameCol === -1) {
      mapping.nameCol = idx;
      recognizedHeaders++;
    } else if (/(phone|mobile|contact|cell|number|tel|whatsapp)/i.test(header) && mapping.phoneCol === -1) {
      mapping.phoneCol = idx;
      recognizedHeaders++;
    } else if (/(email|e-mail|mail)/i.test(header) && mapping.emailCol === -1) {
      mapping.emailCol = idx;
      recognizedHeaders++;
    } else if (/(location|city|state|address|place)/i.test(header) && mapping.locationCol === -1) {
      mapping.locationCol = idx;
      recognizedHeaders++;
    } else if (/(course|program|module|track|training|interest)/i.test(header) && mapping.courseCol === -1) {
      mapping.courseCol = idx;
      recognizedHeaders++;
    } else if (/(source|channel|medium|campaign)/i.test(header) && mapping.sourceCol === -1) {
      mapping.sourceCol = idx;
      recognizedHeaders++;
    } else if (/(status|stage|lead\s*status)/i.test(header) && mapping.statusCol === -1) {
      mapping.statusCol = idx;
      recognizedHeaders++;
    } else if (/(notes|feedback|remark|comments|description)/i.test(header) && mapping.notesCol === -1) {
      mapping.notesCol = idx;
      recognizedHeaders++;
    } else if (/(follow\s*up|callback|next\s*call)/i.test(header) && mapping.followUpDateCol === -1) {
      mapping.followUpDateCol = idx;
      recognizedHeaders++;
    } else if (/(demo|webinar)/i.test(header) && mapping.demoDateCol === -1) {
      mapping.demoDateCol = idx;
      recognizedHeaders++;
    } else if (/(call\s*date|scheduled\s*date)/i.test(header) && mapping.callDateCol === -1) {
      mapping.callDateCol = idx;
      recognizedHeaders++;
    } else if (/(call\s*time|scheduled\s*time|slot)/i.test(header) && mapping.callTimeCol === -1) {
      mapping.callTimeCol = idx;
      recognizedHeaders++;
    } else if (/(fee|tuition|deal|amount|total\s*fee)/i.test(header) && mapping.feeCol === -1) {
      mapping.feeCol = idx;
      recognizedHeaders++;
    } else if (/(paid|token|advance)/i.test(header) && mapping.paidCol === -1) {
      mapping.paidCol = idx;
      recognizedHeaders++;
    }
  });

  const hasHeaders = recognizedHeaders >= 2;

  // Fallback heuristic if no header row detected (e.g. data copied directly)
  if (!hasHeaders) {
    mapping.nameCol = 0;
    mapping.phoneCol = 1;
    mapping.emailCol = 2;
    mapping.locationCol = 3;
    mapping.courseCol = 4;
    mapping.sourceCol = 5;
    mapping.statusCol = 6;
    mapping.notesCol = 7;
    mapping.followUpDateCol = 8;
    mapping.demoDateCol = 9;
    mapping.callDateCol = 10;
    mapping.callTimeCol = 11;
    mapping.feeCol = 12;
    mapping.paidCol = 13;
  }

  return { mapping, hasHeaders };
}

// Clean phone digits for duplicate check
function extractPureDigits(phoneStr: string): string {
  if (!phoneStr) return '';
  const digits = phoneStr.replace(/\D/g, '');
  // If starts with 91 and length 12, take last 10
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Parse all pasted rows
export function parsePastedExcelRows(
  pastedText: string,
  existingLeads: Lead[],
  targetCounselorId: string,
  targetCounselorName: string,
  defaultCourseOverride: string = 'Workday HCM'
): ParsedLeadRow[] {
  const grid = splitClipboardIntoGrid(pastedText);
  if (grid.length === 0) return [];

  const { mapping, hasHeaders } = detectColumnMapping(grid[0]);
  const dataRows = hasHeaders ? grid.slice(1) : grid;

  // Build duplicate lookup sets from existing CRM leads
  const existingPhoneMap = new Map<string, Lead>();
  const existingEmailMap = new Map<string, Lead>();

  existingLeads.forEach(lead => {
    const pDigits = extractPureDigits(lead.phone);
    if (pDigits && pDigits.length >= 10) {
      existingPhoneMap.set(pDigits, lead);
    }
    if (lead.email && lead.email.trim()) {
      existingEmailMap.set(lead.email.trim().toLowerCase(), lead);
    }
  });

  // Track duplicates within the current paste batch itself
  const batchPhoneSet = new Set<string>();
  const batchEmailSet = new Set<string>();

  const result: ParsedLeadRow[] = [];

  dataRows.forEach((row, index) => {
    const rowNumber = (hasHeaders ? 2 : 1) + index;
    const errors: string[] = [];

    const getCell = (colIdx: number): string => {
      if (colIdx >= 0 && colIdx < row.length) {
        return row[colIdx]?.trim() || '';
      }
      return '';
    };

    // 1. Candidate Name
    const name = getCell(mapping.nameCol);
    if (!name) {
      errors.push('Candidate Name is missing');
    }

    // 2. Phone Number
    const rawPhone = getCell(mapping.phoneCol);
    const normalizedPhone = rawPhone ? normalizePhoneNumber(rawPhone).display : '';
    const purePhoneDigits = extractPureDigits(rawPhone);

    if (!rawPhone) {
      errors.push('Phone number is missing');
    } else if (purePhoneDigits.length < 10) {
      errors.push(`Invalid phone number (${rawPhone}) - requires 10 digits`);
    }

    // 3. Email
    const email = getCell(mapping.emailCol);
    const cleanEmail = email ? email.toLowerCase() : '';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Invalid email format: ${email}`);
    }

    // 4. Location
    const location = getCell(mapping.locationCol) || 'India';

    // 5. Course (MANDATORY REQUIREMENT: Default to "Workday HCM" if missing or blank)
    const rawCourse = getCell(mapping.courseCol);
    const course = rawCourse || defaultCourseOverride || 'Workday HCM';

    // 6. Source
    const source = getCell(mapping.sourceCol) || 'Excel Bulk Import';

    // 7. Status
    const rawStatus = getCell(mapping.statusCol);
    const status = parseStatusFromText(rawStatus);

    // 8. Feedback / Notes
    const feedback = getCell(mapping.notesCol) || `Pasted via Excel Bulk Import for ${targetCounselorName}`;

    // 9. Dates
    const followUpDate = getCell(mapping.followUpDateCol);
    const demoDate = getCell(mapping.demoDateCol);
    const scheduledCallDate = getCell(mapping.callDateCol);
    const scheduledCallTime = getCell(mapping.callTimeCol) || '15:00';

    // 10. Fee / Deal Value
    const rawFee = getCell(mapping.feeCol).replace(/[^0-9.]/g, '');
    const dealValue = rawFee ? parseFloat(rawFee) : 28000;

    const rawPaid = getCell(mapping.paidCol).replace(/[^0-9.]/g, '');
    const amountPaid = rawPaid ? parseFloat(rawPaid) : 0;

    // Check Duplicates
    let isDuplicate = false;
    let duplicateMatchedLeadId: string | undefined;
    let duplicateMatchedLeadName: string | undefined;
    let duplicateField: 'phone' | 'email' | undefined;

    if (purePhoneDigits && purePhoneDigits.length >= 10) {
      if (existingPhoneMap.has(purePhoneDigits)) {
        const match = existingPhoneMap.get(purePhoneDigits)!;
        isDuplicate = true;
        duplicateMatchedLeadId = match.id;
        duplicateMatchedLeadName = match.name;
        duplicateField = 'phone';
        errors.push(`Duplicate phone number matches existing lead: ${match.name}`);
      } else if (batchPhoneSet.has(purePhoneDigits)) {
        isDuplicate = true;
        duplicateField = 'phone';
        errors.push('Duplicate phone number already exists in this paste batch');
      } else {
        batchPhoneSet.add(purePhoneDigits);
      }
    }

    if (!isDuplicate && cleanEmail) {
      if (existingEmailMap.has(cleanEmail)) {
        const match = existingEmailMap.get(cleanEmail)!;
        isDuplicate = true;
        duplicateMatchedLeadId = match.id;
        duplicateMatchedLeadName = match.name;
        duplicateField = 'email';
        errors.push(`Duplicate email matches existing lead: ${match.name}`);
      } else if (batchEmailSet.has(cleanEmail)) {
        isDuplicate = true;
        duplicateField = 'email';
        errors.push('Duplicate email already exists in this paste batch');
      } else {
        batchEmailSet.add(cleanEmail);
      }
    }

    const isValid = errors.filter(e => !e.startsWith('Duplicate')).length === 0;

    result.push({
      id: `pasted_row_${index + 1}_${Date.now()}`,
      rowNumber,
      name: name || 'Unnamed Candidate',
      phone: normalizedPhone || rawPhone || '+91 ',
      email: email || `${(name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '')}@student.example.com`,
      location,
      course,
      source,
      status,
      feedback,
      followUpDate,
      demoDate,
      scheduledCallDate,
      scheduledCallTime,
      dealValue,
      amountPaid,
      assignedTo: targetCounselorId,
      assignedUserName: targetCounselorName,
      isValid,
      isDuplicate,
      duplicateMatchedLeadId,
      duplicateMatchedLeadName,
      duplicateField,
      errors,
    });
  });

  return result;
}

// Convert parsed valid rows into actual Lead objects ready for CRM database
export function convertParsedRowToLead(
  row: ParsedLeadRow,
  targetCounselorId: string,
  targetCounselorName: string
): Lead {
  const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
  const leadId = `lead_import_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: leadId,
    name: row.name.trim(),
    phone: row.phone.trim(),
    email: row.email.trim(),
    location: row.location.trim() || 'India',
    course: row.course.trim() || 'Workday HCM',
    source: row.source.trim() || 'Excel Bulk Import',
    status: row.status || 'new',
    feedback: row.feedback || `Pasted via Excel Bulk Import for ${targetCounselorName}`,
    dealValue: row.dealValue || 28000,
    revenue: row.amountPaid || 0,
    assignedTo: targetCounselorId,
    assignedUserName: targetCounselorName,
    callsCount: 0,
    callsMade: 0,
    isAddedToday: true,
    isPendingToday: true,
    createdAt: new Date().toISOString(),
    followUpDate: row.followUpDate || 'Today',
    demoDetails: row.demoDate
      ? {
          date: row.demoDate,
          time: row.scheduledCallTime || '15:00',
          webinarTopic: `${row.course || 'Workday HCM'} Demo`,
          googleMeetLink: `https://meet.google.com/cr-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`,
          attended: null,
        }
      : undefined,
    notesHistory: [
      {
        id: `note_import_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        author: targetCounselorName,
        type: 'general',
        text: `Lead bulk-imported from Excel and assigned to counselor ${targetCounselorName}.`,
      },
    ],
  };
}

// Generate error report CSV for download
export function generateErrorReportCSV(rows: ParsedLeadRow[]): string {
  const header = ['Row Number', 'Candidate Name', 'Phone', 'Email', 'Course', 'Status', 'Errors & Issues'];
  const lines = [header.join(',')];

  rows.forEach(r => {
    if (r.errors.length > 0 || !r.isValid || r.isDuplicate) {
      const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
      lines.push([
        r.rowNumber,
        escape(r.name),
        escape(r.phone),
        escape(r.email),
        escape(r.course),
        escape(r.status),
        escape(r.errors.join('; ')),
      ].join(','));
    }
  });

  return lines.join('\n');
}

// Generate sample Excel-compatible tab-separated lines for testing (100, 250, 500 rows)
export function generateTestLeadRows(count: number = 100): string {
  const courses = ['Workday HCM', 'SAP FICO Financials', 'Full Stack Engineering', 'Data Science & AI', 'Cloud DevOps'];
  const cities = ['Mumbai, MH', 'Delhi NCR', 'Bengaluru, KA', 'Pune, MH', 'Hyderabad, TS', 'Kolkata, WB', 'Ahmedabad, GJ', 'Jaipur, RJ'];
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anushka', 'Khushi', 'Angel', 'Riya', 'Sneha', 'Tanvi', 'Kavya', 'Neha', 'Pooja', 'Priya', 'Simran', 'Rohan', 'Karan', 'Manish', 'Vikram'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Joshi', 'Gupta', 'Mehta', 'Nair', 'Kulkarni', 'Bansal', 'Reddy', 'Chopra', 'Malhotra', 'Iyer', 'Menon', 'Singh', 'Deshmukh', 'Saxena', 'Choudhary', 'Yadav', 'Rao'];

  const lines: string[] = [];
  // Excel Tab-separated headers
  lines.push('Student Name\tPhone Number\tEmail Address\tLocation\tCourse Interested\tLead Source\tLead Status\tFeedback / Notes\tFollow-up Date\tDemo Date\tScheduled Call Date\tScheduled Call Time\tTotal Course Fee\tAmount Paid');

  for (let i = 1; i <= count; i++) {
    const fn = firstNames[(i * 7) % firstNames.length];
    const ln = lastNames[(i * 11) % lastNames.length];
    const name = `${fn} ${ln}`;
    // Generate valid 10-digit Indian numbers starting with 98 or 97 or 96
    const phone = `+91 98${String(10000000 + (i * 37) % 89999999)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    const loc = cities[i % cities.length];
    const course = i % 4 === 0 ? '' : courses[i % courses.length]; // test missing course to verify default Workday HCM!
    const source = i % 3 === 0 ? 'Meta Ads' : i % 3 === 1 ? 'Google Search' : 'LinkedIn Outreach';
    const status = i % 5 === 0 ? 'Interested' : i % 5 === 1 ? 'Demo Scheduled' : i % 5 === 2 ? 'Call Later' : 'New Lead';
    const notes = `Pasted candidate test lead #${i}. Inquired for career transition.`;
    const followUp = i % 2 === 0 ? 'Today' : '2026-11-12';
    const demo = i % 3 === 0 ? '2026-11-15' : '';
    const callDate = '2026-11-10';
    const callTime = '16:00';
    const fee = 35000;
    const paid = i % 6 === 0 ? 5000 : 0;

    lines.push(`${name}\t${phone}\t${email}\t${loc}\t${course}\t${source}\t${status}\t${notes}\t${followUp}\t${demo}\t${callDate}\t${callTime}\t${fee}\t${paid}`);
  }

  return lines.join('\n');
}
