"use client";

import { motion } from "framer-motion";
import { Building2, CalendarClock, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  approveIncident,
  type CompanyUser,
  type IncidentActionResult,
  getCompanyUsers,
  getIncidentActions,
  rejectIncident,
} from "../../lib/backend";

const levelOrder = ["ADMIN", "DIRECTOR", "MANAGER", "EMPLOYEE"];

export default function CompanyDirectory() {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [actions, setActions] = useState<IncidentActionResult[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [decisionState, setDecisionState] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [companyUsers, incidentActions] = await Promise.all([getCompanyUsers(), getIncidentActions()]);
        if (cancelled) return;
        setUsers(companyUsers);
        setActions(incidentActions);
        setSelectedUserId((current) => current || companyUsers.find((user) => user.level === "EMPLOYEE")?.id || companyUsers[0]?.id || "");
      } catch {
        if (cancelled) return;
        setUsers([]);
        setActions([]);
      }
    }

    loadData();
    const intervalId = window.setInterval(loadData, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const groupedUsers = useMemo(() => {
    return levelOrder.map((level) => ({
      level,
      users: users.filter((user) => user.level === level),
    }));
  }, [users]);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];
  const approvalChain = selectedUser ? buildApprovalChain(selectedUser, users) : [];

  return (
    <div className="text-[var(--text-primary)]">
      <Header />

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="ACTIVE IDENTITIES" value={String(users.length)} sub="Corporate accounts loaded" color="#9B5CF6" />
        <StatCard icon={Building2} label="MANAGEMENT LEVELS" value="4" sub="Admin, directors, managers, employees" color="#06B6D4" />
        <StatCard icon={ShieldCheck} label="DECISION CASES" value={String(actions.length)} sub="Investigations and escalations recorded" color="#F97316" />
        <StatCard icon={UserCheck} label="APPROVAL CHAIN" value={String(approvalChain.length)} sub={selectedUser ? `For ${selectedUser.name}` : "Select an employee"} color="#22C55E" />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 2xl:grid-cols-[62fr_38fr]">
        <OrgMatrix groupedUsers={groupedUsers} allUsers={users} />
        <ApprovalLab
          users={users}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          selectedUser={selectedUser}
          approvalChain={approvalChain}
        />
      </section>

      <section className="mt-6">
        <DecisionQueue actions={actions} decisionState={decisionState} onAction={handleDecision} />
      </section>
    </div>
  );

  async function handleDecision(action: IncidentActionResult, decision: "approve" | "reject") {
    const approver = action.assigned_to?.username;
    const result =
      decision === "approve"
        ? await approveIncident(action.id, { approver_username: approver })
        : await rejectIncident(action.id, { approver_username: approver });

    setActions((current) => current.map((entry) => (entry.id === result.id ? result : entry)));
    setDecisionState((current) => ({
      ...current,
      [action.id]:
        decision === "approve"
          ? result.status === "APPROVED"
            ? `Approved by ${result.resolved_by?.name ?? "approver"}.`
            : `Approved by ${approver ?? "approver"} and routed to ${result.assigned_to?.name ?? "next approver"}.`
          : `Blocked by ${result.resolved_by?.name ?? approver ?? "approver"}.`,
    }));
  }
}

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
    >
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--glow-blue-light)]">
          CORPORATE GOVERNANCE
        </p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight text-white">
          Company Directory
        </h1>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Review real identities, command chain, and approval paths before triggering incidents.
        </p>
      </div>
      <div className="rounded-xl border border-[rgba(123,47,255,0.16)] bg-white/[0.03] px-4 py-3 font-mono text-[11px] text-[var(--text-secondary)]">
        Use <span className="text-white">Threat Monitor</span> to trigger a case, then return here to confirm who was assigned or escalated.
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
  icon: typeof Users;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <article className="bb-card relative min-h-[148px] overflow-hidden p-5">
      <div aria-hidden className="absolute right-[-18px] top-[-24px] size-24 rounded-full blur-[24px]" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }} />
      <Icon aria-hidden className="size-5" style={{ color }} />
      <p className="mt-5 font-body text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-heading text-3xl font-extrabold leading-none" style={{ color }}>{value}</p>
      <p className="mt-3 font-mono text-[11px] text-[var(--text-muted)]">{sub}</p>
    </article>
  );
}

