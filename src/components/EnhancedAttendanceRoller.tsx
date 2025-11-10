import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, CheckCircle2, XCircle, Play, Pause, RotateCcw, Save } from "lucide-react";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/tiktok-toast";
import { Student, AttendanceStatus } from "@/types";

interface EnhancedAttendanceRollerProps {
  students: Student[];
  onComplete: (attendance: Record<string, AttendanceStatus>) => void;
  onCancel: () => void;
}

type AttendanceMode = 'roller' | 'list';

export const EnhancedAttendanceRoller: React.FC<EnhancedAttendanceRollerProps> = ({
  students,
  onComplete,
  onCancel
}) => {
  const { addToast } = useToast();
  const [mode, setMode] = useState<AttendanceMode>('roller');
  const [isRolling, setIsRolling] = useState(false);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [processedStudents, setProcessedStudents] = useState<Set<string>>(new Set());
  const rollerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // removed adjustable roller speed per user request - keep a sensible default interval
  const [rollerSpeed] = useState(120); // milliseconds (fixed)
  // Reason picker state when marking absent
  const [reasonPickerFor, setReasonPickerFor] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.registrationNumber && student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Shuffle students for random display - memoized to prevent unnecessary re-shuffling
  const shuffledStudents = useMemo(() => {
    if (students.length === 0) return [];
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [students.length]); // Only reshuffle when student count changes

  useEffect(() => {
    if (isRolling && mode === 'roller' && shuffledStudents.length > 0) {
      // Use requestAnimationFrame for smoother animation with less CPU usage
      let animationFrameId: number | undefined;
      let lastTime = performance.now();
      let isActive = true;
      
      const animate = (currentTime: number) => {
        if (!isActive) return;
        
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime >= rollerSpeed && shuffledStudents.length > 0) {
          setCurrentStudentIndex(() => {
            // Randomly select next index for more realistic randomness
            return Math.floor(Math.random() * shuffledStudents.length);
          });
          lastTime = currentTime;
        }
        
        if (isActive && isRolling && mode === 'roller') {
          animationFrameId = requestAnimationFrame(animate);
        }
      };
      
      animationFrameId = requestAnimationFrame(animate);
      
      return () => {
        isActive = false;
        if (animationFrameId !== undefined) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    } else {
      if (rollerIntervalRef.current) {
        clearInterval(rollerIntervalRef.current);
        rollerIntervalRef.current = null;
      }
    }
  }, [isRolling, mode, shuffledStudents, rollerSpeed]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setProcessedStudents(prev => new Set([...prev, studentId]));
  };

  const handleRollerSelect = (present: boolean) => {
    if (shuffledStudents.length === 0) return;

    const currentStudent = shuffledStudents[currentStudentIndex];
    handleAttendanceChange(currentStudent.id, { present, reason: null });

    addToast({
      type: present ? "success" : "error",
      title: present ? "Present ✓" : "Absent ✗",
      description: `${currentStudent.name} marked as ${present ? 'present' : 'absent'}`
    });
  };

  const handleOpenReasonPicker = (studentId: string) => {
    setReasonPickerFor(studentId);
    setCustomReason('');
  };

  const handlePickReason = (studentId: string, reason: 'sick' | 'permitted' | 'other' | null) => {
    // If reason is 'other' and a customReason exists, store it in note
    const note = reason === 'other' && customReason ? customReason : undefined;
    handleAttendanceChange(studentId, { present: false, reason });
    if (note) {
      setAttendance(prev => ({ ...prev, [studentId]: { present: false, reason: 'other', note } }));
    }
    setReasonPickerFor(null);
    addToast({ type: 'error', title: 'Absent', description: `${students.find(s => s.id === studentId)?.name} marked absent — ${reason ?? 'No reason'}` });
  };

  const handleComplete = () => {
    const unprocessedStudents = students.filter(s => !processedStudents.has(s.id));
    
    if (unprocessedStudents.length > 0) {
      addToast({
        type: "warning",
        title: "Incomplete Attendance",
        description: `${unprocessedStudents.length} students not marked. They will be marked as absent.`
      });
      
      // Mark unprocessed students as absent
      const finalAttendance = { ...attendance };
      unprocessedStudents.forEach(student => {
        finalAttendance[student.id] = { present: false, reason: null };
      });
      
      onComplete(finalAttendance);
    } else {
      onComplete(attendance);
    }
  };

  const getAttendanceStats = () => {
    const present = Object.values(attendance).filter(a => a.present).length;
    const absent = Object.values(attendance).filter(a => !a.present).length;
    const total = students.length;
    const remaining = total - present - absent;
    
    return { present, absent, total, remaining };
  };

  const stats = getAttendanceStats();

  // Handle empty students
  if (students.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        <GlassCard className="p-8 text-center bg-white border-gray-200">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground font-poppins">No students found in this class.</p>
          <Button onClick={onCancel} variant="outline" className="mt-4 font-poppins">
            Go Back
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Mode Toggle */}
      <GlassCard className="p-6 bg-white border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">Take Attendance</h2>
          <div className="flex gap-2">
            <Button
              variant={mode === 'roller' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('roller')}
              className="font-poppins"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Roller
            </Button>
            <Button
              variant={mode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('list')}
              className="font-poppins"
            >
              <Users className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-600 font-poppins">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{stats.present}</div>
            <div className="text-xs text-green-600 font-poppins">Present</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{stats.absent}</div>
            <div className="text-xs text-red-600 font-poppins">Absent</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{stats.remaining}</div>
            <div className="text-xs text-orange-600 font-poppins">Remaining</div>
          </div>
        </div>
      </GlassCard>

      {/* Roller Mode */}
      {mode === 'roller' && (
        <GlassCard className="p-6 bg-white border-gray-200">
          <div className="text-center space-y-6">
            {/* Roller Display */}
            <div className="relative h-40 flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
              <AnimatePresence mode="wait">
                {shuffledStudents.length > 0 && shuffledStudents[currentStudentIndex] && (
                  <motion.div
                    key={`${currentStudentIndex}-${shuffledStudents[currentStudentIndex].id}`}
                    initial={{ opacity: 0, y: 50, scale: 0.7, rotateX: 90 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      rotateX: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        mass: 0.8
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -50, 
                      scale: 0.7,
                      rotateX: -90,
                      transition: {
                        duration: 0.15
                      }
                    }}
                    className="text-center w-full px-4"
                  >
                    <motion.div
                      animate={isRolling ? {
                        scale: [1, 1.05, 1],
                        transition: {
                          duration: 0.3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      } : {}}
                    >
                      <div className="text-2xl font-bold text-gray-900 font-poppins mb-2">
                        {shuffledStudents[currentStudentIndex].name}
                      </div>
                      {shuffledStudents[currentStudentIndex].rollNumber && (
                        <div className="text-sm text-gray-600 font-poppins">
                          Roll: {shuffledStudents[currentStudentIndex].rollNumber}
                        </div>
                      )}
                      {processedStudents.has(shuffledStudents[currentStudentIndex].id) && (
                        <Badge 
                          variant={attendance[shuffledStudents[currentStudentIndex].id]?.present ? "default" : "destructive"}
                          className="mt-2"
                        >
                          {attendance[shuffledStudents[currentStudentIndex].id]?.present ? "Present" : "Absent"}
                        </Badge>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              {isRolling && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    background: [
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)"
                    ]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </div>

            {/* Roller Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setIsRolling(!isRolling)}
                variant={isRolling ? "destructive" : "default"}
                size="lg"
                className="font-poppins"
              >
                {isRolling ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Stop Rolling
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Rolling
                  </>
                )}
              </Button>
            </div>

            {/* Attendance Buttons (only when stopped) — Absent on left, Present on right */}
            {!isRolling && shuffledStudents.length > 0 && (
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => handleOpenReasonPicker(shuffledStudents[currentStudentIndex].id)}
                  variant="destructive"
                  size="lg"
                  className="font-poppins"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Absent
                </Button>
                <Button
                  onClick={() => handleRollerSelect(true)}
                  className="bg-green-600 hover:bg-green-700 font-poppins"
                  size="lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Present
                </Button>
              </div>
            )}

            {/* Speed control removed — fixed rolling speed for simplicity */}
          </div>
        </GlassCard>
      )}

      {/* List Mode */}
      {mode === 'list' && (
        <GlassCard className="p-6 bg-white border-gray-200">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students by name, roll number, or registration..."
                className="pl-10 font-poppins"
              />
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStudents.map((student) => {
              const studentAttendance = attendance[student.id];
              const isProcessed = processedStudents.has(student.id);

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isProcessed
                      ? studentAttendance?.present
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 font-poppins">{student.name}</h4>
                      <div className="flex gap-4 text-sm text-gray-600 font-poppins">
                        {student.rollNumber && <span>Roll: {student.rollNumber}</span>}
                        {student.registrationNumber && <span>Reg: {student.registrationNumber}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenReasonPicker(student.id)}
                        variant={studentAttendance?.present === false ? "destructive" : "outline"}
                        size="sm"
                        className="font-poppins"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Absent
                      </Button>
                      <Button
                        onClick={() => handleAttendanceChange(student.id, { present: true, reason: null })}
                        variant={studentAttendance?.present ? "default" : "outline"}
                        size="sm"
                        className="font-poppins"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Present
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 font-poppins"
        >
          Cancel
        </Button>
        <Button
          onClick={handleComplete}
          className="flex-1 font-poppins"
          disabled={Object.keys(attendance).length === 0}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Attendance ({Object.keys(attendance).length}/{students.length})
        </Button>
      </div>
      {/* Reason picker overlay (radial-ish) */}
      {reasonPickerFor && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h4 className="text-lg font-semibold mb-3">Select reason for absence</h4>
            <div className="flex items-center justify-center gap-3 mb-3">
              <button onClick={() => handlePickReason(reasonPickerFor, 'sick')} className="px-4 py-2 rounded-full bg-blue-50 text-blue-700">Sick</button>
              <button onClick={() => handlePickReason(reasonPickerFor, 'permitted')} className="px-4 py-2 rounded-full bg-green-50 text-green-700">Permitted</button>
              <button onClick={() => handlePickReason(reasonPickerFor, 'other')} className="px-4 py-2 rounded-full bg-gray-100 text-gray-800">No Info</button>
            </div>
            <div className="mb-3">
              <label className="text-sm block mb-1">Custom reason (optional)</label>
              <input value={customReason} onChange={(e) => setCustomReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Family emergency" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReasonPickerFor(null)}>Cancel</Button>
              <Button onClick={() => handlePickReason(reasonPickerFor, customReason ? 'other' : 'other')}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};