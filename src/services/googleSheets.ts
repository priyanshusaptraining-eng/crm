import { Lead } from '../types/crm';

export interface SpreadsheetInfo {
  spreadsheetId: string;
  properties: {
    title: string;
    locale?: string;
    autoRecalc?: string;
    timeZone?: string;
  };
  sheets?: Array<{
    properties: {
      sheetId: number;
      title: string;
      gridProperties?: {
        rowCount: number;
        columnCount: number;
      };
    };
  }>;
  spreadsheetUrl: string;
}

/**
 * Creates a brand new Google Spreadsheet populated with DealDeck CRM leads
 */
export async function createLeadsSpreadsheet(
  accessToken: string,
  title: string,
  leads: Lead[]
): Promise<SpreadsheetInfo> {
  const headers = [
    'Student Full Name',
    'Phone Number',
    'Email Address',
    'Location',
    'Course Enrolled / Interest',
    'Lead Status',
    'Deal Value (₹)',
    'Fee Paid (₹)',
    'Assigned Counselor',
    'Registration Date',
    'Latest Remarks',
  ];

  const rows = leads.map((lead) => [
    lead.name,
    lead.phone,
    lead.email,
    lead.location || 'Not Specified',
    lead.course || 'SAP FICO Financials',
    lead.status.replace('_', ' ').toUpperCase(),
    lead.dealValue || 30000,
    lead.paymentDetails?.amountPaid || lead.revenue || 0,
    lead.assignedUserName,
    lead.createdAt,
    lead.notesHistory?.[0]?.text || lead.feedback || '',
  ]);

  // Step 1: Create Spreadsheet with title and headers
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || `DealDeck CRM - Leads Export (${new Date().toLocaleDateString('en-IN')})`,
      },
      sheets: [
        {
          properties: {
            title: 'Candidate Records',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Google Sheets API creation failed: ${createResponse.status}`
    );
  }

  const spreadsheet = await createResponse.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // Step 2: Append the headers and data rows
  const values = [headers, ...rows];
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Candidate Records!A1:append?valueInputOption=USER_ENTERED`;

  const appendResponse = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!appendResponse.ok) {
    console.warn('Appended rows warning:', await appendResponse.text());
  }

  return {
    spreadsheetId,
    properties: spreadsheet.properties,
    sheets: spreadsheet.sheets,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Reads values from a specified Google Spreadsheet tab
 */
export async function readSpreadsheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to read Google Sheet: ${response.status}`
    );
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Get spreadsheet metadata (title, sheet tabs)
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetInfo> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch spreadsheet info: ${response.status}`
    );
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    properties: data.properties,
    sheets: data.sheets,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
}
