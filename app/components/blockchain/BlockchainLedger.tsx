"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Copy,
  DatabaseZap,
  ExternalLink,
  FileKey2,
  Fingerprint,
  Link2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getSolanaExplorerUrl, recordEventOnChain } from "../../lib/solana";

type LedgerEvent = {
  id: string;
  type: string;
  source: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  risk: number;
  hash: string;
  tx: string;
  time: string;
  status: "FINALIZED" | "CONFIRMED" | "PENDING";
};

const ledgerEvents: LedgerEvent[] = [
  {
    id: "BB-98241",
    type: "Threat proof",
    source: "Threat Monitor",
    severity: "CRITICAL",
    risk: 94,
    hash: "6f7d9a3c1b0e4f8d2a91c774b6e2a8df",
    tx: "BB9XQ4M2R8K7T1V6N3H5C0ZP4L7S8D2F1A6B9E3",
    time: "2m ago",
    status: "FINALIZED",
  },
  {
    id: "BB-98228",
    type: "Behavior anomaly",
    source: "Behavioral Intel",
    severity: "HIGH",
    risk: 82,
    hash: "ae92c41fb6087d94c2f31e88d70a4b53",
    tx: "BB7P2N5C8V1X9L4H6K3D0R2T7Q8W5E1F9A4B6",
    time: "12m ago",
    status: "FINALIZED",
  },
  {
    id: "BB-98197",
    type: "Agent decision",
    source: "AI Agents",
    severity: "MEDIUM",
    risk: 57,
    hash: "bf37a1089e6d4c22a56f0c98d14e713b",
    tx: "BB4K8V2S7J0A5F9L1Q6C3N8R2T7D4H5P9M1",
    time: "31m ago",
    status: "CONFIRMED",
  },
  {
    id: "BB-98182",
    type: "Access audit",
    source: "Identity Layer",
    severity: "LOW",
    risk: 21,
    hash: "c2054f7a1d6b8e9930af1c64d82b45ef",
    tx: "BB1A8D6F3G9H2J5K7L0P4Q8R6S3T9V2W1X",
    time: "46m ago",
    status: "CONFIRMED",
  },
];

const chainTrend = [
  { hour: "00", proofs: 38, risk: 32 },
  { hour: "04", proofs: 44, risk: 37 },
  { hour: "08", proofs: 71, risk: 51 },
  { hour: "12", proofs: 86, risk: 66 },
  { hour: "16", proofs: 105, risk: 73 },
  { hour: "20", proofs: 124, risk: 81 },
  { hour: "24", proofs: 147, risk: 76 },
];

const severityColor = {
  CRITICAL: "#EF4444",
  HIGH: "#F97316",
  MEDIUM: "#F59E0B",
  LOW: "#22C55E",
};

export default function BlockchainLedger() {
  const [selected, setSelected] = useState(ledgerEvents[0]);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const integrityScore = useMemo(
    () => Math.round(ledgerEvents.reduce((sum, item) => sum + item.risk, 0) / ledgerEvents.length),
    [],
  );

  async function handleRecordProof() {
    setRecording(true);
    const tx = await recordEventOnChain(
      selected.type,
      selected.risk,
      `${selected.id}:${selected.source}:${selected.hash}`,
    );
    setLastTx(tx);
    setRecording(false);
  }

  return (
    <div className="text-[var(--text-primary)]">
      <Header onRecord={handleRecordProof} recording={recording} />
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ShieldCheck} label="CHAIN INTEGRITY" value="99.98%" sub="All proofs verified" color="#22C55E" />
        <MetricCard icon={FileKey2} label="EVENT PROOFS" value="1,247" sub="+82 today" color="#06B6D4" />
        <MetricCard icon={TriangleAlert} label="RISK ANCHORED" value={String(integrityScore)} sub="Avg severity score" color="#F97316" />
        <MetricCard icon={DatabaseZap} label="FINALITY LATENCY" value="420ms" sub="Local validator" color="#8B5CF6" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[58fr_42fr]">
        <LedgerTable selected={selected} onSelect={setSelected} />
        <ProofPanel event={selected} lastTx={lastTx} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[42fr_58fr]">
        <ChainHealth />
        <ProofTimeline />
      </section>
    </div>
  );
}

function Header({ onRecord, recording }: { onRecord: () => void; recording: boolean }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
    >
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--glow-cyan)]">
          ONCHAIN EVIDENCE LAYER
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-white">
          Blockchain Ledger
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Solana audit trail for threats, AI decisions, and behavioral risk proofs
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 font-mono text-[11px] text-emerald-300">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          VALIDATOR ONLINE
        </div>
        <button
          type="button"
          onClick={onRecord}
          disabled={recording}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--glow-cyan)] px-4 py-2 font-body text-xs font-bold text-[var(--bg-deep)] transition hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] disabled:cursor-wait disabled:opacity-60"
        >
          <Link2 aria-hidden className="size-4" />
          {recording ? "Recording" : "Anchor Proof"}
        </button>
      </div>
    </motion.header>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <article className="bb-card relative min-h-[150px] overflow-hidden p-5">
      <div aria-hidden className="absolute right-[-22px] top-[-28px] size-24 rounded-full blur-[24px]" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }} />
      <Icon aria-hidden className="size-5" style={{ color }} />
      <p className="mt-5 font-body text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-heading text-3xl font-extrabold leading-none" style={{ color }}>{value}</p>
      <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">{sub}</p>
    </article>
  );
}

