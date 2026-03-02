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
  // New state to track the currently selected priority (defaulting to 1)
  const [selectedPriority, setSelectedPriority] = useState<number>(1);
  
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Set up GitHub Desktop repo', priority: 1, completed: false },
    { id: '2', text: 'Plan database schema', priority: 2, completed: false },
    { id: '3', text: 'Review UI mockups', priority: 3, completed: true },
  ]);

  const addTask = () => {
    if (!taskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: taskText,
      // Use the state variable here instead of a hardcoded 1
      priority: selectedPriority, 
      completed: false,
    };
    
    setTasks([...tasks, newTask]);
    setTaskText('');
    setSelectedPriority(1); // Reset back to priority 1 after adding
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
      style={[styles.taskItem, item.completed && styles.taskItemCompleted]} 
      onPress={() => toggleComplete(item.id)}
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
        style={styles.inputWrapper}
      >
        {/* New Priority Selection UI */}
        <View style={styles.prioritySelector}>
          <Text style={styles.priorityLabel}>Set Priority:</Text>
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
            placeholder="Add a new task..."
            value={taskText}
            onChangeText={setTaskText}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>+</Text>
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
    paddingBottom: 80, // Pad bottom for tab bar
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
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});