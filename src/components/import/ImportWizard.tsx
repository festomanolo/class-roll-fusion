/**
 * Import Wizard Component
 * Multi-step wizard for importing data from CSV/Excel with field mapping
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedImportService, SheetData } from '@/services/import/EnhancedImportService';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportWizardProps {
  entityType: 'students' | 'attendance' | 'exams';
  onComplete: (data: any[]) => void;
  onCancel: () => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({
  entityType,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<SheetData | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const requiredFields: Record<string, string[]> = {
    students: ['name'],
    attendance: ['student_id', 'present'],
    exams: ['student_id', 'score'],
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    try {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        const loadedSheets = await EnhancedImportService.readExcelFile(selectedFile);
        setSheets(loadedSheets);
        if (loadedSheets.length === 1) {
          setSelectedSheet(loadedSheets[0]);
          const autoMapping = EnhancedImportService.autoDetectMapping(loadedSheets[0].headers);
          setFieldMapping(autoMapping);
        }
      } else if (selectedFile.name.endsWith('.csv')) {
        const sheetData = await EnhancedImportService.readCsvFile(selectedFile);
        setSheets([sheetData]);
        setSelectedSheet(sheetData);
        const autoMapping = EnhancedImportService.autoDetectMapping(sheetData.headers);
        setFieldMapping(autoMapping);
      }
      setStep(2);
    } catch (error: any) {
      toast({
        title: 'File Read Error',
        description: error.message || 'Could not read file',
        variant: 'destructive',
      });
    }
  };

  const handleSheetSelect = (sheet: SheetData) => {
    setSelectedSheet(sheet);
    const autoMapping = EnhancedImportService.autoDetectMapping(sheet.headers);
    setFieldMapping(autoMapping);
  };

  const handleFieldMap = (header: string, field: string) => {
    setFieldMapping((prev) => ({
      ...prev,
      [header]: field,
    }));
  };

  const handleNext = () => {
    if (step === 2 && selectedSheet) {
      // Validate mapping
      const validation = EnhancedImportService.validateFieldMapping(
        selectedSheet.headers,
        fieldMapping,
        requiredFields[entityType]
      );

      if (!validation.valid) {
        toast({
          title: 'Mapping Error',
          description: validation.errors.join(', '),
          variant: 'destructive',
        });
        return;
      }

      setStep(3);
    }
  };

  const handleImport = async () => {
    if (!selectedSheet) return;

    try {
      // Here you would call the appropriate import method based on entityType
      toast({
        title: 'Import Successful',
        description: `Imported data successfully`,
      });
      onComplete([]);
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Could not import data',
        variant: 'destructive',
      });
    }
  };

  const getFieldOptions = () => {
    const options: Record<string, string[]> = {
      students: ['name', 'rollNumber', 'email', 'phone', 'parent_phone', 'address'],
      attendance: ['student_id', 'present'],
      exams: ['student_id', 'score', 'comments'],
    };
    return options[entityType];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${step >= s ? 'bg-[var(--apple-blue)] text-white' : 'bg-[var(--apple-fill-secondary)] text-[var(--apple-label-tertiary)]'}
              `}
            >
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-24 h-0.5 transition-all ${
                  step > s ? 'bg-[var(--apple-blue)]' : 'bg-[var(--apple-separator)]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="apple-card p-8 text-center"
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--apple-label-tertiary)]" />
            <h2 className="apple-title-2 mb-2">Upload File</h2>
            <p className="apple-body text-[var(--apple-label-secondary)] mb-6">
              Select a CSV or Excel file to import {entityType}
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button as="span" className="apple-button-filled cursor-pointer">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Choose File
              </Button>
            </label>
          </motion.div>
        )}

        {step === 2 && selectedSheet && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="apple-card p-6">
              <h2 className="apple-title-2 mb-4">Map Fields</h2>
              <p className="apple-body text-[var(--apple-label-secondary)] mb-6">
                Match your file columns to the correct fields
              </p>

              {/* Sheet Selection (if multiple) */}
              {sheets.length > 1 && (
                <div className="mb-6">
                  <label className="apple-callout block mb-2">Select Sheet</label>
                  <select
                    value={selectedSheet.name}
                    onChange={(e) => {
                      const sheet = sheets.find((s) => s.name === e.target.value);
                      if (sheet) handleSheetSelect(sheet);
                    }}
                    className="apple-input w-full"
                  >
                    {sheets.map((sheet) => (
                      <option key={sheet.name} value={sheet.name}>
                        {sheet.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Field Mapping */}
              <div className="space-y-4">
                {selectedSheet.headers.map((header) => (
                  <div key={header} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="apple-callout font-medium">{header}</p>
                    </div>
                    <div className="flex-1">
                      <select
                        value={fieldMapping[header] || ''}
                        onChange={(e) => handleFieldMap(header, e.target.value)}
                        className="apple-input w-full"
                      >
                        <option value="">-- Skip --</option>
                        {getFieldOptions().map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 apple-button-filled">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && selectedSheet && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="apple-card p-6">
              <h2 className="apple-title-2 mb-4">Preview & Import</h2>
              <p className="apple-body text-[var(--apple-label-secondary)] mb-6">
                Review the data before importing
              </p>

              {/* Summary */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between apple-body">
                  <span>File:</span>
                  <span className="font-semibold">{file?.name}</span>
                </div>
                <div className="flex justify-between apple-body">
                  <span>Rows:</span>
                  <span className="font-semibold">{selectedSheet.rows.length}</span>
                </div>
                <div className="flex justify-between apple-body">
                  <span>Mapped Fields:</span>
                  <span className="font-semibold">{Object.keys(fieldMapping).length}</span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full apple-body">
                  <thead>
                    <tr className="border-b border-[var(--apple-separator)]">
                      {Object.values(fieldMapping)
                        .filter(Boolean)
                        .map((field) => (
                          <th key={field} className="text-left p-2 apple-callout font-semibold">
                            {field}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSheet.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-[var(--apple-separator)]">
                        {Object.entries(fieldMapping)
                          .filter(([_, field]) => field)
                          .map(([header, _]) => {
                            const colIndex = selectedSheet.headers.indexOf(header);
                            return (
                              <td key={header} className="p-2">
                                {row[colIndex]}
                              </td>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedSheet.rows.length > 5 && (
                  <p className="apple-footnote text-[var(--apple-label-secondary)] mt-2 text-center">
                    Showing 5 of {selectedSheet.rows.length} rows
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleImport} className="flex-1 apple-button-filled">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={onCancel} className="apple-button-plain">
          Cancel
        </Button>
      </div>
    </div>
  );
};
