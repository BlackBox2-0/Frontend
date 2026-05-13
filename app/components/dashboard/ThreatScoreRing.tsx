"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const radius = 90;
const circumference = 2 * Math.PI * radius;
const score = 68;
const offset = circumference * (1 - score / 100);

const pills = [
  { label: "INTERNAL", value: "71", color: "var(--glow-violet)" },
  { label: "EXTERNAL", value: "64", color: "var(--glow-blue-mid)" },
  { label: "BEHAVIORAL", value: "58", color: "var(--alert-orange)" },
];

const trendData = [
  { t: "00", i: 65, e: 45, b: 30 },
  { t: "02", i: 70, e: 50, b: 35 },
  { t: "04", i: 60, e: 55, b: 40 },
  { t: "06", i: 75, e: 48, b: 38 },
  { t: "08", i: 80, e: 60, b: 45 },
  { t: "10", i: 71, e: 64, b: 58 },
  { t: "12", i: 68, e: 58, b: 52 },
  { t: "14", i: 72, e: 62, b: 48 },
  { t: "16", i: 78, e: 66, b: 55 },
  { t: "18", i: 74, e: 70, b: 60 },
  { t: "20", i: 69, e: 65, b: 57 },
  { t: "22", i: 71, e: 68, b: 58 },
];

export default function ThreatScoreRing() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: "easeOut" }}
      className="bb-card relative min-h-80 overflow-hidden p-7"
    >
      <div className="relative z-10">
        <p className="font-body text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
          Threat Score
        </p>
        <p className="mt-1 font-body text-xs text-[var(--text-dim)]">Composite intelligence index</p>
      </div>

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[54%] size-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(123,47,255,0.15),transparent_68%)] blur-[40px]"
      />

      <div className="relative z-10 mx-auto mt-5 flex size-60 items-center justify-center">
        <svg aria-hidden="true" viewBox="0 0 240 240" className="absolute inset-0 size-full -rotate-90">
          <defs>
            <linearGradient id="blueGradient" x1="30" x2="210" y1="30" y2="210">
              <stop stopColor="var(--glow-purple)" />
              <stop offset="1" stopColor="var(--glow-cyan)" />
            </linearGradient>
          </defs>
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="rgba(123,47,255,0.1)"
            strokeWidth="8"
          />
          <motion.circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="url(#blueGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="text-center">
          <div className="flex items-end justify-center gap-1">
            <span className="font-heading text-[52px] font-extrabold leading-none text-[var(--text-primary)]">
              {score}
            </span>
            <span className="mb-2 font-body text-sm text-[var(--text-muted)]">/ 100</span>
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--alert-red)]">
            High Risk
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap justify-center gap-2">
        {pills.map((pill) => (
          <span
            key={pill.label}
            className="rounded px-2.5 py-1 font-mono text-[10px]"
            style={{
              background: `color-mix(in srgb, ${pill.color} 10%, transparent)`,
              color: pill.color,
            }}
          >
            {pill.label} {pill.value}
          </span>
        ))}
      </div>

      <div className="relative z-10 mt-5 h-20 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={trendData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <Area
                type="monotone"
                dataKey="i"
                stroke="var(--glow-purple)"
                strokeWidth={1.5}
                fill="var(--glow-purple)"
                fillOpacity={0.15}
                dot={false}
                isAnimationActive
              />
              <Area
                type="monotone"
                dataKey="e"
                stroke="var(--glow-blue)"
                strokeWidth={1.5}
                fill="var(--glow-blue)"
                fillOpacity={0.15}
                dot={false}
                isAnimationActive
              />
              <Area
                type="monotone"
                dataKey="b"
                stroke="var(--alert-orange)"
                strokeWidth={1.5}
                fill="var(--alert-orange)"
                fillOpacity={0.15}
                dot={false}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <p className="relative z-10 mt-1 text-center font-mono text-[9px] text-[var(--text-dim)]">
        12h threat trend
      </p>
    </motion.article>
  );
}
