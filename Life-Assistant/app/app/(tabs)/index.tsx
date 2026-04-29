import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { useStore } from '@/store/useStore';
import { CheckCircle2, Circle, PhoneMissed, MessageSquare, Cake, Plus, Trash2, RefreshCw, Calendar as CalendarIcon } from 'lucide-react-native';
import GlassCard from '@/components/GlassCard';
import GradientCard from '@/components/GradientCard';
import ProgressRing from '@/components/ProgressRing';
import AddTaskModal from '@/components/AddTaskModal';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import BirthdayCalendarModal from '@/components/BirthdayCalendarModal';

export default function DashboardScreen() {
  const { tasks, reminders, birthdays, toggleTask, deleteTask, syncGoogleData } = useStore();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [calendarVisible, setCalendarVisible] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const handleSync = async () => {
    setSyncing(true);
    await syncGoogleData();
    setSyncing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Daily Overview</Text>
              <Text style={styles.subtitle}>You're doing great!</Text>
            </View>
            <TouchableOpacity onPress={handleSync} disabled={syncing} style={styles.syncBtn}>
              <RefreshCw color={syncing ? Colors.muted : Colors.primary} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Card */}
        <GradientCard style={styles.progressCard} colors={[Colors.primary + '30', Colors.accent + '30']}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Your Day Progress</Text>
            <Text style={styles.progressSubTitle}>
              {completedTasks} of {totalTasks} tasks completed
            </Text>
          </View>
          <ProgressRing progress={progress} size={80} />
        </GradientCard>

        {/* Summary Row */}
        <View style={styles.row}>
          <GradientCard style={styles.smallCard} colors={['rgba(251, 113, 133, 0.1)', 'rgba(251, 113, 133, 0.05)']}>
            <PhoneMissed color={Colors.error} size={22} />
            <Text style={styles.cardCount}>{reminders.filter(r => r.type === 'call').length}</Text>
            <Text style={styles.cardLabel}>Missed Calls</Text>
          </GradientCard>

          <GradientCard style={styles.smallCard} colors={['rgba(56, 189, 248, 0.1)', 'rgba(56, 189, 248, 0.05)']}>
            <MessageSquare color={Colors.primary} size={22} />
            <Text style={styles.cardCount}>{reminders.filter(r => r.type === 'message').length}</Text>
            <Text style={styles.cardLabel}>Messages</Text>
          </GradientCard>
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Priority Tasks</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Plus color={Colors.primary} size={24} />
            </TouchableOpacity>
          </View>
          
          {tasks.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tasks yet. Tap + to add one.</Text>
            </GlassCard>
          ) : (
            tasks.map((task) => (
              <GlassCard key={task.id} style={styles.taskContainer}>
                <TouchableOpacity 
                  style={styles.taskItem}
                  onPress={() => toggleTask(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle2 color={Colors.success} size={20} />
                  ) : (
                    <Circle color={Colors.muted} size={20} />
                  )}
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
                      {task.title}
                    </Text>
                    <Text style={styles.categoryBadge}>{task.category}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(task.id)}>
                  <Trash2 color={Colors.error} size={18} />
                </TouchableOpacity>
              </GlassCard>
            ))
          )}
        </View>

        {/* Birthdays Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Birthdays</Text>
            <TouchableOpacity onPress={() => setCalendarVisible(true)}>
              <CalendarIcon color={Colors.accent} size={20} />
            </TouchableOpacity>
          </View>
          {birthdays.length === 0 ? (
            <Text style={styles.emptyText}>None coming up soon.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.birthdayScroll}>
              {birthdays.map((b) => (
                <GlassCard key={b.id} style={styles.birthdayCard}>
                  <View style={styles.birthdayIcon}>
                    <Cake color={Colors.background} size={16} />
                  </View>
                  <Text style={styles.birthdayName}>{b.name}</Text>
                  <Text style={styles.birthdayDate}>{b.date}</Text>
                </GlassCard>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <AddTaskModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />

      <BirthdayCalendarModal
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
      />
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
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: Colors.text,
    fontSize: Typography.size.xxl,
    fontFamily: Typography.family.bold,
  },
  subtitle: {
    color: Colors.muted,
    fontSize: Typography.size.md,
    fontFamily: Typography.family.regular,
  },
  syncBtn: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.bold,
  },
  progressSubTitle: {
    color: Colors.muted,
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.regular,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  smallCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  cardCount: {
    color: Colors.text,
    fontSize: Typography.size.xl,
    fontFamily: Typography.family.bold,
    marginTop: Spacing.sm,
  },
  cardLabel: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.medium,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.bold,
  },
  addButton: {
    padding: Spacing.xs,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.sm,
    justifyContent: 'space-between',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskInfo: {
    marginLeft: Spacing.md,
  },
  taskText: {
    color: Colors.text,
    fontSize: Typography.size.md,
    fontFamily: Typography.family.medium,
  },
  categoryBadge: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.regular,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  taskCompleted: {
    color: Colors.muted,
    textDecorationLine: 'line-through',
  },
  birthdayScroll: {
    marginHorizontal: -Spacing.md,
    paddingLeft: Spacing.md,
  },
  birthdayCard: {
    width: 140,
    marginRight: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  birthdayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  birthdayName: {
    color: Colors.text,
    fontSize: Typography.size.sm,
    fontFamily: Typography.family.bold,
  },
  birthdayDate: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontFamily: Typography.family.regular,
    marginTop: 2,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.muted,
    fontFamily: Typography.family.regular,
    fontStyle: 'italic',
  },
});
