"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { initialTransactions, makeRandomTransaction, type LiveTransaction } from "./blockchainData";

export default function LiveTransactionFeed() {
  const [transactions, setTransactions] = useState<LiveTransaction[]>(initialTransactions);

  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTransactions((items) => [makeRandomTransaction(index), ...items].slice(0, 15));
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="mt-5 min-h-0">
      <SectionLabel>◈ LIVE TRANSACTIONS</SectionLabel>
      <div className="mt-2 h-px bg-gradient-to-r from-[#22C55E] via-[#7B2FFF] to-[#EF4444] opacity-70 shadow-[0_0_12px_rgba(123,47,255,0.7)]" />
      <div className="bb-scrollbar mt-3 max-h-[34vh] overflow-hidden pr-1">
        <AnimatePresence initial={false}>
          {transactions.map((transaction) => (
            <motion.article
              key={transaction.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="mb-1.5 rounded-md bg-[rgba(13,11,26,0.6)] px-2.5 py-2 font-mono"
              style={{ borderLeft: `2px solid ${transaction.type.color}` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold" style={{ color: transaction.type.color }}>
                  {transaction.type.icon}
                </span>
                <span className="min-w-0 flex-1 truncate text-[9px] text-[#94A3B8]">{transaction.hash}</span>
                <span
                  className={[
                    "text-[8px] font-bold",
                    transaction.status === "PENDING" ? "animate-pulse text-[#F59E0B]" : "text-[#22C55E]",
                  ].join(" ")}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[9px] text-[#64748B]">
                <span className="min-w-0 flex-1 truncate">
                  {transaction.from} → {transaction.to}
                </span>
                <span className="text-[#CBD5E1]">{transaction.amount}</span>
                <span>{transaction.time}</span>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-body text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B2FFF]">
      {children}
    </h2>
  );
}
