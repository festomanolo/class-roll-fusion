import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

export async function getGoogleSheetsClient() {
  const auth = await authenticate({
    keyfilePath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
}

export async function readSpreadsheetData(spreadsheetId: string, range: string = 'A1:Z1000') {
  const sheets = await getGoogleSheetsClient();
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Convert the header row to lowercase for consistent keys
    const headers = rows[0].map((header: string) => header.toLowerCase());
    
    // Convert the data rows to objects
    return rows.slice(1).map((row: any[]) => {
      const rowData: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        rowData[header] = row[index] || null;
      });
      return rowData;
    });
  } catch (error) {
    console.error('Error reading spreadsheet:', error);
    throw error;
  }
}

export async function writeSpreadsheetData(
  spreadsheetId: string, 
  range: string,
  values: any[][]
) {
  const sheets = await getGoogleSheetsClient();
  
  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error writing to spreadsheet:', error);
    throw error;
  }
}