function OrgMatrix({
  groupedUsers,
  allUsers,
}: {
  groupedUsers: { level: string; users: CompanyUser[] }[];
  allUsers: CompanyUser[];
}) {
  return (
    <article className="bb-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-body text-base font-semibold text-white">Org Structure</h2>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
            Decisions escalate from employee → manager → director → admin.
          </p>
        </div>
        <div className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 font-mono text-[10px] text-[var(--text-muted)]">
          {allUsers.length} identities
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {groupedUsers.map((group) => (
          <div key={group.level}>
            <div className="mb-2 flex items-center justify-between px-0.5">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {prettyLevel(group.level)}
              </h3>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">{group.users.length}</span>
            </div>
            <div className="space-y-1.5">
              {group.users.map((user) => {
                const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-2.5 rounded-lg border border-[rgba(123,47,255,0.10)] bg-[rgba(123,47,255,0.04)] px-2.5 py-2 transition hover:border-[rgba(123,47,255,0.24)] hover:bg-[rgba(123,47,255,0.08)]"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[rgba(123,47,255,0.18)] font-mono text-[10px] font-bold text-[var(--glow-violet-light)]">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-[12px] font-semibold leading-tight text-white">{user.name}</p>
                      <p className="truncate font-mono text-[9px] text-[var(--text-muted)]">{user.department}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function ApprovalLab({
  users,
  selectedUserId,
  setSelectedUserId,
  selectedUser,
  approvalChain,
}: {
  users: CompanyUser[];
  selectedUserId: string;
  setSelectedUserId: (value: string) => void;
  selectedUser?: CompanyUser;
  approvalChain: CompanyUser[];
}) {
  return (
    <article className="bb-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-body text-base font-semibold text-white">Approval Chain Preview</h2>
          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
            Select an employee to preview who would investigate or escalate an incident.
          </p>
        </div>
        <span className="rounded-full border border-[rgba(123,47,255,0.22)] bg-[rgba(123,47,255,0.08)] px-3 py-1 font-mono text-[10px] text-[var(--text-secondary)]">
          decision lab
        </span>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">Employee Account</span>
        <select
          value={selectedUserId}
          onChange={(event) => setSelectedUserId(event.target.value)}
          className="h-11 w-full rounded-lg border border-[rgba(123,47,255,0.2)] bg-[var(--bg-card)] px-3 font-body text-sm text-white outline-none transition focus:border-[var(--glow-purple)] focus:shadow-[0_0_14px_rgba(123,47,255,0.24)]"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} · {user.department} · {prettyLevel(user.level)}
            </option>
          ))}
        </select>
      </label>

      {selectedUser ? (
        <div className="mt-5 rounded-xl border border-[rgba(123,47,255,0.12)] bg-white/[0.02] p-4">
          <p className="font-body text-lg font-semibold text-white">{selectedUser.name}</p>
          <p className="mt-1 font-body text-sm text-[var(--text-secondary)]">{selectedUser.title}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{selectedUser.department}</Pill>
            <Pill>@{selectedUser.username}</Pill>
            <Pill>{prettyLevel(selectedUser.level)}</Pill>
            <Pill>{selectedUser.email}</Pill>
          </div>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        <div className="rounded-lg border border-[rgba(6,182,212,0.16)] bg-[rgba(6,182,212,0.06)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--glow-cyan)]">Investigate</p>
          <p className="mt-2 font-body text-xs leading-5 text-[var(--text-secondary)]">
            The case is assigned to security operator <span className="text-white">Alejandro Reyes</span> for initial triage.
          </p>
        </div>

        <div className="rounded-lg border border-[rgba(249,115,22,0.16)] bg-[rgba(249,115,22,0.06)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--alert-orange)]">Escalate</p>
          <div className="mt-3 space-y-2">
            {approvalChain.length ? (
              approvalChain.map((user, index) => (
                <div key={user.id} className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-[rgba(123,47,255,0.12)] font-mono text-[10px] text-[var(--glow-violet-light)]">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate font-mono text-[10px] text-[var(--text-muted)]">
                      {user.title} · {user.department}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-body text-xs text-[var(--text-muted)]">Select an identity to see the approval chain.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function DecisionQueue({
  actions,
  decisionState,
  onAction,
}: {
  actions: IncidentActionResult[];
  decisionState: Record<string, string>;
  onAction: (action: IncidentActionResult, decision: "approve" | "reject") => Promise<void>;
}) {
  return (
    <article className="bb-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-body text-base font-semibold text-white">Recent Decision Queue</h2>
          <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
            Cases already assigned or escalated by the backend.
          </p>
        </div>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 font-mono text-[10px] text-[var(--text-muted)]">
          {actions.length} records
        </span>
      </div>

      {(() => {
        const pendingActions = actions
          .slice()
          .reverse()
          .filter((action) => action.status === "ASSIGNED" || action.status === "PENDING_APPROVAL");
        const resolvedActions = actions
          .slice()
          .reverse()
          .filter((action) => action.status === "APPROVED" || action.status === "BLOCKED");

        return (
          <div className="mt-5 space-y-5">
            <section>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-body text-sm font-semibold text-white">Pending Review</h3>
                  <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
                    Cases that still require acceptance, approval, or blocking.
                  </p>
                </div>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 font-mono text-[10px] text-[var(--text-muted)]">
                  {pendingActions.length} open
                </span>
              </div>

              <div className="bb-scrollbar mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {pendingActions.length ? (
                  pendingActions.map((action) => (
                    <div key={action.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                {(() => {
                  const canDecide = action.status === "PENDING_APPROVAL" || action.status === "ASSIGNED";
                  const isResolved = action.status === "APPROVED" || action.status === "BLOCKED";
                  return (
                    <>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]",
                      action.action_type === "ESCALATE"
                        ? "bg-[rgba(249,115,22,0.15)] text-[var(--alert-orange)]"
                        : "bg-[rgba(6,182,212,0.15)] text-[var(--glow-cyan)]",
                    ].join(" ")}
                  >
                    {action.action_type}
                  </span>
                  <span className="rounded px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)] bg-[rgba(123,47,255,0.1)]">
                    {action.status}
                  </span>
                  <time className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">
                    {formatTime(action.created_at)}
                  </time>
                </div>

                <h3 className="mt-3 font-body text-sm font-semibold text-white">{action.incident_title}</h3>
                <p className="mt-2 font-body text-xs leading-5 text-[var(--text-secondary)]">{action.notes}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>Affected: {action.affected_user}</Pill>
                  <Pill>Department: {action.department}</Pill>
                  <Pill>Requested by: {action.requested_by}</Pill>
                  {action.assigned_to ? <Pill>Assigned: {action.assigned_to.name}</Pill> : null}
                </div>
                {canDecide ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onAction(action, "approve")}
                      className="rounded-md border border-emerald-400/40 px-3 py-1.5 font-body text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
                    >
                      {action.action_type === "INVESTIGATE" ? "Accept" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction(action, "reject")}
                      className="rounded-md border border-[var(--alert-red)] px-3 py-1.5 font-body text-xs font-semibold text-[var(--alert-red)] transition hover:bg-[rgba(239,68,68,0.1)]"
                    >
                      Block
                    </button>
                  </div>
                ) : null}
                {isResolved ? (
                  <div className="mt-4">
                    <span
                      className={[
                        "rounded-md px-3 py-1.5 font-mono text-[10px]",
                        action.status === "APPROVED"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-[rgba(239,68,68,0.12)] text-[var(--alert-red)]",
                      ].join(" ")}
                    >
                      {action.status}
                    </span>
                  </div>
                ) : null}
                {decisionState[action.id] ? (
                  <div className="mt-3 rounded border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-[10px] text-[var(--text-secondary)]">
                    {decisionState[action.id]}
                  </div>
                ) : null}
                    </>
                  );
                })()}
              </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-8 text-center">
                    <p className="font-body text-sm text-white">No pending decisions.</p>
                    <p className="mt-2 font-mono text-[11px] text-[var(--text-muted)]">
                      Run `Investigate` or `Escalate` from Threat Monitor to generate new cases.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-body text-sm font-semibold text-white">Decision Timeline</h3>
                  <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
                    Closed cases with resolution date and owner.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 font-mono text-[10px] text-[var(--text-muted)]">
                  <CalendarClock className="size-3.5" />
                  {resolvedActions.length} closed
                </span>
              </div>

              <div className="bb-scrollbar mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                {resolvedActions.length ? (
                  resolvedActions.map((action) => (
                    <div
                      key={action.id}
                      className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.02] p-4"
                    >
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[rgba(34,197,94,0.8)] via-[rgba(123,47,255,0.6)] to-transparent" />
                      <div className="pl-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]",
                              action.action_type === "ESCALATE"
                                ? "bg-[rgba(249,115,22,0.15)] text-[var(--alert-orange)]"
                                : "bg-[rgba(6,182,212,0.15)] text-[var(--glow-cyan)]",
                            ].join(" ")}
                          >
                            {action.action_type}
                          </span>
                          <span
                            className={[
                              "rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em]",
                              action.status === "APPROVED"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-[rgba(239,68,68,0.12)] text-[var(--alert-red)]",
                            ].join(" ")}
                          >
                            {action.status}
                          </span>
                          <time className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">
                            {formatTime(action.resolved_at ?? action.created_at)}
                          </time>
                        </div>

                        <h3 className="mt-3 font-body text-sm font-semibold text-white">{action.incident_title}</h3>
                        <p className="mt-2 font-body text-xs leading-5 text-[var(--text-secondary)]">{action.notes}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Pill>Affected: {action.affected_user}</Pill>
                          <Pill>Department: {action.department}</Pill>
                          <Pill>Requested by: {action.requested_by}</Pill>
                          {action.resolved_by ? <Pill>Closed by: {action.resolved_by.name}</Pill> : null}
                        </div>
                        {action.resolution_note ? (
                          <div className="mt-3 rounded border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-[10px] text-[var(--text-secondary)]">
                            {action.resolution_note}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-8 text-center">
                    <p className="font-body text-sm text-white">No closed decisions yet.</p>
                    <p className="mt-2 font-mono text-[11px] text-[var(--text-muted)]">
                      Approve or block a case to see it in the timeline.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        );
      })()}
    </article>
  );
}

function buildApprovalChain(user: CompanyUser, users: CompanyUser[]) {
  const byId = new Map(users.map((entry) => [entry.id, entry]));
  const chain: CompanyUser[] = [];
  let current = user.manager_id ? byId.get(user.manager_id) : undefined;

  while (current) {
    chain.push(current);
    current = current.manager_id ? byId.get(current.manager_id) : undefined;
  }

  if (!chain.length && user.level !== "ADMIN") {
    const admin = users.find((entry) => entry.level === "ADMIN");
    if (admin) chain.push(admin);
  }

  return chain;
}

function prettyLevel(level: string) {
  switch (level) {
    case "ADMIN":
      return "Admin";
    case "DIRECTOR":
      return "Director";
    case "MANAGER":
      return "Manager";
    default:
      return "Employee";
  }
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-[var(--text-muted)]">
      {children}
    </span>
  );
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString();
}
