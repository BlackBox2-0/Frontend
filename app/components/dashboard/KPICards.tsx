"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Cpu, ShieldAlert, TrendingUp } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

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

const cards: KPI[] = [
  {
    label: "ACTIVE THREATS",
    value: "24",
    icon: ShieldAlert,
    tone: "var(--alert-red)",
    pill: "+3 since yesterday",
    sparkline: [8, 12, 9, 15, 11, 18, 14, 20, 16, 24],
  },
  {
    label: "TRUST SCORE",
    value: "87.4",
    unit: "%",
    icon: CheckCircle,
    tone: "var(--glow-cyan)",
    valueClass: "text-[var(--glow-cyan)]",
    pill: "↑ 2.1 pts this week",
    sparkline: [82, 83, 85, 84, 86, 85, 87, 86, 88, 87.4],
  },
  {
    label: "RISK INDEX",
    value: "42",
    icon: TrendingUp,
    tone: "var(--alert-orange)",
    valueClass: "text-[var(--alert-orange)]",
    pill: "MODERATE RISK",
    subLabel: "threshold: 60",
    sparkline: [55, 50, 48, 52, 45, 44, 46, 43, 42, 42],
  },
  {
    label: "AI AGENTS",
    value: "7",
    icon: Cpu,
    tone: "var(--glow-purple)",
    pill: "5 running · 2 idle",
    agents: true,
    sparkline: [4, 5, 4, 6, 5, 7, 6, 7, 7, 7],
  },
  {
    label: "INCIDENTS TODAY",
    value: "12",
    icon: AlertTriangle,
    tone: "var(--alert-yellow)",
    pill: "",
    progress: true,
    sparkline: [3, 5, 4, 7, 6, 8, 9, 10, 11, 12],
  },
];

export default function KPICards() {
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
  return (
    <div className="mt-3">
      <p className="font-mono text-xs">
        <span className="text-[var(--text-muted)]">9 resolved</span>
        <span className="px-2 text-[color-mix(in_srgb,var(--text-muted)_45%,transparent)]">·</span>
        <span className="text-[var(--alert-red)]">3 open</span>
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--text-primary)_6%,transparent)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--alert-yellow)] to-[var(--alert-red)]"
        />
      </div>
    </div>
  );
}
