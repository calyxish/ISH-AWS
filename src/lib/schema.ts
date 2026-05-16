import { z } from "zod";
import type { Question } from "@/lib/types";

const optionIdSchema = z.enum(["A", "B", "C", "D", "E"]);

const domainSchema = z.enum([
  "cloud-concepts",
  "security-compliance",
  "cloud-technology",
  "billing-pricing-support",
]);

const topicSchema = z.enum([
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
]);

const optionSchema = z.object({
  id: optionIdSchema,
  text: z.string().min(1),
});

const questionSchema = z
  .object({
    id: z.string().min(1),
    domain: domainSchema,
    topic: topicSchema.optional(),
    type: z.enum(["single", "multi"]),
    selectCount: z.number().int().min(2).max(5).optional(),
    prompt: z.string().min(1),
    options: z.array(optionSchema).min(2).max(5),
    correct: z.array(optionIdSchema).min(1).max(5),
    explanation: z.string().min(1),
    reference: z.string().url().optional(),
  })
  .superRefine((q, ctx) => {
    const optionIds = new Set(q.options.map((o) => o.id));
    for (const c of q.correct) {
      if (!optionIds.has(c)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `correct[${c}] not present in options for ${q.id}`,
        });
      }
    }
    if (q.type === "single" && q.correct.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `single-type question ${q.id} must have exactly one correct answer`,
      });
    }
    if (q.type === "multi") {
      if (q.correct.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `multi-type question ${q.id} must have at least 2 correct answers`,
        });
      }
      if (q.selectCount !== undefined && q.selectCount !== q.correct.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `selectCount on ${q.id} must equal correct.length`,
        });
      }
    }
  });

export const questionBankSchema = z.object({
  version: z.literal(1),
  questions: z.array(questionSchema).min(1),
});

export type QuestionBank = z.infer<typeof questionBankSchema>;

export function parseBank(raw: unknown): { questions: Question[] } {
  const result = questionBankSchema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = first.path.join(".");
    throw new Error(
      `questions.json is invalid at ${path}: ${first.message}. Fix the JSON file or restore from git.`,
    );
  }
  const ids = new Set<string>();
  for (const q of result.data.questions) {
    if (ids.has(q.id)) {
      throw new Error(`Duplicate question id "${q.id}" in questions.json`);
    }
    ids.add(q.id);
  }
  return { questions: result.data.questions as Question[] };
}
