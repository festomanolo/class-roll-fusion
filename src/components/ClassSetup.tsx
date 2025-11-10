import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Calendar, FileText, ChevronDown, Trophy, Eye, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { GlassCard } from "./ui/glass-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Class, Session, ExtracurricularClub } from "@/types";
import { useToast } from "./ui/tiktok-toast";
import { NotificationService } from '@/services/mobile/NotificationService';
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TeacherProfile } from "./TeacherSetup";
import { getSubjectsByLevel, getTopicsBySubject, getSubtopicsByTopic, getSubjectById } from "@/data/tanzaniaSyllabus";
import { EnhancedClassCreation } from "./EnhancedClassCreation";
import { EnhancedStudentForm } from "./EnhancedStudentForm";
import { ClassDetails } from "./ClassDetails";

interface ClassSetupProps {
  classes: Class[];
  clubs: ExtracurricularClub[];
  sessions: Session[];
  onClassCreate: (classData: Omit<Class, 'id' | 'createdAt'>) => void;
  onClubCreate: (clubData: Omit<ExtracurricularClub, 'id' | 'created_at' | 'updated_at'>) => void;
  onSessionStart: (session: Omit<Session, 'id'>) => void;
  onStudentAdd?: (classId: string, studentData: Omit<import("@/types").Student, 'id'>) => void;
  onStudentEdit?: (classId: string, studentId: string, updates: Partial<import("@/types").Student>) => void;
  onStudentDelete?: (classId: string, studentId: string) => void;
}

