"use client";

import { Bot, CircleDotDashed, Radar, Zap } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import type { AgentsDashboardResponse } from "../../../app/lib/backend";

const fallbackStats: Array<{
  label: string;
  value: string;
  detail: string;
  color: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { label: "Active Agents", value: "--", detail: "Waiting for backend", color: "var(--glow-blue)", icon: Bot },
  { label: "Processed Events", value: "--", detail: "Collector not synced yet", color: "var(--glow-purple)", icon: Zap },
  { label: "Orchestrations", value: "--", detail: "No runs registered", color: "var(--glow-cyan)", icon: Radar },
  { label: "Model Health", value: "--", detail: "Awaiting backend metrics", color: "var(--ok-green)", icon: CircleDotDashed },
];

export default function AgentStatsRow({
  summary,
  loading = false,
}: {
  summary?: AgentsDashboardResponse["summary"];
  loading?: boolean;
}) {
  const stats = summary
    ? [
        {
          label: "Active Agents",
          value: `${summary.active_agents}/${summary.total_agents}`,
          detail: `${summary.tests_available} test actions available`,
          color: "var(--glow-blue)",
          icon: Bot,
        },
        {
          label: "Processed Events",
          value: String(summary.processed_events),
          detail: `${summary.escalated_cases} escalated cases`,
          color: "var(--glow-purple)",
          icon: Zap,
        },
        {
          label: "Orchestrations",
          value: String(summary.orchestration_runs),
          detail: "Full pipeline executions",
          color: "var(--glow-cyan)",
          icon: Radar,
        },
        {
          label: "Model Health",
          value: `${summary.model_health.toFixed(1)}%`,
          detail: "Average agent readiness",
          color: "var(--ok-green)",
          icon: CircleDotDashed,
        },
      ]
    : fallbackStats;

  return (
    <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className="bb-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{stat.label}</p>
                <p className="mt-2 font-heading text-3xl font-bold text-white">{loading && !summary ? "..." : stat.value}</p>
              </div>
              <div
                className="flex size-11 items-center justify-center rounded-lg border"
                style={{
                  color: stat.color,
                  borderColor: `color-mix(in srgb, ${stat.color} 28%, transparent)`,
                  background: `color-mix(in srgb, ${stat.color} 10%, transparent)`,
                }}
              >
                <Icon aria-hidden className="size-5" />
              </div>
            </div>
            <p className="mt-3 font-body text-sm text-[var(--text-muted)]">{stat.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
