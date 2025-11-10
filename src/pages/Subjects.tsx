import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TeacherProfile } from '@/components/TeacherSetup';
import { 
  tanzaniaEducationSystem,
  getSubjectsByLevel,
  getSubjectById,
  getTopicsBySubject,
  getSubtopicsByTopic,
  getCustomTopics,
  removeCustomTopic
} from '@/data/tanzaniaSyllabus';
import type { Topic } from '@/data/tanzaniaSyllabus';
import { CustomTopicForm } from '@/components/CustomTopicForm';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Plus, Edit } from 'lucide-react';

const Subjects: FC = () => {
  const { toast } = useToast();
  const [teacherProfile, setTeacherProfile] = useLocalStorage<TeacherProfile | null>('teacherProfile', null);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const availableSubjects = teacherProfile 
    ? getSubjectsByLevel(teacherProfile.educationLevel)
    : [];

  const handleSubjectToggle = (subjectId: string) => {
    if (!teacherProfile) return;
    const updatedSubjects = teacherProfile.subjects.includes(subjectId)
      ? teacherProfile.subjects.filter(id => id !== subjectId)
      : [...teacherProfile.subjects, subjectId];

    setTeacherProfile({ ...teacherProfile, subjects: updatedSubjects });
    toast({ title: 'Subjects Updated', description: 'Your teaching subjects have been updated successfully' });
  };

  return (
    <div className="space-y-6 px-4 pb-24">
      {/* Manage Subjects */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Manage Subjects
            </h2>
            <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-auto">
                <DialogHeader>
                  <DialogTitle>Add/Remove Teaching Subjects</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {availableSubjects.map(subject => (
                    <div
                      key={subject.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        teacherProfile?.subjects.includes(subject.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:bg-muted/50'
                      }`}
                      onClick={() => handleSubjectToggle(subject.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{subject.code}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{subject.name}</h4>
                        </div>
                      </div>
                      {teacherProfile?.subjects.includes(subject.id) && (
                        <Badge variant="default">Teaching</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            You are currently teaching {teacherProfile?.subjects.length || 0} subjects
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teacherProfile?.subjects.map(subjectId => {
              const subject = getSubjectById(subjectId);
              return subject ? (
                <div 
                  key={subjectId} 
                  className={`flex items-center gap-3 p-3 bg-muted/20 rounded-lg cursor-pointer transition-colors ${
                    selectedSubjectId === subjectId ? 'ring-2 ring-primary' : 'hover:bg-muted/40'
                  }`}
                  onClick={() => setSelectedSubjectId(selectedSubjectId === subjectId ? null : subjectId)}
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{subject.code}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{subject.name}</h4>
                  </div>
                </div>
              ) : null;
            })}
          </div>

          {/* Subject Details - Topics and Subtopics */}
          {selectedSubjectId && (() => {
            const subject = getSubjectById(selectedSubjectId);
            const topics = getTopicsBySubject(selectedSubjectId);
            if (!subject || topics.length === 0) return null;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between mb-4 gap-6 flex-col md:flex-row">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5" />
                        {subject.name}
                      </h2>
                      {subject.code && <div className="text-sm text-muted-foreground mb-3">Code: {subject.code}</div>}
                      {subject.topics && subject.topics.length > 0 && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{subject.topics[0].description || `Explore ${subject.name} topics and subtopics to plan your lessons.`}</p>
                      )}
                    </div>
                    <div className="w-full md:w-72">
                      <div className="bg-muted/10 rounded-md p-3">
                        <h4 className="font-medium mb-2">Quick Start</h4>
                        <ul className="text-sm list-inside list-disc space-y-1 text-muted-foreground">
                          <li>Review the topic list on the right and pick a starting topic.</li>
                          <li>Create a session and pick a subtopic as a learning objective.</li>
                          <li>Attach resources and schedule practicals where relevant.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left column: Goals & Objectives */}
                    <div className="col-span-1 space-y-4">
                      <div className="p-4 bg-muted/10 rounded-lg">
                        <h4 className="font-semibold mb-2">Goals</h4>
                        <p className="text-sm text-muted-foreground">Provide learners with deep conceptual knowledge and practical skills in {subject.name}. Emphasis on application, experiments and projects.</p>
                      </div>

                      <div className="p-4 bg-muted/10 rounded-lg">
                        <h4 className="font-semibold mb-2">Suggested Objectives</h4>
                        <ul className="text-sm list-disc list-inside text-muted-foreground space-y-1">
                          <li>Understand core concepts and definitions.</li>
                          <li>Apply knowledge to solve contextual problems.</li>
                          <li>Carry out practical experiments and present findings.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted/10 rounded-lg">
                        <h4 className="font-semibold mb-2">Resources</h4>
                        <ul className="text-sm text-muted-foreground list-inside list-disc space-y-1">
                          <li><a className="underline" href="https://www.tie.go.tz/publications" target="_blank" rel="noreferrer">TIE official syllabi</a></li>
                          <li><a className="underline" href="https://wazaelimu.com/syllabus-form-5-6-advanced-level/" target="_blank" rel="noreferrer">Waza Elimu syllabus</a></li>
                        </ul>
                      </div>
                    </div>

                    {/* Right column: Topic cards (Notion-like listing) */}
                    <div className="col-span-2 space-y-3 md:col-span-2">
                      {topics.map((topic: Topic) => {
                        const subtopics = getSubtopicsByTopic(selectedSubjectId, topic.id);
                        return (
                          <div key={topic.id} className="p-4 border rounded-lg bg-white/50">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{topic.name}</h3>
                                {topic.description && <p className="text-sm text-muted-foreground mb-2">{topic.description}</p>}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {subtopics.slice(0, 6).map(st => (
                                    <Badge key={st.id} className="text-xs" variant="secondary">{st.name}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <Button size="sm" variant="ghost" onClick={() => {
                                  // Quick action: open a new session prefilled -- TODO integrate
                                  toast({ title: 'Quick Action', description: `You can start a session on: ${topic.name}` });
                                }}>
                                  Start Session
                                </Button>
                                <Button size="sm" className="ml-2" onClick={() => {
                                  // Expand full topic view (reuse existing dialog or route)
                                  setSelectedSubjectId(selectedSubjectId);
                                }}>
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })()}
        </GlassCard>
      </motion.div>

      {/* Custom Topics Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Custom Topics
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Topic
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-auto">
                <DialogHeader>
                  <DialogTitle>Add Custom Topic</DialogTitle>
                </DialogHeader>
                <CustomTopicForm 
                  teacherSubjects={teacherProfile?.subjects || []}
                  onTopicAdded={() => {
                    toast({ title: 'Topic Added', description: 'Custom topic has been added successfully' });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Add your own topics to complement the official Tanzania curriculum. These will appear alongside the standard topics when creating classes.
          </p>

          <div className="space-y-3">
            {teacherProfile?.subjects.map(subjectId => {
              const subject = getSubjectById(subjectId);
              const customSubjectTopics = getCustomTopics(subjectId) as Topic[];
              if (!subject || customSubjectTopics.length === 0) return null;
              return (
                <div key={subjectId} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {subject.name}
                  </h4>
                  <div className="space-y-2">
                    {customSubjectTopics.map(topic => (
                      <div key={topic.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                        <div>
                          <span className="text-sm font-medium">{topic.name}</span>
                          {topic.description && (
                            <p className="text-xs text-muted-foreground">{topic.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            removeCustomTopic(subjectId, topic.id);
                            toast({ title: 'Topic Removed', description: 'Custom topic has been removed' });
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {teacherProfile?.subjects.every(subjectId => (getCustomTopics(subjectId) as Topic[]).length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No custom topics added yet</p>
                <p className="text-sm">Add topics specific to your teaching needs</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Subjects;

