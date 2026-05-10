"use client";

import { motion } from "framer-motion";
import { Clock, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

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

const stats: ThreatStat[] = [
  {
    label: "Threats Detected",
    value: "847",
    sub: "Today",
    trend: "+124 vs yesterday",
    icon: ShieldAlert,
    tone: "var(--alert-red)",
    data: [120, 145, 132, 167, 155, 178, 165, 190, 180, 210, 195, 220],
  },
  {
    label: "Blocked Attacks",
    value: "1,203",
    sub: "Last 24h",
    trend: "98.2% block rate",
    icon: ShieldCheck,
    tone: "var(--ok-green)",
    valueTone: "var(--ok-green)",
    data: [80, 95, 88, 102, 98, 110, 105, 118, 112, 125, 120, 130],
  },
  {
    label: "Mean Detection",
    value: "1.4",
    unit: "min",
    trend: "↓ 0.3min improved",
    icon: Clock,
    tone: "var(--glow-cyan)",
    valueTone: "var(--glow-cyan)",
    data: [3.2, 2.8, 2.5, 2.1, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4],
  },
  {
    label: "Investigations",
    value: "23",
    sub: "Active cases",
    trend: "5 escalated",
    icon: Search,
    tone: "var(--glow-purple)",
    trendTone: "var(--alert-orange)",
    data: [8, 10, 12, 11, 14, 13, 16, 15, 18, 20, 21, 23],
  },
];

export default function ThreatStatsRow() {
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
