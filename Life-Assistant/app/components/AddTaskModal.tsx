import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/Theme';
import { useStore } from '@/store/useStore';
import { X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddTaskModal({ visible, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'office' | 'personal'>('office');
  const addTask = useStore((state) => state.addTask);

  const handleSave = () => {
    if (!title) return;
    addTask({
      id: Math.random().toString(36).substr(2, 9),
      title,
      category,
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
    });
    setTitle('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>New Task</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={Colors.muted} size={24} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Task Title"
            placeholderTextColor={Colors.muted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <View style={styles.categoryRow}>
            {(['office', 'personal'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  category === cat && styles.categoryBtnActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  input: {
    backgroundColor: Colors.background,
    color: Colors.text,
    padding: Spacing.md,
    borderRadius: 12,
    fontSize: Typography.size.md,
    marginBottom: Spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  categoryBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.muted,
    marginRight: Spacing.sm,
  },
  categoryBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.muted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  categoryTextActive: {
    color: Colors.background,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: Colors.background,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
});
