import BrowserBotClient from './BrowserBotClient';

export const dynamic = 'force-dynamic';

export default function BrowserBotPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6">
      <BrowserBotClient />
    </main>
  );
}
