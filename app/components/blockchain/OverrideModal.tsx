"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { overrideDecision, type BlockchainTransaction } from "../../lib/backend";

type Props = {
  transaction: BlockchainTransaction;
  onClose: () => void;
  onSuccess: () => void;
};

const ROLES = ["manager", "director", "admin"] as const;
const NEW_DECISIONS = ["ALLOW", "ESCALATE"] as const;

export default function OverrideModal({ transaction, onClose, onSuccess }: Props) {
  const [actor, setActor] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [reason, setReason] = useState("");
  const [newDecision, setNewDecision] = useState<"ALLOW" | "ESCALATE">("ALLOW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor.trim() || !reason.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await overrideDecision(transaction.event_id, {
        actor: actor.trim(),
        role,
        reason: reason.trim(),
        new_decision: newDecision,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Override failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-[rgba(123,47,255,0.3)] bg-[#0D0B1A] p-6 shadow-[0_0_60px_rgba(123,47,255,0.18)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-[#F59E0B]">⟳ OVERRIDE DECISION</span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-[#64748B]">
                Event: <span className="text-[#94A3B8]">{transaction.event_id}</span>
              </p>
              <p className="font-mono text-[10px] text-[#64748B]">
                Current:{" "}
                <span
                  style={{
                    color:
                      transaction.decision === "BLOCK"
                        ? "#EF4444"
                        : transaction.decision === "ESCALATE"
                          ? "#F59E0B"
                          : "#22C55E",
                  }}
                >
                  {transaction.decision}
                </span>
                {" · "}
                <span className="text-[#94A3B8]">{transaction.actor}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-[#64748B] hover:border-white/25 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mt-4 h-px bg-[rgba(123,47,255,0.2)]" />

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Actor */}
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                Authorizing Actor
              </label>
              <input
                type="text"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                placeholder="manager.garcia"
                required
                className="h-10 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-white/[0.03] px-3 font-mono text-sm text-white outline-none placeholder:text-[#475569] focus:border-[rgba(123,47,255,0.6)] focus:shadow-[0_0_12px_rgba(123,47,255,0.16)]"
              />
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-[#0D0B1A] px-3 font-mono text-sm text-white outline-none focus:border-[rgba(123,47,255,0.6)]"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                Reason for Override
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Legitimate access verified by manager — vendor audit window active."
                required
                rows={3}
                className="w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-white/[0.03] px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-[#475569] focus:border-[rgba(123,47,255,0.6)] focus:shadow-[0_0_12px_rgba(123,47,255,0.16)]"
              />
            </div>

            {/* New Decision */}
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
                New Decision
              </label>
              <div className="flex gap-2">
                {NEW_DECISIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setNewDecision(d)}
                    className={[
                      "flex-1 rounded-lg border py-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition",
                      newDecision === d
                        ? d === "ALLOW"
                          ? "border-[#22C55E] bg-[rgba(34,197,94,0.12)] text-[#22C55E]"
                          : "border-[#F59E0B] bg-[rgba(245,158,11,0.12)] text-[#F59E0B]"
                        : "border-white/[0.08] text-[#64748B] hover:border-white/20",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-3 py-2 font-mono text-[11px] text-[#EF4444]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading || !actor.trim() || !reason.trim()}
              className="w-full rounded-lg border border-[rgba(123,47,255,0.5)] bg-[rgba(123,47,255,0.14)] py-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[rgba(123,47,255,0.24)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Submitting Override…" : "Confirm Override"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
