"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import ChainIntegrity from "./ChainIntegrity";
import { SectionLabel } from "./LiveTransactionFeed";
import NodeStatusList from "./NodeStatusList";
import SmartContracts from "./SmartContracts";

const chartData = [
  120, 145, 132, 167, 155, 178, 165, 190, 180, 210, 195, 220, 234, 218, 245, 232, 256, 241, 228, 215, 198, 212, 201, 189,
].map((value, hour) => ({ hour, value }));

const alerts = [
  { text: "Unauthorized write attempt blocked · 3min ago", color: "#EF4444" },
  { text: "Node-07 sync delay detected · 12min ago", color: "#F59E0B" },
  { text: "New smart contract deployed · 1h ago", color: "#22C55E" },
];

export default function ChainActivityRight() {
  const mounted = useMounted();

  return (
    <motion.aside
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className="bb-scrollbar relative hidden h-[calc(100vh-48px)] overflow-y-auto border-l border-[rgba(123,47,255,0.1)] p-4 lg:block"
    >
      <section>
        <SectionLabel>◈ CHAIN ACTIVITY</SectionLabel>
        <div className="mt-3 h-[120px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="chainActivityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B2FFF" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#7B2FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#7B2FFF" strokeWidth={1.5} fill="url(#chainActivityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </section>

      <NodeStatusList />
      <SmartContracts />
      <ChainIntegrity />

      <section className="mt-5">
        <SectionLabel>◈ CHAIN ALERTS</SectionLabel>
        <div className="mt-3 space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.text}
              className="rounded px-2.5 py-1.5 font-mono text-[10px]"
              style={{
                borderLeft: `2px solid ${alert.color}`,
                background: `${alert.color}10`,
                color: "#CBD5E1",
              }}
            >
              {alert.text}
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
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return mounted;
}
