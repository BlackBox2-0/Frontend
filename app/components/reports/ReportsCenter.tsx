"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  FileChartColumn,
  FileText,
  Filter,
  PieChart,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const reportCards = [
  { title: "Executive Risk Brief", type: "PDF", status: "Ready", owner: "SOC Lead", date: "Today 18:00", score: 92 },
  { title: "Behavioral Drift Audit", type: "XLSX", status: "Ready", owner: "HR Security", date: "Today 16:30", score: 84 },
  { title: "Blockchain Proof Bundle", type: "JSON", status: "Ready", owner: "Compliance", date: "Today 14:10", score: 99 },
  { title: "Threat Response Review", type: "PDF", status: "Draft", owner: "Incident Team", date: "Yesterday 22:45", score: 76 },
];

const weeklyFindings = [
  { day: "Mon", critical: 8, high: 18, medium: 27 },
  { day: "Tue", critical: 6, high: 22, medium: 31 },
  { day: "Wed", critical: 11, high: 25, medium: 34 },
  { day: "Thu", critical: 9, high: 19, medium: 29 },
  { day: "Fri", critical: 14, high: 28, medium: 33 },
  { day: "Sat", critical: 5, high: 12, medium: 18 },
  { day: "Sun", critical: 7, high: 15, medium: 21 },
];

const complianceData = [
  { name: "Verified", value: 71, color: "#22C55E" },
  { name: "In Review", value: 19, color: "#F59E0B" },
  { name: "Missing", value: 10, color: "#EF4444" },
];

const findings = [
  ["CRITICAL", "Payroll export anomaly has onchain proof and matching behavioral drift.", "Owner: Finance SOC"],
  ["HIGH", "Admin activity outside change window increased 18% this week.", "Owner: IT Security"],
  ["MEDIUM", "AI agent quarantined 27 suspicious sessions before escalation.", "Owner: Autonomous Defense"],
  ["SECURE", "Blockchain ledger integrity remained above 99.9% across all sampled proofs.", "Owner: Compliance"],
];

const severityStyle: Record<string, string> = {
  CRITICAL: "#EF4444",
  HIGH: "#F97316",
  MEDIUM: "#F59E0B",
  SECURE: "#22C55E",
};

export default function ReportsCenter() {
  return (
    <div className="text-[var(--text-primary)]">
      <Header />
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileChartColumn} label="REPORTS GENERATED" value="38" sub="+9 in last 24h" color="#06B6D4" />
        <StatCard icon={ShieldAlert} label="CRITICAL FINDINGS" value="14" sub="5 require review" color="#EF4444" />
        <StatCard icon={CheckCircle2} label="COMPLIANCE READY" value="91%" sub="Audit pack coverage" color="#22C55E" />
        <StatCard icon={Sparkles} label="AI SUMMARIES" value="127" sub="Auto-generated insights" color="#7B2FFF" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 2xl:grid-cols-[60fr_40fr]">
        <ReportsTable />
        <ExecutiveSummary />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[58fr_42fr]">
        <FindingsChart />
        <ComplianceChart />
      </section>
    </div>
  );
}

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
    >
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--glow-blue-light)]">
          SECURITY REPORTING
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-white">
          Reports Center
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Executive, compliance, incident, and blockchain evidence reporting
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 font-body text-xs font-semibold text-[var(--text-secondary)] transition hover:border-white/25 hover:text-white">
          <Filter aria-hidden className="size-4" />
          Filter
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded-md bg-[var(--glow-purple)] px-4 py-2 font-body text-xs font-bold text-white shadow-[0_0_20px_rgba(123,47,255,0.4)] transition hover:bg-[var(--glow-purple-mid)]">
          <Download aria-hidden className="size-4" />
          Export Pack
        </button>
      </div>
    </motion.header>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof FileChartColumn;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <article className="bb-card relative min-h-[150px] overflow-hidden p-5">
      <div aria-hidden className="absolute right-[-20px] top-[-28px] size-24 rounded-full blur-[24px]" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }} />
      <Icon aria-hidden className="size-5" style={{ color }} />
      <p className="mt-5 font-body text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-heading text-3xl font-extrabold leading-none" style={{ color }}>{value}</p>
      <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">{sub}</p>
    </article>
  );
}

