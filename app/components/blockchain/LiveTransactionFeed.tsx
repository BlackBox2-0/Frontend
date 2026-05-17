"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTransactions, type BlockchainTransaction } from "../../lib/backend";
import OverrideModal from "./OverrideModal";

function formatRelative(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function decisionColor(decision: string): string {
  if (decision === "BLOCK") return "#EF4444";
  if (decision === "ESCALATE") return "#F59E0B";
  return "#22C55E";
}

function txBorderColor(tx: BlockchainTransaction): string {
  if (tx.type === "OVERRIDE") return "#F59E0B";
  return decisionColor(tx.decision);
}

function truncateHash(hash: string): string {
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export default function LiveTransactionFeed() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [overrideTarget, setOverrideTarget] = useState<BlockchainTransaction | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const fetchTxs = useCallback(async () => {
    try {
      const data = await getTransactions();
      setTransactions((prev) => {
        const newItems = data.filter((tx) => !seenRef.current.has(tx.tx_hash));
        newItems.forEach((tx) => seenRef.current.add(tx.tx_hash));
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev].slice(0, 20);
      });
    } catch {
      // backend offline — keep showing whatever we have
    }
  }, []);

  useEffect(() => {
    fetchTxs();
    const timer = window.setInterval(fetchTxs, 3000);
    return () => window.clearInterval(timer);
  }, [fetchTxs]);

  return (
    <>
      <section className="mt-5 min-h-0">
        <SectionLabel>◈ LIVE TRANSACTIONS</SectionLabel>
        <div className="mt-2 h-px bg-gradient-to-r from-[#22C55E] via-[#7B2FFF] to-[#EF4444] opacity-70 shadow-[0_0_12px_rgba(123,47,255,0.7)]" />

        {transactions.length === 0 ? (
          <p className="mt-4 font-mono text-[10px] text-[#475569]">
            No transactions yet — run a simulation or evaluate an event.
          </p>
        ) : (
          <div className="bb-scrollbar mt-3 max-h-[34vh] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {transactions.map((tx) => (
                <motion.article
                  key={tx.tx_hash}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="mb-1.5 rounded-md bg-[rgba(13,11,26,0.6)] px-2.5 py-2 font-mono"
                  style={{ borderLeft: `2px solid ${txBorderColor(tx)}` }}
                >
                  {/* Row 1: type badge · hash · CONFIRMED */}
                  <div className="flex items-center gap-2">
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase"
                      style={{
                        background: tx.type === "OVERRIDE" ? "rgba(245,158,11,0.15)" : "rgba(123,47,255,0.15)",
                        color: tx.type === "OVERRIDE" ? "#F59E0B" : "#9B5CF6",
                      }}
                    >
                      {tx.type === "OVERRIDE" ? "⟳ OVR" : "ENF"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[9px] text-[#94A3B8]">
                      {truncateHash(tx.tx_hash)}
                    </span>
                    <span className="text-[8px] font-bold text-[#22C55E]">CONFIRMED</span>
                  </div>

                  {/* Row 2: actor → resource · decision · time */}
                  <div className="mt-1 flex items-center gap-2 text-[9px] text-[#64748B]">
                    <span className="min-w-0 flex-1 truncate">
                      {tx.actor}
                      {tx.resource ? ` → ${tx.resource}` : ""}
                    </span>
                    <span className="shrink-0 font-bold" style={{ color: decisionColor(tx.decision) }}>
                      {tx.decision}
                    </span>
                    <span className="shrink-0">{formatRelative(tx.timestamp)}</span>
                  </div>

                  {/* Override button — only for ENFORCEMENT type */}
                  {tx.type === "ENFORCEMENT" && (
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={() => setOverrideTarget(tx)}
                        className="rounded px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] transition hover:bg-[rgba(245,158,11,0.1)] hover:text-[#F59E0B]"
                      >
                        Override Decision
                      </button>
                    </div>
                  )}
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {overrideTarget ? (
        <OverrideModal
          transaction={overrideTarget}
          onClose={() => setOverrideTarget(null)}
          onSuccess={fetchTxs}
        />
      ) : null}
    </>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B2FFF]">
      {children}
    </h2>
  );
}
