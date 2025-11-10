import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Users, Trophy, Palette, Code, Heart, Zap } from "lucide-react";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/tiktok-toast";
import { 
  Class, 
  ExtracurricularClub, 
  EducationLevel, 
  PrimaryClass, 
  SecondaryForm, 
  AdvancedForm, 
  StreamSuffix, 
  AdvancedCombination,
  ExtracurricularCategory 
} from "@/types";
import { getSubjectsByLevel, getSubjectById } from "@/data/tanzaniaSyllabus";

interface EnhancedClassCreationProps {
  onCreateClass: (classData: Partial<Class>) => void;
  onCreateClub: (clubData: Partial<ExtracurricularClub>) => void;
  onClose: () => void;
}

const primaryClasses: PrimaryClass[] = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'];
const secondaryForms: SecondaryForm[] = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
const advancedForms: AdvancedForm[] = ['Form 5', 'Form 6'];
const streamSuffixes: StreamSuffix[] = ['A', 'B', 'C', 'D', 'E'];
const advancedCombinations: AdvancedCombination[] = ['PCB', 'PCM', 'PGM', 'HGL', 'HKL', 'EGM', 'CBG', 'Custom'];

const extracurricularCategories: { category: ExtracurricularCategory; icon: React.ElementType; color: string; clubs: string[] }[] = [
  {
    category: 'sports',
    icon: Trophy,
    color: 'text-orange-600',
    clubs: ['Football Club', 'Basketball Club', 'Volleyball Club', 'Athletics Club', 'Swimming Club', 'Table Tennis Club']
  },
  {
    category: 'academic',
    icon: BookOpen,
    color: 'text-blue-600',
    clubs: ['Debate Club', 'Science Club', 'Mathematics Club', 'English Club', 'History Club', 'Geography Club']
  },
  {
    category: 'arts',
    icon: Palette,
    color: 'text-purple-600',
    clubs: ['Drama Club', 'Music Club', 'Art Club', 'Photography Club', 'Dance Club', 'Creative Writing Club']
  },
  {
    category: 'technology',
    icon: Code,
    color: 'text-green-600',
    clubs: ['STEM Club', 'Robotics Club', 'Computer Club', 'Innovation Club', 'Coding Club', 'Tech Club']
  },
  {
    category: 'leadership',
    icon: Users,
    color: 'text-indigo-600',
    clubs: ['Student Council', 'Prefects', 'Leadership Club', 'Mentorship Program', 'Peer Counseling']
  },
  {
    category: 'community',
    icon: Heart,
    color: 'text-red-600',
    clubs: ['Community Service', 'Environmental Club', 'Health Club', 'Charity Club', 'Volunteer Club']
  }
];

