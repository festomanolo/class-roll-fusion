import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ClassSetup } from "@/components/ClassSetup";
import { Navigation } from "@/components/Navigation";
// Students tab removed; student management lives inside class details
import { EnhancedAttendanceRoller } from "@/components/EnhancedAttendanceRoller";
import { Reports } from "@/components/Reports";
import { Plans } from "@/components/Plans";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { GlassCard } from "@/components/ui/glass-card";
import { AppHeader } from "../components/AppHeader";
import { ContentBox } from "@/components/ui/content-box";
import Settings from "./Settings";
import Subjects from "./Subjects";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Class, Session, Student, ExtracurricularClub } from "@/types";
import { useToast } from "@/components/ui/tiktok-toast";
import { BookOpen, Users, Target, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  const [classes, setClasses] = useLocalStorage<Class[]>("classes", []);
  const [clubs, setClubs] = useLocalStorage<ExtracurricularClub[]>("clubs", []);
  const [sessions, setSessions] = useLocalStorage<Session[]>("sessions", []);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isRollerActive, setIsRollerActive] = useState(false);
  const { addToast } = useToast();
  
  // Get the current page title and subtitle
  const getPageInfo = () => {
    switch (activeTab) {
      case 'home':
        return { title: 'Class-Roll', subtitle: 'Welcome back!' };
      case 'classes':
        return { title: 'Classes', subtitle: 'Manage your classes' };
      case 'plans':
        return { title: 'Plans', subtitle: 'Lesson plans, timetable, tests & quizzes' };
      case 'subjects':
        return { title: 'Subjects', subtitle: 'Manage teaching subjects and topics' };
      case 'reports':
        return { title: 'Reports', subtitle: 'View attendance reports' };
      case 'settings':
        return { title: 'Settings', subtitle: 'App preferences' };
      default:
        return { title: 'Class-Roll', subtitle: '' };
    }
  };

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

  const handleClubCreate = (clubData: Omit<ExtracurricularClub, 'id' | 'created_at' | 'updated_at'>) => {
    const newClub: ExtracurricularClub = {
      ...clubData,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setClubs(prev => [...prev, newClub]);
  };

  const handleSessionStart = (sessionData: Omit<Session, 'id'>) => {
    const session: Session = {
      ...sessionData,
      id: generateId(),
    };
    setCurrentSession(session);
    setIsRollerActive(true);
  };

  const handleAttendanceComplete = (attendance: Record<string, boolean | import("@/types").AttendanceStatus>) => {
    if (!currentSession) return;

    const completedSession: Session = {
      ...currentSession,
      attendance,
    };

    setSessions(prev => [...prev, completedSession]);
    setIsRollerActive(false);
    setCurrentSession(null);
    
    addToast({
      type: "success",
      title: "Attendance Completed! ✅",
      description: `Session "${completedSession.topic}" has been saved successfully`,
    });
  };

  const handleAttendanceCancel = () => {
    setIsRollerActive(false);
    setCurrentSession(null);
    addToast({
      type: "info",
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

          <EnhancedAttendanceRoller
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
          <TeacherDashboard 
            classes={classes}
            sessions={sessions}
            onNavigate={setActiveTab}
          />
        );

      case "classes":
        return (
          <div className="pb-24">
            <ClassSetup 
              classes={classes}
              clubs={clubs}
              sessions={sessions}
              onClassCreate={handleClassCreate}
              onClubCreate={handleClubCreate}
              onSessionStart={handleSessionStart}
              onStudentAdd={handleStudentAdd}
              onStudentEdit={handleStudentEdit}
              onStudentDelete={handleStudentDelete}
            />
          </div>
        );

      case "plans":
        return (
          <div className="pb-28">
            <Plans />
          </div>
        );

      case "subjects":
        return (
          <div className="pb-24">
            <Subjects />
          </div>
        );

      case "reports":
        return (
          <div className="pb-24">
            <Reports classes={classes} sessions={sessions} />
          </div>
        );

      case "settings":
        return <Settings />;

      default:
        return null;
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <AppHeader title={title} subtitle={subtitle} />
      
      <div className="flex-1 relative overflow-y-auto">
        <div className={`h-full px-4 pt-6 pb-6 ${activeTab === 'classes' ? 'bg-gray-100 dark:bg-gray-950' : ''}`}>
          {renderContent()}
        </div>
      </div>
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
