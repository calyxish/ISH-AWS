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

export type OptionId = "A" | "B" | "C" | "D" | "E";

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface Question {
  id: string;
  domain: Domain;
  type: "single" | "multi";
  selectCount?: number;
  prompt: string;
  options: QuestionOption[];
  correct: OptionId[];
  explanation: string;
  reference?: string;
}

export type OrderMode = "random" | "first" | "last" | "middle";
export type DisplayMode = "one-by-one" | "all-at-once";

export interface Settings {
  count: number;
  timeMinutes: number;
  order: OrderMode;
  display: DisplayMode;
  domains: Domain[];
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
