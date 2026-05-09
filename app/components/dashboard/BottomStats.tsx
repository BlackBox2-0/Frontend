"use client";

import { motion } from "framer-motion";
import { Brain, Database, Hexagon, ServerCog } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const users = [
  { initials: "JM", name: "J. Martinez", role: "Senior Analyst", score: 82, color: "var(--alert-red)" },
  { initials: "KS", name: "K. Santos", role: "Finance Lead", score: 67, color: "var(--alert-orange)" },
  { initials: "RV", name: "R. Vega", role: "IT Admin", score: 54, color: "var(--alert-yellow)" },
  { initials: "MT", name: "M. Torres", role: "Operations", score: 31, color: "var(--glow-blue)" },
];

const systems: Array<{
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  status: string;
  latency: string;
  color: string;
  pulse?: boolean;
}> = [
  { icon: Brain, name: "AI Engine", status: "ONLINE", latency: "12ms", color: "var(--ok-green)" },
  { icon: Hexagon, name: "Blockchain Node", status: "ONLINE", latency: "34ms", color: "var(--ok-green)" },
  { icon: Database, name: "Threat DB", status: "ONLINE", latency: "8ms", color: "var(--ok-green)" },
  { icon: ServerCog, name: "Behavioral Model", status: "SYNCING", latency: "—", color: "var(--alert-yellow)", pulse: true },
];

const agentData = [
  { name: "Monitoring", value: 3, color: "var(--glow-blue)" },
  { name: "Investigating", value: 2, color: "var(--glow-purple)" },
  { name: "Idle", value: 2, color: "var(--bb-idle)" },
];

const agentRows = [
  {
    name: "Agent-01",
    color: "var(--glow-blue)",
    badge: "MONITORING",
    badgeColor: "var(--glow-blue)",
    task: "Watching CORE-DB-01",
  },
  {
    name: "Agent-03",
    color: "var(--glow-blue)",
    badge: "MONITORING",
    badgeColor: "var(--glow-blue)",
    task: "Network scan active",
  },
  {
    name: "Agent-05",
    color: "var(--glow-blue)",
    badge: "MONITORING",
    badgeColor: "var(--glow-blue)",
    task: "User behavior analysis",
  },
  {
    name: "Agent-02",
    color: "var(--glow-purple)",
    badge: "INVESTIGATING",
    badgeColor: "var(--glow-purple)",
    task: "Case #BB-2847",
  },
  {
    name: "Agent-06",
    color: "var(--glow-purple)",
    badge: "INVESTIGATING",
    badgeColor: "var(--glow-purple)",
    task: "IP: 185.220.101.47",
  },
  {
    name: "Agent-04",
    color: "var(--bb-idle)",
    badge: "IDLE",
    badgeColor: "var(--bb-idle)",
    task: "Standby",
  },
  {
    name: "Agent-07",
    color: "var(--bb-idle)",
    badge: "IDLE",
    badgeColor: "var(--bb-idle)",
    task: "Standby",
  },
];

export default function BottomStats() {
  return (
    <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
      <TopRiskUsers />
      <SystemHealth />
      <AgentSummary />
    </section>
  );
}

function TopRiskUsers() {
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

function SystemHealth() {
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

function AgentSummary() {
  return (
    <StatsCard>
      <Header title="Agent Activity" pill="7 Active" pillColor="var(--glow-purple)" />
      <div className="mt-4 flex items-center justify-center">
        <AgentDonut />
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

function AgentDonut() {
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
        <span className="font-heading text-[22px] font-bold leading-none text-[var(--text-primary)]">7</span>
        <span className="font-body text-[9px] text-[var(--text-muted)]">agents</span>
      </div>
    </div>
  );
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
