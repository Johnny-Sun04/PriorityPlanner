import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// Import the Calendar component from our new library
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Future Planning</Text>
      
      <View style={styles.calendarContainer}>
        <Calendar
          // This function fires when a user taps a day
          onDayPress={(day: { dateString: string }) => {
            setSelectedDate(day.dateString);
          }}
          // This highlights the currently selected day
          markedDates={{
            [selectedDate]: { 
              selected: true, 
              disableTouchEvent: true, 
              selectedColor: '#007AFF' 
            }
          }}
          // Basic theme customization
          theme={{
            todayTextColor: '#007AFF',
            arrowColor: '#007AFF',
            monthTextColor: '#333',
            textMonthFontWeight: 'bold',
          }}
        />
      </View>

      {/* Conditional rendering: Only show this if a date is clicked */}
      <View style={styles.taskSection}>
        {selectedDate ? (
          <>
            <Text style={styles.dateLabel}>Tasks for {selectedDate}:</Text>
            <Text style={styles.placeholderText}>
              (Task list will go here...)
            </Text>
          </>
        ) : (
          <Text style={styles.placeholderText}>
            Select a date above to plan future tasks.
          </Text>
        )}
      </View>
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
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskSection: {
    flex: 1,
    padding: 20,
    marginTop: 10,
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  }
});