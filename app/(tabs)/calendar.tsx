import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Task, useTasks } from '../../context/TaskContext';

export default function CalendarScreen() {
  // Get today's date in 'YYYY-MM-DD' format to use as the default selection
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [taskText, setTaskText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<number>(1);

  // 1. Pull in our global tasks
  const { tasks, setTasks } = useTasks();

  // 2. Filter the global tasks to only show ones matching the currently tapped calendar day
  const tasksForSelectedDate = tasks.filter(task => task.startDate === selectedDate);

  const handleAddTask = () => {
    if (!taskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: taskText,
      priority: selectedPriority,
      completed: false,
      taskType: 'single',
      startDate: selectedDate, // 3. The magic link: Stamps the task with the selected calendar date
    };
    
    setTasks([...tasks, newTask]);
    setTaskText('');
    setSelectedPriority(1);
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

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
      <Text style={styles.headerTitle}>Future Planning</Text>
      
      <View style={styles.calendarContainer}>
        <Calendar
          current={today}
          onDayPress={(day: { dateString: string }) => {
            setSelectedDate(day.dateString);
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

      <View style={styles.taskSection}>
        <Text style={styles.dateLabel}>Tasks for {selectedDate}:</Text>
        
        {tasksForSelectedDate.length > 0 ? (
          <FlatList
            data={tasksForSelectedDate}
            keyExtractor={(item) => item.id}
            renderItem={renderTask}
            style={styles.list}
          />
        ) : (
          <Text style={styles.placeholderText}>
            No tasks scheduled for this day.
          </Text>
        )}
      </View>

      {/* Input UI adapted for the Calendar screen */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 20} 
        style={styles.inputWrapper}
      >
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
            placeholder={`Add task for ${selectedDate}...`}
            value={taskText}
            onChangeText={setTaskText}
            onSubmitEditing={handleAddTask}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={styles.addButtonText}>+</Text>
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
  taskSection: { flex: 1, paddingTop: 20 },
  dateLabel: { fontSize: 18, fontWeight: 'bold', color: '#333', marginHorizontal: 20, marginBottom: 10 },
  list: { flex: 1, paddingHorizontal: 20 },
  taskItem: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  taskItemCompleted: { backgroundColor: '#e0e0e0', shadowOpacity: 0, elevation: 0 },
  taskTextContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskText: { fontSize: 16, color: '#333', flex: 1 },
  textCompleted: { color: '#888', textDecorationLine: 'line-through' },
  priorityText: { fontSize: 12, color: '#666', fontWeight: '600' },
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
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});