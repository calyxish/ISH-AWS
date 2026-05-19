export type Domain =
  | "cloud-concepts"
  | "security-compliance"
  | "cloud-technology"
  | "billing-pricing-support";

export const DOMAINS: Domain[] = [
  "cloud-concepts",
  "security-compliance",
  "cloud-technology",
  "billing-pricing-support",
];

export const DOMAIN_LABELS: Record<Domain, string> = {
  "cloud-concepts": "Cloud Concepts",
  "security-compliance": "Security & Compliance",
  "cloud-technology": "Cloud Technology & Services",
  "billing-pricing-support": "Billing, Pricing & Support",
};

export type Topic =
  | "cloud-fundamentals"
  | "global-infrastructure"
  | "well-architected"
  | "shared-responsibility"
  | "iam"
  | "security"
  | "governance-compliance"
  | "compute"
  | "serverless"
  | "containers"
  | "storage"
  | "database"
  | "networking"
  | "scaling-load-balancing"
  | "high-availability"
  | "migration"
  | "backup-dr"
  | "monitoring"
  | "deployment"
  | "ml-ai"
  | "pricing"
  | "cost-optimization"
  | "support-plans"
  | "troubleshooting";

export const TOPICS: Topic[] = [
  "cloud-fundamentals",
  "global-infrastructure",
  "well-architected",
  "shared-responsibility",
  "iam",
  "security",
  "governance-compliance",
  "compute",
  "serverless",
  "containers",
  "storage",
  "database",
  "networking",
  "scaling-load-balancing",
  "high-availability",
  "migration",
  "backup-dr",
  "monitoring",
  "deployment",
  "ml-ai",
  "pricing",
  "cost-optimization",
  "support-plans",
  "troubleshooting",
];

export const TOPIC_LABELS: Record<Topic, string> = {
  "cloud-fundamentals": "Cloud Computing Fundamentals",
  "global-infrastructure": "AWS Global Infrastructure",
  "well-architected": "AWS Well-Architected Framework",
  "shared-responsibility": "Shared Responsibility Model",
  "iam": "AWS IAM",
  "security": "AWS Security",
  "governance-compliance": "Governance & Compliance",
  "compute": "AWS Compute Services",
  "serverless": "Serverless Services",
  "containers": "Containers & Kubernetes",
  "storage": "AWS Storage Services",
  "database": "AWS Database Services",
  "networking": "AWS Networking",
  "scaling-load-balancing": "Auto Scaling & Load Balancing",
  "high-availability": "High Availability & Fault Tolerance",
  "migration": "Migration & Transfer Services",
  "backup-dr": "Backup & Disaster Recovery",
  "monitoring": "Monitoring & Analytics",
  "deployment": "Deployment & Management Tools",
  "ml-ai": "Machine Learning & AI Services",
  "pricing": "Pricing & Billing",
  "cost-optimization": "Cost Optimization",
  "support-plans": "AWS Support Plans",
  "troubleshooting": "Troubleshooting & Support Tools",
};

export const TOPIC_TO_DOMAIN: Record<Topic, Domain> = {
  "cloud-fundamentals": "cloud-concepts",
  "global-infrastructure": "cloud-concepts",
  "well-architected": "cloud-concepts",
  "shared-responsibility": "security-compliance",
  "iam": "security-compliance",
  "security": "security-compliance",
  "governance-compliance": "security-compliance",
  "compute": "cloud-technology",
  "serverless": "cloud-technology",
  "containers": "cloud-technology",
  "storage": "cloud-technology",
  "database": "cloud-technology",
  "networking": "cloud-technology",
  "scaling-load-balancing": "cloud-technology",
  "high-availability": "cloud-technology",
  "migration": "cloud-technology",
  "backup-dr": "cloud-technology",
  "monitoring": "cloud-technology",
  "deployment": "cloud-technology",
  "ml-ai": "cloud-technology",
  "pricing": "billing-pricing-support",
  "cost-optimization": "billing-pricing-support",
  "support-plans": "billing-pricing-support",
  "troubleshooting": "billing-pricing-support",
};

export type OptionId = "A" | "B" | "C" | "D" | "E";

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface Question {
  id: string;
  domain: Domain;
  topic?: Topic;
  type: "single" | "multi";
  selectCount?: number;
  prompt: string;
  options: QuestionOption[];
  correct: OptionId[];
  explanation: string;
  reference?: string;
}

export type OrderMode = "random" | "first" | "last" | "range";
export type DisplayMode = "one-by-one" | "all-at-once";

export interface Settings {
  count: number;
  timeMinutes: number;
  order: OrderMode;
  display: DisplayMode;
  domains: Domain[];
  /** Inclusive 1-based start index into the bank. Only used when order === "range". */
  rangeStart?: number;
  /** Inclusive 1-based end index into the bank. Only used when order === "range". */
  rangeEnd?: number;
}

export interface SessionState {
  startedAt: number;
  endsAt: number;
  questions: Question[];
  answers: Record<string, OptionId[]>;
  currentIndex: number;
  submitted: boolean;
  settings: Settings;
}

export interface DomainStat {
  correct: number;
  total: number;
}

export interface ResultSummary {
  total: number;
  correct: number;
  percent: number;
  scaled: number;
  passed: boolean;
  byDomain: Record<Domain, DomainStat>;
}

export const DEFAULT_SETTINGS: Settings = {
  count: 25,
  timeMinutes: 35,
  order: "random",
  display: "one-by-one",
  domains: [],
};
