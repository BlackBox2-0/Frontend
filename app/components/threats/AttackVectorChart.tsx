"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
};

const data = [
  { vector: "Brute Force", count: 234, color: "var(--alert-red)" },
  { vector: "SQL Injection", count: 187, color: "var(--alert-orange)" },
  { vector: "Phishing", count: 156, color: "var(--alert-yellow)" },
  { vector: "Malware", count: 98, color: "var(--glow-purple)" },
  { vector: "Recon", count: 76, color: "var(--glow-blue)" },
  { vector: "Insider", count: 43, color: "var(--glow-cyan)" },
  { vector: "Other", count: 53, color: "var(--text-muted)" },
];

export default function AttackVectorChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut", delay: 0.06 }}
      className="bb-card h-[280px] p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-body text-sm font-semibold text-white">Attack Vectors</h2>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-[var(--text-muted)]">
          Last 24h
        </span>
      </div>
      <div className="mt-4 h-[200px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={data} layout="vertical" margin={{ top: 2, right: 8, bottom: 2, left: 8 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="vector"
                type="category"
                axisLine={false}
                tickLine={false}
                width={88}
                tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
              />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<ChartTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={1200}>
                {data.map((entry) => (
                  <Cell key={entry.vector} fill={entry.color} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </motion.article>
  );
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[var(--glow-blue)] bg-[var(--bg-surface)] px-3 py-2 font-mono text-[11px] text-white shadow-[0_0_18px_color-mix(in_srgb,var(--glow-blue)_20%,transparent)]">
      <p className="text-[var(--text-muted)]">{label}</p>
      <p>{payload[0].value} events</p>
    </div>
  );
}
