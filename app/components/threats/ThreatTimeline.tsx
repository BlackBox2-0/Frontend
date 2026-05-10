"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    name?: string | number;
    value?: number | string;
  }>;
  label?: string | number;
};

const timeline = [
  { h: "00", c: 2, hi: 5, m: 8 },
  { h: "01", c: 1, hi: 3, m: 6 },
  { h: "02", c: 3, hi: 4, m: 7 },
  { h: "03", c: 0, hi: 2, m: 5 },
  { h: "04", c: 1, hi: 3, m: 4 },
  { h: "05", c: 2, hi: 5, m: 9 },
  { h: "06", c: 4, hi: 8, m: 12 },
  { h: "07", c: 3, hi: 7, m: 15 },
  { h: "08", c: 5, hi: 10, m: 18 },
  { h: "09", c: 8, hi: 14, m: 22 },
  { h: "10", c: 6, hi: 12, m: 20 },
  { h: "11", c: 7, hi: 15, m: 25 },
  { h: "12", c: 9, hi: 18, m: 28 },
  { h: "13", c: 11, hi: 20, m: 30 },
  { h: "14", c: 8, hi: 16, m: 24 },
  { h: "15", c: 10, hi: 19, m: 27 },
  { h: "16", c: 12, hi: 22, m: 32 },
  { h: "17", c: 9, hi: 17, m: 26 },
  { h: "18", c: 7, hi: 14, m: 21 },
  { h: "19", c: 6, hi: 12, m: 18 },
  { h: "20", c: 8, hi: 15, m: 22 },
  { h: "21", c: 5, hi: 10, m: 16 },
  { h: "22", c: 4, hi: 8, m: 12 },
  { h: "23", c: 3, hi: 6, m: 10 },
];

const legend = [
  { label: "Critical", color: "var(--alert-red)" },
  { label: "High", color: "var(--alert-orange)" },
  { label: "Medium", color: "var(--alert-yellow)" },
];

export default function ThreatTimeline() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut", delay: 0.16 }}
      className="bb-card mt-6 h-[200px] p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="font-body text-base font-semibold text-white">Threat Activity Timeline</h2>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">Last 24 hours</span>
        </div>
        <div className="flex gap-4">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-2 font-mono text-[10px] text-[var(--text-muted)]">
              <span className="size-2 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 h-[130px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={timeline} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="h"
                interval={3}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-dim)", fontSize: 9, fontFamily: "var(--font-jetbrains-mono)" }}
              />
              <YAxis hide />
              <Tooltip content={<TimelineTooltip />} />
              <Area
                type="monotone"
                dataKey="m"
                stackId="1"
                fill="var(--alert-yellow)"
                fillOpacity={0.15}
                stroke="var(--alert-yellow)"
                strokeWidth={1.4}
                dot={false}
                isAnimationActive
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="hi"
                stackId="1"
                fill="var(--alert-orange)"
                fillOpacity={0.2}
                stroke="var(--alert-orange)"
                strokeWidth={1.4}
                dot={false}
                isAnimationActive
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="c"
                stackId="1"
                fill="var(--alert-red)"
                fillOpacity={0.3}
                stroke="var(--alert-red)"
                strokeWidth={1.4}
                dot={false}
                isAnimationActive
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </motion.article>
  );
}

function TimelineTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[var(--glow-blue)] bg-[var(--bg-surface)] px-3 py-2 font-mono text-[11px] text-white shadow-[0_0_18px_color-mix(in_srgb,var(--glow-blue)_20%,transparent)]">
      <p className="mb-1 text-[var(--text-muted)]">{label}:00</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}
