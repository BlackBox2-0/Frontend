"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Cpu, ShieldAlert, TrendingUp } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  getAgentsDashboard,
  getAuditLog,
  getIncidentSummary,
  type AgentsDashboardResponse,
  type AuditLogEntry,
  type IncidentSummary,
} from "../../lib/backend";

type KPI = {
  label: string;
  value: string;
  unit?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: string;
  valueClass?: string;
  pill: string;
  subLabel?: string;
  agents?: boolean;
  progress?: boolean;
  sparkline: number[];
};

export default function KPICards() {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [agentsDashboard, setAgentsDashboard] = useState<AgentsDashboardResponse | null>(null);
  const [incidentSummary, setIncidentSummary] = useState<IncidentSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [auditResult, agentsResult, incidentsResult] = await Promise.allSettled([
        getAuditLog(),
        getAgentsDashboard(),
        getIncidentSummary(),
      ]);

      if (cancelled) return;
      if (auditResult.status === "fulfilled") setAuditEntries(auditResult.value);
      if (agentsResult.status === "fulfilled") setAgentsDashboard(agentsResult.value);
      if (incidentsResult.status === "fulfilled") setIncidentSummary(incidentsResult.value);
    }

    loadData();
    const intervalId = window.setInterval(loadData, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const cards = useMemo(() => buildCards(auditEntries, agentsDashboard, incidentSummary), [auditEntries, agentsDashboard, incidentSummary]);

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
    >
      {cards.map((card) => (
        <KPICard key={card.label} card={card} />
      ))}
    </motion.section>
  );
}

function KPICard({ card }: { card: KPI }) {
  const Icon = card.icon;

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="bb-card group relative flex min-h-[226px] flex-col overflow-hidden px-6 py-5 hover:-translate-y-0.5"
    >
      <div
        aria-hidden="true"
        className="absolute right-[-20px] top-[-22px] size-20 rounded-full blur-[20px]"
        style={{ background: `color-mix(in srgb, ${card.tone} 8%, transparent)` }}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <Icon aria-hidden className="mb-4 size-[18px]" style={{ color: card.tone }} />
        <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          {card.label}
        </p>
        <div className="mt-2 flex items-start gap-1">
          <span
            className={[
              "font-heading text-[42px] font-extrabold leading-none text-[var(--text-primary)]",
              card.valueClass ?? "",
            ].join(" ")}
          >
            {card.value}
          </span>
          {card.unit ? (
            <span className="mt-2 font-heading text-xl text-[var(--text-muted)]">{card.unit}</span>
          ) : null}
        </div>

        {card.agents ? <AgentDots /> : null}
        {card.progress ? <IncidentProgress /> : null}

        {card.pill ? (
          <span
            className="mt-4 inline-flex rounded px-2.5 py-1 font-mono text-[11px]"
            style={{
              background: `color-mix(in srgb, ${card.tone} 10%, transparent)`,
              color: card.tone,
            }}
          >
            {card.pill}
          </span>
        ) : null}
        {card.subLabel ? (
          <p className="mt-2 font-mono text-[10px] text-[var(--text-muted)]">{card.subLabel}</p>
        ) : null}
        <Sparkline data={card.sparkline} color={card.tone} />
      </div>
    </motion.article>
  );
}

