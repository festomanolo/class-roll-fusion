import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, GraduationCap, FileText, BarChart3, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface Exam {
  id: string;
  title: string;
  description: string;
  date: Date;
  maxScore: number;
  classId: string;
  scores: Record<string, number>;
}

interface ExamsProps {
  classId: string;
  students: Array<{ id: string; name: string }>;
  exams: Exam[];
  onExamCreate: (exam: Omit<Exam, 'id'>) => void;
  onExamUpdate: (examId: string, updates: Partial<Exam>) => void;
  onExamDelete: (examId: string) => void;
}

export const Exams: FC<ExamsProps> = ({
  classId,
  students,
  exams,
  onExamCreate,
  onExamUpdate,
  onExamDelete
}) => {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGradesDialog, setShowGradesDialog] = useState<string | null>(null);
  const [showResultsDialog, setShowResultsDialog] = useState<string | null>(null);
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    date: new Date(),
    maxScore: 100,
  });
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [publishedResults, setPublishedResults] = useState<Record<string, boolean>>({});

  const handleCreateExam = () => {
    if (!newExam.title.trim()) return;

    const scores: Record<string, number> = {};
    students.forEach(student => {
      scores[student.id] = 0;
    });

    onExamCreate({
      title: newExam.title,
      description: newExam.description,
      date: newExam.date,
      maxScore: newExam.maxScore,
      classId,
      scores,
    });

    setNewExam({ title: '', description: '', date: new Date(), maxScore: 100 });
    setShowAddDialog(false);
  };

  const handleUpdateGrades = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const newScores: Record<string, number> = {};
    Object.entries(grades).forEach(([studentId, grade]) => {
      const score = parseFloat(grade);
      if (!isNaN(score) && score >= 0 && score <= exam.maxScore) {
        newScores[studentId] = score;
      }
    });

    onExamUpdate(examId, { scores: { ...exam.scores, ...newScores } });
    setShowGradesDialog(null);
    setGrades({});
  };

  const calculateAverage = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return 0;

    const scores = Object.values(exam.scores);
    if (scores.length === 0) return 0;

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const getStudentPerformance = (studentId: string) => {
    const studentExams = exams.filter(exam => exam.scores[studentId] !== undefined);
    if (studentExams.length === 0) return null;

    const totalScore = studentExams.reduce((sum, exam) => sum + exam.scores[studentId], 0);
    const averageScore = totalScore / studentExams.length;
    const maxPossible = studentExams.reduce((sum, exam) => sum + exam.maxScore, 0);
    const percentage = (totalScore / maxPossible) * 100;

    return {
      averageScore,
      percentage,
      totalExams: studentExams.length,
      trend: calculateTrend(studentId)
    };
  };

  const calculateTrend = (studentId: string) => {
    const studentExams = exams
      .filter(exam => exam.scores[studentId] !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (studentExams.length < 2) return 'stable';

    const recent = studentExams.slice(-2);
    const firstScore = recent[0].scores[studentId] / recent[0].maxScore;
    const lastScore = recent[1].scores[studentId] / recent[1].maxScore;

    if (lastScore > firstScore + 0.1) return 'improving';
    if (lastScore < firstScore - 0.1) return 'declining';
    return 'stable';
  };

  const getRecommendations = (studentId: string) => {
    const performance = getStudentPerformance(studentId);
    if (!performance) return [];

    const recommendations = [];

    if (performance.percentage < 50) {
      recommendations.push({
        type: 'critical',
        message: 'Student needs immediate academic support',
        action: 'Schedule one-on-one tutoring sessions'
      });
    } else if (performance.percentage < 70) {
      recommendations.push({
        type: 'warning',
        message: 'Student performing below average',
        action: 'Provide additional practice materials'
      });
    }

    if (performance.trend === 'declining') {
      recommendations.push({
        type: 'warning',
        message: 'Recent performance is declining',
        action: 'Monitor closely and identify challenges'
      });
    } else if (performance.trend === 'improving') {
      recommendations.push({
        type: 'positive',
        message: 'Student showing improvement',
        action: 'Continue with current teaching methods'
      });
    }

    return recommendations;
  };

  const publishResults = (examId: string) => {
    setPublishedResults(prev => ({ ...prev, [examId]: true }));
    toast({
      title: "Results Published",
      description: "Exam results have been published and are now visible to students",
    });
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 80) return { text: 'Excellent', variant: 'default' as const };
    if (percentage >= 70) return { text: 'Good', variant: 'secondary' as const };
    if (percentage >= 60) return { text: 'Average', variant: 'outline' as const };
    return { text: 'Needs Improvement', variant: 'destructive' as const };
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="results">Results & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Exams</h2>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-auto">
                <DialogHeader>
                  <DialogTitle>Create New Exam</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newExam.title}
                      onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                      placeholder="Exam title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newExam.description}
                      onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                      placeholder="Exam description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxScore">Maximum Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={newExam.maxScore}
                      onChange={(e) => setNewExam({ ...newExam, maxScore: parseInt(e.target.value) || 100 })}
                      placeholder="Maximum score"
                    />
                  </div>
                  <div>
                    <Label>Exam Date</Label>
                    <Calendar
                      mode="single"
                      selected={newExam.date}
                      onSelect={(date) => date && setNewExam({ ...newExam, date })}
                      className="rounded-md border"
                    />
                  </div>
                  <Button onClick={handleCreateExam}>Create Exam</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {exams.map(exam => (
              <Card key={exam.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{exam.title}</h3>
                      {publishedResults[exam.id] && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Published
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{exam.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Max Score: {exam.maxScore}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Average: {calculateAverage(exam.id).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>Date: {format(new Date(exam.date), 'PPP')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGrades(
                          Object.entries(exam.scores).reduce((acc, [id, score]) => ({
                            ...acc,
                            [id]: score.toString(),
                          }), {})
                        );
                        setShowGradesDialog(exam.id);
                      }}
                    >
                      Enter Grades
                    </Button>
                    {Object.keys(exam.scores).length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResultsDialog(exam.id)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    )}
                    {!publishedResults[exam.id] && Object.keys(exam.scores).length > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => publishResults(exam.id)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Publish Results
                      </Button>
                    )}
                  </div>
                </div>

            {/* Grades Dialog */}
            <Dialog open={showGradesDialog === exam.id} onOpenChange={() => setShowGradesDialog(null)}>
              <DialogContent className="max-w-2xl mx-auto">
                <DialogHeader>
                  <DialogTitle>Enter Grades - {exam.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center gap-4">
                      <Label className="flex-1">{student.name}</Label>
                      <Input
                        type="number"
                        className="w-24"
                        value={grades[student.id] || ''}
                        onChange={(e) => setGrades({
                          ...grades,
                          [student.id]: e.target.value,
                        })}
                        min={0}
                        max={exam.maxScore}
                        placeholder="Score"
                      />
                    </div>
                  ))}
                  <Button onClick={() => handleUpdateGrades(exam.id)}>Save Grades</Button>
                </div>
              </DialogContent>
            </Dialog>

                {/* Student Scores Preview */}
                {Object.keys(exam.scores).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Scores:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {students.slice(0, 4).map(student => {
                        const score = exam.scores[student.id];
                        if (score === undefined) return null;
                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
                          >
                            <span className="truncate">{student.name}</span>
                            <span className={`font-medium ${getGradeColor(score, exam.maxScore)}`}>
                              {score}/{exam.maxScore}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {students.length > 4 && (
                      <p className="text-xs text-muted-foreground">
                        +{students.length - 4} more students
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}

            {exams.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No exams yet</p>
                <p className="text-sm">Create an exam to start tracking grades</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Results & Analytics</h2>

            {/* Class Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Class Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {exams.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Exams</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {students.filter(s => getStudentPerformance(s.id)?.percentage >= 70).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Passing Students</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {exams.length > 0 ? (exams.reduce((sum, exam) => sum + calculateAverage(exam.id), 0) / exams.length).toFixed(1) : 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Class Average</p>
                </div>
              </div>
            </Card>

            {/* Student Performance Cards */}
            <div className="grid gap-4">
              {students.map(student => {
                const performance = getStudentPerformance(student.id);
                if (!performance) return null;

                const badge = getPerformanceBadge(performance.percentage);
                const recommendations = getRecommendations(student.id);

                return (
                  <Card key={student.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{student.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={badge.variant}>{badge.text}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {performance.totalExams} exams taken
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {performance.percentage.toFixed(1)}%
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          {performance.trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {performance.trend === 'declining' && <TrendingDown className="w-4 h-4 text-red-600" />}
                          <span className={performance.trend === 'improving' ? 'text-green-600' : performance.trend === 'declining' ? 'text-red-600' : 'text-muted-foreground'}>
                            {performance.trend === 'improving' ? 'Improving' : performance.trend === 'declining' ? 'Declining' : 'Stable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Progress value={performance.percentage} className="mb-4" />

                    {recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Recommendations
                        </h5>
                        {recommendations.map((rec, index) => (
                          <div key={index} className={`p-2 rounded-md text-sm ${
                            rec.type === 'critical' ? 'bg-red-50 text-red-700' :
                            rec.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-green-50 text-green-700'
                          }`}>
                            <div className="font-medium">{rec.message}</div>
                            <div className="text-xs opacity-75">{rec.action}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Results Dialog */}
      <Dialog open={!!showResultsDialog} onOpenChange={() => setShowResultsDialog(null)}>
        <DialogContent className="max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exam Results - {exams.find(e => e.id === showResultsDialog)?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {showResultsDialog && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Exam Statistics</h4>
                    <div className="space-y-1 text-sm">
                      <div>Average Score: {calculateAverage(showResultsDialog).toFixed(1)}</div>
                      <div>Highest Score: {Math.max(...Object.values(exams.find(e => e.id === showResultsDialog)?.scores || {}))}</div>
                      <div>Lowest Score: {Math.min(...Object.values(exams.find(e => e.id === showResultsDialog)?.scores || {}))}</div>
                      <div>Students Graded: {Object.keys(exams.find(e => e.id === showResultsDialog)?.scores || {}).length}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Performance Distribution</h4>
                    <div className="space-y-1 text-sm">
                      <div>Excellent (80-100%): {students.filter(s => {
                        const score = exams.find(e => e.id === showResultsDialog)?.scores[s.id];
                        return score ? (score / (exams.find(e => e.id === showResultsDialog)?.maxScore || 100)) * 100 >= 80 : false;
                      }).length} students</div>
                      <div>Good (60-79%): {students.filter(s => {
                        const score = exams.find(e => e.id === showResultsDialog)?.scores[s.id];
                        const percentage = score ? (score / (exams.find(e => e.id === showResultsDialog)?.maxScore || 100)) * 100 : 0;
                        return percentage >= 60 && percentage < 80;
                      }).length} students</div>
                      <div>Needs Improvement (0-59%): {students.filter(s => {
                        const score = exams.find(e => e.id === showResultsDialog)?.scores[s.id];
                        return score ? (score / (exams.find(e => e.id === showResultsDialog)?.maxScore || 100)) * 100 < 60 : false;
                      }).length} students</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Student Results</h4>
                  {students.map(student => {
                    const exam = exams.find(e => e.id === showResultsDialog);
                    const score = exam?.scores[student.id];
                    if (score === undefined) return null;

                    const percentage = (score / (exam?.maxScore || 100)) * 100;
                    const badge = getPerformanceBadge(percentage);

                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{student.name}</span>
                          <Badge variant={badge.variant} className="text-xs">{badge.text}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-semibold ${getGradeColor(score, exam?.maxScore || 100)}`}>
                            {score} / {exam?.maxScore} ({percentage.toFixed(1)}%)
                          </span>
                          <Progress value={percentage} className="w-20" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
