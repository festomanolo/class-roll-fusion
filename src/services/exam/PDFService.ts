/**
 * PDF Service
 * Handles PDF upload, storage, and retrieval for exams
 */

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { PDFDocument } from '@/types';

export class PDFService {
  private static PDF_DIRECTORY = 'exam_pdfs';

  /**
   * Upload and save PDF file
   */
  static async uploadPDF(file: File, examId: string): Promise<PDFDocument> {
    try {
      if (Capacitor.isNativePlatform()) {
        return await this.savePDFMobile(file, examId);
      } else {
        return await this.savePDFWeb(file, examId);
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      throw new Error('Failed to upload PDF');
    }
  }

  /**
   * Save PDF on mobile using Capacitor Filesystem
   */
  private static async savePDFMobile(file: File, examId: string): Promise<PDFDocument> {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const filename = `exam_${examId}_${Date.now()}.pdf`;
          const path = `${this.PDF_DIRECTORY}/${filename}`;

          // Save file
          const result = await Filesystem.writeFile({
            path,
            data: base64Data,
            directory: Directory.Documents,
          });

          const pdfDoc: PDFDocument = {
            id: `pdf_${Date.now()}`,
            filename,
            url: result.uri,
            size: file.size,
            mime_type: file.type,
            uploaded_at: new Date().toISOString(),
          };

          resolve(pdfDoc);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Save PDF on web using localStorage (for testing)
   */
  private static async savePDFWeb(file: File, examId: string): Promise<PDFDocument> {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        try {
          const dataUrl = reader.result as string;
          const filename = `exam_${examId}_${Date.now()}.pdf`;
          const key = `pdf_${filename}`;

          // Store in localStorage (not ideal for production, but works for testing)
          localStorage.setItem(key, dataUrl);

          const pdfDoc: PDFDocument = {
            id: key,
            filename,
            url: dataUrl,
            size: file.size,
            mime_type: file.type,
            uploaded_at: new Date().toISOString(),
          };

          resolve(pdfDoc);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get PDF by ID
   */
  static async getPDF(pdfId: string): Promise<PDFDocument | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        // In mobile, we'd query from database
        // For now, return null
        return null;
      } else {
        const dataUrl = localStorage.getItem(pdfId);
        if (!dataUrl) return null;

        // Parse stored data to recreate PDFDocument
        // This is simplified - in production you'd store metadata separately
        return {
          id: pdfId,
          filename: pdfId.replace('pdf_', ''),
          url: dataUrl,
          size: dataUrl.length,
          mime_type: 'application/pdf',
          uploaded_at: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Get PDF error:', error);
      return null;
    }
  }

  /**
   * Delete PDF
   */
  static async deletePDF(pdfId: string, filename?: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform() && filename) {
        await Filesystem.deleteFile({
          path: `${this.PDF_DIRECTORY}/${filename}`,
          directory: Directory.Documents,
        });
      } else {
        localStorage.removeItem(pdfId);
      }
    } catch (error) {
      console.error('Delete PDF error:', error);
    }
  }

  /**
   * Share PDF
   */
  static async sharePDF(pdfDocument: PDFDocument): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: pdfDocument.filename,
          url: pdfDocument.url,
          dialogTitle: 'Share Exam PDF',
        });
      } else {
        // On web, download the file
        const link = document.createElement('a');
        link.href = pdfDocument.url;
        link.download = pdfDocument.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Share PDF error:', error);
      throw new Error('Failed to share PDF');
    }
  }

  /**
   * Print PDF (web only)
   */
  static async printPDF(pdfUrl: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      throw new Error('Printing is not available on mobile. Use share instead.');
    }

    try {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.print();
      } else {
        throw new Error('Popup blocked');
      }
    } catch (error) {
      console.error('Print PDF error:', error);
      throw new Error('Failed to print PDF');
    }
  }

  /**
   * Get all PDFs
   */
  static async getAllPDFs(): Promise<PDFDocument[]> {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.readdir({
          path: this.PDF_DIRECTORY,
          directory: Directory.Documents,
        });

        return result.files.map((file) => ({
          id: `pdf_${file.name}`,
          filename: file.name,
          url: `${Directory.Documents}/${this.PDF_DIRECTORY}/${file.name}`,
          size: 0, // Would need to read file to get size
          mime_type: 'application/pdf',
          uploaded_at: file.ctime || new Date().toISOString(),
        }));
      } else {
        const pdfs: PDFDocument[] = [];
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('pdf_')) {
            const dataUrl = localStorage.getItem(key);
            if (dataUrl) {
              pdfs.push({
                id: key,
                filename: key.replace('pdf_', ''),
                url: dataUrl,
                size: dataUrl.length,
                mime_type: 'application/pdf',
                uploaded_at: new Date().toISOString(),
              });
            }
          }
        });
        return pdfs;
      }
    } catch (error) {
      console.error('Get all PDFs error:', error);
      return [];
    }
  }
}
