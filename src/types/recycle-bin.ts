export interface DeletedItem {
  id: string;
  type: 'student' | 'test' | 'subject' | 'class';
  name: string;
  data: any;
  deletedAt: number;
}