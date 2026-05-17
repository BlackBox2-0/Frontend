"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import ChainIntegrity from "./ChainIntegrity";
import { SectionLabel } from "./LiveTransactionFeed";
import NodeStatusList from "./NodeStatusList";
import SmartContracts from "./SmartContracts";

const chartData = [
  120, 145, 132, 167, 155, 178, 165, 190, 180, 210, 195, 220, 234, 218, 245,
  232, 256, 241, 228, 215, 198, 212, 201, 189,
].map((value, hour) => ({ hour, value }));

const alerts = [
  {
    text: "Unauthorized write attempt blocked",
    time: "3 min ago",
    color: "#EF4444",
    icon: "🚫",
  },
  {
    text: "Node-07 sync delay detected",
    time: "12 min ago",
    color: "#F59E0B",
    icon: "⚠",
  },
  {
    text: "New smart contract deployed",
    time: "1 hr ago",
    color: "#22C55E",
    icon: "✓",
  },
];

export default function ChainActivityRight() {
  const mounted = useMounted();

  return (
    <motion.aside
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className="bb-scrollbar relative hidden h-full overflow-y-auto border-l border-[rgba(123,47,255,0.1)] p-4 lg:block"
    >
      {/* ── Chain Activity Chart ── */}
      <section>
        <div className="flex items-center justify-between">
          <SectionLabel>◈ CHAIN ACTIVITY</SectionLabel>
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-mono text-[8px] text-[#22C55E]"
          >
            ● LIVE
          </motion.span>
        </div>
        <div className="mt-3 h-[110px] overflow-hidden rounded-xl border border-[rgba(123,47,255,0.12)] bg-[rgba(13,11,26,0.5)] px-2 pt-2">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <AreaChart data={chartData} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
                <defs>
                  <linearGradient id="chainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B2FFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#7B2FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "#0D0B1A",
                    border: "1px solid rgba(123,47,255,0.3)",
                    borderRadius: 8,
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#CBD5E1",
                  }}
                  cursor={{ stroke: "#7B2FFF55", strokeWidth: 1 }}
                  formatter={(v) => [`${v} tx`, "Activity"]}
                  labelFormatter={(h) => `Hour ${h}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7B2FFF"
                  strokeWidth={1.5}
                  fill="url(#chainGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </section>

      <NodeStatusList />
      <SmartContracts />
      <ChainIntegrity />

      {/* ── Chain Alerts ── */}
      <section className="mt-5">
        <SectionLabel>◈ CHAIN ALERTS</SectionLabel>
        <div className="mt-3 space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.text}
              className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
              style={{
                borderLeft: `2px solid ${alert.color}`,
                background: `${alert.color}0D`,
              }}
            >
              <span className="mt-0.5 shrink-0 text-[11px]">{alert.icon}</span>
              <div className="min-w-0">
                <p className="font-body text-[11px] leading-tight text-[#CBD5E1]">
                  {alert.text}
                </p>
                <p className="mt-1 font-mono text-[9px]" style={{ color: `${alert.color}99` }}>
                  {alert.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.aside>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);
  return mounted;
}
