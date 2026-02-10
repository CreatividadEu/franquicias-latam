import { ReactNode } from "react";

interface ChatShellProps {
  children: ReactNode;
}

export function ChatShell({ children }: ChatShellProps) {
  return (
    <div className="min-h-screen bg-neutral-50 py-4 px-4 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
