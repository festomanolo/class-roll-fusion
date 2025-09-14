import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, Trash2, Edit, Users, FileSpreadsheet } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { GlassCard } from "./ui/glass-card";
import { Student, Class } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface StudentManagementProps {
  classes: Class[];
  onStudentAdd: (classId: string, student: Omit<Student, 'id'>) => void;
  onStudentEdit: (classId: string, studentId: string, student: Partial<Student>) => void;
  onStudentDelete: (classId: string, studentId: string) => void;
  onBulkImport: (classId: string, students: Omit<Student, 'id'>[]) => void;
}

export function StudentManagement({
  classes,
  onStudentAdd,
  onStudentEdit,
  onStudentDelete,
  onBulkImport
}: StudentManagementProps) {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !studentForm.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a class and enter student name",
        variant: "destructive",
      });
      return;
    }

    if (editingStudent) {
      onStudentEdit(selectedClass.id, editingStudent.id, studentForm);
      setEditingStudent(null);
      toast({
        title: "Student Updated",
        description: `${studentForm.name} has been updated successfully`,
      });
    } else {
      onStudentAdd(selectedClass.id, studentForm);
      toast({
        title: "Student Added",
        description: `${studentForm.name} has been added to ${selectedClass.name}`,
      });
    }

    setStudentForm({ name: '', rollNumber: '', email: '' });
    setShowAddForm(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      rollNumber: student.rollNumber || '',
      email: student.email || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = (student: Student) => {
    if (!selectedClass) return;
    
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      onStudentDelete(selectedClass.id, student.id);
      toast({
        title: "Student Deleted",
        description: `${student.name} has been removed from ${selectedClass.name}`,
      });
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const students: Omit<Student, 'id'>[] = [];

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [name, rollNumber, email] = line.split(',').map(s => s.trim());
        if (name) {
          students.push({
            name,
            rollNumber: rollNumber || undefined,
            email: email || undefined,
          });
        }
      }

      if (students.length > 0) {
        onBulkImport(selectedClass.id, students);
        toast({
          title: "Students Imported",
          description: `${students.length} students imported successfully`,
        });
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const exportToCSV = () => {
    if (!selectedClass || selectedClass.students.length === 0) return;

    const csvContent = [
      'Name,Roll Number,Email,Present,Absent', // Header
      ...selectedClass.students.map(student => 
        `${student.name},${student.rollNumber || ''},${student.email || ''},,`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedClass.name}_students.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: `Student list for ${selectedClass.name} exported successfully`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Student Management
        </h1>
        <p className="text-muted-foreground">
          Manage students across all your classes
        </p>
      </motion.div>

      {/* Class Selection */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Select Class
        </h2>
        
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No classes available</p>
            <p className="text-sm">Create a class first to manage students</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedClass?.id === cls.id
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent bg-muted/20 hover:bg-muted/30'
                }`}
                onClick={() => setSelectedClass(cls)}
              >
                <h3 className="font-semibold">{cls.name}</h3>
                <p className="text-sm text-muted-foreground">{cls.subject}</p>
                <p className="text-xs text-primary mt-1">
                  {cls.students.length} students
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Student Management Panel */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Controls */}
          <GlassCard className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Students in {selectedClass.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Student
                </Button>
                <label className="cursor-pointer">
                  <Button asChild variant="outline" size="sm">
                    <span>
                      <Upload className="w-4 h-4 mr-1" />
                      Import CSV
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                </label>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  disabled={selectedClass.students.length === 0}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4 mb-6 p-4 bg-muted/20 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="name">Student Name *</Label>
                      <Input
                        id="name"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        value={studentForm.rollNumber}
                        onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                        placeholder="Enter roll number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      {editingStudent ? 'Update' : 'Add'} Student
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingStudent(null);
                        setStudentForm({ name: '', rollNumber: '', email: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Student List */}
            {selectedClass.students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No students in this class yet</p>
                <p className="text-sm">Add students manually or import from CSV</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedClass.students.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium">{student.name}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {student.rollNumber && <span>Roll: {student.rollNumber}</span>}
                        {student.email && <span>Email: {student.email}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(student)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(student)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}