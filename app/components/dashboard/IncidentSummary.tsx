"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getAuditLog, getIncidentSummary, type AuditLogEntry, type IncidentSummary as IncidentSummaryType } from "../../lib/backend";

export default function IncidentSummary() {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [incidentSummary, setIncidentSummary] = useState<IncidentSummaryType | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [auditResult, summaryResult] = await Promise.allSettled([getAuditLog(), getIncidentSummary()]);
      if (cancelled) return;
      if (auditResult.status === "fulfilled") setAuditEntries(auditResult.value);
      if (summaryResult.status === "fulfilled") setIncidentSummary(summaryResult.value);
    }

    loadData();
    const intervalId = window.setInterval(loadData, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const incidents = useMemo(() => {
    const critical = auditEntries.filter((entry) => String(entry.decision).toUpperCase() === "BLOCK").length;
    const high = auditEntries.filter((entry) => String(entry.decision).toUpperCase() === "ESCALATE").length;
    const medium = auditEntries.filter((entry) => {
      const risk = Number(entry.risk_score || 0);
      return risk >= 0.35 && risk < 0.8 && String(entry.decision).toUpperCase() !== "ESCALATE";
    }).length;
    const resolved = (incidentSummary?.approved ?? 0) + (incidentSummary?.blocked ?? 0);

    return [
      {
        label: "CRITICAL",
        count: String(critical),
        subtext: "Blocked by engine or policy",
        color: "var(--alert-red)",
      },
      {
        label: "HIGH",
        count: String(high),
        subtext: "Pending human approval",
        color: "var(--alert-orange)",
      },
      {
        label: "MEDIUM",
        count: String(medium),
        subtext: "Observed in monitored activity",
        color: "var(--alert-yellow)",
      },
      {
        label: "RESOLVED TODAY",
        count: String(resolved),
        subtext: "Approved or blocked by company",
        color: "var(--ok-green)",
      },
    ];
  }, [auditEntries, incidentSummary]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="bb-card mt-5 grid min-h-[72px] grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {incidents.map((incident, index) => (
        <div
          key={incident.label}
          className={[
            "flex items-center justify-between gap-4",
            index > 0 ? "xl:border-l xl:border-[var(--bb-divider)] xl:pl-6" : "",
          ].join(" ")}
        >
          <div className="min-w-0">
            <p
              className="font-body text-[9px] uppercase tracking-[0.15em]"
              style={{ color: incident.color }}
            >
              {incident.label}
            </p>
            <p className="mt-1 truncate font-body text-[10px] text-[var(--text-muted)]">
              {incident.subtext}
            </p>
          </div>
          <span className="font-heading text-2xl font-extrabold leading-none" style={{ color: incident.color }}>
            {incident.count}
          </span>
        </div>
      ))}
    </motion.section>
  );
}
