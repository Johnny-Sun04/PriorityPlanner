import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Task {
  id: string;
  text: string;
  priority: number;
  completed: boolean;
}

export default function App() {
  const [taskText, setTaskText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<number>(1);
  
  // New state to track if we are currently editing a task (holds the ID, or null if adding new)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Set up GitHub Desktop repo', priority: 1, completed: false },
    { id: '2', text: 'Plan database schema', priority: 2, completed: false },
    { id: '3', text: 'Review UI mockups', priority: 3, completed: true },
  ]);

  // This handles both adding a new task AND saving an edited task
  const handleSaveTask = () => {
    if (!taskText.trim()) return;
    
    if (editingTaskId) {
      // We are in edit mode: find the matching task and update its text and priority
      setTasks(tasks.map(task => 
        task.id === editingTaskId 
          ? { ...task, text: taskText, priority: selectedPriority } 
          : task
      ));
      setEditingTaskId(null); // Exit edit mode
    } else {
      // We are in add mode: create a brand new task
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskText,
        priority: selectedPriority, 
        completed: false,
      };
      setTasks([...tasks, newTask]);
    }
    
    // Reset the input fields
    setTaskText('');
    setSelectedPriority(1); 
  };

  // Triggers when a task is held down for 3 seconds
  const handleEditPress = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskText(task.text);
    setSelectedPriority(task.priority);
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return a.priority - b.priority;
    }
    return a.completed ? 1 : -1; 
  });

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={[
        styles.taskItem, 
        item.completed && styles.taskItemCompleted,
        editingTaskId === item.id && styles.taskItemEditing // Highlight the task being edited
      ]} 
      onPress={() => toggleComplete(item.id)}
      onLongPress={() => handleEditPress(item)}
      delayLongPress={750} // Forces the user to hold for exactly 750ms (.75 seconds)
    >
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskText, item.completed && styles.textCompleted]}>
          {item.text}
        </Text>
        <Text style={styles.priorityText}>
          Priority {item.priority}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Today's Focus</Text>
      
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        style={styles.list}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20} 
        style={styles.inputWrapper}
      >
        <View style={styles.prioritySelector}>
          <Text style={styles.priorityLabel}>
            {editingTaskId ? "Edit Priority:" : "Set Priority:"}
          </Text>
          {[1, 2, 3].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityButton,
                selectedPriority === p && styles.priorityButtonSelected
              ]}
              onPress={() => setSelectedPriority(p)}
            >
              <Text style={[
                styles.priorityButtonText,
                selectedPriority === p && styles.priorityButtonTextSelected
              ]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={editingTaskId ? "Edit task..." : "Add a new task..."}
            value={taskText}
            onChangeText={setTaskText}
            onSubmitEditing={handleSaveTask}
          />
          {/* Changes color and icon based on whether we are adding or editing */}
          <TouchableOpacity 
            style={[styles.addButton, editingTaskId && styles.saveButton]} 
            onPress={handleSaveTask}
          >
            <Text style={styles.addButtonText}>
              {editingTaskId ? "✓" : "+"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 20,
    color: '#333',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskItemCompleted: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  taskItemEditing: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  taskTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  textCompleted: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  priorityText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    paddingBottom: 80, 
  },
  prioritySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  priorityLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  priorityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  priorityButtonSelected: {
    backgroundColor: '#007AFF',
  },
  priorityButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  priorityButtonTextSelected: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#34C759', // Green color for saving
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});