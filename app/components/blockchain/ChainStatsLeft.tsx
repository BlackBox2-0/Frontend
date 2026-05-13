"use client";

import { motion } from "framer-motion";
import useCountUp from "../../hooks/useCountUp";
import LiveTransactionFeed, { SectionLabel } from "./LiveTransactionFeed";

const gauges = [
  { label: "CONSENSUS", value: 97, color: "#22C55E" },
  { label: "SYNC RATE", value: 84, color: "#4F46E5" },
  { label: "VALIDITY", value: 99, color: "#7B2FFF" },
];

const blockStats = [
  { label: "TOTAL BLOCKS", value: "4,891,234", count: 4891234, color: "#FFFFFF" },
  { label: "TRANSACTIONS", value: "2.4M", count: 2400000, color: "#06B6D4" },
  { label: "NODES ONLINE", value: "847", count: 847, color: "#22C55E" },
  { label: "AVG BLOCK TIME", value: "2.3s", count: 23, color: "#7B2FFF" },
];

const auditEntries = [
  "21:03:44 · Case closed · Agent-01 · 0x3f2a",
  "21:01:12 · Alert raised · System · 0x7c1e",
  "20:58:33 · Access logged · j.martinez · 0xa4f8",
  "20:55:19 · Policy updated · Admin · 0x2b9d",
];

export default function ChainStatsLeft() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bb-scrollbar relative order-2 h-auto overflow-y-auto border-r border-[rgba(123,47,255,0.1)] p-4 lg:order-none lg:h-[calc(100vh-48px)]"
    >
      <div className="grid grid-cols-3 gap-2">
        {gauges.map((gauge) => (
          <MiniGauge key={gauge.label} {...gauge} />
        ))}
      </div>

      <LiveTransactionFeed />

      <section className="mt-5 grid grid-cols-2 gap-2">
        {blockStats.map((stat) => (
          <BlockStat key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-5">
        <SectionLabel>◈ AUDIT LOG</SectionLabel>
        <div className="mt-2">
          {auditEntries.map((entry) => (
            <div
              key={entry}
              className="border-b border-white/[0.04] py-2 font-mono text-[9px] text-[#94A3B8] transition hover:text-[#CBD5E1]"
            >
              {entry}
            </div>
          ))}
        </div>
      </section>
    </motion.aside>
  );
}

function MiniGauge({ label, value, color }: { label: string; value: number; color: string }) {
  const animated = useCountUp(value);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="35"
          cy="35"
          r="28"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 35 35)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="35" y="40" textAnchor="middle" className="fill-current font-heading text-sm font-bold" style={{ color }}>
          {animated}%
        </text>
      </svg>
      <span className="mt-1 text-center font-body text-[8px] uppercase tracking-[0.1em] text-[#64748B]">{label}</span>
    </div>
  );
}

function BlockStat({ label, value, count, color }: { label: string; value: string; count: number; color: string }) {
  const animated = useCountUp(count);
  const display = value.includes("M") ? `${(animated / 1000000).toFixed(1)}M` : value.includes("s") ? `${(animated / 10).toFixed(1)}s` : animated.toLocaleString("en-US");

  return (
    <div className="rounded-lg border border-white/[0.05] bg-[rgba(13,11,26,0.4)] p-3">
      <p className="font-heading text-lg font-bold leading-none" style={{ color }}>{display}</p>
      <p className="mt-2 font-body text-[8px] uppercase tracking-[0.12em] text-[#64748B]">{label}</p>
    </div>
  );
}
