import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  parsePastedExcelRows, 
  detectColumnMapping, 
  splitClipboardIntoGrid,
  generateTestLeadRows,
  convertParsedRowToLead
} from './excelParser';
import { Lead } from '../types/crm';

const mockExistingLeads: Lead[] = [
  {
    id: 'lead_existing_1',
    name: 'Rahul Sharma',
    phone: '+91 98765 11001',
    email: 'rahul.sharma@example.com',
    location: 'Delhi NCR',
    course: 'Full Stack Engineering',
    status: 'interested',
    feedback: 'Existing lead',
    dealValue: 28000,
    revenue: 0,
    assignedTo: 'usr_deepti',
    assignedUserName: 'Deepti',
    callsCount: 3,
    callsMade: 3,
    isAddedToday: false,
    isPendingToday: false,
    createdAt: '2026-11-01',
  },
];

test('Excel Parser - detects 14 standard columns from headers', () => {
  const headers = [
    'Student Name',
    'Phone Number',
    'Email Address',
    'Location',
    'Course Interested',
    'Lead Source',
    'Lead Status',
    'Feedback / Notes',
    'Follow-up Date',
    'Demo Date',
    'Scheduled Call Date',
    'Scheduled Call Time',
    'Total Course Fee',
    'Amount Paid'
  ];

  const { mapping, hasHeaders } = detectColumnMapping(headers);
  assert.equal(hasHeaders, true);
  assert.equal(mapping.nameCol, 0);
  assert.equal(mapping.phoneCol, 1);
  assert.equal(mapping.emailCol, 2);
  assert.equal(mapping.locationCol, 3);
  assert.equal(mapping.courseCol, 4);
  assert.equal(mapping.sourceCol, 5);
  assert.equal(mapping.statusCol, 6);
  assert.equal(mapping.notesCol, 7);
  assert.equal(mapping.feeCol, 12);
  assert.equal(mapping.paidCol, 13);
});

test('Excel Parser - defaults missing course to "Workday HCM"', () => {
  const text = `Student Name\tPhone Number\tEmail Address\tLocation\tCourse Interested\nAnanya Sen\t+91 98111 22334\tananya@example.com\tMumbai\t`;
  const parsed = parsePastedExcelRows(text, [], 'usr_priyanshu', 'Priyanshu Sharma', 'Workday HCM');
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].name, 'Ananya Sen');
  assert.equal(parsed[0].course, 'Workday HCM');
  assert.equal(parsed[0].assignedTo, 'usr_priyanshu');
});

test('Excel Parser - flags duplicate by phone matching existing lead', () => {
  const text = `Student Name\tPhone Number\tEmail Address\nDuplicate Rahul\t+91 98765 11001\tother@example.com`;
  const parsed = parsePastedExcelRows(text, mockExistingLeads, 'usr_deepti', 'Deepti', 'Workday HCM');
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].isDuplicate, true);
  assert.equal(parsed[0].duplicateMatchedLeadName, 'Rahul Sharma');
});

test('Excel Parser - parses 100 and 500 rows with no artificial cap', () => {
  const text100 = generateTestLeadRows(100);
  const parsed100 = parsePastedExcelRows(text100, [], 'usr_priyanshu', 'Priyanshu Sharma', 'Workday HCM');
  assert.equal(parsed100.length, 100);

  const text500 = generateTestLeadRows(500);
  const parsed500 = parsePastedExcelRows(text500, [], 'usr_deepti', 'Deepti', 'Workday HCM');
  assert.equal(parsed500.length, 500);

  // Verify all are assigned to Deepti
  assert.equal(parsed500[0].assignedTo, 'usr_deepti');
  assert.equal(parsed500[499].assignedTo, 'usr_deepti');

  // Verify conversion to full Lead model
  const lead500 = convertParsedRowToLead(parsed500[0], 'usr_deepti', 'Deepti');
  assert.ok(lead500.id.startsWith('lead_import_'));
  assert.equal(lead500.assignedTo, 'usr_deepti');
  assert.equal(lead500.assignedUserName, 'Deepti');
});
