"use client";

import { motion } from "framer-motion";
import { Brain, Database, Hexagon, ServerCog } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  getAgentsDashboard,
  getAuditLog,
  getHealth,
  type AgentsDashboardResponse,
  type AuditLogEntry,
  type HealthResponse,
} from "../../lib/backend";

type RiskUser = { initials: string; name: string; role: string; score: number; color: string };
type SystemStatus = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  status: string;
  latency: string;
  color: string;
  pulse?: boolean;
};
type AgentSlice = { name: string; value: number; color: string };
type AgentRow = { name: string; color: string; badge: string; badgeColor: string; task: string };

export default function BottomStats() {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [agentsDashboard, setAgentsDashboard] = useState<AgentsDashboardResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [auditResult, agentsResult, healthResult] = await Promise.allSettled([
        getAuditLog(),
        getAgentsDashboard(),
        getHealth(),
      ]);

      if (cancelled) return;
      if (auditResult.status === "fulfilled") setAuditEntries(auditResult.value);
      if (agentsResult.status === "fulfilled") setAgentsDashboard(agentsResult.value);
      if (healthResult.status === "fulfilled") setHealth(healthResult.value);
    }

    loadData();
    const intervalId = window.setInterval(loadData, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const users = useMemo(() => buildRiskUsers(auditEntries), [auditEntries]);
  const systems = useMemo(() => buildSystems(health, agentsDashboard), [health, agentsDashboard]);
  const agentData = useMemo(() => buildAgentData(agentsDashboard), [agentsDashboard]);
  const agentRows = useMemo(() => buildAgentRows(agentsDashboard), [agentsDashboard]);

  return (
    <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
      <TopRiskUsers users={users} />
      <SystemHealth systems={systems} />
      <AgentSummary agentData={agentData} agentRows={agentRows} totalAgents={agentsDashboard?.summary.total_agents ?? 0} activeAgents={agentsDashboard?.summary.active_agents ?? 0} />
    </section>
  );
}

function TopRiskUsers({ users }: { users: RiskUser[] }) {
  return (
    <StatsCard>
      <Header title="Top Risk Users" pill="This week" />
      <div className="mt-5 space-y-4">
        {users.map((user, index) => (
          <div key={user.name} className="grid grid-cols-[32px_minmax(0,1fr)_86px_28px] items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--glow-purple)] to-[var(--glow-blue)] font-heading text-[11px] font-bold text-[var(--text-primary)]">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-body text-sm text-[var(--text-primary)]">{user.name}</p>
              <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">{user.role}</p>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--text-primary)_6%,transparent)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${user.score}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.08 }}
                className="h-full rounded-full"
                style={{ background: user.color }}
              />
            </div>
            <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">{user.score}</span>
          </div>
        ))}
      </div>
    </StatsCard>
  );
}

function SystemHealth({
  systems,
}: {
  systems: SystemStatus[];
}) {
  return (
    <StatsCard>
      <Header title="System Health" pill="NOMINAL" pillColor="var(--ok-green)" />
      <div className="mt-5 space-y-3">
        {systems.map((system) => {
          const Icon = system.icon;
          return (
            <div key={system.name} className="flex items-center gap-3 rounded-lg bg-[color-mix(in_srgb,var(--bg-deep)_38%,transparent)] px-3 py-2">
              <Icon aria-hidden className="size-4 text-[var(--text-muted)]" />
              <span className="min-w-0 flex-1 truncate font-body text-sm text-[var(--text-primary)]">{system.name}</span>
              <span
                className={[
                  "rounded px-2 py-0.5 font-mono text-[10px] font-semibold",
                  system.pulse ? "animate-[bb-live-pulse_1.5s_ease-in-out_infinite]" : "",
                ].join(" ")}
                style={{
                  background: `color-mix(in srgb, ${system.color} 12%, transparent)`,
                  color: system.color,
                  border: `1px solid color-mix(in srgb, ${system.color} 24%, transparent)`,
                }}
              >
                {system.status}
              </span>
              <span className="w-10 text-right font-mono text-[11px] text-[var(--text-muted)]">
                {system.latency}
              </span>
            </div>
          );
        })}
      </div>
    </StatsCard>
  );
}

function AgentSummary({
  agentData,
  agentRows,
  totalAgents,
  activeAgents,
}: {
  agentData: AgentSlice[];
  agentRows: AgentRow[];
  totalAgents: number;
  activeAgents: number;
}) {
  return (
    <StatsCard>
      <Header title="Agent Activity" pill={`${activeAgents} Active`} pillColor="var(--glow-purple)" />
      <div className="mt-4 flex items-center justify-center">
        <AgentDonut agentData={agentData} totalAgents={totalAgents} />
      </div>
      <div className="bb-scrollbar mt-3 max-h-[132px] space-y-2 overflow-y-auto pr-1">
        {agentRows.map((agent) => (
          <div
            key={agent.name}
            className="grid grid-cols-[10px_64px_92px_minmax(0,1fr)] items-center gap-2 rounded bg-[color-mix(in_srgb,var(--bg-deep)_34%,transparent)] px-2 py-1.5 font-mono text-[10px]"
          >
            <span className="size-2 rounded-full" style={{ background: agent.color, boxShadow: `0 0 7px ${agent.color}` }} />
            <span className="text-[var(--text-secondary)]">{agent.name}</span>
            <span
              className="rounded px-1.5 py-0.5 text-center text-[8px] font-bold"
              style={{
                background: `color-mix(in srgb, ${agent.badgeColor} 12%, transparent)`,
                color: agent.badgeColor,
                border: `1px solid color-mix(in srgb, ${agent.badgeColor} 24%, transparent)`,
              }}
            >
              {agent.badge}
            </span>
            <span className="truncate text-[var(--text-muted)]">{agent.task}</span>
          </div>
        ))}
      </div>
    </StatsCard>
  );
}

