import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Calendar, 
  BookOpen, 
  FileText, 
  Clock, 
  Bell,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "./ui/tiktok-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { NotificationService } from "@/services/mobile/NotificationService";
import { Class } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { tanzaniaEducationSystem, getSubjectsByLevel } from "@/data/tanzaniaSyllabus";
import { exportCsv, exportExcel } from "@/lib/data-management";

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  classId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  objectives: string;
  materials: string;
  activities: string;
  notes: string;
  createdAt: string;
}

export interface Timetable {
  id: string;
  title: string;
  classId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  subject: string;
  location?: string;
  createdAt: string;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  classId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  maxScore: number;
  description: string;
  createdAt: string;
  scores?: Record<string, number>;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  classId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  questions: number;
  description: string;
  createdAt: string;
}

export const Plans: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'timetable' | 'tests' | 'quizzes'>('plans');
  const [lessonPlans, setLessonPlans] = useLocalStorage<LessonPlan[]>('lessonPlans', []);
  const [timetables, setTimetables] = useLocalStorage<Timetable[]>('timetables', []);
  const [tests, setTests] = useLocalStorage<Test[]>('tests', []);
  const [quizzes, setQuizzes] = useLocalStorage<Quiz[]>('quizzes', []);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const { addToast } = useToast();
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<{ type: 'test' | 'timetable'; id: string } | null>(null);
  const selectedTest = useMemo(() => detail?.type === 'test' ? tests.find(t => t.id === detail.id) || null : null, [detail, tests]);
  const selectedTimetable = useMemo(() => detail?.type === 'timetable' ? timetables.find(t => t.id === detail.id) || null : null, [detail, timetables]);
  const [scoresState, setScoresState] = useState<Record<string, number>>({});

  React.useEffect(() => {
    if (selectedTest) {
      setScoresState(selectedTest.scores || {});
    } else {
      setScoresState({});
    }
  }, [selectedTest]);

  // Form states
  const [lessonPlanForm, setLessonPlanForm] = useState({
    title: '',
    subject: '',
    classId: '',
    date: '',
    time: '',
    duration: 45,
    objectives: '',
    materials: '',
    activities: '',
    notes: '',
  });

  const [timetableForm, setTimetableForm] = useState({
    title: '',
    classId: '',
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    subject: '',
    location: '',
  });

  const [testForm, setTestForm] = useState({
    title: '',
    subject: '',
    classId: '',
    date: '',
    time: '',
    duration: 60,
    maxScore: 100,
    description: '',
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
    subject: '',
    classId: '',
    date: '',
    time: '',
    duration: 30,
    questions: 10,
    description: '',
  });

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get classes for dropdowns (must be declared before any memo that uses them)
  const [classes] = useLocalStorage<Class[]>('classes', []);
  const [teacherProfile] = useLocalStorage<any>('teacherProfile', null);
  const clsForSelectedTest = useMemo(() => selectedTest ? classes.find(c => c.id === selectedTest.classId) || null : null, [selectedTest, classes]);
  const studentsForSelectedTest = (clsForSelectedTest?.students || []) as any[];
  const availableSubjects = useMemo(() => {
    if (!teacherProfile) return [] as { id: string; name: string }[];
    const levelSubjects = getSubjectsByLevel(teacherProfile.educationLevel);
    const filtered = teacherProfile.subjects && teacherProfile.subjects.length
      ? levelSubjects.filter((s: any) => teacherProfile.subjects.includes(s.id))
      : levelSubjects;
    return filtered.map((s: any) => ({ id: s.id, name: s.name }));
  }, [teacherProfile]);
  
  // Filter classes for selected subject in the lesson plan form
  const classesForSubject = useMemo(() => {
    if (!lessonPlanForm.subject) return classes;
    return classes.filter(c => c.subject === lessonPlanForm.subject);
  }, [classes, lessonPlanForm.subject]);

  // Schedule notifications safely
  const scheduleNotifications = async (item: LessonPlan | Test | Quiz, type: 'plan' | 'test' | 'quiz') => {
    try {
      const itemDate = new Date(`${item.date}T${item.time}`);
      const now = new Date();

      if (itemDate <= now) {
        return; // Don't schedule notifications for past events
      }

      // Request permission first
      const hasPermission = await NotificationService.requestWebPermission();
      if (!hasPermission) {
        console.log('Notification permission not granted');
        return;
      }

      // Generate unique IDs for each notification
      const id15 = Math.abs(item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) * 10 + 15;
      const id30 = Math.abs(item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) * 10 + 30;
      const id60 = Math.abs(item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) * 10 + 60;

      // Schedule 15 minutes before
      const reminder15 = new Date(itemDate.getTime() - 15 * 60 * 1000);
      if (reminder15 > now) {
        await NotificationService.scheduleNotification({
          title: `Reminder: ${item.title}`,
          body: `${type === 'plan' ? 'Lesson' : type === 'test' ? 'Test' : 'Quiz'} starts in 15 minutes`,
          id: id15,
          schedule: reminder15,
          data: { type, itemId: item.id },
        }).catch(err => console.error('Notification scheduling error:', err));
      }

      // Schedule 30 minutes before
      const reminder30 = new Date(itemDate.getTime() - 30 * 60 * 1000);
      if (reminder30 > now) {
        await NotificationService.scheduleNotification({
          title: `Reminder: ${item.title}`,
          body: `${type === 'plan' ? 'Lesson' : type === 'test' ? 'Test' : 'Quiz'} starts in 30 minutes`,
          id: id30,
          schedule: reminder30,
          data: { type, itemId: item.id },
        }).catch(err => console.error('Notification scheduling error:', err));
      }

      // Schedule 1 hour before
      const reminder1hr = new Date(itemDate.getTime() - 60 * 60 * 1000);
      if (reminder1hr > now) {
        await NotificationService.scheduleNotification({
          title: `Reminder: ${item.title}`,
          body: `${type === 'plan' ? 'Lesson' : type === 'test' ? 'Test' : 'Quiz'} starts in 1 hour`,
          id: id60,
          schedule: reminder1hr,
          data: { type, itemId: item.id },
        }).catch(err => console.error('Notification scheduling error:', err));
      }

      // For tests, schedule a reminder at end time to enter results
      if (type === 'test') {
        const test = item as Test;
        const endAt = new Date(itemDate.getTime() + (test.duration || 60) * 60 * 1000);
        if (endAt > now) {
          await NotificationService.scheduleNotification({
            title: `Enter results: ${test.title}`,
            body: `The test has finished. Enter student results now.`,
            schedule: endAt,
            data: { type: 'test_results_due', itemId: test.id },
          }).catch(err => console.error('Notification scheduling error:', err));
        }
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      // Don't throw - just log the error to prevent crashes
    }
  };

  const handleCreateLessonPlan = () => {
    if (!lessonPlanForm.title || !lessonPlanForm.subject || !lessonPlanForm.date || !lessonPlanForm.time) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    const newPlan: LessonPlan = {
      id: editingItem || generateId(),
      ...lessonPlanForm,
      createdAt: editingItem ? lessonPlans.find(p => p.id === editingItem)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };

    if (editingItem) {
      setLessonPlans(prev => prev.map(p => p.id === editingItem ? newPlan : p));
    } else {
      setLessonPlans(prev => [...prev, newPlan]);
      scheduleNotifications(newPlan, 'plan').catch(err => console.error('Notification error:', err));
    }

    addToast({
      type: "success",
      title: editingItem ? "Lesson Plan Updated" : "Lesson Plan Created",
      description: `${newPlan.title} has been ${editingItem ? 'updated' : 'created'} successfully`
    });

    resetLessonPlanForm();
  };

  const handleCreateTimetable = () => {
    if (!timetableForm.title || !timetableForm.subject || !timetableForm.startTime || !timetableForm.endTime) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    const newTimetable: Timetable = {
      id: editingItem || generateId(),
      ...timetableForm,
      createdAt: editingItem ? timetables.find(t => t.id === editingItem)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };

    if (editingItem) {
      setTimetables(prev => prev.map(t => t.id === editingItem ? newTimetable : t));
    } else {
      setTimetables(prev => [...prev, newTimetable]);
    }

    addToast({
      type: "success",
      title: editingItem ? "Timetable Updated" : "Timetable Created",
      description: `${newTimetable.title} has been ${editingItem ? 'updated' : 'created'} successfully`
    });

    resetTimetableForm();
  };

  const handleCreateTest = () => {
    if (!testForm.title || !testForm.subject || !testForm.date || !testForm.time) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    const newTest: Test = {
      id: editingItem || generateId(),
      ...testForm,
      createdAt: editingItem ? tests.find(t => t.id === editingItem)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };

    if (editingItem) {
      setTests(prev => prev.map(t => t.id === editingItem ? newTest : t));
    } else {
      setTests(prev => [...prev, newTest]);
      scheduleNotifications(newTest, 'test').catch(err => console.error('Notification error:', err));
    }

    addToast({
      type: "success",
      title: editingItem ? "Test Updated" : "Test Created",
      description: `${newTest.title} has been ${editingItem ? 'updated' : 'created'} successfully`
    });

    resetTestForm();
  };

  const handleCreateQuiz = () => {
    if (!quizForm.title || !quizForm.subject || !quizForm.date || !quizForm.time) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    const newQuiz: Quiz = {
      id: editingItem || generateId(),
      ...quizForm,
      createdAt: editingItem ? quizzes.find(q => q.id === editingItem)?.createdAt || new Date().toISOString() : new Date().toISOString(),
    };

    if (editingItem) {
      setQuizzes(prev => prev.map(q => q.id === editingItem ? newQuiz : q));
    } else {
      setQuizzes(prev => [...prev, newQuiz]);
      scheduleNotifications(newQuiz, 'quiz').catch(err => console.error('Notification error:', err));
    }

    addToast({
      type: "success",
      title: editingItem ? "Quiz Updated" : "Quiz Created",
      description: `${newQuiz.title} has been ${editingItem ? 'updated' : 'created'} successfully`
    });

    resetQuizForm();
  };

  const resetLessonPlanForm = () => {
    setLessonPlanForm({
      title: '',
      subject: '',
      classId: '',
      date: '',
      time: '',
      duration: 45,
      objectives: '',
      materials: '',
      activities: '',
      notes: '',
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const resetTimetableForm = () => {
    setTimetableForm({
      title: '',
      classId: '',
      dayOfWeek: 0,
      startTime: '',
      endTime: '',
      subject: '',
      location: '',
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const resetTestForm = () => {
    setTestForm({
      title: '',
      subject: '',
      classId: '',
      date: '',
      time: '',
      duration: 60,
      maxScore: 100,
      description: '',
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      subject: '',
      classId: '',
      date: '',
      time: '',
      duration: 30,
      questions: 10,
      description: '',
    });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (type: 'plan' | 'timetable' | 'test' | 'quiz', id: string) => {
    setEditingItem(id);
    setShowForm(true);

    if (type === 'plan') {
      const plan = lessonPlans.find(p => p.id === id);
      if (plan) setLessonPlanForm({ ...plan });
    } else if (type === 'timetable') {
      const timetable = timetables.find(t => t.id === id);
      if (timetable) setTimetableForm({ 
        ...timetable,
        location: timetable.location || '' // Provide default empty string if location is undefined
      });
    } else if (type === 'test') {
      const test = tests.find(t => t.id === id);
      if (test) setTestForm({ ...test });
    } else if (type === 'quiz') {
      const quiz = quizzes.find(q => q.id === id);
      if (quiz) setQuizForm({ ...quiz });
    }
  };

  const handleDelete = (type: 'plan' | 'timetable' | 'test' | 'quiz', id: string) => {
    // Ask for confirmation before deleting
    const confirmed = window.confirm('Are you sure you want to delete this item? This action cannot be undone.');
    if (!confirmed) return;

    if (type === 'plan') {
      setLessonPlans(prev => prev.filter(p => p.id !== id));
    } else if (type === 'timetable') {
      setTimetables(prev => prev.filter(t => t.id !== id));
    } else if (type === 'test') {
      setTests(prev => prev.filter(t => t.id !== id));
    } else if (type === 'quiz') {
      setQuizzes(prev => prev.filter(q => q.id !== id));
    }

    addToast({
      type: "success",
      title: "Deleted",
      description: "Item has been deleted successfully"
    });
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 pb-28">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="plans" className="font-poppins">Lesson Plans</TabsTrigger>
          <TabsTrigger value="timetable" className="font-poppins">Timetable</TabsTrigger>
          <TabsTrigger value="tests" className="font-poppins">Tests</TabsTrigger>
          <TabsTrigger value="quizzes" className="font-poppins">Quizzes</TabsTrigger>
        </TabsList>

        {/* Lesson Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 font-poppins">Lesson Plans</h2>
            <Button onClick={() => setShowForm(true)} className="font-poppins">
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>

          {/* Quick filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Subject</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={lessonPlanForm.subject} onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, subject: e.target.value, classId: '' })}>
                <option value="">All subjects</option>
                {availableSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Class</Label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={lessonPlanForm.classId} onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, classId: e.target.value })}>
                <option value="">All classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Create/edit form */}
          {showForm && (
            <GlassCard className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 font-poppins">
                {editingItem ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-poppins">Title *</Label>
                    <Input
                      value={lessonPlanForm.title}
                      onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, title: e.target.value })}
                      placeholder="Lesson title"
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={lessonPlanForm.subject} onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, subject: e.target.value })}>
                      <option value="">Select subject</option>
                      {availableSubjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label>Class</Label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-lg" value={lessonPlanForm.classId} onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, classId: e.target.value })}>
                      <option value="">Select class</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="font-poppins">Date *</Label>
                    <Input
                      type="date"
                      value={lessonPlanForm.date}
                      onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, date: e.target.value })}
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">Time *</Label>
                    <Input
                      type="time"
                      value={lessonPlanForm.time}
                      onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, time: e.target.value })}
                      className="font-poppins"
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-poppins">Learning Objectives</Label>
                  <Textarea
                    value={lessonPlanForm.objectives}
                    onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, objectives: e.target.value })}
                    placeholder="What students will learn..."
                    rows={3}
                    className="font-poppins"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateLessonPlan} className="flex-1 font-poppins">
                    {editingItem ? 'Update' : 'Create'} Plan
                  </Button>
                  <Button onClick={resetLessonPlanForm} variant="outline" className="font-poppins">
                    Cancel
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

          <div className="space-y-3">
            {lessonPlans.map((plan) => (
              <GlassCard key={plan.id} className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete('plan', plan.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 font-poppins">{plan.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-poppins">{plan.subject}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 font-poppins">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(plan.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {plan.time} ({plan.duration} min)
                      </span>
                    </div>
                  </div>
                  <div className="ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('plan', plan.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
            {lessonPlans.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-poppins">No lesson plans created yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Timetable Tab */}
        <TabsContent value="timetable" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-poppins">Timetable</h2>
            <Button onClick={() => setShowForm(true)} className="font-poppins">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>

          {showForm && (
            <GlassCard className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 font-poppins">
                {editingItem ? 'Edit Timetable Entry' : 'Create Timetable Entry'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-poppins">Title *</Label>
                    <Input
                      value={timetableForm.title}
                      onChange={(e) => setTimetableForm({ ...timetableForm, title: e.target.value })}
                      placeholder="Entry title"
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">Subject *</Label>
                    <Select
                      value={timetableForm.subject}
                      onValueChange={(v) => setTimetableForm({ ...timetableForm, subject: v })}
                    >
                      <SelectTrigger className="font-poppins">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjects.map((s) => (
                          <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="font-poppins">Class *</Label>
                  <Select
                    value={timetableForm.classId}
                    onValueChange={(v) => setTimetableForm({ ...timetableForm, classId: v })}
                  >
                    <SelectTrigger className="font-poppins">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-poppins">Day of Week *</Label>
                  <Select
                    value={timetableForm.dayOfWeek.toString()}
                    onValueChange={(v) => setTimetableForm({ ...timetableForm, dayOfWeek: parseInt(v) })}
                  >
                    <SelectTrigger className="font-poppins">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayNames.map((day, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-poppins">Start Time *</Label>
                    <Input
                      type="time"
                      value={timetableForm.startTime}
                      onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })}
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">End Time *</Label>
                    <Input
                      type="time"
                      value={timetableForm.endTime}
                      onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })}
                      className="font-poppins"
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-poppins">Location (Optional)</Label>
                  <Input
                    value={timetableForm.location}
                    onChange={(e) => setTimetableForm({ ...timetableForm, location: e.target.value })}
                    placeholder="Room number, etc."
                    className="font-poppins"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTimetable} className="flex-1 font-poppins">
                    {editingItem ? 'Update' : 'Create'} Entry
                  </Button>
                  <Button onClick={resetTimetableForm} variant="outline" className="font-poppins">
                    Cancel
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

            <div className="space-y-3">
            {timetables.map((timetable) => (
              <GlassCard key={timetable.id} className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer" onClick={() => { setDetail({ type: 'timetable', id: timetable.id }); setShowDetail(true); }}>
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 font-poppins">{timetable.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-poppins">{timetable.subject}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 font-poppins">
                      <span>{dayNames[timetable.dayOfWeek]}</span>
                      <span>{timetable.startTime} - {timetable.endTime}</span>
                      {timetable.location && <span>{timetable.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2" />
                </div>
              </GlassCard>
            ))}
            {timetables.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-poppins">No timetable entries created yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-poppins">Tests</h2>
            <Button onClick={() => setShowForm(true)} className="font-poppins">
              <Plus className="w-4 h-4 mr-2" />
              New Test
            </Button>
          </div>

          {showForm && (
            <GlassCard className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 font-poppins">
                {editingItem ? 'Edit Test' : 'Create Test'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-poppins">Title *</Label>
                    <Input
                      value={testForm.title}
                      onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                      placeholder="Test title"
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">Subject *</Label>
                    <Select
                      value={testForm.subject}
                      onValueChange={(v) => setTestForm({ ...testForm, subject: v })}
                    >
                      <SelectTrigger className="font-poppins">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjects.map((s) => (
                          <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="font-poppins">Class *</Label>
                  <Select
                    value={testForm.classId}
                    onValueChange={(v) => setTestForm({ ...testForm, classId: v })}
                  >
                    <SelectTrigger className="font-poppins">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-poppins">Date *</Label>
                    <Input
                      type="date"
                      value={testForm.date}
                      onChange={(e) => setTestForm({ ...testForm, date: e.target.value })}
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">Time *</Label>
                    <Input
                      type="time"
                      value={testForm.time}
                      onChange={(e) => setTestForm({ ...testForm, time: e.target.value })}
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={testForm.duration}
                      onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) || 60 })}
                      className="font-poppins"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-poppins">Max Score</Label>
                    <Input
                      type="number"
                      value={testForm.maxScore}
                      onChange={(e) => setTestForm({ ...testForm, maxScore: parseInt(e.target.value) || 100 })}
                      className="font-poppins"
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-poppins">Description</Label>
                  <Textarea
                    value={testForm.description}
                    onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                    placeholder="Test description..."
                    rows={3}
                    className="font-poppins"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTest} className="flex-1 font-poppins">
                    {editingItem ? 'Update' : 'Create'} Test
                  </Button>
                  <Button onClick={resetTestForm} variant="outline" className="font-poppins">
                    Cancel
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

            <div className="space-y-3">
            {tests.map((test) => (
              <GlassCard key={test.id} className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer" onClick={() => { setDetail({ type: 'test', id: test.id }); setShowDetail(true); }}>
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 font-poppins">{test.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-poppins">{test.subject}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 font-poppins">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(test.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {test.time} ({test.duration} min)
                      </span>
                      <span>Max: {test.maxScore} pts</span>
                    </div>
                  </div>
                  <div className="flex gap-2" />
                </div>
              </GlassCard>
            ))}
            {tests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-poppins">No tests created yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-poppins">Quizzes</h2>
            <Button onClick={() => setShowForm(true)} className="font-poppins">
              <Plus className="w-4 h-4 mr-2" />
              New Quiz
            </Button>
          </div>

          {showForm && (
            <GlassCard className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 font-poppins">
                {editingItem ? 'Edit Quiz' : 'Create Quiz'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-poppins">Title *</Label>
                    <Input
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                      placeholder="Quiz title"
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">Subject *</Label>
                    <Input
                      value={quizForm.subject}
                      onChange={(e) => setQuizForm({ ...quizForm, subject: e.target.value })}
                      placeholder="Subject name"
                      className="font-poppins"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-poppins">Date *</Label>
                    <Input
                      type="date"
                      value={quizForm.date}
                      onChange={(e) => setQuizForm({ ...quizForm, date: e.target.value })}
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">Time *</Label>
                    <Input
                      type="time"
                      value={quizForm.time}
                      onChange={(e) => setQuizForm({ ...quizForm, time: e.target.value })}
                      className="font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="font-poppins">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) || 30 })}
                      className="font-poppins"
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-poppins">Number of Questions</Label>
                  <Input
                    type="number"
                    value={quizForm.questions}
                    onChange={(e) => setQuizForm({ ...quizForm, questions: parseInt(e.target.value) || 10 })}
                    className="font-poppins"
                  />
                </div>
                <div>
                  <Label className="font-poppins">Description</Label>
                  <Textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    placeholder="Quiz description..."
                    rows={3}
                    className="font-poppins"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateQuiz} className="flex-1 font-poppins">
                    {editingItem ? 'Update' : 'Create'} Quiz
                  </Button>
                  <Button onClick={resetQuizForm} variant="outline" className="font-poppins">
                    Cancel
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

            <div className="space-y-3">
            {quizzes.map((quiz) => (
              <GlassCard key={quiz.id} className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="mr-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete('quiz', quiz.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 font-poppins">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-poppins">{quiz.subject}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 font-poppins">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(quiz.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {quiz.time} ({quiz.duration} min)
                      </span>
                      <span>{quiz.questions} questions</span>
                    </div>
                  </div>
                  <div className="ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit('quiz', quiz.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
            {quizzes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-poppins">No quizzes created yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    {/* Detail Dialog for Tests and Timetables */}
    <Dialog open={showDetail} onOpenChange={setShowDetail}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {detail?.type === 'test' ? 'Test Details' : 'Timetable Entry'}
          </DialogTitle>
        </DialogHeader>
        {detail && detail.type === 'test' && selectedTest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-gray-500">Title</span><div className="font-medium">{selectedTest.title}</div></div>
              <div><span className="text-sm text-gray-500">Subject</span><div className="font-medium">{selectedTest.subject}</div></div>
              <div><span className="text-sm text-gray-500">Date</span><div className="font-medium">{new Date(selectedTest.date).toLocaleDateString()}</div></div>
              <div><span className="text-sm text-gray-500">Time</span><div className="font-medium">{selectedTest.time}</div></div>
              <div><span className="text-sm text-gray-500">Duration</span><div className="font-medium">{selectedTest.duration} min</div></div>
              <div><span className="text-sm text-gray-500">Max Score</span><div className="font-medium">{selectedTest.maxScore}</div></div>
            </div>

            {new Date(`${selectedTest.date}T${selectedTest.time}`).getTime() < Date.now() && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">Enter Results {clsForSelectedTest ? `for ${clsForSelectedTest.name}` : ''}</div>
                <div className="max-h-72 overflow-auto border rounded">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 text-left">
                        <th className="p-2">Student</th>
                        <th className="p-2 w-28">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsForSelectedTest.map(s => (
                        <tr key={s.id} className="border-t">
                          <td className="p-2">{s.name}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={0}
                              max={selectedTest.maxScore}
                              value={scoresState[s.id] ?? ''}
                              onChange={(e) => setScoresState(prev => ({ ...prev, [s.id]: Math.max(0, Math.min(Number(e.target.value || 0), selectedTest.maxScore)) }))}
                              className="w-24 px-2 py-1 border rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => { setTests(prev => prev.map(t => t.id === selectedTest.id ? { ...t, scores: scoresState } : t)); addToast({ type: 'success', title: 'Results Saved', description: 'Student results were saved.' }); }} className="flex-1">Save Results</Button>
                  <Button variant="outline" onClick={() => { const rows = studentsForSelectedTest.map(s => ({ id: s.id, name: s.name, score: scoresState[s.id] ?? '' })); exportCsv(rows as any, `${selectedTest.title.replace(/\s+/g,'_')}_results.csv`); }}>Export CSV</Button>
                  <Button variant="outline" onClick={() => { const rows = studentsForSelectedTest.map(s => ({ id: s.id, name: s.name, score: scoresState[s.id] ?? '' })); exportExcel(rows as any, `${selectedTest.title.replace(/\s+/g,'_')}_results.xlsx`); }}>Export Spreadsheet</Button>
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button variant="outline" onClick={() => { setShowDetail(false); handleEdit('test', selectedTest.id); }}>Edit</Button>
              <Button variant="destructive" onClick={() => { setShowDetail(false); handleDelete('test', selectedTest.id); }}>Delete</Button>
            </div>
          </div>
        )}

        {detail && detail.type === 'timetable' && selectedTimetable && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-gray-500">Title</span><div className="font-medium">{selectedTimetable.title}</div></div>
              <div><span className="text-sm text-gray-500">Subject</span><div className="font-medium">{selectedTimetable.subject}</div></div>
              <div><span className="text-sm text-gray-500">Day</span><div className="font-medium">{dayNames[selectedTimetable.dayOfWeek]}</div></div>
              <div><span className="text-sm text-gray-500">Time</span><div className="font-medium">{selectedTimetable.startTime} - {selectedTimetable.endTime}</div></div>
              {selectedTimetable.location && <div><span className="text-sm text-gray-500">Location</span><div className="font-medium">{selectedTimetable.location}</div></div>}
            </div>
            <div className="pt-2 flex gap-2">
              <Button variant="outline" onClick={() => { setShowDetail(false); handleEdit('timetable', selectedTimetable.id); }}>Edit</Button>
              <Button variant="destructive" onClick={() => { setShowDetail(false); handleDelete('timetable', selectedTimetable.id); }}>Delete</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
};

