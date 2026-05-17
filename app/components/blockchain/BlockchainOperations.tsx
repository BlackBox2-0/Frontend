"use client";

import { useEffect, useState } from "react";
import BlockchainMap from "./BlockchainMap";
import ChainActivityRight from "./ChainActivityRight";
import ChainStatsLeft from "./ChainStatsLeft";

function formatClock(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} · ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function BlockchainOperations() {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-[var(--bg-deep)] text-white antialiased">
      {/* Blockchain-specific status bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[rgba(123,47,255,0.2)] bg-[rgba(13,11,26,0.85)] px-5">
        <span className="font-body text-[10px] uppercase tracking-[0.18em] text-[#94A3B8]">
          Blockchain Operations Center
        </span>
        <time className="font-mono text-[11px] text-[#06B6D4]">{clock}</time>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-[#22C55E]">● BLOCKCHAIN SYNCED</span>
          <span className="text-[#94A3B8]">BLOCK #4,891,234</span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[25%_50%_25%] lg:overflow-hidden">
        <ChainStatsLeft />
        <BlockchainMap />
        <ChainActivityRight />
      </div>
    </div>
  );
}

