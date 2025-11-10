import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar, 
  Award, 
  AlertTriangle,
  Eye,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Hash,
  FileText
} from "lucide-react";
import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Class, Session, Student, AttendanceStatus } from "@/types";

interface ClassAnalyticsProps {
  selectedClass: Class;
  sessions: Session[];
  onBack: () => void;
}

interface StudentStats {
  student: Student;
  present: number;
  absent: number;
  percentage: number;
  lastSeen?: Date;
  trend: 'improving' | 'declining' | 'stable';
}

export const ClassAnalytics: React.FC<ClassAnalyticsProps> = ({
  selectedClass,
  sessions,
  onBack
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate analytics
  const analytics = useMemo(() => {
    const classSessions = sessions.filter(s => s.classId === selectedClass.id);
    const students = selectedClass.students || [];
    
    // Student statistics
    const studentStats: StudentStats[] = students.map(student => {
      let present = 0;
      let absent = 0;
      let lastSeen: Date | undefined;
      const recentSessions: boolean[] = [];

      classSessions.forEach(session => {
        if (session.attendance && session.attendance[student.id]) {
          const attendance = session.attendance[student.id];
          const isPresent = typeof attendance === 'boolean' ? attendance : attendance.present;
          
          if (isPresent) {
            present++;
            lastSeen = new Date(session.date);
          } else {
            absent++;
          }
          
          // Track recent 5 sessions for trend
          if (recentSessions.length < 5) {
            recentSessions.push(isPresent);
          }
        }
      });

      const total = present + absent;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      // Calculate trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentSessions.length >= 3) {
        const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
        const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));
        const firstAvg = firstHalf.filter(Boolean).length / firstHalf.length;
        const secondAvg = secondHalf.filter(Boolean).length / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.2) trend = 'improving';
        else if (secondAvg < first