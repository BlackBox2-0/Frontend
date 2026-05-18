"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  Brain,
  Cpu,
  FileChartColumn,
  Grid3X3,
  Link2,
  Search,
  ShieldAlert,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Grid3X3, href: "/" },
  { label: "Threat Monitor", icon: ShieldAlert, href: "/threat-monitor" },
  { label: "Simulation", icon: Zap, href: "/simulation" },
  { label: "AI Agents", icon: Cpu, href: "/ai-agents" },
  { label: "Company", icon: Building2, href: "/company" },
  { label: "Behavioral Intel", icon: Brain, href: "/behavioral-intel" },
  { label: "Blockchain", icon: Link2, href: "/blockchain" },
  { label: "Reports", icon: FileChartColumn, href: "/reports" },
];

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const currentPage = navItems.find((item) => item.href === pathname)?.label ?? "Dashboard";
  const isBlockchain = pathname === "/blockchain";

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-[rgba(123,47,255,0.15)] bg-[var(--bg-surface)]">
        <div className="px-4 pt-5">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <img
              src="/logo.png"
              alt="BlackBooks"
              className="size-9 object-contain drop-shadow-[0_0_8px_rgba(123,47,255,0.6)]"
            />
            <div className="font-heading text-[16px] font-extrabold tracking-[0.05em]">
              <span className="text-white">BLACK</span>
              <span className="text-[var(--glow-purple)]">BOOKS</span>
            </div>
          </div>
          <div className="mt-5 h-px bg-[var(--border-primary)] shadow-[0_0_8px_rgba(123,47,255,0.45)]" />
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-1 px-3 font-body">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = item.href === pathname;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.28, ease: "easeOut" }}
              >
                <Link
                  href={item.href}
                className={[
                  "group flex h-11 items-center gap-3 rounded-r-lg border-l-2 px-3 text-sm transition-colors",
                  active
                    ? "border-[var(--glow-purple)] bg-[rgba(123,47,255,0.12)] text-white"
                    : "border-transparent text-[var(--text-muted)] hover:bg-white/[0.03] hover:text-[var(--text-secondary)]",
                ].join(" ")}
                  aria-current={active ? "page" : undefined}
              >
                <Icon
                  aria-hidden="true"
                  className={[
                    "size-4 transition",
                    active
                      ? "text-[var(--glow-violet)] drop-shadow-[0_0_7px_rgba(155,92,246,0.95)]"
                      : "text-current group-hover:text-[var(--glow-violet-light)]",
                  ].join(" ")}
                />
                <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="border-t border-[rgba(123,47,255,0.12)] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[rgba(123,47,255,0.06)] p-3">
            <div className="relative flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--glow-purple)] to-[var(--glow-violet)] font-heading text-sm font-bold">
              AR
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[var(--bg-surface)] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="min-w-0 font-body">
              <p className="truncate text-sm font-semibold text-white">Alejandro Reyes</p>
              <p className="truncate text-xs text-[var(--text-muted)]">Security Analyst</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen pl-[240px]">
        <header className="fixed left-[240px] right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-[rgba(123,47,255,0.15)] bg-[rgba(13,11,26,0.9)] px-6 backdrop-blur-[20px]">
          <div className="font-body text-sm text-[var(--text-muted)]">
            <span className="text-[var(--text-secondary)]">BlackBooks</span>
            <span className="px-2 text-[rgba(148,163,184,0.5)]">/</span>
            <span className="text-white">{currentPage}</span>
          </div>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-[rgba(123,47,255,0.3)] bg-[rgba(123,47,255,0.1)] px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-[var(--text-secondary)] shadow-[0_0_16px_rgba(123,47,255,0.12)] md:flex">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            ALL SYSTEMS OPERATIONAL
          </div>

          <div className="flex items-center gap-3">
            <label className="group flex h-10 w-[260px] items-center gap-2 rounded-full border border-[rgba(123,47,255,0.16)] bg-white/[0.04] px-4 transition focus-within:border-[rgba(123,47,255,0.65)] focus-within:shadow-[0_0_16px_rgba(123,47,255,0.16)]">
              <Search aria-hidden="true" className="size-4 text-[var(--text-muted)]" />
              <input
                type="search"
                aria-label="Search"
                placeholder="Search threats, hashes, IDs"
                className="min-w-0 flex-1 bg-transparent font-body text-sm text-white outline-none placeholder:text-[var(--text-muted)]"
              />
            </label>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-full border border-[rgba(123,47,255,0.14)] bg-white/[0.04] text-[var(--text-secondary)] transition hover:border-[rgba(123,47,255,0.32)] hover:text-white"
            >
              <Bell aria-hidden="true" className="size-4" />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--alert-red)] font-mono text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.65)]">
                3
              </span>
            </button>
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--glow-purple)] via-[var(--glow-violet)] to-[var(--glow-cyan)] font-heading text-sm font-bold text-white">
              AR
            </div>
          </div>
        </header>

        <main className={`blackbooks-main relative h-screen pt-16 ${isBlockchain ? "overflow-hidden" : "overflow-y-auto"}`}>
          {isBlockchain ? children : <div className="relative z-10 p-6">{children}</div>}
        </main>
      </div>
    </div>
  );
}
