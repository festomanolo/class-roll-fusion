import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { GlassCard } from "./ui/glass-card";
import { 
  Download, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calendar,
  BookOpen,
  Target,
  UserX,
  FileText,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useToast } from "@/components/ui/tiktok-toast";
import { Class, Session, AttendanceStatus } from "@/types";
import { getSubjectById } from "@/data/tanzaniaSyllabus";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";

interface ReportsProps {
  sessions: Session[];
  classes: Class[];
}

export const Reports: React.FC<ReportsProps> = ({ sessions, classes }) => {
  const { addToast } = useToast();

  // Calculate comprehensive analytics with trend analysis
  const analytics = useMemo(() => {
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
    const totalSessions = sessions.length;
    
    // Calculate attendance statistics
    let totalAttendanceRecords = 0;
    let presentCount = 0;
    let absentSick = 0;
    let absentPermitted = 0;
    let absentOther = 0;
    
    const studentStats: Record<string, {
      name: string;
      className: string;
      present: number;
      absent: number;
      percentage: number;
      lastSeen?: Date;
      absentReasons: { sick: number; permitted: number; other: number };
    }> = {};

    const classStats: Record<string, {
      name: string;
      subject: string;
      sessions: number;
      avgAttendance: number;
      totalStudents: number;
      trend: number; // -1, 0, 1 for down, stable, up
    }> = {};

    // Track daily attendance for trend analysis
    const dailyAttendance: Record<string, { date: string; present: number; total: number; rate: number }> = {};

    sessions.forEach(session => {
      const sessionClass = classes.find(c => c.id === session.classId);
      if (!sessionClass || !session.attendance) return;

      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (!dailyAttendance[dateKey]) {
        dailyAttendance[dateKey] = { date: dateKey, present: 0, total: 0, rate: 0 };
      }

      // Initialize class stats
      if (!classStats[session.classId]) {
        classStats[session.classId] = {
          name: sessionClass.name,
          subject: getSubjectById(sessionClass.subject)?.name || sessionClass.subject,
          sessions: 0,
          avgAttendance: 0,
          totalStudents: sessionClass.students?.length || 0,
          trend: 0
        };
      }
      classStats[session.classId].sessions++;

      Object.entries(session.attendance).forEach(([studentId, status]) => {
        totalAttendanceRecords++;
        dailyAttendance[dateKey].total++;
        
        const student = sessionClass.students?.find(s => s.id === studentId);
        if (!student) return;

        // Initialize student stats
        if (!studentStats[studentId]) {
          studentStats[studentId] = {
            name: student.name,
            className: sessionClass.name,
            present: 0,
            absent: 0,
            percentage: 0,
            absentReasons: { sick: 0, permitted: 0, other: 0 }
          };
        }

        const isPresent = typeof status === 'boolean' ? status : status.present;
        
        if (isPresent) {
          presentCount++;
          dailyAttendance[dateKey].present++;
          studentStats[studentId].present++;
          studentStats[studentId].lastSeen = new Date(session.date);
        } else {
          studentStats[studentId].absent++;
          
          // Track absence reasons
          if (typeof status === 'object' && status.reason) {
            switch (status.reason) {
              case 'sick':
                absentSick++;
                studentStats[studentId].absentReasons.sick++;
                break;
              case 'permitted':
                absentPermitted++;
                studentStats[studentId].absentReasons.permitted++;
                break;
              case 'other':
                absentOther++;
                studentStats[studentId].absentReasons.other++;
                break;
            }
          }
        }

        // Calculate percentage
        const total = studentStats[studentId].present + studentStats[studentId].absent;
        studentStats[studentId].percentage = Math.round((studentStats[studentId].present / total) * 100);
      });
    });

    // Calculate daily rates
    Object.keys(dailyAttendance).forEach(key => {
      const day = dailyAttendance[key];
      day.rate = day.total > 0 ? Math.round((day.present / day.total) * 100) : 0;
    });

    // Calculate class averages and trends
    Object.keys(classStats).forEach(classId => {
      const classStudents = Object.values(studentStats).filter(s => {
        const cls = classes.find(c => c.name === s.className);
        return cls?.id === classId;
      });
      
      if (classStudents.length > 0) {
        const avg = Math.round(
          classStudents.reduce((sum, s) => sum + s.percentage, 0) / classStudents.length
        );
        classStats[classId].avgAttendance = avg;
        
        // Simple trend: compare first half vs second half of sessions
        const classSessions = sessions.filter(s => s.classId === classId).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        if (classSessions.length >= 4) {
          const mid = Math.floor(classSessions.length / 2);
          const firstHalf = classSessions.slice(0, mid);
          const secondHalf = classSessions.slice(mid);
          
          const firstHalfRate = firstHalf.reduce((sum, s) => {
            if (!s.attendance) return sum;
            const present = Object.values(s.attendance).filter(st => 
              typeof st === 'boolean' ? st : st.present
            ).length;
            return sum + (present / Object.keys(s.attendance).length) * 100;
          }, 0) / firstHalf.length;
          
          const secondHalfRate = secondHalf.reduce((sum, s) => {
            if (!s.attendance) return sum;
            const present = Object.values(s.attendance).filter(st => 
              typeof st === 'boolean' ? st : st.present
            ).length;
            return sum + (present / Object.keys(s.attendance).length) * 100;
          }, 0) / secondHalf.length;
          
          if (secondHalfRate > firstHalfRate + 5) classStats[classId].trend = 1;
          else if (secondHalfRate < firstHalfRate - 5) classStats[classId].trend = -1;
        }
      }
    });

    const overallAttendanceRate = totalAttendanceRecords > 0 
      ? Math.round((presentCount / totalAttendanceRecords) * 100)
      : 0;

    // Calculate trend (last 7 days vs previous 7 days)
    const sortedDays = Object.values(dailyAttendance).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
    let trend = 0;
    if (sortedDays.length >= 14) {
      const recent = sortedDays.slice(-7);
      const previous = sortedDays.slice(-14, -7);
      const recentAvg = recent.reduce((sum, d) => sum + d.rate, 0) / recent.length;
      const previousAvg = previous.reduce((sum, d) => sum + d.rate, 0) / previous.length;
      if (recentAvg > previousAvg + 3) trend = 1;
      else if (recentAvg < previousAvg - 3) trend = -1;
    }

    // Find most and least active classes
    const sortedClasses = Object.values(classStats).sort((a, b) => b.sessions - a.sessions);
    const mostActiveClass = sortedClasses[0];
    const leastActiveClass = sortedClasses[sortedClasses.length - 1];

    // Find students with poor attendance (< 75%)
    const poorAttendanceStudents = Object.values(studentStats)
      .filter(s => s.percentage < 75 && (s.present + s.absent) >= 3)
      .sort((a, b) => a.percentage - b.percentage);

    // Find students who haven't attended recently
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const absentStudents = Object.values(studentStats)
      .filter(s => !s.lastSeen || s.lastSeen < oneWeekAgo)
      .sort((a, b) => (a.lastSeen?.getTime() || 0) - (b.lastSeen?.getTime() || 0));

    // Prepare trend chart data
    const trendData = sortedDays.slice(-14).map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: d.rate,
      present: d.present,
      absent: d.total - d.present
    }));

    // Benchmark: 85% is considered good attendance
    const benchmark = 85;

    return {
      totalStudents,
      totalSessions,
      overallAttendanceRate,
      trend,
      benchmark,
      absentReasons: { sick: absentSick, permitted: absentPermitted, other: absentOther },
      studentStats: Object.values(studentStats),
      classStats: Object.values(classStats),
      mostActiveClass,
      leastActiveClass,
      poorAttendanceStudents,
      absentStudents,
      trendData
    };
  }, [sessions, classes]);

  const exportData = () => {
    if (sessions.length === 0) {
      addToast({
        type: "error",
        title: "No Data",
        description: "No attendance sessions found to export",
      });
      return;
    }

    // Generate comprehensive CSV content
    const csvContent = [
      "Date,Class,Subject,Topic,Subtopic,Student Name,Status,Reason,Note",
      ...sessions.flatMap(session => {
        const cls = classes.find(c => c.id === session.classId);
        if (!cls || !session.attendance) return [];
        
        return Object.entries(session.attendance).map(([studentId, status]) => {
          const student = cls.students?.find(s => s.id === studentId);
          const isPresent = typeof status === 'boolean' ? status : status.present;
          const reason = typeof status === 'object' ? status.reason || '' : '';
          const note = typeof status === 'object' ? status.note || '' : '';
          
          return [
            new Date(session.date).toISOString().split("T")[0],
            cls.name,
            getSubjectById(cls.subject)?.name || cls.subject,
            session.topic || "",
            session.subtopic || "",
            student?.name || "Unknown",
            isPresent ? "Present" : "Absent",
            reason,
            note.replace(/,/g, ';') // Replace commas in notes to avoid CSV issues
          ].join(",");
        });
      })
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    addToast({
      type: "success",
      title: "Report Exported",
      description: "Comprehensive attendance report downloaded as CSV",
    });
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-gray-900" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-gray-900" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendText = (trend: number) => {
    if (trend > 0) return "Improving";
    if (trend < 0) return "Declining";
    return "Stable";
  };

  return (
    <div className="pb-24 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reports & Analytics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Data-driven attendance insights</p>
          </div>
          <Button
            onClick={exportData}
            variant="outline"
            size="sm"
            className="border-gray-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="px-4">
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Data Available</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start taking attendance to see detailed reports and analytics.
              </p>
            </div>
        </div>
      )}

      {sessions.length > 0 && (
        <>
          {/* Key Metrics with Anchoring */}
          <div className="px-4">
            <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overall Attendance</div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.overallAttendanceRate}%</div>
                  {getTrendIcon(analytics.trend)}
                </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {getTrendText(analytics.trend)} vs previous period
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${analytics.overallAttendanceRate >= analytics.benchmark ? 'bg-gray-900 dark:bg-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    style={{ width: `${analytics.overallAttendanceRate}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">vs {analytics.benchmark}% target</div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Sessions</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{analytics.totalSessions}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Across {analytics.classStats.length} classes
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Students</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{analytics.totalStudents}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Avg {analytics.totalStudents > 0 ? Math.round(analytics.totalStudents / analytics.classStats.length) : 0} per class
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active Classes</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{classes.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {analytics.mostActiveClass ? `${analytics.mostActiveClass.sessions} sessions (most active)` : ''}
              </div>
            </div>
            </div>
          </div>

          {/* Attendance Trend Chart */}
          {analytics.trendData.length > 0 && (
            <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Trend</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Last 14 sessions</p>
              </div>
            </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: "#e5e7eb" }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fontSize: 11 }}
                      tickLine={{ stroke: "#e5e7eb" }}
                      domain={[0, 100]}
                    />
                    <ReferenceLine 
                      y={analytics.benchmark} 
                      stroke="#9ca3af" 
                      strokeDasharray="2 2"
                      label={{ value: `${analytics.benchmark}% target`, position: "right", fill: "#6b7280", fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#000000" 
                      strokeWidth={2}
                      dot={{ fill: '#000000', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Class Performance with Insights */}
      {analytics.classStats.length > 0 && (
        <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Class Performance</h2>
                <div className="space-y-3">
                  {analytics.classStats
                    .sort((a, b) => b.avgAttendance - a.avgAttendance)
                    .map((cls) => {
                      const isAboveBenchmark = cls.avgAttendance >= analytics.benchmark;
                      return (
                        <div
                    key={cls.name}
                          className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{cls.name}</h3>
                              {getTrendIcon(cls.trend)}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                        {cls.subject} • {cls.totalStudents} students • {cls.sessions} sessions
                      </p>
                    </div>
                    <div className="text-right">
                            <div className={`text-2xl font-bold ${isAboveBenchmark ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                              {cls.avgAttendance}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {isAboveBenchmark ? 'Above target' : `${analytics.benchmark - cls.avgAttendance}% below target`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
              </div>
        </div>
      )}

          {/* Absence Breakdown - Minimal Design */}
      {(analytics.absentReasons.sick + analytics.absentReasons.permitted + analytics.absentReasons.other) > 0 && (
        <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Absence Breakdown</h2>
              <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{analytics.absentReasons.sick}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Sick</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round((analytics.absentReasons.sick / (analytics.absentReasons.sick + analytics.absentReasons.permitted + analytics.absentReasons.other)) * 100)}% of absences
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{analytics.absentReasons.permitted}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Permitted</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round((analytics.absentReasons.permitted / (analytics.absentReasons.sick + analytics.absentReasons.permitted + analytics.absentReasons.other)) * 100)}% of absences
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{analytics.absentReasons.other}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Other</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round((analytics.absentReasons.other / (analytics.absentReasons.sick + analytics.absentReasons.permitted + analytics.absentReasons.other)) * 100)}% of absences
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Needing Attention */}
      {analytics.poorAttendanceStudents.length > 0 && (
        <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Students Needing Attention</h2>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {analytics.poorAttendanceStudents.length} below 75%
              </div>
            </div>
            <div className="space-y-2">
              {analytics.poorAttendanceStudents.slice(0, 10).map((student) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{student.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{student.className}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{student.percentage}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {student.present}P / {student.absent}A
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recently Absent Students */}
      {analytics.absentStudents.length > 0 && (
        <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Students Not Attending Recently</h2>
            <div className="space-y-2">
              {analytics.absentStudents.slice(0, 10).map((student) => (
                <div
                  key={student.name}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{student.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{student.className}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {student.lastSeen 
                        ? `Last seen: ${student.lastSeen.toLocaleDateString()}`
                        : 'Never attended'
                      }
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{student.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          )}
        </>
      )}
    </div>
  );
};
