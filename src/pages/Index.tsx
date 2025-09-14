import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { ClassSetup } from "@/components/ClassSetup";
import { StudentManagement } from "@/components/StudentManagement";
import { AttendanceRoller } from "@/components/AttendanceRoller";
import { Reports } from "@/components/Reports";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Class, Session, Student } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Users, Target, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [classes, setClasses] = useLocalStorage<Class[]>("classes", []);
  const [sessions, setSessions] = useLocalStorage<Session[]>("sessions", []);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isRollerActive, setIsRollerActive] = useState(false);
  const { toast } = useToast();

  // Generate unique IDs
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleClassCreate = (classData: Omit<Class, 'id' | 'createdAt'>) => {
    const newClass: Class = {
      ...classData,
      id: generateId(),
      createdAt: new Date(),
    };
    setClasses(prev => [...prev, newClass]);
  };

  const handleSessionStart = (sessionData: Omit<Session, 'id'>) => {
    const session: Session = {
      ...sessionData,
      id: generateId(),
    };
    setCurrentSession(session);
    setIsRollerActive(true);
  };

  const handleAttendanceComplete = (attendance: Record<string, boolean>) => {
    if (!currentSession) return;

    const completedSession: Session = {
      ...currentSession,
      attendance,
    };

    setSessions(prev => [...prev, completedSession]);
    setIsRollerActive(false);
    setCurrentSession(null);
    
    toast({
      title: "Attendance Completed! ✅",
      description: `Session "${completedSession.topic}" has been saved successfully`,
    });
  };

  const handleAttendanceCancel = () => {
    setIsRollerActive(false);
    setCurrentSession(null);
    toast({
      title: "Attendance Cancelled",
      description: "Returning to class setup",
    });
  };

  const handleStudentAdd = (classId: string, studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: generateId(),
    };
    
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { ...cls, students: [...cls.students, newStudent] }
        : cls
    ));
  };

  const handleStudentEdit = (classId: string, studentId: string, updates: Partial<Student>) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? {
            ...cls, 
            students: cls.students.map(student => 
              student.id === studentId ? { ...student, ...updates } : student
            )
          }
        : cls
    ));
  };

  const handleStudentDelete = (classId: string, studentId: string) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { ...cls, students: cls.students.filter(s => s.id !== studentId) }
        : cls
    ));
  };

  const handleBulkImport = (classId: string, studentsData: Omit<Student, 'id'>[]) => {
    const newStudents: Student[] = studentsData.map(data => ({
      ...data,
      id: generateId(),
    }));
    
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { ...cls, students: [...cls.students, ...newStudents] }
        : cls
    ));
  };

  // Get current class for roller
  const getCurrentClass = () => {
    if (!currentSession) return null;
    return classes.find(cls => cls.id === currentSession.classId);
  };

  const renderContent = () => {
    if (isRollerActive && currentSession) {
      const currentClass = getCurrentClass();
      if (!currentClass) {
        handleAttendanceCancel();
        return null;
      }

      return (
        <div className="pb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold gradient-text mb-2">
              Attendance in Progress
            </h1>
            <p className="text-muted-foreground">
              {currentClass.name} - {currentSession.topic}
            </p>
          </motion.div>

          <AttendanceRoller
            students={currentClass.students}
            onComplete={handleAttendanceComplete}
            onCancel={handleAttendanceCancel}
          />
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <div className="pb-24">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-2xl mb-8"
            >
              <div 
                className="h-64 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-glow/60" />
                <div className="relative z-10 p-8 text-white">
                  <h1 className="text-4xl font-bold mb-2">TeacherMate</h1>
                  <p className="text-lg opacity-90 mb-4">
                    Modern attendance management with glassmorphism design
                  </p>
                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1 bg-white/20 rounded-full">📱 Mobile Ready</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full">🎯 Smart Roller</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full">📊 CSV Export</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard className="p-6 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="text-2xl font-bold">{classes.length}</h3>
                  <p className="text-sm text-muted-foreground">Active Classes</p>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-success" />
                  <h3 className="text-2xl font-bold">
                    {classes.reduce((sum, cls) => sum + cls.students.length, 0)}
                  </h3>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard className="p-6 text-center">
                  <Target className="w-8 h-8 mx-auto mb-3 text-warning" />
                  <h3 className="text-2xl font-bold">{sessions.length}</h3>
                  <p className="text-sm text-muted-foreground">Sessions Completed</p>
                </GlassCard>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setActiveTab("classes")}
                    className="h-16 text-left justify-start bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg"
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-semibold">Start Attendance</div>
                      <div className="text-xs opacity-90">Take attendance with the smart roller</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab("students")}
                    variant="outline"
                    className="h-16 text-left justify-start"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    <div>
                      <div className="font-semibold">Manage Students</div>
                      <div className="text-xs text-muted-foreground">Add, edit, or import students</div>
                    </div>
                  </Button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p>🎰 Slot-machine style attendance roller</p>
                    <p>📱 Cross-platform mobile support (iOS & Android)</p>
                    <p>🎨 MacOS-inspired glassmorphism design</p>
                    <p>📊 CSV export for spreadsheet integration</p>
                  </div>
                  <div className="space-y-2">
                    <p>👥 Student management with bulk import</p>
                    <p>📈 Attendance reports and analytics</p>
                    <p>💾 Offline-first with local storage</p>
                    <p>⚡ Smooth animations and spring physics</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        );

      case "classes":
        return (
          <div className="pb-24">
            <ClassSetup 
              classes={classes}
              onClassCreate={handleClassCreate}
              onSessionStart={handleSessionStart}
            />
          </div>
        );

      case "students":
        return (
          <div className="pb-24">
            <StudentManagement
              classes={classes}
              onStudentAdd={handleStudentAdd}
              onStudentEdit={handleStudentEdit}
              onStudentDelete={handleStudentDelete}
              onBulkImport={handleBulkImport}
            />
          </div>
        );

      case "reports":
        return (
          <div className="pb-24">
            <Reports classes={classes} sessions={sessions} />
          </div>
        );

      case "settings":
        return (
          <div className="pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <GlassCard className="p-6 text-center">
                <h1 className="text-2xl font-bold gradient-text mb-4">Settings</h1>
                <p className="text-muted-foreground mb-6">
                  App settings and preferences will be available in future updates.
                </p>
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h3 className="font-semibold mb-2">Mobile App Instructions</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>1. Export project to GitHub</p>
                      <p>2. Git pull and run <code className="bg-muted px-1 rounded">npm install</code></p>
                      <p>3. Add platforms: <code className="bg-muted px-1 rounded">npx cap add ios/android</code></p>
                      <p>4. Build: <code className="bg-muted px-1 rounded">npm run build</code></p>
                      <p>5. Sync: <code className="bg-muted px-1 rounded">npx cap sync</code></p>
                      <p>6. Run: <code className="bg-muted px-1 rounded">npx cap run ios/android</code></p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {renderContent()}
      </div>
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
