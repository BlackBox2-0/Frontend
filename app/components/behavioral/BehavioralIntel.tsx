"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  Download,
  Flame,
  Search,
  ShieldCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EmployeeStatus = "CRITICAL" | "HIGH" | "BURNOUT RISK" | "MEDIUM" | "LOW" | "SECURE";

type Employee = {
  initials: string;
  avatar: string;
  name: string;
  role: string;
  dept: string;
  trust: number;
  risk: number;
  consistency: number;
  anomalies: number;
  trend: number[];
  trendColor: string;
  status: EmployeeStatus;
  assessment: string;
};

const statusStyles: Record<EmployeeStatus, { bg: string; color: string }> = {
  CRITICAL: { bg: "rgba(239,68,68,0.15)", color: "#EF4444" },
  HIGH: { bg: "rgba(249,115,22,0.15)", color: "#F97316" },
  "BURNOUT RISK": { bg: "rgba(245,158,11,0.15)", color: "#F59E0B" },
  MEDIUM: { bg: "rgba(123,47,255,0.15)", color: "#9B5CF6" },
  LOW: { bg: "rgba(107,114,128,0.15)", color: "#6B7280" },
  SECURE: { bg: "rgba(34,197,94,0.15)", color: "#22C55E" },
};

const employees: Employee[] = [
  {
    initials: "JM",
    avatar: "linear-gradient(135deg,#EF4444,#F97316)",
    name: "J. Martinez",
    role: "Senior Analyst",
    dept: "Finance",
    trust: 38,
    risk: 91,
    consistency: 42,
    anomalies: 14,
    trend: [45, 42, 38, 35, 38],
    trendColor: "#EF4444",
    status: "CRITICAL",
    assessment:
      "High-risk behavioral pattern detected. Employee shows signs of data exfiltration intent combined with unusual access patterns outside business hours. Immediate review recommended.",
  },
  {
    initials: "KS",
    avatar: "linear-gradient(135deg,#F97316,#EF4444)",
    name: "K. Santos",
    role: "Finance Lead",
    dept: "Finance",
    trust: 42,
    risk: 84,
    consistency: 48,
    anomalies: 9,
    trend: [55, 50, 46, 43, 42],
    trendColor: "#EF4444",
    status: "CRITICAL",
    assessment:
      "Coordinated restricted-file access detected with repeated after-hours finance exports. Escalate for manager review and access verification.",
  },
  {
    initials: "RV",
    avatar: "linear-gradient(135deg,#F97316,#FACC15)",
    name: "R. Vega",
    role: "IT Admin",
    dept: "IT",
    trust: 54,
    risk: 71,
    consistency: 56,
    anomalies: 6,
    trend: [60, 58, 56, 55, 54],
    trendColor: "#F97316",
    status: "HIGH",
    assessment:
      "Privilege usage is drifting from baseline. Multiple administrative actions occurred outside normal change windows.",
  },
  {
    initials: "MT",
    avatar: "linear-gradient(135deg,#FACC15,#F97316)",
    name: "M. Torres",
    role: "Operations",
    dept: "Ops",
    trust: 58,
    risk: 67,
    consistency: 61,
    anomalies: 4,
    trend: [62, 61, 59, 58, 58],
    trendColor: "#F97316",
    status: "HIGH",
    assessment:
      "Operations activity shows repeated process bypasses and late-stage approval changes. Monitor for policy drift.",
  },
  {
    initials: "PG",
    avatar: "linear-gradient(135deg,#9B5CF6,#7B2FFF)",
    name: "P. Garcia",
    role: "HR Manager",
    dept: "HR",
    trust: 61,
    risk: 62,
    consistency: 45,
    anomalies: 7,
    trend: [65, 63, 62, 61, 61],
    trendColor: "#F97316",
    status: "BURNOUT RISK",
    assessment:
      "Workload and response cadence indicate sustained burnout pressure with rising error rates in sensitive workflows.",
  },
  {
    initials: "AL",
    avatar: "linear-gradient(135deg,#4F46E5,#06B6D4)",
    name: "A. Lopez",
    role: "Dev Lead",
    dept: "Engineering",
    trust: 67,
    risk: 48,
    consistency: 67,
    anomalies: 3,
    trend: [66, 67, 67, 67, 67],
    trendColor: "#F59E0B",
    status: "MEDIUM",
    assessment: "Stable profile with isolated access anomalies tied to deployment windows.",
  },
  {
    initials: "CM",
    avatar: "linear-gradient(135deg,#06B6D4,#4F46E5)",
    name: "C. Mendez",
    role: "Analyst",
    dept: "Finance",
    trust: 71,
    risk: 41,
    consistency: 72,
    anomalies: 2,
    trend: [70, 71, 71, 71, 71],
    trendColor: "#F59E0B",
    status: "MEDIUM",
    assessment: "Minor behavioral variance detected. No immediate intervention required.",
  },
  {
    initials: "BR",
    avatar: "linear-gradient(135deg,#22C55E,#06B6D4)",
    name: "B. Rios",
    role: "Engineer",
    dept: "Engineering",
    trust: 82,
    risk: 22,
    consistency: 84,
    anomalies: 1,
    trend: [80, 81, 82, 82, 82],
    trendColor: "#22C55E",
    status: "LOW",
    assessment: "Healthy behavior profile. Activity matches expected engineering patterns.",
  },
  {
    initials: "SC",
    avatar: "linear-gradient(135deg,#22C55E,#4F46E5)",
    name: "S. Castro",
    role: "Designer",
    dept: "Creative",
    trust: 85,
    risk: 18,
    consistency: 86,
    anomalies: 0,
    trend: [84, 85, 85, 85, 85],
    trendColor: "#22C55E",
    status: "LOW",
    assessment: "No behavioral risk indicators found in the current observation window.",
  },
  {
    initials: "AR",
    avatar: "linear-gradient(135deg,#7B2FFF,#9B5CF6)",
    name: "A. Reyes",
    role: "Security Analyst",
    dept: "Security",
    trust: 94,
    risk: 6,
    consistency: 94,
    anomalies: 0,
    trend: [93, 94, 94, 94, 94],
    trendColor: "#06B6D4",
    status: "SECURE",
    assessment: "Secure baseline. Access, cadence, and response patterns are highly consistent.",
  },
];

