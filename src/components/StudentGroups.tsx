import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Group {
  id: string;
  name: string;
  description?: string;
}

interface Student {
  id: string;
  name: string;
  group?: string;
}

interface StudentGroupsProps {
  students: Student[];
  onUpdateStudent: (studentId: string, updates: Partial<Student>) => void;
}

export const StudentGroups: FC<StudentGroupsProps> = ({ students, onUpdateStudent }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleCreateGroup = () => {
    if (newGroup.name.trim()) {
      const group: Group = {
        id: Math.random().toString(36).substr(2, 9),
        name: newGroup.name.trim(),
        description: newGroup.description,
      };
      setGroups([...groups, group]);
      setNewGroup({ name: '', description: '' });
    }
  };

  const handleEditGroup = (group: Group) => {
    setGroups(groups.map(g => g.id === group.id ? group : g));
    setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    const confirmed = window.confirm(`Delete group '${group?.name || ''}'? This will remove the group assignment from any students.`);
    if (!confirmed) return;

    setGroups(groups.filter(g => g.id !== groupId));
    // Remove group from students
    students
      .filter(s => s.group === groupId)
      .forEach(s => onUpdateStudent(s.id, { group: undefined }));
  };

  const handleAssignStudent = (studentId: string, groupId: string | undefined) => {
    onUpdateStudent(studentId, { group: groupId });
  };

  return (
    <div className="space-y-6">
      {/* Create Group Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </DialogTrigger>
  <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            />
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Groups List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map(group => (
          <Card key={group.id} className="p-4">
            <div className="flex items-start mb-4">
              <div className="mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
              </div>

              <div className="ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingGroup(group)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Students in group */}
            <div className="space-y-2">
              {students
                .filter(s => s.group === group.id)
                .map(student => (
                  <div
                    key={student.id}
                    className="flex items-center p-2 bg-muted rounded-md"
                  >
                    <div className="mr-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignStudent(student.id, undefined)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <span>{student.name}</span>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Group Dialog */}
      {editingGroup && (
        <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Group Name"
                value={editingGroup.name}
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
              />
              <Input
                placeholder="Description (optional)"
                value={editingGroup.description}
                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
              />
              <Button onClick={() => handleEditGroup(editingGroup)}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
