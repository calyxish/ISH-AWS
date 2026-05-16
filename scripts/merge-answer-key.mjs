#!/usr/bin/env node
/**
 * Merge data/answer-key.json (per-question correct/domain/topic/explanation
 * tuples) with the parsed draft questions from /tmp/questions.draft.json and
 * append them to data/questions.json.
 *
 * Usage:
 *   node scripts/merge-answer-key.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

const DRAFT_PATH = "/tmp/questions.draft.json";
const KEY_PATH = "data/answer-key.json";
const BANK_PATH = "data/questions.json";

const draft = JSON.parse(readFileSync(DRAFT_PATH, "utf8")).questions;
const key = JSON.parse(readFileSync(KEY_PATH, "utf8"));
const bank = JSON.parse(readFileSync(BANK_PATH, "utf8"));

const keyMap = new Map(key.map((entry) => [entry[0], entry]));

const existingIds = new Set(bank.questions.map((q) => q.id));
const added = [];
const skipped = [];

for (const q of draft) {
  if (existingIds.has(q.id)) {
    skipped.push(q.id);
    continue;
  }
  const k = keyMap.get(q.id);
  if (!k) {
    skipped.push(q.id + " (no answer key)");
    continue;
  }
  const [, correct, domain, topic, explanation] = k;
  const merged = {
    id: q.id,
    domain,
    topic,
    type: q.type,
    ...(q.selectCount !== undefined ? { selectCount: q.selectCount } : {}),
    prompt: q.prompt,
    options: q.options,
    correct,
    explanation,
  };
  added.push(merged);
}

const final = {
  version: bank.version,
  questions: [...bank.questions, ...added],
};
writeFileSync(BANK_PATH, JSON.stringify(final, null, 2) + "\n");
console.log(`added ${added.length} questions; skipped ${skipped.length}`);
console.log(`bank now has ${final.questions.length} questions`);