const statCards = [
  {
    label: "AVG TRUST SCORE",
    value: "73.4",
    unit: "/ 100",
    pill: "↓ 2.1 pts this week",
    pillColor: "#EF4444",
    icon: ShieldCheck,
    color: "#22C55E",
    data: [78, 76, 75, 74, 76, 73, 72, 74, 73, 73.4],
  },
  {
    label: "HIGH RISK PROFILES",
    value: "12",
    pill: "+3 escalated today",
    pillColor: "#EF4444",
    sub: "of 147 total employees",
    icon: UserX,
    color: "#EF4444",
    data: [6, 7, 7, 8, 9, 8, 10, 11, 10, 12],
  },
  {
    label: "ANOMALIES DETECTED",
    value: "34",
    pill: "Last 24 hours",
    pillColor: "#64748B",
    sub: "18 behavioral · 16 access",
    icon: Activity,
    color: "#F97316",
    data: [12, 15, 11, 18, 14, 20, 17, 22, 19, 34],
  },
  {
    label: "BURNOUT RISK",
    value: "23",
    pill: "employees flagged",
    pillColor: "#64748B",
    sub: "8 critical · 15 moderate",
    icon: Flame,
    color: "#F59E0B",
    data: [10, 12, 14, 13, 16, 15, 18, 20, 21, 23],
  },
];

const anomalies = [
  ["#EF4444", "Accessed /finance/payroll at 3:14 AM", "2h ago"],
  ["#EF4444", "14 failed auth attempts in 10min", "5h ago"],
  ["#F97316", "Copied 2.3GB to external drive", "1d ago"],
  ["#F97316", "Logged in from 3 different IPs", "2d ago"],
  ["#F59E0B", "Productivity 40% below baseline", "3d ago"],
];

