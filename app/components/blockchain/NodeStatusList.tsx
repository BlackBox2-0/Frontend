"use client";

import { blockchainNodes } from "./blockchainData";
import { SectionLabel } from "./LiveTransactionFeed";

const typeColor: Record<string, string> = {
  primary:   "#7B2FFF",
  relay:     "#4F46E5",
  validator: "#06B6D4",
  archive:   "#22C55E",
  monitor:   "#F97316",
};

const latencies = [12, 45, 89, 67, 134, 178, 112, 203];

export default function NodeStatusList() {
  const nodes = blockchainNodes.filter((n) => n.type !== "threat").slice(0, 8);

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between">
        <SectionLabel>◈ NODE STATUS</SectionLabel>
        <span className="font-mono text-[8px] text-[#22C55E]">
          {nodes.length} online
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {nodes.map((node, i) => {
          const latency = latencies[i];
          const latencyColor = latency < 80 ? "#22C55E" : latency < 150 ? "#F59E0B" : "#EF4444";
          const online = i < 6;
          const color = typeColor[node.type] ?? "#94A3B8";
          const [nodeName, city] = node.label.split(" · ");

          return (
            <div
              key={node.id}
              className="flex items-center gap-2.5 rounded-lg bg-[rgba(13,11,26,0.5)] px-2.5 py-2 transition hover:bg-[rgba(123,47,255,0.06)]"
            >
              {/* Online dot */}
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  background: online ? "#22C55E" : "#F59E0B",
                  boxShadow: `0 0 6px ${online ? "#22C55E" : "#F59E0B"}`,
                }}
              />

              {/* Node name + city */}
              <div className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[10px] text-[#CBD5E1]">
                  {nodeName}
                </span>
                <span className="font-mono text-[8px] text-[#475569]">{city}</span>
              </div>

              {/* Type badge */}
              <span
                className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase"
                style={{ color, background: `${color}18` }}
              >
                {node.type.slice(0, 3).toUpperCase()}
              </span>

              {/* Tx count */}
              <span className="shrink-0 font-mono text-[9px] text-[#64748B]">
                {node.txCount} tx
              </span>

              {/* Latency */}
              <span
                className="w-10 shrink-0 text-right font-mono text-[9px] font-bold"
                style={{ color: latencyColor }}
              >
                {latency}ms
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
