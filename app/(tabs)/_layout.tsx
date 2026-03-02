import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      
      {/* 1. Daily Planner Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          // house.fill works nicely, or you could try 'list.bullet' if your icon set supports it
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      {/* 2. Future Planning Calendar Tab */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          // Changed name to 'calendar' to pull the standard calendar icon
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
    </Tabs>
  );
}