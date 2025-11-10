import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, SkipForward, Heart, FileText, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { GlassCard } from "./ui/glass-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Student, AttendanceStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/sound";

interface AttendanceRollerProps {
  students: Student[];
  onComplete: (attendance: Record<string, boolean | AttendanceStatus>) => void;
  onCancel: () => void;
}

export function AttendanceRoller({ students, onComplete, onCancel }: AttendanceRollerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, boolean | AttendanceStatus>>({});
  const [showingStudent, setShowingStudent] = useState<Student | null>(null);
  const [showAbsentDialog, setShowAbsentDialog] = useState(false);
  const [absentReason, setAbsentReason] = useState<'sick' | 'permitted' | 'other'>('sick');
  const [absentNote, setAbsentNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (students.length > 0) {
      startRollerAnimation();
    }
  }, [currentIndex, students]);

  const startRollerAnimation = () => {
    if (currentIndex >= students.length) return;

    setIsSpinning(true);
    
    // Simulate slot machine spinning
    let spinCount = 0;
    const maxSpins = 8;
    
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setShowingStudent(students[randomIndex]);
      spinCount++;
      
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        setShowingStudent(students[currentIndex]);
        setIsSpinning(false);
      }
    }, 100);
  };

  const markAttendance = (present: boolean, reason?: 'sick' | 'permitted' | 'other', note?: string) => {
    const currentStudent = students[currentIndex];
    if (!currentStudent) return;

    const attendanceStatus: boolean | AttendanceStatus = present 
      ? true 
      : { present: false, reason, note };

    const newAttendance = {
      ...attendance,
      [currentStudent.id]: attendanceStatus
    };
    
    setAttendance(newAttendance);
    
    // Success animation and sound feedback
    const reasonText = reason ? ` (${reason})` : '';
    toast({
      title: present ? "Present ✓" : `Absent ✗${reasonText}`,
      description: `${currentStudent.name} marked as ${present ? 'present' : 'absent'}`,
      duration: 1500,
    });

    // Reset absent dialog state
    setAbsentReason('sick');
    setAbsentNote('');
    setShowAbsentDialog(false);

    // Move to next student or complete
    if (currentIndex + 1 >= students.length) {
      setTimeout(() => {
        playSound('success');
        onComplete(newAttendance);
      }, 1000);
    } else {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 800);
    }
  };

  const handleAbsentClick = () => {
    setShowAbsentDialog(true);
  };

  const handleAbsentConfirm = () => {
    markAttendance(false, absentReason, absentNote);
  };

  const skipStudent = () => {
    if (currentIndex + 1 >= students.length) {
      onComplete(attendance);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (students.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-muted-foreground">No students found in this class.</p>
        <Button onClick={onCancel} variant="outline" className="mt-4">
          Go Back
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Progress Bar */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {students.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "var(--gradient-primary)",
            }}
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentIndex + 1) / students.length) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </GlassCard>

      {/* Roller Display */}
      <GlassCard className="roller-container p-8 text-center">
        <h3 className="text-lg font-semibold mb-6 text-muted-foreground">
          Current Student
        </h3>
        
        <div className="relative h-24 mb-8 overflow-hidden bg-muted/20" style={{ borderRadius: 'var(--radius-lg)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={showingStudent?.id || 'empty'}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold gradient-text">
                  {showingStudent?.name || "Loading..."}
                </h2>
                {showingStudent?.rollNumber && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Roll No: {showingStudent.rollNumber}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {isSpinning && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={handleAbsentClick}
            disabled={isSpinning}
            className="flex flex-col items-center p-6 h-auto"
          >
            <X className="w-6 h-6 mb-1" />
            Absent
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={skipStudent}
            disabled={isSpinning}
            className="flex flex-col items-center p-6 h-auto"
          >
            <SkipForward className="w-6 h-6 mb-1" />
            Skip
          </Button>
          
          <Button
            onClick={() => markAttendance(true)}
            disabled={isSpinning}
            size="lg"
            className="flex flex-col items-center p-6 h-auto bg-gradient-to-r from-success to-success-glow hover:shadow-lg"
          >
            <Check className="w-6 h-6 mb-1" />
            Present
          </Button>
        </div>
      </GlassCard>

      {/* Cancel Button */}
      <div className="text-center">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">
          Cancel Attendance
        </Button>
      </div>

      {/* Absent Reason Dialog */}
      <Dialog open={showAbsentDialog} onOpenChange={setShowAbsentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Absent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">
                {showingStudent?.name} - Reason for absence:
              </Label>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={absentReason === 'sick' ? 'default' : 'outline'}
                onClick={() => setAbsentReason('sick')}
                className="justify-start h-auto p-4"
              >
                <Heart className="w-5 h-5 mr-3 text-red-500" />
                <div className="text-left">
                  <div className="font-medium">Sick</div>
                  <div className="text-sm text-muted-foreground">Student is unwell</div>
                </div>
              </Button>
              
              <Button
                variant={absentReason === 'permitted' ? 'default' : 'outline'}
                onClick={() => setAbsentReason('permitted')}
                className="justify-start h-auto p-4"
              >
                <FileText className="w-5 h-5 mr-3 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Permitted</div>
                  <div className="text-sm text-muted-foreground">Authorized absence</div>
                </div>
              </Button>
              
              <Button
                variant={absentReason === 'other' ? 'default' : 'outline'}
                onClick={() => setAbsentReason('other')}
                className="justify-start h-auto p-4"
              >
                <AlertCircle className="w-5 h-5 mr-3 text-orange-500" />
                <div className="text-left">
                  <div className="font-medium">Other</div>
                  <div className="text-sm text-muted-foreground">Other reason</div>
                </div>
              </Button>
            </div>

            <div>
              <Label htmlFor="note">Additional Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any additional details..."
                value={absentNote}
                onChange={(e) => setAbsentNote(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAbsentDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAbsentConfirm}
                variant="destructive"
                className="flex-1"
              >
                Mark Absent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}