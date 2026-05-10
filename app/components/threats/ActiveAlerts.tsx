"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Alert = {
  id: string;
  title: string;
  summary: string;
  time: string;
  description: string;
  assignee: string;
  tone: string;
  bg: string;
  border: string;
};

const alerts: Alert[] = [
  {
    id: "critical",
    title: "Critical Security Alert",
    summary: "Critical Security Alert",
    time: "2 min ago",
    description: "SQL injection attack detected on AUTH-API-01. Immediate action required.",
    assignee: "AI Agent-01",
    tone: "var(--alert-red)",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.2)",
  },
  {
    id: "exfiltration",
    title: "Data Exfiltration Alert",
    summary: "Data exfiltration in progress",
    time: "12 min ago",
    description: "Large outbound transfer detected from Finance storage to an external endpoint.",
    assignee: "AI Agent-03",
    tone: "var(--alert-orange)",
    bg: "rgba(249,115,22,0.06)",
    border: "rgba(249,115,22,0.2)",
  },
  {
    id: "privilege",
    title: "Privilege Escalation Alert",
    summary: "Privilege escalation attempt",
    time: "18 min ago",
    description: "Admin panel access attempt exceeded role boundary for the current session.",
    assignee: "AI Agent-02",
    tone: "var(--alert-orange)",
    bg: "rgba(249,115,22,0.06)",
    border: "rgba(249,115,22,0.2)",
  },
];

export default function ActiveAlerts() {
  const [openAlert, setOpenAlert] = useState("critical");

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut", delay: 0.12 }}
      className="bb-card min-h-[420px] p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-body text-sm font-semibold text-white">Active Alerts</h2>
        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--alert-red)] font-mono text-[11px] font-bold text-white">
          3
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {alerts.map((alert) => {
          const expanded = openAlert === alert.id;

          return (
            <div
              key={alert.id}
              className="rounded-[10px] border p-3.5"
              style={{ background: alert.bg, borderColor: alert.border }}
            >
              <button
                type="button"
                onClick={() => setOpenAlert(expanded ? "" : alert.id)}
                className="flex w-full items-center gap-3 text-left transition hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.18)]"
              >
                <span className="min-w-0 flex-1 font-body text-[13px] font-semibold text-white">
                  {expanded ? alert.title : `${alert.summary} · ${alert.time}`}
                </span>
                {expanded ? (
                  <time className="font-mono text-[10px] text-[var(--text-muted)]">{alert.time}</time>
                ) : null}
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-[var(--text-muted)] transition"
                  style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 font-body text-xs leading-5 text-[var(--text-secondary)]">
                      {alert.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md px-3 py-1.5 font-body text-xs font-semibold text-white transition hover:shadow-[0_0_16px_rgba(239,68,68,0.32)]"
                        style={{ background: alert.tone }}
                      >
                        Isolate System
                      </button>
                      <button
                        type="button"
                        className="rounded-md border px-3 py-1.5 font-body text-xs font-semibold transition hover:bg-white/[0.03]"
                        style={{ borderColor: alert.tone, color: alert.tone }}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-[var(--bb-idle)] px-3 py-1.5 font-body text-xs font-semibold text-[var(--text-muted)] transition hover:bg-white/[0.03] hover:text-white"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="mt-4 font-mono text-[10px] text-[var(--text-muted)]">
                      Assigned to: {alert.assignee}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
}