function buildCards(
  auditEntries: AuditLogEntry[],
  agentsDashboard: AgentsDashboardResponse | null,
  incidentSummary: IncidentSummary | null,
): KPI[] {
  const activeThreats = auditEntries.filter((entry) => {
    const decision = String(entry.decision).toUpperCase();
    return decision === "BLOCK" || decision === "ESCALATE";
  }).length;
  const avgRisk = auditEntries.length
    ? auditEntries.reduce((sum, entry) => sum + Number(entry.risk_score || 0), 0) / auditEntries.length
    : 0;
  const trustScore = Math.max(0, Math.min(100, 100 - avgRisk * 100));
  const riskIndex = Math.round(avgRisk * 100);
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
  const totalAgents = agentsDashboard?.summary.total_agents ?? 0;
  const activeAgents = agentsDashboard?.summary.active_agents ?? 0;
  const idleAgents = Math.max(0, totalAgents - activeAgents);
  const threatsDelta = activeThreats > 0 ? `+${activeThreats} from audit log` : "No active threats";

  return [
    {
      label: "ACTIVE THREATS",
      value: String(activeThreats),
      icon: ShieldAlert,
      tone: "var(--alert-red)",
      pill: threatsDelta,
      sparkline: sparkline(activeThreats, 10),
    },
    {
      label: "TRUST SCORE",
      value: trustScore.toFixed(1),
      unit: "%",
      icon: CheckCircle,
      tone: "var(--glow-cyan)",
      valueClass: "text-[var(--glow-cyan)]",
      pill: `${summary.approved} approvals completed`,
      sparkline: sparkline(Math.round(trustScore), 10),
    },
    {
      label: "RISK INDEX",
      value: String(riskIndex),
      icon: TrendingUp,
      tone: "var(--alert-orange)",
      valueClass: "text-[var(--alert-orange)]",
      pill: riskLabel(riskIndex),
      subLabel: "threshold: 60",
      sparkline: sparkline(riskIndex, 10),
    },
    {
      label: "AI AGENTS",
      value: String(totalAgents),
      icon: Cpu,
      tone: "var(--glow-purple)",
      pill: `${activeAgents} running · ${idleAgents} idle`,
      agents: true,
      sparkline: sparkline(activeAgents, 10),
    },
    {
      label: "INCIDENTS TODAY",
      value: String(summary.total),
      icon: AlertTriangle,
      tone: "var(--alert-yellow)",
      pill: "",
      progress: true,
      sparkline: sparkline(summary.total, 10),
    },
  ];
}

function riskLabel(riskIndex: number) {
  if (riskIndex >= 80) return "HIGH RISK";
  if (riskIndex >= 60) return "ELEVATED RISK";
  if (riskIndex >= 35) return "MODERATE RISK";
  return "LOW RISK";
}

function sparkline(latest: number, points: number) {
  return Array.from({ length: points }, (_, index) => Math.max(0, latest - (points - index - 1)));
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const [mounted, setMounted] = useState(false);
  const chartData = data.map((value, index) => ({ index, value }));

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="mt-auto h-10 w-full pt-3">
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={color}
              fillOpacity={0.06}
              dot={false}
              activeDot={false}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

function AgentDots() {
  return (
    <div className="mt-4 flex gap-1.5">
      {Array.from({ length: 7 }, (_, index) => (
        <span
          key={index}
          className={[
            "size-2 rounded-full",
            index < 5
              ? "animate-[bb-agent-pulse_1.4s_ease-in-out_infinite] bg-[var(--glow-purple)] shadow-[0_0_6px_var(--glow-purple)]"
              : "bg-[var(--bb-idle)]",
          ].join(" ")}
          style={{ animationDelay: `${index * 0.12}s` }}
        />
      ))}
    </div>
  );
}

function IncidentProgress() {
  const [incidentSummary, setIncidentSummary] = useState<IncidentSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const summary = await getIncidentSummary();
        if (!cancelled) {
          setIncidentSummary(summary);
        }
      } catch {
        if (!cancelled) {
          setIncidentSummary(null);
        }
      }
    }

    loadSummary();
    const intervalId = window.setInterval(loadSummary, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const resolved = (incidentSummary?.approved ?? 0) + (incidentSummary?.blocked ?? 0);
  const open = incidentSummary?.active ?? 0;
  const total = Math.max(1, resolved + open);
  const resolvedWidth = `${(resolved / total) * 100}%`;

  return (
    <div className="mt-3">
      <p className="font-mono text-xs">
        <span className="text-[var(--text-muted)]">{resolved} resolved</span>
        <span className="px-2 text-[color-mix(in_srgb,var(--text-muted)_45%,transparent)]">·</span>
        <span className="text-[var(--alert-red)]">{open} open</span>
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--text-primary)_6%,transparent)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: resolvedWidth }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--alert-yellow)] to-[var(--alert-red)]"
        />
      </div>
    </div>
  );
}