export function ClassSetup({ classes, clubs, sessions, onClassCreate, onClubCreate, onSessionStart, onStudentAdd, onStudentEdit, onStudentDelete }: ClassSetupProps) {
  const [showEnhancedForm, setShowEnhancedForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    topic: '',
    subtopic: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [classForm, setClassForm] = useState({
    name: '',
    subject: '',
  });
  const [teacherProfile] = useLocalStorage<TeacherProfile | null>('teacherProfile', null);
  const { addToast } = useToast();
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<import("@/types").Student | null>(null);

  // Get available subjects based on teacher's education level
  const availableSubjects = teacherProfile 
    ? getSubjectsByLevel(teacherProfile.educationLevel).filter(subject => 
        teacherProfile.subjects.includes(subject.id)
      )
    : [];

  // Get topics for selected subject
  const getTopicsForSubject = (subjectId: string) => {
    return getTopicsBySubject(subjectId);
  };

  // Get subtopics for selected topic
  const getSubtopicsForTopic = (subjectId: string, topicName: string) => {
    const topics = getTopicsBySubject(subjectId);
    const topic = topics.find(t => t.name === topicName);
    if (!topic) return [];
    return getSubtopicsByTopic(subjectId, topic.id);
  };

  const handleEnhancedClassCreate = (classData: Partial<Class>) => {
    onClassCreate({
      name: classData.name!,
      subject: classData.subject!,
      education_level: classData.education_level!,
      class_type: classData.class_type!,
      base_class: classData.base_class,
      stream: classData.stream,
      combination: classData.combination,
      custom_combination: classData.custom_combination,
      students: [],
    });
    setShowEnhancedForm(false);
  };

  const handleEnhancedClubCreate = (clubData: Partial<ExtracurricularClub>) => {
    onClubCreate({
      name: clubData.name!,
      category: clubData.category!,
      description: clubData.description,
      meeting_schedule: clubData.meeting_schedule,
      students: [],
    });
    setShowEnhancedForm(false);
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !sessionForm.topic.trim()) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Please select a class and enter a topic",
      });
      return;
    }

    if ((selectedClass.students?.length || 0) === 0) {
      addToast({
        type: "error",
        title: "No Students",
        description: "Please add students to this class before starting attendance",
      });
      return;
    }

    onSessionStart({
      classId: selectedClass.id,
      topic: sessionForm.topic,
      subtopic: sessionForm.subtopic,
      date: new Date(sessionForm.date),
      attendance: {},
    });
    
    // Reset form after starting session
    setSessionForm({
      topic: '',
      subtopic: '',
      date: new Date().toISOString().split('T')[0],
    });
    // Schedule a gentle notification before the session (best-effort)
    try {
      const sessionDate = new Date(sessionForm.date);
      // schedule 10 minutes before session if in future; otherwise send immediate
      const scheduledAt = (sessionDate.getTime() - 10 * 60 * 1000) > Date.now()
        ? new Date(sessionDate.getTime() - 10 * 60 * 1000)
        : new Date();
      void NotificationService.scheduleNotification({
        title: 'Upcoming Class',
        body: `${selectedClass.name} — ${sessionForm.topic}${sessionForm.subtopic ? ' — ' + sessionForm.subtopic : ''}`,
        schedule: scheduledAt,
        data: { type: 'class_reminder', classId: selectedClass.id }
      });
    } catch (e) {
      console.warn('Failed to schedule reminder:', e);
    }
  };

  // Reset topic when subject changes
  useEffect(() => {
    if (selectedClass) {
      setSessionForm(prev => ({
        ...prev,
        topic: '',
        subtopic: '',
      }));
    }
  }, [selectedClass?.subject]);

  // If showing class details, render that instead
  if (showClassDetails && selectedClass) {
    return (
      <ClassDetails
        selectedClass={selectedClass}
        sessions={sessions}
        onBack={() => {
          setShowClassDetails(false);
        }}
        onStartSession={() => {
          setShowClassDetails(false);
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Class Management
        </h1>
        <p className="text-muted-foreground">
          Create classes and start attendance sessions
        </p>
      </motion.div>

      {/* Create New Class/Club */}
      <GlassCard className="p-6 bg-white border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 font-poppins">
            <BookOpen className="w-5 h-5" />
            Classes & Clubs
          </h2>
          <Button
            onClick={() => setShowEnhancedForm(true)}
            className="font-poppins"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create New
          </Button>
        </div>

        {/* Academic Classes */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 font-poppins">Academic Classes</h3>
          {classes.filter(cls => cls.class_type !== 'extracurricular').length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-poppins">No academic classes created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.filter(cls => cls.class_type !== 'extracurricular').map((cls) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border-2 cursor-pointer transition-all rounded-lg font-poppins ${
                    selectedClass?.id === cls.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setSelectedClass(cls);
                    setShowClassDetails(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                      <p className="text-sm text-gray-600">
                        {getSubjectById(cls.subject)?.name || cls.subject}
                        {cls.education_level && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {cls.education_level}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          {cls.students?.length || 0} students
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass(cls);
                          setShowClassDetails(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Extracurricular Clubs */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 font-poppins flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Extracurricular Clubs
          </h3>
          {clubs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-poppins">No clubs created yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clubs.map((club) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all rounded-lg font-poppins"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{club.name}</h3>
                      <p className="text-sm text-gray-600">
                        <span className="capitalize">{club.category}</span>
                        {club.meeting_schedule && (
                          <span className="ml-2 text-gray-500">• {club.meeting_schedule}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {club.students?.length || 0} members
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Start Session */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Start Attendance Session
            </h2>
            
            <div className="mb-4 p-3 bg-primary/10" style={{ borderRadius: 'var(--radius-lg)' }}>
              <p className="text-sm text-muted-foreground">Selected Class:</p>
              <p className="font-semibold">
                {selectedClass.name} - {getSubjectById(selectedClass.subject)?.name || selectedClass.subject}
              </p>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic *</Label>
                <Select
                  value={sessionForm.topic || ""}
                  onValueChange={(value) => setSessionForm({ ...sessionForm, topic: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic from the syllabus" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      try {
                        const topics = getTopicsForSubject(selectedClass.subject);
                        if (topics.length === 0) {
                          return (
                            <SelectItem value="" disabled>
                              No topics available for this subject
                            </SelectItem>
                          );
                        }
                        return topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.name}>
                            <div className="flex items-center gap-2">
                              {topic.isCustom && (
                                <span className="text-xs bg-secondary text-secondary-foreground px-1 rounded">
                                  Custom
                                </span>
                              )}
                              {topic.name}
                            </div>
                          </SelectItem>
                        ));
                      } catch (error) {
                        console.error('Error loading topics:', error);
                        return (
                          <SelectItem value="" disabled>
                            Error loading topics
                          </SelectItem>
                        );
                      }
                    })()}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subtopic">Subtopic (Optional)</Label>
                {sessionForm.topic ? (
                  <div className="space-y-2">
                    <Select
                      value={sessionForm.subtopic || ""}
                      onValueChange={(value) => setSessionForm({ ...sessionForm, subtopic: value === "custom" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subtopic from the syllabus" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          try {
                            const subtopics = getSubtopicsForTopic(selectedClass.subject, sessionForm.topic);
                            if (subtopics.length === 0) {
                              return (
                                <SelectItem value="custom">Use custom subtopic</SelectItem>
                              );
                            }
                            return (
                              <>
                                {subtopics.map((subtopic) => (
                                  <SelectItem key={subtopic.id} value={subtopic.name}>
                                    <div className="flex flex-col">
                                      <span>{subtopic.name}</span>
                                      {subtopic.description && (
                                        <span className="text-xs text-gray-500 mt-1 line-clamp-2">{subtopic.description}</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                                <SelectItem value="custom">Use custom subtopic</SelectItem>
                              </>
                            );
                          } catch (error) {
                            console.error('Error loading subtopics:', error);
                            return (
                              <SelectItem value="custom" disabled>
                                Error loading subtopics
                              </SelectItem>
                            );
                          }
                        })()}
                      </SelectContent>
                    </Select>
                    {(!sessionForm.subtopic || sessionForm.subtopic === "custom") && (
                      <Input
                        id="subtopic"
                        value={sessionForm.subtopic === "custom" ? "" : sessionForm.subtopic}
                        onChange={(e) => setSessionForm({ ...sessionForm, subtopic: e.target.value })}
                        placeholder="Enter custom subtopic"
                      />
                    )}
                  </div>
                ) : (
                  <Input
                    id="subtopic"
                    value={sessionForm.subtopic}
                    onChange={(e) => setSessionForm({ ...sessionForm, subtopic: e.target.value })}
                    placeholder="Select a topic first, or enter custom subtopic"
                    disabled={!sessionForm.topic}
                  />
                )}
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Start Attendance Session
              </Button>
            </form>
          </GlassCard>
        </motion.div>
      )}

      {/* Manage Students */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manage Students
              </h2>
              <Button size="sm" onClick={() => { setEditingStudent(null); setShowStudentForm(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Student
              </Button>
            </div>

            {selectedClass.students && selectedClass.students.length > 0 ? (
              <div className="space-y-2">
                {selectedClass.students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.rollNumber || s.registrationNumber || s.examIndexNumber || s.email || ''}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingStudent(s); setShowStudentForm(true); }}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => onStudentDelete && onStudentDelete(selectedClass.id, s.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No students yet</div>
            )}
          </GlassCard>

          {showStudentForm && (
            <EnhancedStudentForm
              classId={selectedClass.id}
              existingStudent={editingStudent || undefined}
              onAddStudent={(studentData) => {
                if (editingStudent && onStudentEdit) {
                  onStudentEdit(selectedClass.id, editingStudent.id, studentData as any);
                } else if (onStudentAdd) {
                  onStudentAdd(selectedClass.id, studentData as any);
                }
              }}
              onClose={() => setShowStudentForm(false)}
            />
          )}
        </motion.div>
      )}

      {/* Enhanced Class/Club Creation Modal */}
      {showEnhancedForm && (
        <EnhancedClassCreation
          onCreateClass={handleEnhancedClassCreate}
          onCreateClub={handleEnhancedClubCreate}
          onClose={() => setShowEnhancedForm(false)}
        />
      )}
    </div>
  );
}