const departments = [
  { dept: "Finance", risk: 72, employees: 18 },
  { dept: "IT", risk: 61, employees: 24 },
  { dept: "Operations", risk: 54, employees: 31 },
  { dept: "HR", risk: 48, employees: 12 },
  { dept: "Engineering", risk: 35, employees: 42 },
  { dept: "Security", risk: 21, employees: 8 },
  { dept: "Creative", risk: 18, employees: 12 },
];

const insightItems = [
  {
    level: "CRITICAL",
    color: "#EF4444",
    text: "Coordinated behavior detected between J.Martinez and K.Santos — accessing same restricted files within minutes of each other.",
    confidence: "Confidence: 94%",
    time: "Just now",
  },
  {
    level: "HIGH",
    color: "#F97316",
    text: "Finance shows a 31% increase in after-hours access while daytime productivity has dropped below baseline.",
    confidence: "Confidence: 88%",
    time: "12m ago",
  },
  {
    level: "BURNOUT",
    color: "#F59E0B",
    text: "HR and Operations contain 14 employees with sustained fatigue markers across response latency and overtime cadence.",
    confidence: "Confidence: 81%",
    time: "26m ago",
  },
  {
    level: "SECURE",
    color: "#22C55E",
    text: "Security team trust scores remain stable with no anomalous privileged access in the last 72 hours.",
    confidence: "Confidence: 97%",
    time: "41m ago",
  },
];

const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const hourLabels = ["00", "03", "06", "09", "12", "15", "18", "21"];

function seededValue(day: number, hour: number) {
  const variation = (day * 7 + hour * 11) % 3;
  const weekday = day < 5;
  if (weekday && ((hour >= 23 && hour <= 23) || hour <= 4)) return Math.min(10, 7 + variation);
  if (!weekday && hour >= 2 && hour <= 5) return Math.min(10, 8 + variation);
  if (weekday && hour >= 9 && hour <= 18) return 1 + variation;
  return (day * 5 + hour * 3) % 4;
}

function heatColor(value: number) {
  if (value === 0) return "rgba(123,47,255,0.05)";
  if (value <= 2) return "rgba(123,47,255,0.15)";
  if (value <= 4) return "rgba(123,47,255,0.28)";
  if (value <= 6) return "rgba(155,92,246,0.40)";
  if (value <= 8) return "rgba(239,68,68,0.50)";
  return "rgba(239,68,68,0.80)";
}

function riskBarColor(risk: number) {
  if (risk > 60) return "#EF4444";
  if (risk >= 40) return "#F97316";
  if (risk >= 20) return "#F59E0B";
  return "#22C55E";
}

export default function BehavioralIntel() {
  const [selected, setSelected] = useState<Employee>(employees[0]);
  const trendData = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => {
        const day = index + 1;
        const drift = index / 29;
        const wiggle = ((index * 7) % 5) - 2;
        return {
          day: `Day ${day}`,
          trust: Number((76 - drift * 2.6 + wiggle * 0.15).toFixed(1)),
          risk: Number((38 + drift * 14 + wiggle * 0.5).toFixed(1)),
          anomaly: index === 29 ? 34 : Math.round(8 + drift * 18 + Math.max(0, wiggle)),
        };
      }),
    [],
  );

  return (
    <div className="text-[var(--text-primary)]">
      <Header />
      <StatsRow />
      <section className="mt-6 grid grid-cols-1 gap-5 2xl:grid-cols-[55fr_45fr]">
        <RiskTable selected={selected} onSelect={setSelected} />
        <ScorePanel employee={selected} />
      </section>
      <ActivityHeatmap employee={selected} />
      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <BehavioralTrends data={trendData} />
        <DepartmentRisk />
        <AIInsights />
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
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--glow-violet)]">
          HUMAN BEHAVIORAL ANALYSIS
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-white">
          Behavioral Intelligence
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          AI-powered organizational behavior monitoring · 147 profiles active
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--glow-violet)]">
          <span className="size-2 rounded-full bg-[var(--glow-violet)] shadow-[0_0_10px_rgba(168,85,247,0.85)] animate-[bb-live-pulse_1.4s_ease-in-out_infinite]" />
          AI ANALYSIS RUNNING
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--glow-purple)] bg-transparent px-4 py-2 font-body text-xs font-semibold text-[var(--glow-violet)] transition hover:bg-[rgba(123,47,255,0.1)] hover:shadow-[0_0_12px_rgba(123,47,255,0.25)]"
        >
          <Download aria-hidden className="size-4" />
          Export Report
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--glow-purple)] px-4 py-2 font-body text-xs font-bold text-white shadow-[0_0_20px_rgba(123,47,255,0.4)] transition hover:bg-[var(--glow-purple-mid)]"
        >
          <UserPlus aria-hidden className="size-4" />
          Flag Employee
        </button>
      </div>
    </motion.header>
  );
}

