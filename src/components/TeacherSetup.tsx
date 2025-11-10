/**
 * Teacher Setup Component
 * First-time setup for teachers to select their education level and subjects
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  tanzaniaEducationSystem, 
  getSubjectsByLevel, 
  EducationLevel, 
  Subject 
} from '@/data/tanzaniaSyllabus';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  School, 
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/auth/AuthService';

export interface TeacherProfile {
  name: string;
  email: string;
  phone: string;
  school: string;
  educationLevel: string;
  subjects: string[];
  experience: string;
  bio: string;
}

interface TeacherSetupProps {
  onComplete: (profile: TeacherProfile) => void;
}

export const TeacherSetup: React.FC<TeacherSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<TeacherProfile>>({
    subjects: []
  });
  const { toast } = useToast();

  // Prefill profile with authenticated user details and skip name/email step if available
  useEffect(() => {
    (async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setProfile(prev => ({
            ...prev,
            name: prev.name || currentUser.full_name || '',
            email: prev.email || currentUser.email || '',
          }));
          if ((currentUser.full_name || '').trim().length > 0) {
            setStep(2);
          }
        }
      } catch (e) {
        // ignore errors when pre-filling profile
        console.warn('TeacherSetup: failed to fetch current user', e);
      }
    })();
  }, []);

  const handleLevelSelect = (levelId: string) => {
    setProfile(prev => ({ 
      ...prev, 
      educationLevel: levelId,
      subjects: [] // Reset subjects when level changes
    }));
    setStep(3);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects?.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...(prev.subjects || []), subjectId]
    }));
  };

  const handleComplete = () => {
    if (!profile.name || !profile.educationLevel || !profile.subjects?.length) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        type: 'foreground'
      });
      return;
    }

    onComplete(profile as TeacherProfile);
  };

  const selectedLevel = tanzaniaEducationSystem.find(l => l.id === profile.educationLevel);
  const availableSubjects = selectedLevel ? getSubjectsByLevel(profile.educationLevel!) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Welcome to Class-Roll
          </h1>
          <p className="text-muted-foreground">
            Let's set up your teaching profile to get started
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > stepNum ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step > stepNum ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h2 className="text-2xl font-semibold mb-2">Personal Information</h2>
                  <p className="text-muted-foreground">Tell us about yourself</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={profile.name || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={profile.email || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+255 XXX XXX XXX"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="school">School Name</Label>
                    <Input
                      id="school"
                      placeholder="Enter your school name"
                      value={profile.school || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, school: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" disabled>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(2)} 
                    className="flex-1"
                    disabled={!profile.name}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <School className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h2 className="text-2xl font-semibold mb-2">Education Level</h2>
                  <p className="text-muted-foreground">Which level do you teach?</p>
                </div>

                <div className="space-y-4">
                  {tanzaniaEducationSystem.map((level) => (
                    <motion.div
                      key={level.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto p-6 text-left justify-start"
                        onClick={() => handleLevelSelect(level.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{level.name}</h3>
                            <p className="text-sm text-muted-foreground break-words overflow-hidden text-ellipsis line-clamp-2">{level.description}</p>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => selectedLevel && setStep(3)} className="flex-1" disabled={!selectedLevel}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && selectedLevel && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h2 className="text-2xl font-semibold mb-2">Select Subjects</h2>
                  <p className="text-muted-foreground">
                    Choose the subjects you teach in {selectedLevel.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableSubjects.map((subject) => (
                    <motion.div
                      key={subject.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={profile.subjects?.includes(subject.id) ? "default" : "outline"}
                        className="w-full h-auto p-4 text-left justify-start"
                        onClick={() => handleSubjectToggle(subject.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            profile.subjects?.includes(subject.id)
                              ? 'bg-white text-primary'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {subject.code}
                          </div>
                          <div>
                            <h4 className="font-medium">{subject.name}</h4>
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {profile.subjects && profile.subjects.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Selected {profile.subjects.length} subject{profile.subjects.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={() => setStep(4)} className="flex-1">
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h2 className="text-2xl font-semibold mb-2">Additional Information</h2>
                  <p className="text-muted-foreground">Help us personalize your experience</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="experience">Teaching Experience</Label>
                    <Input
                      id="experience"
                      placeholder="e.g., 5 years"
                      value={profile.experience || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Brief Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about your teaching philosophy or interests..."
                      value={profile.bio || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Setup Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Level:</strong> {selectedLevel?.name}</p>
                    <p><strong>Subjects:</strong> {profile.subjects?.length} selected</p>
                    {profile.school && <p><strong>School:</strong> {profile.school}</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleComplete} className="flex-1">
                    Complete Setup <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};