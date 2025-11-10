/**
 * Custom Topic Form Component
 * Allows teachers to add custom topics to subjects
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSubjectById, addCustomTopic, Subtopic } from '@/data/tanzaniaSyllabus';
import { Plus, X } from 'lucide-react';

interface CustomTopicFormProps {
  teacherSubjects: string[];
  onTopicAdded: () => void;
}

export const CustomTopicForm: React.FC<CustomTopicFormProps> = ({
  teacherSubjects,
  onTopicAdded
}) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topicName, setTopicName] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [subtopics, setSubtopics] = useState<Omit<Subtopic, 'id'>[]>([]);
  const [newSubtopic, setNewSubtopic] = useState({ name: '', description: '' });

  const handleAddSubtopic = () => {
    if (newSubtopic.name.trim()) {
      setSubtopics([...subtopics, { ...newSubtopic }]);
      setNewSubtopic({ name: '', description: '' });
    }
  };

  const handleRemoveSubtopic = (index: number) => {
    setSubtopics(subtopics.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !topicName.trim()) {
      return;
    }

    const subtopicsWithIds: Subtopic[] = subtopics.map((subtopic, index) => ({
      ...subtopic,
      id: `subtopic-${Date.now()}-${index}`
    }));

    addCustomTopic(selectedSubject, {
      name: topicName,
      description: topicDescription || undefined,
      subtopics: subtopicsWithIds.length > 0 ? subtopicsWithIds : undefined
    });

    // Reset form
    setSelectedSubject('');
    setTopicName('');
    setTopicDescription('');
    setSubtopics([]);
    setNewSubtopic({ name: '', description: '' });

    onTopicAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="subject">Subject *</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {teacherSubjects.map(subjectId => {
              const subject = getSubjectById(subjectId);
              return subject ? (
                <SelectItem key={subjectId} value={subjectId}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {subject.code}
                    </span>
                    {subject.name}
                  </div>
                </SelectItem>
              ) : null;
            })}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="topicName">Topic Name *</Label>
        <Input
          id="topicName"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="Enter topic name"
          required
        />
      </div>

      <div>
        <Label htmlFor="topicDescription">Topic Description (Optional)</Label>
        <Textarea
          id="topicDescription"
          value={topicDescription}
          onChange={(e) => setTopicDescription(e.target.value)}
          placeholder="Describe what this topic covers..."
          rows={2}
        />
      </div>

      {/* Subtopics Section */}
      <div>
        <Label className="text-base font-medium">Subtopics (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Break down your topic into smaller subtopics for better organization
        </p>

        {/* Existing Subtopics */}
        {subtopics.length > 0 && (
          <div className="space-y-2 mb-3">
            {subtopics.map((subtopic, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{subtopic.name}</div>
                  {subtopic.description && (
                    <div className="text-xs text-muted-foreground">{subtopic.description}</div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSubtopic(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Subtopic */}
        <div className="space-y-2 p-3 border rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Subtopic name"
              value={newSubtopic.name}
              onChange={(e) => setNewSubtopic({ ...newSubtopic, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newSubtopic.description}
              onChange={(e) => setNewSubtopic({ ...newSubtopic, description: e.target.value })}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSubtopic}
            disabled={!newSubtopic.name.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Subtopic
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={!selectedSubject || !topicName.trim()}>
          Add Custom Topic
        </Button>
      </div>
    </form>
  );
};