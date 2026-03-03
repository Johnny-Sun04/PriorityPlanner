import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Task {
  id: string;
  text: string;
  priority: number;
  completed: boolean;
  taskType: 'single' | 'spanning' | 'daily' | 'weekly';
  startDate?: string;
  endDate?: string;
  daysOfWeek?: number[]; // Array of numbers: 0 = Sunday, 1 = Monday, etc.
  lastCompletedDate?: string; 
}

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  return (
    <TaskContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}