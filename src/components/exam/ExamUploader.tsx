/**
 * Exam PDF Uploader Component
 * Upload, preview, and manage exam PDFs
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PDFService } from '@/services/exam/PDFService';
import { PDFDocument } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, X, Eye, Printer, Share2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamUploaderProps {
  examId: string;
  onUploadComplete: (pdfDoc: PDFDocument) => void;
  currentPDF?: PDFDocument;
}

export const ExamUploader: React.FC<ExamUploaderProps> = ({
  examId,
  onUploadComplete,
  currentPDF,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | undefined>(currentPDF);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadedDoc = await PDFService.uploadPDF(file, examId);
      setPdfDoc(uploadedDoc);
      onUploadComplete(uploadedDoc);
      
      toast({
        title: 'Upload Successful',
        description: 'Exam PDF has been uploaded',
      });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Could not upload PDF',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = async () => {
    if (!pdfDoc) return;

    try {
      await PDFService.deletePDF(pdfDoc.id, pdfDoc.filename);
      setPdfDoc(undefined);
      toast({
        title: 'PDF Removed',
        description: 'Exam PDF has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Remove Failed',
        description: error.message || 'Could not remove PDF',
        variant: 'destructive',
      });
    }
  };

  const handleView = () => {
    if (pdfDoc) {
      window.open(pdfDoc.url, '_blank');
    }
  };

  const handlePrint = async () => {
    if (!pdfDoc) return;

    try {
      await PDFService.printPDF(pdfDoc.url);
    } catch (error: any) {
      toast({
        title: 'Print Failed',
        description: error.message || 'Could not print PDF',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!pdfDoc) return;

    try {
      await PDFService.sharePDF(pdfDoc);
    } catch (error: any) {
      toast({
        title: 'Share Failed',
        description: error.message || 'Could not share PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!pdfDoc ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                apple-card p-8 text-center cursor-pointer transition-all
                ${isDragging ? 'border-2 border-[var(--apple-blue)] bg-[var(--apple-fill-quaternary)]' : 'border-2 border-dashed border-[var(--apple-separator)]'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="py-8">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[var(--apple-blue)]" />
                  <p className="apple-callout text-[var(--apple-label-secondary)]">
                    Uploading PDF...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--apple-label-tertiary)]" />
                  <h3 className="apple-headline mb-2">Upload Exam PDF</h3>
                  <p className="apple-footnote text-[var(--apple-label-secondary)] mb-4">
                    Drag and drop or click to browse
                  </p>
                  <p className="apple-caption text-[var(--apple-label-tertiary)]">
                    PDF files up to 10MB
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="apple-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--apple-red)] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="apple-callout font-semibold">{pdfDoc.filename}</h3>
                  <p className="apple-footnote text-[var(--apple-label-secondary)]">
                    {(pdfDoc.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-[var(--apple-red)]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                className="flex-1 apple-button-gray"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex-1 apple-button-gray"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-1 apple-button-gray"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