export const EnhancedClassCreation: React.FC<EnhancedClassCreationProps> = ({
  onCreateClass,
  onCreateClub,
  onClose
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'academic' | 'extracurricular'>('academic');
  
  // Academic Class State
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('primary');
  const [baseClass, setBaseClass] = useState<string>('');
  const [stream, setStream] = useState<StreamSuffix | ''>('');
  const [combination, setCombination] = useState<AdvancedCombination | ''>('');
  const [customCombination, setCustomCombination] = useState('');
  const [subject, setSubject] = useState('');
  const [customClassName, setCustomClassName] = useState('');

  // Extracurricular State
  const [clubCategory, setClubCategory] = useState<ExtracurricularCategory>('sports');
  const [clubName, setClubName] = useState('');
  const [customClubName, setCustomClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('');

  const generateClassName = (): string => {
    if (customClassName.trim()) return customClassName.trim();
    
    let name = baseClass;
    if (stream) name += ` ${stream}`;
    if (educationLevel === 'advanced' && combination) {
      if (combination === 'Custom' && customCombination.trim()) {
        name += ` (${customCombination.trim()})`;
      } else if (combination !== 'Custom') {
        name += ` (${combination})`;
      }
    }
    return name;
  };

  const handleCreateClass = () => {
    try {
      const className = generateClassName();
      
      if (!className || !subject.trim()) {
        addToast({
          type: "error",
          title: "Missing Information",
          description: "Please fill in class name and subject"
        });
        return;
      }

      if (!baseClass) {
        addToast({
          type: "error",
          title: "Missing Information",
          description: "Please select a base class"
        });
        return;
      }

      const classData: Partial<Class> = {
        name: className,
        subject: subject.trim(),
        education_level: educationLevel,
        class_type: 'academic',
        base_class: baseClass as any,
        stream: stream || undefined,
        combination: (combination && combination !== 'Custom') ? combination : undefined,
        custom_combination: (combination === 'Custom' && customCombination.trim()) ? customCombination.trim() : undefined
      };

      onCreateClass(classData);
      addToast({
        type: "success",
        title: "Class Created",
        description: `${className} has been created successfully`
      });
      resetForm();
    } catch (error) {
      console.error('Error creating class:', error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to create class. Please try again."
      });
    }
  };

  const handleCreateClub = () => {
    const finalClubName = customClubName.trim() || clubName;
    
    if (!finalClubName) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Please select or enter a club name"
      });
      return;
    }

    const clubData: Partial<ExtracurricularClub> = {
      name: finalClubName,
      category: clubCategory,
      description: clubDescription.trim() || undefined,
      meeting_schedule: meetingSchedule.trim() || undefined
    };

    onCreateClub(clubData);
    addToast({
      type: "success",
      title: "Club Created",
      description: `${finalClubName} has been created successfully`
    });
    resetForm();
  };

  const resetForm = () => {
    setBaseClass('');
    setStream('');
    setCombination('');
    setCustomCombination('');
    setSubject('');
    setCustomClassName('');
    setClubName('');
    setCustomClubName('');
    setClubDescription('');
    setMeetingSchedule('');
  };

  const getClassOptions = (): string[] => {
    try {
      switch (educationLevel) {
        case 'primary':
          return primaryClasses;
        case 'secondary':
          return secondaryForms;
        case 'advanced':
          return advancedForms;
        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting class options:', error);
      return [];
    }
  };

  // Get class options for current education level (memoized to prevent unnecessary recalculations)
  const classOptions = useMemo(() => {
    try {
      return getClassOptions();
    } catch (error) {
      console.error('Error getting class options:', error);
      return [];
    }
  }, [educationLevel]);
  
  // Resolve the internal level id used by the syllabus data
  const resolveLevelId = (level: EducationLevel) => {
    switch (level) {
      case 'primary':
        return 'primary';
      case 'secondary':
        // map generic 'secondary' to the ordinary secondary level used in the syllabus
        return 'secondary-ordinary';
      case 'advanced':
        // map 'advanced' to the advanced level used in the syllabus
        return 'secondary-advanced';
      default:
        return String(level);
    }
  };

  // Get available subjects for current education level (mapped to syllabus ids)
  const availableSubjects = useMemo(() => {
    try {
      const levelId = resolveLevelId(educationLevel);
      return getSubjectsByLevel(levelId);
    } catch (error) {
      console.error('Error getting subjects:', error);
      return [];
    }
  }, [educationLevel]);

  // Validate and reset baseClass if it's invalid for current educationLevel
  useEffect(() => {
    if (baseClass && classOptions.length > 0 && !classOptions.includes(baseClass)) {
      setBaseClass('');
    }
    // Also reset subject when education level changes
    setSubject('');
  }, [educationLevel]); // Only depend on educationLevel to avoid loops

  const selectedCategory = extracurricularCategories.find(cat => cat.category === clubCategory);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-6 bg-white border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 font-poppins">Create New</h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="academic" className="font-poppins">Academic Classes</TabsTrigger>
              <TabsTrigger value="extracurricular" className="font-poppins">Extracurriculars</TabsTrigger>
            </TabsList>

            <TabsContent value="academic" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="font-poppins text-gray-700">Education Level</Label>
                  <Select 
                    value={educationLevel} 
                    onValueChange={(value) => {
                      try {
                        const newLevel = value as EducationLevel;
                        // Reset all dependent fields when level changes
                        setBaseClass('');
                        setStream('');
                        setCombination('');
                        setCustomCombination('');
                        setSubject('');
                        // Update education level
                        setEducationLevel(newLevel);
                      } catch (error) {
                        console.error('Error updating education level:', error);
                        // Fallback: still update the level but log the error
                        setBaseClass('');
                        setStream('');
                        setCombination('');
                        setCustomCombination('');
                        setSubject('');
                        setEducationLevel(value as EducationLevel);
                      }
                    }}
                  >
                    <SelectTrigger className="font-poppins">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary (Class 1-6)</SelectItem>
                      <SelectItem value="secondary">Secondary (Form 1-4)</SelectItem>
                      <SelectItem value="advanced">Advanced (Form 5-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-poppins text-gray-700">Base Class</Label>
                    <Select 
                      value={baseClass || ""} 
                      onValueChange={(value) => {
                        try {
                          if (value && classOptions.includes(value)) {
                            setBaseClass(value);
                          } else {
                            setBaseClass('');
                          }
                        } catch (error) {
                          console.error('Error setting base class:', error);
                          setBaseClass('');
                        }
                      }}
                    >
                      <SelectTrigger className="font-poppins">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.length > 0 ? (
                          classOptions.map((cls) => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__no_base_class__" disabled>No options available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {(educationLevel === 'secondary' || educationLevel === 'advanced') && (
                    <div>
                      <Label className="font-poppins text-gray-700">Stream (Optional)</Label>
                      <Select 
                        value={stream || ""} 
                        onValueChange={(value) => {
                          try {
                            if (value === '__no_stream__') {
                              setStream('');
                            } else {
                              setStream(value ? (value as StreamSuffix) : '');
                            }
                          } catch (error) {
                            console.error('Error setting stream:', error);
                            setStream('');
                          }
                        }}
                      >
                        <SelectTrigger className="font-poppins">
                          <SelectValue placeholder="Select stream" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__no_stream__">No Stream</SelectItem>
                          {streamSuffixes.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {educationLevel === 'advanced' && (
                  <div>
                    <Label className="font-poppins text-gray-700">Subject Combination</Label>
                    <Select 
                      value={combination || ""} 
                      onValueChange={(value) => {
                        try {
                          setCombination(value ? (value as AdvancedCombination) : '');
                        } catch (error) {
                          console.error('Error setting combination:', error);
                          setCombination('');
                        }
                      }}
                    >
                      <SelectTrigger className="font-poppins">
                        <SelectValue placeholder="Select combination" />
                      </SelectTrigger>
                      <SelectContent>
                        {advancedCombinations.map((combo) => (
                          <SelectItem key={combo} value={combo}>
                            {(() => {
                              switch (combo) {
                                case 'PCB': return 'Physics, Chemistry, Biology';
                                case 'PCM': return 'Physics, Chemistry, Mathematics';
                                case 'PGM': return 'Physics, Geography, Mathematics';
                                case 'HGL': return 'History, Geography, Literature';
                                case 'HKL': return 'History, Kiswahili, Literature';
                                case 'EGM': return 'Economics, Geography, Mathematics';
                                case 'CBG': return 'Chemistry, Biology, Geography';
                                case 'Custom': return 'Custom Combination';
                                default: return combo;
                              }
                            })()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {combination === 'Custom' && (
                  <div>
                    <Label className="font-poppins text-gray-700">Custom Combination</Label>
                    <Input
                      value={customCombination}
                      onChange={(e) => setCustomCombination(e.target.value)}
                      placeholder="e.g., Physics, Chemistry, Computer Science"
                      className="font-poppins"
                    />
                  </div>
                )}

                <div>
                  <Label className="font-poppins text-gray-700">Subject *</Label>
                  <Select 
                    value={subject} 
                    onValueChange={(value) => {
                      try {
                        setSubject(value);
                      } catch (error) {
                        console.error('Error setting subject:', error);
                        setSubject('');
                      }
                    }}
                  >
                    <SelectTrigger className="font-poppins">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.length > 0 ? (
                        availableSubjects.map((subj) => (
                          <SelectItem key={subj.id} value={subj.id}>
                            <div className="flex items-center gap-2">
                              {subj.code && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  {subj.code}
                                </span>
                              )}
                              <span>{subj.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_subjects__" disabled>No subjects available for {educationLevel} level</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-poppins text-gray-700">Custom Class Name (Optional)</Label>
                  <Input
                    value={customClassName}
                    onChange={(e) => setCustomClassName(e.target.value)}
                    placeholder="Override auto-generated name"
                    className="font-poppins"
                  />
                  {baseClass && (
                    <p className="text-sm text-gray-500 mt-1 font-poppins">
                      Auto-generated: {generateClassName()}
                    </p>
                  )}
                </div>

                <Button onClick={handleCreateClass} className="w-full font-poppins">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Academic Class
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="extracurricular" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="font-poppins text-gray-700">Category</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {extracurricularCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.category}
                          onClick={() => {
                            setClubCategory(cat.category);
                            setClubName('');
                            setCustomClubName('');
                          }}
                          className={`p-3 rounded-lg border-2 transition-all font-poppins ${
                            clubCategory === cat.category
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${cat.color}`} />
                          <span className="text-sm capitalize text-gray-700">{cat.category}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedCategory && (
                  <div>
                    <Label className="font-poppins text-gray-700">Popular {selectedCategory.category} clubs</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCategory.clubs.map((club) => (
                        <Badge
                          key={club}
                          variant={clubName === club ? "default" : "secondary"}
                          className="cursor-pointer font-poppins"
                          onClick={() => {
                            setClubName(clubName === club ? '' : club);
                            setCustomClubName('');
                          }}
                        >
                          {club}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="font-poppins text-gray-700">Custom Club Name</Label>
                  <Input
                    value={customClubName}
                    onChange={(e) => {
                      setCustomClubName(e.target.value);
                      if (e.target.value.trim()) setClubName('');
                    }}
                    placeholder="Enter custom club name"
                    className="font-poppins"
                  />
                </div>

                <div>
                  <Label className="font-poppins text-gray-700">Description (Optional)</Label>
                  <Input
                    value={clubDescription}
                    onChange={(e) => setClubDescription(e.target.value)}
                    placeholder="Brief description of the club"
                    className="font-poppins"
                  />
                </div>

                <div>
                  <Label className="font-poppins text-gray-700">Meeting Schedule (Optional)</Label>
                  <Input
                    value={meetingSchedule}
                    onChange={(e) => setMeetingSchedule(e.target.value)}
                    placeholder="e.g., Fridays 3:00 PM - 4:00 PM"
                    className="font-poppins"
                  />
                </div>

                <Button onClick={handleCreateClub} className="w-full font-poppins">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Extracurricular Club
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </GlassCard>
      </motion.div>
    </div>
  );
};