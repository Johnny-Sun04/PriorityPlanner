import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
// Import the global state hook and the Task blueprint
import { Task, useTasks } from '../../context/TaskContext';

export default function App() {
  const [taskText, setTaskText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<number>(1);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Replace local state with our Global Context!
  const { tasks, setTasks } = useTasks();

  const handleSaveTask = () => {
    if (!taskText.trim()) return;
    
    if (editingTaskId) {
      setTasks(tasks.map(task => 
        task.id === editingTaskId 
          ? { ...task, text: taskText, priority: selectedPriority } 
          : task
      ));
      setEditingTaskId(null); 
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskText,
        priority: selectedPriority, 
        completed: false,
        taskType: 'single', // Defaulting to 'single' for the daily view
      };
      setTasks([...tasks, newTask]);
    }
    
    setTaskText('');
    setSelectedPriority(1); 
  };

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

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (editingTaskId === id) {
      setEditingTaskId(null);
      setTaskText('');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return a.priority - b.priority;
    }
    return a.completed ? 1 : -1; 
  });

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      activeOpacity={1} 
      style={[
        styles.taskItem, 
        item.completed && styles.taskItemCompleted,
        editingTaskId === item.id && styles.taskItemEditing 
      ]} 
      onPress={() => toggleComplete(item.id)}
      onLongPress={() => handleEditPress(item)}
      delayLongPress={750} 
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

  const renderHiddenItem = ({ item }: { item: Task }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.backRightBtn}
        onPress={() => deleteTask(item.id)}
      >
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Today's Focus</Text>
      
      <SwipeListView
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-75} 
        disableRightSwipe={true} 
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
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 20, color: '#333' },
  list: { flex: 1, paddingHorizontal: 20 },
  taskItem: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  taskItemCompleted: { backgroundColor: '#e0e0e0', shadowOpacity: 0, elevation: 0 },
  taskItemEditing: { borderColor: '#007AFF', borderWidth: 2 },
  taskTextContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskText: { fontSize: 16, color: '#333', flex: 1 },
  textCompleted: { color: '#888', textDecorationLine: 'line-through' },
  priorityText: { fontSize: 12, color: '#666', fontWeight: '600' },
  rowBack: { alignItems: 'center', backgroundColor: '#FF3B30', flex: 1, flexDirection: 'row', justifyContent: 'flex-end', borderRadius: 10, marginBottom: 10 },
  backRightBtn: { alignItems: 'center', bottom: 0, justifyContent: 'center', position: 'absolute', top: 0, width: 75, right: 0, borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  backTextWhite: { color: '#FFF', fontWeight: 'bold' },
  inputWrapper: { backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e0e0e0', paddingBottom: 80 },
  prioritySelector: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
  priorityLabel: { fontSize: 14, color: '#666', marginRight: 15 },
  priorityButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  priorityButtonSelected: { backgroundColor: '#007AFF' },
  priorityButtonText: { color: '#666', fontWeight: 'bold' },
  priorityButtonTextSelected: { color: '#fff' },
  inputContainer: { flexDirection: 'row', padding: 20, paddingTop: 10 },
  input: { flex: 1, height: 50, backgroundColor: '#f0f0f0', borderRadius: 25, paddingHorizontal: 20, fontSize: 16, marginRight: 10 },
  addButton: { width: 50, height: 50, backgroundColor: '#007AFF', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  saveButton: { backgroundColor: '#34C759' },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});