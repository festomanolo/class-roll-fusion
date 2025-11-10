import { FC, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CheckCircle, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  classId: string;
  submissions: Record<string, {
    submitted: boolean;
    grade?: number;
    submittedAt?: Date;
  }>;
}

interface AssignmentsProps {
  classId: string;
  students: Array<{ id: string; name: string }>;
  assignments: Assignment[];
  onAssignmentCreate: (assignment: Omit<Assignment, 'id'>) => void;
  onAssignmentUpdate: (assignmentId: string, updates: Partial<Assignment>) => void;
  onAssignmentDelete: (assignmentId: string) => void;
}

export const Assignments: FC<AssignmentsProps> = ({
  classId,
  students,
  assignments,
  onAssignmentCreate,
  onAssignmentUpdate,
  onAssignmentDelete
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
  });

  const handleCreateAssignment = () => {
    if (!newAssignment.title.trim()) return;

    const submissions: Record<string, { submitted: boolean }> = {};
    students.forEach(student => {
      submissions[student.id] = { submitted: false };
    });

    onAssignmentCreate({
      title: newAssignment.title,
      description: newAssignment.description,
      dueDate: newAssignment.dueDate,
      classId,
      submissions,
    });

    setNewAssignment({ title: '', description: '', dueDate: new Date() });
    setShowAddDialog(false);
  };

  const handleSubmissionToggle = (assignmentId: string, studentId: string, submitted: boolean) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const updatedSubmissions = {
      ...assignment.submissions,
      [studentId]: {
        ...assignment.submissions[studentId],
        submitted,
        submittedAt: submitted ? new Date() : undefined,
      },
    };

    onAssignmentUpdate(assignmentId, { submissions: updatedSubmissions });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Assignments</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl mx-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Assignment title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Assignment description"
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Calendar
                  mode="single"
                  selected={newAssignment.dueDate}
                  onSelect={(date) => date && setNewAssignment({ ...newAssignment, dueDate: date })}
                  className="rounded-md border"
                />
              </div>
              <Button onClick={handleCreateAssignment}>Create Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {assignments.map(assignment => (
          <Card key={assignment.id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Due: {format(new Date(assignment.dueDate), 'PPP')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {students.map(student => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <span>{student.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSubmissionToggle(
                      assignment.id,
                      student.id,
                      !assignment.submissions[student.id]?.submitted
                    )}
                  >
                    {assignment.submissions[student.id]?.submitted ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {assignments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No assignments yet</p>
            <p className="text-sm">Create an assignment to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
