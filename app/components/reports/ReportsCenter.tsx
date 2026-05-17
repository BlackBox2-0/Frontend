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
import { useEffect, useMemo, useState } from "react";
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
import {
  getAgentsDashboard,
  getAuditLog,
  getCompanyUsers,
  getHealth,
  getIncidentActions,
  getIncidentSummary,
  type AgentsDashboardResponse,
  type AuditLogEntry,
  type CompanyUser,
  type HealthResponse,
  type IncidentActionResult,
  type IncidentSummary,
} from "../../lib/backend";

const severityStyle: Record<string, string> = {
  CRITICAL: "#EF4444",
  HIGH: "#F97316",
  MEDIUM: "#F59E0B",
  SECURE: "#22C55E",
};

type ReportCardData = {
  title: string;
  type: string;
  status: string;
  owner: string;
  date: string;
  score: number;
};

export default function ReportsCenter() {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [incidentSummary, setIncidentSummary] = useState<IncidentSummary | null>(null);
  const [incidentActions, setIncidentActions] = useState<IncidentActionResult[]>([]);
  const [agentsDashboard, setAgentsDashboard] = useState<AgentsDashboardResponse | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [auditResult, summaryResult, actionsResult, agentsResult, usersResult, healthResult] =
        await Promise.allSettled([
          getAuditLog(),
          getIncidentSummary(),
          getIncidentActions(),
          getAgentsDashboard(),
          getCompanyUsers(),
          getHealth(),
        ]);

      if (cancelled) return;
      if (auditResult.status === "fulfilled") setAuditEntries(auditResult.value);
      if (summaryResult.status === "fulfilled") setIncidentSummary(summaryResult.value);
      if (actionsResult.status === "fulfilled") setIncidentActions(actionsResult.value);
      if (agentsResult.status === "fulfilled") setAgentsDashboard(agentsResult.value);
      if (usersResult.status === "fulfilled") setCompanyUsers(usersResult.value);
      if (healthResult.status === "fulfilled") setHealth(healthResult.value);
    }

    loadData();
    const intervalId = window.setInterval(loadData, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const reportCards = useMemo(
    () => buildReportCards(auditEntries, incidentSummary, agentsDashboard, companyUsers),
    [auditEntries, incidentSummary, agentsDashboard, companyUsers],
  );
  const weeklyFindings = useMemo(() => buildWeeklyFindings(auditEntries), [auditEntries]);
  const complianceData = useMemo(() => buildComplianceData(incidentSummary, health), [incidentSummary, health]);
  const findings = useMemo(
    () => buildExecutiveFindings(auditEntries, incidentActions, agentsDashboard, companyUsers, health),
    [auditEntries, incidentActions, agentsDashboard, companyUsers, health],
  );
  const stats = useMemo(
    () => buildStatCards(auditEntries, incidentSummary, incidentActions, agentsDashboard),
    [auditEntries, incidentSummary, incidentActions, agentsDashboard],
  );

  const handleExportPack = async () => {
    setExporting(true);

    try {
      const pack = buildReportExportPack({
        auditEntries,
        incidentSummary,
        incidentActions,
        agentsDashboard,
        companyUsers,
        health,
        reportCards,
        weeklyFindings,
        complianceData,
        findings,
        stats,
      });

      const blob = new Blob([JSON.stringify(pack, null, 2)], {
        type: "application/json",
      });
      const fileName = `blackbook-report-pack-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="text-[var(--text-primary)]">
      <Header exporting={exporting} onExportPack={handleExportPack} />
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} sub={stat.sub} color={stat.color} />
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 2xl:grid-cols-[60fr_40fr]">
        <ReportsTable reportCards={reportCards} />
        <ExecutiveSummary findings={findings} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[58fr_42fr]">
        <FindingsChart weeklyFindings={weeklyFindings} />
        <ComplianceChart complianceData={complianceData} />
      </section>
    </div>
  );
}

function Header({
  exporting,
  onExportPack,
}: {
  exporting: boolean;
  onExportPack: () => void;
}) {
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
          Executive, compliance, incident, and evidence reporting generated from backend activity.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 font-body text-xs font-semibold text-[var(--text-secondary)] transition hover:border-white/25 hover:text-white">
          <Filter aria-hidden className="size-4" />
          Filter
        </button>
        <button
          type="button"
          onClick={onExportPack}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--glow-purple)] px-4 py-2 font-body text-xs font-bold text-white shadow-[0_0_20px_rgba(123,47,255,0.4)] transition hover:bg-[var(--glow-purple-mid)] disabled:cursor-wait disabled:opacity-70"
        >
          <Download aria-hidden className="size-4" />
          {exporting ? "Exporting..." : "Export Pack"}
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

function ReportsTable({ reportCards }: { reportCards: ReportCardData[] }) {
  return (
    <article className="bb-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-body text-base font-semibold text-white">Generated Reports</h2>
          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Latest operational and compliance exports synthesized from backend data</p>
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

function ExecutiveSummary({
  findings,
}: {
  findings: Array<[string, string, string]>;
}) {
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

function FindingsChart({
  weeklyFindings,
}: {
  weeklyFindings: Array<{ day: string; critical: number; high: number; medium: number }>;
}) {
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

function ComplianceChart({
  complianceData,
}: {
  complianceData: Array<{ name: string; value: number; color: string }>;
}) {
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

function buildStatCards(
  auditEntries: AuditLogEntry[],
  incidentSummary: IncidentSummary | null,
  incidentActions: IncidentActionResult[],
  agentsDashboard: AgentsDashboardResponse | null,
) {
  const summary = incidentSummary ?? {
    total: 0,
    approved: 0,
    blocked: 0,
    pending: 0,
    assigned: 0,
    active: 0,
    approval_rate: 0,
    block_rate: 0,
  };
  const totalReports = 4 + Math.min(incidentActions.length, 12);
  const criticalFindings = auditEntries.filter((entry) => String(entry.decision).toUpperCase() === "BLOCK").length;
  const complianceReady = Math.max(0, Math.min(100, Math.round((summary.approved + summary.blocked + (agentsDashboard?.summary.model_health ?? 0)) / Math.max(1, 1 + (auditEntries.length > 0 ? 1 : 0)))));
  const aiSummaries = auditEntries.length + summary.total + (agentsDashboard?.summary.orchestration_runs ?? 0);

  return [
    { icon: FileChartColumn, label: "REPORTS GENERATED", value: String(totalReports), sub: `${incidentActions.length} incident packs available`, color: "#06B6D4" },
    { icon: ShieldAlert, label: "CRITICAL FINDINGS", value: String(criticalFindings), sub: `${summary.pending} require review`, color: "#EF4444" },
    { icon: CheckCircle2, label: "COMPLIANCE READY", value: `${complianceReady}%`, sub: "Audit pack coverage", color: "#22C55E" },
    { icon: Sparkles, label: "AI SUMMARIES", value: String(aiSummaries), sub: "Auto-generated insights", color: "#7B2FFF" },
  ];
}

function buildReportCards(
  auditEntries: AuditLogEntry[],
  incidentSummary: IncidentSummary | null,
  agentsDashboard: AgentsDashboardResponse | null,
  companyUsers: CompanyUser[],
): ReportCardData[] {
  const complianceOwner = companyUsers.find((user) => user.level === "DIRECTOR")?.name ?? "Compliance Lead";
  const securityOwner = companyUsers.find((user) => user.department === "Security")?.name ?? "Security Lead";
  const avgRisk = auditEntries.length
    ? Math.round((auditEntries.reduce((sum, entry) => sum + Number(entry.risk_score || 0), 0) / auditEntries.length) * 100)
    : 0;
  const resolved = (incidentSummary?.approved ?? 0) + (incidentSummary?.blocked ?? 0);

  return [
    { title: "Executive Risk Brief", type: "PDF", status: "Ready", owner: securityOwner, date: "Updated now", score: Math.max(60, 100 - avgRisk) },
    { title: "Behavioral Drift Audit", type: "XLSX", status: auditEntries.length ? "Ready" : "Draft", owner: "HR Security", date: `${auditEntries.length} audit events`, score: Math.max(55, Math.round((agentsDashboard?.summary.model_health ?? 75))) },
    { title: "Incident Resolution Ledger", type: "JSON", status: resolved ? "Ready" : "Draft", owner: complianceOwner, date: `${resolved} resolved cases`, score: Math.max(50, Math.round((incidentSummary?.approval_rate ?? 0) || 50)) },
    { title: "Agent Readiness Snapshot", type: "PDF", status: "Ready", owner: "Autonomous Defense", date: `${agentsDashboard?.summary.active_agents ?? 0}/${agentsDashboard?.summary.total_agents ?? 0} agents live`, score: Math.round(agentsDashboard?.summary.model_health ?? 0) || 80 },
  ];
}

function buildExecutiveFindings(
  auditEntries: AuditLogEntry[],
  incidentActions: IncidentActionResult[],
  agentsDashboard: AgentsDashboardResponse | null,
  companyUsers: CompanyUser[],
  health: HealthResponse | null,
): Array<[string, string, string]> {
  const mostRecentBlock = auditEntries.find((entry) => String(entry.decision).toUpperCase() === "BLOCK");
  const mostRecentEscalation = incidentActions.find((action) => action.status === "PENDING_APPROVAL");
  const mediumCount = auditEntries.filter((entry) => Number(entry.risk_score || 0) >= 0.35 && Number(entry.risk_score || 0) < 0.8).length;
  const admin = companyUsers.find((user) => user.level === "ADMIN")?.name ?? "Company Admin";

  return [
    [
      "CRITICAL",
      mostRecentBlock
        ? `${mostRecentBlock.action} on ${mostRecentBlock.resource} was blocked automatically for ${mostRecentBlock.user}.`
        : "No critical enforcement decisions have been logged yet.",
      "Owner: Security Operations",
    ],
    [
      "HIGH",
      mostRecentEscalation
        ? `${mostRecentEscalation.incident_title} is pending human approval and currently sits with ${mostRecentEscalation.assigned_to?.name ?? admin}.`
        : "No escalated incident is currently waiting for approval.",
      `Owner: ${admin}`,
    ],
    [
      "MEDIUM",
      `${mediumCount} medium-risk findings remain under observation across the current reporting window.`,
      "Owner: Autonomous Defense",
    ],
    [
      "SECURE",
      `${health?.service ?? "Backend"} is ${health?.status === "ok" ? "operational" : "degraded"} with ${(agentsDashboard?.summary.model_health ?? 0).toFixed(1)}% average agent readiness.`,
      "Owner: Platform Reliability",
    ],
  ];
}

function buildWeeklyFindings(auditEntries: AuditLogEntry[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const base = days.map((day) => ({ day, critical: 0, high: 0, medium: 0 }));

  for (const entry of auditEntries) {
    const date = new Date(entry.timestamp);
    const day = Number.isNaN(date.getTime()) ? 0 : date.getDay();
    const risk = Number(entry.risk_score || 0);
    const decision = String(entry.decision).toUpperCase();

    if (decision === "BLOCK" || risk >= 0.8) base[day].critical += 1;
    else if (decision === "ESCALATE" || risk >= 0.6) base[day].high += 1;
    else if (risk >= 0.35) base[day].medium += 1;
  }

  return base;
}

function buildComplianceData(incidentSummary: IncidentSummary | null, health: HealthResponse | null) {
  const summary = incidentSummary ?? {
    total: 0,
    approved: 0,
    blocked: 0,
    pending: 0,
    assigned: 0,
    active: 0,
    approval_rate: 0,
    block_rate: 0,
  };
  const verified = Math.max(0, Math.min(100, summary.approved + summary.blocked));
  const inReview = Math.max(0, Math.min(100 - verified, summary.pending + summary.assigned));
  const backendPenalty = health?.status === "ok" ? 0 : 10;
  const missing = Math.max(0, 100 - verified - inReview - backendPenalty);

  return [
    { name: "Verified", value: verified, color: "#22C55E" },
    { name: "In Review", value: inReview, color: "#F59E0B" },
    { name: "Missing", value: missing, color: "#EF4444" },
  ];
}

function buildReportExportPack({
  auditEntries,
  incidentSummary,
  incidentActions,
  agentsDashboard,
  companyUsers,
  health,
  reportCards,
  weeklyFindings,
  complianceData,
  findings,
  stats,
}: {
  auditEntries: AuditLogEntry[];
  incidentSummary: IncidentSummary | null;
  incidentActions: IncidentActionResult[];
  agentsDashboard: AgentsDashboardResponse | null;
  companyUsers: CompanyUser[];
  health: HealthResponse | null;
  reportCards: ReportCardData[];
  weeklyFindings: Array<{ day: string; critical: number; high: number; medium: number }>;
  complianceData: Array<{ name: string; value: number; color: string }>;
  findings: Array<[string, string, string]>;
  stats: Array<{ label: string; value: string; sub: string; color: string }>;
}) {
  return {
    generated_at: new Date().toISOString(),
    generated_by: "BlackBooks Reports Center",
    pack_version: "v1.0",
    summary: {
      service: health?.service ?? "unknown",
      backend_status: health?.status ?? "unknown",
      database_backend: health?.database_backend ?? "unknown",
      total_audit_events: auditEntries.length,
      incident_summary: incidentSummary,
      active_agents: agentsDashboard?.summary.active_agents ?? 0,
      total_agents: agentsDashboard?.summary.total_agents ?? 0,
    },
    executive_findings: findings.map(([level, text, owner]) => ({
      level,
      text,
      owner,
    })),
    report_cards: reportCards,
    stat_cards: stats,
    weekly_findings: weeklyFindings,
    compliance_coverage: complianceData.map(({ color, ...rest }) => rest),
    agents: agentsDashboard?.agents ?? [],
    company_directory: companyUsers,
    incidents: {
      total: incidentActions.length,
      pending: incidentActions.filter((action) =>
        action.status === "ASSIGNED" || action.status === "PENDING_APPROVAL").length,
      closed: incidentActions.filter((action) =>
        action.status === "APPROVED" || action.status === "BLOCKED").length,
      records: incidentActions,
    },
    audit_log: auditEntries,
  };
}