function LedgerTable({
  selected,
  onSelect,
}: {
  selected: LedgerEvent;
  onSelect: (event: LedgerEvent) => void;
}) {
  return (
    <article className="bb-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-body text-base font-semibold text-white">Immutable Event Proofs</h2>
          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Latest anchored BlackBooks evidence</p>
        </div>
        <span className="rounded-full bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-[var(--text-muted)]">
          devnet/local
        </span>
      </div>
      <div className="bb-scrollbar mt-5 overflow-auto">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr>
              {["ID", "TYPE", "SOURCE", "RISK", "HASH", "STATUS"].map((head) => (
                <th key={head} className="px-2 pb-3 text-left font-body text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-dim)]">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ledgerEvents.map((event) => {
              const active = selected.id === event.id;
              return (
                <tr
                  key={event.id}
                  onClick={() => onSelect(event)}
                  className={["cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.03]", active ? "bg-[rgba(6,182,212,0.08)]" : ""].join(" ")}
                >
                  <td className="px-2 py-4 font-mono text-xs text-white">{event.id}</td>
                  <td className="px-2 py-4 font-body text-xs text-[var(--text-secondary)]">{event.type}</td>
                  <td className="px-2 py-4 font-mono text-[11px] text-[var(--text-muted)]">{event.source}</td>
                  <td className="px-2 py-4">
                    <span className="font-heading text-sm font-bold" style={{ color: severityColor[event.severity] }}>{event.risk}</span>
                  </td>
                  <td className="px-2 py-4 font-mono text-[11px] text-[var(--text-muted)]">{event.hash.slice(0, 14)}...</td>
                  <td className="px-2 py-4">
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 font-mono text-[9px] font-bold text-emerald-300">
                      {event.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function ProofPanel({ event, lastTx }: { event: LedgerEvent; lastTx: string | null }) {
  const visibleTx = lastTx ?? event.tx;
  return (
    <motion.article
      key={event.id + (lastTx ?? "")}
      initial={{ opacity: 0.75, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="bb-card flex min-h-[420px] flex-col p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--glow-cyan)]">{event.id}</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-white">{event.type}</h2>
          <p className="mt-1 font-body text-xs text-[var(--text-muted)]">{event.source} proof package</p>
        </div>
        <CheckCircle2 aria-hidden className="size-6 text-emerald-400" />
      </div>
      <div className="mt-6 grid gap-3">
        <ProofRow icon={Fingerprint} label="Event Hash" value={event.hash} />
        <ProofRow icon={Link2} label="Transaction" value={visibleTx} />
        <ProofRow icon={Activity} label="Finality" value={`${event.status} / ${event.time}`} />
      </div>
      <div className="mt-5 rounded-lg border border-[rgba(6,182,212,0.18)] bg-[rgba(6,182,212,0.05)] p-4">
        <p className="font-body text-xs font-semibold text-[var(--glow-cyan)]">Proof validation</p>
        <p className="mt-2 font-mono text-[11px] leading-6 text-[var(--text-secondary)]">
          Event payload hash matches the active audit root. Transaction metadata can be used to prove that the detection existed before remediation began.
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-3 pt-5">
        <a
          href={getSolanaExplorerUrl(visibleTx)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--glow-cyan)] px-4 py-2 font-body text-xs font-semibold text-[var(--glow-cyan)] transition hover:bg-[rgba(6,182,212,0.08)]"
        >
          <ExternalLink aria-hidden className="size-4" />
          Explorer
        </a>
        <button type="button" className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 font-body text-xs font-semibold text-[var(--text-secondary)] transition hover:border-white/25 hover:text-white">
          <Copy aria-hidden className="size-4" />
          Copy Proof
        </button>
      </div>
    </motion.article>
  );
}

function ProofRow({ icon: Icon, label, value }: { icon: typeof Fingerprint; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
        <Icon aria-hidden className="size-3.5 text-[var(--glow-cyan)]" />
        {label}
      </div>
      <p className="mt-2 break-all font-mono text-[11px] text-[var(--text-secondary)]">{value}</p>
    </div>
  );
}

function ChainHealth() {
  const mounted = useMounted();

  return (
    <article className="bb-card p-6">
      <h2 className="font-body text-sm font-semibold text-white">Chain Health</h2>
      <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Anchored proofs and risk pressure</p>
      <div className="mt-5 h-56">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={chainTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: "#64748B", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="proofs" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.12} strokeWidth={2} name="Proofs" />
              <Area type="monotone" dataKey="risk" stroke="#F97316" fill="#F97316" fillOpacity={0.1} strokeWidth={2} name="Risk" />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </article>
  );
}

function ProofTimeline() {
  return (
    <article className="bb-card p-6">
      <h2 className="font-body text-sm font-semibold text-white">Consensus Timeline</h2>
      <div className="mt-5 grid gap-4">
        {ledgerEvents.map((event) => (
          <div key={event.id} className="grid grid-cols-[18px_1fr_auto] gap-3">
            <span className="mt-1 size-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ background: severityColor[event.severity], color: severityColor[event.severity] }} />
            <div>
              <p className="font-body text-sm font-semibold text-white">{event.id} anchored from {event.source}</p>
              <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">{event.hash}</p>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-dim)]">{event.time}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[rgba(2,6,23,0.94)] px-3 py-2 font-mono text-[11px] text-white shadow-xl">
      <p className="mb-1 text-[var(--text-muted)]">{label}:00</p>
      {payload.map((item) => (
        <p key={item.name}>{item.name}: {item.value}</p>
      ))}
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return mounted;
}
