import React from 'react';
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Hash } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Student } from "@/types";

interface StudentDetailsModalProps {
  student: Student | null;
  analytics: any; // We'll type this properly if needed
  onClose: () => void;
}

export function StudentDetailsModal({ student, analytics, onClose }: StudentDetailsModalProps) {
  if (!student) return null;

  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white font-poppins">
              Student Details
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* Student Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white font-poppins">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins">Name</p>
                  <p className="font-semibold font-poppins text-gray-900 dark:text-white">{student.name}</p>
                </div>
                {student.rollNumber && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      Roll Number
                    </p>
                    <p className="font-semibold font-poppins text-gray-900 dark:text-white">
                      {student.rollNumber}
                    </p>
                  </div>
                )}
                {student.registrationNumber && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins">
                      Registration Number
                    </p>
                    <p className="font-semibold font-poppins text-gray-900 dark:text-white">
                      {student.registrationNumber}
                    </p>
                  </div>
                )}
                {student.examIndexNumber && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins">
                      Exam Index
                    </p>
                    <p className="font-semibold font-poppins text-gray-900 dark:text-white">
                      {student.examIndexNumber}
                    </p>
                  </div>
                )}
                {student.email && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    <p className="font-semibold font-poppins text-gray-900 dark:text-white">
                      {student.email}
                    </p>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </p>
                    <p className="font-semibold font-poppins text-gray-900 dark:text-white">
                      {student.phone}
                    </p>
                  </div>
                )}
                {student.parent_phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins">
                      Parent Phone
                    </p>
                    <p className="font-semibold font-poppins text-gray-900 dark:text-white">
                      {student.parent_phone}
                    </p>
                  </div>
                )}
                {student.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Address
                    </p>
                    <p className="font-semibold font-poppins text-gray-900 dark:text-white">
                      {student.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Stats */}
            {(() => {
              const studentStat = analytics.studentStats.find(
                (s: any) => s.student.id === student.id
              );
              if (!studentStat) return null;

              return (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white font-poppins">
                    Attendance Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {studentStat.present}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-poppins">
                        Present
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {studentStat.absent}
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400 font-poppins">
                        Absent
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {studentStat.percentage}%
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-poppins">
                        Attendance Rate
                      </div>
                    </div>
                  </div>

                  {studentStat.sessions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white font-poppins">
                        Recent Sessions
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {studentStat.sessions
                          .slice(-10)
                          .reverse()
                          .map((session: any, idx: number) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-2 rounded ${
                                session.present
                                  ? "bg-green-50 dark:bg-green-900/20"
                                  : "bg-red-50 dark:bg-red-900/20"
                              }`}
                            >
                              <span className="text-sm font-poppins text-gray-900 dark:text-white">
                                {session.date.toLocaleDateString()}
                              </span>
                              <Badge variant={session.present ? "default" : "destructive"}>
                                {session.present ? "Present" : "Absent"}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}