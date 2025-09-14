import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Calendar, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { GlassCard } from "./ui/glass-card";
import { Class, Session } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ClassSetupProps {
  classes: Class[];
  onClassCreate: (classData: Omit<Class, 'id' | 'createdAt'>) => void;
  onSessionStart: (session: Omit<Session, 'id'>) => void;
}

export function ClassSetup({ classes, onClassCreate, onSessionStart }: ClassSetupProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [sessionForm, setSessionForm] = useState({
    topic: '',
    subtopic: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [classForm, setClassForm] = useState({
    name: '',
    subject: '',
  });
  const { toast } = useToast();

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim() || !classForm.subject.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onClassCreate({
      name: classForm.name,
      subject: classForm.subject,
      students: [],
    });

    setClassForm({ name: '', subject: '' });
    setShowCreateForm(false);
    
    toast({
      title: "Class Created!",
      description: `${classForm.name} has been created successfully`,
    });
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !sessionForm.topic.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a class and enter a topic",
        variant: "destructive",
      });
      return;
    }

    if (selectedClass.students.length === 0) {
      toast({
        title: "No Students",
        description: "Please add students to this class before starting attendance",
        variant: "destructive",
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
  };

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

      {/* Create New Class */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Classes
          </h2>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Class
          </Button>
        </div>

        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateClass}
            className="space-y-4 mb-6 p-4 bg-muted/20 rounded-lg"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="className">Class Name *</Label>
                <Input
                  id="className"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. Grade 10A"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={classForm.subject}
                  onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                  placeholder="e.g. Mathematics"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Create Class</Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        )}

        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No classes created yet</p>
            <p className="text-sm">Create your first class to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedClass?.id === cls.id
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent bg-muted/20 hover:bg-muted/30'
                }`}
                onClick={() => setSelectedClass(cls)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">{cls.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground">
                      {cls.students.length} students
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
            
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Selected Class:</p>
              <p className="font-semibold">{selectedClass.name} - {selectedClass.subject}</p>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                  placeholder="e.g. Algebra Basics"
                />
              </div>
              
              <div>
                <Label htmlFor="subtopic">Subtopic (Optional)</Label>
                <Input
                  id="subtopic"
                  value={sessionForm.subtopic}
                  onChange={(e) => setSessionForm({ ...sessionForm, subtopic: e.target.value })}
                  placeholder="e.g. Linear Equations"
                />
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
    </div>
  );
}