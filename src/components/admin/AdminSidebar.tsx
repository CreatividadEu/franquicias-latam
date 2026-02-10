"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/franchises", label: "Franquicias", icon: "🏢" },
  { href: "/quiz", label: "Ver Quiz", icon: "💬" },
];

async function handleLogout() {
  try {
    await fetch("/api/admin/logout", { method: "POST" });
  } finally {
    window.location.href = "/admin/login";
  }
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-2 flex items-center justify-between shadow-lg">
        <div>
          <Image src="/logo_latam/franquicias_latam_logo.png" alt="Franquicias LATAM" width={480} height={120} className="h-[4.8rem] w-auto brightness-0 invert" />
          <p className="text-gray-400 text-[10px] mt-0.5">Panel Admin</p>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
        >
          <span className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Nav Drawer */}
      <div
        className={cn(
          "md:hidden fixed top-[44px] left-0 right-0 z-40 bg-gray-900 shadow-xl transition-all duration-200",
          mobileOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <nav className="p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>🚪</span> Cerrar sesion
          </button>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 hidden md:block relative">
        <div className="mb-8">
          <Image src="/logo_latam/franquicias_latam_logo.png" alt="Franquicias LATAM" width={640} height={160} className="h-[6.4rem] w-auto brightness-0 invert" />
          <p className="text-gray-400 text-xs mt-1">Panel Admin</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4">
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            <span>🚪</span> Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Mobile spacer */}
      <div className="md:hidden h-[44px]" />
    </>
  );
}