function StatsRow() {
  const mounted = useMounted();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      {statCards.map((stat) => {
        const Icon = stat.icon;
        const data = stat.data.map((value, index) => ({ index, value }));
        return (
          <motion.article
            key={stat.label}
            variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.36, ease: "easeOut" }}
            className="bb-card relative flex min-h-[220px] flex-col overflow-hidden px-6 py-5 hover:-translate-y-0.5"
          >
            <div
              aria-hidden
              className="absolute right-[-18px] top-[-22px] size-20 rounded-full blur-[22px]"
              style={{ background: `color-mix(in srgb, ${stat.color} 11%, transparent)` }}
            />
            <Icon aria-hidden className="mb-4 size-[18px]" style={{ color: stat.color }} />
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
              {stat.label}
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-heading text-[40px] font-extrabold leading-none" style={{ color: stat.color }}>
                {stat.value}
              </span>
              {stat.unit ? <span className="pb-1 font-body text-sm text-[var(--text-dim)]">{stat.unit}</span> : null}
            </div>
            <span
              className="mt-4 inline-flex w-fit rounded px-2.5 py-1 font-mono text-[10px]"
              style={{ background: `color-mix(in srgb, ${stat.pillColor} 13%, transparent)`, color: stat.pillColor }}
            >
              {stat.pill}
            </span>
            {stat.sub ? <p className="mt-3 font-mono text-[10px] text-[var(--text-muted)]">{stat.sub}</p> : null}
            <div className="mt-auto h-9 pt-3">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <LineChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                    <Line type="monotone" dataKey="value" stroke={stat.color} strokeWidth={1.8} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </motion.article>
        );
      })}
    </motion.section>
  );
}