function ReportsTable() {
  return (
    <article className="bb-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-body text-base font-semibold text-white">Generated Reports</h2>
          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Latest operational and compliance exports</p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-2 font-mono text-[10px] text-[var(--text-muted)]">
          <CalendarDays aria-hidden className="size-3.5" />
          Last 7 days
        </div>
      </div>
      <div className="bb-scrollbar mt-5 overflow-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              {["REPORT", "TYPE", "OWNER", "DATE", "SCORE", "STATUS"].map((head) => (
                <th key={head} className="px-2 pb-3 text-left font-body text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-dim)]">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportCards.map((report) => (
              <tr key={report.title} className="border-b border-white/[0.04] transition hover:bg-white/[0.03]">
                <td className="px-2 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[rgba(123,47,255,0.12)] text-[var(--glow-violet-light)]">
                      <FileText aria-hidden className="size-4" />
                    </div>
                    <span className="font-body text-sm font-semibold text-white">{report.title}</span>
                  </div>
                </td>
                <td className="px-2 py-4 font-mono text-[11px] text-[var(--glow-cyan)]">{report.type}</td>
                <td className="px-2 py-4 font-body text-xs text-[var(--text-secondary)]">{report.owner}</td>
                <td className="px-2 py-4 font-mono text-[11px] text-[var(--text-muted)]">{report.date}</td>
                <td className="px-2 py-4 font-heading text-sm font-bold text-emerald-300">{report.score}</td>
                <td className="px-2 py-4">
                  <span className={["rounded-full px-2.5 py-1 font-mono text-[9px] font-bold", report.status === "Ready" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"].join(" ")}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function ExecutiveSummary() {
  return (
    <article className="bb-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-body text-base font-semibold text-white">Executive Summary</h2>
        <Sparkles aria-hidden className="size-5 text-[var(--glow-purple)]" />
      </div>
      <div className="mt-5 grid gap-3">
        {findings.map(([level, text, owner]) => (
          <div key={text} className="border-l-2 bg-white/[0.02] px-3 py-3" style={{ borderColor: severityStyle[level] }}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[9px] font-bold" style={{ color: severityStyle[level] }}>{level}</span>
              <span className="font-mono text-[9px] text-[var(--text-dim)]">{owner}</span>
            </div>
            <p className="mt-2 font-body text-[12px] leading-5 text-[var(--text-secondary)]">{text}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function FindingsChart() {
  const mounted = useMounted();

  return (
    <article className="bb-card p-6">
      <div className="flex items-center gap-2">
        <BarChart3 aria-hidden className="size-5 text-[var(--glow-blue-light)]" />
        <h2 className="font-body text-sm font-semibold text-white">Weekly Finding Volume</h2>
      </div>
      <div className="mt-5 h-64">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={weeklyFindings} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="critical" stackId="a" fill="#EF4444" radius={[0, 0, 4, 4]} name="Critical" />
              <Bar dataKey="high" stackId="a" fill="#F97316" name="High" />
              <Bar dataKey="medium" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Medium" />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </article>
  );
}

function ComplianceChart() {
  const mounted = useMounted();

  return (
    <article className="bb-card p-6">
      <div className="flex items-center gap-2">
        <PieChart aria-hidden className="size-5 text-emerald-300" />
        <h2 className="font-body text-sm font-semibold text-white">Evidence Coverage</h2>
      </div>
      <div className="mt-5 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_160px]">
        <div className="h-56">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <RePieChart>
                <Pie data={complianceData} innerRadius={54} outerRadius={84} paddingAngle={4} dataKey="value">
                  {complianceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </RePieChart>
            </ResponsiveContainer>
          ) : null}
        </div>
        <div className="grid gap-3">
          {complianceData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
              <span className="flex items-center gap-2 font-body text-xs text-[var(--text-secondary)]">
                <span className="size-2 rounded-full" style={{ background: item.color }} />
                {item.name}
              </span>
              <span className="font-heading text-sm font-bold" style={{ color: item.color }}>{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[rgba(2,6,23,0.94)] px-3 py-2 font-mono text-[11px] text-white shadow-xl">
      {label ? <p className="mb-1 text-[var(--text-muted)]">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.name}>{item.name}: {item.value}</p>
      ))}
    </div>
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
