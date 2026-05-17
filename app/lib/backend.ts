export type BackendAgent = {
  id: string;
  role: string;
  module: string;
  endpoint: string;
  status: string;
  task: string;
  color: string;
  accuracy: string;
  accuracy_value: number;
  test_label: string;
};

export type PolicyDecision = {
  model_recommendation: "ALLOW" | "ESCALATE" | "BLOCK";
  policy_rule_matched?: string | null;
  final_decision: "ALLOW" | "ESCALATE" | "BLOCK";
  final_decision_source: "model" | "policy" | "human";
  policy_version: string;
};

export type AgentsDashboardResponse = {
  generated_at: string;
  summary: {
    total_agents: number;
    active_agents: number;
    tests_available: number;
    processed_events: number;
    orchestration_runs: number;
    escalated_cases: number;
    model_health: number;
  };
  agents: BackendAgent[];
};

export type AgentTestResponse = {
  agent_id: string;
  agent_role: string;
  tested_at: string;
  message: string;
  result: unknown;
  dashboard: AgentsDashboardResponse;
};

export type AgentTestInput = {
  source?: string;
  user?: string;
  role?: string;
  department?: string;
  action?: string;
  resource?: string;
  context?: string;
  timestamp?: string;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  audit_type?: string;
  user: string;
  role: string;
  department: string;
  action: string;
  resource: string;
  risk_score: number;
  decision: string;
  reasoning: string;
  flags: string[];
  analyst_decision?: string;
  requires_human_approval?: boolean;
  model_recommendation?: string;
  final_decision_source?: "model" | "policy" | "human";
  policy_rule_matched?: string | null;
  policy_version?: string | null;
  policy_decision?: PolicyDecision | null;
};

export type CompanyUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  title: string;
  department: string;
  level: string;
  manager_id?: string | null;
};

export type IncidentActionInput = {
  incident_title: string;
  incident_type: string;
  affected_user: string;
  department: string;
  resource: string;
  severity?: string;
  requested_by?: string;
};

export type IncidentActionResult = {
  id: string;
  action_type: string;
  status: string;
  incident_title: string;
  incident_type: string;
  affected_user: string;
  department: string;
  requested_by: string;
  assigned_to?: CompanyUser | null;
  escalation_chain: CompanyUser[];
  current_step: number;
  approvals_completed: CompanyUser[];
  resolved_by?: CompanyUser | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
  notes: string;
  created_at: string;
};

export type IncidentSummary = {
  total: number;
  approved: number;
  blocked: number;
  pending: number;
  assigned: number;
  active: number;
  approval_rate: number;
  block_rate: number;
};

export type IncidentDecisionInput = {
  approver_username?: string;
  comment?: string;
};

export type HealthResponse = {
  status: string;
  service: string;
  database_backend: string;
  database_target: string;
};

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new Error(`No se pudo conectar al backend en ${BACKEND_URL}. Verifica que FastAPI esté corriendo.`);
  }

  if (!response.ok) {
    let detail = `Backend error ${response.status} at ${path}`;

    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        detail = payload.detail;
      }
    } catch {}

    if (response.status === 404) {
      detail = `El backend respondió 404 para ${path} en ${BACKEND_URL}. Asegúrate de levantar la versión que ya incluye /agents.`;
    }

    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export function getAgentsDashboard() {
  return requestJson<AgentsDashboardResponse>("/agents");
}

export function getHealth() {
  return requestJson<HealthResponse>("/health");
}

export function runAgentTest(agentId: string, body?: AgentTestInput) {
  return requestJson<AgentTestResponse>(`/agents/${agentId}/test`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export function getAuditLog() {
  return requestJson<AuditLogEntry[]>("/audit");
}

export function getCompanyUsers() {
  return requestJson<CompanyUser[]>("/company/users");
}

export function getIncidentActions() {
  return requestJson<IncidentActionResult[]>("/company/incidents/actions");
}

export function getIncidentSummary() {
  return requestJson<IncidentSummary>("/company/incidents/summary");
}

export function investigateIncident(body: IncidentActionInput) {
  return requestJson<IncidentActionResult>("/company/incidents/investigate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function escalateIncident(body: IncidentActionInput) {
  return requestJson<IncidentActionResult>("/company/incidents/escalate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function approveIncident(caseId: string, body?: IncidentDecisionInput) {
  return requestJson<IncidentActionResult>(`/company/incidents/${caseId}/approve`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export function rejectIncident(caseId: string, body?: IncidentDecisionInput) {
  return requestJson<IncidentActionResult>(`/company/incidents/${caseId}/reject`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

// ── Blockchain / Transactions ────────────────────────────────────────────────

export type BlockchainTransaction = {
  tx_hash: string;
  type: "ENFORCEMENT" | "OVERRIDE";
  actor: string;
  event_id: string;
  decision: "BLOCK" | "ALLOW" | "ESCALATE";
  reason: string;
  resource: string;
  timestamp: string;
  confirmed: boolean;
};

export type OverrideInput = {
  actor: string;
  role: string;
  reason: string;
  new_decision: "ALLOW" | "ESCALATE";
};

export type OverrideResponse = {
  original: Record<string, unknown>;
  override: Record<string, unknown>;
};

export type BackendStats = {
  total: number;
  blocked: number;
  escalated: number;
  allowed: number;
  avg_risk: number;
};

export function getTransactions() {
  return requestJson<BlockchainTransaction[]>("/transactions");
}

export function overrideDecision(eventId: string, body: OverrideInput) {
  return requestJson<OverrideResponse>(`/decisions/${eventId}/override`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getStats() {
  return requestJson<BackendStats>("/stats");
}
