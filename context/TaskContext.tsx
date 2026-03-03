import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Task {
  id: string;
  text: string;
  priority: number;
  completed: boolean;
  taskType: 'single' | 'spanning' | 'daily' | 'weekly';
  startDate?: string;
  endDate?: string;
  daysOfWeek?: number[]; 
  completedDates?: string[]; 
  tag?: string; // <--- Changed from a strict list to any string
}

interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// A unique key so AsyncStorage knows exactly where to look on the phone's hard drive
const TASKS_STORAGE_KEY = '@priority_planner_tasks';

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  // We need to track if the initial load is done so we don't accidentally save an empty array over our good data!
  const [isLoaded, setIsLoaded] = useState(false); 

  // 1. READ: Load tasks from the phone's hard drive when the app first opens
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks from storage', error);
      } finally {
        setIsLoaded(true); // Mark loading as complete
      }
    };
    
    loadTasks();
  }, []); // The empty array means this only runs once on startup

  // 2. WRITE: Save tasks to the hard drive every single time the 'tasks' array changes
  useEffect(() => {
    const saveTasks = async () => {
      // Only save if we have already finished loading the initial data
      if (isLoaded) {
        try {
          await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
          console.error('Failed to save tasks to storage', error);
        }
      }
    };

    saveTasks();
  }, [tasks, isLoaded]); // This runs whenever 'tasks' or 'isLoaded' changes

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