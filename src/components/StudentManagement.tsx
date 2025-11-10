import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, Trash2, Edit, Users, FileSpreadsheet, UsersRound } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { GlassCard } from "./ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Student, Class } from "@/types";
import { useToast } from "./ui/tiktok-toast";
import { StudentGroups } from "./StudentGroups";
import { EnhancedStudentForm } from "./EnhancedStudentForm";
import { StudentDetailsDialog } from "./ui/student-details-dialog";
import { Eye } from 'lucide-react';
import { playSound } from "@/lib/sound";

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
  onBulkImport,
}: StudentManagementProps) {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showEnhancedForm, setShowEnhancedForm] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { addToast } = useToast();

  const handleEnhancedStudentAdd = (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedClass) return;
    
    if (editingStudent) {
      onStudentEdit(selectedClass.id, editingStudent.id, studentData);
      setEditingStudent(null);
      playSound('success');
    } else {
      onStudentAdd(selectedClass.id, studentData);
      playSound('success');
    }
    
    setShowEnhancedForm(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowEnhancedForm(true);
    playSound('tap');
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
    playSound('tap');
  };

  const handleDelete = (student: Student) => {
    if (!selectedClass) return;
    const confirmed = window.confirm(`Remove ${student.name} from ${selectedClass.name}? This action cannot be undone.`);
    if (!confirmed) return;

    onStudentDelete(selectedClass.id, student.id);
    setShowStudentDetails(false);
    playSound('delete');
    addToast({
      type: "success",
      title: "Student Removed",
      description: `${student.name} has been removed from ${selectedClass.name}`,
    });
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const students: Omit<Student, 'id'>[] = [];

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [name, rollNumber, email] = line.split(',').map(s => s.trim());
        if (name && selectedClass) {
          students.push({
            name,
            rollNumber: rollNumber || undefined,
            email: email || undefined,
            class_id: selectedClass.id
          });
        }
      }

      if (students.length > 0 && selectedClass) {
        onBulkImport(selectedClass.id, students);
        addToast({
          type: "success",
          title: "Students Imported",
          description: `${students.length} students imported successfully`,
        });
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleUpdateStudentGroup = (studentId: string, updates: Partial<Student>) => {
    if (!selectedClass) return;
    onStudentEdit(selectedClass.id, studentId, updates);
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

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="list" className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            Student List
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">
            <UsersRound className="w-4 h-4 mr-2" />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="space-y-6">
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

            {/* Student Management */}
            {selectedClass && (
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Students in {selectedClass.name}</h2>
                  <div className="flex gap-2">
                    {/* CSV Import/Export */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVImport}
                        className="hidden"
                        id="csvInput"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('csvInput')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                      </Button>
                    </div>

                    {/* Add Student Button */}
                    <Button
                      onClick={() => {
                        setShowEnhancedForm(true);
                        setEditingStudent(null);
                      }}
                      className="font-poppins"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </div>
                </div>



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
                        className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/30 transition-colors"
                        style={{ borderRadius: 'var(--radius-lg)' }}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium font-poppins">{student.name}</h4>
                          <div className="flex gap-4 text-sm text-gray-600 font-poppins">
                            {student.rollNumber && <span>Roll: {student.rollNumber}</span>}
                            {student.registrationNumber && <span>Reg: {student.registrationNumber}</span>}
                            {student.examIndexNumber && <span>Index: {student.examIndexNumber}</span>}
                            {student.email && <span>Email: {student.email}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudent(student)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(student)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </GlassCard>
            )}

            {/* Student Details Dialog */}
            <StudentDetailsDialog
              open={showStudentDetails}
              onClose={() => setShowStudentDetails(false)}
              student={selectedStudent}
              onDelete={handleDelete}
            />
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <UsersRound className="w-5 h-5" />
              Student Groups
            </h2>
            
            {selectedClass ? (
              <StudentGroups
                students={selectedClass.students}
                onUpdateStudent={handleUpdateStudentGroup}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UsersRound className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a class to manage student groups</p>
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Enhanced Student Form Modal */}
      {showEnhancedForm && selectedClass && (
        <EnhancedStudentForm
          onAddStudent={handleEnhancedStudentAdd}
          onClose={() => {
            setShowEnhancedForm(false);
            setEditingStudent(null);
          }}
          classId={selectedClass.id}
          existingStudent={editingStudent || undefined}
        />
      )}
    </div>
  );
}
