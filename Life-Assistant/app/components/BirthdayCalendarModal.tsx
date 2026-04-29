import React from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { useStore } from '@/store/useStore';
import { X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function BirthdayCalendarModal({ visible, onClose }: Props) {
  const birthdays = useStore((state) => state.birthdays);

  // Map birthdays to calendar marks (Mocking the current year for simplicity)
  const markedDates: any = {};
  birthdays.forEach((b) => {
    // Basic mapping: logic would need real dates in prod
    const date = '2026-05-12'; // Mock for demo
    markedDates[date] = { marked: true, dotColor: Colors.accent, selected: true, selectedColor: Colors.accent + '20' };
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Birthday Calendar</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={Colors.muted} size={24} />
            </TouchableOpacity>
          </View>

          <Calendar
            theme={{
              backgroundColor: Colors.card,
              calendarBackground: Colors.card,
              textSectionTitleColor: Colors.muted,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.background,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.text,
              textDisabledColor: 'rgba(255,255,255,0.1)',
              monthTextColor: Colors.text,
              indicatorColor: Colors.primary,
              arrowColor: Colors.primary,
            }}
            markedDates={markedDates}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  content: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
});
