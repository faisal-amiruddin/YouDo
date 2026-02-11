
export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  error: string;
  message: string;
  success: boolean;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  is_completed: boolean;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskList {
  tasks: Task[];
  total: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: Priority;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  is_completed?: boolean;
  priority?: Priority;
  due_date?: string;
}
