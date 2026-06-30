'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Play, 
  Trash2, 
  Plus, 
  RotateCw, 
  Terminal, 
  ToggleLeft, 
  ToggleRight, 
  Bot, 
  Sparkles, 
  PlusCircle, 
  ListTodo,
  CheckCircle,
  FileText
} from 'lucide-react';
import { 
  fetchTasks, 
  saveTasks, 
  fetchLogs, 
  triggerTaskImmediately, 
  startRalphLoop, 
  fetchRalphLogs,
  Task,
  RalphConfig 
} from './actions';

interface SchedulerClientProps {
  initialTasks: Task[];
}

export default function SchedulerClient({ initialTasks }: SchedulerClientProps) {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'ralph'>('scheduler');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [logs, setLogs] = useState<string>('Loading logs...');
  const [ralphLogs, setRalphLogs] = useState<string>('No execution logs.');
  const [loading, setLoading] = useState<boolean>(false);
  const [isRalphRunning, setIsRalphRunning] = useState<boolean>(false);

  // New task form state
  const [newTaskId, setNewTaskId] = useState('');
  const [newTaskCommand, setNewTaskCommand] = useState('');
  const [newTaskSchedule, setNewTaskSchedule] = useState('');
  const [newTaskType, setNewTaskType] = useState<'recurring' | 'once'>('recurring');

  // Ralph state
  const [ralphBranch, setRalphBranch] = useState('ralph/feature-name');
  const [ralphStories, setRalphStories] = useState<Array<{ id: string; title: string; priority: number; passes: boolean }>>([
    { id: 'STORY-1', title: 'Implement database connection pooling', priority: 1, passes: false }
  ]);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [ralphIterations, setRalphIterations] = useState(5);

  const refreshTasks = async () => {
    const updated = await fetchTasks();
    setTasks(updated);
  };

  const refreshLogs = async () => {
    const logData = await fetchLogs();
    setLogs(logData);
  };

  const refreshRalphLogs = async () => {
    const logData = await fetchRalphLogs();
    setRalphLogs(logData);
  };

  // Poll logs and task updates
  useEffect(() => {
    refreshLogs();
    refreshRalphLogs();
    const interval = setInterval(() => {
      refreshLogs();
      refreshRalphLogs();
      refreshTasks();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskId || !newTaskCommand || !newTaskSchedule) return;

    const newTask: Task = {
      id: newTaskId,
      command: newTaskCommand,
      schedule: newTaskSchedule,
      type: newTaskType,
      enabled: true,
      last_run: null
    };

    const updatedTasks = [...tasks, newTask];
    const success = await saveTasks(updatedTasks);
    if (success) {
      setTasks(updatedTasks);
      setNewTaskId('');
      setNewTaskCommand('');
      setNewTaskSchedule('');
    }
  };

  const handleDeleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    const success = await saveTasks(updatedTasks);
    if (success) {
      setTasks(updatedTasks);
    }
  };

  const handleToggleTask = async (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        return { ...t, enabled: !t.enabled };
      }
      return t;
    });
    const success = await saveTasks(updatedTasks);
    if (success) {
      setTasks(updatedTasks);
    }
  };

  const handleTriggerTask = async (id: string) => {
    setLoading(true);
    const res = await triggerTaskImmediately(id);
    setLoading(false);
    alert(res.message);
    refreshLogs();
  };

  const handleAddStory = () => {
    if (!newStoryTitle.trim()) return;
    const nextId = `STORY-${ralphStories.length + 1}`;
    setRalphStories([...ralphStories, {
      id: nextId,
      title: newStoryTitle,
      priority: ralphStories.length + 1,
      passes: false
    }]);
    setNewStoryTitle('');
  };

  const handleRemoveStory = (id: string) => {
    setRalphStories(ralphStories.filter(s => s.id !== id));
  };

  const handleStartRalph = async () => {
    setIsRalphRunning(true);
    const config: RalphConfig = {
      branchName: ralphBranch,
      userStories: ralphStories,
      maxIterations: ralphIterations
    };
    const res = await startRalphLoop(config);
    alert(res.message);
    setTimeout(() => {
      setIsRalphRunning(false);
      refreshRalphLogs();
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title & Navigation */}
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[var(--primary)] to-purple-400 bg-clip-text text-transparent font-mono">
            🎛️ CONTROL CENTER
          </h1>
          <p className="text-xs text-[var(--muted)] font-mono mt-1">
            Task scheduler automation and autonomous agent code loops.
          </p>
        </div>

        <div className="flex gap-2 bg-[var(--surface)] p-1 border border-[var(--border)] rounded-md">
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-3 py-1.5 text-xs font-bold font-mono rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'scheduler'
                ? 'bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary-glow)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Task Scheduler
          </button>
          <button
            onClick={() => setActiveTab('ralph')}
            className={`px-3 py-1.5 text-xs font-bold font-mono rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'ralph'
                ? 'bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary-glow)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Ralph AI Loop
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'scheduler' ? (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left/Middle Column: Tasks Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[var(--primary)] flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Active Schedules
                  </h2>
                  <button onClick={refreshTasks} className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                    <RotateCw className="w-3.5 h-3.5 animate-spin-hover" />
                  </button>
                </div>

                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <p className="text-xs text-[var(--muted)] font-mono py-6 text-center">No tasks scheduled.</p>
                  ) : (
                    tasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-4 border rounded-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--background)] ${
                          task.enabled ? 'border-[var(--border)]' : 'border-dashed border-[var(--border)] opacity-60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[var(--foreground)]">{task.id}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                              task.type === 'once' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {task.type || 'recurring'}
                            </span>
                          </div>
                          <code className="text-xs text-[var(--muted)] block break-all font-mono bg-[var(--surface)] px-2 py-1 rounded border border-[var(--border)]">
                            {task.command}
                          </code>
                          <div className="text-[10px] text-[var(--muted)] font-mono flex gap-4">
                            <span>🕒 Schedule: <strong className="text-[var(--foreground)]">{task.schedule}</strong></span>
                            {task.last_run && (
                              <span>Last run: <strong className="text-[var(--foreground)]">{new Date(task.last_run).toLocaleTimeString()}</strong></span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="p-1.5 rounded hover:bg-[var(--surface)] transition-colors text-[var(--muted)] hover:text-white"
                            title={task.enabled ? "Disable Task" : "Enable Task"}
                          >
                            {task.enabled ? <ToggleRight className="w-5 h-5 text-[var(--primary)]" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleTriggerTask(task.id)}
                            disabled={loading || !task.enabled}
                            className="p-1.5 rounded hover:bg-[var(--surface)] transition-colors text-[var(--muted)] hover:text-[var(--primary)] disabled:opacity-30"
                            title="Run Immediately"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-[var(--muted)] hover:text-red-400"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Log Reader */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--muted)] flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Scheduler Logs
                  </h3>
                  <button onClick={refreshLogs} className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <pre className="p-4 bg-black text-emerald-400 font-mono text-xs overflow-y-auto max-h-60 rounded border border-[var(--border)] leading-relaxed whitespace-pre-wrap">
                  {logs}
                </pre>
              </div>
            </div>

            {/* Right Column: Add Task Panel */}
            <div className="space-y-6">
              <form onSubmit={handleAddTask} className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[var(--primary)] flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Schedule New Task
                </h2>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[var(--muted)]">Task ID</label>
                    <input
                      type="text"
                      placeholder="e.g. database-backup"
                      value={newTaskId}
                      onChange={e => setNewTaskId(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] p-2 rounded text-white focus:outline-none focus:border-[var(--primary)]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[var(--muted)]">Command / Script</label>
                    <input
                      type="text"
                      placeholder="python execution/your_script.py"
                      value={newTaskCommand}
                      onChange={e => setNewTaskCommand(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] p-2 rounded text-white focus:outline-none focus:border-[var(--primary)]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[var(--muted)]">Task Type</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setNewTaskType('recurring')}
                        className={`flex-1 py-1.5 border rounded text-center transition-colors font-bold ${
                          newTaskType === 'recurring' 
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                            : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
                        }`}
                      >
                        Recurring
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTaskType('once')}
                        className={`flex-1 py-1.5 border rounded text-center transition-colors font-bold ${
                          newTaskType === 'once' 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                            : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
                        }`}
                      >
                        One-Off
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[var(--muted)]">
                      {newTaskType === 'once' ? 'Execution Date/Time (YYYY-MM-DD HH:MM)' : 'Schedule Pattern (e.g. 10m, 2h, or 18:30)'}
                    </label>
                    <input
                      type="text"
                      placeholder={newTaskType === 'once' ? '2026-06-25 18:30' : '10m / 24h / 09:00'}
                      value={newTaskSchedule}
                      onChange={e => setNewTaskSchedule(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] p-2 rounded text-white focus:outline-none focus:border-[var(--primary)]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[var(--primary)] text-black py-2 rounded text-xs font-bold font-mono tracking-wider hover:shadow-[0_0_15px_var(--primary-glow)] transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Add Task
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ralph"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Ralph Configuration Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[var(--primary)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Loop Configuration
                </h2>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[var(--muted)]">Target Git Branch</label>
                    <input
                      type="text"
                      value={ralphBranch}
                      onChange={e => setRalphBranch(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--border)] p-2 rounded text-white focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[var(--muted)]">Max Iterations</label>
                      <span className="text-[var(--primary)] font-bold">{ralphIterations}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={ralphIterations}
                      onChange={e => setRalphIterations(Number(e.target.value))}
                      className="w-full accent-[var(--primary)] bg-[var(--background)]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartRalph}
                  disabled={isRalphRunning || ralphStories.length === 0}
                  className="w-full bg-[var(--primary)] text-black py-2.5 rounded text-xs font-bold font-mono tracking-wider hover:shadow-[0_0_15px_var(--primary-glow)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Play className="w-4 h-4" /> {isRalphRunning ? 'Running loop...' : 'Launch Ralph Loop'}
                </button>
              </div>
            </div>

            {/* User Stories Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[var(--primary)] flex items-center gap-2">
                  <ListTodo className="w-4 h-4" /> User Stories (PRD)
                </h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new story description..."
                    value={newStoryTitle}
                    onChange={e => setNewStoryTitle(e.target.value)}
                    className="flex-1 bg-[var(--background)] border border-[var(--border)] p-2 rounded text-xs text-white focus:outline-none focus:border-[var(--primary)] font-mono"
                    onKeyDown={e => e.key === 'Enter' && handleAddStory()}
                  />
                  <button
                    onClick={handleAddStory}
                    className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-white px-4 rounded text-xs font-bold font-mono transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {ralphStories.map((story) => (
                    <div 
                      key={story.id} 
                      className="p-3 border border-[var(--border)] bg-[var(--background)] rounded flex justify-between items-center font-mono text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--primary)] font-bold">{story.id}</span>
                        <span className="text-[var(--foreground)]">{story.title}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveStory(story.id)}
                        className="text-[var(--muted)] hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Console */}
              <div className="border border-[var(--border)] bg-[var(--surface)] p-5 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[var(--muted)] flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Ralph Execution Log
                  </h3>
                  <button onClick={refreshRalphLogs} className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <pre className="p-4 bg-black text-indigo-300 font-mono text-xs overflow-y-auto max-h-60 rounded border border-[var(--border)] leading-relaxed whitespace-pre-wrap">
                  {ralphLogs}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
