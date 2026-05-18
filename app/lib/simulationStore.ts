const KEY = "bb_last_sim";

export type SimulationDetail = {
  user: string;
  role: string;
  department: string;
  action: string;
  resource: string;
  context: string;
  activitySystem: string;
  activityAction: string;
  productivityDecision: string;
  productivityScore: number;
  riskScore: number;
  flags: string[];
  reasoning: string;
  executiveSummary: string | null;
  requiresHumanApproval: boolean;
  aiRecommendation: string;
  finalDecision: string;
  decisionSource: string;
  policyRuleMatched: string | null;
  policyVersion: string | null;
  matchKey: string;
};

export function saveSimulation(detail: SimulationDetail) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(KEY, JSON.stringify(detail));
  }
}

export function getSimulation(): SimulationDetail | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SimulationDetail;
  } catch {
    return null;
  }
}

export function clearSimulation() {
  if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
}
