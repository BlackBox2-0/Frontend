"use client";

import { SectionLabel } from "./LiveTransactionFeed";

const gauges = [
  { label: "DATA INTEGRITY", value: 100, color: "#22C55E", end: "#06B6D4" },
  { label: "CONSENSUS RATE", value: 97.3, color: "#7B2FFF", end: "#06B6D4" },
  { label: "VALIDATION SPEED", value: 89.1, color: "#9B5CF6", end: "#4F46E5" },
];

export default function ChainIntegrity() {
  return (
    <section className="mt-5">
      <SectionLabel>◈ CHAIN INTEGRITY</SectionLabel>
      <div className="mt-3 space-y-3">
        {gauges.map((gauge) => (
          <div key={gauge.label}>
            <div className="mb-1 flex items-center justify-between font-body text-[10px]">
              <span className="text-[#CBD5E1]">{gauge.label}</span>
              <span style={{ color: gauge.color }}>{gauge.value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-white/[0.06]">
              <div
                className="h-full rounded"
                style={{
                  width: `${gauge.value}%`,
                  background: `linear-gradient(90deg, ${gauge.color}, ${gauge.end})`,
                  boxShadow: `0 0 8px ${gauge.color}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
