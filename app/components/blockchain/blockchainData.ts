export type BlockchainNode = {
  id: number;
  label: string;
  coords: [number, number];
  color: string;
  type: "primary" | "relay" | "validator" | "archive" | "threat" | "monitor";
  txCount: number;
};

export type TransactionType = {
  icon: string;
  label: string;
  color: string;
};

export type LiveTransaction = {
  id: string;
  type: TransactionType;
  hash: string;
  status: "CONFIRMED" | "PENDING";
  from: string;
  to: string;
  amount: string;
  time: string;
};

export const transactionTypes: TransactionType[] = [
  { icon: "AL", label: "AUDIT LOG", color: "#7B2FFF" },
  { icon: "TE", label: "THREAT EVENT", color: "#EF4444" },
  { icon: "ID", label: "IDENTITY", color: "#9B5CF6" },
  { icon: "SC", label: "SMART CONTRACT", color: "#06B6D4" },
  { icon: "!!", label: "ALERT", color: "#F97316" },
];

export const initialTransactions: LiveTransaction[] = [
  {
    id: "tx-1",
    type: transactionTypes[0],
    hash: "0x3f2a...8b91",
    status: "CONFIRMED",
    from: "Agent-01",
    to: "IMMUTABLE-CHAIN",
    amount: "1 record",
    time: "2s ago",
  },
  {
    id: "tx-2",
    type: transactionTypes[1],
    hash: "0x7c1e...2d45",
    status: "CONFIRMED",
    from: "CORE-DB-01",
    to: "AUDIT-NODE",
    amount: "Case #BB-2891",
    time: "5s ago",
  },
  {
    id: "tx-3",
    type: transactionTypes[2],
    hash: "0xa4f8...9c23",
    status: "CONFIRMED",
    from: "HR-SYSTEM",
    to: "ID-LEDGER",
    amount: "3 records",
    time: "12s ago",
  },
  {
    id: "tx-4",
    type: transactionTypes[3],
    hash: "0x2b9d...4e71",
    status: "PENDING",
    from: "COMPLIANCE",
    to: "GOV-NODE",
    amount: "Policy #447",
    time: "18s ago",
  },
  {
    id: "tx-5",
    type: transactionTypes[4],
    hash: "0x9e3c...1a88",
    status: "CONFIRMED",
    from: "Agent-06",
    to: "INCIDENT-CHAIN",
    amount: "CRITICAL · BB-2847",
    time: "31s ago",
  },
  {
    id: "tx-6",
    type: transactionTypes[0],
    hash: "0x4d7b...c922",
    status: "CONFIRMED",
    from: "NODE-02",
    to: "ARCHIVE-VAULT",
    amount: "9 records",
    time: "43s ago",
  },
  {
    id: "tx-7",
    type: transactionTypes[1],
    hash: "0x88f0...5ad1",
    status: "CONFIRMED",
    from: "Threat-AI",
    to: "AUDIT-NODE",
    amount: "IOC package",
    time: "54s ago",
  },
  {
    id: "tx-8",
    type: transactionTypes[2],
    hash: "0xbb11...e043",
    status: "CONFIRMED",
    from: "SSO-GATEWAY",
    to: "ID-LEDGER",
    amount: "14 claims",
    time: "1m ago",
  },
  {
    id: "tx-9",
    type: transactionTypes[3],
    hash: "0xde40...aa91",
    status: "CONFIRMED",
    from: "LegalOps",
    to: "GOV-NODE",
    amount: "Retention rule",
    time: "2m ago",
  },
  {
    id: "tx-10",
    type: transactionTypes[4],
    hash: "0xf129...7bd0",
    status: "CONFIRMED",
    from: "NODE-07",
    to: "INCIDENT-CHAIN",
    amount: "SYNC DELAY",
    time: "3m ago",
  },
];

export const blockchainNodes: BlockchainNode[] = [
  { id: 1, label: "NODE-01 · Lima", coords: [-77.04, -12.04], color: "#7B2FFF", type: "primary", txCount: 847 },
  { id: 2, label: "NODE-02 · Miami", coords: [-80.19, 25.77], color: "#3B3F8C", type: "relay", txCount: 423 },
  { id: 3, label: "NODE-03 · London", coords: [-0.12, 51.5], color: "#4F46E5", type: "relay", txCount: 612 },
  { id: 4, label: "NODE-04 · Frankfurt", coords: [8.68, 50.11], color: "#06B6D4", type: "validator", txCount: 334 },
  { id: 5, label: "NODE-05 · Singapore", coords: [103.81, 1.35], color: "#06B6D4", type: "validator", txCount: 289 },
  { id: 6, label: "NODE-06 · Tokyo", coords: [139.69, 35.68], color: "#22C55E", type: "archive", txCount: 178 },
  { id: 7, label: "THREAT · Moscow", coords: [37.61, 55.75], color: "#EF4444", type: "threat", txCount: 0 },
  { id: 8, label: "THREAT · Beijing", coords: [116.4, 39.9], color: "#EF4444", type: "threat", txCount: 0 },
  { id: 9, label: "NODE-07 · São Paulo", coords: [-46.63, -23.55], color: "#9B5CF6", type: "relay", txCount: 201 },
  { id: 10, label: "NODE-08 · Lagos", coords: [3.37, 6.52], color: "#F97316", type: "monitor", txCount: 156 },
];

export function makeRandomTransaction(index: number): LiveTransaction {
  const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  return {
    id: `tx-live-${Date.now()}-${index}`,
    type,
    hash: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
    status: "CONFIRMED",
    from: ["Agent-01", "CORE-DB-01", "NODE-02", "Threat-AI", "HR-SYSTEM"][Math.floor(Math.random() * 5)],
    to: ["IMMUTABLE-CHAIN", "AUDIT-NODE", "ID-LEDGER", "GOV-NODE", "INCIDENT-CHAIN"][Math.floor(Math.random() * 5)],
    amount: ["1 record", "3 records", "Case #BB-2891", "Policy #447", "CRITICAL · BB-2847"][Math.floor(Math.random() * 5)],
    time: "just now",
  };
}
