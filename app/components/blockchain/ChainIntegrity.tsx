"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "./LiveTransactionFeed";

const metrics = [
  { label: "Data Integrity",    value: 100,  color: "#22C55E", glow: "#22C55E" },
  { label: "Consensus Rate",    value: 97.3, color: "#7B2FFF", glow: "#9B5CF6" },
  { label: "Validation Speed",  value: 89.1, color: "#06B6D4", glow: "#06B6D4" },
];

export default function ChainIntegrity() {
  return (
    <section className="mt-5">
      <SectionLabel>◈ CHAIN INTEGRITY</SectionLabel>
      <div className="mt-3 space-y-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-body text-[10px] text-[#94A3B8]">{m.label}</span>
              <span className="font-mono text-[11px] font-bold" style={{ color: m.color }}>
                {m.value}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.value}%` }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${m.color}99, ${m.color})`,
                  boxShadow: `0 0 10px ${m.glow}80`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
