import * as XLSX from 'xlsx';
import { parse as parseCsv, unparse as unparseCsv } from 'papaparse';

interface StudentData {
  id: string;
  name: string;
  email?: string;
  group?: string;
  attendance?: Record<string, boolean>;
  assignments?: Record<string, {
    submitted: boolean;
    grade?: number;
  }>;
  exams?: Record<string, {
    score: number;
    maxScore: number;
  }>;
}

export const importExcel = (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData as StudentData[]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const exportExcel = (data: StudentData[], filename: string = 'students.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  XLSX.writeFile(workbook, filename);
};

export const importCsv = (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    parseCsv(file, {
      complete: (results) => {
        resolve(results.data as StudentData[]);
      },
      error: (error) => {
        reject(error);
      },
      header: true,
    });
  });
};

export const exportCsv = (data: StudentData[], filename: string = 'students.csv') => {
  const csv = unparseCsv(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const syncWithGoogleSheets = async (spreadsheetId: string): Promise<StudentData[]> => {
  try {
    const { readSpreadsheetData } = await import('./google-sheets');
    const data = await readSpreadsheetData(spreadsheetId);
    
    // Transform the data to match our StudentData interface
    return data.map((row: any) => ({
      id: row.id || String(Math.random()),
      name: row.name,
      email: row.email,
      group: row.group,
      attendance: row.attendance ? JSON.parse(row.attendance) : {},
      assignments: row.assignments ? JSON.parse(row.assignments) : {},
      exams: row.exams ? JSON.parse(row.exams) : {},
    }));
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    throw error;
  }
};
