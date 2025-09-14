import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, SkipForward } from "lucide-react";
import { Button } from "./ui/button";
import { GlassCard } from "./ui/glass-card";
import { Student } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRollerProps {
  students: Student[];
  onComplete: (attendance: Record<string, boolean>) => void;
  onCancel: () => void;
}

export function AttendanceRoller({ students, onComplete, onCancel }: AttendanceRollerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [showingStudent, setShowingStudent] = useState<Student | null>(null);
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

  const markAttendance = (present: boolean) => {
    const currentStudent = students[currentIndex];
    if (!currentStudent) return;

    const newAttendance = {
      ...attendance,
      [currentStudent.id]: present
    };
    
    setAttendance(newAttendance);
    
    // Success animation and sound feedback
    toast({
      title: present ? "Present ✓" : "Absent ✗",
      description: `${currentStudent.name} marked as ${present ? 'present' : 'absent'}`,
      duration: 1500,
    });

    // Move to next student or complete
    if (currentIndex + 1 >= students.length) {
      setTimeout(() => onComplete(newAttendance), 1000);
    } else {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 800);
    }
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
        
        <div className="relative h-24 mb-8 overflow-hidden rounded-xl bg-muted/20">
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
            onClick={() => markAttendance(false)}
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
    </div>
  );
}