import { fetchTasks } from './actions';
import SchedulerClient from './SchedulerClient';

export const dynamic = 'force-dynamic';

export default async function SchedulerPage() {
  const initialTasks = await fetchTasks();
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6">
      <SchedulerClient initialTasks={initialTasks} />
    </main>
  );
}
