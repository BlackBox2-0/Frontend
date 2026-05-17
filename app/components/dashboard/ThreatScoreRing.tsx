"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { getAuditLog, getIncidentSummary, type AuditLogEntry, type IncidentSummary } from "../../lib/backend";

const radius = 90;
const circumference = 2 * Math.PI * radius;

export default function ThreatScoreRing() {
  const [mounted, setMounted] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [incidentSummary, setIncidentSummary] = useState<IncidentSummary | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

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

  const { score, pills, trendData, riskLabel } = useMemo(
    () => buildThreatScoreData(auditEntries, incidentSummary),
    [auditEntries, incidentSummary],
  );
  const offset = circumference * (1 - score / 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
      className="bb-card relative min-h-80 overflow-hidden p-7"
    >
      <div className="relative z-10">
        <p className="font-body text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          Threat Score
        </p>
        <p className="mt-1 font-body text-xs text-[var(--text-dim)]">Composite intelligence index</p>
      </div>

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[54%] size-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(123,47,255,0.15),transparent_68%)] blur-[40px]"
      />

      <div className="relative z-10 mx-auto mt-5 flex size-60 items-center justify-center">
        <svg aria-hidden="true" viewBox="0 0 240 240" className="absolute inset-0 size-full -rotate-90">
          <defs>
            <linearGradient id="blueGradient" x1="30" x2="210" y1="30" y2="210">
              <stop stopColor="var(--glow-purple)" />
              <stop offset="1" stopColor="var(--glow-cyan)" />
            </linearGradient>
          </defs>
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="rgba(123,47,255,0.1)"
            strokeWidth="8"
          />
          <motion.circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="url(#blueGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="text-center">
          <div className="flex items-end justify-center gap-1">
            <span className="font-heading text-[52px] font-extrabold leading-none text-[var(--text-primary)]">
              {score}
            </span>
            <span className="mb-2 font-body text-sm text-[var(--text-muted)]">/ 100</span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--alert-red)]">
            {riskLabel}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap justify-center gap-2">
        {pills.map((pill) => (
          <span
            key={pill.label}
            className="rounded px-2.5 py-1 font-mono text-[10px]"
            style={{
              background: `color-mix(in srgb, ${pill.color} 10%, transparent)`,
              color: pill.color,
            }}
          >
            {pill.label} {pill.value}
          </span>
        ))}
      </div>

      <div className="relative z-10 mt-5 h-20 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={trendData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <Area
                type="monotone"
                dataKey="i"
                stroke="var(--glow-purple)"
                strokeWidth={1.5}
                fill="var(--glow-purple)"
                fillOpacity={0.15}
                dot={false}
                isAnimationActive
              />
              <Area
                type="monotone"
                dataKey="e"
                stroke="var(--glow-blue)"
                strokeWidth={1.5}
                fill="var(--glow-blue)"
                fillOpacity={0.15}
                dot={false}
                isAnimationActive
              />
              <Area
                type="monotone"
                dataKey="b"
                stroke="var(--alert-orange)"
                strokeWidth={1.5}
                fill="var(--alert-orange)"
                fillOpacity={0.15}
                dot={false}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <p className="relative z-10 mt-1 text-center font-mono text-[9px] text-[var(--text-dim)]">
        12h threat trend
      </p>
    </motion.article>
  );
}

function buildThreatScoreData(auditEntries: AuditLogEntry[], incidentSummary: IncidentSummary | null) {
  const summary = incidentSummary ?? {
    total: 0,
    approved: 0,
    blocked: 0,
    pending: 0,
    assigned: 0,
    active: 0,
    approval_rate: 0,
    block_rate: 0,
  };
  const byDepartment = auditEntries.reduce<Record<string, number>>((acc, entry) => {
    const key = String(entry.department || "Other");
    acc[key] = (acc[key] ?? 0) + Number(entry.risk_score || 0) * 100;
    return acc;
  }, {});

  const avgRisk = auditEntries.length
    ? auditEntries.reduce((sum, entry) => sum + Number(entry.risk_score || 0), 0) / auditEntries.length
    : 0;
  const score = Math.max(0, Math.min(100, Math.round(avgRisk * 100)));

  const internal = Math.round((byDepartment.Finance ?? 0) / Math.max(1, auditEntries.filter((entry) => entry.department === "Finance").length || 1)) || score;
  const external = Math.round((byDepartment.Security ?? 0) / Math.max(1, auditEntries.filter((entry) => entry.department === "Security").length || 1)) || Math.max(0, score - 8);
  const behavioral = Math.round(summary.pending * 10 + avgRisk * 40) || Math.max(0, score - 12);

  return {
    score,
    riskLabel: score >= 80 ? "CRITICAL RISK" : score >= 60 ? "HIGH RISK" : score >= 35 ? "ELEVATED RISK" : "LOW RISK",
    pills: [
      { label: "INTERNAL", value: String(Math.min(100, internal)), color: "var(--glow-violet)" },
      { label: "EXTERNAL", value: String(Math.min(100, external)), color: "var(--glow-blue-mid)" },
      { label: "BEHAVIORAL", value: String(Math.min(100, behavioral)), color: "var(--alert-orange)" },
    ],
    trendData: buildTrendData(score, internal, external, behavioral),
  };
}

function buildTrendData(score: number, internal: number, external: number, behavioral: number) {
  return Array.from({ length: 12 }, (_, index) => ({
    t: String(index * 2).padStart(2, "0"),
    i: Math.max(0, Math.min(100, internal - 8 + index)),
    e: Math.max(0, Math.min(100, external - 6 + Math.floor(index * 0.8))),
    b: Math.max(0, Math.min(100, behavioral - 10 + Math.floor(index * 0.7))),
    s: Math.max(0, Math.min(100, score - 7 + index)),
  }));
}
