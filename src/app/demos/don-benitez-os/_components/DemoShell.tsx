"use client";

import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { CommandBar } from "./CommandBar";

export function DemoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-fl-base text-fl-text">
      <div className="flex items-center justify-between gap-3 border-b border-fl-border bg-fl-base px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-fl-teal/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-fl-teal">
            Vista demo
          </span>
          <span className="text-fl-muted">Don Benítez · Powered by FranquiciaOS</span>
        </div>
        <Link
          href="/#contact"
          className="rounded-md border border-fl-teal/40 px-3 py-1 text-fl-teal hover:bg-fl-teal/10"
        >
          Agendar llamada
        </Link>
      </div>

      <div className="flex min-h-[calc(100vh-36px)]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
      <CommandBar />
    </div>
  );
}

function Topbar() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-fl-border bg-fl-base/85 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-fl-teal to-fl-purple" />
        <div>
          <p className="text-sm font-semibold leading-tight text-fl-text">Don Benítez OS</p>
          <p className="text-[10px] uppercase tracking-wider text-fl-muted">10 puntos · consolidado</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true });
            window.dispatchEvent(ev);
          }}
          className="flex items-center gap-2 rounded-md border border-fl-border bg-fl-surface px-3 py-1.5 text-xs text-fl-muted hover:border-fl-teal/30 hover:text-fl-teal"
        >
          <span>Buscar, navegar, preguntar…</span>
          <kbd className="rounded border border-fl-border px-1 py-0.5 text-[10px]">⌘K</kbd>
        </button>
      </div>
    </div>
  );
}
