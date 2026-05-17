"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import useCountUp from "../../hooks/useCountUp";
import { getTransactions, getStats, type BlockchainTransaction, type BackendStats } from "../../lib/backend";
import LiveTransactionFeed, { SectionLabel } from "./LiveTransactionFeed";

const gauges = [
  { label: "CONSENSUS", value: 97, color: "#22C55E" },
  { label: "SYNC RATE", value: 84, color: "#4F46E5" },
  { label: "VALIDITY", value: 99, color: "#7B2FFF" },
];

function decisionColor(decision: string): string {
  if (decision === "BLOCK") return "#EF4444";
  if (decision === "ESCALATE") return "#F59E0B";
  return "#22C55E";
}

function formatAuditTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso.slice(11, 19) || iso;
  }
}

export default function ChainStatsLeft() {
  const [auditEntries, setAuditEntries] = useState<BlockchainTransaction[]>([]);
  const [stats, setStats] = useState<BackendStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [txs, s] = await Promise.all([getTransactions(), getStats()]);
        setAuditEntries(txs.slice(0, 5));
        setStats(s);
      } catch {}
    }
    load();
    const timer = window.setInterval(load, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const blockStats = [
    { label: "TOTAL EVENTS", value: String(stats?.total ?? "—"), count: stats?.total ?? 0, color: "#FFFFFF" },
    { label: "BLOCKED", value: String(stats?.blocked ?? "—"), count: stats?.blocked ?? 0, color: "#EF4444" },
    { label: "ESCALATED", value: String(stats?.escalated ?? "—"), count: stats?.escalated ?? 0, color: "#F59E0B" },
    { label: "ALLOWED", value: String(stats?.allowed ?? "—"), count: stats?.allowed ?? 0, color: "#22C55E" },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bb-scrollbar relative order-2 h-auto overflow-y-auto border-r border-[rgba(123,47,255,0.1)] p-4 lg:order-none lg:h-full"
    >
      <div className="grid grid-cols-3 gap-2">
        {gauges.map((gauge) => (
          <MiniGauge key={gauge.label} {...gauge} />
        ))}
      </div>

      <LiveTransactionFeed />

      <section className="mt-5 grid grid-cols-2 gap-2">
        {blockStats.map((stat) => (
          <BlockStat key={stat.label} label={stat.label} value={stat.value} count={stat.count} color={stat.color} />
        ))}
      </section>

      <section className="mt-5">
        <SectionLabel>◈ AUDIT LOG</SectionLabel>
        <div className="mt-2">
          {auditEntries.length === 0 ? (
            <p className="py-2 font-mono text-[9px] text-[#475569]">No entries yet.</p>
          ) : (
            auditEntries.map((tx) => (
              <div
                key={tx.tx_hash}
                className="flex items-center gap-2 border-b border-white/[0.04] py-2 font-mono text-[9px] text-[#94A3B8] transition hover:text-[#CBD5E1]"
              >
                <span className="shrink-0" style={{ color: decisionColor(tx.decision) }}>●</span>
                <span className="shrink-0">{formatAuditTime(tx.timestamp)}</span>
                <span className="min-w-0 flex-1 truncate">· {tx.actor} · {tx.tx_hash.slice(0, 14)}</span>
              </div>
            ))
          )}
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
