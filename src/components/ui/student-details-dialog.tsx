import React from 'react';
import { Student } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { File, Clock, Mail, Phone, School } from 'lucide-react';

interface StudentDetailsDialogProps {
  student: Student | null;
  open: boolean;
  onClose: () => void;
  onDelete: (student: Student) => void;
}

export function StudentDetailsDialog({ student, open, onClose, onDelete }: StudentDetailsDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{student.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-1">
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Roll Number:</span>
                <span className="text-sm text-muted-foreground">{student.rollNumber || 'Not assigned'}</span>
              </div>
              {student.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-muted-foreground">{student.email}</span>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone:</span>
                  <span className="text-sm text-muted-foreground">{student.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(student.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Attendance Section */}
            <div className="space-y-2 pt-4">
              <h4 className="text-sm font-semibold">Attendance Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border p-2">
                  <div className="font-medium">Present</div>
                  <div className="text-2xl font-bold text-emerald-600">85%</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="font-medium">Absent</div>
                  <div className="text-2xl font-bold text-rose-600">15%</div>
                </div>
              </div>
            </div>

            {/* Performance Section */}
            <div className="space-y-2 pt-4">
              <h4 className="text-sm font-semibold">Academic Performance</h4>
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Average Grade</span>
                  <span className="text-sm font-semibold text-emerald-600">B+</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-full bg-emerald-500"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => student && onDelete(student)}
          >
            Delete Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}