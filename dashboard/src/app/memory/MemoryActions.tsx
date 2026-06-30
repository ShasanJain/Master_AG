"use client";

import { useFormStatus } from "react-dom";

export function SyncButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold uppercase tracking-widest text-xs rounded transition-all ${
        pending 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-emerald-500 hover:text-black"
      }`}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Syncing...
        </span>
      ) : (
        "Sync Knowledge"
      )}
    </button>
  );
}

export function ForgetButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`text-[10px] font-bold uppercase tracking-widest text-red-500/20 shiny-button bg-red-500/5 px-3 py-1 rounded transition-colors ${
        pending ? "opacity-50" : "hover:text-red-500"
      }`}
    >
      {pending ? "Forgetting..." : "Forget Trace"}
    </button>
  );
}

export function ConfirmForm({ action, children, confirmMessage }: { action: any, children: React.ReactNode, confirmMessage: string }) {
  return (
    <form 
      action={action} 
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