function RiskTable({
  selected,
  onSelect,
}: {
  selected: Employee;
  onSelect: (employee: Employee) => void;
}) {
  return (
    <article className="bb-card p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <h2 className="font-body text-base font-semibold text-white">Employee Risk Profiles</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-8 w-[170px] items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3">
            <Search aria-hidden className="size-3.5 text-[var(--text-dim)]" />
            <input
              type="search"
              aria-label="Search employees"
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-white outline-none placeholder:text-[var(--text-dim)]"
            />
          </label>
          <span className="rounded-full bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-[var(--text-muted)]">
            147 profiles
          </span>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["All", "Critical", "High", "Medium", "Burnout Risk"].map((filter) => (
          <button
            key={filter}
            type="button"
            className={[
              "rounded-full border px-3 py-1.5 font-body text-[11px] font-semibold transition",
              filter === "All"
                ? "border-[var(--glow-purple)] bg-[rgba(123,47,255,0.15)] text-[var(--glow-violet-light)]"
                : "border-white/10 bg-white/[0.03] text-[var(--text-muted)] hover:border-[rgba(123,47,255,0.45)] hover:text-white",
            ].join(" ")}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="bb-scrollbar mt-5 max-h-[420px] overflow-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--bg-card)]">
            <tr>
              {["EMPLOYEE", "DEPT", "TRUST", "RISK", "ANOMALIES", "TREND", "STATUS"].map((head) => (
                <th
                  key={head}
                  className="px-2 pb-3 text-left font-body text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--text-dim)]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const active = selected.name === employee.name;
              return (
                <tr
                  key={employee.name}
                  onClick={() => onSelect(employee)}
                  className={[
                    "cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.02]",
                    active ? "bg-[rgba(123,47,255,0.08)]" : "",
                  ].join(" ")}
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar employee={employee} size="sm" />
                      <div>
                        <p className="font-body text-[13px] font-medium text-white">{employee.name}</p>
                        <p className="font-body text-[10px] text-[var(--text-muted)]">{employee.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-[rgba(123,47,255,0.1)] px-2.5 py-1 font-mono text-[10px] text-[#C084FC]">
                      {employee.dept}
                    </span>
                  </td>
                  <td className="px-2 py-3 font-heading text-[13px] font-bold" style={{ color: employee.trust < 50 ? "#EF4444" : employee.trust < 70 ? "#F97316" : "#22C55E" }}>
                    {employee.trust}
                  </td>
                  <td className="px-2 py-3 font-heading text-[13px] font-bold" style={{ color: statusStyles[employee.status].color }}>
                    {employee.risk}
                  </td>
                  <td className="px-2 py-3 font-mono text-xs" style={{ color: employee.anomalies > 5 ? "#EF4444" : "var(--text-muted)" }}>
                    {employee.anomalies}
                  </td>
                  <td className="px-2 py-3">
                    <MiniSparkline data={employee.trend} color={employee.trendColor} />
                  </td>
                  <td className="px-2 py-3">
                    <StatusBadge status={employee.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function ScorePanel({ employee }: { employee: Employee }) {
  return (
    <motion.article
      key={employee.name}
      initial={{ opacity: 0.7, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bb-card flex h-full flex-col p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar employee={employee} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate font-heading text-base font-bold text-white">{employee.name}</h2>
            <p className="mt-1 font-body text-xs text-[var(--text-muted)]">
              {employee.role} · {employee.dept}
            </p>
          </div>
        </div>
        <StatusBadge status={employee.status} large />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <ScoreRing label="TRUST" value={employee.trust} color={employee.trust < 50 ? "#EF4444" : "#22C55E"} />
        <ScoreRing label="RISK" value={employee.risk} color={statusStyles[employee.status].color} />
        <ScoreRing label="CONSISTENCY" value={employee.consistency} color={employee.consistency < 50 ? "#F97316" : "#22C55E"} />
      </div>
      <div className="mt-4 rounded-[10px] border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] p-3.5">
        <p className="font-body text-xs font-semibold text-[var(--alert-red)]">AI Assessment</p>
        <p className="mt-2 font-mono text-[11px] leading-[1.6] text-[var(--text-secondary)]">{employee.assessment}</p>
      </div>
      <p className="mt-4 font-body text-[9px] uppercase tracking-[0.15em] text-[var(--text-dim)]">RECENT ANOMALIES</p>
      <div className="mt-3 grid gap-2">
        {anomalies.map(([color, text, time]) => (
          <div key={text} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="size-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: color, color }} />
            <span className="min-w-0 flex-1 truncate text-[var(--text-secondary)]">{text}</span>
            <span className="text-[var(--text-dim)]">{time}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto grid gap-2 pt-5">
        <button type="button" className="rounded-lg bg-[var(--alert-red)] px-4 py-2.5 font-body text-xs font-bold text-white transition hover:shadow-[0_0_16px_rgba(239,68,68,0.42)]">
          Start Investigation
        </button>
        <button type="button" className="rounded-lg border border-[var(--alert-red)] px-4 py-2.5 font-body text-xs font-semibold text-white transition hover:bg-[rgba(239,68,68,0.08)]">
          View Full Profile
        </button>
        <button type="button" className="rounded-lg border border-[var(--bb-idle)] px-4 py-2.5 font-body text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--text-muted)] hover:text-white">
          Add to Watchlist
        </button>
      </div>
    </motion.article>
  );
}

function ActivityHeatmap({ employee }: { employee: Employee }) {
  const [hovered, setHovered] = useState<{ day: string; hour: string; value: number; x: number; y: number } | null>(null);
  const grid = useMemo(
    () => dayLabels.map((day, dayIndex) => ({ day, hours: Array.from({ length: 24 }, (_, hour) => seededValue(dayIndex, hour)) })),
    [],
  );

  return (
    <article className="bb-card relative mt-6 p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h2 className="font-body text-base font-semibold text-white">Organizational Activity Heatmap</h2>
          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Access patterns by hour and day · Last 30 days</p>
        </div>
        <button type="button" className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] text-[var(--text-secondary)]">
          {employee.name} ▾
        </button>
      </div>
      <div className="mt-6 overflow-x-auto pb-2">
        <div className="min-w-[860px]">
          <div className="mb-2 ml-10 grid grid-cols-8 font-mono text-[10px] text-[var(--text-dim)]">
            {hourLabels.map((hour) => (
              <span key={hour}>{hour}</span>
            ))}
          </div>
          <div className="grid gap-1">
            {grid.map((row) => (
              <div key={row.day} className="flex items-center">
                <span className="w-10 font-mono text-[10px] text-[var(--text-dim)]">{row.day}</span>
                <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                  {row.hours.map((value, hour) => (
                    <div
                      key={`${row.day}-${hour}`}
                      className="relative h-8 rounded-[3px]"
                      style={{
                        background: heatColor(value),
                        boxShadow: value >= 9 ? "0 0 12px rgba(239,68,68,0.35)" : undefined,
                      }}
                      onMouseEnter={(event) =>
                        setHovered({ day: row.day, hour: String(hour).padStart(2, "0"), value, x: event.clientX, y: event.clientY })
                      }
                      onMouseMove={(event) => setHovered((prev) => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev))}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {value >= 8 ? <span className="absolute right-1 top-1 size-1 rounded-full bg-[var(--alert-red)] shadow-[0_0_8px_rgba(239,68,68,0.9)]" /> : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 font-mono text-[9px] text-[var(--text-dim)]">
        <span>LOW ACTIVITY</span>
        {[0, 1, 3, 5, 7, 9, 10].map((value) => (
          <span key={value} className="size-3 rounded-[2px]" style={{ background: heatColor(value) }} />
        ))}
        <span>HIGH ACTIVITY</span>
      </div>
      {hovered ? (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-[rgba(123,47,255,0.25)] bg-[rgba(2,1,8,0.92)] px-3 py-2 font-mono text-[11px] text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          style={{ left: hovered.x + 12, top: hovered.y + 12 }}
        >
          {hovered.day} {hovered.hour}:00 · {hovered.value} events · {hovered.value >= 8 ? "ANOMALOUS" : "NORMAL"}
        </div>
      ) : null}
    </article>
  );
}

function BehavioralTrends({ data }: { data: Array<{ day: string; trust: number; risk: number; anomaly: number }> }) {
  const mounted = useMounted();

  return (
    <article className="bb-card p-6">
      <h2 className="font-body text-sm font-semibold text-white">Behavioral Trends</h2>
      <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Organization-wide · Last 30 days</p>
      <div className="mt-4 h-40">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 9, fontFamily: "var(--font-jetbrains-mono)" }} interval={4} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="trust" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} strokeWidth={1.8} name="Trust Score avg" />
              <Area type="monotone" dataKey="risk" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={1.8} name="Risk Index avg" />
              <Area type="monotone" dataKey="anomaly" stroke="#F97316" fill="#F97316" fillOpacity={0.1} strokeWidth={1.8} name="Anomaly Rate" />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <Legend items={[["#22C55E", "Trust Score avg"], ["#EF4444", "Risk Index avg"], ["#F97316", "Anomaly Rate"]]} />
    </article>
  );
}

function DepartmentRisk() {
  const mounted = useMounted();

  return (
    <article className="bb-card p-6">
      <h2 className="font-body text-sm font-semibold text-white">Risk by Department</h2>
      <div className="mt-5 h-40">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={departments} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 4 }}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis type="category" dataKey="dept" width={82} tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="risk" radius={[0, 5, 5, 0]} fill="#EF4444" shape={(props: unknown) => <RiskBarShape {...(props as Record<string, unknown>)} />} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </article>
  );
}

function AIInsights() {
  return (
    <article className="bb-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-body text-sm font-semibold text-white">AI Insights</h2>
        <div className="flex items-center gap-2 font-mono text-[9px] text-[var(--glow-purple)]">
          <Bot aria-hidden className="size-3.5" />
          GENERATED NOW
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {insightItems.map((item) => (
          <div key={item.text} className="border-l-2 bg-white/[0.02] px-3 py-2.5" style={{ borderColor: item.color }}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[9px] font-bold" style={{ color: item.color }}>{item.level}</span>
              <span className="font-mono text-[9px] text-[var(--text-dim)]">{item.time}</span>
            </div>
            <p className="mt-2 font-body text-[11px] leading-5 text-[var(--text-secondary)]">{item.text}</p>
            <p className="mt-2 font-mono text-[10px]" style={{ color: item.color }}>{item.confidence}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Avatar({ employee, size }: { employee: Employee; size: "sm" | "lg" }) {
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full font-heading font-bold text-white shadow-[0_0_14px_rgba(255,255,255,0.08)]",
        size === "lg" ? "size-[52px] text-sm" : "size-9 text-xs",
      ].join(" ")}
      style={{ background: employee.avatar }}
    >
      {employee.initials}
    </div>
  );
}

function StatusBadge({ status, large = false }: { status: EmployeeStatus; large?: boolean }) {
  const style = statusStyles[status];
  return (
    <span
      className={["inline-flex w-fit rounded-full font-mono font-bold uppercase", large ? "px-3 py-1.5 text-[10px]" : "px-2.5 py-1 text-[9px]"].join(" ")}
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const mounted = useMounted();

  return (
    <div className="h-6 w-[60px]">
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={data.map((value, index) => ({ index, value }))} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

function ScoreRing({ label, value, color }: { label: string; value: number; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(100,116,139,0.18)" strokeWidth="5" />
        <motion.circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dash }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="41" textAnchor="middle" className="fill-current font-heading text-[14px] font-bold" style={{ color }}>
          {value}
        </text>
      </svg>
      <span className="mt-1 font-body text-[9px] uppercase tracking-[0.14em] text-[var(--text-dim)]">{label}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: { employees?: number } }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const employeesCount = payload[0]?.payload?.employees;
  return (
    <div className="rounded-lg border border-white/10 bg-[rgba(2,6,23,0.94)] px-3 py-2 font-mono text-[11px] text-white shadow-xl">
      <p className="mb-1 text-[var(--text-muted)]">{label}</p>
      {payload.map((item) => (
        <p key={item.name}>{item.name}: {item.value}</p>
      ))}
      {employeesCount ? <p className="text-[var(--text-muted)]">{employeesCount} employees</p> : null}
    </div>
  );
}

function RiskBarShape(props: Record<string, unknown>) {
  const { x, y, width, height, payload } = props as { x: number; y: number; width: number; height: number; payload: { risk: number } };
  return <rect x={x} y={y} width={width} height={height} rx={5} ry={5} fill={riskBarColor(payload.risk)} />;
}

function Legend({ items }: { items: string[][] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {items.map(([color, label]) => (
        <span key={label} className="inline-flex items-center gap-2 font-body text-[10px] text-[var(--text-muted)]">
          <span className="size-2 rounded-full" style={{ background: color }} />
          {label}
        </span>
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
