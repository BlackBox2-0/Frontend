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
    <div className="relative h-screen overflow-hidden bg-[var(--bg-deep)] text-white antialiased">
      <CornerBrackets />
      <header className="grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-[rgba(123,47,255,0.2)] bg-[rgba(13,11,26,0.9)] px-4">
        <div className="flex items-center gap-3">
          <span className="font-heading text-sm font-extrabold text-[#7B2FFF]">◈ BLACKBOOKS</span>
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">BLOCKCHAIN OPERATIONS CENTER</span>
        </div>
        <time className="font-mono text-sm text-[#06B6D4]">{clock}</time>
        <div className="flex items-center justify-end gap-3 font-mono text-[10px]">
          <span className="text-[#22C55E]">● BLOCKCHAIN SYNCED</span>
          <span className="text-[#94A3B8]">BLOCK #4,891,234</span>
        </div>
      </header>

      <div className="grid h-[calc(100vh-48px)] grid-cols-1 overflow-y-auto lg:grid-cols-[25%_50%_25%] lg:overflow-hidden">
        <ChainStatsLeft />
        <BlockchainMap />
        <ChainActivityRight />
      </div>
    </div>
  );
}

function CornerBrackets() {
  const corners = [
    "left-3 top-3",
    "right-3 top-3 rotate-90",
    "bottom-3 left-3 -rotate-90",
    "bottom-3 right-3 rotate-180",
  ];

  return (
    <>
      {corners.map((corner) => (
        <svg key={corner} aria-hidden="true" className={`pointer-events-none absolute z-30 size-6 ${corner}`} viewBox="0 0 24 24">
          <path d="M 2 22 L 2 2 L 22 2" fill="none" stroke="#7B2FFF" strokeOpacity="0.4" strokeWidth="1.5" />
        </svg>
      ))}
    </>
  );
}
