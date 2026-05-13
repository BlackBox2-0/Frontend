"use client";

import { blockchainNodes } from "./blockchainData";
import { SectionLabel } from "./LiveTransactionFeed";

const pillColors: Record<string, string> = {
  PRIMARY: "#7B2FFF",
  RELAY: "#4F46E5",
  VALIDATOR: "#06B6D4",
  ARCHIVE: "#22C55E",
  MONITOR: "#F97316",
};

const latencies = [12, 45, 89, 67, 134, 178, 112, 203];

export default function NodeStatusList() {
  const nodes = blockchainNodes.filter((node) => node.type !== "threat").slice(0, 8);

  return (
    <section className="mt-5">
      <SectionLabel>◈ NODE STATUS</SectionLabel>
      <div className="mt-3 space-y-2">
        {nodes.map((node, index) => {
          const type = node.type.toUpperCase();
          const latency = latencies[index];
          const latencyColor = latency < 100 ? "#22C55E" : latency <= 150 ? "#F59E0B" : "#EF4444";

          return (
            <div key={node.id} className="grid grid-cols-[10px_1fr_auto_auto_auto] items-center gap-2 font-mono text-[9px]">
              <span
                className="size-2 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ background: index > 5 ? "#F59E0B" : "#22C55E", color: index > 5 ? "#F59E0B" : "#22C55E" }}
              />
              <span className="truncate text-[#CBD5E1]">{node.label.replace("NODE-", "NODE-").replace(" · ", " ")}</span>
              <span className="rounded px-1.5 py-0.5 text-[8px] font-bold" style={{ color: pillColors[type], background: `${pillColors[type]}18` }}>
                {type}
              </span>
              <span className="text-[#94A3B8]">{node.txCount} tx</span>
              <span style={{ color: latencyColor }}>{latency}ms</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
