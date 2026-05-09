"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DashboardHeader() {
  const [secondsAgo, setSecondsAgo] = useState(2);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsAgo((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex w-full flex-col justify-between gap-5 lg:flex-row lg:items-end"
    >
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--glow-cyan)]">
          Operational Intelligence
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-[var(--text-primary)]">
          Security Overview
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Real-time monitoring · Last updated {secondsAgo}s ago
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-md border border-[color-mix(in_srgb,var(--glow-blue)_20%,transparent)] bg-[color-mix(in_srgb,var(--bg-surface)_80%,transparent)] px-[14px] py-1.5 font-mono text-[11px] text-[var(--text-secondary)]">
          MON 09 · MAY · 2026
        </div>
        <button
          type="button"
          className="rounded-md border border-[var(--glow-blue)] bg-transparent px-4 py-2 font-body text-xs font-semibold text-[var(--glow-blue-light)] shadow-[0_0_12px_color-mix(in_srgb,var(--glow-blue)_30%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--glow-blue)_10%,transparent)]"
        >
          Generate Report
        </button>
        <button
          type="button"
          className="rounded-md bg-[var(--glow-blue)] px-4 py-2 font-body text-xs font-bold text-[var(--text-primary)] shadow-[0_0_20px_color-mix(in_srgb,var(--glow-blue)_40%,transparent)] transition hover:bg-[var(--glow-blue-strong)]"
        >
          New Investigation
        </button>
      </div>
    </motion.header>
  );
}
