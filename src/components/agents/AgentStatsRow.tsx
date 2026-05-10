"use client";

import { Bot, CircleDotDashed, Radar, Zap } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

const stats: Array<{
  label: string;
  value: string;
  detail: string;
  color: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { label: "Active Agents", value: "7", detail: "1 core coordinator", color: "var(--glow-blue)", icon: Bot },
  { label: "Tasks Today", value: "293", detail: "47 escalated events", color: "var(--glow-purple)", icon: Zap },
  { label: "Avg Response", value: "42ms", detail: "Across live mesh", color: "var(--glow-cyan)", icon: Radar },
  { label: "Model Health", value: "99.1%", detail: "Consensus accuracy", color: "var(--ok-green)", icon: CircleDotDashed },
];

export default function AgentStatsRow() {
  return (
    <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className="bb-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{stat.label}</p>
                <p className="mt-2 font-heading text-3xl font-bold text-white">{stat.value}</p>
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