function AgentDonut({ agentData, totalAgents }: { agentData: AgentSlice[]; totalAgents: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative size-36">
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie
              data={agentData}
              dataKey="value"
              nameKey="name"
              outerRadius={60}
              innerRadius={42}
              stroke="none"
              isAnimationActive
              animationDuration={1200}
            >
              {agentData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : null}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[22px] font-bold leading-none text-[var(--text-primary)]">{totalAgents}</span>
        <span className="font-body text-[9px] text-[var(--text-muted)]">agents</span>
      </div>
    </div>
  );
}

function buildRiskUsers(entries: AuditLogEntry[]): RiskUser[] {
  const grouped = new Map<string, { role: string; total: number; count: number; max: number }>();
  for (const entry of entries) {
    const current = grouped.get(entry.user) ?? { role: entry.role, total: 0, count: 0, max: 0 };
    const risk = Math.round(Number(entry.risk_score || 0) * 100);
    current.total += risk;
    current.count += 1;
    current.max = Math.max(current.max, risk);
    grouped.set(entry.user, current);
  }

  return [...grouped.entries()]
    .map(([name, value]) => {
      const score = value.count ? Math.round((value.total / value.count + value.max) / 2) : value.max;
      return {
        initials: initialsFromName(name),
        name,
        role: value.role,
        score,
        color: score >= 80 ? "var(--alert-red)" : score >= 60 ? "var(--alert-orange)" : score >= 35 ? "var(--alert-yellow)" : "var(--glow-blue)",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function buildSystems(health: HealthResponse | null, agentsDashboard: AgentsDashboardResponse | null): SystemStatus[] {
  const healthy = health?.status === "ok";
  const activeAgents = agentsDashboard?.summary.active_agents ?? 0;
  const totalAgents = agentsDashboard?.summary.total_agents ?? 0;
  return [
    { icon: Brain, name: "AI Engine", status: healthy ? "ONLINE" : "DEGRADED", latency: `${Math.max(8, 18 - activeAgents)}ms`, color: healthy ? "var(--ok-green)" : "var(--alert-red)" },
    { icon: Hexagon, name: "Decision Router", status: activeAgents > 0 ? "ONLINE" : "IDLE", latency: `${12 + Math.max(0, totalAgents - activeAgents)}ms`, color: activeAgents > 0 ? "var(--ok-green)" : "var(--alert-yellow)" },
    { icon: Database, name: `${health?.database_backend?.toUpperCase() ?? "DATA"} DB`, status: healthy ? "ONLINE" : "OFFLINE", latency: healthy ? "9ms" : "—", color: healthy ? "var(--ok-green)" : "var(--alert-red)" },
    { icon: ServerCog, name: "Behavioral Model", status: agentsDashboard ? "SYNCING" : "WAITING", latency: "—", color: "var(--alert-yellow)", pulse: true },
  ];
}

function buildAgentData(agentsDashboard: AgentsDashboardResponse | null): AgentSlice[] {
  const agents = agentsDashboard?.agents ?? [];
  const running = agents.filter((agent) => agent.status !== "IDLE").length;
  const investigating = agents.filter((agent) => agent.status === "INVESTIGATING" || agent.status === "SCANNING").length;
  const idle = agents.filter((agent) => agent.status === "IDLE").length;
  return [
    { name: "Running", value: Math.max(0, running - investigating), color: "var(--glow-blue)" },
    { name: "Investigating", value: investigating, color: "var(--glow-purple)" },
    { name: "Idle", value: idle, color: "var(--bb-idle)" },
  ];
}

function buildAgentRows(agentsDashboard: AgentsDashboardResponse | null): AgentRow[] {
  const agents = agentsDashboard?.agents ?? [];
  return agents.map((agent) => {
    const status = String(agent.status).toUpperCase();
    return {
      name: agent.id,
      color: status === "IDLE" ? "var(--bb-idle)" : status === "INVESTIGATING" || status === "SCANNING" ? "var(--glow-purple)" : "var(--glow-blue)",
      badge: status,
      badgeColor: status === "IDLE" ? "var(--bb-idle)" : status === "INVESTIGATING" || status === "SCANNING" ? "var(--glow-purple)" : "var(--glow-blue)",
      task: agent.task,
    };
  });
}

function initialsFromName(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StatsCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.44, ease: "easeOut" }}
      className="bb-card min-h-[236px] p-5"
    >
      {children}
    </motion.article>
  );
}

function Header({
  title,
  pill,
  pillColor = "var(--text-muted)",
}: {
  title: string;
  pill: string;
  pillColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-body text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      <span
        className="rounded px-2 py-1 font-mono text-[10px]"
        style={{
          background: `color-mix(in srgb, ${pillColor} 10%, transparent)`,
          color: pillColor,
        }}
      >
        {pill}
      </span>
    </div>
  );
}
