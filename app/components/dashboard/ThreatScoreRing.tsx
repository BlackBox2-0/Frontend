"use client";

import { motion } from "framer-motion";

const radius = 90;
const circumference = 2 * Math.PI * radius;
const score = 68;
const offset = circumference * (1 - score / 100);

const pills = [
  { label: "INTERNAL", value: "71", color: "var(--glow-violet)" },
  { label: "EXTERNAL", value: "64", color: "var(--glow-blue-light)" },
  { label: "BEHAVIORAL", value: "58", color: "var(--alert-orange)" },
];

export default function ThreatScoreRing() {
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
        className="absolute left-1/2 top-[54%] size-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--glow-blue)_12%,transparent),transparent_68%)] blur-[40px]"
      />

      <div className="relative z-10 mx-auto mt-5 flex size-60 items-center justify-center">
        <svg aria-hidden="true" viewBox="0 0 240 240" className="absolute inset-0 size-full -rotate-90">
          <defs>
            <linearGradient id="blueGradient" x1="30" x2="210" y1="30" y2="210">
              <stop stopColor="var(--glow-blue)" />
              <stop offset="1" stopColor="var(--glow-cyan)" />
            </linearGradient>
          </defs>
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="color-mix(in srgb, var(--glow-blue) 10%, transparent)"
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
    </motion.article>
  );
}
