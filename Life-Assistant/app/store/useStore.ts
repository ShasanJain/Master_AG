import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: string;
  title: string;
  category: 'office' | 'personal';
  completed: boolean;
  dueDate: string;
};

export type Birthday = {
  id: string;
  name: string;
  date: string;
  manual: boolean;
};

export type Reminder = {
  id: string;
  type: 'call' | 'message';
  contact: string;
  timestamp: string;
};

interface LifeState {
  tasks: Task[];
  birthdays: Birthday[];
  reminders: Reminder[];
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addBirthday: (birthday: Birthday) => void;
  addReminder: (reminder: Reminder) => void;
  removeReminder: (id: string) => void;
  syncGoogleData: () => Promise<void>;
}

export const useStore = create<LifeState>()(
  persist(
    (set) => ({
      tasks: [
        { id: '1', title: 'Finish Quarter Report', category: 'office', completed: false, dueDate: '2026-04-30' },
        { id: '2', title: 'Reply to HR on benefits', category: 'office', completed: true, dueDate: '2026-04-29' },
      ],
      birthdays: [
        { id: '1', name: 'John Doe', date: 'May 12', manual: true },
        { id: '2', name: 'Jane Smith', date: 'Tomorrow', manual: false },
      ],
      reminders: [
        { id: '1', type: 'call', contact: 'Boss', timestamp: '10:30 AM' },
        { id: '2', type: 'message', contact: 'Mom', timestamp: '09:15 AM' },
      ],
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      addBirthday: (birthday) => set((state) => ({ birthdays: [...state.birthdays, birthday] })),
      addReminder: (reminder) => set((state) => ({ reminders: [...state.reminders, reminder] })),
      removeReminder: (id) => set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id)
      })),
      syncGoogleData: async () => {
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id: 'sync-' + Date.now(), title: 'Google Calendar: Board Meeting', category: 'office', completed: false, dueDate: '2026-05-01' }
          ]
        }));
      },
    }),
    {
      name: 'life-assistant-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
