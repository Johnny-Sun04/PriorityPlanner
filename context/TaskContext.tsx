import React, { createContext, ReactNode, useContext, useState } from 'react';

// 1. We export the interface so index.tsx and calendar.tsx can both use it
export interface Task {
  id: string;
  text: string;
  priority: number;
  completed: boolean;
  taskType: 'single' | 'spanning' | 'daily' | 'weekly';
  startDate?: string;
  endDate?: string;
  dayOfWeek?: number;
  lastCompletedDate?: string;
}

// 2. Define what our Global State looks like
interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

// 3. Create the actual Context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// 4. Create the Provider (this wraps your app and holds the data)
export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  return (
    <TaskContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

// 5. Create a custom hook so your other files can easily grab the tasks
export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}