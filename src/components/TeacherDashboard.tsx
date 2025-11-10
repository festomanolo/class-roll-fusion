/**
 * Teacher Dashboard Component
 * DAL-style: Data-to-ink ratio optimized, insights-focused, anchored metrics
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TeacherProfile } from '@/components/TeacherSetup';
import { getSubjectById } from '@/data/tanzaniaSyllabus';
import { Class, Session } from '@/types';
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  BarChart3,
  GraduationCap,
  ChevronRight,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

interface TeacherDashboardProps {
  classes: Class[];
  sessions: Session[];
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  classes,
  sessions,
  onNavigate
}) => {
  const [teacherProfile] = useLocalStorage<TeacherProfile | null>('teacherProfile', null);

  // Calculate dashboard statistics with trend analysis
  const stats = useMemo(() => {
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
    const totalSessions = sessions.length;
    
    // Calculate attendance rate
    let totalAttendanceRecords = 0;
    let presentCount = 0;
    
    // Track daily attendance for trend
    const dailyAttendance: Record<string, { date: string; present: number; total: number; rate: number }> = {};
    
    sessions.forEach(session => {
      if (session.attendance) {
        const dateKey = new Date(session.date).toISOString().split('T')[0];
        if (!dailyAttendance[dateKey]) {
          dailyAttendance[dateKey] = { date: dateKey, present: 0, total: 0, rate: 0 };
        }
        
        Object.values(session.attendance).forEach(status => {
          totalAttendanceRecords++;
          dailyAttendance[dateKey].total++;
          const isPresent = typeof status === 'boolean' ? status : status.present;
          if (isPresent) {
            presentCount++;
            dailyAttendance[dateKey].present++;
          }
        });
      }
    });
    
    // Calculate daily rates
    Object.keys(dailyAttendance).forEach(key => {
      const day = dailyAttendance[key];
      day.rate = day.total > 0 ? Math.round((day.present / day.total) * 100) : 0;
    });
    
    const attendanceRate = totalAttendanceRecords > 0 
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

    // Get most active class
    const classActivity = classes.map(cls => ({
      ...cls,
      sessionCount: sessions.filter(s => s.classId === cls.id).length
    }));
    const mostActiveClass = classActivity.length > 0 ? classActivity.reduce((prev, current) => 
      (prev.sessionCount > current.sessionCount) ? prev : current, 
      classActivity[0]
    ) : null;

    // Recent activity
    const recentSessions = sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

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
      totalClasses: classes.length,
      totalStudents,
      totalSessions,
      attendanceRate,
      trend,
      benchmark,
      mostActiveClass,
      recentSessions,
      trendData
    };
  }, [classes, sessions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = getSubjectById(subjectId);
    return subject?.name || subjectId;
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
      {/* Welcome Header - Minimal */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {getGreeting()}, {teacherProfile?.name || 'Teacher'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {teacherProfile?.school || 'Welcome to Class-Roll'}
            </p>
          </div>
          {teacherProfile?.subjects && teacherProfile.subjects.length > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Teaching</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {teacherProfile.subjects.length} {teacherProfile.subjects.length === 1 ? 'subject' : 'subjects'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics with Anchoring */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Attendance Rate</div>
            <div className="flex items-baseline gap-2 mb-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.attendanceRate}%</div>
              {getTrendIcon(stats.trend)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {getTrendText(stats.trend)} vs previous period
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stats.attendanceRate >= stats.benchmark ? 'bg-gray-900 dark:bg-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                  style={{ width: `${stats.attendanceRate}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">vs {stats.benchmark}% target</div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Sessions</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalSessions}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Across {stats.totalClasses} {stats.totalClasses === 1 ? 'class' : 'classes'}
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Students</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalStudents}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Avg {stats.totalClasses > 0 ? Math.round(stats.totalStudents / stats.totalClasses) : 0} per class
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active Classes</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalClasses}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stats.mostActiveClass ? `${stats.mostActiveClass.sessionCount} sessions (most active)` : 'No classes yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Trend Chart */}
      {stats.trendData.length > 0 && (
        <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Trend</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Last 14 sessions</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.trendData}>
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
                  y={stats.benchmark} 
                  stroke="#9ca3af" 
                  strokeDasharray="2 2"
                  label={{ value: `${stats.benchmark}% target`, position: "right", fill: "#6b7280", fontSize: 10 }}
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

      {/* Quick Actions - Minimal */}
      <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => onNavigate("classes")}
              className="h-14 p-4 text-left border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300 rounded-lg transition-all duration-200 group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-900 dark:text-white" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">Take Attendance</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Start a new session</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
            
            <button
              onClick={() => onNavigate("reports")}
              className="h-14 p-4 text-left border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300 rounded-lg transition-all duration-200 group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-gray-900 dark:text-white" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">View Reports</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Attendance analytics</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Class Overview - Minimal */}
      {classes.length > 0 && (
        <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Classes</h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("classes")} className="text-xs">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {classes.slice(0, 3).map((cls) => {
                const sessionCount = sessions.filter(s => s.classId === cls.id).length;
                const studentCount = cls.students?.length || 0;
                
                return (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => onNavigate("classes")}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{cls.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {getSubjectName(cls.subject)} • {studentCount} students
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{sessionCount}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">sessions</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity - Minimal */}
      {stats.recentSessions.length > 0 && (
        <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Sessions</h2>
            
            <div className="space-y-2">
              {stats.recentSessions.map((session) => {
                const sessionClass = classes.find(c => c.id === session.classId);
                const attendanceCount = session.attendance 
                  ? Object.values(session.attendance).filter(status => 
                      typeof status === 'boolean' ? status : status.present
                    ).length
                  : 0;
                const totalStudents = sessionClass?.students?.length || 0;
                const rate = totalStudents > 0 ? Math.round((attendanceCount / totalStudents) * 100) : 0;
                
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{session.topic}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {sessionClass?.name} • {new Date(session.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{rate}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {attendanceCount}/{totalStudents} present
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {classes.length === 0 && (
        <div className="px-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Welcome to Class-Roll!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Start by creating your first class to begin taking attendance.
            </p>
            <Button 
              onClick={() => onNavigate("classes")} 
              className="border border-gray-900 dark:border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Create Your First Class
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
