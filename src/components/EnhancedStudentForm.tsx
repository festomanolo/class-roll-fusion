import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Hash, FileText, Phone, Mail, MapPin, Camera, Upload, FileSpreadsheet } from "lucide-react";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/tiktok-toast";
import { Student } from "@/types";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { tanzaniaEducationSystem, getSubjectsByLevel } from '@/data/tanzaniaSyllabus';
import { importExcel, importCsv } from '@/lib/data-management';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface EnhancedStudentFormProps {
  onAddStudent: (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
  classId: string;
  existingStudent?: Student;
}

export const EnhancedStudentForm: React.FC<EnhancedStudentFormProps> = ({
  onAddStudent,
  onClose,
  classId,
  existingStudent
}) => {
  const { addToast } = useToast();
  const [classes] = useLocalStorage<any[]>('classes', []);
  const [teacherProfile] = useLocalStorage<any>('teacherProfile', null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: existingStudent?.name || '',
    rollNumber: existingStudent?.rollNumber || '',
    registrationNumber: existingStudent?.registrationNumber || '',
    examIndexNumber: existingStudent?.examIndexNumber || '',
    email: existingStudent?.email || '',
    phone: existingStudent?.phone || '',
    parent_phone: existingStudent?.parent_phone || '',
    address: existingStudent?.address || ''
  });

  // level/class selection
  const [educationLevel, setEducationLevel] = useState<string>(() => {
    if (classId) {
      const cls = classes.find(c => c.id === classId);
      return cls?.education_level || teacherProfile?.educationLevel || '';
    }
    return teacherProfile?.educationLevel || '';
  });
  const [selectedClassId, setSelectedClassId] = useState<string>(classId || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    }

    if (formData.registrationNumber && !/^[A-Z0-9-]+$/i.test(formData.registrationNumber)) {
      newErrors.registrationNumber = 'Registration number should contain only letters, numbers, and hyphens';
    }

    if (formData.examIndexNumber && !/^[A-Z0-9-]+$/i.test(formData.examIndexNumber)) {
      newErrors.examIndexNumber = 'Exam index number should contain only letters, numbers, and hyphens';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.parent_phone && !/^[+]?[\d\s\-()]+$/.test(formData.parent_phone)) {
      newErrors.parent_phone = 'Please enter a valid parent phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast({
        type: "error",
        title: "Validation Error",
        description: "Please fix the errors in the form"
      });
      return;
    }

    const studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      class_id: selectedClassId || classId,
      name: formData.name.trim(),
      rollNumber: formData.rollNumber.trim() || undefined,
      registrationNumber: formData.registrationNumber.trim() || undefined,
      examIndexNumber: formData.examIndexNumber.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      parent_phone: formData.parent_phone.trim() || undefined,
      address: formData.address.trim() || undefined
    };

    onAddStudent(studentData);
    addToast({
      type: "success",
      title: existingStudent ? "Student Updated" : "Student Added",
      description: `${formData.name} has been ${existingStudent ? 'updated' : 'added'} successfully`
    });
    onClose();
  };

  // Auto-assign subjects logic note: currently class/student model does not store per-student subjects
  // but we surface guidance to teacher depending on chosen education level
  const mandatorySubjectsNote = () => {
    if (!educationLevel) return '';
    if (educationLevel.includes('primary')) return 'Primary students are expected to follow all primary subjects.';
    if (educationLevel.includes('Form') || educationLevel.includes('secondary')) return 'Secondary students should be enrolled in core subjects; select class to apply the correct set.';
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileImport = async (file: File) => {
    setImporting(true);
    try {
      let importedData: any[] = [];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        importedData = await importExcel(file);
      } else if (file.name.endsWith('.csv')) {
        importedData = await importCsv(file);
      } else {
        throw new Error('Unsupported file format. Please use .xlsx, .xls, or .csv files.');
      }

      // Process imported data
      const importedStudents: Omit<Student, 'id' | 'created_at' | 'updated_at'>[] = [];

      importedData.forEach((row: any) => {
        // Map common column names to student fields
        const studentData = {
          name: row.name || row.Name || row.student_name || row.StudentName || row.full_name || row.FullName || '',
          rollNumber: row.roll_number || row.RollNumber || row.roll || row.Roll || row.student_id || row.StudentId || undefined,
          registrationNumber: row.registration_number || row.RegistrationNumber || row.reg_number || row.RegNumber || undefined,
          examIndexNumber: row.exam_index || row.ExamIndex || row.index_number || row.IndexNumber || row.necta_index || row.NectaIndex || undefined,
          email: row.email || row.Email || row.e_mail || row.E_mail || undefined,
          phone: row.phone || row.Phone || row.mobile || row.Mobile || row.contact || row.Contact || undefined,
          parent_phone: row.parent_phone || row.ParentPhone || row.guardian_phone || row.GuardianPhone || row.parent_contact || row.ParentContact || undefined,
          address: row.address || row.Address || row.location || row.Location || row.home_address || row.HomeAddress || undefined,
          class_id: classId
        };

        // Only add if name is present
        if (studentData.name.trim()) {
          importedStudents.push(studentData);
        }
      });

      if (importedStudents.length === 0) {
        throw new Error('No valid student data found in the file. Please ensure the file contains student names.');
      }

      // Add all imported students
      importedStudents.forEach(student => onAddStudent(student));

      addToast({
        type: "success",
        title: "Import Successful",
        description: `${importedStudents.length} students imported successfully`
      });

      setShowImportDialog(false);
    } catch (error) {
      addToast({
        type: "error",
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Failed to import students'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6 bg-white border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 font-poppins">
              {existingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Education Level & Class selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Education Level</Label>
                <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="">Select level</option>
                  {tanzaniaEducationSystem.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Class</Label>
                <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option value="">Choose class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.subject ? `— ${c.subject}` : ''}</option>
                  ))}
                </select>
                {mandatorySubjectsNote() && <p className="text-xs text-muted-foreground mt-1">{mandatorySubjectsNote()}</p>}
              </div>
            </div>
            {/* Student Name */}
            <div>
              <Label className="font-poppins text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Student Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter student's full name"
                className={`font-poppins ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1 font-poppins">{errors.name}</p>}
            </div>

            {/* Roll Number */}
            <div>
              <Label className="font-poppins text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Roll Number (Optional)
              </Label>
              <Input
                value={formData.rollNumber}
                onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                placeholder="e.g., 001, A01, etc."
                className="font-poppins"
              />
            </div>

            {/* Registration Number */}
            <div>
              <Label className="font-poppins text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Registration Number (Optional)
              </Label>
              <Input
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange('registrationNumber', e.target.value.toUpperCase())}
                placeholder="e.g., REG-2024-001"
                className={`font-poppins ${errors.registrationNumber ? 'border-red-500' : ''}`}
              />
              {errors.registrationNumber && (
                <p className="text-red-500 text-sm mt-1 font-poppins">{errors.registrationNumber}</p>
              )}
              <p className="text-gray-500 text-xs mt-1 font-poppins">
                Official school registration number
              </p>
            </div>

            {/* Exam Index Number */}
            <div>
              <Label className="font-poppins text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Exam Index Number (Optional)
              </Label>
              <Input
                value={formData.examIndexNumber}
                onChange={(e) => handleInputChange('examIndexNumber', e.target.value.toUpperCase())}
                placeholder="e.g., S0123/0001/2024"
                className={`font-poppins ${errors.examIndexNumber ? 'border-red-500' : ''}`}
              />
              {errors.examIndexNumber && (
                <p className="text-red-500 text-sm mt-1 font-poppins">{errors.examIndexNumber}</p>
              )}
              <p className="text-gray-500 text-xs mt-1 font-poppins">
                National examination index number (NECTA/CSEE)
              </p>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-poppins text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email (Optional)
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="student@example.com"
                  className={`font-poppins ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1 font-poppins">{errors.email}</p>}
              </div>

              <div>
                <Label className="font-poppins text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone (Optional)
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+255 123 456 789"
                  className={`font-poppins ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1 font-poppins">{errors.phone}</p>}
              </div>
            </div>

            {/* Parent Phone */}
            <div>
              <Label className="font-poppins text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Parent/Guardian Phone (Optional)
              </Label>
              <Input
                value={formData.parent_phone}
                onChange={(e) => handleInputChange('parent_phone', e.target.value)}
                placeholder="+255 123 456 789"
                className={`font-poppins ${errors.parent_phone ? 'border-red-500' : ''}`}
              />
              {errors.parent_phone && (
                <p className="text-red-500 text-sm mt-1 font-poppins">{errors.parent_phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <Label className="font-poppins text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address (Optional)
              </Label>
              <Textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Student's home address"
                className="font-poppins resize-none"
                rows={2}
              />
            </div>

            {/* Import Section - More Prominent */}
            <div className="border-t pt-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-3">Or import multiple students at once</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowImportDialog(true)}
                  className="w-full font-poppins border-dashed border-2 hover:border-primary"
                  size="lg"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Import Students from Excel/CSV
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 font-poppins"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 font-poppins"
              >
                {existingStudent ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Import Students
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Import student data from Excel (.xlsx/.xls) or CSV files. The system will automatically detect and map columns based on common field names.
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Supported Column Names:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div><strong>Name:</strong> name, Name, student_name, StudentName, full_name, FullName</div>
                <div><strong>Roll Number:</strong> roll_number, RollNumber, roll, Roll, student_id, StudentId</div>
                <div><strong>Registration:</strong> registration_number, RegistrationNumber, reg_number, RegNumber</div>
                <div><strong>Exam Index:</strong> exam_index, ExamIndex, index_number, IndexNumber, necta_index, NectaIndex</div>
                <div><strong>Email:</strong> email, Email, e_mail, E_mail</div>
                <div><strong>Phone:</strong> phone, Phone, mobile, Mobile, contact, Contact</div>
                <div><strong>Parent Phone:</strong> parent_phone, ParentPhone, guardian_phone, GuardianPhone</div>
                <div><strong>Address:</strong> address, Address, location, Location, home_address, HomeAddress</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex-1"
              >
                {importing ? 'Importing...' : 'Select File'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
                disabled={importing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileSelect}
      />
    </div>
  );
};