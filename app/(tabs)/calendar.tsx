import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Task, useTasks } from '../../context/TaskContext';

export default function CalendarScreen() {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  const [selectedDate, setSelectedDate] = useState(today);
  const [taskText, setTaskText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<number>(1);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);

  const { tasks, setTasks } = useTasks();

  // 1. Safely figure out the day of the week (0-6) for whatever date you clicked on the calendar
  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
  const selectedDayOfWeek = new Date(selYear, selMonth - 1, selDay).getDay();

  // 2. The Upgraded Calendar Filter
  const tasksForSelectedDate = tasks.filter(task => {
    // Is it a single task scheduled for this exact calendar day?
    const isSingleMatch = task.taskType === 'single' && task.startDate === selectedDate;
    
    // Is it a weekly task that runs on this day of the week?
    // (We also check `selectedDate >= task.startDate` so a task you create today doesn't show up on a calendar day from 3 years ago!)
    const isWeeklyMatch = task.taskType === 'weekly' && 
                          task.daysOfWeek?.includes(selectedDayOfWeek) && 
                          task.startDate && 
                          selectedDate >= task.startDate;

    return isSingleMatch || isWeeklyMatch;
  });

  const sortedTasks = [...tasksForSelectedDate].sort((a, b) => {
    if (a.completed === b.completed) {
      return a.priority - b.priority;
    }
    return a.completed ? 1 : -1; 
  });

  const handleSaveTask = () => {
    if (!taskText.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
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
        taskType: 'single', // Tasks added directly on the calendar default to single
        startDate: selectedDate, 
      };
      setTasks([...tasks, newTask]);
    }
    
    setTaskText('');
    setSelectedPriority(1);
    Keyboard.dismiss(); 
  };

  const handleEditPress = (task: Task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setEditingTaskId(task.id);
    setTaskText(task.text);
    setSelectedPriority(task.priority);
  };

  const toggleComplete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTasks(tasks.filter(task => task.id !== id));
    if (editingTaskId === id) {
      setEditingTaskId(null);
      setTaskText('');
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.taskItem, 
        item.completed && styles.taskItemCompleted,
        editingTaskId === item.id && styles.taskItemEditing,
        pressed && styles.taskItemPressed 
      ]} 
      onPress={() => toggleComplete(item.id)}
      onLongPress={() => handleEditPress(item)}
      delayLongPress={750} 
    >
      <View style={styles.taskTextContainer}>
        <Text style={[styles.taskText, item.completed && styles.textCompleted]}>
          {item.text}
          {/* Added the repeat icon here too! */}
          {item.taskType === 'weekly' && " 🔄"}
        </Text>
        <Text style={styles.priorityText}>
          Priority {item.priority}
        </Text>
      </View>
    </Pressable>
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
      <Text style={styles.headerTitle}>Future Planning</Text>
      
      {isCalendarVisible ? (
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={(day: { dateString: string }) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDate(day.dateString);
              setIsCalendarVisible(false); 
            }}
            markedDates={{
              [selectedDate]: { 
                selected: true, 
                disableTouchEvent: true, 
                selectedColor: '#007AFF' 
              }
            }}
            theme={{
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
              textMonthFontWeight: 'bold',
            }}
          />
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.collapsedCalendarBtn} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Keyboard.dismiss(); 
            setIsCalendarVisible(true); 
          }}
        >
          <Text style={styles.collapsedCalendarText}>
            🗓️ Planning for: {selectedDate} (Tap to change)
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.taskSection}>
        {tasksForSelectedDate.length > 0 ? (
          <SwipeListView
            data={sortedTasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-75} 
            disableRightSwipe={true} 
            style={styles.list}
            onScroll={() => Keyboard.dismiss()} 
          />
        ) : (
          <Text style={styles.placeholderText}>
            No tasks scheduled for this day.
          </Text>
        )}
      </View>

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
            placeholder={editingTaskId ? "Edit task..." : `Add task for ${selectedDate}...`}
            value={taskText}
            onChangeText={setTaskText}
            onSubmitEditing={handleSaveTask}
            onFocus={() => setIsCalendarVisible(false)} 
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
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10, color: '#333' },
  calendarContainer: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 15, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  collapsedCalendarBtn: { backgroundColor: '#e8f0fe', marginHorizontal: 20, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#007AFF', alignItems: 'center' },
  collapsedCalendarText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
  taskSection: { flex: 1, paddingTop: 20 },
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
  placeholderText: { fontSize: 16, color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
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