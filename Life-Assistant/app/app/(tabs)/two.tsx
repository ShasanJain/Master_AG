import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { useStore } from '@/store/useStore';
import { PhoneMissed, MessageSquare, Trash2, ChevronRight } from 'lucide-react-native';

import GlassCard from '@/components/GlassCard';

export default function RemindersScreen() {
  const { reminders, removeReminder } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Communication</Text>
          <Text style={styles.subtitle}>Calls and messages to return</Text>
        </View>

        {reminders.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>All caught up!</Text>
          </GlassCard>
        ) : (
          reminders.map((reminder) => (
            <GlassCard key={reminder.id} style={styles.card}>
              <View style={styles.iconContainer}>
                {reminder.type === 'call' ? (
                  <PhoneMissed color={Colors.error} size={20} />
                ) : (
                  <MessageSquare color={Colors.primary} size={20} />
                )}
              </View>
              
              <View style={styles.info}>
                <Text style={styles.contact}>{reminder.contact}</Text>
                <Text style={styles.type}>
                  {reminder.type === 'call' ? 'Missed Call' : 'New Message'} • {reminder.timestamp}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => removeReminder(reminder.id)}
              >
                <Trash2 color={Colors.error} size={18} />
              </TouchableOpacity>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: Typography.size.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contact: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
  },
  type: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  actionBtn: {
    padding: Spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    padding: Spacing.xl,
  },
  emptyText: {
    color: Colors.muted,
    fontStyle: 'italic',
  },
});
