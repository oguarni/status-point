export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority?: 'low' | 'medium' | 'high' | null;
  dueDate?: string | null;
  projectId?: number | null;
  assigneeId?: number | null;
  createdAt?: string;
  created_at?: string;
}
