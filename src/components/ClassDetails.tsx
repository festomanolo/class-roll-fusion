import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Users, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Minus,
  PieChart,
  BarChart3,
  Eye
} from "lucide-react";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Class, Session, Student, AttendanceStatus } from "@/types";
import { getSubjectById } from "@/data/tanzaniaSyllabus";
import { StudentDetailsDialog } from "./ui/student-details-dialog";

interface ClassDetailsProps {
  selectedClass: Class;
  sessions: Session[];
  onBack: () => void;
  onStartSession?: () => void;
}

interface StudentStats {
  student: Student;
  present: number;
  absent: number;
  percentage: number;
  lastSeen?: Date;
  trend: 'improving' | 'declining' | 'stable';
  sessions: Array<{ date: Date; present: boolean }>;
}

export const ClassDetails: React.FC<ClassDetailsProps> = ({
  selectedClass,
  sessions,
  onBack,
  onStartSession
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const analytics = useMemo(() => {
    const classSessions = sessions.filter(s => s.classId === selectedClass.id);
    const students = selectedClass.students || [];
    
    const studentStats: StudentStats[] = students.map(student => {
      let present = 0;
      let absent = 0;
      let lastSeen: Date | undefined;
      const recentSessions: boolean[] = [];
      const sessionHistory: Array<{ date: Date; present: boolean }> = [];

      classSessions.forEach(session => {
        if (session.attendance && session.attendance[student.id]) {
          const attendance = session.attendance[student.id];
          const isPresent = typeof attendance === 'boolean' ? attendance : attendance.present;
          
          sessionHistory.push({
            date: new Date(session.date),
            present: isPresent
          });
          
          if (isPresent) {
            present++;
            lastSeen = new Date(session.date);
          } else {
            absent++;
          }
          
          if (recentSessions.length < 5) {
            recentSessions.push(isPresent);
          }
        }
      });

      const total = present + absent;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentSessions.length >= 3) {
        const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
        const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));
        const firstAvg = firstHalf.filter(Boolean).length / firstHalf.length;
        const secondAvg = secondHalf.filter(Boolean).length / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.2) trend = 'improving';
        else if (secondAvg < firstAvg - 0.2) trend = 'declining';
      }

      return {
        student,
        present,
        absent,
        percentage,
        lastSeen,
        trend,
        sessions: sessionHistory
      };
    });

    const totalSessions = classSessions.length;
    const totalStudents = students.length;
    let overallPresent = 0;
    let overallAbsent = 0;

    classSessions.forEach(session => {
      if (session.attendance) {
        Object.values(session.attendance).forEach(status => {
          const isPresent = typeof status === 'boolean' ? status : status.present;
          if (isPresent) overallPresent++;
          else overallAbsent++;
        });
      }
    });

    const overallAttendanceRate = (overallPresent + overallAbsent) > 0 
      ? Math.round((overallPresent / (overallPresent + overallAbsent)) * 100)
      : 0;

    const attendanceByDate = classSessions.map(session => {
      let present = 0;
      let absent = 0;
      
      if (session.attendance) {
        Object.values(session.attendance).forEach(status => {
          const isPresent = typeof status === 'boolean' ? status : status.present;
          if (isPresent) present++;
          else absent++;
        });
      }

      return {
        date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present,
        absent,
        rate: totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0
      };
    });

    return {
      studentStats: studentStats.sort((a, b) => b.percentage - a.percentage),
      totalSessions,
      totalStudents,
      overallAttendanceRate,
      overallPresent,
      overallAbsent,
      attendanceByDate
    };
  }, [selectedClass, sessions]);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  const pieChartData = [
    { name: 'Present', value: analytics.overallPresent, color: '#10b981' },
    { name: 'Absent', value: analytics.overallAbsent, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <GlassCard className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Classes
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-poppins">{selectedClass.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 font-poppins">
              {getSubjectById(selectedClass.subject)?.name || selectedClass.subject}
              {selectedClass.education_level && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {selectedClass.education_level}
                </span>
              )}
            </p>
          </div>

          {onStartSession && (
            <Button onClick={onStartSession} className="font-poppins" size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 font-poppins">Attendance Rate</h3>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {analytics.overallAttendanceRate}%
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 font-poppins">Total Students</h3>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {analytics.totalStudents}
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200 font-poppins">Total Sessions</h3>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {analytics.totalSessions}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="overview" className="font-poppins">
            <PieChart className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="attendance" className="font-poppins">
            <BarChart3 className="w-4 h-4 mr-2" />
            Attendance History
          </TabsTrigger>
          <TabsTrigger value="students" className="font-poppins">
            <Users className="w-4 h-4 mr-2" />
            Student List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-poppins">
              Class Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance Distribution */}
              <div>
                <h3 className="text-sm font-medium mb-4 text-gray-900 dark:text-white font-poppins">
                  Attendance Distribution
                </h3>
                <div className="w-full h-64">
                  <ResponsiveContainer>
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ value }) => `${value}`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Students */}
              <div>
                <h3 className="text-sm font-medium mb-4 text-gray-900 dark:text-white font-poppins">
                  Top Students
                </h3>
                <div className="space-y-3">
                  {analytics.studentStats.slice(0, 5).map((stat) => (
                    <div
                      key={stat.student.id}
                      className="flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/30 transition-colors rounded-lg cursor-pointer"
                      onClick={() => setSelectedStudent(stat.student)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium font-poppins">{stat.student.name}</div>
                        {stat.trend === 'improving' && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                        {stat.trend === 'declining' && (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        {stat.trend === 'stable' && <Minus className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.percentage}%</div>
                        <Progress value={stat.percentage} className="w-20 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="attendance">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-poppins">
              Attendance History
            </h2>
            <div className="w-full h-96">
              <ResponsiveContainer>
                <BarChart data={analytics.attendanceByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Legend />
                  <Bar dataKey="present" name="Present" fill="#10b981" />
                  <Bar dataKey="absent" name="Absent" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="students">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-poppins">
              Student List
            </h2>
            <div className="space-y-2">
              {analytics.studentStats.map((stat) => (
                <motion.div
                  key={stat.student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer rounded-lg"
                  onClick={() => setSelectedStudent(stat.student)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium font-poppins">{stat.student.name}</div>
                      {stat.student.rollNumber && (
                        <div className="text-sm text-muted-foreground font-poppins">
                          Roll: {stat.student.rollNumber}
                        </div>
                      )}
                    </div>
                    {stat.trend === 'improving' && (
                      <Badge variant="default" className="bg-green-500">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Improving
                      </Badge>
                    )}
                    {stat.trend === 'declining' && (
                      <Badge variant="destructive">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Declining
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stat.percentage}%
                      </div>
                      <div className="text-sm text-muted-foreground font-poppins">
                        {stat.present} / {stat.present + stat.absent} sessions
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(stat.student);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {analytics.studentStats.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-poppins">No students in this class yet</p>
                </div>
              )}
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Student Details Modal */}
      <StudentDetailsDialog 
        student={selectedStudent}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onDelete={() => {}}
      />
    </div>
  );
};