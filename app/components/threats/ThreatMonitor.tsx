"use client";

import { motion } from "framer-motion";
import ActiveAlerts from "./ActiveAlerts";
import AttackVectorChart from "./AttackVectorChart";
import ThreatFeed from "./ThreatFeed";
import ThreatStatsRow from "./ThreatStatsRow";
import ThreatTimeline from "./ThreatTimeline";

export default function ThreatMonitor() {
  return (
    <div className="text-[var(--text-primary)]">
      <ThreatMonitorHeader />
      <ThreatStatsRow />
      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[60fr_40fr]">
        <ThreatFeed />
        <div className="grid gap-5">
          <AttackVectorChart />
          <ActiveAlerts />
        </div>
      </section>
      <ThreatTimeline />
    </div>
  );
}

function ThreatMonitorHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex w-full flex-col justify-between gap-5 lg:flex-row lg:items-end"
    >
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--alert-red)]">
          Threat Intelligence
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-white">
          Threat Monitor
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Active surveillance · 847 events today
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--alert-red)]">
          <span className="size-2 rounded-full bg-[var(--alert-red)] shadow-[0_0_10px_rgba(239,68,68,0.85)] animate-[bb-live-pulse_1.5s_ease-in-out_infinite]" />
          3 Critical Alerts
        </div>
        <button
          type="button"
          className="rounded-md border border-[var(--glow-blue)] bg-transparent px-4 py-2 font-body text-xs font-semibold text-[var(--glow-blue-light)] shadow-[0_0_12px_color-mix(in_srgb,var(--glow-blue)_24%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--glow-blue)_10%,transparent)] hover:shadow-[0_0_18px_color-mix(in_srgb,var(--glow-blue)_34%,transparent)]"
        >
          Export Logs
        </button>
        <button
          type="button"
          className="rounded-md bg-[var(--alert-red)] px-4 py-2 font-body text-xs font-bold text-white shadow-[0_0_16px_rgba(239,68,68,0.18)] transition hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        >
          New Alert Rule
        </button>
      </div>
    </motion.header>
  );
}
