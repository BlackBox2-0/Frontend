"use client";

import { motion } from "framer-motion";
import { Clock, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { getAuditLog, getIncidentActions, type AuditLogEntry, type IncidentActionResult } from "../../lib/backend";

type ThreatStat = {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  trend: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: string;
  trendTone?: string;
  valueTone?: string;
  data: number[];
};

export default function ThreatStatsRow() {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [incidentActions, setIncidentActions] = useState<IncidentActionResult[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [auditResult, actionsResult] = await Promise.allSettled([getAuditLog(), getIncidentActions()]);
      if (cancelled) return;

      if (auditResult.status === "fulfilled") {
        setAuditEntries(auditResult.value);
      }

      if (actionsResult.status === "fulfilled") {
        setIncidentActions(actionsResult.value);
      }
    }

    loadData();
    const intervalId = window.setInterval(loadData, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const stats = useMemo(() => buildThreatStats(auditEntries, incidentActions), [auditEntries, incidentActions]);

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <ThreatStatCard key={stat.label} stat={stat} />
      ))}
    </motion.section>
  );
}

function buildThreatStats(auditEntries: AuditLogEntry[], incidentActions: IncidentActionResult[]): ThreatStat[] {
  const totalThreats = auditEntries.length;
  const blockedByEngine = auditEntries.filter((entry) => String(entry.decision).toUpperCase() === "BLOCK").length;
  const escalated = auditEntries.filter((entry) => String(entry.decision).toUpperCase() === "ESCALATE").length;
  const avgRisk = totalThreats
    ? auditEntries.reduce((sum, entry) => sum + Number(entry.risk_score || 0), 0) / totalThreats
    : 0;

  const approved = incidentActions.filter((action) => action.status === "APPROVED").length;
  const blocked = incidentActions.filter((action) => action.status === "BLOCKED").length;
  const pending = incidentActions.filter((action) => action.status === "PENDING_APPROVAL").length;
  const assigned = incidentActions.filter((action) => action.status === "ASSIGNED").length;
  const active = pending + assigned;
  const totalIncidents = incidentActions.length;
  const approvalRate = totalIncidents ? (approved / totalIncidents) * 100 : 0;
  const blockRate = totalIncidents ? (blocked / totalIncidents) * 100 : 0;

  const blockedTotal = blockedByEngine + blocked;
  const decisionsClosed = approved + blocked;

  return [
    {
      label: "Threats Detected",
      value: totalThreats.toLocaleString(),
      sub: "Audit events",
      trend: `${escalated} escalated for approval`,
      icon: ShieldAlert,
      tone: "var(--alert-red)",
      data: sparklineFromCounts(totalThreats, 12),
    },
    {
      label: "Blocked Attacks",
      value: blockedTotal.toLocaleString(),
      sub: "Engine + human block",
      trend: `${blockRate.toFixed(1)}% human block rate`,
      icon: ShieldCheck,
      tone: "var(--ok-green)",
      valueTone: "var(--ok-green)",
      data: sparklineFromCounts(blockedTotal, 12),
    },
    {
      label: "Decision Closure",
      value: approvalRate.toFixed(1),
      unit: "%",
      sub: `${decisionsClosed}/${totalIncidents} fully resolved`,
      trend: `${approved} approved · ${blocked} blocked`,
      icon: Clock,
      tone: "var(--glow-cyan)",
      valueTone: "var(--glow-cyan)",
      data: sparklineFromCounts(Math.round(approvalRate), 10),
    },
    {
      label: "Investigations",
      value: active.toLocaleString(),
      sub: "Open cases",
      trend: `${pending} pending final approval · avg risk ${(avgRisk * 100).toFixed(0)}%`,
      icon: Search,
      tone: "var(--glow-purple)",
      trendTone: "var(--alert-orange)",
      data: sparklineFromCounts(active, 12),
    },
  ];
}

function sparklineFromCounts(latest: number, points: number) {
  return Array.from({ length: points }, (_, index) => {
    const base = Math.max(0, latest - (points - index - 1));
    return Math.max(0, base);
  });
}

function ThreatStatCard({ stat }: { stat: ThreatStat }) {
  const Icon = stat.icon;
  const [mounted, setMounted] = useState(false);
  const chartData = stat.data.map((value, index) => ({ index, value }));
  const trendTone = stat.trendTone ?? stat.tone;

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="bb-card group relative flex min-h-[220px] flex-col overflow-hidden px-6 py-5 hover:-translate-y-0.5"
    >
      <div
        aria-hidden="true"
        className="absolute right-[-18px] top-[-22px] size-20 rounded-full blur-[22px]"
        style={{ background: `color-mix(in srgb, ${stat.tone} 10%, transparent)` }}
      />
      <div className="relative z-10 flex flex-1 flex-col">
        <Icon aria-hidden className="mb-4 size-[18px]" style={{ color: stat.tone }} />
        <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          {stat.label}
        </p>
        <div className="mt-2 flex items-end gap-2">
          <span
            className="font-heading text-[40px] font-extrabold leading-none text-white"
            style={{ color: stat.valueTone ?? "var(--text-primary)" }}
          >
            {stat.value}
          </span>
          {stat.unit ? (
            <span className="pb-1 font-body text-base text-[var(--text-muted)]">{stat.unit}</span>
          ) : null}
        </div>
        {stat.sub ? <p className="mt-2 font-mono text-[10px] text-[var(--text-muted)]">{stat.sub}</p> : null}
        <span
          className="mt-4 inline-flex w-fit rounded px-2.5 py-1 font-mono text-[10px]"
          style={{
            background: `color-mix(in srgb, ${trendTone} 13%, transparent)`,
            color: trendTone,
          }}
        >
          {stat.trend}
        </span>
        <div className="mt-auto h-10 w-full pt-3">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={stat.tone}
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={false}
                  isAnimationActive
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
