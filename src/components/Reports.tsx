import { motion } from "framer-motion";
import { BarChart, Calendar, Users, TrendingUp, Download } from "lucide-react";
import { Button } from "./ui/button";
import { GlassCard } from "./ui/glass-card";
import { Class, Session } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ReportsProps {
  classes: Class[];
  sessions: Session[];
}

export function Reports({ classes, sessions }: ReportsProps) {
  const { toast } = useToast();

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
  const totalSessions = sessions.length;
  const averageAttendance = sessions.length > 0 
    ? sessions.reduce((sum, session) => {
        const presentCount = Object.values(session.attendance).filter(Boolean).length;
        const totalCount = Object.keys(session.attendance).length;
        return sum + (totalCount > 0 ? (presentCount / totalCount) * 100 : 0);
      }, 0) / sessions.length
    : 0;

  const exportSpreadsheet = () => {
    if (sessions.length === 0) {
      toast({
        title: "No Data",
        description: "No attendance sessions found to export",
        variant: "destructive",
      });
      return;
    }

    // Generate CSV content
    const csvContent = [
      'Date,Class,Topic,Subtopic,Student Name,Present/Absent',
      ...sessions.flatMap(session => {
        const cls = classes.find(c => c.id === session.classId);
        if (!cls) return [];
        
        return Object.entries(session.attendance).map(([studentId, present]) => {
          const student = cls.students.find(s => s.id === studentId);
          return [
            session.date.toISOString().split('T')[0],
            cls.name,
            session.topic,
            session.subtopic || '',
            student?.name || 'Unknown',
            present ? 'Present' : 'Absent'
          ].join(',');
        });
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Attendance report has been downloaded as CSV",
    });
  };

  const getRecentSessions = () => {
    return sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">
          Track attendance patterns and export data
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="text-2xl font-bold">{totalStudents}</h3>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="text-2xl font-bold">{totalSessions}</h3>
            <p className="text-sm text-muted-foreground">Sessions Conducted</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-success" />
            <h3 className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</h3>
            <p className="text-sm text-muted-foreground">Avg Attendance</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6 text-center">
            <BarChart className="w-8 h-8 mx-auto mb-3 text-warning" />
            <h3 className="text-2xl font-bold">{classes.length}</h3>
            <p className="text-sm text-muted-foreground">Active Classes</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data
            </h2>
            <Button
              onClick={exportSpreadsheet}
              disabled={sessions.length === 0}
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Spreadsheet Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Export attendance data in CSV format compatible with Google Sheets and Excel. 
                The exported file includes date, class, topic, subtopic, student name, and attendance status.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Compatible with Google Sheets</p>
                <p>• Excel-ready format</p>
                <p>• Includes all session data</p>
                <p>• Perfect for record keeping</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Data Format</h3>
              <div className="bg-muted/20 p-3 text-xs font-mono" style={{ borderRadius: 'var(--radius-md)' }}>
                Date | Class | Topic | Subtopic | Student Name | Present/Absent
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Each row represents one student's attendance for one session, 
                making it easy to analyze patterns and generate reports.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Sessions
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No sessions recorded yet</p>
              <p className="text-sm">Start taking attendance to see reports</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getRecentSessions().map((session, index) => {
                const cls = classes.find(c => c.id === session.classId);
                const presentCount = Object.values(session.attendance).filter(Boolean).length;
                const totalCount = Object.keys(session.attendance).length;
                const attendancePercentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/20"
                    style={{ borderRadius: 'var(--radius-lg)' }}
                  >
                    <div>
                      <h4 className="font-medium">{session.topic}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{cls?.name || 'Unknown Class'}</span>
                        <span>{session.date.toLocaleDateString()}</span>
                        {session.subtopic && <span>• {session.subtopic}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {attendancePercentage.toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {presentCount}/{totalCount} present
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}