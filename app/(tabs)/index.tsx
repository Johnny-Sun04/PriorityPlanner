import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Task, useTasks } from '../../context/TaskContext';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function App() {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  const currentDayOfWeek = dateObj.getDay(); 

  const [taskText, setTaskText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<number>(1);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  
  const { tasks, setTasks } = useTasks();

  // --- NEW HELPER FUNCTION ---
  // Dynamically determines if a task is done TODAY
  const isTaskCompletedToday = (task: Task) => {
    if (task.taskType === 'weekly') {
      return task.completedDates?.includes(today) || false;
    }
    return task.completed;
  };

  const handleSaveTask = () => {
    if (!taskText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newTaskType = selectedDays.length > 0 ? 'weekly' : 'single';
    const newDaysOfWeek = selectedDays.length > 0 ? selectedDays : undefined;

    if (editingTaskId) {
      setTasks(tasks.map(task => 
        task.id === editingTaskId 
          ? { 
              ...task, 
              text: taskText, 
              priority: selectedPriority,
              taskType: newTaskType,
              daysOfWeek: newDaysOfWeek
            } 
          : task
      ));
      setEditingTaskId(null); 
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        text: taskText,
        priority: selectedPriority, 
        completed: false,
        taskType: newTaskType,
        startDate: today,
        daysOfWeek: newDaysOfWeek,
        completedDates: [], // Initialize the empty array for new tasks
      };
      setTasks([...tasks, newTask]);
    }
    
    setTaskText('');
    setSelectedPriority(1); 
    setSelectedDays([]); 
  };

  const handleEditPress = (task: Task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setEditingTaskId(task.id);
    setTaskText(task.text);
    setSelectedPriority(task.priority);
    setSelectedDays(task.daysOfWeek || []);
  };

  // --- UPDATED TOGGLE LOGIC ---
  const toggleComplete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks(tasks.map(task => {
      if (task.id === id) {
        if (task.taskType === 'weekly') {
          const dates = task.completedDates || [];
          const isDoneToday = dates.includes(today);
          // If done today, remove today from the array. If not done, add today to the array.
          const newDates = isDoneToday 
            ? dates.filter(d => d !== today) 
            : [...dates, today];
          return { ...task, completedDates: newDates };
        } else {
          return { ...task, completed: !task.completed };
        }
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTasks(tasks.filter(task => task.id !== id));
    if (editingTaskId === id) {
      setEditingTaskId(null);
      setTaskText('');
      setSelectedDays([]);
    }
  };

  const todaysTasks = tasks.filter(task => {
    const isTodaySingle = task.taskType === 'single' && (!task.startDate || task.startDate === today);
    const isTodayWeekly = task.taskType === 'weekly' && task.daysOfWeek?.includes(currentDayOfWeek);
    return isTodaySingle || isTodayWeekly;
  });

  const sortedTasks = [...todaysTasks].sort((a, b) => {
    // We now sort using our dynamic helper function!
    const aCompleted = isTaskCompletedToday(a);
    const bCompleted = isTaskCompletedToday(b);

    if (aCompleted === bCompleted) {
      return a.priority - b.priority;
    }
    return aCompleted ? 1 : -1; 
  });

  const renderTask = ({ item }: { item: Task }) => {
    // Check if THIS specific task is done today
    const isCompleted = isTaskCompletedToday(item);

    return (
      <Pressable 
        style={({ pressed }) => [
          styles.taskItem, 
          isCompleted && styles.taskItemCompleted,
          editingTaskId === item.id && styles.taskItemEditing,
          pressed && styles.taskItemPressed 
        ]} 
        onPress={() => toggleComplete(item.id)}
        onLongPress={() => handleEditPress(item)}
        delayLongPress={750} 
      >
        <View style={styles.taskTextContainer}>
          <Text style={[styles.taskText, isCompleted && styles.textCompleted]}>
            {item.text}
            {item.taskType === 'weekly' && " 🔄"} 
          </Text>
          <Text style={styles.priorityText}>
            Priority {item.priority}
          </Text>
        </View>
      </Pressable>
    );
  };

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
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 20} 
        style={styles.inputWrapper}
      >
        <View style={styles.daysSelector}>
          <Text style={styles.priorityLabel}>Repeat:</Text>
          {DAYS.map((day, index) => {
            const isSelected = selectedDays.includes(index);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  isSelected && styles.dayButtonSelected
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (isSelected) {
                    setSelectedDays(selectedDays.filter(d => d !== index));
                  } else {
                    setSelectedDays([...selectedDays, index]);
                  }
                }}
              >
                <Text style={[
                  styles.dayButtonText,
                  isSelected && styles.dayButtonTextSelected
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPriority(p);
              }}
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
  taskItemPressed: { backgroundColor: '#E8E8E8' }, 
  taskTextContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskText: { fontSize: 16, color: '#333', flex: 1 },
  textCompleted: { color: '#888', textDecorationLine: 'line-through' },
  priorityText: { fontSize: 12, color: '#666', fontWeight: '600' },
  rowBack: { alignItems: 'center', backgroundColor: '#FF3B30', flex: 1, flexDirection: 'row', justifyContent: 'flex-end', borderRadius: 10, marginBottom: 10 },
  backRightBtn: { alignItems: 'center', bottom: 0, justifyContent: 'center', position: 'absolute', top: 0, width: 75, right: 0, borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  backTextWhite: { color: '#FFF', fontWeight: 'bold' },
  inputWrapper: { backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e0e0e0', paddingBottom: 80 },
  daysSelector: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15 },
  dayButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  dayButtonSelected: { backgroundColor: '#34C759' }, 
  dayButtonText: { color: '#666', fontWeight: 'bold', fontSize: 12 },
  dayButtonTextSelected: { color: '#fff' },
  prioritySelector: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },
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