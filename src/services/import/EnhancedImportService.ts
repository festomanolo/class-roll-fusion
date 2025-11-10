/**
 * Enhanced Import Service
 * Handles multi-sheet CSV/Excel import with field mapping and validation
 */

import * as XLSX from 'xlsx';
import { parse as parseCsv } from 'papaparse';
import { ImportConfig, ImportResult, Student } from '@/types';
import validator from 'validator';

export interface SheetData {
  name: string;
  headers: string[];
  rows: any[][];
}

export class EnhancedImportService {
  /**
   * Read Excel file and get all sheets
   */
  static async readExcelFile(file: File): Promise<SheetData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          const sheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            return {
              name: sheetName,
              headers: jsonData[0] || [],
              rows: jsonData.slice(1),
            };
          });
          
          resolve(sheets);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Read CSV file
   */
  static async readCsvFile(file: File): Promise<SheetData> {
    return new Promise((resolve, reject) => {
      parseCsv(file, {
        complete: (results) => {
          const data = results.data as any[][];
          resolve({
            name: file.name,
            headers: data[0] || [],
            rows: data.slice(1),
          });
        },
        error: reject,
      });
    });
  }

  /**
   * Import students with field mapping
   */
  static async importStudents(
    sheetData: SheetData,
    fieldMapping: Record<string, string>,
    classId: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const students: Omit<Student, 'id'>[] = [];

    // Get column indices from headers
    const getColumnIndex = (mappedField: string): number => {
      const headerName = Object.keys(fieldMapping).find(
        (key) => fieldMapping[key] === mappedField
      );
      return headerName ? sheetData.headers.indexOf(headerName) : -1;
    };

    const nameIndex = getColumnIndex('name');
    const rollNumberIndex = getColumnIndex('rollNumber');
    const emailIndex = getColumnIndex('email');
    const phoneIndex = getColumnIndex('phone');
    const parentPhoneIndex = getColumnIndex('parent_phone');
    const addressIndex = getColumnIndex('address');

    if (nameIndex === -1) {
      result.errors.push({
        row: 0,
        error: 'Name field is required',
      });
      result.failed = sheetData.rows.length;
      return result;
    }

    // Process each row
    sheetData.rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because of header and 0-indexing

      try {
        // Skip empty rows
        if (!row || row.length === 0 || !row[nameIndex]) {
          return;
        }

        const name = String(row[nameIndex]).trim();
        if (!name) {
          result.errors.push({ row: rowNumber, error: 'Name is required' });
          result.failed++;
          return;
        }

        const studentData: Omit<Student, 'id'> = {
          name,
          class_id: classId,
        };

        // Optional fields
        if (rollNumberIndex >= 0 && row[rollNumberIndex]) {
          studentData.rollNumber = String(row[rollNumberIndex]).trim();
        }

        if (emailIndex >= 0 && row[emailIndex]) {
          const email = String(row[emailIndex]).trim();
          if (email && !validator.isEmail(email)) {
            result.errors.push({ row: rowNumber, error: 'Invalid email format' });
            result.failed++;
            return;
          }
          studentData.email = email;
        }

        if (phoneIndex >= 0 && row[phoneIndex]) {
          studentData.phone = String(row[phoneIndex]).trim();
        }

        if (parentPhoneIndex >= 0 && row[parentPhoneIndex]) {
          studentData.parent_phone = String(row[parentPhoneIndex]).trim();
        }

        if (addressIndex >= 0 && row[addressIndex]) {
          studentData.address = String(row[addressIndex]).trim();
        }

        students.push(studentData);
        result.success++;
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          error: error.message || 'Unknown error',
        });
        result.failed++;
      }
    });

    return result;
  }

  /**
   * Import attendance records
   */
  static async importAttendance(
    sheetData: SheetData,
    fieldMapping: Record<string, string>,
    sessionId: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Get column indices
    const getColumnIndex = (mappedField: string): number => {
      const headerName = Object.keys(fieldMapping).find(
        (key) => fieldMapping[key] === mappedField
      );
      return headerName ? sheetData.headers.indexOf(headerName) : -1;
    };

    const studentIdIndex = getColumnIndex('student_id');
    const presentIndex = getColumnIndex('present');

    if (studentIdIndex === -1 || presentIndex === -1) {
      result.errors.push({
        row: 0,
        error: 'student_id and present fields are required',
      });
      result.failed = sheetData.rows.length;
      return result;
    }

    // Process each row
    sheetData.rows.forEach((row, index) => {
      const rowNumber = index + 2;

      try {
        if (!row || row.length === 0) return;

        const studentId = String(row[studentIdIndex]).trim();
        const presentValue = String(row[presentIndex]).toLowerCase().trim();
        
        const present = ['yes', 'true', '1', 'present', 'y'].includes(presentValue);

        result.success++;
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          error: error.message || 'Unknown error',
        });
        result.failed++;
      }
    });

    return result;
  }

  /**
   * Import exam results
   */
  static async importExamResults(
    sheetData: SheetData,
    fieldMapping: Record<string, string>,
    examId: string,
    maxScore: number
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const getColumnIndex = (mappedField: string): number => {
      const headerName = Object.keys(fieldMapping).find(
        (key) => fieldMapping[key] === mappedField
      );
      return headerName ? sheetData.headers.indexOf(headerName) : -1;
    };

    const studentIdIndex = getColumnIndex('student_id');
    const scoreIndex = getColumnIndex('score');
    const commentsIndex = getColumnIndex('comments');

    if (studentIdIndex === -1 || scoreIndex === -1) {
      result.errors.push({
        row: 0,
        error: 'student_id and score fields are required',
      });
      result.failed = sheetData.rows.length;
      return result;
    }

    sheetData.rows.forEach((row, index) => {
      const rowNumber = index + 2;

      try {
        if (!row || row.length === 0) return;

        const studentId = String(row[studentIdIndex]).trim();
        const score = parseFloat(String(row[scoreIndex]));

        if (isNaN(score)) {
          result.errors.push({ row: rowNumber, error: 'Invalid score value' });
          result.failed++;
          return;
        }

        if (score < 0 || score > maxScore) {
          result.errors.push({
            row: rowNumber,
            error: `Score must be between 0 and ${maxScore}`,
          });
          result.failed++;
          return;
        }

        const comments = commentsIndex >= 0 ? String(row[commentsIndex] || '').trim() : '';

        result.success++;
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          error: error.message || 'Unknown error',
        });
        result.failed++;
      }
    });

    return result;
  }

  /**
   * Validate field mapping
   */
  static validateFieldMapping(
    headers: string[],
    fieldMapping: Record<string, string>,
    requiredFields: string[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if all required fields are mapped
    requiredFields.forEach((field) => {
      const isMapped = Object.values(fieldMapping).includes(field);
      if (!isMapped) {
        errors.push(`Required field '${field}' is not mapped`);
      }
    });

    // Check if all mapped headers exist
    Object.keys(fieldMapping).forEach((header) => {
      if (!headers.includes(header)) {
        errors.push(`Header '${header}' does not exist in the file`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Auto-detect field mapping based on headers
   */
  static autoDetectMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    const fieldPatterns: Record<string, RegExp[]> = {
      name: [/^name$/i, /^student\s*name$/i, /^full\s*name$/i],
      rollNumber: [/^roll\s*number$/i, /^roll\s*no$/i, /^id$/i, /^student\s*id$/i],
      email: [/^email$/i, /^e-mail$/i, /^mail$/i],
      phone: [/^phone$/i, /^mobile$/i, /^contact$/i, /^tel$/i],
      parent_phone: [/^parent\s*phone$/i, /^guardian\s*phone$/i, /^parent\s*contact$/i],
      address: [/^address$/i, /^location$/i],
    };

    headers.forEach((header) => {
      const cleanHeader = header.trim();
      
      Object.entries(fieldPatterns).forEach(([field, patterns]) => {
        if (patterns.some((pattern) => pattern.test(cleanHeader))) {
          mapping[cleanHeader] = field;
        }
      });
    });

    return mapping;
  }

  /**
   * Export data to Excel
   */
  static exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export multiple sheets to Excel
   */
  static exportMultiSheetExcel(
    sheets: Array<{ name: string; data: any[] }>,
    filename: string
  ): void {
    const workbook = XLSX.utils.book_new();
    
    sheets.forEach((sheet) => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });
    
    XLSX.writeFile(workbook, filename);
  }
}
